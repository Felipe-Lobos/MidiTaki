import { Application } from 'pixi.js';
import {
  AudioBufferSource, BufferTarget, CanvasSource, Mp4OutputFormat, Output, StreamTarget, WebMOutputFormat,
  type StreamTargetChunk,
} from 'mediabunny';
import { Scene } from '../render/Scene';
import { probeEncoderRange } from './rangeProbe';
import type { Song } from '../core/midi/types';
import { LOGICAL, outputSize } from '../core/format';
import { AUDIO_BITRATE, AUDIO_RATE, renderAudio, sliceBuffer } from '../audio/renderOffline';
import { transport } from '../playback/Transport';
import { useExportStore } from '../store/exportStore';
import { useSongStore } from '../store/songStore';
import { useStyleStore } from '../store/styleStore';
import { useSettingsStore } from '../store/settingsStore';

export const FPS = 60;

// Cada cuántos segundos se fuerza un fotograma clave. Con 2 s (valor por defecto del encoder) quedaban
// "estelas" de bloques viejos tras las notas; 0.5 y 0.25 las eliminaron en las pruebas.
const KEYFRAME_SECONDS = 0.5;
/**
 * Objetivo de bitrate. Con este contenido el encoder de Chrome usa mucho menos (≈1–2 Mbps) y el valor
 * apenas influye, así que ya no es una opción del usuario; la calidad depende de KEYFRAME_SECONDS.
 */
export const bitrateFor = (width: number, height: number) => Math.round((12e6 * width * height) / (1920 * 1080));

/** Último instante en que alguna nota sigue sonando (incluye el pedal). */
export function soundEnd(song: Song) {
  let end = 0;
  for (const n of song.notes) end = Math.max(end, n.start + n.soundDuration);
  return end;
}

/** Duración total del video. Con audio se extiende hasta que el sonido decae (+0,5 s de fundido). */
export function exportSeconds(song: Song, leadIn: number, tail: number, withAudio: boolean) {
  const base = song.duration + tail;
  const end = withAudio ? Math.max(base, Math.min(soundEnd(song), song.duration + 10) + 0.5) : base;
  return leadIn + end;
}
export const totalFrames = (song: Song, leadIn: number, tail: number, withAudio: boolean) =>
  Math.ceil(exportSeconds(song, leadIn, tail, withAudio) * FPS);

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
 * Se llama DIRECTAMENTE desde un clic: lo primero es abrir el selector de archivo,
 * que solo se permite con un gesto reciente del usuario.
 */
export async function startExport(): Promise<void> {
  const ex = useExportStore.getState();
  const { song, range, fileName } = useSongStore.getState();
  const style = useStyleStore.getState().style;
  const { format, volume } = useSettingsStore.getState();
  const support = ex.support;
  if (!song || !support?.container || !support.codec) return;

  const withAudio = ex.withAudio && !!support.audioCodec;
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
  const bitrate = bitrateFor(size.width, size.height);
  const total = totalFrames(song, ex.leadIn, ex.tail, withAudio);
  const ctl = (controller = new AbortController());

  set({ phase: 'running', stage: withAudio ? 'audio' : 'video', message: null, progress: { frame: 0, total, fps: 0, etaSec: 0 } });
  const wake = await navigator.wakeLock?.request('screen').catch(() => null);

  let app: Application | null = null;
  let output: Output | null = null;
  const canceled = async () => {
    try { if (output && output.state === 'started') await output.cancel(); } catch { /* ya cerrado */ }
    await handle?.remove?.().catch(() => {});
    set({ phase: 'canceled', message: 'Exportación cancelada.' });
  };

  try {
    // 2) Audio PRIMERO: si algo falla, se sabe al principio y no tras minutos de render
    let audio: AudioBuffer | null = null;
    if (withAudio) {
      await transport.init(); // asegura que las muestras de piano estén cargadas
      audio = await renderAudio(song, { leadIn: ex.leadIn, frames: total, fps: FPS, volume });
      if (audio.length !== total * (AUDIO_RATE / FPS)) throw new Error('El audio no coincide con la duración del video.');
      if (ctl.signal.aborted) return await canceled();
    }
    set({ stage: 'video' });

    // 3) Renderer propio, fuera de pantalla, a la resolución final
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

    // 3b) ¿El encoder entrega rango completo o limitado? Si es completo, se comprime el render a 16–235
    const rangeMode = await probeEncoderRange({
      codec: support.codec, bitrate, width: size.width, height: size.height,
      keyFrameInterval: KEYFRAME_SECONDS, container,
    });
    console.info('[export] rango de color del encoder:', rangeMode);
    if (rangeMode === 'full') scene.compressToLimitedRange();

    // 4) Salida
    const target = handle
      ? new StreamTarget((await handle.createWritable()) as unknown as WritableStream<StreamTargetChunk>, { chunked: true })
      : new BufferTarget();
    output = new Output({ format: container === 'mp4' ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat(), target });
    const source = new CanvasSource(canvas, {
      codec: support.codec,
      bitrate,
      keyFrameInterval: KEYFRAME_SECONDS,
      // El encoder de Chrome etiqueta el color como sRGB y YouTube oscurecía el video: se declara BT.709
      // con rango limitado (estándar SDR). Depende de que Mediabunny lea este objeto después del callback;
      // tras actualizar la librería, comprueba en MediaInfo que sigue apareciendo BT.709.
      onEncodedPacket: (_p, meta) => {
        const cs = meta?.decoderConfig?.colorSpace as
          { primaries?: string; transfer?: string; matrix?: string; fullRange?: boolean } | undefined;
        // Solo si se midió el rango: los datos ya son limitados y se declara como tal
        if (cs && rangeMode !== 'unknown') { cs.primaries = 'bt709'; cs.transfer = 'bt709'; cs.matrix = 'bt709'; cs.fullRange = false; }
      },
    });
    output.addVideoTrack(source, { frameRate: FPS });
    const audioSource = audio ? new AudioBufferSource({ codec: support.audioCodec!, bitrate: AUDIO_BITRATE }) : null;
    if (audioSource) output.addAudioTrack(audioSource);
    await output.start();

    // 5) Bucle: t depende SOLO del número de frame. El audio se intercala en trozos de 1 s.
    const started = performance.now();
    for (let i = 0; i < total; i++) {
      if (ctl.signal.aborted) break;
      if (audio && audioSource && i % FPS === 0) {
        const from = (i / FPS) * AUDIO_RATE;
        await audioSource.add(sliceBuffer(audio, from, Math.min(from + AUDIO_RATE, audio.length)));
      }
      scene.renderFrame(i / FPS - ex.leadIn);
      app.render();
      await source.add(i / FPS, 1 / FPS); // contrapresión si el encoder va lento
      if (i % 10 === 9 || i === total - 1) {
        const fps = (i + 1) / ((performance.now() - started) / 1000);
        set({ progress: { frame: i + 1, total, fps, etaSec: (total - i - 1) / fps } });
        await new Promise((r) => setTimeout(r, 0)); // deja respirar a la interfaz
      }
    }
    if (ctl.signal.aborted) return await canceled();

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
    set({ phase: 'done', message: `${handle ? `Guardado como ${handle.name}` : 'Descarga iniciada.'} ${withAudio ? `(video + audio ${support.audioCodec})` : '(solo video)'}` });
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
