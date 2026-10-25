import { Application, Container, Graphics, NineSliceSprite, Rectangle, Texture } from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import type { Song } from '../core/midi/types';
import { buildKeyboardLayout, type KeyRange, type KeyRect } from '../core/keyboard/layout';
import { visibleNotes } from '../core/timeline/visibleNotes';
import type { Style } from '../core/style/schema';
import { hexToNum, lerpColor, noteTint } from '../core/colors/colorMapping';

interface KeyView { rect: KeyRect; g: Graphics; pressTint: number | null }

const gray = (v: number) => Math.round(255 * v) * 0x010101;

/** renderFrame(t) dibuja TODO en función del tiempo t (y del style actual). */
export class Scene {
  private app: Application;
  private style: Style;
  private fxLayer = new Container();   // halos + notas + destellos
  private haloLayer = new Container(); // brillo por nota (modo sincronizado)
  private notesLayer = new Container();
  private sparks = new Graphics();     // destello en la línea de impacto
  private keysLayer = new Container();
  private hitLine = new Graphics();
  private glowFilter: GlowFilter | null = null; // brillo de UN color (modo no sincronizado)
  private glowDistance = -1;
  private fxAllowed = true; // El EXPORT nunca lo desactiva: siempre calidad completa
  private pool: NineSliceSprite[] = [];
  private haloPool: NineSliceSprite[] = [];
  private keys = new Map<number, KeyView>();
  private texture!: Texture;
  private haloTex!: Texture;
  private haloPad = 0;
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
    app.stage.addChild(this.fxLayer, this.keysLayer, this.hitLine);
    this.w = app.screen.width;
    this.h = app.screen.height;
    this.buildTexture();
    this.rebuildKeys();
    this.applyFx();
  }

  /** Interruptor de rendimiento (solo vista previa). */
  setEffectsEnabled(on: boolean) {
    this.fxAllowed = on;
    this.applyFx();
    this.renderFrame(this.lastT);
  }

  setStyle(style: Style) {
    const old = this.style;
    this.style = style;
    this.app.renderer.background.color = style.background;
    if (old.noteRadius !== style.noteRadius || old.noteFill !== style.noteFill
      || old.outlineWidth !== style.outlineWidth || old.relief !== style.relief
      || old.glowRadius !== style.glowRadius) this.buildTexture();
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

  private get hitY() { return this.h * (1 - this.style.keyboardRatio); }
  private get inset() {
    const st = this.style;
    return Math.max(1, Math.round(Math.max(st.noteRadius, st.noteFill === 'outline' ? st.outlineWidth : 0)));
  }

  /** Textura blanca de la nota (9-slice, se tiñe con tint) + textura del halo. */
  private buildTexture() {
    for (const sp of this.pool) sp.destroy();
    this.pool = [];
    this.texture?.destroy(true);
    this.texRes = this.app.renderer.resolution;
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
    this.texture = this.app.renderer.generateTexture(g);
    g.destroy();
    this.buildHalo();
  }

  /** Halo suave: capas concéntricas con poca opacidad (sin filtros → barato y con el color de cada nota). */
  private buildHalo() {
    for (const sp of this.haloPool) sp.destroy();
    this.haloPool = [];
    this.haloTex?.destroy(true);
    const { noteRadius: r, glowRadius } = this.style;
    const pad = Math.max(2, Math.round(glowRadius));
    const s = this.inset * 4;
    const N = 10, a = 0.1;
    const g = new Graphics();
    for (let k = N; k >= 1; k--) {
      const d = (pad * k) / N;
      g.roundRect(pad - d, pad - d, s + 2 * d, s + 2 * d, r + d).fill({ color: 0xffffff, alpha: a });
      g.roundRect(pad + 0.5, pad + 0.5, s - 1, s - 1, Math.max(r - 0.5, 0)).cut(); // el interior de la nota no brilla
    }
    this.haloTex = this.app.renderer.generateTexture(g);
    g.destroy();
    this.haloPad = pad;
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
    this.hitLine.clear();
    if (this.style.showHitLine)
      this.hitLine.rect(0, this.hitY - 1, this.w, 2).fill(hexToNum(this.style.hitLineColor));
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
      const e = this.inset + this.haloPad;
      const sp = new NineSliceSprite({ texture: this.haloTex, leftWidth: e, rightWidth: e, topHeight: e, bottomHeight: e });
      sp.blendMode = 'add';
      this.haloLayer.addChild(sp);
      this.haloPool[i] = sp;
    }
    return this.haloPool[i];
  }

  renderFrame(t: number) {
    this.lastT = t;
    const st = this.style;
    const hitY = this.hitY;
    const pxPerSec = hitY / st.fallSeconds;
    const span = Math.max(1, this.range.high - this.range.low);
    const active = new Map<number, number>(); // midi → color de la tecla pulsada
    const halos = this.haloOn;
    const pad = this.haloPad;
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
          hs.position.set(x - pad, ny - pad);
          hs.width = nw + 2 * pad;
          hs.height = nh + 2 * pad;
          hs.tint = tint;
          hs.alpha = Math.min(1, st.glowStrength / 1.5) * alpha;
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
  }
}
