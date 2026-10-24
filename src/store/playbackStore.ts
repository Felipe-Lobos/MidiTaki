import { create } from 'zustand';

export type AudioStatus = 'idle' | 'loading' | 'ready' | 'fallback';

interface PlaybackState {
  time: number; // segundos. Única fuente de verdad del "ahora"
  playing: boolean;
  audioStatus: AudioStatus;
  setTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
  setAudioStatus: (s: AudioStatus) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  time: 0,
  playing: false,
  audioStatus: 'idle',
  setTime: (time) => set({ time }),
  setPlaying: (playing) => set({ playing }),
  setAudioStatus: (audioStatus) => set({ audioStatus }),
}));
