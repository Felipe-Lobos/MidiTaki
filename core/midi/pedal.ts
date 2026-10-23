import type { Note } from './types';

export interface PedalInterval { down: number; up: number }
interface CC { time: number; value: number } // value normalizado 0-1

/** Convierte los eventos CC64 en intervalos "pedal pisado". */
export function buildPedalIntervals(events: CC[], endTime: number): PedalInterval[] {
  const sorted = [...events].sort((a, b) => a.time - b.time);
  const out: PedalInterval[] = [];
  let down: number | null = null;
  for (const e of sorted) {
    if (e.value >= 0.5 && down === null) down = e.time;
    else if (e.value < 0.5 && down !== null) { out.push({ down, up: e.time }); down = null; }
  }
  if (down !== null) out.push({ down, up: Math.max(endTime, down) });
  return out;
}

/** Si el pedal está pisado cuando termina la nota, esta sigue sonando hasta soltarlo. */
export function applyPedal(notes: Note[], pedal: PedalInterval[]): void {
  for (const n of notes) {
    const end = n.start + n.duration;
    let lo = 0, hi = pedal.length;
    while (lo < hi) {            // último intervalo con down <= end
      const mid = (lo + hi) >> 1;
      if (pedal[mid].down <= end) lo = mid + 1; else hi = mid;
    }
    const p = pedal[lo - 1];
    n.soundDuration = p && end < p.up ? p.up - n.start : n.duration;
  }
}
