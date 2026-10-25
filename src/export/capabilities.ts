import { getFirstEncodableVideoCodec, type VideoCodec } from 'mediabunny';

export interface ExportSupport {
  container: 'mp4' | 'webm' | null; // null = este navegador no puede codificar video
  codec: VideoCodec | null;
  fileSystem: boolean;              // ¿puede guardar directo a disco?
}

export const hasFileSystemSave = () =>
  typeof (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker === 'function';

/** ¿Qué puede codificar ESTE navegador a este tamaño? MP4 (H.264) si se puede; si no, WebM. */
export async function detectSupport(width: number, height: number, bitrate: number): Promise<ExportSupport> {
  const fileSystem = hasFileSystemSave();
  const opts = { width, height, bitrate };
  const avc = await getFirstEncodableVideoCodec(['avc'], opts);
  if (avc) return { container: 'mp4', codec: avc, fileSystem };
  const web = await getFirstEncodableVideoCodec(['vp9', 'vp8', 'av1'], opts);
  if (web) return { container: 'webm', codec: web, fileSystem };
  return { container: null, codec: null, fileSystem };
}
