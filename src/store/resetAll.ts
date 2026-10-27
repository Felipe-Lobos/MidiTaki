import { useStyleStore } from './styleStore';
import { useSettingsStore } from './settingsStore';
import { useSongStore } from './songStore';
import { useExportStore } from './exportStore';
import { notify } from './noticeStore.ts';
import { t } from '../i18n';

/** Vuelve a los valores de fábrica (estilo, ajustes, teclado y opciones de export). */
export function resetAll() {
  useStyleStore.getState().reset();
  useSettingsStore.getState().reset();
  useSongStore.getState().setRangeKey('auto');
  useExportStore.getState().patch({ resolution: 1080, withAudio: true, tail: 2 });
  notify({ id: 'reset', level: 'info', text: t.notices.restored, timeoutMs: 4000 });
}
