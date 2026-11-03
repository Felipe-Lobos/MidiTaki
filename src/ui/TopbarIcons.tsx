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

/** Flecha hacia la derecha (el CSS la gira según dónde se esconde el panel). */
export const ChevronIcon = () => (
  <Svg><path d="M9 6l6 6-6 6" /></Svg>
);

/** Ajustes (tres deslizadores). */
export const SlidersIcon = () => (
  <Svg>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Svg>
);
