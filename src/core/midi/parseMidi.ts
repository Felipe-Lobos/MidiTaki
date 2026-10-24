import { Midi } from '@tonejs/midi';
import type { Note, Song } from './types';
import { applyPedal, buildPedalIntervals } from './pedal.ts';

export async function parseMidi(file: File): Promise<Song> {
  const midi = new Midi(await file.arrayBuffer());
  const notes: Note[] = [];
  const pedalEvents: { time: number; value: number }[] = [];

  for (const track of midi.tracks) {
    if (track.instrument.percussion) continue; // ignora batería
    for (const n of track.notes) {
      notes.push({
        midi: n.midi, start: n.time, duration: n.duration,
        soundDuration: n.duration, velocity: n.velocity,
      });
    }
    for (const cc of track.controlChanges[64] ?? []) pedalEvents.push(cc); // CC64 = sustain
  }
  if (notes.length === 0) throw new Error('El archivo no contiene notas.');

  notes.sort((a, b) => a.start - b.start);
  applyPedal(notes, buildPedalIntervals(pedalEvents, midi.duration));

  let lowest = 127, highest = 0, duration = 0, maxNoteDuration = 0;
  for (const n of notes) {
    lowest = Math.min(lowest, n.midi);
    highest = Math.max(highest, n.midi);
    duration = Math.max(duration, n.start + n.duration);
    maxNoteDuration = Math.max(maxNoteDuration, n.duration);
  }
  return { notes, duration, lowest, highest, maxNoteDuration };
}
