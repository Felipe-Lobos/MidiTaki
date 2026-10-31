/** Boceto del logo: cuadrado violeta con un fragmento de teclado de piano. Los colores salen de index.css (.logo-*). */
export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 40 40" aria-hidden="true">
      <rect className="logo-bg" width="40" height="40" rx="10" />
      <rect className="logo-keys" x="8" y="9" width="24" height="22" rx="3" />
      <path className="logo-split" d="M14 21v10M20 21v10M26 21v10" />
      <rect className="logo-black" x="12.2" y="9" width="3.6" height="13" rx="1" />
      <rect className="logo-black" x="18.2" y="9" width="3.6" height="13" rx="1" />
      <rect className="logo-black" x="24.2" y="9" width="3.6" height="13" rx="1" />
    </svg>
  );
}
