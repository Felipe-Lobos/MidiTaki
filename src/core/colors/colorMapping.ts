import type { Style } from '../style/schema';

export const hexToNum = (hex: string) => parseInt(hex.slice(1), 16);

export function lerpColor(a: number, b: number, t: number): number {
  const ch = (shift: number) => {
    const x = (a >> shift) & 255, y = (b >> shift) & 255;
    return Math.round(x + (y - x) * t);
  };
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/** Color de una nota según el modo elegido. `pos` = 0 (grave) … 1 (agudo). */
export function noteTint(style: Style, pos: number): number {
  const a = hexToNum(style.noteColor);
  return style.colorMode === 'pitch' ? lerpColor(a, hexToNum(style.noteColor2), pos) : a;
}
