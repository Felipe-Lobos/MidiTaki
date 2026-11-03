import { t } from '../i18n';

export type NoteNameFormat = 'solfege' | 'letters';

/** Nombre de una nota MIDI sin octava, con sostenidos (Do#, C#…). */
export function noteLabel(midi: number, format: NoteNameFormat): string {
  return t.noteNames[format][((midi % 12) + 12) % 12];
}
