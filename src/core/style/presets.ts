import type { Style } from './schema';

export type PresetGroup = 'basic' | 'learn' | 'elements' | 'sky' | 'retro' | 'elegant' | 'seasons';

export type PresetId =
  // Básicos
  | 'ocean' | 'paper' | 'slate' | 'pastel'
  // Aprender (con nombres de notas)
  | 'tutorial' | 'tutorialAbc' | 'tutorialHollow'
  // Elementos
  | 'fire' | 'ice' | 'lightning' | 'deepwater' | 'forest' | 'lava' | 'campfire' | 'toxic' | 'forge'
  // Cielo y espacio
  | 'sunset' | 'aurora' | 'midnight' | 'galaxy' | 'nebula' | 'dawn' | 'comet'
  // Retro y tecnología
  | 'neon' | 'neonHollow' | 'synthwave' | 'terminal' | 'arcade' | 'blueprint' | 'vaporwave' | 'gameboy' | 'cyberpunk'
  // Elegantes
  | 'steel' | 'gold' | 'ruby' | 'emerald' | 'sepia' | 'jazz' | 'glass'
  // Estaciones y festivos
  | 'autumn' | 'sakura' | 'halloween' | 'christmas' | 'spring' | 'summer' | 'winter' | 'newyear' | 'valentine';

/** Orden en que se muestran las secciones del panel. */
export const PRESET_GROUPS: PresetGroup[] = ['basic', 'learn', 'elements', 'sky', 'retro', 'elegant', 'seasons'];

// Cada preset parte de los valores por defecto (defaultStyle) y solo indica lo que cambia.
// Dentro de cada sección se muestran en el orden de esta lista.
export const PRESETS: { id: PresetId; group: PresetGroup; style: Partial<Style> }[] = [
  // ───────────── Básicos: simples, casi sin efectos ─────────────
  // Estilo por defecto
  { id: 'ocean', group: 'basic', style: {} },
  // Fondo claro: sin brillo ni partículas (se mezclan en aditivo y en fondo claro no se ven)
  { id: 'paper', group: 'basic', style: {
      background: '#f3efe6', noteLabels: 'solfege', colorMode: 'pitch', noteColor: '#2b6cb0', noteColor2: '#c05621',
      pressedColor: '#2b6cb0', hitLineColor: '#2b6cb0', noteRadius: 6, velocityOpacity: false, glow: false,
      whiteKey: '#ffffff', blackKey: '#23232b', showOctaveLines: true, octaveLineOpacity: 0.12 } },
  { id: 'slate', group: 'basic', style: {
      background: '#13161c', noteLabels: 'letters', colorMode: 'pitch', noteColor: '#7aa2f7', noteColor2: '#bb9af7', noteRadius: 6,
      glow: false, relief: 0.5, showOctaveLines: true, octaveLineOpacity: 0.14, whiteKey: '#e6e9f0', blackKey: '#171a21' } },
  { id: 'pastel', group: 'basic', style: {
      background: '#1c1b29', noteLabels: 'solfege', colorMode: 'pitch', noteColor: '#ffb3c7', noteColor2: '#a8d8ff', noteRadius: 14, noteGap: 3,
      velocityOpacity: false, glowStrength: 0.6, glowRadius: 8, relief: 0.3, fallSeconds: 3.5,
      whiteKey: '#f6f1f4', blackKey: '#2b2a3a' } },

  // ───────────── Aprender: con el nombre de cada nota ─────────────
  // Caída lenta, líneas de octava y colores que separan graves y agudos
  { id: 'tutorial', group: 'learn', style: {
      background: '#101522', noteLabels: 'solfege', colorMode: 'pitch', noteColor: '#4cc9f0', noteColor2: '#ffd166',
      noteRadius: 8, noteGap: 3, velocityOpacity: false, glow: false, relief: 0.3, fallSeconds: 5,
      showOctaveLines: true, octaveLineOpacity: 0.18, hitFlash: true } },
  { id: 'tutorialAbc', group: 'learn', style: {
      background: '#14161d', noteLabels: 'letters', noteColor: '#ffb86b', pressedColor: '#ffb86b', hitLineColor: '#ffb86b',
      noteRadius: 10, noteGap: 3, velocityOpacity: false, glow: false, relief: 0.4, fallSeconds: 5,
      showOctaveLines: true, octaveLineOpacity: 0.16, hitLineStyle: 'neon' } },
  // Notas huecas: el nombre toma el color del contorno
  { id: 'tutorialHollow', group: 'learn', style: {
      background: '#0b0d14', noteLabels: 'letters', colorMode: 'pitch', noteColor: '#5eead4', noteColor2: '#f9a8d4',
      pressedColor: '#ffffff', noteFill: 'outline', outlineWidth: 2, noteRadius: 8, noteGap: 3, velocityOpacity: false,
      glowStrength: 0.7, glowRadius: 8, relief: 0, fallSeconds: 4.5,
      showOctaveLines: true, octaveLineOpacity: 0.14, hitLineStyle: 'neon', hitFlash: true } },

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
  { id: 'campfire', group: 'elements', style: {
      background: '#0e0805', colorMode: 'pitch', noteColor: '#e25822', noteColor2: '#ffc371', noteRadius: 8,
      pressedColor: '#ffc371', glowStrength: 1.2, relief: 0.6, fallSeconds: 3.4, whiteKey: '#f3e6d3', blackKey: '#1b0e07',
      hitLineSync: false, hitLineColor: '#ff9a3c', hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'embers', particleAmount: 40, particleSize: 3.5, particleSpeed: 150, particleLife: 2.2, particleSpread: 0.8 } },
  { id: 'toxic', group: 'elements', style: {
      background: '#06100a', colorMode: 'pitch', noteColor: '#b6ff00', noteColor2: '#00ffa3', noteRadius: 14, noteGap: 3,
      glowStrength: 1.6, glowRadius: 14, relief: 0.4, fallSeconds: 3.2, whiteKey: '#eaf7d9', blackKey: '#0c1a0a',
      hitLineStyle: 'fog', hitLineIntensity: 1.2, hitPulse: true,
      particles: true, particleType: 'bubbles', particleAmount: 30, particleSize: 5, particleSpeed: 140, particleLife: 2.4, particleSpread: 0.9 } },
  // Fricción: chispas de metal cortas y rápidas, como en una herrería
  { id: 'forge', group: 'elements', style: {
      background: '#0a0706', colorMode: 'pitch', noteColor: '#b23a12', noteColor2: '#ffe3a3', noteRadius: 2,
      glowStrength: 1, glowRadius: 10, relief: 0.9, fallSeconds: 2.8, whiteKey: '#e8e0d8', blackKey: '#17110d',
      hitLineSync: false, hitLineColor: '#ffb347', hitLineStyle: 'static', hitPulse: true, hitFlash: true,
      particles: true, particleType: 'friction', particleAmount: 46, particleSize: 3, particleSpeed: 340, particleLife: 0.9, particleSpread: 0.75 } },

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
  // Estelas ondulantes: cada nota deja una cola que serpentea
  { id: 'comet', group: 'sky', style: {
      background: '#050914', colorMode: 'pitch', noteColor: '#4d9bff', noteColor2: '#f4fbff', noteRadius: 10,
      pressedColor: '#ffffff', glowStrength: 1.3, glowRadius: 12, relief: 0.4, fallSeconds: 3.4, whiteKey: '#eef4fb', blackKey: '#0a1020',
      hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'trails', particleAmount: 60, particleSize: 3.5, particleSpeed: 300, particleLife: 1.6, particleSpread: 1 } },

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
      background: '#020a04', noteColor: '#33ff66', noteFill: 'outline', noteRadius: 0, noteGap: 1, velocityOpacity: false,
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
  // Cuatro tonos de verde, sin brillo ni relieve
  { id: 'gameboy', group: 'retro', style: {
      background: '#0f380f', noteColor: '#9bbc0f', pressedColor: '#9bbc0f', noteRadius: 0, noteGap: 1, velocityOpacity: false,
      glow: false, relief: 0, keyPress: 2, fallSeconds: 2.8, whiteKey: '#9bbc0f', blackKey: '#306230',
      hitLineSync: false, hitLineColor: '#8bac0f', hitLineStyle: 'static', showOctaveLines: true, octaveLineAuto: false, octaveLineColor: '#306230', octaveLineOpacity: 0.5,
      particles: true, particleType: 'pixels', particleAmount: 24, particleSize: 4, particleSpeed: 200, particleLife: 0.7, particleSpread: 0.7,
      particleSync: false, particleColor: '#9bbc0f', particleGlow: false } },
  { id: 'cyberpunk', group: 'retro', style: {
      background: '#0a0612', colorMode: 'pitch', noteColor: '#ff2a6d', noteColor2: '#fcee0a', noteRadius: 1,
      pressedColor: '#05d9e8', glowStrength: 1.7, glowRadius: 12, relief: 0.4, fallSeconds: 2.6, whiteKey: '#e8f4f8', blackKey: '#10081c',
      hitLineSync: false, hitLineColor: '#05d9e8', hitLineStyle: 'electric', hitPulse: true, hitFlash: true, hitFlashSync: false, hitFlashColor: '#05d9e8',
      particles: true, particleType: 'electric', particleAmount: 50, particleSize: 3, particleSpeed: 280, particleSpread: 0.9 } },

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
  // Humo de club
  { id: 'jazz', group: 'elegant', style: {
      background: '#0b0f1a', colorMode: 'pitch', noteColor: '#d98b2b', noteColor2: '#f2d49b', noteRadius: 6,
      glowStrength: 0.9, relief: 0.7, fallSeconds: 3.8, whiteKey: '#f3ead8', blackKey: '#10131d',
      hitLineSync: false, hitLineColor: '#e0a24a', hitLineStyle: 'fog', hitLineIntensity: 0.9,
      particles: true, particleType: 'smoke', particleAmount: 22, particleSize: 8, particleSpeed: 150, particleLife: 3, particleSpread: 0.7,
      particleSync: false, particleColor: '#c9a26a' } },
  // Notas huecas translúcidas
  { id: 'glass', group: 'elegant', style: {
      background: '#0a1018', colorMode: 'pitch', noteColor: '#8fd3ff', noteColor2: '#e6d6ff', noteFill: 'outline', outlineWidth: 2,
      noteRadius: 12, noteGap: 3, noteOpacity: 0.9, velocityOpacity: false, glowStrength: 0.9, glowRadius: 10, relief: 0, fallSeconds: 3.8,
      whiteKey: '#eef3f8', blackKey: '#121923', hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'dust', particleAmount: 24, particleSize: 3, particleSpeed: 150, particleLife: 2.4, particleSpread: 0.9 } },

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
  { id: 'spring', group: 'seasons', style: {
      background: '#07120b', colorMode: 'pitch', noteColor: '#5ccf6b', noteColor2: '#ffd1e8', noteRadius: 14, noteGap: 3,
      glowStrength: 0.8, relief: 0.4, fallSeconds: 3.8, whiteKey: '#f7fbef', blackKey: '#10241a',
      hitLineSync: false, hitLineColor: '#8fe3a0', hitLineStyle: 'mist',
      particles: true, particleType: 'petals', particleAmount: 28, particleSize: 4, particleSpeed: 170, particleLife: 2.6, particleSpread: 0.9 } },
  { id: 'summer', group: 'seasons', style: {
      background: '#051a22', colorMode: 'pitch', noteColor: '#ffd23f', noteColor2: '#ff6b6b', noteRadius: 10,
      pressedColor: '#ffd23f', glowStrength: 1.1, relief: 0.5, fallSeconds: 3, whiteKey: '#fff8e6', blackKey: '#0a2a35',
      hitLineSync: false, hitLineColor: '#2ec4b6', hitLineStyle: 'neon', hitFlash: true,
      particles: true, particleType: 'trails', particleAmount: 40, particleSize: 3.5, particleSpeed: 260, particleLife: 1.4, particleSpread: 0.9 } },
  { id: 'winter', group: 'seasons', style: {
      background: '#0a1220', colorMode: 'pitch', noteColor: '#9ad1ff', noteColor2: '#ffffff', noteRadius: 8,
      glowStrength: 0.8, relief: 0.6, fallSeconds: 4, whiteKey: '#f2f8ff', blackKey: '#122036',
      hitLineStyle: 'mist', hitLineIntensity: 0.8,
      particles: true, particleType: 'dust', particleAmount: 60, particleSize: 4, particleSpeed: 110, particleLife: 3, particleSpread: 1,
      particleSync: false, particleColor: '#ffffff' } },
  { id: 'newyear', group: 'seasons', style: {
      background: '#07070f', colorMode: 'pitch', noteColor: '#ffc93c', noteColor2: '#ff5fa2', noteRadius: 6,
      pressedColor: '#ffffff', glowStrength: 1.3, relief: 0.5, fallSeconds: 3, whiteKey: '#f6f2e8', blackKey: '#101018',
      hitLineStyle: 'neon', hitPulse: true, hitFlash: true,
      particles: true, particleType: 'sparks', particleAmount: 70, particleSize: 3.5, particleSpeed: 380, particleLife: 1.2, particleSpread: 1 } },
  { id: 'valentine', group: 'seasons', style: {
      background: '#14060d', colorMode: 'pitch', noteColor: '#e5214f', noteColor2: '#ff9db8', noteRadius: 16, noteGap: 3,
      glowStrength: 1.1, relief: 0.5, fallSeconds: 3.8, whiteKey: '#fff1f4', blackKey: '#2a0d18',
      hitLineStyle: 'mist', hitFlash: true,
      particles: true, particleType: 'petals', particleAmount: 32, particleSize: 4.5, particleSpeed: 170, particleLife: 2.6, particleSpread: 0.9 } },
];
