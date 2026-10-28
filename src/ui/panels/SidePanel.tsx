import { useState } from 'react';
import { ColorField, Segmented, Slider, Toggle } from '../controls/controls';
import { useStyleStore } from '../../store/styleStore';
import { useSongStore } from '../../store/songStore';
import { useSettingsStore } from '../../store/settingsStore';
import { defaultStyle, type BoolKey, type ColorKey, type NumKey } from '../../core/style/schema';
import { PRESETS } from '../../core/style/presets';
import { exportPreset, importPreset } from '../../core/style/presetIO';
import { t } from '../../i18n';

const TABS = ['notes', 'keyboard', 'scene', 'effects', 'audio', 'presets'] as const;
type Tab = (typeof TABS)[number];

export function SidePanel() {
  const [tab, setTab] = useState<Tab>('notes');
  const [importError, setImportError] = useState<string | null>(null);
  const { style, patch, apply, reset } = useStyleStore();
  const { song, range, setRangeKey } = useSongStore();
  const { volume, setVolume, previewLeadTail, setPreviewLeadTail } = useSettingsStore();

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
        {TABS.map((id) => (
          <button key={id} className={id === tab ? 'on' : ''} onClick={() => setTab(id)}>{t.tabs[id]}</button>
        ))}
      </nav>

      <div className="panel">
        {tab === 'notes' && <>
          <Segmented label={t.notes.color} value={style.colorMode} onChange={(v) => patch({ colorMode: v })}
            options={[{ value: 'solid', text: t.notes.solid }, { value: 'pitch', text: t.notes.byPitch }]} />
          {color('noteColor', style.colorMode === 'pitch' ? t.notes.bass : t.notes.color)}
          {style.colorMode === 'pitch' && color('noteColor2', t.notes.treble)}
          {num('noteRadius', t.notes.radius, 0, 24, 1, ' px')}
          {num('noteGap', t.notes.gap, 0, 8, 1, ' px')}
          {num('noteOpacity', t.notes.opacity, 0.2, 1)}
          {bool('velocityOpacity', t.notes.velocity)}
          <Segmented label={t.notes.fill} value={style.noteFill} onChange={(v) => patch({ noteFill: v })}
            options={[{ value: 'solid', text: t.notes.solid }, { value: 'outline', text: t.notes.hollow }]} />
          {style.noteFill === 'outline' && num('outlineWidth', t.notes.outline, 1, 8, 1, ' px')}
        </>}

        {tab === 'keyboard' && <>
          {outside > 0 && (
            <div className="warn">
              <p>{t.keyboard.outside(outside)}</p>
              <button className="btn" onClick={() => setRangeKey('auto')}>{t.keyboard.fit}</button>
            </div>
          )}
          {color('whiteKey', t.keyboard.white)}
          {color('blackKey', t.keyboard.black)}
          {!style.syncColors && color('pressedColor', t.keyboard.pressed)}
          {num('keyboardRatio', t.keyboard.height, 0.08, 0.3)}
          {num('keyPress', t.keyboard.press, 0, 12, 1, ' px')}
          {bool('showHitLine', t.keyboard.hitLine)}
          {style.showHitLine && color('hitLineColor', t.keyboard.hitColor)}
        </>}

        {tab === 'scene' && <>
          {color('background', t.scene.background)}
          {num('fallSeconds', t.scene.fall, 1, 8, 0.1, ' s')}
          {bool('showOctaveLines', t.scene.octaveLines)}
          {style.showOctaveLines && <>
            {bool('octaveLineAuto', t.scene.octaveAuto)}
            {!style.octaveLineAuto && color('octaveLineColor', t.scene.octaveColor)}
            {num('octaveLineOpacity', t.scene.octaveOpacity, 0.05, 1)}
          </>}
          <Toggle label={t.scene.leadTail} value={previewLeadTail} onChange={setPreviewLeadTail} />
        </>}

        {tab === 'effects' && <>
          {bool('glow', t.effects.glow)}
          {bool('syncColors', t.effects.sync)}
          {style.glow && !style.syncColors && color('glowColor', t.effects.glowColor)}
          {style.glow && num('glowStrength', t.effects.glowStrength, 0, 3)}
          {style.glow && num('glowRadius', t.effects.glowRadius, 2, 24, 1, ' px')}
          {num('relief', t.effects.relief, 0, 1)}
          {bool('particles', t.particles.enable)}
          {style.particles && <>
            <Segmented label={t.particles.type} value={style.particleType} onChange={(v) => patch({ particleType: v })}
              options={[
                { value: 'sparks', text: t.particles.sparks }, { value: 'embers', text: t.particles.embers },
                { value: 'ring', text: t.particles.ring }, { value: 'stars', text: t.particles.stars },
              ]} />
            {num('particleAmount', t.particles.amount, 2, 120, 1, ' /s')}
            {num('particleSize', t.particles.size, 1, 12, 0.5, ' px')}
            {num('particleSpeed', t.particles.speed, 40, 600, 10, ' px/s')}
            {num('particleLife', t.particles.life, 0.2, 3, 0.1, ' s')}
            {style.particleType !== 'ring' && num('particleSpread', t.particles.spread, 0, 1)}
            {bool('particleGlow', t.particles.glow)}
            <p className="muted">{t.particles.note}</p>
          </>}
          <p className="muted">{t.effects.note}</p>
        </>}

        {tab === 'audio' && <>
          <Slider label={t.audio.volume} value={volume} def={1} min={0} max={1.5} step={0.05} onChange={setVolume} />
          <p className="muted">{t.audio.note}</p>
        </>}

        {tab === 'presets' && <>
          <div className="presets">
            {PRESETS.map((p) => <button key={p.id} className="btn" onClick={() => apply(p.style)}>{t.presetNames[p.id]}</button>)}
          </div>
          <div className="presets">
            <button className="btn" onClick={() => exportPreset(style)}>{t.presets.exportJson}</button>
            <label className="btn">
              {t.presets.importJson}
              <input type="file" accept=".json,application/json" hidden onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                try { apply(await importPreset(f)); setImportError(null); }
                catch (err) { setImportError(err instanceof Error ? err.message : t.presets.importFailed); }
              }} />
            </label>
          </div>
          {importError && <p className="warn">{importError}</p>}
          <button className="btn" onClick={reset}>{t.presets.resetStyle}</button>
        </>}
      </div>
    </aside>
  );
}
