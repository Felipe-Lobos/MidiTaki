/** Todos los textos de la interfaz. Para añadir otro idioma: crear en.ts con la misma forma (tipo Strings). */
export const es = {
  app: { name: 'MidiTaki', tagline: 'De MIDI a video de notas en cascada' },
  common: { reset: 'Restablecer', cancel: 'Cancelar', close: 'Cerrar', retry: 'Reintentar', copied: 'Copiado' },

  top: {
    loadMidi: 'Cargar MIDI', noFile: 'Ningún archivo', effects: 'Efectos',
    effectsTitle: 'Solo afecta a la vista previa, no al video exportado',
    keyboardAuto: 'Teclado: automático', keys: (n: number) => `${n} teclas`,
    landscape: 'Horizontal 16:9', portrait: 'Vertical 9:16',
    export: 'Exportar', exportUnavailable: 'Este navegador no puede exportar video', about: 'Acerca de',
  },
  audioStatus: {
    idle: '', loading: 'Cargando piano…', ready: 'Piano listo',
    fallback: 'Sin muestras de piano: sonido de prueba', error: 'Error de audio',
  },
  transport: { play: 'Play', pause: 'Pausa' },

  tabs: { notes: 'Notas', keyboard: 'Teclado', scene: 'Escena', effects: 'Efectos', audio: 'Audio', presets: 'Presets' },
  notes: {
    color: 'Color', solid: 'Sólido', byPitch: 'Por altura', bass: 'Color graves', treble: 'Color agudos',
    radius: 'Esquinas', gap: 'Separación', opacity: 'Opacidad',
    velocity: 'La fuerza (velocity) afecta la opacidad',
    fill: 'Relleno', hollow: 'Hueco', outline: 'Grosor del borde',
  },
  keyboard: {
    outside: (n: number) => `${n} notas quedan fuera del rango del teclado y no se dibujan.`,
    fit: 'Ajustar teclado automáticamente',
    white: 'Teclas blancas', black: 'Teclas negras', pressed: 'Tecla pulsada',
    height: 'Altura del teclado', press: 'Profundidad al pulsar', hitLine: 'Línea de impacto', hitColor: 'Color de la línea',
  },
  scene: {
    background: 'Fondo', fall: 'Segundos visibles (menos = más rápido)',
    leadTail: 'Mostrar entrada y cola en la vista previa',
  },
  effects: {
    glow: 'Brillo neón (glow)', sync: 'Sincronizar tecla y brillo con el color de la nota',
    glowColor: 'Color del brillo', glowStrength: 'Intensidad del brillo', glowRadius: 'Radio del brillo',
    relief: 'Relieve 2.5D (notas y teclas)',
    note: 'El interruptor «Efectos» de la barra superior solo afecta a la vista previa; el video exportado siempre usa calidad completa.',
  },
  audio: {
    volume: 'Volumen general',
    note: 'Afecta a la reproducción y al audio exportado. No se guarda en los presets.',
  },
  presets: {
    exportJson: 'Exportar JSON', importJson: 'Importar JSON', resetStyle: 'Restablecer estilo',
    invalidJson: 'El archivo no es un JSON válido.', importFailed: 'No se pudo importar el preset.',
  },
  presetNames: { ocean: 'Océano', neonHollow: 'Neón hueco', neon: 'Neón', sunset: 'Atardecer', classic: 'Clásico' },

  export: {
    title: 'Exportar video', format: 'Formato', resolution: 'Resolución', content: 'Contenido',
    videoOnly: 'Solo video', videoAudio: 'Video + audio', lead: 'Entrada (s)', tail: 'Cola mín. (s)',
    duration: (time: string, frames: number) => `Duración ${time} · ${frames} frames`,
    tailExtends: ' · la cola se extiende hasta que el sonido decae',
    noEncode: 'Este navegador no puede codificar video a este tamaño. Prueba con 720p o usa Chrome/Edge actualizado.',
    webm: (codec: string) => `H.264 no está disponible: se exportará en WebM (${codec}).`,
    noAudioEncode: 'Este navegador no puede codificar audio: solo se puede exportar video.',
    opus: 'AAC no está disponible: el audio irá en Opus dentro del MP4. Algunos editores (p. ej. Premiere) lo leen peor.',
    samplesMissing: 'Las muestras de piano no están cargadas: el audio será el sonido de prueba, no el piano real.',
    lowMemory: 'Este dispositivo tiene poca memoria: el audio se genera de una vez en RAM. Para piezas largas puede fallar.',
    noFileSystem: 'Este navegador no puede guardar directo a disco: el video se arma en memoria y se descarga al final. Para piezas largas usa 720p.',
    keepVisible: 'Mantén esta pestaña visible y no cambies de ventana mientras se exporta: en segundo plano el navegador la ralentiza.',
    generatingAudio: 'Generando el audio…',
    progress: (frame: number, total: number, pct: number, fps: string, eta: string) =>
      `${frame} / ${total} frames (${pct}%) · ${fps} fps · faltan ≈ ${eta}`,
    doNotLeave: 'No cambies de pestaña ni cierres esta ventana.',
    wasHidden: 'La pestaña estuvo en segundo plano y la exportación se ralentizó. Mantenla visible.',
    start: 'Exportar',
    canceled: 'Exportación cancelada.',
    done: (name: string | null, audio: string | null) =>
      `${name ? `Guardado como ${name}` : 'Descarga iniciada.'} ${audio ? `(video + audio ${audio})` : '(solo video)'}`,
    creditHint: 'Si publicas este video, menciona el crédito del piano:',
    errPermission: 'No hay permiso para guardar en esa ubicación. Elige otra carpeta.',
    errDisk: 'No hay espacio suficiente en el disco.',
    errMemory: 'Se agotó la memoria. Prueba con 720p o con una pieza más corta.',
    errGeneric: 'No se pudo completar la exportación.',
    errAudioMismatch: 'El audio no coincide con la duración del video.',
    errCanvasSize: (w: number, h: number, ew: number, eh: number) =>
      `Tamaño de canvas inesperado: ${w}×${h} (se esperaba ${ew}×${eh}).`,
  },

  about: {
    open: 'Acerca de', title: 'Acerca de MidiTaki',
    description: 'MidiTaki convierte archivos MIDI de piano en videos de notas en cascada. «Taki» (滝) significa cascada en japonés.',
    privacy: 'Privacidad: tus archivos MIDI y los videos que generas nunca salen de tu navegador. MidiTaki no usa cuentas ni analíticas.',
    openSource: 'Código abierto', license: (name: string) => `Licencia: ${name}`, repo: 'Repositorio',
    creditsTitle: 'Créditos',
    pianoCredit: 'Piano: «Salamander Grand Piano V3», de Alexander Holm, bajo licencia CC BY 3.0. Las muestras se reproducen afinadas y mezcladas para cada nota.',
    creditAsk: 'Si publicas un video con el audio del piano, la licencia pide atribución. Texto sugerido:',
    creditLine: 'Piano: Salamander Grand Piano V3 de Alexander Holm (CC BY 3.0). Hecho con MidiTaki.',
    copyCredit: 'Copiar crédito',
    libraries: 'Librerías', noticesLink: 'Avisos de terceros y licencias',
    data: 'Datos guardados',
    dataText: 'Tus ajustes y tu estilo se guardan en este navegador (localStorage). Los MIDI no se guardan.',
    resetAll: 'Restablecer ajustes y estilo',
  },

  notices: {
    webCodecs: 'Tu navegador no admite WebCodecs: puedes editar y reproducir, pero no exportar video. Usa Chrome o Edge actualizados.',
    webAudio: 'Tu navegador no admite Web Audio: no habrá sonido ni exportación de audio.',
    gfxInit: 'No se pudieron iniciar los gráficos (WebGL). Revisa que la aceleración por hardware esté activada en el navegador.',
    gfxLost: 'Se perdió el contexto gráfico. Intentando recuperarlo…',
    gfxRestored: 'Gráficos recuperados.',
    samplesFailed: 'No se pudieron cargar las muestras del piano. Se usa un sonido de prueba.',
    audioInit: 'No se pudo iniciar el audio.',
    audioBlocked: 'El navegador bloqueó el audio. Pulsa Play de nuevo.',
    playFailed: 'No se pudo reproducir. Revisa la consola (F12).',
    midi: {
      invalid: 'No se pudo leer el archivo. ¿Es un MIDI válido (.mid o .midi)?',
      empty: 'El MIDI no contiene notas.',
      drumsOnly: 'El MIDI solo contiene percusión (canal 10), que MidiTaki no dibuja.',
      tooLarge: 'El archivo es demasiado grande para un MIDI normal (máximo 10 MB).',
      unknown: 'No se pudo cargar el archivo.',
    },
    longSong: (min: number) => `Esta pieza dura ${min} min: la exportación tardará y puede usar mucha memoria.`,
    restored: 'Ajustes restablecidos.',
  },

  unsupported: {
    title: 'Tu navegador no puede ejecutar MidiTaki',
    text: 'MidiTaki necesita WebGL para dibujar las notas. Usa una versión reciente de Chrome o Edge y comprueba que la aceleración por hardware esté activada.',
  },
};

export type Strings = typeof es;
