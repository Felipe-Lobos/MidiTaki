import type { Style } from './schema';

export type PresetId =
  | 'ocean' | 'neon' | 'neonHollow' | 'sunset' | 'fire' | 'aurora' | 'steel' | 'midnight' | 'paper' | 'classic';

// Cada preset parte de los valores por defecto (defaultStyle) y solo indica lo que cambia.
export const PRESETS: { id: PresetId; style: Partial<Style> }[] = [
  // Estilo por defecto
  { id: 'ocean', style: {} },
  { id: 'neon', style: {
      background: '#0b0714', colorMode: 'pitch', noteColor: '#ff2d95', noteColor2: '#2de2ff',
      pressedColor: '#ffffff', hitLineColor: '#ff2d95', glowColor: '#ff2d95', noteRadius: 12, glowStrength: 1.4,
      showOctaveLines: true, octaveLineOpacity: 0.12, hitLineStyle: 'neon', hitPulse: true, hitFlash: true } },
  { id: 'neonHollow', style: {
      background: '#000000', colorMode: 'pitch', noteColor: '#2de2ff', noteColor2: '#b388ff',
      pressedColor: '#2de2ff', hitLineColor: '#2de2ff', glowColor: '#2de2ff', noteFill: 'outline', outlineWidth: 3,
      noteRadius: 8, noteGap: 6, velocityOpacity: false, glowStrength: 1.6, relief: 0.5, hitLineStyle: 'electric', hitPulse: true,
      particles: true, particleType: 'electric', particleSize: 3, particleSpeed: 200 } },
  { id: 'sunset', style: {
      background: '#1a0f1f', colorMode: 'pitch', noteColor: '#ffb703', noteColor2: '#e63946',
      pressedColor: '#ffd166', hitLineColor: '#ffb703', glowColor: '#ffb703', noteRadius: 6,
      particles: true, particleType: 'embers', particleSpeed: 200, particleLife: 1.4, hitLineStyle: 'mist', hitFlash: true } },
  { id: 'fire', style: {
      background: '#120704', colorMode: 'pitch', noteColor: '#ff3d00', noteColor2: '#ffd23f',
      pressedColor: '#ffd23f', hitLineSync: false, hitLineColor: '#ff6a00', glowColor: '#ff6a00', noteRadius: 4, glowStrength: 1.3,
      relief: 0.5, fallSeconds: 2.5, hitLineStyle: 'fog', hitPulse: true, hitFlash: true, particles: true, particleType: 'sparks', particleSpread: 0.6 } },
  { id: 'aurora', style: {
      background: '#050b14', colorMode: 'pitch', noteColor: '#3ef0b0', noteColor2: '#8a5cff',
      pressedColor: '#ffffff', hitLineColor: '#3ef0b0', glowColor: '#3ef0b0', noteRadius: 14, noteGap: 3, relief: 0.4,
      fallSeconds: 3.5, showOctaveLines: true, octaveLineOpacity: 0.1, hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'trails', particleSpeed: 200, particleSpread: 0.6 } },
  { id: 'steel', style: {
      background: '#0b0d11', colorMode: 'pitch', noteColor: '#d7dee8', noteColor2: '#6f93c4',
      pressedColor: '#ffffff', hitLineSync: false, hitLineColor: '#9fb4cf', glowColor: '#9fb4cf', noteRadius: 3, glowStrength: 0.8,
      relief: 0.8, whiteKey: '#e9edf2', blackKey: '#1a1d23', hitLineStyle: 'static', hitPulse: true,
      particles: true, particleType: 'friction', particleSpeed: 200 } },
  { id: 'midnight', style: {
      background: '#05060f', noteColor: '#8ea2ff', pressedColor: '#8ea2ff', hitLineColor: '#8ea2ff',
      glowColor: '#8ea2ff', noteRadius: 10, showOctaveLines: true, hitLineStyle: 'neon', hitFlash: true,
      particles: true, particleType: 'stars' } },
  // Fondo claro: sin brillo ni partículas (se mezclan en aditivo y en fondo claro no se ven)
  { id: 'paper', style: {
      background: '#f3efe6', colorMode: 'pitch', noteColor: '#2b6cb0', noteColor2: '#c05621',
      pressedColor: '#2b6cb0', hitLineColor: '#2b6cb0', noteRadius: 6, velocityOpacity: false, glow: false,
      whiteKey: '#ffffff', blackKey: '#23232b', showOctaveLines: true, octaveLineOpacity: 0.12 } },
  { id: 'classic', style: {
      background: '#000000', noteColor: '#3fb950', pressedColor: '#3fb950', noteRadius: 2, noteGap: 1,
      velocityOpacity: false, showHitLine: false, glow: false, relief: 0 } },
];
