export interface Compat { webgl: boolean; webCodecs: boolean; webAudio: boolean }

/** Comprueba la presencia de las APIs necesarias (no que la GPU funcione: eso lo detecta el arranque de Pixi). */
export const compat: Compat = {
  webgl: typeof WebGL2RenderingContext !== 'undefined' || typeof WebGLRenderingContext !== 'undefined',
  webCodecs: typeof VideoEncoder !== 'undefined' && typeof AudioEncoder !== 'undefined' && typeof VideoFrame !== 'undefined',
  webAudio: typeof AudioContext !== 'undefined' && typeof OfflineAudioContext !== 'undefined',
};
