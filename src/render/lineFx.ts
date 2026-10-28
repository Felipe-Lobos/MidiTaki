import type { HitLineStyle } from '../core/style/schema';
import { hash01 } from './particles';

/** Parámetros de cada estilo de línea de impacto. */
export interface LineCfg {
  haze: number;      // alto (px) de la bruma sobre la línea; 0 = sin bruma
  hazeAlpha: number;
  band: number;      // brillo del borde de la línea (neón); 0 = sin borde
  second: boolean;   // segunda capa de bruma que se mueve al revés (niebla intensa)
  jag: 'electric' | 'static' | null; // línea quebrada en lugar de recta
  crisp: boolean;    // dibuja la línea recta nítida
}

export const LINE_CFG: Record<HitLineStyle, LineCfg> = {
  straight: { haze: 0,  hazeAlpha: 0,    band: 0,   second: false, jag: null,       crisp: true },
  neon:     { haze: 30, hazeAlpha: 0.55, band: 0.8, second: false, jag: null,       crisp: true },
  mist:     { haze: 46, hazeAlpha: 0.5,  band: 0,   second: false, jag: null,       crisp: false },
  fog:      { haze: 84, hazeAlpha: 0.8,  band: 0,   second: true,  jag: null,       crisp: false },
  electric: { haze: 26, hazeAlpha: 0.35, band: 0,   second: false, jag: 'electric', crisp: false },
  static:   { haze: 18, hazeAlpha: 0.25, band: 0,   second: false, jag: 'static',   crisp: false },
};

export const HAZE_W = 256, HAZE_H = 64;

/**
 * Textura de bruma: ruido suave (manchas difusas) multiplicado por un degradado vertical que se desvanece
 * hacia arriba. Es continua en horizontal (se puede repetir y desplazar sin cortes).
 */
export function makeHazeCanvas(): HTMLCanvasElement {
  const W = HAZE_W, H = HAZE_H;
  const noise = document.createElement('canvas');
  noise.width = W; noise.height = H;
  const ng = noise.getContext('2d')!;
  ng.fillStyle = 'rgba(255,255,255,0.35)';
  ng.fillRect(0, 0, W, H);
  let s = 12345; // semilla fija: la bruma es siempre la misma
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < 46; i++) {
    const x = rnd() * W, y = rnd() * H, r = 10 + rnd() * 34, a = 0.25 + rnd() * 0.5;
    for (const dx of [-W, 0, W]) { // se repite a los lados para que no haya costura
      const gr = ng.createRadialGradient(x + dx, y, 0, x + dx, y, r);
      gr.addColorStop(0, `rgba(255,255,255,${a})`);
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      ng.fillStyle = gr;
      ng.fillRect(x + dx - r, y - r, 2 * r, 2 * r);
    }
  }
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0.9)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'destination-in'; // la bruma solo queda donde hay "manchas"
  g.drawImage(noise, 0, 0);
  return c;
}

/** Franja vertical suave, brillante en el centro: el borde luminoso de la línea. */
export function makeBandCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 32;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 32);
  for (const [o, a] of [[0, 0], [0.3, 0.25], [0.5, 1], [0.7, 0.25], [1, 0]]) grad.addColorStop(o, `rgba(255,255,255,${a})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 32);
  return c;
}

/**
 * Puntos [x0, y0, x1, y1, …] de una línea quebrada a lo ancho. Se "re-sortea" 24–30 veces por segundo,
 * pero solo depende del tiempo (determinista), así que el export coincide con la vista previa.
 */
export function jaggedLine(out: number[], kind: 'electric' | 'static', t: number, w: number, y: number, amp: number, seed: number) {
  const q = Math.floor(t * (kind === 'electric' ? 24 : 30));
  const step = kind === 'electric' ? 10 : 5;
  out.length = 0;
  const n = Math.ceil(w / step);
  for (let i = 0; i <= n; i++) {
    const x = Math.min(i * step, w);
    // Eléctrico: la amplitud varía a lo largo de la línea (zonas tranquilas y zonas con "arco")
    const env = kind === 'electric' ? Math.pow(0.5 + 0.5 * Math.sin(x * 0.018 + q * 0.9 + seed * 1.7), 2) : 1;
    out.push(x, y + (hash01(q, i, seed) - 0.5) * 2 * amp * env);
  }
}
