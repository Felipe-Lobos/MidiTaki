import { create } from 'zustand';

// Ajustes del EDITOR (no del video): no forman parte de Style ni de los presets.
interface SettingsState {
  previewFx: boolean; // false = sin glow en la vista previa (para equipos lentos). El export lo ignora.
  setPreviewFx: (b: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  previewFx: true,
  setPreviewFx: (previewFx) => set({ previewFx }),
}));
