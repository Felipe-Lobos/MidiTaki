import { MASTER_BASE, createMasterBus, pianoSampler, type Voice } from '../audio/pianoSampler';
import type { Song } from '../core/midi/types';
import { usePlaybackStore } from '../store/playbackStore';
import { useSongStore } from '../store/songStore';
import { useSettingsStore } from '../store/settingsStore';
import { useStyleStore } from '../store/styleStore';
import { useExportStore } from '../store/exportStore';
import { previewBounds } from '../core/timeline/bounds.ts';

const LOOKAHEAD = 1.2;   // s: cuánto adelanto programamos notas
const TICK_MS = 50;      // cada cuánto revisamos si hay que programar más
const START_DELAY = 0.08;// s: margen para que el primer sonido no llegue tarde
const END_TAIL = 1.5;    // s: dejamos sonar la cola final

const store = () => usePlaybackStore.getState();

/**
 * Reloj maestro = AudioContext.currentTime.
 * songTime = anchorSong + (ctx.currentTime - latencia - anchorCtx)
 */
class Transport {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private sampler = pianoSampler;
  private initPromise: Promise<void> | null = null;

  private playing = false;
  private anchorCtx = 0;   // instante del AudioContext donde empieza anchorSong
  private anchorSong = 0;  // segundo de la canción en ese instante
  private cursor = 0;      // siguiente nota por programar
  private timer: number | undefined;
  private raf = 0;
  private voices = new Set<Voice>();

  constructor() {
    // Al activar/desactivar "entrada y cola" en la vista previa, reajusta la posición
    useSettingsStore.subscribe((s, prev) => {
      if (s.previewLeadTail !== prev.previewLeadTail && this.song) this.seek(store().time);
    });
  }

  /** Límites de tiempo navegables (incluyen entrada/cola si el usuario lo activó). */
  private get bounds() {
    const song = this.song;
    if (!song) return { min: 0, max: 0 };
    return previewBounds(song, useSettingsStore.getState().previewLeadTail,
      useStyleStore.getState().style.fallSeconds, useExportStore.getState().tail);
  }

  /** La canción se lee SIEMPRE del store: no hay copia que desincronizar. */
  private get song(): Song | null {
    return useSongStore.getState().song;
  }

  /** Llamar tras un gesto del usuario (p. ej. al elegir archivo). */
  init(): Promise<void> {
    return (this.initPromise ??= this.doInit().catch((e) => {
      console.error('[Transport] init falló:', e);
      this.initPromise = null;
      this.ctx = null;
      store().setAudioStatus('error');
      throw e;
    }));
  }

  private async doInit() {
    const ctx = new AudioContext({ latencyHint: 'interactive' });
    this.ctx = ctx;
    this.bus = createMasterBus(ctx, useSettingsStore.getState().volume);
    useSettingsStore.subscribe((s) => {
      if (this.bus) this.bus.gain.setTargetAtTime(MASTER_BASE * s.volume, ctx.currentTime, 0.02);
    });
    store().setAudioStatus('loading');
    const ok = await this.sampler.load(ctx);
    store().setAudioStatus(ok ? 'ready' : 'fallback');
  }

  /** Se llama al cargar una canción nueva: detiene y vuelve al inicio. */
  reset() {
    this.pause();
    this.seek(this.bounds.min);
  }

  async play() {
    const song = this.song;
    if (!song || this.playing) return;
    try {
      await this.init();
      const ctx = this.ctx!;
      if (ctx.state !== 'running') {
        await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 2000))]);
      }
      if (ctx.state !== 'running') {
        throw new Error(`AudioContext en estado "${ctx.state}": el navegador bloqueó el audio.`);
      }
      if (this.playing) return;

      const { min, max } = this.bounds;
      const t0 = store().time >= max - 0.01 ? min : store().time;
      this.playing = true;
      store().setPlaying(true);
      this.startAt(t0);
      store().setTime(t0);

      this.timer = window.setInterval(() => this.schedule(), TICK_MS);
      const loop = () => {
        const t = this.songTime();
        store().setTime(Math.min(t, max));
        if (t >= max + END_TAIL) { this.pause(); return; }
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    } catch (e) {
      console.error('[Transport] play falló:', e);
      this.playing = false;
      window.clearInterval(this.timer);
      cancelAnimationFrame(this.raf);
      store().setPlaying(false);
      store().setAudioStatus('error');
    }
  }

  pause() {
    if (!this.playing) return;
    const t = Math.min(this.songTime(), this.bounds.max);
    this.playing = false;
    window.clearInterval(this.timer);
    cancelAnimationFrame(this.raf);
    this.stopVoices();
    this.anchorSong = t;
    store().setTime(t);
    store().setPlaying(false);
  }

  toggle() { return this.playing ? this.pause() : this.play(); }

  seek(t: number) {
    const { min, max } = this.bounds;
    const t2 = Math.min(Math.max(t, min), max);
    store().setTime(t2);
    if (this.playing) this.startAt(t2);
    else this.anchorSong = t2;
  }

  // ---------- internos ----------

  private startAt(t: number) {
    const song = this.song!;
    this.stopVoices();
    this.anchorSong = t;
    this.anchorCtx = this.ctx!.currentTime + START_DELAY;

    let lo = 0, hi = song.notes.length; // primera nota con start >= t
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (song.notes[mid].start < t - 1e-6) lo = mid + 1; else hi = mid;
    }
    this.cursor = lo;
    this.schedule();
  }

  /** Programa las notas que caen dentro de la ventana de adelanto. */
  private schedule() {
    if (!this.playing || !this.song) return;
    const ctx = this.ctx!, notes = this.song.notes;
    const songHorizon = this.anchorSong + (ctx.currentTime + LOOKAHEAD - this.anchorCtx);
    while (this.cursor < notes.length && notes[this.cursor].start <= songHorizon) {
      const n = notes[this.cursor++];
      const when = this.anchorCtx + (n.start - this.anchorSong);
      const voice: Voice = this.sampler.playNote(ctx, this.bus!, n, when, () => this.voices.delete(voice));
      this.voices.add(voice);
    }
  }

  /** Lo que se OYE ahora (restando la latencia de salida del audio). */
  private songTime() {
    const ctx = this.ctx!;
    const latency = ctx.outputLatency || ctx.baseLatency || 0;
    return Math.max(this.anchorSong, this.anchorSong + (ctx.currentTime - latency - this.anchorCtx));
  }

  private stopVoices() {
    if (!this.ctx) return;
    for (const v of this.voices) v.stop(this.ctx.currentTime);
    this.voices.clear();
  }
}

export const transport = new Transport();
