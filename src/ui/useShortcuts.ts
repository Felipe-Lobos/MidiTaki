import { useEffect, useRef } from 'react';
import { transport } from '../playback/Transport';
import { usePlaybackStore } from '../store/playbackStore';
import { useSongStore } from '../store/songStore';
import { useExportStore } from '../store/exportStore';

const SEEK_SMALL = 2;  // s con ← →
const SEEK_BIG = 10;   // s con Shift + ← →

const TEXT_INPUTS = new Set(['text', 'number', 'search', 'email', 'url', 'tel', 'password']);

/** Campos donde las teclas son para escribir o elegir (no son atajos). */
function ownsKeys(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  return el instanceof HTMLInputElement && TEXT_INPUTS.has(el.type);
}

/**
 * Atajos globales: Espacio = play/pausa, ← → = retroceder/avanzar (Shift: más), M = silenciar.
 * `enabled` = false los desactiva (p. ej. con un diálogo abierto).
 */
export function useShortcuts(enabled: boolean) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const active = (e: KeyboardEvent) =>
      enabledRef.current && !useExportStore.getState().open && !e.ctrlKey && !e.metaKey && !e.altKey && !ownsKeys(e.target);

    const onKeyDown = (e: KeyboardEvent) => {
      if (!active(e)) return;
      switch (e.code) {
        case 'Space': {
          e.preventDefault(); // evita el scroll y que un botón enfocado se "pulse" a la vez
          if (e.repeat) return;
          const { song } = useSongStore.getState();
          if (song && usePlaybackStore.getState().audioStatus !== 'loading') void transport.toggle();
          break;
        }
        case 'ArrowLeft':
        case 'ArrowRight': {
          // En la barra de tiempo (input range) las flechas ya mueven el valor de forma nativa
          if (e.target instanceof HTMLInputElement && e.target.type === 'range') return;
          if (!useSongStore.getState().song) return;
          e.preventDefault();
          const step = (e.shiftKey ? SEEK_BIG : SEEK_SMALL) * (e.code === 'ArrowLeft' ? -1 : 1);
          transport.seek(usePlaybackStore.getState().time + step);
          break;
        }
        case 'KeyM': {
          if (e.repeat) return;
          const { muted, setMuted } = usePlaybackStore.getState();
          setMuted(!muted);
          break;
        }
      }
    };

    // Un botón enfocado se activa con Espacio al SOLTAR la tecla: se cancela ahí también
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && active(e)) e.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
}
