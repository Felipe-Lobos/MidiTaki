import type { Style } from './schema';

export const PRESETS: { name: string; style: Partial<Style> }[] = [
  { name: 'Océano', style: {} },
  { name: 'Neón hueco', style: {
      background: '#000000', colorMode: 'pitch', noteColor: '#2de2ff', noteColor2: '#b388ff',
      pressedColor: '#2de2ff', hitLineColor: '#2de2ff', glowColor: '#2de2ff', noteFill: 'outline', outlineWidth: 3,
      noteRadius: 8, noteGap: 6, velocityOpacity: false, glowStrength: 1.6, relief: 0.5 } },
  { name: 'Neón', style: {
      background: '#0b0714', colorMode: 'pitch', noteColor: '#ff2d95', noteColor2: '#2de2ff',
      pressedColor: '#ffffff', hitLineColor: '#ff2d95', glowColor: '#ff2d95', noteRadius: 12, glowStrength: 1.4 } },
  { name: 'Atardecer', style: {
      background: '#1a0f1f', colorMode: 'pitch', noteColor: '#ffb703', noteColor2: '#e63946',
      pressedColor: '#ffd166', hitLineColor: '#ffb703', glowColor: '#ffb703', noteRadius: 6 } },
  { name: 'Clásico', style: {
      background: '#000000', noteColor: '#3fb950', pressedColor: '#3fb950', noteRadius: 2, noteGap: 1,
      velocityOpacity: false, showHitLine: false, glow: false, relief: 0 } },
];
