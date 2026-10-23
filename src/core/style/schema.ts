// En el hito 4 esto pasará a ser el store editable. Por ahora es fijo.
export interface Style {
  background: number;
  noteColor: number;
  pressedColor: number;
  whiteKey: number;
  blackKey: number;
  hitLineColor: number;
  noteRadius: number;     // px, radio de esquina
  fallSeconds: number;    // segundos visibles en pantalla (velocidad de caída)
  keyboardRatio: number;  // fracción de la altura que ocupa el teclado
}

export const defaultStyle: Style = {
  background: 0x0f0f12,
  noteColor: 0x4cc9f0,
  pressedColor: 0x4cc9f0,
  whiteKey: 0xf2f2f2,
  blackKey: 0x15151a,
  hitLineColor: 0xffffff,
  noteRadius: 8,
  fallSeconds: 3,
  keyboardRatio: 0.16,
};
