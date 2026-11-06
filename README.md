<p align="center">
  <img src="public/favicon.svg" alt="Logo de MidiTaki" width="96" height="96" />
</p>

<h1 align="center">MidiTaki</h1>

<p align="center">
  <strong>De MIDI a video de notas en cascada.</strong><br />
  Gratis, de código abierto y 100 % en tu navegador.
</p>

<p align="center">
  <a href="https://felipe-lobos.github.io/miditaki/"><strong>▶ Abrir la aplicación</strong></a>
  &nbsp;·&nbsp;
  <a href="#english">English</a>
</p>

<!-- Añade aquí una captura o GIF del editor, por ejemplo: -->
<!-- <p align="center"><img src="docs/captura.png" alt="MidiTaki mostrando notas cayendo sobre un teclado" width="860" /></p> -->

## ¿Qué es?

MidiTaki carga un archivo MIDI de piano, dibuja las notas cayendo sobre un teclado, lo reproduce con sonido de piano y exporta el resultado como video MP4. Todo ocurre en tu navegador: no hay cuentas, no hay servidores y tus archivos no se suben a ninguna parte.

«Taki» (滝) significa *cascada* en japonés.

## Características

- **Notas en cascada** sobre un teclado de 88, 61 u otro tamaño (o automático según el MIDI).
- **Sonido de piano** en la vista previa, con muestras reales (Salamander Grand Piano V3).
- **Estilo personalizable:** colores de notas por altura, teclas y fondo; forma y relleno de las notas; brillo (glow), relieve 2.5D, partículas y línea de impacto.
- **Presets** para guardar, importar y exportar tu estilo.
- **Formatos horizontal (16:9) y vertical (9:16)**, listos para YouTube, Shorts, Reels o TikTok.
- **Exportación a MP4 a 60 fps** en 720p o 1080p, con o sin audio.
- **Privado:** tus ajustes se guardan solo en tu navegador y los MIDI nunca se guardan.

## Cómo se usa

1. Abre [la aplicación](https://felipe-lobos.github.io/miditaki/) y arrastra un archivo `.mid` o `.midi` de piano (o pulsa **Cargar MIDI**).
2. Pulsa **Play** y ajusta colores, efectos y partículas en el panel lateral.
3. Pulsa **Exportar**, elige formato, resolución y si quieres audio, y espera a que termine. Mantén la pestaña visible mientras se exporta.

**Atajos:** `Espacio` play/pausa · `←` `→` ±2 s (con `Shift` ±10 s) · `M` silenciar.

## Requisitos

- Un navegador moderno con WebGL y Web Audio.
- **Para exportar video** hace falta WebCodecs: usa **Chrome o Edge** actualizados. En otros navegadores puedes editar y reproducir, pero no exportar.

## Desarrollo

<!-- Comprueba que estos comandos coinciden con los scripts de tu package.json -->

Requiere [Node.js](https://nodejs.org/) (versión LTS reciente) y npm.

```bash
git clone https://github.com/Felipe-Lobos/miditaki.git
cd MidiTaki
npm install

# Muestras de piano (se copian a public/samples/piano/)
node scripts/copy-samples.mjs

npm run dev      # servidor de desarrollo
npm run build    # compilación de producción en dist/
npm run preview  # previsualizar la compilación
```

La aplicación se publica en GitHub Pages; la ruta base se configura en `vite.config.ts`.

### Estructura de `src/`

| Carpeta | Contenido |
|---|---|
| `render/` | Escena de Pixi.js: notas, teclado, efectos y partículas |
| `audio/` | Sampler de piano y renderizado de audio sin conexión |
| `playback/` | Reloj y transporte (play, pausa, posición) |
| `export/` | Codificación de video y audio a MP4 |
| `core/` | Utilidades y tipos compartidos |
| `store/` | Estado de la interfaz, estilo y ajustes (Zustand) |
| `ui/` | Componentes de React y paneles |
| `i18n/` | Textos de la interfaz (`es.ts`) |

## Tecnologías

[Vite](https://vite.dev) · [React 19](https://react.dev) · TypeScript · [Zustand](https://github.com/pmndrs/zustand) · [Pixi.js](https://pixijs.com) · [pixi-filters](https://github.com/pixijs/filters) · [react-colorful](https://github.com/omgovich/react-colorful) · [@tonejs/midi](https://github.com/Tonejs/Midi) · [Mediabunny](https://mediabunny.dev) · tipografías [Inter](https://rsms.me/inter/) y [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (SIL OFL) vía [Fontsource](https://fontsource.org).

## Sobre el desarrollo

MidiTaki fue desarrollado con inteligencia artificial: la mayor parte del código fue escrita por [Claude](https://claude.ai) (Anthropic) a partir de mis instrucciones. Mi papel fue el de dirigir el proyecto: decidir qué hace la aplicación y cómo se ve, definir las funcionalidades y la identidad visual, revisar los resultados, probarlos en mi equipo y pedir los ajustes necesarios. No soy [desarrollador profesional / experto en gráficos y codificación de video: ajusta esto].

Lo cuento por transparencia, y porque tiene consecuencias prácticas:

- Puede haber errores o decisiones de diseño que yo no habría detectado con facilidad. [He probado la aplicación principalmente en Chrome sobre Windows.]
- No he auditado cada línea del código. Si encuentras un fallo o ves algo mejorable, abre un *issue* o un *pull request*: serán bienvenidos.
- Los créditos de terceros (piano, librerías y tipografías) están detallados arriba y en `THIRD_PARTY_NOTICES.txt`.

## Créditos

- **Piano:** «Salamander Grand Piano V3», de Alexander Holm, bajo licencia [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) ([fuente](https://archive.org/details/SalamanderGrandPianoV3)). Si publicas un video con el audio del piano, menciona el crédito:
  > Piano: Salamander Grand Piano V3 de Alexander Holm (CC BY 3.0). Hecho con MidiTaki.
- Resumen de licencias de terceros: [`THIRD_PARTY_NOTICES.txt`](public/THIRD_PARTY_NOTICES.txt). Texto completo de cada licencia: `THIRD_PARTY_LICENSES.txt` (se genera con `npm run licencias`).


## Licencia
El código de MidiTaki se distribuye bajo la licencia GNU AGPL v3 o posterior (ver `LICENSE`).
Puedes usarlo, estudiarlo y modificarlo; si distribuyes una versión modificada, o la ofreces como servicio por red,
debes publicar su código fuente bajo la misma licencia.
Los videos que generes y tus archivos MIDI son tuyos: la licencia cubre el código, no tu contenido.
Las librerías y tipografías de terceros mantienen sus propias licencias (ver `public/THIRD_PARTY_NOTICES.txt`),
y las muestras de piano son «Salamander Grand Piano V3», de Alexander Holm, bajo CC BY 3.0.

## Autor

Creado por [Felipe Lobos](https://github.com/Felipe-Lobos).

---

<a id="english"></a>

## English

**MidiTaki** turns a piano MIDI file into a falling-notes video. It draws the notes falling onto a keyboard, plays them with real piano samples, and exports an MP4. Everything runs in your browser: no accounts, no servers, and your files are never uploaded. *Taki* (滝) means "waterfall" in Japanese.

**[▶ Open the app](https://felipe-lobos.github.io/miditaki/)**

### Features

- Falling notes over an 88-key, 61-key or auto-sized keyboard.
- Piano sound in the preview (Salamander Grand Piano V3 samples).
- Customizable style: pitch-based note colors, key and background colors, note shape and fill, glow, 2.5D relief, particles and hit line.
- Presets to save, import and export your style.
- Landscape (16:9) and portrait (9:16) formats for YouTube, Shorts, Reels and TikTok.
- 60 fps MP4 export at 720p or 1080p, with or without audio.
- Private by design: settings are stored only in your browser, and MIDI files are never stored.

### How to use

1. Open the app and drop a piano `.mid` / `.midi` file, or click **Cargar MIDI** (Load MIDI).
2. Press **Play** and tweak colors, effects and particles in the side panel.
3. Press **Exportar** (Export), choose format, resolution and audio, and wait for it to finish. Keep the tab visible while exporting.

Shortcuts: `Space` play/pause · `←` `→` ±2 s (`Shift` ±10 s) · `M` mute.

> The interface is currently in Spanish only.

### Requirements

A modern browser with WebGL and Web Audio. **Video export requires WebCodecs**, so use an up-to-date **Chrome or Edge**. Other browsers can edit and preview but not export.

### Development

```bash
git clone https://github.com/Felipe-Lobos/miditaki.git
cd MidiTaki
npm install
node scripts/copy-samples.mjs   # copies the piano samples to public/samples/piano/
npm run dev
```

Built with Vite, React 19, TypeScript, Zustand, Pixi.js, @tonejs/midi and Mediabunny.

### About the development

MidiTaki was built with AI assistance: most of the code was written by [Claude](https://claude.ai) (Anthropic) from my instructions. My role was to direct the project: deciding what the app does and how it looks, defining features and visual identity, reviewing results, testing them on my machine and requesting changes. [I am not a professional developer: adjust this.]

I'm sharing this for transparency and because it has practical implications: there may be bugs I could not easily spot, I have not audited every line, and issues and pull requests are welcome.

### Credits and license

Piano: "Salamander Grand Piano V3" by Alexander Holm, licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). If you publish a video with the piano audio, please credit it. Third-party licenses are summarized in [`THIRD_PARTY_NOTICES.txt`](public/THIRD_PARTY_NOTICES.txt), with full texts in `THIRD_PARTY_LICENSES.txt` (generated by `npm run licencias`).

The license for the source code has not been chosen yet.

Created by [Felipe Lobos](https://github.com/Felipe-Lobos).
