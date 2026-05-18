/**
 * Genera favicon.ico (16+32), apple-touch-icon.png (180×180),
 * icon-192.png e icon-512.png a partir de public/favicon.svg.
 *
 * Uso: npm run icons
 */
import sharp from 'sharp';
import toIco from 'to-ico';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC = resolve(__dirname, '../public');

const SVG = resolve(PUBLIC, 'favicon.svg');

async function pngBuffer(size) {
  const svg = await readFile(SVG);
  return sharp(svg).resize(size, size, { fit: 'contain' }).png().toBuffer();
}

async function pngFile(name, size) {
  const buffer = await pngBuffer(size);
  await writeFile(resolve(PUBLIC, name), buffer);
  console.log(`✓ ${name}  ${size}×${size}`);
}

await mkdir(PUBLIC, { recursive: true });

await pngFile('apple-touch-icon.png', 180);
await pngFile('icon-192.png', 192);
await pngFile('icon-512.png', 512);

const buf16 = await pngBuffer(16);
const buf32 = await pngBuffer(32);
const ico = await toIco([buf16, buf32]);
await writeFile(resolve(PUBLIC, 'favicon.ico'), ico);
console.log('✓ favicon.ico  16+32');

console.log('\nFavicons generados desde public/favicon.svg');
