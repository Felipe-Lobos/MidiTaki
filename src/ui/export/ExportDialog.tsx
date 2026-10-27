import { useEffect, useRef } from 'react';
import { useExportStore } from '../../store/exportStore';
import { useSongStore } from '../../store/songStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { outputSize, type ExportResolution } from '../../core/format';
import { detectSupport } from '../../export/capabilities';
import { bitrateFor, cancelExport, startExport, totalFrames } from '../../export/exportVideo';
import { CopyCredit } from '../CopyCredit';
import { t } from '../../i18n';

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const deviceMemory = () => (navigator as unknown as { deviceMemory?: number }).deviceMemory;

export function ExportDialog() {
  const ex = useExportStore();
  const song = useSongStore((s) => s.song);
  const format = useSettingsStore((s) => s.format);
  const audioStatus = usePlaybackStore((s) => s.audioStatus);
  const size = outputSize(format, ex.resolution);
  const bitrate = bitrateFor(size.width, size.height);
  const running = ex.phase === 'running';
  const wasHidden = useRef(false);

  // Comprueba qué códecs puede usar este navegador a este tamaño
  useEffect(() => {
    if (!ex.open || ex.phase === 'running') return;
    let cancelled = false;
    detectSupport(size.width, size.height, bitrate).then((sup) => { if (!cancelled) ex.patch({ support: sup }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.open, size.width, size.height, bitrate]);

  // Durante la exportación: anota si la pestaña pasó a segundo plano y muestra el avance en el título
  useEffect(() => {
    if (!running) { wasHidden.current = false; document.title = t.app.name; return; }
    const onVis = () => { if (document.visibilityState === 'hidden') wasHidden.current = true; };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [running]);
  useEffect(() => {
    if (running && ex.stage === 'video')
      document.title = `${Math.round((ex.progress.frame / Math.max(1, ex.progress.total)) * 100)} % · ${t.app.name}`;
  }, [running, ex.stage, ex.progress.frame, ex.progress.total]);

  if (!ex.open || !song) return null;

  const sup = ex.support;
  const audioOk = !!sup?.audioCodec;
  const withAudio = ex.withAudio && audioOk;
  const frames = totalFrames(song, ex.leadIn, ex.tail, withAudio);
  const seconds = frames / 60;
  const p = ex.progress;
  const lowMem = (deviceMemory() ?? 8) < 4;

  return (
    <div className="modal-back">
      <div className="modal">
        <h2>{t.export.title}</h2>

        {!running && ex.phase !== 'done' && <>
          <div className="seg-row">
            <span>{t.export.format}</span>
            <b>{format === 'landscape' ? t.top.landscape : t.top.portrait}</b>
            <span className="muted num">{size.width}×{size.height} · 60 fps</span>
          </div>

          <div className="seg-row"><span>{t.export.resolution}</span>
            <div className="seg">
              {([720, 1080] as ExportResolution[]).map((r) => (
                <button key={r} className={ex.resolution === r ? 'on' : ''} onClick={() => ex.patch({ resolution: r })}>{r}p</button>
              ))}
            </div>
          </div>

          <div className="seg-row"><span>{t.export.content}</span>
            <div className="seg">
              <button className={!withAudio ? 'on' : ''} onClick={() => ex.patch({ withAudio: false })}>{t.export.videoOnly}</button>
              <button className={withAudio ? 'on' : ''} disabled={!audioOk} onClick={() => ex.patch({ withAudio: true })}>{t.export.videoAudio}</button>
            </div>
          </div>

          <div className="seg-row"><span>{t.export.lead}</span>
            <input type="number" min={0} max={10} step={0.5} value={ex.leadIn}
              onChange={(e) => ex.patch({ leadIn: Math.min(10, Math.max(0, Number(e.target.value))) })} />
            <span>{t.export.tail}</span>
            <input type="number" min={0} max={10} step={0.5} value={ex.tail}
              onChange={(e) => ex.patch({ tail: Math.min(10, Math.max(0, Number(e.target.value))) })} />
          </div>

          <p className="muted">
            {t.export.duration(fmtTime(seconds), frames)}
            {withAudio && t.export.tailExtends}
          </p>

          {sup && !sup.container && <p className="warn">{t.export.noEncode}</p>}
          {sup?.container === 'webm' && <p className="warn">{t.export.webm(String(sup.codec))}</p>}
          {sup && sup.container && !audioOk && <p className="warn">{t.export.noAudioEncode}</p>}
          {withAudio && sup?.container === 'mp4' && sup.audioCodec === 'opus' && <p className="warn">{t.export.opus}</p>}
          {withAudio && audioStatus !== 'ready' && <p className="warn">{t.export.samplesMissing}</p>}
          {withAudio && lowMem && <p className="warn">{t.export.lowMemory}</p>}
          {sup && !sup.fileSystem && <p className="warn">{t.export.noFileSystem}</p>}
          <p className="warn">{t.export.keepVisible}</p>
        </>}

        {running && ex.stage === 'audio' && <>
          <div className="bar indet"><i /></div>
          <p>{t.export.generatingAudio}</p>
        </>}
        {running && ex.stage === 'video' && <>
          <div className="bar"><i style={{ width: `${(p.frame / Math.max(1, p.total)) * 100}%` }} /></div>
          <p className="num">
            {t.export.progress(p.frame, p.total, Math.round((p.frame / Math.max(1, p.total)) * 100), p.fps.toFixed(1), fmtTime(p.etaSec))}
          </p>
        </>}
        {running && <p className="warn">{t.export.doNotLeave}</p>}
        {!running && wasHidden.current && ex.phase !== 'idle' && <p className="warn">{t.export.wasHidden}</p>}

        {ex.message && <p className={ex.phase === 'error' ? 'warn' : 'ok'}>{ex.message}</p>}
        {ex.phase === 'done' && withAudio && <>
          <p className="muted">{t.export.creditHint}</p>
          <CopyCredit />
        </>}

        <div className="modal-actions">
          {running
            ? <button className="btn" onClick={cancelExport}>{t.common.cancel}</button>
            : <>
                <button className="btn" onClick={() => ex.close()}>{ex.phase === 'done' ? t.common.close : t.common.cancel}</button>
                {ex.phase !== 'done' &&
                  <button className="btn primary" disabled={!sup?.container} onClick={() => { void startExport(); }}>
                    {t.export.start}
                  </button>}
              </>}
        </div>
      </div>
    </div>
  );
}
