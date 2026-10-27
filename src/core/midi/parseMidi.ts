import { Midi } from '@tonejs/midi';
import type { Note, Song } from './types';
import { MidiError } from './errors';
import { applyPedal, buildPedalIntervals } from './pedal';

export async function parseMidi(file: File): Promise<Song> {
  if (file.size > 10 * 1024 * 1024) throw new MidiError('tooLarge');
  let midi: Midi;
  try {
    midi = new Midi(await file.arrayBuffer());
  } catch {
    throw new MidiError('invalid');
  }
  const notes: Note[] = [];
  let percussionNotes = 0;
  const pedalEvents: { time: number; value: number }[] = [];

  for (const track of midi.tracks) {
    if (track.instrument.percussion) { percussionNotes += track.notes.length; continue; } // ignora batería
    for (const n of track.notes) {
      notes.push({
        midi: n.midi, start: n.time, duration: n.duration,
        soundDuration: n.duration, velocity: n.velocity,
      });
    }
    for (const cc of track.controlChanges[64] ?? []) pedalEvents.push(cc); // CC64 = sustain
  }
  if (notes.length === 0) throw new MidiError(percussionNotes > 0 ? 'drumsOnly' : 'empty');

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
