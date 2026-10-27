import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VideoFormat } from '../core/format';

// Ajustes del EDITOR (no del estilo): no forman parte de los presets.
const DEFAULTS = {
  previewFx: true,                         // false = sin glow en la vista previa. El export lo ignora.
  format: 'landscape' as VideoFormat,      // horizontal / vertical
  volume: 1,                               // volumen general: afecta al preview Y al audio exportado
  previewLeadTail: false,                  // la vista previa incluye la entrada y la cola del video
};

interface SettingsState {
  previewFx: boolean;
  format: VideoFormat;
  volume: number;
  previewLeadTail: boolean;
  setPreviewFx: (b: boolean) => void;
  setFormat: (f: VideoFormat) => void;
  setVolume: (v: number) => void;
  setPreviewLeadTail: (b: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setPreviewFx: (previewFx) => set({ previewFx }),
      setFormat: (format) => set({ format }),
      setVolume: (volume) => set({ volume }),
      setPreviewLeadTail: (previewLeadTail) => set({ previewLeadTail }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'miditaki:settings',
      version: 1,
      partialize: (s) => ({ previewFx: s.previewFx, format: s.format, volume: s.volume, previewLeadTail: s.previewLeadTail }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<typeof DEFAULTS>;
        return {
          ...current,
          previewFx: typeof p.previewFx === 'boolean' ? p.previewFx : DEFAULTS.previewFx,
          format: p.format === 'portrait' ? 'portrait' : 'landscape',
          volume: typeof p.volume === 'number' && isFinite(p.volume) ? Math.min(1.5, Math.max(0, p.volume)) : DEFAULTS.volume,
          previewLeadTail: typeof p.previewLeadTail === 'boolean' ? p.previewLeadTail : DEFAULTS.previewLeadTail,
        };
      },
    },
  ),
);
