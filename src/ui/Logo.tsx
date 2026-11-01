/**
 * Logo de MidiTaki. Usa el mismo archivo que el favicon (public/favicon.svg), así hay una sola fuente:
 * para cambiar el logo basta con reemplazar ese SVG. BASE_URL mantiene la ruta correcta en GitHub Pages.
 */
export function Logo() {
  return <img className="logo" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={36} height={36} draggable={false} />;
}
