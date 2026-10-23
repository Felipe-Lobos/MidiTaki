import { useEffect, useState } from 'react';
import { PreviewCanvas } from './ui/canvas/PreviewCanvas';
import { useSongStore } from './store/songStore';
import { usePlaybackStore } from './store/playbackStore';

export default function App() {
  const { song, fileName, error, rangeKey, loadFile, setRangeKey } = useSongStore();
  const { time, setTime } = usePlaybackStore();
  const [playing, setPlaying] = useState(false);

  // Reproducción TEMPORAL solo visual (sin audio). En el hito 3 la reemplaza el reloj del audio.
  useEffect(() => {
    if (!playing || !song) return;
    const origin = performance.now() - usePlaybackStore.getState().time * 1000;
    let raf = requestAnimationFrame(function loop() {
      const t = (performance.now() - origin) / 1000;
      if (t >= song.duration) { setTime(song.duration); setPlaying(false); return; }
      setTime(t);
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, song, setTime]);

  return (
    <div className="app">
      <header className="topbar">
        <label className="btn">
          Cargar MIDI
          <input type="file" accept=".mid,.midi" hidden
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </label>
        <span className="muted">{error ?? (fileName || 'Ningún archivo')}</span>
        <select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)}>
          <option value="auto">Teclado: automático</option>
          <option value="88">88 teclas</option>
          <option value="76">76 teclas</option>
          <option value="61">61 teclas</option>
          <option value="49">49 teclas</option>
        </select>
      </header>

      <PreviewCanvas />

      <footer className="transport">
        <button className="btn" disabled={!song} onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pausa' : 'Play'}
        </button>
        <input type="range" min={0} max={song?.duration ?? 1} step={0.01}
          value={time} disabled={!song}
          onChange={(e) => { setPlaying(false); setTime(Number(e.target.value)); }} />
        <span className="muted time">{time.toFixed(2)} / {(song?.duration ?? 0).toFixed(2)} s</span>
      </footer>
    </div>
  );
}
