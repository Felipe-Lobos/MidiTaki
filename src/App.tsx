import { useEffect, useState } from 'react';
import { PreviewCanvas } from './ui/canvas/PreviewCanvas';
import { SidePanel } from './ui/panels/SidePanel';
import { NoticeBar } from './ui/NoticeBar.tsx';
import { AboutDialog } from './ui/AboutDialog.tsx';
import { ExportDialog } from './ui/export/ExportDialog';
import { DropOverlay, EmptyCard, pickMidi } from './ui/DropLayer';
import { useMidiDrop } from './ui/useMidiDrop';
import { useShortcuts } from './ui/useShortcuts';
import { useSongStore } from './store/songStore';
import { usePlaybackStore } from './store/playbackStore';
import { useSettingsStore } from './store/settingsStore';
import { useExportStore } from './store/exportStore';
import { useStyleStore } from './store/styleStore';
import { notify } from './store/noticeStore.ts';
import { previewBounds } from './core/timeline/bounds';
import { compat } from './core/compat.ts';
import { transport } from './playback/Transport';
import { t } from './i18n';

const KEYBOARD_OPTIONS = ['auto', '88', '76', '61', '49'];

function Unsupported() {
  return (
    <div className="unsupported">
      <h1>{t.unsupported.title}</h1>
      <p>{t.unsupported.text}</p>
    </div>
  );
}

function Main() {
  const { song, fileName, rangeKey, setRangeKey } = useSongStore();
  const { time, playing, audioStatus, muted, setMuted } = usePlaybackStore();
  const { previewFx, setPreviewFx, format, setFormat } = useSettingsStore();
  const leadTail = useSettingsStore((s) => s.previewLeadTail);
  const fall = useStyleStore((s) => s.style.fallSeconds);
  const tail = useExportStore((s) => s.tail);
  const [aboutOpen, setAboutOpen] = useState(false);
  const dragging = useMidiDrop();
  useShortcuts(!aboutOpen);
  const b = song ? previewBounds(song, leadTail, fall, tail) : { min: 0, max: 1 };

  useEffect(() => {
    document.title = t.app.name;
    document.documentElement.lang = 'es';
    if (!compat.webCodecs) notify({ id: 'compat-codecs', level: 'warn', text: t.notices.webCodecs });
    if (!compat.webAudio) notify({ id: 'compat-audio', level: 'warn', text: t.notices.webAudio });
  }, []);

  // Cuando cambia la canción, el transport la recibe y vuelve al inicio
  useEffect(() => {
    if (song) transport.reset();
  }, [song]);

  return (
    <div className="app">
      <header className="topbar">
        <strong className="brand">{t.app.name}</strong>
        <label className="btn">
          {t.top.loadMidi}
          <input type="file" accept=".mid,.midi" hidden onChange={pickMidi} />
        </label>
        <span className="muted">{fileName || t.top.noFile}</span>
        <span className="muted">{t.audioStatus[audioStatus]}</span>
        <label className="muted" title={t.top.effectsTitle}>
          <input type="checkbox" checked={previewFx} onChange={(e) => setPreviewFx(e.target.checked)} /> {t.top.effects}
        </label>
        <select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)}>
          {KEYBOARD_OPTIONS.map((k) => (
            <option key={k} value={k}>{k === 'auto' ? t.top.keyboardAuto : t.top.keys(Number(k))}</option>
          ))}
        </select>
        <select className="inline" value={format} onChange={(e) => setFormat(e.target.value as 'landscape' | 'portrait')}>
          <option value="landscape">{t.top.landscape}</option>
          <option value="portrait">{t.top.portrait}</option>
        </select>
        <button className="btn primary" disabled={!song || !compat.webCodecs}
          title={compat.webCodecs ? undefined : t.top.exportUnavailable}
          onClick={() => {
            transport.pause();
            useExportStore.getState().openDialog(Math.round(useStyleStore.getState().style.fallSeconds * 2) / 2);
          }}>{t.top.export}</button>
        <button className="btn" onClick={() => setAboutOpen(true)}>{t.top.about}</button>
      </header>

      <NoticeBar />

      <div className="main">
        <div className="stage">
          <PreviewCanvas />
          {!song && <EmptyCard />}
        </div>
        <SidePanel />
      </div>

      <footer className="transport">
        <button className="btn" title={t.transport.playTitle} disabled={!song || audioStatus === 'loading'} onClick={() => transport.toggle()}>
          {playing ? t.transport.pause : t.transport.play}
        </button>
        <input type="range" min={b.min} max={b.max} step={0.01}
          value={time} disabled={!song}
          onChange={(e) => transport.seek(Number(e.target.value))} />
        <span className="muted time">{time.toFixed(2)} / {(song ? b.max : 0).toFixed(2)} s</span>
        <button className="btn" title={t.transport.muteTitle} onClick={() => setMuted(!muted)}>
          {muted ? t.transport.unmute : t.transport.mute}
        </button>
      </footer>

      {dragging && <DropOverlay fileName={fileName} />}
      <ExportDialog />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

export default function App() {
  return compat.webgl ? <Main /> : <Unsupported />;
}
