import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, WebMOutputFormat, type VideoCodec } from 'mediabunny';

export type EncoderRange = 'full' | 'limited' | 'unknown';

/**
 * ¿El encoder de Chrome entrega los datos en rango COMPLETO (negro = 0) o LIMITADO (negro = 16)?
 * Cambia según versión de Chrome, driver y encoder, y los reproductores que ignoran las etiquetas
 * (VLC, reproductor de Windows) asumen siempre limitado.
 *
 * Se codifica un fotograma negro con la MISMA configuración del export, se decodifica de vuelta y se
 * lee el valor Y (luma) real. Si algo falla, devuelve 'unknown' y no se toca nada.
 */
export async function probeEncoderRange(o: {
  codec: VideoCodec; bitrate: number; width: number; height: number;
  keyFrameInterval: number; container: 'mp4' | 'webm';
}): Promise<EncoderRange> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = o.width;
    canvas.height = o.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, o.width, o.height);

    const got: { data?: Uint8Array; type?: 'key' | 'delta'; ts?: number; config?: VideoDecoderConfig } = {};
    const output = new Output({
      format: o.container === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat(),
      target: new BufferTarget(),
    });
    const source = new CanvasSource(canvas, {
      codec: o.codec,
      bitrate: o.bitrate,
      keyFrameInterval: o.keyFrameInterval,
      onEncodedPacket: (p, meta) => {
        if (got.data) return;
        got.data = p.data.slice();
        got.type = p.type;
        got.ts = p.timestamp;
        got.config = meta?.decoderConfig;
      },
    });
    output.addVideoTrack(source, { frameRate: 60 });
    await output.start();
    await source.add(0, 1 / 60);
    await output.finalize();
    if (!got.data || !got.config) return 'unknown';

    const frame = await new Promise<VideoFrame | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), 3000);
      const dec = new VideoDecoder({
        output: (f) => { clearTimeout(timer); resolve(f); dec.close(); },
        error: () => { clearTimeout(timer); resolve(null); },
      });
      try {
        dec.configure(got.config!);
        dec.decode(new EncodedVideoChunk({ type: got.type!, timestamp: Math.round((got.ts ?? 0) * 1e6), data: got.data! }));
        dec.flush().catch(() => {});
      } catch { clearTimeout(timer); resolve(null); }
    });
    if (!frame) return 'unknown';

    const fmt = frame.format;
    if (!fmt || /^(RGB|BGR)/.test(fmt)) { frame.close(); return 'unknown'; } // ya convertido: no se puede medir
    const buf = new Uint8Array(frame.allocationSize());
    await frame.copyTo(buf); // formato nativo: el primer byte es Y del primer píxel
    frame.close();

    const y = buf[0];
    if (y <= 6) return 'full';
    if (y >= 12 && y <= 20) return 'limited';
    return 'unknown';
  } catch (e) {
    console.warn('[export] no se pudo medir el rango del encoder:', e);
    return 'unknown';
  }
}
