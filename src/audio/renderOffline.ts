import type { Song } from '../core/midi/types';
import { createMasterBus, pianoSampler } from './pianoSampler';

export const AUDIO_RATE = 48000;
export const AUDIO_BITRATE = 192000;

/**
 * Vuelve a "tocar" el MIDI dentro de un OfflineAudioContext (más rápido que el tiempo real,
 * con precisión de muestra). Usa el MISMO piano y la MISMA cadena de salida que el preview.
 * El audio dura exactamente `frames / fps` segundos y la canción empieza en `leadIn`.
 */
export async function renderAudio(
  song: Song,
  o: { leadIn: number; frames: number; fps: number; volume: number },
): Promise<AudioBuffer> {
  const length = o.frames * (AUDIO_RATE / o.fps);
  const ctx = new OfflineAudioContext(2, length, AUDIO_RATE);
  const bus = createMasterBus(ctx, o.volume);
  const endT = length / AUDIO_RATE;

  bus.gain.setValueAtTime(bus.gain.value, Math.max(0, endT - 0.5)); // fundido final de 0,5 s
  bus.gain.linearRampToValueAtTime(0, endT);

  for (const n of song.notes) {
    const when = n.start + o.leadIn;
    if (when < endT) pianoSampler.playNote(ctx, bus, n, when);
  }
  return ctx.startRendering();
}

/** Trozo de un AudioBuffer (para intercalarlo con los frames de video). */
export function sliceBuffer(buf: AudioBuffer, from: number, to: number): AudioBuffer {
  const out = new AudioBuffer({ length: to - from, numberOfChannels: buf.numberOfChannels, sampleRate: buf.sampleRate });
  for (let c = 0; c < buf.numberOfChannels; c++) out.copyToChannel(buf.getChannelData(c).slice(from, to), c);
  return out;
}
