import { APP } from '../core/appInfo';
import { t } from '../i18n';

/** Pie discreto: marca, tipo de proyecto, repositorio y autoría. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="f-group">
        <strong>{APP.name}</strong>
        <span>{t.footer.openSource}</span>
        {APP.license && (
          <span>
            <a href={APP.licenseUrl} target="_blank" rel="noopener noreferrer">{t.about.license(APP.license)}</a>
          </span>
        )}
      </div>
      <span className="f-keys">{t.drop.keys}</span>
      <div className="f-group">
        <a href={APP.repoUrl} target="_blank" rel="noopener noreferrer">{t.footer.repo}</a>
        <span>{t.footer.createdBy} <a href={APP.authorUrl} target="_blank" rel="noopener noreferrer">{APP.author}</a></span>
      </div>
    </footer>
  );
}
