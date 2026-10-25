import { useState } from 'react';
import { ColorField, Segmented, Slider, Toggle } from '../controls/controls';
import { useStyleStore } from '../../store/styleStore';
import { useSongStore } from '../../store/songStore';
import { defaultStyle, type BoolKey, type ColorKey, type NumKey } from '../../core/style/schema';
import { PRESETS } from '../../core/style/presets';
import { exportPreset, importPreset } from '../../core/style/presetIO';

const TABS = ['Notas', 'Teclado', 'Escena', 'Efectos', 'Presets'] as const;
type Tab = (typeof TABS)[number];

export function SidePanel() {
  const [tab, setTab] = useState<Tab>('Notas');
  const [importError, setImportError] = useState<string | null>(null);
  const { style, patch, apply, reset } = useStyleStore();
  const { song, range } = useSongStore();

  const num = (k: NumKey, label: string, min: number, max: number, step?: number, unit?: string) => (
    <Slider label={label} value={style[k]} def={defaultStyle[k]} min={min} max={max} step={step} unit={unit}
      onChange={(v) => patch({ [k]: v })} />
  );
  const color = (k: ColorKey, label: string) => (
    <ColorField label={label} value={style[k]} def={defaultStyle[k]} onChange={(v) => patch({ [k]: v })} />
  );
  const bool = (k: BoolKey, label: string) => (
    <Toggle label={label} value={style[k]} onChange={(v) => patch({ [k]: v })} />
  );

  const outside = song ? song.notes.filter((n) => n.midi < range.low || n.midi > range.high).length : 0;

  return (
    <aside className="side">
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>

      <div className="panel">
        {tab === 'Notas' && <>
          <Segmented label="Color" value={style.colorMode} onChange={(v) => patch({ colorMode: v })}
            options={[{ value: 'solid', text: 'Sólido' }, { value: 'pitch', text: 'Por altura' }]} />
          {color('noteColor', style.colorMode === 'pitch' ? 'Color graves' : 'Color')}
          {style.colorMode === 'pitch' && color('noteColor2', 'Color agudos')}
          {num('noteRadius', 'Esquinas', 0, 24, 1, ' px')}
          {num('noteGap', 'Separación', 0, 8, 1, ' px')}
          {num('noteOpacity', 'Opacidad', 0.2, 1)}
          {bool('velocityOpacity', 'La fuerza (velocity) afecta la opacidad')}
          <Segmented label="Relleno" value={style.noteFill} onChange={(v) => patch({ noteFill: v })}
            options={[{ value: 'solid', text: 'Sólido' }, { value: 'outline', text: 'Hueco' }]} />
          {style.noteFill === 'outline' && num('outlineWidth', 'Grosor del borde', 1, 8, 1, ' px')}
        </>}

        {tab === 'Teclado' && <>
          {outside > 0 && <p className="warn">{outside} notas quedan fuera del rango del teclado y no se dibujan.</p>}
          {color('whiteKey', 'Teclas blancas')}
          {color('blackKey', 'Teclas negras')}
          {!style.syncColors && color('pressedColor', 'Tecla pulsada')}
          {num('keyboardRatio', 'Altura del teclado', 0.08, 0.3)}
          {num('keyPress', 'Profundidad al pulsar', 0, 12, 1, ' px')}
          {bool('showHitLine', 'Línea de impacto')}
          {style.showHitLine && color('hitLineColor', 'Color de la línea')}
        </>}

        {tab === 'Escena' && <>
          {color('background', 'Fondo')}
          {num('fallSeconds', 'Segundos visibles (menos = más rápido)', 1, 8, 0.1, ' s')}
        </>}

        {tab === 'Efectos' && <>
          {bool('glow', 'Brillo neón (glow)')}
          {bool('syncColors', 'Sincronizar tecla y brillo con el color de la nota')}
          {style.glow && !style.syncColors && color('glowColor', 'Color del brillo')}
          {style.glow && num('glowStrength', 'Intensidad del brillo', 0, 3)}
          {style.glow && num('glowRadius', 'Radio del brillo', 2, 24, 1, ' px')}
          {num('relief', 'Relieve 2.5D (notas y teclas)', 0, 1)}
          <p className="muted">El interruptor «Efectos» de la barra superior solo afecta a la vista previa; el video exportado siempre usa calidad completa.</p>
        </>}

        {tab === 'Presets' && <>
          <div className="presets">
            {PRESETS.map((p) => <button key={p.name} className="btn" onClick={() => apply(p.style)}>{p.name}</button>)}
          </div>
          <div className="presets">
            <button className="btn" onClick={() => exportPreset(style)}>Exportar JSON</button>
            <label className="btn">
              Importar JSON
              <input type="file" accept=".json,application/json" hidden onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                try { apply(await importPreset(f)); setImportError(null); }
                catch (err) { setImportError(err instanceof Error ? err.message : 'No se pudo importar.'); }
              }} />
            </label>
          </div>
          {importError && <p className="warn">{importError}</p>}
          <button className="btn" onClick={reset}>Restablecer todo</button>
        </>}
      </div>
    </aside>
  );
}
