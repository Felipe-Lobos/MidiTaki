import { APP, LIBRARIES, PIANO_CREDIT } from '../core/appInfo.ts';
import { resetAll } from '../store/resetAll.ts';
import { CopyCredit } from './CopyCredit';
import { t } from '../i18n';

export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal about" onClick={(e) => e.stopPropagation()}>
        <h2>{t.about.title}</h2>
        <p>{t.about.description}</p>
        <p className="muted">{t.about.privacy}</p>

        {(APP.repoUrl || APP.license) && (
          <p>
            <b>{t.about.openSource}</b>
            {APP.license && <> · {t.about.license(APP.license)}</>}
            {APP.repoUrl && <> · <a href={APP.repoUrl} target="_blank" rel="noopener noreferrer">{t.about.repo}</a></>}
          </p>
        )}

        <h3>{t.about.creditsTitle}</h3>
        <p>
          {t.about.pianoCredit}{' '}
          <a href={PIANO_CREDIT.licenseUrl} target="_blank" rel="noopener noreferrer">CC BY 3.0</a>{' · '}
          <a href={PIANO_CREDIT.sourceUrl} target="_blank" rel="noopener noreferrer">archive.org</a>
        </p>
        <p className="muted">{t.about.creditAsk}</p>
        <CopyCredit />

        <h3>{t.about.libraries}</h3>
        <ul>
          {LIBRARIES.map((l) => (
            <li key={l.name}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.name}</a> · {l.license}</li>
          ))}
        </ul>
        <p>
          <a href={`${import.meta.env.BASE_URL}THIRD_PARTY_NOTICES.txt`} target="_blank" rel="noopener noreferrer">
            {t.about.noticesLink}
          </a>
        </p>

        <h3>{t.about.data}</h3>
        <p className="muted">{t.about.dataText}</p>
        <div className="modal-actions">
          <button className="btn" onClick={resetAll}>{t.about.resetAll}</button>
          <button className="btn primary" onClick={onClose}>{t.common.close}</button>
        </div>
      </div>
    </div>
  );
}
