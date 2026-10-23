import type { Song } from '../midi/types';

const BLACK = new Set([1, 3, 6, 8, 10]);
export const isBlack = (midi: number) => BLACK.has(midi % 12);

export interface KeyRange { low: number; high: number }
export interface KeyRect { midi: number; x: number; w: number; black: boolean }

export const KEYBOARDS: Record<string, KeyRange> = {
  '88': { low: 21, high: 108 },
  '76': { low: 28, high: 103 },
  '61': { low: 36, high: 96 },
  '49': { low: 36, high: 84 },
};

/** Rango que cubre justo las notas de la canción (empieza y termina en tecla blanca). */
export function autoRange(song: Song): KeyRange {
  let low = song.lowest, high = song.highest;
  while (isBlack(low)) low--;
  while (isBlack(high)) high++;
  return { low, high };
}

/** Calcula x y ancho de cada tecla para un ancho total dado. */
export function buildKeyboardLayout(range: KeyRange, width: number): KeyRect[] {
  let whites = 0;
  for (let m = range.low; m <= range.high; m++) if (!isBlack(m)) whites++;

  const ww = width / whites;   // ancho tecla blanca
  const bw = ww * 0.6;         // ancho tecla negra
  const keys: KeyRect[] = [];
  let whitesBefore = 0;

  for (let m = range.low; m <= range.high; m++) {
    if (isBlack(m)) {
      keys.push({ midi: m, x: whitesBefore * ww - bw / 2, w: bw, black: true });
    } else {
      keys.push({ midi: m, x: whitesBefore * ww, w: ww, black: false });
      whitesBefore++;
    }
  }
  return keys;
}
