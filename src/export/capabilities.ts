import {
  getFirstEncodableAudioCodec, getFirstEncodableVideoCodec,
  type AudioCodec, type VideoCodec,
} from 'mediabunny';
import { AUDIO_BITRATE, AUDIO_RATE } from '../audio/renderOffline.ts';

export interface ExportSupport {
  container: 'mp4' | 'webm' | null; // null = este navegador no puede codificar video
  codec: VideoCodec | null;
  audioCodec: AudioCodec | null;    // null = no se puede codificar audio
  fileSystem: boolean;              // ¿puede guardar directo a disco?
}

export const hasFileSystemSave = () =>
  typeof (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker === 'function';

/** ¿Qué puede codificar ESTE navegador a este tamaño? MP4 (H.264 + AAC) si se puede; si no, alternativas. */
export async function detectSupport(width: number, height: number, bitrate: number): Promise<ExportSupport> {
  const fileSystem = hasFileSystemSave();
  const audioOpts = { numberOfChannels: 2, sampleRate: AUDIO_RATE, bitrate: AUDIO_BITRATE };

  const avc = await getFirstEncodableVideoCodec(['avc'], { width, height, bitrate });
  if (avc) {
    const audioCodec = await getFirstEncodableAudioCodec(['aac', 'opus'], audioOpts); // AAC primero; Opus como plan B
    return { container: 'mp4', codec: avc, audioCodec, fileSystem };
  }
  const web = await getFirstEncodableVideoCodec(['vp9', 'vp8', 'av1'], { width, height, bitrate });
  if (web) {
    const audioCodec = await getFirstEncodableAudioCodec(['opus'], audioOpts);
    return { container: 'webm', codec: web, audioCodec, fileSystem };
  }
  return { container: null, codec: null, audioCodec: null, fileSystem };
}
