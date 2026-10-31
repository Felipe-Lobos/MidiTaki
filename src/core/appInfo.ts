export const APP = {
  name: 'MidiTaki',
  repoUrl: 'https://github.com/Felipe-Lobos/MidiTaki',
  author: 'Felipe Lobos',
  authorUrl: 'https://github.com/Felipe-Lobos',
  license: '',  // TODO: licencia del código, p. ej. 'MIT' (si queda vacío, no se muestra)
};

export const PIANO_CREDIT = {
  licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
  sourceUrl: 'https://archive.org/details/SalamanderGrandPianoV3',
};

// Mediabunny (MPL-2.0) y Salamander (CC BY 3.0) están verificados; el resto, comprobar con license-checker.
export const LIBRARIES = [
  { name: 'Pixi.js', license: 'MIT', url: 'https://pixijs.com' },
  { name: 'pixi-filters', license: 'MIT', url: 'https://github.com/pixijs/filters' },
  { name: 'React', license: 'MIT', url: 'https://react.dev' },
  { name: 'Zustand', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { name: 'react-colorful', license: 'MIT', url: 'https://github.com/omgovich/react-colorful' },
  { name: '@tonejs/midi', license: 'MIT', url: 'https://github.com/Tonejs/Midi' },
  { name: 'Mediabunny', license: 'MPL-2.0', url: 'https://mediabunny.dev' },
];
