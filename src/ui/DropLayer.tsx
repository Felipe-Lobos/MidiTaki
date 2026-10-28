import type { ChangeEvent } from 'react';
import { openMidi } from '../playback/openMidi';
import { t } from '../i18n';

/** Handler del <input type="file"> para cargar un MIDI. */
export function pickMidi(e: ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  e.target.value = ''; // permite volver a elegir el mismo archivo
  if (file) void openMidi(file);
}

/** Tarjeta de bienvenida sobre el canvas mientras no hay ninguna canción cargada. */
export function EmptyCard() {
  return (
    <div className="drop-layer">
      <div className="drop-card">
        <h2>{t.drop.title}</h2>
        <p className="muted">{t.drop.or}</p>
        <label className="btn primary">
          {t.drop.choose}
          <input type="file" accept=".mid,.midi" hidden onChange={pickMidi} />
        </label>
        <ol>{t.drop.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        <p className="muted">{t.drop.privacy}</p>
        <p className="muted">{t.drop.keys}</p>
      </div>
    </div>
  );
}

/** Aviso a pantalla completa mientras se arrastra un archivo sobre la página. */
export function DropOverlay(p: { fileName: string }) {
  return <div className="drop-overlay">{p.fileName ? t.drop.overlayReplace(p.fileName) : t.drop.overlay}</div>;
}
