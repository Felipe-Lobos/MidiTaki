import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultStyle, type Style } from '../core/style/schema';
import { sanitizeStyle } from '../core/style/presetIO';

interface StyleState {
  style: Style;
  patch: (p: Partial<Style>) => void;      // cambia algunos campos
  apply: (s: Partial<Style>) => void;      // reemplaza todo (sobre los valores por defecto)
  reset: () => void;
}

export const useStyleStore = create<StyleState>()(
  persist(
    (set) => ({
      style: defaultStyle,
      patch: (p) => set((s) => ({ style: { ...s.style, ...p } })),
      apply: (s) => set({ style: sanitizeStyle({ ...defaultStyle, ...s }) }),
      reset: () => set({ style: defaultStyle }),
    }),
    {
      name: 'miditaki:style',
      version: 1,
      partialize: (s) => ({ style: s.style }),
      // Lo guardado pasa siempre por sanitizeStyle: un valor corrupto o de otra versión no rompe la app
      merge: (persisted, current) => ({
        ...current,
        style: sanitizeStyle((persisted as { style?: unknown } | undefined)?.style),
      }),
    },
  ),
);
