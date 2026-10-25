import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { Scene } from '../../render/Scene';
import { LOGICAL } from '../../core/format.ts';
import { useSongStore } from '../../store/songStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { useStyleStore } from '../../store/styleStore';
import { useSettingsStore } from '../../store/settingsStore';

/**
 * La escena tiene un tamaño LÓGICO fijo (960×540 o 540×960). Aquí solo se escala con CSS
 * para que quepa, y se ajusta la resolución interna (1×–2×) para que se vea nítido.
 */
export function PreviewCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current!;
    const app = new Application();
    let disposed = false;
    let ready = false;
    const unsubs: Array<() => void> = [];
    const logical = () => LOGICAL[useSettingsStore.getState().format];

    app
      .init({
        width: logical().w, height: logical().h, resolution: 1, autoDensity: true, antialias: true,
        background: useStyleStore.getState().style.background,
        powerPreference: 'high-performance',
      })
      .then(() => {
        if (disposed) { app.destroy(true); return; }
        ready = true;
        host.appendChild(app.canvas);

        const scene = new Scene(app, useStyleStore.getState().style);
        scene.setEffectsEnabled(useSettingsStore.getState().previewFx);

        const fit = () => {
          const { w, h } = logical();
          const k = Math.max(0.1, Math.min((host.clientWidth - 24) / w, (host.clientHeight - 24) / h));
          const res = Math.min(2, Math.max(1, k * window.devicePixelRatio));
          app.renderer.resize(w, h, res);
          app.canvas.style.width = `${w * k}px`;
          app.canvas.style.height = `${h * k}px`;
        };
        app.renderer.on('resize', (w: number, h: number) => scene.resize(w, h));

        const sync = () => {
          const { song, range } = useSongStore.getState();
          scene.setSong(song, range);
          scene.renderFrame(usePlaybackStore.getState().time);
        };
        fit();
        sync();

        const ro = new ResizeObserver(fit);
        ro.observe(host);
        unsubs.push(() => ro.disconnect());
        unsubs.push(useSongStore.subscribe(sync));
        unsubs.push(usePlaybackStore.subscribe((s) => scene.renderFrame(s.time)));
        unsubs.push(useStyleStore.subscribe((s, prev) => {
          if (s.style !== prev.style) scene.setStyle(s.style);
        }));
        unsubs.push(useSettingsStore.subscribe((s, prev) => {
          if (s.format !== prev.format) fit();
          if (s.previewFx !== prev.previewFx) scene.setEffectsEnabled(s.previewFx);
        }));
      });

    return () => {
      disposed = true;
      unsubs.forEach((u) => u());
      if (ready) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={hostRef} className="canvas-host" />;
}
