import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { Scene } from '../../render/Scene';
import { defaultStyle } from '../../core/style/schema';
import { useSongStore } from '../../store/songStore';
import { usePlaybackStore } from '../../store/playbackStore';

export function PreviewCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current!;
    const app = new Application();
    let disposed = false;
    let ready = false;
    const unsubs: Array<() => void> = [];

    app
      .init({
        resizeTo: host,
        background: defaultStyle.background,
        antialias: true,
        resolution: window.devicePixelRatio,
        autoDensity: true,
      })
      .then(() => {
        // React en desarrollo monta/desmonta dos veces: protegemos ese caso
        if (disposed) { app.destroy(true); return; }
        ready = true;
        host.appendChild(app.canvas);

        const scene = new Scene(app, defaultStyle);
        const sync = () => {
          const { song, range } = useSongStore.getState();
          scene.setSong(song, range);
          scene.renderFrame(usePlaybackStore.getState().time);
        };
        app.renderer.on('resize', (w: number, h: number) => scene.resize(w, h));
        sync();

        // Pixi se actualiza directo desde los stores, sin re-renderizar React
        unsubs.push(useSongStore.subscribe(sync));
        unsubs.push(usePlaybackStore.subscribe((s) => scene.renderFrame(s.time)));
      });

    return () => {
      disposed = true;
      unsubs.forEach((u) => u());
      if (ready) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={hostRef} className="canvas-host" />;
}
