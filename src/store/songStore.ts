import { create } from 'zustand';
import type { Song } from '../core/midi/types';
import { parseMidi } from '../core/midi/parseMidi';
import { autoRange, KEYBOARDS, type KeyRange } from '../core/keyboard/layout';

interface SongState {
  song: Song | null;
  fileName: string;
  error: string | null;
  rangeKey: string; // 'auto' | '88' | '76' | ...
  range: KeyRange;
  loadFile: (file: File) => Promise<void>;
  setRangeKey: (key: string) => void;
}

const resolve = (key: string, song: Song | null): KeyRange =>
  key === 'auto' && song ? autoRange(song) : KEYBOARDS[key] ?? KEYBOARDS['88'];

export const useSongStore = create<SongState>((set, get) => ({
  song: null,
  fileName: '',
  error: null,
  rangeKey: 'auto',
  range: KEYBOARDS['88'],

  loadFile: async (file) => {
    try {
      const song = await parseMidi(file);
      console.log('Song cargada:', song); // Hito 1: míralo en la consola (F12)
      set({ song, fileName: file.name, error: null, range: resolve(get().rangeKey, song) });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'No se pudo leer el MIDI.' });
    }
  },

  setRangeKey: (key) => set({ rangeKey: key, range: resolve(key, get().song) }),
}));
