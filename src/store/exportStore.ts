import { create } from 'zustand';
import type { ExportResolution } from '../core/format';
import type { ExportSupport } from '../export/capabilities';

export type ExportQuality = 'normal' | 'high' | 'max';
export type ExportPhase = 'idle' | 'running' | 'done' | 'error' | 'canceled';

const KEY = 'midi-fall:withAudio';
const loadWithAudio = () => { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } };
const saveWithAudio = (v: boolean) => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* sin almacenamiento */ } };

interface ExportState {
  open: boolean;
  phase: ExportPhase;
  stage: 'audio' | 'video';
  resolution: ExportResolution;
  quality: ExportQuality;
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

export const useExportStore = create<ExportState>((set) => ({
  open: false,
  phase: 'idle',
  stage: 'video',
  resolution: 1080,
  quality: 'high',
  withAudio: loadWithAudio(),
  leadIn: 3,
  tail: 2,
  support: null,
  progress: { frame: 0, total: 0, fps: 0, etaSec: 0 },
  message: null,
  patch: (p) => {
    if (p.withAudio !== undefined) saveWithAudio(p.withAudio);
    set(p);
  },
  openDialog: (leadIn) => set({ open: true, phase: 'idle', message: null, leadIn }),
  close: () => set({ open: false }),
}));
