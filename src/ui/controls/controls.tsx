import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { t } from '../../i18n';

function Head({ label, shown, changed, onReset }: { label: string; shown?: string; changed: boolean; onReset: () => void }) {
  return (
    <div className="ctl-head">
      <span>{label}</span>
      <span className="muted num">{shown}</span>
      <button className="reset" title={t.common.reset} disabled={!changed} onClick={onReset}>↺</button>
    </div>
  );
}

export function Slider(p: {
  label: string; value: number; def: number; min: number; max: number;
  step?: number; unit?: string; onChange: (v: number) => void;
}) {
  const step = p.step ?? 0.01;
  const digits = step >= 1 ? 0 : 2;
  return (
    <div className="ctl">
      <Head label={p.label} shown={`${p.value.toFixed(digits)}${p.unit ?? ''}`}
        changed={p.value !== p.def} onReset={() => p.onChange(p.def)} />
      <input type="range" min={p.min} max={p.max} step={step} value={p.value}
        onChange={(e) => p.onChange(Number(e.target.value))} />
    </div>
  );
}

/** Acepta "#rgb", "rgb", "#rrggbb" o "rrggbb" y devuelve "#rrggbb" (minúsculas), o null si no es válido. */
function normalizeHex(raw: string): string | null {
  const v = raw.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(v)) return '#' + v.split('').map((c) => c + c).join('');
  if (/^[0-9a-f]{6}$/.test(v)) return '#' + v;
  return null;
}

export function ColorField(p: { label: string; value: string; def: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null); // texto en edición; null = mostrar el valor real
  const shown = draft ?? p.value;
  const bad = draft !== null && normalizeHex(draft) === null;
  return (
    <div className="ctl">
      <Head label={p.label} changed={p.value !== p.def} onReset={() => { setDraft(null); p.onChange(p.def); }} />
      <div className="swatch">
        <button type="button" className="sw-btn" title={t.common.pickColor} onClick={() => setOpen((o) => !o)}>
          <i style={{ background: p.value }} />
        </button>
        <input className={bad ? 'hex num bad' : 'hex num'} value={shown} maxLength={7} spellCheck={false}
          aria-label={p.label}
          onChange={(e) => {
            setDraft(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex) p.onChange(hex); // solo se aplica cuando el valor ya es válido
          }}
          onBlur={() => setDraft(null)} // si quedó incompleto, vuelve al último valor válido
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
      </div>
      {open && <HexColorPicker color={p.value} onChange={(v) => { setDraft(null); p.onChange(v); }} />}
    </div>
  );
}

export function Toggle(p: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="ctl toggle">
      <span>{p.label}</span>
      <input type="checkbox" checked={p.value} onChange={(e) => p.onChange(e.target.checked)} />
    </label>
  );
}

export function Segmented<T extends string>(p: {
  label: string; value: T; options: { value: T; text: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="ctl">
      <div className="ctl-head"><span>{p.label}</span></div>
      <div className="seg">
        {p.options.map((o) => (
          <button key={o.value} className={o.value === p.value ? 'on' : ''} onClick={() => p.onChange(o.value)}>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}
