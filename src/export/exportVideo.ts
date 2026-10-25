import { Application } from 'pixi.js';
import {
  BufferTarget, CanvasSource, Mp4OutputFormat, Output, StreamTarget, WebMOutputFormat,
  type StreamTargetChunk,
} from 'mediabunny';
import { Scene } from '../render/Scene';
import type { Song } from '../core/midi/types';
import { LOGICAL, outputSize } from '../core/format';
import { useExportStore, type ExportQuality } from '../store/exportStore';
import { useSongStore } from '../store/songStore';
import { useStyleStore } from '../store/styleStore';
import { useSettingsStore } from '../store/settingsStore';

export const FPS = 60;
const BITRATE_1080: Record<ExportQuality, number> = { normal: 8e6, high: 12e6, max: 20e6 };

export const bitrateFor = (q: ExportQuality, width: number, height: number) =>
  Math.round((BITRATE_1080[q] * width * height) / (1920 * 1080));

export const totalFrames = (song: Song, leadIn: number, tail: number) =>
  Math.ceil((leadIn + song.duration + tail) * FPS);

interface SaveHandle {
  name: string;
  createWritable(): Promise<FileSystemWritableFileStream>;
  remove?(): Promise<void>;
}
type Picker = (o: {
  suggestedName: string;
  types: { description: string; accept: Record<string, string[]> }[];
}) => Promise<SaveHandle>;

let controller: AbortController | null = null;
export const cancelExport = () => controller?.abort();

const set = (p: Partial<ReturnType<typeof useExportStore.getState>>) => useExportStore.getState().patch(p);

/**
 * Exporta el video. Se llama DIRECTAMENTE desde un clic: lo primero que hace es abrir el
 * selector de archivo, que solo se permite con un gesto reciente del usuario.
 */
export async function startExport(): Promise<void> {
  const ex = useExportStore.getState();
  const { song, range, fileName } = useSongStore.getState();
  const style = useStyleStore.getState().style;
  const format = useSettingsStore.getState().format;
  const support = ex.support;
  if (!song || !support?.container || !support.codec) return;

  const container = support.container;
  const ext = container === 'mp4' ? 'mp4' : 'webm';
  const mime = container === 'mp4' ? 'video/mp4' : 'video/webm';
  const baseName = (fileName || 'midi').replace(/\.midi?$/i, '');

  // 1) Destino: directo a disco si el navegador lo permite (Chrome de escritorio)
  let handle: SaveHandle | null = null;
  const picker = (window as unknown as { showSaveFilePicker?: Picker }).showSaveFilePicker;
  if (picker) {
    try {
      handle = await picker({
        suggestedName: `${baseName}.${ext}`,
        types: [{ description: 'Video', accept: { [mime]: [`.${ext}`] } }],
      });
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return; // el usuario cerró el selector
      throw e;
    }
  }

  const size = outputSize(format, ex.resolution);
  const { w: lw, h: lh } = LOGICAL[format];
  const bitrate = bitrateFor(ex.quality, size.width, size.height);
  const total = totalFrames(song, ex.leadIn, ex.tail);
  const ctl = (controller = new AbortController());

  set({ phase: 'running', message: null, progress: { frame: 0, total, fps: 0, etaSec: 0 } });
  const wake = await navigator.wakeLock?.request('screen').catch(() => null);

  let app: Application | null = null;
  let output: Output | null = null;
  try {
    // 2) Renderer propio, fuera de pantalla, a la resolución final
    app = new Application();
    await app.init({
      width: lw, height: lh, resolution: size.scale, autoDensity: false, antialias: true,
      background: style.background, autoStart: false, preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    app.ticker.stop();
    const canvas = app.canvas as HTMLCanvasElement;
    if (canvas.width !== size.width || canvas.height !== size.height || canvas.width % 2 || canvas.height % 2) {
      throw new Error(`Tamaño de canvas inesperado: ${canvas.width}×${canvas.height} (se esperaba ${size.width}×${size.height}).`);
    }

    const scene = new Scene(app, style); // efectos SIEMPRE activos en el export
    scene.setSong(song, range);

    // 3) Salida
    const target = handle
      ? new StreamTarget((await handle.createWritable()) as unknown as WritableStream<StreamTargetChunk>, { chunked: true })
      : new BufferTarget();
    output = new Output({ format: container === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat(), target });
    const source = new CanvasSource(canvas, { codec: support.codec, bitrate });
    output.addVideoTrack(source, { frameRate: FPS });
    await output.start();

    // 4) Bucle de frames: t depende SOLO del número de frame (determinista)
    const started = performance.now();
    for (let i = 0; i < total; i++) {
      if (ctl.signal.aborted) break;
      scene.renderFrame(i / FPS - ex.leadIn);
      app.render();
      await source.add(i / FPS, 1 / FPS); // aplica contrapresión si el encoder va lento
      if (i % 10 === 9 || i === total - 1) {
        const fps = (i + 1) / ((performance.now() - started) / 1000);
        set({ progress: { frame: i + 1, total, fps, etaSec: (total - i - 1) / fps } });
        await new Promise((r) => setTimeout(r, 0)); // deja respirar a la interfaz
      }
    }

    if (ctl.signal.aborted) {
      await output.cancel();
      await handle?.remove?.().catch(() => {});
      set({ phase: 'canceled', message: 'Exportación cancelada.' });
      return;
    }

    await output.finalize();
    if (!handle) { // memoria → descarga
      const buf = (output.target as BufferTarget).buffer;
      if (buf) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([buf], { type: mime }));
        a.download = `${baseName}.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      }
    }
    set({ phase: 'done', message: handle ? `Guardado como ${handle.name}` : 'Descarga iniciada.' });
  } catch (e) {
    console.error('[export] falló:', e);
    try { if (output && output.state === 'started') await output.cancel(); } catch { /* ya cerrado */ }
    await handle?.remove?.().catch(() => {});
    set({ phase: 'error', message: e instanceof Error ? e.message : 'Error desconocido al exportar.' });
  } finally {
    await wake?.release().catch(() => {});
    app?.destroy(true, { children: true });
    controller = null;
  }
}
