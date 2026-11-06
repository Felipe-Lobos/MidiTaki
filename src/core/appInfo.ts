export const APP = {
  name: 'MidiTaki',
  repoUrl: 'https://github.com/Felipe-Lobos/MidiTaki',
  author: 'Felipe Lobos',
  authorUrl: 'https://github.com/Felipe-Lobos',
  license: 'AGPL-3.0-or-later',  // licencia del código (si queda vacío, no se muestra)
  licenseUrl: 'https://github.com/Felipe-Lobos/MidiTaki/blob/main/LICENSE',
};

export const PIANO_CREDIT = {
  licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
  sourceUrl: 'https://archive.org/details/SalamanderGrandPianoV3',
};

// Verificado con `npx license-checker --production --summary` (nov 2026). Para añadir una librería, repetirlo y actualizar
// public/THIRD_PARTY_NOTICES.txt; el texto completo de cada licencia va en public/THIRD_PARTY_LICENSES.txt (npm run licencias).
export const LIBRARIES = [
  { name: 'Pixi.js', license: 'MIT', url: 'https://pixijs.com' },
  { name: 'pixi-filters', license: 'MIT', url: 'https://github.com/pixijs/filters' },
  { name: 'React', license: 'MIT', url: 'https://react.dev' },
  { name: 'Zustand', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { name: 'react-colorful', license: 'MIT', url: 'https://github.com/omgovich/react-colorful' },
  { name: '@tonejs/midi', license: 'MIT', url: 'https://github.com/Tonejs/Midi' },
  { name: 'Mediabunny', license: 'MPL-2.0', url: 'https://mediabunny.dev' },
  { name: 'Inter (tipografía)', license: 'OFL-1.1', url: 'https://rsms.me/inter/' },
  { name: 'Space Grotesk (tipografía)', license: 'OFL-1.1', url: 'https://github.com/floriankarsten/space-grotesk' },
];
