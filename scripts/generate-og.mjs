/**
 * Genera public/og/default.png (1200×630) desde public/og/default.svg.
 *
 * Uso: npm run og
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC = resolve(__dirname, '../public/og/default.svg');
const OUT = resolve(__dirname, '../public/og/default.png');

const svg = await readFile(SRC);
const png = await sharp(svg).resize(1200, 630).png({ quality: 90 }).toBuffer();
await writeFile(OUT, png);

console.log('✓ public/og/default.png  1200×630');
