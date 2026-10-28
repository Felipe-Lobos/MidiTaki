import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { Scene } from '../../render/Scene';
import { LOGICAL } from '../../core/format';
import { useSongStore } from '../../store/songStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { useStyleStore } from '../../store/styleStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUiStore } from '../../store/uiStore';
import { notify, useNoticeStore } from '../../store/noticeStore.ts';
import { t } from '../../i18n';

/**
 * La escena tiene un tamaño LÓGICO fijo (960×540 o 540×960). Aquí solo se escala con CSS
 * para que quepa, y se ajusta la resolución interna (1×–2×) para que se vea nítido.
 * Si el navegador pierde el contexto WebGL, al recuperarlo se vuelve a crear todo (gen + 1).
 */
export function PreviewCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [gen, setGen] = useState(0);

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

        const canvas = app.canvas as HTMLCanvasElement;
        const onLost = (e: Event) => {
          e.preventDefault(); // necesario para que el navegador pueda restaurar el contexto
          notify({ id: 'gfx', level: 'warn', text: t.notices.gfxLost });
        };
        const onRestored = () => {
          useNoticeStore.getState().dismiss('gfx');
          notify({ id: 'gfx-ok', level: 'info', text: t.notices.gfxRestored, timeoutMs: 4000 });
          setGen((g) => g + 1); // vuelve a crear la escena y sus texturas
        };
        canvas.addEventListener('webglcontextlost', onLost);
        canvas.addEventListener('webglcontextrestored', onRestored);
        unsubs.push(() => {
          canvas.removeEventListener('webglcontextlost', onLost);
          canvas.removeEventListener('webglcontextrestored', onRestored);
        });

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

        // Clic en el canvas: abre el panel en la pestaña de lo que se tocó (nota, teclado o fondo)
        const onClick = (e: MouseEvent) => {
          const r = canvas.getBoundingClientRect();
          const { w, h } = logical();
          const region = scene.hitTest(((e.clientX - r.left) / r.width) * w, ((e.clientY - r.top) / r.height) * h);
          useUiStore.getState().openTab(region === 'notes' ? 'notes' : region === 'keyboard' ? 'keyboard' : 'scene');
        };
        canvas.addEventListener('click', onClick);
        unsubs.push(() => canvas.removeEventListener('click', onClick));

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
      })
      .catch((e) => {
        console.error('[gfx] no se pudo iniciar Pixi:', e);
        notify({ id: 'gfx-init', level: 'error', text: t.notices.gfxInit });
      });

    return () => {
      disposed = true;
      unsubs.forEach((u) => u());
      if (ready) {
        try { app.destroy(true, { children: true }); } catch { /* el contexto ya estaba perdido */ }
      }
    };
  }, [gen]);

  return <div ref={hostRef} className="canvas-host" />;
}
