import { create } from 'zustand';
import { defaultStyle, type Style } from '../core/style/schema';
import { sanitizeStyle } from '../core/style/presetIO';

interface StyleState {
  style: Style;
  patch: (p: Partial<Style>) => void;      // cambia algunos campos
  apply: (s: Partial<Style>) => void;      // reemplaza todo (sobre los valores por defecto)
  reset: () => void;
}

export const useStyleStore = create<StyleState>((set) => ({
  style: defaultStyle,
  patch: (p) => set((s) => ({ style: { ...s.style, ...p } })),
  apply: (s) => set({ style: sanitizeStyle({ ...defaultStyle, ...s }) }),
  reset: () => set({ style: defaultStyle }),
}));
