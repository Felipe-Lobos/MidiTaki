import { create } from 'zustand';
import type { VideoFormat } from '../core/format.ts';

// Ajustes del EDITOR (no del estilo): no forman parte de los presets.
interface SettingsState {
  previewFx: boolean;   // false = sin glow en la vista previa. El export lo ignora.
  format: VideoFormat;  // horizontal / vertical
  setPreviewFx: (b: boolean) => void;
  setFormat: (f: VideoFormat) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  previewFx: true,
  format: 'landscape',
  setPreviewFx: (previewFx) => set({ previewFx }),
  setFormat: (format) => set({ format }),
}));
