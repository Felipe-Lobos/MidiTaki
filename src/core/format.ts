export type VideoFormat = 'landscape' | 'portrait';
export type ExportResolution = 720 | 1080;

/** Tamaño LÓGICO de la escena: todos los valores del estilo (px) están en estas unidades. */
export const LOGICAL = {
  landscape: { w: 960, h: 540 },
  portrait: { w: 540, h: 960 },
} as const;

/** Tamaño real del video. `res` = lado corto (720 o 1080). 1080 → escala 2×, 720 → 4/3×. */
export function outputSize(format: VideoFormat, res: ExportResolution) {
  const { w, h } = LOGICAL[format];
  const scale = res / Math.min(w, h);
  return { width: Math.round(w * scale), height: Math.round(h * scale), scale };
}
