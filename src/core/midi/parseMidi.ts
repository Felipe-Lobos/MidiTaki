import { Midi } from '@tonejs/midi';
import type { Note, Song } from './types';

export async function parseMidi(file: File): Promise<Song> {
  const midi = new Midi(await file.arrayBuffer());
  const notes: Note[] = [];

  for (const track of midi.tracks) {
    if (track.instrument.percussion) continue; // ignora batería
    for (const n of track.notes) {
      // @tonejs/midi ya entrega "time" y "duration" en SEGUNDOS
      notes.push({ midi: n.midi, start: n.time, duration: n.duration, velocity: n.velocity });
    }
  }
  if (notes.length === 0) throw new Error('El archivo no contiene notas.');

  notes.sort((a, b) => a.start - b.start);

  let lowest = 127, highest = 0, duration = 0, maxNoteDuration = 0;
  for (const n of notes) {
    lowest = Math.min(lowest, n.midi);
    highest = Math.max(highest, n.midi);
    duration = Math.max(duration, n.start + n.duration); //util para comprar la ultima nota y su duracion, creo
    maxNoteDuration = Math.max(maxNoteDuration, n.duration);
  }
  return { notes, duration, lowest, highest, maxNoteDuration };
}
