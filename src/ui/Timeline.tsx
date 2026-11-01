import type { CSSProperties, ReactNode } from 'react';
import { transport } from '../playback/Transport';
import { usePlaybackStore } from '../store/playbackStore';
import { useSongStore } from '../store/songStore';
import { t } from '../i18n';

const Icon = (p: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    {p.children}
  </svg>
);

/** Play/pausa, volver al inicio, barra de tiempo y sonido. Va justo debajo del canvas. */
export function Timeline(p: { min: number; max: number }) {
  const hasSong = useSongStore((s) => !!s.song);
  const { time, playing, audioStatus, muted, setMuted } = usePlaybackStore();
  const playLabel = playing ? t.transport.pause : t.transport.play;
  const fill = hasSong && p.max > p.min ? Math.min(100, Math.max(0, ((time - p.min) / (p.max - p.min)) * 100)) : 0; // solo estilo

  return (
    <div className="timeline">
      <button className="icon-btn play" title={`${playLabel} (${t.transport.playTitle})`} aria-label={playLabel}
        disabled={!hasSong || audioStatus === 'loading'} onClick={() => transport.toggle()}>
        <Icon>{playing
          ? <><rect x="6" y="5" width="4" height="14" rx="1" stroke="none" /><rect x="14" y="5" width="4" height="14" rx="1" stroke="none" /></>
          : <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z" stroke="none" />}
        </Icon>
      </button>
      <button className="icon-btn" title={t.transport.restart} aria-label={t.transport.restart}
        disabled={!hasSong} onClick={() => transport.seek(p.min)}>
        <Icon><path d="M6 5v14" fill="none" /><path d="M19 6v12L9.5 12z" stroke="none" /></Icon>
      </button>
      <input type="range" min={p.min} max={p.max} step={0.01} value={time} disabled={!hasSong}
        style={{ '--fill': `${fill}%` } as CSSProperties} onChange={(e) => transport.seek(Number(e.target.value))} />
      <span className="muted time">{time.toFixed(2)} / {(hasSong ? p.max : 0).toFixed(2)} s</span>
      <button className="icon-btn" title={t.transport.muteTitle} aria-label={muted ? t.transport.soundOff : t.transport.soundOn}
        aria-pressed={muted} onClick={() => setMuted(!muted)}>
        <Icon>
          <path d="M4 9.5v5h3.5l5 4v-13l-5 4H4z" stroke="none" />
          {muted
            ? <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" />
            : <path d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" fill="none" />}
        </Icon>
      </button>
    </div>
  );
}
