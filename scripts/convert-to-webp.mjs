/**
 * Convierte a WebP las imágenes JPG de public/img/ que pesen más de 200 KB.
 *
 * Uso: npm run webp
 *
 * Importante: NO borra el JPG original. Para hacerlo:
 *   1. Verificá manualmente que el .webp aparece en public/img/.
 *   2. Actualizá los paths en src/data/*.json y src/styles/global.css
 *      (los background-image: url('/img/foo.jpg') → url('/img/foo.webp')).
 *   3. Recién entonces eliminá el JPG correspondiente.
 */
import sharp from 'sharp';
import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIR = resolve(__dirname, '../public/img');
const THRESHOLD_KB = 200;

const files = await readdir(DIR);
const targets = files.filter((f) => /\.jpe?g$/i.test(f));

if (!targets.length) {
  console.log('No hay JPGs en public/img/.');
  process.exit(0);
}

let converted = 0;
let skipped = 0;

for (const file of targets) {
  const path = resolve(DIR, file);
  const { size } = await stat(path);
  const kb = size / 1024;
  if (kb < THRESHOLD_KB) {
    console.log(`· skip  ${file}  (${kb.toFixed(1)} KB < ${THRESHOLD_KB} KB)`);
    skipped++;
    continue;
  }
  const buf = await readFile(path);
  const out = resolve(DIR, basename(file, extname(file)) + '.webp');
  await sharp(buf).webp({ quality: 80 }).toFile(out);
  const { size: newSize } = await stat(out);
  const savings = ((1 - newSize / size) * 100).toFixed(1);
  console.log(
    `✓ ${file}  →  ${basename(out)}  (${kb.toFixed(1)} KB → ${(newSize / 1024).toFixed(1)} KB, -${savings}%)`,
  );
  converted++;
}

console.log(`\nConvertidos: ${converted} · Saltados: ${skipped}`);
if (converted > 0) {
  console.log(
    '\nPróximo paso: actualizá manualmente los paths .jpg → .webp en JSON / CSS\n' +
      'y borrá los JPG originales cuando confirmés que todo apunta a los WebP.',
  );
}
