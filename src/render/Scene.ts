import { Application, BlurFilter, ColorMatrixFilter, Container, Graphics, NineSliceSprite, Rectangle, Sprite, Texture } from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import type { Song } from '../core/midi/types';
import { buildKeyboardLayout, type KeyRange, type KeyRect } from '../core/keyboard/layout';
import { visibleNotes } from '../core/timeline/visibleNotes';
import type { Style } from '../core/style/schema';
import { HAZE_W, LINE_CFG, jaggedLine, makeBandCanvas, makeHazeCanvas } from './lineFx';
import { computeParticle, particleLifeFor, particleRate, particleSegments, type PState } from './particles';
import { contrastColor, hexToNum, lerpColor, noteTint } from '../core/colors/colorMapping';

export type HitRegion = 'notes' | 'keyboard' | 'scene';

interface PartTex { dot: Texture; glow: Texture; star: Texture; streak: Texture; bar: Texture }
const MAX_FLASHES = 96;  // destellos de tecla a la vez
const MAX_PARTICLES = 900; // tope de partículas dibujadas a la vez (protege tablets y notas muy densas)

interface KeyView { rect: KeyRect; g: Graphics; pressTint: number | null }

const gray = (v: number) => Math.round(255 * v) * 0x010101;

/** renderFrame(t) dibuja TODO en función del tiempo t (y del style actual). */
export class Scene {
  private app: Application;
  private style: Style;
  private guides = new Graphics();    // líneas entre octavas (detrás de todo)
  private fxLayer = new Container();   // halos + notas + destellos
  private haloLayer = new Container(); // brillo por nota (modo sincronizado)
  private notesLayer = new Container();
  private sparks = new Graphics();     // destello en la línea de impacto
  private keysLayer = new Container();
  private lineFx = new Container();    // bruma, borde luminoso, línea quebrada y destellos de la línea de impacto
  private hazeTex!: Texture;
  private hazeLayer1 = new Container(); // cada capa de bruma = varios sprites en fila (ver layoutHaze)
  private hazeLayer2 = new Container();
  private hazePool1: Sprite[] = [];
  private hazePool2: Sprite[] = [];
  private band!: Sprite;
  private bolt = new Graphics();
  private flashPool: Sprite[] = [];
  private jagBuf: number[] = [];
  private hitLine = new Graphics();
  private particleLayer = new Container(); // partículas: por encima del teclado
  private partGlowLayer = new Container();
  private partDotLayer = new Container();
  private partPool: Sprite[] = [];
  private partGlowPool: Sprite[] = [];
  private partTexCache = new Map<number, PartTex>(); // por resolución; no se destruyen (ver buildTexture)
  private partOut: PState = { x: 0, y: 0, size: 0, flat: 1, rot: 0, alpha: 0, glow: 0 };
  private glowFilter: GlowFilter | null = null; // brillo de UN color (modo no sincronizado)
  private glowDistance = -1;
  private haloBlur: BlurFilter | null = null;       // brillo por nota (modo sincronizado):
  private haloGain: ColorMatrixFilter | null = null;  // desenfoque + ganancia sobre la capa de siluetas
  private fxAllowed = true; // El EXPORT nunca lo desactiva: siempre calidad completa
  private pool: NineSliceSprite[] = [];
  private haloPool: NineSliceSprite[] = [];
  private keys = new Map<number, KeyView>();
  private texture!: Texture;
  private haloTex!: Texture;
  private texCache = new Map<string, { tex: Texture; halo: Texture }>();
  private texRes = 1; // resolución con la que se generaron las texturas

  private song: Song | null = null;
  private range: KeyRange = { low: 21, high: 108 };
  private w: number;
  private h: number;
  private lastT = 0;

  constructor(app: Application, style: Style) {
    this.app = app;
    this.style = style;
    this.fxLayer.addChild(this.haloLayer, this.notesLayer, this.sparks);
    app.stage.addChild(this.guides, this.fxLayer, this.keysLayer, this.lineFx, this.hitLine, this.particleLayer);
    this.particleLayer.addChild(this.partGlowLayer, this.partDotLayer);
    this.w = app.screen.width;
    this.h = app.screen.height;
    this.hazeTex = Texture.from(makeHazeCanvas());
    this.band = new Sprite(Texture.from(makeBandCanvas()));
    this.band.anchor.set(0.5);
    this.band.blendMode = 'add';
    this.lineFx.addChild(this.hazeLayer1, this.hazeLayer2, this.band, this.bolt);
    this.buildTexture();
    this.rebuildKeys();
    this.applyFx();
  }

  /** Interruptor de rendimiento (solo vista previa). */
  setEffectsEnabled(on: boolean) {
    this.fxAllowed = on;
    this.applyFx();
    this.drawHitLine();
    this.renderFrame(this.lastT);
  }

  /**
   * SOLO PARA EL EXPORT. Si el encoder entrega rango completo, comprime el color a 16–235 (rango
   * "limitado", el estándar del video) para que todos los reproductores lo muestren igual.
   * El fondo se dibuja como un rectángulo para que también quede dentro del filtro.
   */
  compressToLimitedRange() {
    const bg = new Graphics().rect(0, 0, this.w, this.h).fill(hexToNum(this.style.background));
    this.app.stage.addChildAt(bg, 0);
    const a = 219 / 255, b = 16 / 255;
    const f = new ColorMatrixFilter();
    f.matrix = [a, 0, 0, 0, b, 0, a, 0, 0, b, 0, 0, a, 0, b, 0, 0, 0, 1, 0];
    f.resolution = this.app.renderer.resolution; // sin esto el filtro iría a 1× y saldría borroso
    this.app.stage.filterArea = new Rectangle(0, 0, this.w, this.h);
    this.app.stage.filters = [f];
  }

  setStyle(style: Style) {
    const old = this.style;
    this.style = style;
    this.app.renderer.background.color = style.background;
    if (old.noteRadius !== style.noteRadius || old.noteFill !== style.noteFill
      || old.outlineWidth !== style.outlineWidth || old.relief !== style.relief) this.buildTexture();
    this.applyFx();
    this.rebuildKeys();
    this.renderFrame(this.lastT);
  }

  setSong(song: Song | null, range: KeyRange) {
    this.song = song;
    if (range.low !== this.range.low || range.high !== this.range.high) {
      this.range = range;
      this.rebuildKeys();
    }
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    if (this.app.renderer.resolution !== this.texRes) this.buildTexture(); // nítido a cualquier escala
    this.applyFx();
    this.rebuildKeys();
    this.renderFrame(this.lastT);
  }

  private get haloOn() { return this.style.glow && this.style.syncColors && this.fxAllowed; }

  private applyFx() {
    const st = this.style;
    this.applyHaloFx();
    this.fxLayer.filterArea = new Rectangle(0, 0, this.w, this.h);
    // Brillo de un solo color: GlowFilter sobre toda la capa (solo si NO se sincroniza)
    if (!(st.glow && !st.syncColors && this.fxAllowed)) { this.fxLayer.filters = null; return; }
    if (!this.glowFilter || this.glowDistance !== st.glowRadius) { // "distance" solo se fija al crear
      this.fxLayer.filters = null;
      this.glowFilter?.destroy();
      this.glowFilter = new GlowFilter({
        distance: st.glowRadius, outerStrength: 2, innerStrength: 0, color: 0xffffff, quality: 0.2,
      });
      this.glowDistance = st.glowRadius;
    }
    this.glowFilter.outerStrength = st.glowStrength * 2;
    this.glowFilter.color = hexToNum(st.glowColor);
    this.fxLayer.filters = [this.glowFilter];
  }

  /**
   * Brillo por nota (modo sincronizado): la capa de siluetas se desenfoca con BlurFilter de Pixi y se
   * multiplica por una ganancia (intensidad). Cada silueta conserva el color de su nota, y como no hay
   * "hueco" que recortar, no puede aparecer una línea oscura entre la nota y su halo.
   */
  private applyHaloFx() {
    const st = this.style;
    if (!this.haloOn) { this.haloLayer.filters = null; return; }
    if (!this.haloBlur || !this.haloGain) {
      this.haloBlur = new BlurFilter({ strength: 1, quality: 4 });
      this.haloGain = new ColorMatrixFilter();
    }
    const res = this.app.renderer.resolution;
    this.haloBlur.strength = st.glowRadius * 0.5;
    this.haloBlur.resolution = res; // sin esto el filtro iría a 1× y saldría borroso
    this.haloGain.resolution = res;
    const k = st.glowStrength * 1.5;
    this.haloGain.matrix = [k, 0, 0, 0, 0, 0, k, 0, 0, 0, 0, 0, k, 0, 0, 0, 0, 0, k, 0];
    this.haloLayer.filterArea = new Rectangle(0, 0, this.w, this.h);
    this.haloLayer.filters = [this.haloBlur, this.haloGain];
  }

  private get hitY() { return this.h * (1 - this.style.keyboardRatio); }
  private get inset() {
    const st = this.style;
    return Math.max(1, Math.round(Math.max(st.noteRadius, st.noteFill === 'outline' ? st.outlineWidth : 0)));
  }

  /**
   * Texturas de nota y de halo. Se guardan en una caché y NO se destruyen al cambiar de ajustes:
   * destruir una textura que Pixi aún tiene enlazada genera el aviso "textureSource was destroyed
   * while still bound". Solo se destruyen las más antiguas cuando la caché pasa de 24 entradas.
   */
  private buildTexture() {
    for (const sp of this.pool) sp.destroy();
    for (const sp of this.haloPool) sp.destroy();
    this.pool = [];
    this.haloPool = [];
    const st = this.style, res = this.app.renderer.resolution;
    this.texRes = res;

    const key = [st.noteRadius, st.noteFill, st.outlineWidth, st.relief, res].join('|');
    let entry = this.texCache.get(key);
    if (entry) {
      this.texCache.delete(key); // reinsertar = marcar como "usada hace poco"
    } else {
      entry = { tex: this.makeNoteTexture(), halo: this.makeSilhouetteTexture() };
      if (this.texCache.size >= 24) {
        for (const [oldKey, old] of this.texCache) { // la más antigua
          old.tex.destroy(true);
          old.halo.destroy(true);
          this.texCache.delete(oldKey);
          break;
        }
      }
    }
    this.texCache.set(key, entry);
    this.texture = entry.tex;
    this.haloTex = entry.halo;
  }

  /** Textura blanca de la nota (9-slice, se tiñe con tint). */
  private makeNoteTexture(): Texture {
    const { noteRadius: r, noteFill, outlineWidth: ow, relief } = this.style;
    const inset = this.inset, s = inset * 4;
    const g = new Graphics();
    if (noteFill === 'outline') {
      g.roundRect(ow / 2, ow / 2, s - ow, s - ow, Math.max(r - ow / 2, 0)).stroke({ width: ow, color: 0xffffff });
    } else if (relief > 0 && inset >= 3) {
      const b = Math.max(1, Math.round(inset * 0.4 * relief));
      g.roundRect(0, 0, s, s, r).fill(gray(1 - 0.5 * relief));
      g.roundRect(0, 0, s, s - b, r).fill(0xffffff);
      g.roundRect(b * 0.8, b, s - b * 1.6, s - b * 2.2, Math.max(r - b, 0)).fill(gray(1 - 0.22 * relief));
    } else {
      g.roundRect(0, 0, s, s, r).fill(0xffffff);
    }
    const tex = this.app.renderer.generateTexture(g);
    g.destroy();
    return tex;
  }

  /** Silueta blanca de la nota (sin relieve): es lo que se desenfoca para crear el brillo. */
  private makeSilhouetteTexture(): Texture {
    const { noteRadius: r, noteFill, outlineWidth: ow } = this.style;
    const s = this.inset * 4;
    const g = new Graphics();
    if (noteFill === 'outline') {
      g.roundRect(ow / 2, ow / 2, s - ow, s - ow, Math.max(r - ow / 2, 0)).stroke({ width: ow, color: 0xffffff });
    } else {
      g.roundRect(0, 0, s, s, r).fill(0xffffff);
    }
    const tex = this.app.renderer.generateTexture(g);
    g.destroy();
    return tex;
  }

  private rebuildKeys() {
    this.keysLayer.removeChildren().forEach((c) => c.destroy());
    this.keys.clear();
    // Base oscura del teclado: se ve en la franja que deja libre la tecla al hundirse
    const bed = new Graphics()
      .rect(0, this.hitY, this.w, this.h - this.hitY)
      .fill(lerpColor(hexToNum(this.style.background), 0x000000, 0.6));
    this.keysLayer.addChild(bed);
    const layout = buildKeyboardLayout(this.range, this.w);
    for (const rect of [...layout.filter((k) => !k.black), ...layout.filter((k) => k.black)]) {
      const g = new Graphics();
      this.keysLayer.addChild(g);
      const view = { rect, g, pressTint: null };
      this.keys.set(rect.midi, view);
      this.drawKey(view);
    }
    this.drawGuides(layout);
    this.drawHitLine();
  }

  /** Línea recta nítida. Los estilos bruma, niebla, eléctrico y estática dibujan la suya (en renderLineFx). */
  private drawHitLine() {
    const st = this.style;
    this.hitLine.clear();
    if (!st.showHitLine) return;
    const cfg = LINE_CFG[st.hitLineStyle];
    if (this.fxAllowed && !cfg.crisp) return;
    const c = hexToNum(st.hitLineColor);
    this.hitLine.rect(0, this.hitY - 1, this.w, 2).fill(this.fxAllowed && st.hitLineStyle === 'neon' ? lerpColor(c, 0xffffff, 0.55) : c);
  }

  /**
   * Una capa de bruma: la textura (continua en horizontal) se coloca varias veces en fila y se desplaza `scroll` px.
   * Son sprites normales, SIN repetición vertical: con un TilingSprite el filtrado mezclaba el borde de arriba
   * con el de abajo y dibujaba una raya horizontal al final de la bruma. h = 0 oculta la capa.
   */
  private layoutHaze(pool: Sprite[], layer: Container, h: number, scaleX: number, scroll: number, color: number, alpha: number) {
    const tw = HAZE_W * scaleX;
    const n = h > 0 ? Math.ceil(this.w / tw) + 1 : 0;
    const first = -(((scroll % tw) + tw) % tw);
    for (let i = 0; i < Math.max(n, pool.length); i++) {
      if (i >= n) { pool[i].visible = false; continue; }
      let sp = pool[i];
      if (!sp) {
        sp = new Sprite(this.hazeTex);
        sp.blendMode = 'add';
        layer.addChild(sp);
        pool[i] = sp;
      }
      sp.visible = true;
      sp.position.set(first + i * tw, this.hitY + 2 - h);
      sp.width = tw; // sin solape entre vecinos: en aditivo un solape dibujaría rayas verticales
      sp.height = h;
      sp.tint = color;
      sp.alpha = alpha;
    }
  }

  /**
   * Efectos de la línea de impacto, todos función del tiempo: bruma que se desplaza, borde luminoso,
   * línea quebrada, pulso de toda la línea con cada nota y destello de luz en cada tecla que golpea.
   */
  private renderLineFx(t: number) {
    const st = this.style;
    const on = st.showHitLine && this.fxAllowed;
    this.lineFx.visible = on;
    if (!on) return;
    const cfg = LINE_CFG[st.hitLineStyle];
    const I = st.hitLineIntensity, color = hexToNum(st.hitLineColor), hitY = this.hitY, W = this.w;

    // Notas que acaban de golpear la tecla (o siguen sonando): pulso y destellos
    let pulse = 0, flashes = 0;
    if (this.song && (st.hitPulse || st.hitFlash)) {
      const glow = this.partTextures().glow;
      for (const n of visibleNotes(this.song, t - 0.6, t)) {
        const age = t - n.start;
        if (age < 0) continue;
        const end = n.start + n.duration;
        const burst = Math.exp(-age / 0.14) * (0.5 + 0.5 * n.velocity);
        if (st.hitPulse) pulse = 1 - (1 - pulse) * (1 - burst * 0.8);
        if (!st.hitFlash || flashes >= MAX_FLASHES) continue;
        const key = this.keys.get(n.midi);
        const level = burst + 0.28 * (t < end ? 1 : Math.exp(-(t - end) / 0.12)); // golpe + brillo mientras suena
        if (!key || level < 0.02) continue;
        if (!this.flashPool[flashes]) {
          const f = new Sprite(glow);
          f.anchor.set(0.5);
          f.blendMode = 'add';
          this.lineFx.addChild(f);
          this.flashPool[flashes] = f;
        }
        const f = this.flashPool[flashes++];
        if (f.texture !== glow) f.texture = glow;
        const size = key.rect.w * 3 + 16;
        f.visible = true;
        f.position.set(key.rect.x + key.rect.w / 2, hitY - 1);
        f.scale.set(size / glow.width, (size * 0.75) / glow.height);
        f.tint = color;
        f.alpha = Math.min(1, level * Math.max(I, 0.3));
      }
    }
    for (let i = flashes; i < this.flashPool.length; i++) this.flashPool[i].visible = false;

    // Bruma (una o dos capas que se desplazan despacio en sentidos contrarios)
    const boost = 1 + 0.9 * pulse;
    const a1 = cfg.hazeAlpha * I * boost * (0.9 + 0.1 * Math.sin(t * 1.7));
    this.layoutHaze(this.hazePool1, this.hazeLayer1, cfg.haze, 1.6, t * 22, color, Math.min(1, a1));
    const a2 = cfg.hazeAlpha * I * boost * 0.7 * (0.9 + 0.1 * Math.cos(t * 1.3));
    this.layoutHaze(this.hazePool2, this.hazeLayer2, cfg.second ? cfg.haze * 0.75 : 0, 2.4, 90 - t * 14, color, Math.min(1, a2));

    // Borde luminoso (neón) y/o aviso del pulso, en cualquier estilo
    const bandAlpha = Math.min(1, (cfg.band + 0.9 * pulse) * Math.max(I, 0.3));
    this.band.visible = bandAlpha > 0.01;
    if (this.band.visible) {
      this.band.position.set(W / 2, hitY);
      this.band.width = W;
      this.band.height = 22 * (1 + 0.6 * pulse);
      this.band.tint = color;
      this.band.alpha = bandAlpha;
    }

    // Línea quebrada (eléctrico / estática)
    this.bolt.clear();
    if (cfg.jag) {
      const amp = (cfg.jag === 'electric' ? 9 : 2.6) * (1 + 0.8 * pulse), core = lerpColor(color, 0xffffff, 0.65);
      jaggedLine(this.jagBuf, cfg.jag, t, W, hitY, amp, 0);
      this.bolt.poly(this.jagBuf, false).stroke({ width: 3, color, alpha: Math.min(1, 0.3 * I * boost) });
      this.bolt.poly(this.jagBuf, false).stroke({ width: 1.3, color: core, alpha: 0.95 });
      if (cfg.jag === 'electric') { // segundo arco, más fino
        jaggedLine(this.jagBuf, cfg.jag, t, W, hitY, amp * 0.7, 1);
        this.bolt.poly(this.jagBuf, false).stroke({ width: 1, color, alpha: Math.min(1, 0.55 * I) });
      }
    }
  }

  /** Una línea vertical en el borde izquierdo de cada Do (límite entre octavas), desde arriba hasta el teclado. */
  private drawGuides(layout: KeyRect[]) {
    const st = this.style;
    this.guides.clear();
    if (!st.showOctaveLines) return;
    const color = st.octaveLineAuto ? contrastColor(hexToNum(st.background)) : hexToNum(st.octaveLineColor);
    for (const k of layout) {
      if (k.black || k.midi % 12 !== 0 || k.x < 1) continue; // sin línea si el Do es la primera tecla
      this.guides.rect(k.x - 0.5, 0, 1, this.hitY).fill({ color, alpha: st.octaveLineOpacity });
    }
  }

  private drawKey(k: KeyView) {
    const s = this.style, rel = s.relief;
    const { x, w, black } = k.rect;
    const y = this.hitY, keyH = this.h - y - s.keyPress; // deja margen abajo para hundirse
    const pressed = k.pressTint !== null;
    const color = k.pressTint ?? hexToNum(black ? s.blackKey : s.whiteKey);
    const top = y + (pressed ? s.keyPress : 0); // la tecla pulsada se desplaza hacia abajo
    const g = k.g.clear();

    if (black) {
      const bh = keyH * 0.62;
      g.roundRect(x, top, w, bh, 3).fill(color);
      if (rel > 0) {
        g.rect(x + w * 0.2, top + bh * 0.84, w * 0.6, 1.5)
          .fill({ color: 0xffffff, alpha: (pressed ? 0.18 : 0.35) * rel });
      }
      return;
    }

    const r = Math.min(5, w * 0.2), kx = x + 0.5, kw = w - 1;
    if (rel > 0) {
      const band = keyH * 0.12;
      g.roundRect(kx, top, kw, keyH, r).fill(lerpColor(color, 0x000000, 0.2 * rel)); // borde inferior
      g.roundRect(kx, top, kw, keyH - band, r).fill(color);                           // cara
    } else {
      g.roundRect(kx, top, kw, keyH, r).fill(color);
    }
  }

  private getSprite(i: number): NineSliceSprite {
    if (!this.pool[i]) {
      const r = this.inset;
      const sp = new NineSliceSprite({ texture: this.texture, leftWidth: r, rightWidth: r, topHeight: r, bottomHeight: r });
      this.notesLayer.addChild(sp);
      this.pool[i] = sp;
    }
    return this.pool[i];
  }

  private getHalo(i: number): NineSliceSprite {
    if (!this.haloPool[i]) {
      const e = this.inset;
      const sp = new NineSliceSprite({ texture: this.haloTex, leftWidth: e, rightWidth: e, topHeight: e, bottomHeight: e });
      this.haloLayer.addChild(sp);
      this.haloPool[i] = sp;
    }
    return this.haloPool[i];
  }

  /** ¿Qué hay bajo el punto (x, y), en coordenadas lógicas? Sirve para abrir la pestaña de ajustes correspondiente. */
  hitTest(x: number, y: number): HitRegion {
    if (y >= this.hitY - 3) return 'keyboard'; // teclado y línea de impacto
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const sp = this.pool[i];
      if (sp.visible && x >= sp.x && x <= sp.x + sp.width && y >= sp.y && y <= sp.y + sp.height) return 'notes';
    }
    return 'scene'; // fondo y líneas de octava
  }

  private partTextures(): PartTex {
    const res = this.app.renderer.resolution;
    let pt = this.partTexCache.get(res);
    if (!pt) { pt = this.makePartTextures(); this.partTexCache.set(res, pt); }
    return pt;
  }

  /** Formas blancas (se tiñen con el color de la nota). El halo y el anillo suave llevan el brillo ya dibujado. */
  private makePartTextures(): PartTex {
    const mk = (draw: (g: Graphics) => void) => {
      const g = new Graphics();
      draw(g);
      const tex = this.app.renderer.generateTexture(g);
      g.destroy();
      return tex;
    };
    return {
      dot: mk((g) => { g.circle(8, 8, 8).fill({ color: 0xffffff, alpha: 0.35 }); g.circle(8, 8, 6).fill(0xffffff); }),
      glow: mk((g) => { for (let k = 12; k >= 1; k--) g.circle(16, 16, (16 * k) / 12).fill({ color: 0xffffff, alpha: 0.07 }); }),
      star: mk((g) => g.poly([8, 0, 9.6, 6.4, 16, 8, 9.6, 9.6, 8, 16, 6.4, 9.6, 0, 8, 6.4, 6.4]).fill(0xffffff)),
      // Chispa alargada: cola tenue a la izquierda, cabeza brillante a la derecha (apunta hacia +x)
      streak: mk((g) => {
        for (let i = 0; i < 16; i++) {
          g.rect(i * 2, 0, 2, 4).fill({ color: 0xffffff, alpha: (0.25 * (i + 1)) / 16 });
          g.rect(i * 2, 1, 2, 2).fill({ color: 0xffffff, alpha: (i + 1) / 16 });
        }
      }),
      // Tramo uniforme (para los rayos): se estira a lo largo y se gira
      bar: mk((g) => { g.rect(0, 0, 8, 4).fill({ color: 0xffffff, alpha: 0.3 }); g.rect(0, 1, 8, 2).fill(0xffffff); }),
    };
  }

  private getPartSprite(pool: Sprite[], layer: Container, i: number): Sprite {
    if (!pool[i]) {
      const sp = new Sprite();
      sp.anchor.set(0.5);
      sp.blendMode = 'add';
      layer.addChild(sp);
      pool[i] = sp;
    }
    return pool[i];
  }

  /** Partículas continuas: cada nota emite `rate` por segundo mientras suena y cada una vive `life` segundos. */
  private renderParticles(t: number) {
    const st = this.style;
    let used = 0;
    if (this.song && st.particles && this.fxAllowed) {
      const tx = this.partTextures();
      const type = st.particleType;
      const main = type === 'stars' ? tx.star : type === 'friction' ? tx.streak : type === 'electric' ? tx.bar : tx.dot;
      const glowTex = st.particleGlow ? tx.glow : null;
      const rate = particleRate(st), life = particleLifeFor(st), segs = particleSegments(st), o = this.partOut;
      const span = Math.max(1, this.range.high - this.range.low);
      let full = false;
      // Notas que suenan o terminaron hace menos de `life` segundos (aún les quedan partículas vivas)
      for (const n of visibleNotes(this.song, t - life, t)) {
        const key = this.keys.get(n.midi);
        if (!key || full) continue;
        const first = Math.max(0, Math.ceil((t - life - n.start) * rate));
        const last = Math.floor((Math.min(t, n.start + n.duration) - n.start) * rate);
        const tint = noteTint(st, (n.midi - this.range.low) / span);
        const seed = Math.round(n.start * 1000);
        const cx = key.rect.x + key.rect.w / 2, vel = 0.6 + 0.4 * n.velocity;
        for (let j = first; j <= last && !full; j++) {
          const age = t - (n.start + j / rate);
          if (age < 0 || age >= life) continue;
          for (let s = 0; s < segs; s++) {
            if (used >= MAX_PARTICLES) { full = true; break; }
            if (!computeParticle(o, st, cx, key.rect.w, this.hitY, seed, n.midi, j, age, s)) continue;
            const a = Math.max(0, Math.min(1, o.alpha * vel));
            const sp = this.getPartSprite(this.partPool, this.partDotLayer, used);
            if (sp.texture !== main) sp.texture = main;
            sp.visible = true;
            sp.position.set(o.x, o.y);
            sp.rotation = o.rot;
            sp.scale.set(o.size / main.width, (o.size * o.flat) / main.height);
            sp.tint = tint;
            sp.alpha = a;
            if (glowTex && o.glow > 0) {
              const gs = this.getPartSprite(this.partGlowPool, this.partGlowLayer, used);
              if (gs.texture !== glowTex) gs.texture = glowTex;
              gs.visible = true;
              gs.position.set(o.x, o.y);
              gs.scale.set(o.glow / glowTex.width);
              gs.tint = tint;
              gs.alpha = a * 0.6;
            } else if (this.partGlowPool[used]) this.partGlowPool[used].visible = false;
            used++;
          }
        }
      }
    }
    for (let i = used; i < this.partPool.length; i++) this.partPool[i].visible = false;
    // La pool de halos puede tener huecos (p. ej. en Estelas solo la cabeza lleva halo): se comprueba cada uno
    for (let i = used; i < this.partGlowPool.length; i++) { const gs = this.partGlowPool[i]; if (gs) gs.visible = false; }
  }

  renderFrame(t: number) {
    this.lastT = t;
    const st = this.style;
    const hitY = this.hitY;
    const pxPerSec = hitY / st.fallSeconds;
    const span = Math.max(1, this.range.high - this.range.low);
    const active = new Map<number, number>(); // midi → color de la tecla pulsada
    const halos = this.haloOn;
    let used = 0;
    this.sparks.clear();

    if (this.song) {
      for (const n of visibleNotes(this.song, t, t + st.fallSeconds)) {
        const key = this.keys.get(n.midi);
        if (!key) continue; // fuera del rango del teclado
        const end = n.start + n.duration;
        const tint = noteTint(st, (n.midi - this.range.low) / span);
        const playing = n.start <= t && t < end;
        if (playing) active.set(n.midi, st.syncColors ? tint : hexToNum(st.pressedColor));

        // La nota activa se prolonga lo que se hunde la tecla: sin hueco entre nota y tecla
        const bottom = Math.min(hitY + (playing ? st.keyPress : 0), hitY - (n.start - t) * pxPerSec);
        const top = hitY - (end - t) * pxPerSec;
        const height = bottom - top;
        if (height <= 0) continue;

        // La separación entre notas se resta ARRIBA, así la parte baja queda pegada a la tecla
        const x = key.rect.x + st.noteGap / 2;
        const nw = Math.max(key.rect.w - st.noteGap, 1);
        const nh = Math.max(height - st.noteGap, 2);
        const ny = bottom - nh;
        const alpha = st.noteOpacity * (st.velocityOpacity ? 0.55 + 0.45 * n.velocity : 1);

        const sp = this.getSprite(used);
        sp.visible = true;
        sp.position.set(x, ny);
        sp.width = nw;
        sp.height = nh;
        sp.tint = tint;
        sp.alpha = alpha;

        if (halos) {
          const hs = this.getHalo(used);
          hs.visible = true;
          hs.position.set(x, ny);
          hs.width = nw;
          hs.height = nh;
          hs.tint = tint;
          hs.alpha = alpha;
        }
        used++;

        if (st.glow && playing) this.sparks.rect(x, hitY - 3, nw, 3).fill(tint);
      }
    }
    for (let i = used; i < this.pool.length; i++) this.pool[i].visible = false;
    for (let i = halos ? used : 0; i < this.haloPool.length; i++) this.haloPool[i].visible = false;

    for (const k of this.keys.values()) {
      const tint = active.get(k.rect.midi) ?? null;
      if (tint !== k.pressTint) { k.pressTint = tint; this.drawKey(k); }
    }
    this.renderLineFx(t);
    this.renderParticles(t);
  }
}
