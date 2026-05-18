/**
 * Genera 6 placeholders JPG para que el build resuelva las imágenes
 * mientras el cliente sube la sesión definitiva.
 *
 * Uso: node scripts/generate-placeholders.mjs
 *
 * Cuando el cliente entregue las imágenes finales, sólo hay que reemplazar
 * los archivos en public/img/ con los mismos nombres y dimensiones.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT = resolve(__dirname, '../public/img');

await mkdir(OUT, { recursive: true });

const palette = {
  black: '#050302',
  emerald: '#0E4434',
  emeraldDeep: '#06241C',
  gold: '#D4B266',
  goldSoft: '#A88B4E',
  ink: '#F4EAD4',
  chocolat: '#1F140A',
  blanc: '#C8BC9F',
  noir: '#1A1108',
};

const slots = [
  {
    file: 'yr_parfum_green.jpg',
    width: 1200,
    height: 1600,
    bg: palette.emerald,
    fg: palette.gold,
    label: 'YR PARFUM N°I',
    sub: 'Eau de Parfum · Pour Elle',
  },
  {
    file: 'yr_parfum_pink.jpg',
    width: 1200,
    height: 1500,
    bg: '#3A1C25',
    fg: palette.gold,
    label: 'YR PARFUM N°I',
    sub: 'Pour Elle · Pink Edition',
  },
  {
    file: 'yr_lingerie_colors.jpg',
    width: 2400,
    height: 1200,
    bg: palette.noir,
    fg: palette.gold,
    label: 'POUR ELLE — TRIO',
    sub: 'Noir · Chocolat · Blanc',
    triBg: [palette.noir, palette.chocolat, palette.blanc],
  },
  {
    file: 'yr_men_logo.jpg',
    width: 1200,
    height: 1600,
    bg: palette.black,
    fg: palette.gold,
    label: 'YR MEN',
    sub: 'Pour Lui · N°II',
  },
  {
    file: 'yr_men_collection.jpg',
    width: 1200,
    height: 1600,
    bg: '#0A0807',
    fg: palette.gold,
    label: 'YR MEN COLLECTION',
    sub: 'Soft Touch Premium',
  },
  {
    file: 'yr_golden_kiss.jpg',
    width: 1200,
    height: 1200,
    bg: '#2A1C0E',
    fg: palette.gold,
    label: 'GOLDEN KISS',
    sub: 'Lipgloss · N°IV',
  },
];

function buildSvg({ width, height, bg, fg, label, sub, triBg }) {
  const bgRect = triBg
    ? `
        <rect x="0" y="0" width="${width / 3}" height="${height}" fill="${triBg[0]}"/>
        <rect x="${width / 3}" y="0" width="${width / 3}" height="${height}" fill="${triBg[1]}"/>
        <rect x="${(width * 2) / 3}" y="0" width="${width / 3}" height="${height}" fill="${triBg[2]}"/>
      `
    : `<rect width="${width}" height="${height}" fill="${bg}"/>`;

  const cx = width / 2;
  const cy = height / 2;
  const emblemR = Math.min(width, height) * 0.08;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="100%" stop-color="rgba(5,3,2,0.65)"/>
      </radialGradient>
    </defs>
    ${bgRect}
    <rect width="${width}" height="${height}" fill="url(#vignette)"/>
    <circle cx="${cx}" cy="${cy - emblemR * 0.4}" r="${emblemR}" fill="none" stroke="${fg}" stroke-width="${emblemR * 0.05}" opacity="0.9"/>
    <text x="${cx}" y="${cy - emblemR * 0.2}" font-family="'Forum','Cormorant Garamond',serif" font-size="${emblemR * 0.7}" fill="${fg}" text-anchor="middle" letter-spacing="3">YR</text>
    <text x="${cx}" y="${cy + emblemR * 1.2}" font-family="'Forum','Cormorant Garamond',serif" font-size="${emblemR * 0.42}" fill="${fg}" text-anchor="middle" letter-spacing="10" opacity="0.92">${label}</text>
    <text x="${cx}" y="${cy + emblemR * 1.95}" font-family="'Cormorant Garamond',serif" font-style="italic" font-size="${emblemR * 0.32}" fill="${palette.ink}" text-anchor="middle" opacity="0.7">${sub}</text>
    <text x="${cx}" y="${height - emblemR * 0.6}" font-family="'Manrope',sans-serif" font-size="${emblemR * 0.22}" fill="${fg}" text-anchor="middle" letter-spacing="10" opacity="0.55">PLACEHOLDER · REEMPLAZAR</text>
  </svg>`;
}

for (const slot of slots) {
  const svg = buildSvg(slot);
  const out = resolve(OUT, slot.file);
  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(out);
  console.log(`✓ ${slot.file}  ${slot.width}×${slot.height}`);
}

console.log('\nPlaceholders generados en public/img/');
console.log('Reemplazá cada archivo manteniendo el mismo nombre cuando llegue la sesión final.');
