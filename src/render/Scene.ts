import { Application, Container, Graphics, NineSliceSprite, Texture } from 'pixi.js';
import type { Song } from '../core/midi/types';
import { buildKeyboardLayout, type KeyRange, type KeyRect } from '../core/keyboard/layout';
import { visibleNotes } from '../core/timeline/visibleNotes';
import type { Style } from '../core/style/schema';

interface KeyView { rect: KeyRect; g: Graphics; pressed: boolean }

/**
 * Regla de oro: renderFrame(t) dibuja TODO en función del tiempo t.
 * No usa deltas ni el ticker. Así el export a video será exacto.
 */
export class Scene {
  private notesLayer = new Container();
  private keysLayer = new Container();
  private hitLine = new Graphics();
  private pool: NineSliceSprite[] = [];
  private keys = new Map<number, KeyView>();
  private texture: Texture;

  private song: Song | null = null;
  private range: KeyRange = { low: 21, high: 108 };
  private w: number;
  private h: number;
  private lastT = 0;
  private style: Style;

  constructor(app: Application, style: Style) {
    this.style = style;
    app.stage.addChild(this.notesLayer, this.keysLayer, this.hitLine);

    // Una sola textura de rectángulo redondeado, estirable sin deformar esquinas
    const r = style.noteRadius;
    const g = new Graphics().roundRect(0, 0, r * 4, r * 4, r).fill(0xffffff);
    this.texture = app.renderer.generateTexture(g);
    g.destroy();

    this.w = app.screen.width;
    this.h = app.screen.height;
    this.rebuildKeys();
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

  private get hitY() {
    return this.h * (1 - this.style.keyboardRatio);
  }

  private rebuildKeys() {
    this.keysLayer.removeChildren().forEach((c) => c.destroy());
    this.keys.clear();
    const layout = buildKeyboardLayout(this.range, this.w);
    // Blancas primero, negras encima
    for (const rect of [...layout.filter((k) => !k.black), ...layout.filter((k) => k.black)]) {
      const g = new Graphics();
      this.keysLayer.addChild(g);
      const view = { rect, g, pressed: false };
      this.keys.set(rect.midi, view);
      this.drawKey(view);
    }
    this.hitLine.clear().rect(0, this.hitY - 1, this.w, 2).fill(this.style.hitLineColor);
  }

  private drawKey(k: KeyView) {
    const s = this.style;
    const { x, w, black } = k.rect;
    const keyH = this.h - this.hitY;
    const color = k.pressed ? s.pressedColor : black ? s.blackKey : s.whiteKey;
    k.g.clear();
    if (black) k.g.roundRect(x, this.hitY, w, keyH * 0.62, 3).fill(color);
    else k.g.roundRect(x + 0.5, this.hitY, w - 1, keyH, 3).fill(color);
  }

  private getSprite(i: number): NineSliceSprite {
    if (!this.pool[i]) {
      const r = this.style.noteRadius;
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
    const { fallSeconds, noteColor } = this.style;
    const hitY = this.hitY;
    const pxPerSec = hitY / fallSeconds;
    const active = new Set<number>();
    let used = 0;

    if (this.song) {
      for (const n of visibleNotes(this.song, t, t + fallSeconds)) {
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
        sp.position.set(key.rect.x + 1, top);
        sp.width = Math.max(key.rect.w - 2, 1);
        sp.height = Math.max(height - 1, 2);
        sp.tint = noteColor;
        sp.alpha = 0.55 + 0.45 * n.velocity;
      }
    }
    for (let i = used; i < this.pool.length; i++) this.pool[i].visible = false;

    // Teclas: solo se redibujan si cambian de estado
    for (const k of this.keys.values()) {
      const pressed = active.has(k.rect.midi);
      if (pressed !== k.pressed) { k.pressed = pressed; this.drawKey(k); }
    }
  }
}
