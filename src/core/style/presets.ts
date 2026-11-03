import type { Style } from './schema';

export type PresetGroup = 'basic' | 'elements' | 'sky' | 'retro' | 'elegant' | 'seasons';

export type PresetId =
  // Básicos
  | 'ocean' | 'classic' | 'paper' | 'mono' | 'slate' | 'pastel'
  // Elementos
  | 'fire' | 'ice' | 'lightning' | 'deepwater' | 'forest' | 'lava'
  // Cielo y espacio
  | 'sunset' | 'aurora' | 'midnight' | 'galaxy' | 'nebula' | 'dawn'
  // Retro y tecnología
  | 'neon' | 'neonHollow' | 'synthwave' | 'terminal' | 'arcade' | 'blueprint' | 'vaporwave'
  // Elegantes
  | 'steel' | 'gold' | 'ruby' | 'emerald' | 'sepia'
  // Estaciones y festivos
  | 'autumn' | 'sakura' | 'halloween' | 'christmas';

/** Orden en que se muestran las secciones del panel. */
export const PRESET_GROUPS: PresetGroup[] = ['basic', 'elements', 'sky', 'retro', 'elegant', 'seasons'];

// Cada preset parte de los valores por defecto (defaultStyle) y solo indica lo que cambia.
// Dentro de cada sección se muestran en el orden de esta lista.
export const PRESETS: { id: PresetId; group: PresetGroup; style: Partial<Style> }[] = [
  // ───────────── Básicos: simples, casi sin efectos ─────────────
  // Estilo por defecto
  { id: 'ocean', group: 'basic', style: {} },
  { id: 'classic', group: 'basic', style: {
      background: '#000000', noteColor: '#3fb950', pressedColor: '#3fb950', noteRadius: 2, noteGap: 1,
      velocityOpacity: false, showHitLine: false, glow: false, relief: 0 } },
  // Fondo claro: sin brillo ni partículas (se mezclan en aditivo y en fondo claro no se ven)
  { id: 'paper', group: 'basic', style: {
      background: '#f3efe6', noteLabels: 'solfege', colorMode: 'pitch', noteColor: '#2b6cb0', noteColor2: '#c05621',
      pressedColor: '#2b6cb0', hitLineColor: '#2b6cb0', noteRadius: 6, velocityOpacity: false, glow: false,
      whiteKey: '#ffffff', blackKey: '#23232b', showOctaveLines: true, octaveLineOpacity: 0.12 } },
  { id: 'mono', group: 'basic', style: {
      background: '#0a0a0b', noteColor: '#e6e6e6', noteRadius: 3, glow: false, relief: 0.35,
      hitLineSync: false, hitLineColor: '#ffffff', whiteKey: '#e9e9e9', blackKey: '#111111' } },
  { id: 'slate', group: 'basic', style: {
      background: '#13161c', noteLabels: 'letters', colorMode: 'pitch', noteColor: '#7aa2f7', noteColor2: '#bb9af7', noteRadius: 6,
      glow: false, relief: 0.5, showOctaveLines: true, octaveLineOpacity: 0.14, whiteKey: '#e6e9f0', blackKey: '#171a21' } },
  { id: 'pastel', group: 'basic', style: {
      background: '#1c1b29', noteLabels: 'solfege', colorMode: 'pitch', noteColor: '#ffb3c7', noteColor2: '#a8d8ff', noteRadius: 14, noteGap: 3,
      velocityOpacity: false, glowStrength: 0.6, glowRadius: 8, relief: 0.3, fallSeconds: 3.5,
      whiteKey: '#f6f1f4', blackKey: '#2b2a3a' } },

  // ───────────── Elementos ─────────────
  { id: 'fire', group: 'elements', style: {
      background: '#120704', colorMode: 'pitch', noteColor: '#ff3d00', noteColor2: '#ffd23f',
      pressedColor: '#ffd23f', hitLineSync: false, hitLineColor: '#ff6a00', glowColor: '#ff6a00', noteRadius: 4, glowStrength: 1.3,
      relief: 0.5, fallSeconds: 2.5, hitLineStyle: 'fog', hitPulse: true, hitFlash: true, particles: true, particleType: 'sparks', particleSpread: 0.6 } },
  { id: 'ice', group: 'elements', style: {
      background: '#07121c', colorMode: 'pitch', noteColor: '#4aa3ff', noteColor2: '#e8f8ff', noteRadius: 5,
      glowStrength: 1, glowRadius: 12, relief: 0.9, fallSeconds: 3.2, whiteKey: '#eaf6ff', blackKey: '#0f2433',
      showOctaveLines: true, octaveLineOpacity: 0.1, hitLineStyle: 'mist', hitLineIntensity: 0.9, hitFlash: true,
      particles: true, particleType: 'stars', particleAmount: 28, particleSize: 3.5, particleSpeed: 160, particleLife: 1.3, particleSpread: 0.8 } },
  { id: 'lightning', group: 'elements', style: {
      background: '#06060f', colorMode: 'pitch', noteColor: '#6a5cff', noteColor2: '#e8f0ff', noteRadius: 3,
      glowStrength: 1.8, glowRadius: 14, relief: 0.5, fallSeconds: 2.4, whiteKey: '#f0f2ff', blackKey: '#0b0b18',
      hitLineStyle: 'electric', hitPulse: true, hitFlash: true, hitFlashSync: false, hitFlashColor: '#ffffff',
      particles: true, particleType: 'electric', particleAmount: 40, particleSize: 3, particleSpeed: 260, particleLife: 0.3, particleSpread: 0.8 } },
  { id: 'deepwater', group: 'elements', style: {
      background: '#020b17', colorMode: 'pitch', noteColor: '#0fb9b1', noteColor2: '#7de3ff', noteRadius: 16, noteGap: 3, noteOpacity: 0.9,
      glowStrength: 1, relief: 0.6, fallSeconds: 3.8, whiteKey: '#e6f7fb', blackKey: '#06202e',
      showOctaveLines: true, octaveLineOpacity: 0.1, hitLineStyle: 'mist',
      particles: true, particleType: 'bubbles', particleAmount: 24, particleSize: 4, particleSpeed: 200, particleLife: 2.2 } },
  { id: 'forest', group: 'elements', style: {
      background: '#06100a', colorMode: 'pitch', noteColor: '#3fae5a', noteColor2: '#d9f56a', noteRadius: 10, noteGap: 3,
      glowStrength: 0.9, relief: 0.5, fallSeconds: 3.6, whiteKey: '#eef3e6', blackKey: '#0f1a12',
      hitLineSync: false, hitLineColor: '#7bd88f', hitLineStyle: 'mist', hitLineIntensity: 0.8,
      particles: true, particleType: 'fireflies', particleAmount: 26, particleSize: 3.5, particleSpeed: 120, particleLife: 2.6, particleSpread: 0.7,
      particleSync: false, particleColor: '#e8ff7a' } },
  { id: 'lava', group: 'elements', style: {
      background: '#0d0302', colorMode: 'pitch', noteColor: '#c1121f', noteColor2: '#ff9f1c', noteRadius: 4,
      glowStrength: 1.5, glowRadius: 14, relief: 0.7, fallSeconds: 2.8, whiteKey: '#f0e6dc', blackKey: '#1a0a07',
      hitLineStyle: 'fog', hitLineIntensity: 1.2, hitPulse: true, hitFlash: true,
      particles: true, particleType: 'smoke', particleAmount: 24, particleSize: 7, particleSpeed: 200, particleLife: 2.6 } },

  // ───────────── Cielo y espacio ─────────────
  { id: 'sunset', group: 'sky', style: {
      background: '#1a0f1f', colorMode: 'pitch', noteColor: '#ffb703', noteColor2: '#e63946',
      pressedColor: '#ffd166', hitLineColor: '#ffb703', glowColor: '#ffb703', noteRadius: 6,
      particles: true, particleType: 'embers', particleSpeed: 200, particleLife: 1.4, hitLineStyle: 'mist', hitFlash: true } },
  { id: 'aurora', group: 'sky', style: {
      background: '#050b14', colorMode: 'pitch', noteColor: '#3ef0b0', noteColor2: '#8a5cff',
      pressedColor: '#ffffff', hitLineColor: '#3ef0b0', glowColor: '#3ef0b0', noteRadius: 14, noteGap: 3, relief: 0.4,
      fallSeconds: 3.5, showOctaveLines: true, octaveLineOpacity: 0.1, hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'trails', particleSpeed: 200, particleSpread: 0.6 } },
  { id: 'midnight', group: 'sky', style: {
      background: '#05060f', noteColor: '#8ea2ff', pressedColor: '#8ea2ff', hitLineColor: '#8ea2ff',
      glowColor: '#8ea2ff', noteRadius: 10, showOctaveLines: true, hitLineStyle: 'neon', hitFlash: true,
      particles: true, particleType: 'stars' } },
  { id: 'galaxy', group: 'sky', style: {
      background: '#04030d', colorMode: 'pitch', noteColor: '#6a5cff', noteColor2: '#ff7ad9', noteRadius: 12,
      glowStrength: 1.5, glowRadius: 14, relief: 0.4, fallSeconds: 4, whiteKey: '#ece9fb', blackKey: '#0e0b22',
      showOctaveLines: true, octaveLineOpacity: 0.08, hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'dust', particleAmount: 40, particleSize: 3, particleSpeed: 220, particleLife: 2.8, particleSpread: 1,
      particleSync: false, particleColor: '#ffffff' } },
  { id: 'nebula', group: 'sky', style: {
      background: '#0a0414', colorMode: 'pitch', noteColor: '#ff3cac', noteColor2: '#2b86c5', noteRadius: 18, noteGap: 3, noteOpacity: 0.85,
      glowStrength: 1.8, glowRadius: 18, relief: 0.3, fallSeconds: 4.2, whiteKey: '#efe9f5', blackKey: '#150a24',
      hitLineStyle: 'fog', hitLineIntensity: 1.3, hitFlash: true,
      particles: true, particleType: 'smoke', particleAmount: 28, particleSize: 8, particleSpeed: 180, particleLife: 3, particleSpread: 0.8 } },
  { id: 'dawn', group: 'sky', style: {
      background: '#1b1230', colorMode: 'pitch', noteColor: '#ff8fab', noteColor2: '#ffe29a', noteRadius: 12,
      glowStrength: 1, relief: 0.4, fallSeconds: 4.2, whiteKey: '#fff4ee', blackKey: '#241838',
      hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'dust', particleAmount: 30, particleSize: 3.5, particleSpeed: 150, particleLife: 2.4, particleSpread: 0.8 } },

  // ───────────── Retro y tecnología ─────────────
  { id: 'neon', group: 'retro', style: {
      background: '#0b0714', colorMode: 'pitch', noteColor: '#ff2d95', noteColor2: '#2de2ff',
      pressedColor: '#ffffff', hitLineColor: '#ff2d95', glowColor: '#ff2d95', noteRadius: 12, glowStrength: 1.4,
      showOctaveLines: true, octaveLineOpacity: 0.12, hitLineStyle: 'neon', hitPulse: true, hitFlash: true } },
  { id: 'neonHollow', group: 'retro', style: {
      background: '#000000', colorMode: 'pitch', noteColor: '#2de2ff', noteColor2: '#b388ff',
      pressedColor: '#2de2ff', hitLineColor: '#2de2ff', glowColor: '#2de2ff', noteFill: 'outline', outlineWidth: 3,
      noteRadius: 8, noteGap: 6, velocityOpacity: false, glowStrength: 1.6, relief: 0.5, hitLineStyle: 'electric', hitPulse: true,
      particles: true, particleType: 'electric', particleSize: 3, particleSpeed: 200 } },
  { id: 'synthwave', group: 'retro', style: {
      background: '#10002b', colorMode: 'pitch', noteColor: '#ff2e97', noteColor2: '#ffd319', noteRadius: 2, velocityOpacity: false,
      glowStrength: 1.6, glowRadius: 12, relief: 0.3, fallSeconds: 2.8, whiteKey: '#f4e9ff', blackKey: '#1a0036',
      showOctaveLines: true, octaveLineOpacity: 0.2,
      hitLineSync: false, hitLineColor: '#00e5ff', hitLineStyle: 'neon', hitPulse: true } },
  { id: 'terminal', group: 'retro', style: {
      background: '#020a04', noteColor: '#33ff66', noteRadius: 0, noteGap: 1, velocityOpacity: false,
      glowStrength: 0.8, glowRadius: 8, relief: 0, keyPress: 2, fallSeconds: 2.6, whiteKey: '#b9f5c8', blackKey: '#04120a',
      hitLineStyle: 'static',
      particles: true, particleType: 'pixels', particleAmount: 20, particleSize: 4, particleSpeed: 200, particleLife: 0.8, particleSpread: 0.6,
      particleGlow: false } },
  { id: 'arcade', group: 'retro', style: {
      background: '#0a0a1f', colorMode: 'pitch', noteColor: '#ff4d4d', noteColor2: '#4dd2ff', noteRadius: 0, velocityOpacity: false,
      glow: false, relief: 0, keyPress: 3, fallSeconds: 2.4, whiteKey: '#ffffff', blackKey: '#1a1a33',
      hitLineSync: false, hitLineColor: '#ffffff', hitFlash: true,
      particles: true, particleType: 'pixels', particleAmount: 36, particleSize: 4, particleSpeed: 260, particleSpread: 0.9, particleGlow: false } },
  { id: 'blueprint', group: 'retro', style: {
      background: '#0d2b4e', noteColor: '#cfe8ff', noteFill: 'outline', outlineWidth: 2, noteRadius: 2, noteGap: 3,
      velocityOpacity: false, glow: false, relief: 0, fallSeconds: 3.5, whiteKey: '#d9e8f7', blackKey: '#10335c',
      showOctaveLines: true, octaveLineOpacity: 0.22, hitLineStyle: 'static' } },
  { id: 'vaporwave', group: 'retro', style: {
      background: '#1a0b2e', colorMode: 'pitch', noteColor: '#b967ff', noteColor2: '#01cdfe', noteRadius: 12,
      glowStrength: 1.2, relief: 0.5, fallSeconds: 3.6, whiteKey: '#fff0fb', blackKey: '#240b3b',
      hitLineSync: false, hitLineColor: '#ff71ce', hitLineStyle: 'mist',
      particles: true, particleType: 'bubbles', particleAmount: 18, particleSize: 4, particleSpeed: 180, particleLife: 2.4 } },

  // ───────────── Elegantes ─────────────
  { id: 'steel', group: 'elegant', style: {
      background: '#0b0d11', colorMode: 'pitch', noteColor: '#d7dee8', noteColor2: '#6f93c4',
      pressedColor: '#ffffff', hitLineSync: false, hitLineColor: '#9fb4cf', glowColor: '#9fb4cf', noteRadius: 3, glowStrength: 0.8,
      relief: 0.8, whiteKey: '#e9edf2', blackKey: '#1a1d23', hitLineStyle: 'static', hitPulse: true,
      particles: true, particleType: 'friction', particleSpeed: 200 } },
  { id: 'gold', group: 'elegant', style: {
      background: '#0b0a08', colorMode: 'pitch', noteColor: '#b8860b', noteColor2: '#ffe08a', noteRadius: 6,
      glowStrength: 1, relief: 0.9, fallSeconds: 3.8, whiteKey: '#f7f1e3', blackKey: '#14110c',
      hitLineSync: false, hitLineColor: '#ffd36b', hitPulse: true,
      particles: true, particleType: 'dust', particleAmount: 28, particleSize: 3, particleSpeed: 160, particleLife: 2.4, particleSpread: 0.9 } },
  { id: 'ruby', group: 'elegant', style: {
      background: '#0d0204', colorMode: 'pitch', noteColor: '#9b0f2f', noteColor2: '#ff5f7e', noteRadius: 8,
      glowStrength: 1.3, relief: 0.9, fallSeconds: 3.4, whiteKey: '#f8eef0', blackKey: '#190509',
      hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'stars', particleAmount: 22, particleSize: 3, particleSpeed: 150, particleLife: 1.2, particleSpread: 0.7 } },
  { id: 'emerald', group: 'elegant', style: {
      background: '#020d08', colorMode: 'pitch', noteColor: '#0b7a4b', noteColor2: '#5fffb0', noteRadius: 8,
      glowStrength: 1.2, relief: 0.9, fallSeconds: 3.4, whiteKey: '#eef8f1', blackKey: '#04160e',
      hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'dust', particleAmount: 26, particleSize: 3, particleSpeed: 150, particleLife: 2.2, particleSpread: 0.8 } },
  { id: 'sepia', group: 'elegant', style: {
      background: '#1b130c', colorMode: 'pitch', noteColor: '#8a5a2b', noteColor2: '#e7c79a', noteRadius: 4,
      glow: false, relief: 0.8, fallSeconds: 4, whiteKey: '#f1e6d2', blackKey: '#2a1c10',
      showOctaveLines: true, octaveLineOpacity: 0.12, hitLineSync: false, hitLineColor: '#e7c79a',
      particles: true, particleType: 'dust', particleAmount: 20, particleSize: 2.5, particleSpeed: 120, particleLife: 2.8, particleSpread: 1,
      particleGlow: false } },

  // ───────────── Estaciones y festivos ─────────────
  { id: 'autumn', group: 'seasons', style: {
      background: '#140a05', colorMode: 'pitch', noteColor: '#c2410c', noteColor2: '#facc15', noteRadius: 8,
      glowStrength: 0.8, relief: 0.6, fallSeconds: 3.6, whiteKey: '#f6ecdc', blackKey: '#1f0f07',
      hitLineSync: false, hitLineColor: '#f59e0b', hitLineStyle: 'mist',
      particles: true, particleType: 'petals', particleAmount: 22, particleSize: 4, particleSpeed: 160, particleLife: 2.4, particleSpread: 0.9 } },
  { id: 'sakura', group: 'seasons', style: {
      background: '#120a14', colorMode: 'pitch', noteColor: '#ff9ebb', noteColor2: '#ffe3ee', noteRadius: 14, noteGap: 3,
      glowStrength: 0.9, relief: 0.4, fallSeconds: 4, whiteKey: '#fff6f9', blackKey: '#2a1424',
      hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'petals', particleAmount: 30, particleSize: 4, particleSpeed: 180, particleLife: 2.6, particleSpread: 0.8 } },
  { id: 'halloween', group: 'seasons', style: {
      background: '#0a0510', colorMode: 'pitch', noteColor: '#ff7a00', noteColor2: '#7a2cff', noteRadius: 6,
      glowStrength: 1.5, glowRadius: 14, fallSeconds: 3, whiteKey: '#f3e8d0', blackKey: '#120818',
      hitLineStyle: 'fog', hitLineIntensity: 1.3, hitFlash: true,
      particles: true, particleType: 'smoke', particleAmount: 24, particleSize: 7, particleSpeed: 160, particleLife: 2.8,
      particleSync: false, particleColor: '#8a3ffc' } },
  { id: 'christmas', group: 'seasons', style: {
      background: '#08130d', colorMode: 'pitch', noteColor: '#d62839', noteColor2: '#f4d35e', noteRadius: 8,
      glowStrength: 1, relief: 0.7, fallSeconds: 3.4, whiteKey: '#fbf7f0', blackKey: '#0c1f14',
      hitLineStyle: 'mist',
      particles: true, particleType: 'stars', particleAmount: 34, particleSize: 3, particleSpeed: 120, particleLife: 2, particleSpread: 1,
      particleSync: false, particleColor: '#ffffff' } },
];
