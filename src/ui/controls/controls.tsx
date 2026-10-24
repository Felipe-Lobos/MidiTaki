import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

function Head({ label, shown, changed, onReset }: { label: string; shown?: string; changed: boolean; onReset: () => void }) {
  return (
    <div className="ctl-head">
      <span>{label}</span>
      <span className="muted num">{shown}</span>
      <button className="reset" title="Restablecer" disabled={!changed} onClick={onReset}>↺</button>
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

export function ColorField(p: { label: string; value: string; def: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ctl">
      <Head label={p.label} changed={p.value !== p.def} onReset={() => p.onChange(p.def)} />
      <button className="swatch" onClick={() => setOpen((o) => !o)}>
        <i style={{ background: p.value }} /> <span className="num">{p.value}</span>
      </button>
      {open && <HexColorPicker color={p.value} onChange={p.onChange} />}
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
