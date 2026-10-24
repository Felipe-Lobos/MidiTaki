// Uso (desde la raíz del proyecto):
//   npm i -D @audio-samples/piano-velocity10
//   node scripts/copy-samples.mjs
// Copia las 30 muestras a public/samples/piano/ renombrándolas (D#1v10.ogg → Ds1.ogg).
import { mkdir, readdir, copyFile } from 'node:fs/promises';

const from = 'node_modules/@audio-samples/piano-velocity10/audio';
const to = 'public/samples/piano';
await mkdir(to, { recursive: true });

let n = 0;
for (const f of await readdir(from)) {
  if (!f.endsWith('.ogg')) continue;
  const name = f.replace('#', 's').replace(/v10\.ogg$/, '.ogg');
  await copyFile(`${from}/${f}`, `${to}/${name}`);
  n++;
}
console.log(`Copiadas ${n} muestras a ${to}`);
