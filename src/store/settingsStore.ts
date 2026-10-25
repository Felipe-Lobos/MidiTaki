import { create } from 'zustand';
import type { VideoFormat } from '../core/format';

// Ajustes del EDITOR (no del estilo): no forman parte de los presets.
interface SettingsState {
  previewFx: boolean;        // false = sin glow en la vista previa. El export lo ignora.
  format: VideoFormat;       // horizontal / vertical
  volume: number;            // volumen general: afecta al preview Y al audio exportado
  previewLeadTail: boolean;  // la vista previa incluye la entrada y la cola del video
  setPreviewFx: (b: boolean) => void;
  setFormat: (f: VideoFormat) => void;
  setVolume: (v: number) => void;
  setPreviewLeadTail: (b: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  previewFx: true,
  format: 'landscape',
  volume: 1,
  previewLeadTail: false,
  setPreviewFx: (previewFx) => set({ previewFx }),
  setFormat: (format) => set({ format }),
  setVolume: (volume) => set({ volume }),
  setPreviewLeadTail: (previewLeadTail) => set({ previewLeadTail }),
}));
