import { useEffect, useState } from 'react';
import { isMidiFile, openMidi } from '../playback/openMidi';
import { useExportStore } from '../store/exportStore';
import { notify } from '../store/noticeStore';
import { t } from '../i18n';

const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

/**
 * Arrastrar y soltar un MIDI en cualquier parte de la ventana (también si ya hay una canción: la reemplaza).
 * Devuelve true mientras se arrastra un archivo sobre la página, para mostrar el aviso.
 */
export function useMidiDrop(): boolean {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let depth = 0; // dragenter/dragleave se disparan también al cruzar elementos hijos
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth++;
      setDragging(true);
    };
    const over = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); // sin esto el navegador no permite soltar
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); // evita que el navegador abra el archivo y salga de la página
      depth = 0;
      setDragging(false);
      if (useExportStore.getState().open) return; // no cambiar de canción mientras se exporta
      const files = Array.from(e.dataTransfer?.files ?? []);
      const midi = files.find(isMidiFile);
      if (midi) void openMidi(midi);
      else if (files.length) notify({ id: 'not-midi', level: 'warn', text: t.notices.notMidi, timeoutMs: 6000 });
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragover', over);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop);
    };
  }, []);

  return dragging;
}
