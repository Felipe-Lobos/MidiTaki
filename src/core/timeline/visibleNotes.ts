import type { Note, Song } from '../midi/types';

/** Notas que se solapan con el intervalo [from, to]. Usa búsqueda binaria. */
export function visibleNotes(song: Song, from: number, to: number): Note[] {
  const { notes, maxNoteDuration } = song;
  // Primera nota que PODRÍA seguir sonando en "from"
  const minStart = from - maxNoteDuration;
  let lo = 0, hi = notes.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (notes[mid].start < minStart) lo = mid + 1;
    else hi = mid;
  }
  const out: Note[] = [];
  for (let i = lo; i < notes.length && notes[i].start < to; i++) {
    if (notes[i].start + notes[i].duration > from) out.push(notes[i]);
  }
  return out;
}
