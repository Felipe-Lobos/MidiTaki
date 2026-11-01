import type { ReactNode } from 'react';

const Svg = (p: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {p.children}
  </svg>
);

/** Panel lateral (rectángulo con columna a la derecha). */
export const PanelIcon = () => (
  <Svg><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></Svg>
);

/** Acerca de (círculo con «i»). */
export const InfoIcon = () => (
  <Svg><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>
);
