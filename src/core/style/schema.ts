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
  velocityOpacity: boolean;     // la fuerza (velocity) afecta la opacidad
  // Teclado
  whiteKey: string;
  blackKey: string;
  pressedColor: string;
  keyboardRatio: number;        // fracción de la altura
  showHitLine: boolean;
  hitLineColor: string;
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
  velocityOpacity: true,
  whiteKey: '#f2f2f2',
  blackKey: '#15151a',
  pressedColor: '#4cc9f0',
  keyboardRatio: 0.16,
  showHitLine: true,
  hitLineColor: '#ffffff',
  fallSeconds: 3,
};

export type NumKey = { [K in keyof Style]: Style[K] extends number ? K : never }[keyof Style];
export type ColorKey = 'background' | 'noteColor' | 'noteColor2' | 'whiteKey' | 'blackKey' | 'pressedColor' | 'hitLineColor';
export type BoolKey = 'velocityOpacity' | 'showHitLine';
