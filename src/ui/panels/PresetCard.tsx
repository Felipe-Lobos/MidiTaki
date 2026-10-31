import { noteTint } from '../../core/colors/colorMapping';
import type { Style } from '../../core/style/schema';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');
const NOTES = [
  { left: '12%', h: 26 }, { left: '42%', h: 38 }, { left: '72%', h: 20 },
];

/** Mini vista previa de un preset hecha con CSS: fondo, tres notas con sus colores y un trozo de teclado. */
export function PresetPreview({ style: s }: { style: Style }) {
  return (
    <div className="preset-prev" style={{ background: s.background }}>
      {NOTES.map((n, i) => {
        const c = hex(noteTint(s, i / 2)); // graves → agudos
        return (
          <i key={i} className="pn" style={{
            left: n.left, height: n.h,
            borderRadius: Math.min(s.noteRadius, 6),
            background: s.noteFill === 'outline' ? 'transparent' : c,
            border: s.noteFill === 'outline' ? `2px solid ${c}` : undefined,
            boxShadow: s.glow ? `0 0 8px ${s.glowSync ? c : s.glowColor}` : undefined,
          }} />
        );
      })}
      <div className="pk" style={{ background: s.whiteKey, borderTop: s.showHitLine ? `2px solid ${s.hitLineSync ? s.noteColor : s.hitLineColor}` : undefined }}>
        {['26%', '56%', '84%'].map((left) => <b key={left} style={{ left, background: s.blackKey }} />)}
      </div>
    </div>
  );
}
