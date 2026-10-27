import { defaultStyle, type Style } from './schema';
import { t } from '../../i18n';

const HEX = /^#[0-9a-f]{6}$/i;
const ENUMS: Partial<Record<keyof Style, string[]>> = {
  colorMode: ['solid', 'pitch'], noteFill: ['solid', 'outline'],
};
const LIMITS: Partial<Record<keyof Style, [number, number]>> = {
  noteRadius: [0, 24], noteGap: [0, 8], noteOpacity: [0.2, 1],
  keyboardRatio: [0.08, 0.3], fallSeconds: [1, 8], keyPress: [0, 12],
  outlineWidth: [1, 8], relief: [0, 1], glowStrength: [0, 3], glowRadius: [2, 24],
};

/** Convierte CUALQUIER cosa en un Style válido (campos que falten o sean inválidos → por defecto). */
export function sanitizeStyle(raw: unknown): Style {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = { ...defaultStyle };
  for (const key of Object.keys(defaultStyle) as (keyof Style)[]) {
    const def = defaultStyle[key];
    const v = src[key];
    if (ENUMS[key]) { if (ENUMS[key]!.includes(v as string)) out[key] = v; }
    else if (typeof def === 'string') { if (typeof v === 'string' && HEX.test(v)) out[key] = v; }
    else if (typeof def === 'number') {
      if (typeof v === 'number' && isFinite(v)) {
        const [lo, hi] = LIMITS[key] ?? [-Infinity, Infinity];
        out[key] = Math.min(hi, Math.max(lo, v));
      }
    } else if (typeof def === 'boolean') { if (typeof v === 'boolean') out[key] = v; }
  }
  out.version = 1;
  return out as unknown as Style;
}

export function exportPreset(style: Style) {
  const blob = new Blob([JSON.stringify({ app: 'midi-fall', style }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'preset.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importPreset(file: File): Promise<Style> {
  let json: unknown;
  try { json = JSON.parse(await file.text()); }
  catch { throw new Error(t.presets.invalidJson); }
  const obj = json as { style?: unknown };
  return sanitizeStyle(obj && typeof obj === 'object' && 'style' in obj ? obj.style : json);
}
