import type { Note } from '../core/midi/types';

export interface Voice { stop(when: number): void }

// Una muestra cada 3 semitonos: A0, C1, D#1, F#1, A1 ... C8  (30 archivos)
const NAMES: Record<number, string> = { 0: 'C', 3: 'Ds', 6: 'Fs', 9: 'A' };
const sampleName = (m: number) => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;

/** Salida común: volumen + compresor para que los acordes no saturen. */
export function createMasterBus(ctx: BaseAudioContext): AudioNode {
  const gain = ctx.createGain();
  gain.gain.value = 0.8;
  const comp = ctx.createDynamicsCompressor();
  gain.connect(comp);
  comp.connect(ctx.destination);
  return gain;
}

export class PianoSampler {
  private buffers = new Map<number, AudioBuffer>();
  private sampleMidis: number[] = [];
  private nearestCache = new Map<number, number>();

  /** Devuelve true si cargó al menos una muestra. Si no, se usa un sonido de prueba. */
  async load(ctx: BaseAudioContext): Promise<boolean> {
    const base = `${import.meta.env.BASE_URL}samples/piano/`;
    const jobs: Promise<void>[] = [];
    for (let m = 21; m <= 108; m += 3) {
      jobs.push((async () => {
        const res = await fetch(`${base}${sampleName(m)}.ogg`);
        if (!res.ok) throw new Error(`No se pudo cargar ${sampleName(m)}`);
        this.buffers.set(m, await ctx.decodeAudioData(await res.arrayBuffer()));
      })());
    }
    const results = await Promise.allSettled(jobs);
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (failed.length === jobs.length)
      console.warn('[piano] No se cargó ninguna muestra. ¿Existe public/samples/piano/*.ogg? (node scripts/copy-samples.mjs)', failed[0].reason);
    else if (failed.length > 0)
      console.warn(`[piano] ${failed.length}/${jobs.length} muestras fallaron`, failed[0].reason);
    this.sampleMidis = [...this.buffers.keys()].sort((a, b) => a - b);
    this.nearestCache.clear();
    if (this.buffers.size > 0 && this.buffers.size < 30)
      console.warn(`Solo se cargaron ${this.buffers.size}/30 muestras de piano.`);
    return this.buffers.size > 0;
  }

  private nearest(midi: number): number {
    let n = this.nearestCache.get(midi);
    if (n === undefined) {
      n = this.sampleMidis.reduce((best, s) => (Math.abs(s - midi) < Math.abs(best - midi) ? s : best));
      this.nearestCache.set(midi, n);
    }
    return n;
  }

  /** Programa UNA nota en el instante `when` (tiempo del AudioContext). Sirve en vivo y offline. */
  playNote(ctx: BaseAudioContext, dest: AudioNode, note: Note, when: number, onEnd?: () => void): Voice {
    const end = when + note.soundDuration;
    const level = 0.9 * Math.pow(note.velocity, 1.5); // velocity → volumen (curva no lineal)
    const gain = ctx.createGain();
    gain.connect(dest);

    let src: AudioScheduledSourceNode;
    if (this.buffers.size > 0) {
      const s = this.nearest(note.midi);
      const bs = ctx.createBufferSource();
      bs.buffer = this.buffers.get(s)!;
      bs.playbackRate.value = 2 ** ((note.midi - s) / 12); // afina la muestra más cercana
      src = bs;
      gain.gain.setValueAtTime(level, when);
    } else {
      // Sonido de prueba (sin muestras): triángulo con decaimiento
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 440 * 2 ** ((note.midi - 69) / 12);
      src = osc;
      gain.gain.setValueAtTime(level * 0.5, when);
      gain.gain.setTargetAtTime(level * 0.08, when, 0.6);
    }
    src.connect(gain);

    gain.gain.setTargetAtTime(0, end, 0.12); // release al terminar la nota (incluye pedal)
    src.start(when);
    src.stop(end + 1);
    src.onended = () => { gain.disconnect(); onEnd?.(); };

    return {
      stop(t: number) { // corte rápido sin "clic" (pausa / seek)
        gain.gain.cancelAndHoldAtTime(t);
        gain.gain.setTargetAtTime(0, t, 0.015);
        try { src.stop(t + 0.1); } catch { /* ya detenida */ }
      },
    };
  }
}
