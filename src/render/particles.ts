import type { ParticleType, Style } from '../core/style/schema';

/**
 * Partículas DETERMINISTAS: la posición de cada partícula depende solo del tiempo y de una semilla
 * (inicio y número de la nota + índice de la partícula). No hay estado entre fotogramas, así que el
 * preview, el seek y el export dibujan exactamente lo mismo (igual que el resto de renderFrame(t)).
 */
export interface PState {
  x: number; y: number;
  size: number;   // diámetro en px lógicos
  flat: number;   // 1 = redondo; <1 = aplastado en vertical (anillos en perspectiva)
  rot: number;    // radianes
  alpha: number;
}

// Cuántas partículas nacen por segundo y por nota, según el efecto (multiplica a "Cantidad")
const RATE_FACTOR: Record<ParticleType, number> = { sparks: 1, embers: 0.5, ring: 0.12, stars: 0.4 };
export const particleRate = (st: Style) => Math.max(1, st.particleAmount * RATE_FACTOR[st.particleType]);

/** Hash de 3 enteros → número en [0, 1). */
function hash01(a: number, b: number, c: number): number {
  let h = (Math.imul(a | 0, 0x9e3779b1) ^ Math.imul(b | 0, 0x85ebca6b) ^ Math.imul(c | 0, 0xc2b2ae35)) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12; h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * Calcula la partícula `j` de una nota con `age` segundos de vida.
 * cx/kw = centro y ancho de la tecla; y0 = línea de impacto.
 */
export function computeParticle(
  out: PState, st: Style, cx: number, kw: number, y0: number, seed: number, midi: number, j: number, age: number,
) {
  const L = st.particleLife, u = age / L, v = st.particleSpeed, size = st.particleSize, spread = st.particleSpread;
  const r1 = hash01(seed, midi, j * 8 + 1), r2 = hash01(seed, midi, j * 8 + 2);
  const r3 = hash01(seed, midi, j * 8 + 3), r4 = hash01(seed, midi, j * 8 + 4);
  out.flat = 1;
  out.rot = 0;

  switch (st.particleType) {
    case 'sparks': { // chispas lanzadas hacia arriba que caen por gravedad
      const th = (r1 - 0.5) * spread * Math.PI;
      const vv = v * (0.4 + 0.6 * r2), g = (1.5 * vv) / L;
      out.x = cx + (r3 - 0.5) * kw * 0.6 + vv * Math.sin(th) * age;
      out.y = y0 - vv * Math.cos(th) * age + 0.5 * g * age * age;
      out.size = size * (1 - 0.5 * u);
      out.alpha = 1 - u;
      break;
    }
    case 'embers': { // brasas que suben despacio, con vaivén
      const vv = v * 0.35 * (0.6 + 0.8 * r2);
      out.x = cx + (r1 - 0.5) * kw * (0.4 + spread) + Math.sin(age * (2 + r3 * 3) + r3 * 6.283) * (4 + spread * 14);
      out.y = y0 - vv * age;
      out.size = size * (0.7 + 0.6 * r4) * (1 - 0.4 * u);
      out.alpha = Math.min(1, age / 0.08) * (1 - u);
      break;
    }
    case 'ring': { // onda que se expande desde la tecla (aplastada, como en perspectiva)
      const maxR = (12 + v * 0.12) * (size / 4);
      out.x = cx;
      out.y = y0 - 1;
      out.size = 2 * maxR * Math.pow(u, 0.6) + 1;
      out.flat = 0.3;
      out.alpha = Math.pow(1 - u, 1.5) * 0.9;
      break;
    }
    case 'stars': { // estrellitas que se abren en abanico y titilan
      const th = (r1 - 0.5) * spread * Math.PI;
      const vv = v * 0.5 * (0.4 + 0.6 * r2);
      out.x = cx + (r3 - 0.5) * kw * 0.6 + vv * Math.sin(th) * age;
      out.y = y0 - vv * Math.cos(th) * age - 12 * age;
      out.size = size * 2.2 * (0.7 + 0.6 * r4) * (1 - 0.4 * u);
      out.rot = r3 * Math.PI + age * 2;
      out.alpha = (1 - u) * (0.65 + 0.35 * Math.sin(age * 18 + r3 * 6.283));
      break;
    }
  }
}
