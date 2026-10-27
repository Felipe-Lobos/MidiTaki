import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExportResolution } from '../core/format';
import type { ExportSupport } from '../export/capabilities';

export type ExportPhase = 'idle' | 'running' | 'done' | 'error' | 'canceled';

interface ExportState {
  open: boolean;
  phase: ExportPhase;
  stage: 'audio' | 'video';
  resolution: ExportResolution;
  withAudio: boolean; // recuerda la última elección
  leadIn: number;     // s antes de la primera nota (las notas caen desde arriba)
  tail: number;       // s mínimos después de la última nota
  support: ExportSupport | null;
  progress: { frame: number; total: number; fps: number; etaSec: number };
  message: string | null;
  patch: (p: Partial<ExportState>) => void;
  openDialog: (leadIn: number) => void;
  close: () => void;
}

export const useExportStore = create<ExportState>()(
  persist(
    (set) => ({
      open: false,
      phase: 'idle',
      stage: 'video',
      resolution: 1080,
      withAudio: true,
      leadIn: 3,
      tail: 2,
      support: null,
      progress: { frame: 0, total: 0, fps: 0, etaSec: 0 },
      message: null,
      patch: (p) => set(p),
      openDialog: (leadIn) => set({ open: true, phase: 'idle', message: null, leadIn }),
      close: () => set({ open: false }),
    }),
    {
      name: 'miditaki:export',
      version: 1,
      partialize: (s) => ({ resolution: s.resolution, withAudio: s.withAudio, tail: s.tail }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as { resolution?: unknown; withAudio?: unknown; tail?: unknown };
        return {
          ...current,
          resolution: p.resolution === 720 ? 720 : 1080,
          withAudio: typeof p.withAudio === 'boolean' ? p.withAudio : true,
          tail: typeof p.tail === 'number' && isFinite(p.tail) ? Math.min(10, Math.max(0, p.tail)) : 2,
        };
      },
    },
  ),
);
