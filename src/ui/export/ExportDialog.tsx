import { useEffect } from 'react';
import { useExportStore, type ExportQuality } from '../../store/exportStore';
import { useSongStore } from '../../store/songStore';
import { useSettingsStore } from '../../store/settingsStore';
import { outputSize, type ExportResolution } from '../../core/format';
import { detectSupport } from '../../export/capabilities';
import { bitrateFor, cancelExport, startExport, totalFrames } from '../../export/exportVideo';

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export function ExportDialog() {
  const ex = useExportStore();
  const song = useSongStore((s) => s.song);
  const format = useSettingsStore((s) => s.format);
  const size = outputSize(format, ex.resolution);
  const bitrate = bitrateFor(ex.quality, size.width, size.height);

  // Comprueba qué códec puede usar este navegador a este tamaño
  useEffect(() => {
    if (!ex.open || ex.phase === 'running') return;
    let cancelled = false;
    detectSupport(size.width, size.height, bitrate).then((sup) => { if (!cancelled) ex.patch({ support: sup }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.open, size.width, size.height, bitrate]);

  if (!ex.open || !song) return null;

  const running = ex.phase === 'running';
  const frames = totalFrames(song, ex.leadIn, ex.tail);
  const seconds = frames / 60;
  const estMB = (bitrate * seconds) / 8 / 1e6;
  const sup = ex.support;
  const p = ex.progress;

  return (
    <div className="modal-back">
      <div className="modal">
        <h2>Exportar video</h2>

        {!running && ex.phase !== 'done' && <>
          <div className="seg-row">
            <span>Formato</span>
            <b>{format === 'landscape' ? 'Horizontal 16:9' : 'Vertical 9:16'}</b>
            <span className="muted num">{size.width}×{size.height} · 60 fps</span>
          </div>

          <div className="seg-row"><span>Resolución</span>
            <div className="seg">
              {([720, 1080] as ExportResolution[]).map((r) => (
                <button key={r} className={ex.resolution === r ? 'on' : ''} onClick={() => ex.patch({ resolution: r })}>{r}p</button>
              ))}
            </div>
          </div>

          <div className="seg-row"><span>Calidad</span>
            <div className="seg">
              {([['normal', 'Normal'], ['high', 'Alta'], ['max', 'Máxima']] as [ExportQuality, string][]).map(([q, t]) => (
                <button key={q} className={ex.quality === q ? 'on' : ''} onClick={() => ex.patch({ quality: q })}>{t}</button>
              ))}
            </div>
          </div>

          <div className="seg-row"><span>Contenido</span>
            <div className="seg">
              <button className="on">Solo video</button>
              <button disabled title="Disponible en el siguiente hito">Video + audio</button>
            </div>
          </div>

          <div className="seg-row"><span>Entrada (s)</span>
            <input type="number" min={0} max={10} step={0.5} value={ex.leadIn}
              onChange={(e) => ex.patch({ leadIn: Math.min(10, Math.max(0, Number(e.target.value))) })} />
            <span>Cola final (s)</span>
            <input type="number" min={0} max={10} step={0.5} value={ex.tail}
              onChange={(e) => ex.patch({ tail: Math.min(10, Math.max(0, Number(e.target.value))) })} />
          </div>

          <p className="muted">
            Duración {fmtTime(seconds)} · {frames} frames · tamaño estimado ≈ {estMB.toFixed(0)} MB
          </p>

          {sup && !sup.container && <p className="warn">Este navegador no puede codificar video a este tamaño. Prueba con 720p o usa Chrome/Edge actualizado.</p>}
          {sup?.container === 'webm' && <p className="warn">H.264 no está disponible: se exportará en WebM ({sup.codec}).</p>}
          {sup && !sup.fileSystem && <p className="warn">Este navegador no puede guardar directo a disco: el video se arma en memoria y se descarga al final. Para piezas largas usa 720p.</p>}
          <p className="warn">Mantén esta pestaña visible y no cambies de ventana mientras se exporta: en segundo plano el navegador la ralentiza.</p>
        </>}

        {running && <>
          <div className="bar"><i style={{ width: `${(p.frame / Math.max(1, p.total)) * 100}%` }} /></div>
          <p className="num">
            {p.frame} / {p.total} frames ({Math.round((p.frame / Math.max(1, p.total)) * 100)}%) · {p.fps.toFixed(1)} fps · faltan ≈ {fmtTime(p.etaSec)}
          </p>
          <p className="warn">No cambies de pestaña ni cierres esta ventana.</p>
        </>}

        {ex.message && <p className={ex.phase === 'error' ? 'warn' : 'ok'}>{ex.message}</p>}

        <div className="modal-actions">
          {running
            ? <button className="btn" onClick={cancelExport}>Cancelar</button>
            : <>
                <button className="btn" onClick={() => ex.close()}>{ex.phase === 'done' ? 'Cerrar' : 'Cancelar'}</button>
                {ex.phase !== 'done' &&
                  <button className="btn primary" disabled={!sup?.container} onClick={() => { void startExport(); }}>
                    Exportar
                  </button>}
              </>}
        </div>
      </div>
    </div>
  );
}
