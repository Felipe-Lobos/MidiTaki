import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { Scene } from '../../render/Scene';
import { useSongStore } from '../../store/songStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { useStyleStore } from '../../store/styleStore';

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
        background: useStyleStore.getState().style.background,
        antialias: true,
        resolution: window.devicePixelRatio,
        autoDensity: true,
      })
      .then(() => {
        if (disposed) { app.destroy(true); return; }
        ready = true;
        host.appendChild(app.canvas);

        const scene = new Scene(app, useStyleStore.getState().style);
        const sync = () => {
          const { song, range } = useSongStore.getState();
          scene.setSong(song, range);
          scene.renderFrame(usePlaybackStore.getState().time);
        };
        app.renderer.on('resize', (w: number, h: number) => scene.resize(w, h));
        sync();

        unsubs.push(useSongStore.subscribe(sync));
        unsubs.push(usePlaybackStore.subscribe((s) => scene.renderFrame(s.time)));
        unsubs.push(useStyleStore.subscribe((s, prev) => {
          if (s.style !== prev.style) scene.setStyle(s.style);
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
