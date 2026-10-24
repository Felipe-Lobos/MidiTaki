import { Application, Container, Graphics, NineSliceSprite, Texture } from 'pixi.js';
import type { Song } from '../core/midi/types';
import { buildKeyboardLayout, type KeyRange, type KeyRect } from '../core/keyboard/layout';
import { visibleNotes } from '../core/timeline/visibleNotes';
import type { Style } from '../core/style/schema';
import { hexToNum, noteTint } from '../core/colors/colorMapping';

interface KeyView { rect: KeyRect; g: Graphics; pressed: boolean }

/** renderFrame(t) dibuja TODO en función del tiempo t (y del style actual). */
export class Scene {
  private app: Application;
  private style: Style;
  private notesLayer = new Container();
  private keysLayer = new Container();
  private hitLine = new Graphics();
  private pool: NineSliceSprite[] = [];
  private keys = new Map<number, KeyView>();
  private texture!: Texture;

  private song: Song | null = null;
  private range: KeyRange = { low: 21, high: 108 };
  private w: number;
  private h: number;
  private lastT = 0;

  constructor(app: Application, style: Style) {
    this.app = app;
    this.style = style;
    app.stage.addChild(this.notesLayer, this.keysLayer, this.hitLine);
    this.buildTexture();
    this.w = app.screen.width;
    this.h = app.screen.height;
    this.rebuildKeys();
  }

  /** Se llama cada vez que el usuario toca un control. */
  setStyle(style: Style) {
    const radiusChanged = style.noteRadius !== this.style.noteRadius;
    this.style = style;
    this.app.renderer.background.color = style.background;
    if (radiusChanged) this.buildTexture();
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
    this.rebuildKeys();
    this.renderFrame(this.lastT);
  }

  private get hitY() { return this.h * (1 - this.style.keyboardRatio); }
  private get inset() { return Math.max(1, Math.round(this.style.noteRadius)); }

  // Una textura redondeada por radio; los sprites la estiran (9-slice) y se tiñen
  private buildTexture() {
    for (const sp of this.pool) sp.destroy();
    this.pool = [];
    this.texture?.destroy(true);
    const r = this.style.noteRadius, s = this.inset * 4;
    const g = new Graphics().roundRect(0, 0, s, s, r).fill(0xffffff);
    this.texture = this.app.renderer.generateTexture(g);
    g.destroy();
  }

  private rebuildKeys() {
    this.keysLayer.removeChildren().forEach((c) => c.destroy());
    this.keys.clear();
    const layout = buildKeyboardLayout(this.range, this.w);
    for (const rect of [...layout.filter((k) => !k.black), ...layout.filter((k) => k.black)]) {
      const g = new Graphics();
      this.keysLayer.addChild(g);
      const view = { rect, g, pressed: false };
      this.keys.set(rect.midi, view);
      this.drawKey(view);
    }
    this.hitLine.clear();
    if (this.style.showHitLine)
      this.hitLine.rect(0, this.hitY - 1, this.w, 2).fill(hexToNum(this.style.hitLineColor));
  }

  private drawKey(k: KeyView) {
    const s = this.style;
    const { x, w, black } = k.rect;
    const keyH = this.h - this.hitY;
    const color = hexToNum(k.pressed ? s.pressedColor : black ? s.blackKey : s.whiteKey);
    k.g.clear();
    if (black) k.g.roundRect(x, this.hitY, w, keyH * 0.62, 3).fill(color);
    else k.g.roundRect(x + 0.5, this.hitY, w - 1, keyH, 3).fill(color);
  }

  private getSprite(i: number): NineSliceSprite {
    if (!this.pool[i]) {
      const r = this.inset;
      const sp = new NineSliceSprite({
        texture: this.texture, leftWidth: r, rightWidth: r, topHeight: r, bottomHeight: r,
      });
      this.notesLayer.addChild(sp);
      this.pool[i] = sp;
    }
    return this.pool[i];
  }

  renderFrame(t: number) {
    this.lastT = t;
    const st = this.style;
    const hitY = this.hitY;
    const pxPerSec = hitY / st.fallSeconds;
    const span = Math.max(1, this.range.high - this.range.low);
    const active = new Set<number>();
    let used = 0;

    if (this.song) {
      for (const n of visibleNotes(this.song, t, t + st.fallSeconds)) {
        const key = this.keys.get(n.midi);
        if (!key) continue; // fuera del rango del teclado
        const end = n.start + n.duration;
        if (n.start <= t && t < end) active.add(n.midi);

        const bottom = Math.min(hitY, hitY - (n.start - t) * pxPerSec);
        const top = hitY - (end - t) * pxPerSec;
        const height = bottom - top;
        if (height <= 0) continue;

        const sp = this.getSprite(used++);
        sp.visible = true;
        sp.position.set(key.rect.x + st.noteGap / 2, top);
        sp.width = Math.max(key.rect.w - st.noteGap, 1);
        sp.height = Math.max(height - st.noteGap, 2);
        sp.tint = noteTint(st, (n.midi - this.range.low) / span);
        sp.alpha = st.noteOpacity * (st.velocityOpacity ? 0.55 + 0.45 * n.velocity : 1);
      }
    }
    for (let i = used; i < this.pool.length; i++) this.pool[i].visible = false;

    for (const k of this.keys.values()) {
      const pressed = active.has(k.rect.midi);
      if (pressed !== k.pressed) { k.pressed = pressed; this.drawKey(k); }
    }
  }
}
