import { create } from 'zustand';

export const TABS = ['notes', 'keyboard', 'scene', 'effects', 'audio', 'presets'] as const;
export type Tab = (typeof TABS)[number];

/** Por debajo de este ancho el panel pasa a ir debajo del canvas (móvil / tablet vertical). */
export const MOBILE_QUERY = '(max-width: 800px)';
const isMobile = () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;

interface UiState {
  panelOpen: boolean;
  tab: Tab;
  setTab: (tab: Tab) => void;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  openTab: (tab: Tab) => void; // abre el panel (si estaba cerrado) y va a esa pestaña
}

// Estado de la interfaz: no se guarda. En móvil el panel empieza cerrado para dejar sitio al canvas.
export const useUiStore = create<UiState>((set) => ({
  panelOpen: !isMobile(),
  tab: 'notes',
  setTab: (tab) => set({ tab }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  openTab: (tab) => set({ tab, panelOpen: true }),
}));
