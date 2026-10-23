import { create } from 'zustand';

interface PlaybackState {
  time: number; // segundos. Única fuente de verdad del "ahora"
  setTime: (t: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  time: 0,
  setTime: (time) => set({ time }),
}));
