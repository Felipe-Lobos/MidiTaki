import { transport } from './Transport';
import { useSongStore } from '../store/songStore';

export const isMidiFile = (f: File) => /\.(mid|midi)$/i.test(f.name) || /^audio\/(x-)?midi?$/.test(f.type);

/** Punto único de entrada para cargar un MIDI (botón, tarjeta inicial o arrastrar y soltar). */
export function openMidi(file: File): Promise<void> {
  transport.init().catch(() => {}); // prepara el audio y descarga el piano mientras se lee el archivo
  return useSongStore.getState().loadFile(file);
}
