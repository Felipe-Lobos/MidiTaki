export type ParticleType = 'sparks' | 'embers' | 'trails' | 'stars' | 'friction' | 'electric';

// TODA la apariencia vive aquí: un objeto plano y serializable (colores en '#rrggbb').
export interface Style {
  version: 1;
  background: string;
  // Notas
  colorMode: 'solid' | 'pitch'; // sólido o degradado según la altura de la nota
  noteColor: string;
  noteColor2: string;           // solo en modo 'pitch' (nota aguda)
  noteRadius: number;           // px, esquinas
  noteGap: number;              // px, separación entre notas
  noteOpacity: number;
  noteFill: 'solid' | 'outline'; // relleno o hueco (solo borde)
  outlineWidth: number;         // px, grosor del borde en modo hueco
  velocityOpacity: boolean;     // la fuerza (velocity) afecta la opacidad
  // Teclado
  whiteKey: string;
  blackKey: string;
  pressedColor: string;         // color de tecla pulsada (si no se sincroniza con la nota)
  keyPress: number;             // px que se hunde la tecla al pulsarse
  keyboardRatio: number;        // fracción de la altura
  showHitLine: boolean;
  hitLineColor: string;
  showOctaveLines: boolean;     // líneas verticales entre octavas (en cada Do)
  octaveLineAuto: boolean;      // color automático: claro u oscuro según el fondo
  octaveLineColor: string;      // color manual (solo si octaveLineAuto = false)
  octaveLineOpacity: number;
  // Efectos
  relief: number;               // 0 = plano … 1 = relieve 2.5D (notas y teclas)
  syncColors: boolean;          // tecla pulsada y brillo toman el color de SU nota
  glow: boolean;                // brillo neón
  glowColor: string;            // GlowFilter usa UN color para todo el brillo
  glowStrength: number;
  glowRadius: number;
  // Partículas (nacen de forma continua mientras la nota toca la tecla; toman el color de su nota)
  particles: boolean;
  particleType: ParticleType;
  particleAmount: number;       // partículas por segundo y por nota (se ajusta según el efecto)
  particleSize: number;         // px
  particleSpeed: number;        // px/s
  particleLife: number;         // s que dura cada partícula
  particleSpread: number;       // 0 = vertical … 1 = abanico de 180°
  particleGlow: boolean;        // halo suave en cada partícula
  // Escena
  fallSeconds: number;          // segundos visibles = velocidad de caída
}

export const defaultStyle: Style = {
  version: 1,
  background: '#0f0f12',
  colorMode: 'solid',
  noteColor: '#4cc9f0',
  noteColor2: '#f72585',
  noteRadius: 8,
  noteGap: 2,
  noteOpacity: 1,
  noteFill: 'solid',
  outlineWidth: 3,
  velocityOpacity: true,
  whiteKey: '#f2f2f2',
  blackKey: '#15151a',
  pressedColor: '#4cc9f0',
  keyPress: 4,
  keyboardRatio: 0.16,
  showHitLine: true,
  hitLineColor: '#ffffff',
  showOctaveLines: false,
  octaveLineAuto: true,
  octaveLineColor: '#ffffff',
  octaveLineOpacity: 0.2,
  relief: 0.6,
  syncColors: true,
  glow: true,
  glowColor: '#4cc9f0',
  glowStrength: 1.2,
  glowRadius: 10,
  particles: false,
  particleType: 'sparks',
  particleAmount: 30,
  particleSize: 4,
  particleSpeed: 240,
  particleLife: 0.9,
  particleSpread: 0.5,
  particleGlow: true,
  fallSeconds: 3,
};

export type NumKey = { [K in keyof Style]: Style[K] extends number ? K : never }[keyof Style];
export type ColorKey = 'background' | 'noteColor' | 'noteColor2' | 'whiteKey' | 'blackKey' | 'pressedColor' | 'hitLineColor' | 'glowColor' | 'octaveLineColor';
export type BoolKey = 'velocityOpacity' | 'showHitLine' | 'glow' | 'syncColors' | 'showOctaveLines' | 'octaveLineAuto' | 'particles' | 'particleGlow';
