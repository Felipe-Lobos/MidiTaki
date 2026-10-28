import { create } from 'zustand';

export type AudioStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

interface PlaybackState {
  time: number; // segundos. Única fuente de verdad del "ahora"
  playing: boolean;
  audioStatus: AudioStatus;
  muted: boolean; // silencio SOLO de la vista previa (no se guarda ni afecta al audio exportado)
  setTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
  setAudioStatus: (s: AudioStatus) => void;
  setMuted: (m: boolean) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  time: 0,
  playing: false,
  audioStatus: 'idle',
  muted: false,
  setTime: (time) => set({ time }),
  setPlaying: (playing) => set({ playing }),
  setAudioStatus: (audioStatus) => set({ audioStatus }),
  setMuted: (muted) => set({ muted }),
}));
