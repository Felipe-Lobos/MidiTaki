import type { Song } from '../midi/types';

/** Entrada del video = segundos visibles de caída (redondeado a 0,5 s). */
export const leadInFor = (fallSeconds: number) => Math.round(fallSeconds * 2) / 2;

/** Rango de tiempo navegable en la vista previa. Con "entrada y cola" activas incluye tiempo negativo. */
export function previewBounds(song: Song, withLeadTail: boolean, fallSeconds: number, tail: number) {
  return withLeadTail
    ? { min: -leadInFor(fallSeconds), max: song.duration + tail }
    : { min: 0, max: song.duration };
}
