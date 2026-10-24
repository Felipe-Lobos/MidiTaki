import { PianoSampler, createMasterBus, type Voice } from '../audio/pianoSampler';
import type { Song } from '../core/midi/types';
import { usePlaybackStore } from '../store/playbackStore';

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
  private bus: AudioNode | null = null;
  private sampler = new PianoSampler();
  private initPromise: Promise<void> | null = null;

  private song: Song | null = null;
  private playing = false;
  private anchorCtx = 0;   // instante del AudioContext donde empieza anchorSong
  private anchorSong = 0;  // segundo de la canción en ese instante
  private cursor = 0;      // siguiente nota por programar
  private timer: number | undefined;
  private raf = 0;
  private voices = new Set<Voice>();

  /** Llamar tras un gesto del usuario (p. ej. al elegir archivo). */
  init() { return (this.initPromise ??= this.doInit()); }

  private async doInit() {
    const ctx = new AudioContext({ latencyHint: 'interactive' });
    this.ctx = ctx;
    this.bus = createMasterBus(ctx);
    store().setAudioStatus('loading');
    const ok = await this.sampler.load(ctx);
    store().setAudioStatus(ok ? 'ready' : 'fallback');
  }

  setSong(song: Song) {
    this.pause();
    this.song = song;
    this.seek(0);
  }

  async play() {
    if (!this.song || this.playing) return;
    await this.init();
    const ctx = this.ctx!;
    await ctx.resume();
    if (this.playing) return;

    const dur = this.song.duration;
    const t0 = store().time >= dur - 0.01 ? 0 : store().time;
    this.playing = true;
    store().setPlaying(true);
    this.startAt(t0);
    store().setTime(t0);

    this.timer = window.setInterval(() => this.schedule(), TICK_MS);
    const loop = () => {
      const t = this.songTime();
      store().setTime(Math.min(t, dur));
      if (t >= dur + END_TAIL) { this.pause(); return; }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  pause() {
    if (!this.playing) return;
    const t = Math.min(this.songTime(), this.song?.duration ?? 0);
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
    const t2 = Math.min(Math.max(t, 0), this.song?.duration ?? 0);
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
    if (!this.playing) return;
    const ctx = this.ctx!, notes = this.song!.notes;
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
