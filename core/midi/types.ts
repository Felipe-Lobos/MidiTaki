export interface Note {
  midi: number;          // 0-127 (60 = Do central)
  start: number;         // segundos
  duration: number;      // segundos escritos en el MIDI  → lo que se DIBUJA
  soundDuration: number; // segundos con pedal sustain     → lo que SUENA
  velocity: number;      // 0-1
}

export interface Song {
  notes: Note[];          // ordenadas por start
  duration: number;       // segundos totales
  lowest: number;         // nota más grave
  highest: number;        // nota más aguda
  maxNoteDuration: number;
}
