import type { ParticleType, Style } from '../core/style/schema';

/**
 * Partículas DETERMINISTAS: la posición de cada partícula depende solo del tiempo y de una semilla
 * (inicio y número de la nota + índice de la partícula). No hay estado entre fotogramas, así que el
 * preview, el seek y el export dibujan exactamente lo mismo (igual que el resto de renderFrame(t)).
 *
 * Algunos efectos se componen de varios sprites por partícula ("segmentos"): la cola de una estela o los
 * tramos de un rayo. computeParticle calcula un segmento cada vez.
 */
export interface PState {
  x: number; y: number;
  size: number;   // diámetro (puntos) o LARGO (segmentos y chispas alargadas), en px lógicos
  flat: number;   // grosor relativo al largo: 1 = redondo; <1 = alargado
  rot: number;    // radianes
  alpha: number;
  glow: number;   // diámetro del halo suave; 0 = sin halo
}

// Cuántas partículas nacen por segundo y por nota, según el efecto (multiplica a "Cantidad")
const RATE_FACTOR: Record<ParticleType, number> = {
  sparks: 1, embers: 0.5, trails: 0.2, stars: 0.4, friction: 1.3, electric: 0.25,
};
export const particleRate = (st: Style) => Math.max(1, st.particleAmount * RATE_FACTOR[st.particleType]);

/** Los rayos duran poco (parpadean); el resto usa la duración elegida. */
export const particleLifeFor = (st: Style) => (st.particleType === 'electric' ? Math.min(st.particleLife, 0.3) : st.particleLife);

const TRAIL_SEGS = 8, BOLT_SEGS = 7;
export const particleSegments = (st: Style) => (st.particleType === 'trails' ? TRAIL_SEGS : st.particleType === 'electric' ? BOLT_SEGS : 1);

/** Hash de 3 enteros → número en [0, 1). */
function hash01(a: number, b: number, c: number): number {
  let h = (Math.imul(a | 0, 0x9e3779b1) ^ Math.imul(b | 0, 0x85ebca6b) ^ Math.imul(c | 0, 0xc2b2ae35)) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12; h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * Calcula el segmento `seg` de la partícula `j` de una nota con `age` segundos de vida.
 * cx/kw = centro y ancho de la tecla; y0 = línea de impacto. Devuelve false si ese segmento no existe aún.
 */
export function computeParticle(
  out: PState, st: Style, cx: number, kw: number, y0: number, seed: number, midi: number, j: number, age: number, seg: number,
): boolean {
  const L = particleLifeFor(st), v = st.particleSpeed, size = st.particleSize, spread = st.particleSpread;
  const r1 = hash01(seed, midi, j * 8 + 1), r2 = hash01(seed, midi, j * 8 + 2);
  const r3 = hash01(seed, midi, j * 8 + 3), r4 = hash01(seed, midi, j * 8 + 4);
  out.flat = 1;
  out.rot = 0;
  out.glow = 0;

  switch (st.particleType) {
    case 'sparks': { // chispas lanzadas hacia arriba que caen por gravedad
      const u = age / L;
      const th = (r1 - 0.5) * spread * Math.PI;
      const vv = v * (0.4 + 0.6 * r2), g = (1.5 * vv) / L;
      out.x = cx + (r3 - 0.5) * kw * 0.6 + vv * Math.sin(th) * age;
      out.y = y0 - vv * Math.cos(th) * age + 0.5 * g * age * age;
      out.size = size * (1 - 0.5 * u);
      out.alpha = 1 - u;
      out.glow = out.size * 3.5;
      return true;
    }
    case 'embers': { // brasas que suben despacio, con vaivén
      const u = age / L;
      const vv = v * 0.35 * (0.6 + 0.8 * r2);
      out.x = cx + (r1 - 0.5) * kw * (0.4 + spread) + Math.sin(age * (2 + r3 * 3) + r3 * 6.283) * (4 + spread * 14);
      out.y = y0 - vv * age;
      out.size = size * (0.7 + 0.6 * r4) * (1 - 0.4 * u);
      out.alpha = Math.min(1, age / 0.08) * (1 - u);
      out.glow = out.size * 3.5;
      return true;
    }
    case 'stars': { // estrellitas que se abren en abanico y titilan
      const u = age / L;
      const th = (r1 - 0.5) * spread * Math.PI;
      const vv = v * 0.5 * (0.4 + 0.6 * r2);
      out.x = cx + (r3 - 0.5) * kw * 0.6 + vv * Math.sin(th) * age;
      out.y = y0 - vv * Math.cos(th) * age - 12 * age;
      out.size = size * 2.2 * (0.7 + 0.6 * r4) * (1 - 0.4 * u);
      out.rot = r3 * Math.PI + age * 2;
      out.alpha = (1 - u) * (0.65 + 0.35 * Math.sin(age * 18 + r3 * 6.283));
      out.glow = out.size * 3.5;
      return true;
    }
    case 'trails': { // estela ondulante: una cabeza que sube y una cola de puntos que se desvanecen
      const a = age - seg * 0.035; // cada segmento es la misma curva, un instante antes
      if (a < 0) return false;
      const u = a / L;
      const vv = v * 0.5 * (0.7 + 0.6 * r2);
      const amp = 6 + spread * 20, freq = 5 + r3 * 4, ph = r4 * 6.283;
      out.x = cx + (r1 - 0.5) * kw * 0.6 + Math.sin(a * freq + ph) * amp * Math.min(1, a * 3);
      out.y = y0 - vv * a;
      out.size = size * (1 - 0.5 * (seg / TRAIL_SEGS)) * (1 - 0.4 * u);
      out.alpha = Math.min(1, a / 0.06) * (1 - u) * Math.pow(1 - seg / TRAIL_SEGS, 1.3);
      out.glow = seg === 0 ? out.size * 3.5 : 0; // el halo solo en la cabeza
      return true;
    }
    case 'friction': { // chispas de metal: rayitas rápidas orientadas según su movimiento, con gravedad
      const u = age / L;
      const th = (r1 - 0.5) * spread * Math.PI;
      // Formula con gravedad
      //const vv = v * 1.3 * (0.8 + 0.9 * r2), g = (2.2 * vv) / L;
      // Formula baja gravedad
      const vv = v * 1.3 * (0.8 + 0.9 * r2), g = (0.5 * vv) / L;
      const vx = vv * Math.sin(th), vy0 = -vv * Math.cos(th), vy = vy0 + g * age;
      out.x = cx + (r3 - 0.5) * kw * 0.9 + vx * age;
      out.y = y0 + vy0 * age + 0.5 * g * age * age;
      out.rot = Math.atan2(vy, vx);
      out.size = Math.max(3, size * 1.2 + Math.hypot(vx, vy) * 0.05); // largo
      const thick = Math.max(1, size * 0.3);
      out.flat = thick / out.size;
      out.alpha = Math.pow(1 - u, 0.8);
      out.glow = Math.max(6, thick * 6);
      return true;
    }
    case 'electric': { // rayo en zigzag que parpadea (se re-sortea 24 veces por segundo)
      const u = age / L, q = Math.floor(age * 24);
      const th = (r1 - 0.5) * spread * Math.PI * 0.8;
      const dx = Math.sin(th), dy = -Math.cos(th), px = Math.cos(th), py = Math.sin(th);
      const len = v * 0.3 * (0.5 + 0.8 * r2) * Math.min(1, age / 0.04); // el rayo "se dispara" en 40 ms
      const amp = 3 + spread * 8 + len * 0.06, bx = cx + (r3 - 0.5) * kw * 0.6;
      const pt = (k: number) => {
        const off = k === 0 ? 0 : (hash01(seed + q * 131, midi, j * 64 + k + 10) - 0.5) * 2 * amp;
        const t = k / BOLT_SEGS;
        return [bx + dx * len * t + px * off, y0 + dy * len * t + py * off] as const;
      };
      const [x1, y1] = pt(seg), [x2, y2] = pt(seg + 1);
      const sx = x2 - x1, sy = y2 - y1;
      out.x = (x1 + x2) / 2;
      out.y = (y1 + y2) / 2;
      out.rot = Math.atan2(sy, sx);
      out.size = Math.hypot(sx, sy) + 1.5; // largo del tramo (con un poco de solape)
      const thick = Math.max(1.2, size * 0.45);
      out.flat = thick / out.size;
      out.alpha = (1 - u) * (0.55 + 0.45 * hash01(seed, midi, j * 8 + 5 + q * 977)) * (1 - 0.5 * (seg / BOLT_SEGS));
      out.glow = thick * 6;
      return true;
    }
  }
}
