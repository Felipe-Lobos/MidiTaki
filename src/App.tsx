import { useEffect } from 'react';
import { PreviewCanvas } from './ui/canvas/PreviewCanvas';
import { SidePanel } from './ui/panels/SidePanel';
import { useSongStore } from './store/songStore';
import { usePlaybackStore } from './store/playbackStore';
import { transport } from './playback/Transport';

const STATUS_TEXT = {
  idle: '',
  loading: 'Cargando piano…',
  ready: 'Piano listo',
  fallback: 'Sin muestras de piano: sonido de prueba',
  error: 'Error de audio: revisa la consola (F12)',
} as const;

export default function App() {
  const { song, fileName, error, rangeKey, loadFile, setRangeKey } = useSongStore();
  const { time, playing, audioStatus } = usePlaybackStore();

  // Cuando cambia la canción, el transport la recibe y vuelve a 0
  useEffect(() => {
    if (song) transport.reset();
  }, [song]);

  return (
    <div className="app">
      <header className="topbar">
        <label className="btn">
          Cargar MIDI
          <input type="file" accept=".mid,.midi" hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              transport.init().catch(() => {}); // crea el AudioContext dentro de un gesto del usuario
              loadFile(file);
            }} />
        </label>
        <span className="muted">{error ?? (fileName || 'Ningún archivo')}</span>
        <span className="muted">{STATUS_TEXT[audioStatus]}</span>
        <select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)}>
          <option value="auto">Teclado: automático</option>
          <option value="88">88 teclas</option>
          <option value="76">76 teclas</option>
          <option value="61">61 teclas</option>
          <option value="49">49 teclas</option>
        </select>
      </header>

      <div className="main">
        <PreviewCanvas />
        <SidePanel />
      </div>

      <footer className="transport">
        <button className="btn" disabled={!song || audioStatus === 'loading'}
          onClick={() => transport.toggle()}>
          {playing ? 'Pausa' : 'Play'}
        </button>
        <input type="range" min={0} max={song?.duration ?? 1} step={0.01}
          value={time} disabled={!song}
          onChange={(e) => transport.seek(Number(e.target.value))} />
        <span className="muted time">{time.toFixed(2)} / {(song?.duration ?? 0).toFixed(2)} s</span>
      </footer>
    </div>
  );
}
