import { useState } from 'react';
import { t } from '../i18n';

/** Muestra el texto de crédito del piano y un botón para copiarlo. */
export function CopyCredit() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(t.about.creditLine);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch { /* sin portapapeles: el texto sigue visible para copiarlo a mano */ }
  };
  return (
    <div className="credit">
      <code>{t.about.creditLine}</code>
      <button className="btn" onClick={copy}>{done ? t.common.copied : t.about.copyCredit}</button>
    </div>
  );
}
