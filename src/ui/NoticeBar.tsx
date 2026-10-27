import { useNoticeStore } from '../store/noticeStore.ts';
import { t } from '../i18n';

/** Avisos y errores no bloqueantes, justo debajo de la barra superior. */
export function NoticeBar() {
  const notices = useNoticeStore((s) => s.notices);
  const dismiss = useNoticeStore((s) => s.dismiss);
  return (
    <div className="notices" role="region" aria-live="polite">
      {notices.map((n) => (
        <div key={n.id} className={`notice ${n.level}`}>
          <span>{n.text}</span>
          {n.action && <button className="btn" onClick={n.action.run}>{n.action.label}</button>}
          <button className="x" title={t.common.close} onClick={() => dismiss(n.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
