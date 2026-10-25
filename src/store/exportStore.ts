import { create } from 'zustand';
import type { ExportResolution } from '../core/format.ts';
import type { ExportSupport } from '../export/capabilities';

export type ExportQuality = 'normal' | 'high' | 'max';
export type ExportPhase = 'idle' | 'running' | 'done' | 'error' | 'canceled';

interface ExportState {
  open: boolean;
  phase: ExportPhase;
  resolution: ExportResolution;
  quality: ExportQuality;
  leadIn: number;   // s antes de la primera nota (las notas caen desde arriba)
  tail: number;     // s después de la última nota
  support: ExportSupport | null;
  progress: { frame: number; total: number; fps: number; etaSec: number };
  message: string | null;
  patch: (p: Partial<ExportState>) => void;
  openDialog: (leadIn: number) => void;
  close: () => void;
}

export const useExportStore = create<ExportState>((set) => ({
  open: false,
  phase: 'idle',
  resolution: 1080,
  quality: 'high',
  leadIn: 3,
  tail: 2,
  support: null,
  progress: { frame: 0, total: 0, fps: 0, etaSec: 0 },
  message: null,
  patch: (p) => set(p),
  openDialog: (leadIn) => set({ open: true, phase: 'idle', message: null, leadIn }),
  close: () => set({ open: false }),
}));
