import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song } from '../core/midi/types';
import { parseMidi } from '../core/midi/parseMidi';
import { MidiError } from '../core/midi/errors.ts';
import { autoRange, KEYBOARDS, type KeyRange } from '../core/keyboard/layout';
import { notify, useNoticeStore } from './noticeStore.ts';
import { t } from '../i18n';

const LONG_SONG_SECONDS = 15 * 60;

interface SongState {
  song: Song | null;
  fileName: string;
  rangeKey: string; // 'auto' | '88' | '76' | ...
  range: KeyRange;
  loadFile: (file: File) => Promise<void>;
  setRangeKey: (key: string) => void;
}

const resolve = (key: string, song: Song | null): KeyRange =>
  key === 'auto' && song ? autoRange(song) : KEYBOARDS[key] ?? KEYBOARDS['88'];

export const useSongStore = create<SongState>()(
  persist(
    (set, get) => ({
      song: null,
      fileName: '',
      rangeKey: 'auto',
      range: KEYBOARDS['88'],

      loadFile: async (file) => {
        useNoticeStore.getState().dismiss('midi-error');
        try {
          const song = await parseMidi(file);
          set({ song, fileName: file.name, range: resolve(get().rangeKey, song) });
          if (song.duration > LONG_SONG_SECONDS)
            notify({ id: 'long-song', level: 'warn', text: t.notices.longSong(Math.round(song.duration / 60)), timeoutMs: 12000 });
        } catch (e) {
          const code = e instanceof MidiError ? e.code : 'unknown';
          if (!(e instanceof MidiError)) console.error('[midi] error inesperado:', e);
          notify({ id: 'midi-error', level: 'error', text: t.notices.midi[code] });
        }
      },

      setRangeKey: (key) => set({ rangeKey: key, range: resolve(key, get().song) }),
    }),
    {
      name: 'miditaki:keyboard',
      version: 1,
      partialize: (s) => ({ rangeKey: s.rangeKey }),
      merge: (persisted, current) => {
        const key = (persisted as { rangeKey?: unknown } | undefined)?.rangeKey;
        const rangeKey = typeof key === 'string' && (key === 'auto' || key in KEYBOARDS) ? key : 'auto';
        return { ...current, rangeKey, range: resolve(rangeKey, null) };
      },
    },
  ),
);
