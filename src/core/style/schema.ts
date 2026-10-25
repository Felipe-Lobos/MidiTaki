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
  // Efectos
  relief: number;               // 0 = plano … 1 = relieve 2.5D (notas y teclas)
  syncColors: boolean;          // tecla pulsada y brillo toman el color de SU nota
  glow: boolean;                // brillo neón
  glowColor: string;            // GlowFilter usa UN color para todo el brillo
  glowStrength: number;
  glowRadius: number;
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
  relief: 0.6,
  syncColors: true,
  glow: true,
  glowColor: '#4cc9f0',
  glowStrength: 1.2,
  glowRadius: 10,
  fallSeconds: 3,
};

export type NumKey = { [K in keyof Style]: Style[K] extends number ? K : never }[keyof Style];
export type ColorKey = 'background' | 'noteColor' | 'noteColor2' | 'whiteKey' | 'blackKey' | 'pressedColor' | 'hitLineColor' | 'glowColor';
export type BoolKey = 'velocityOpacity' | 'showHitLine' | 'glow' | 'syncColors';
