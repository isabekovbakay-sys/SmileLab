// Генерирует иконки приложения, сплэш и favicon из SVG-знака (зуб с улыбкой).
// Запуск: npm run icons. Цвета — те же, что в src/theme/colors.ts.
import { Buffer } from 'node:buffer';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const HERO = '#0F4C53';
const HERO_LIGHT = '#1B6A72';
const ACCENT = '#FF7A59';
const WHITE = '#FFFFFF';

const TOOTH =
  'M24 9.5C21 9.5 18.6 7 14.2 7 8.6 7 5 11.4 5 17.4c0 6.8 3 10 4.4 16.4 1.2 5.6 2.2 9.2 5.2 9.2 3.2 0 3.8-4.4 4.8-8.6.8-3.4 2.2-5 4.6-5s3.8 1.6 4.6 5c1 4.2 1.6 8.6 4.8 8.6 3 0 4-3.6 5.2-9.2C40 27.4 43 24.2 43 17.4 43 11.4 39.4 7 33.8 7 29.4 7 27 9.5 24 9.5Z';
const SMILE = 'M15.5 18.5Q24 25.5 32.5 18.5';

/** Знак, вписанный в квадрат size с долей scale (0..1) от размера. */
function mark({ size, scale, tooth = WHITE, smile = ACCENT }) {
  const s = (size * scale) / 48;
  const offset = (size - 48 * s) / 2;
  return `<g transform="translate(${offset} ${offset}) scale(${s})">
    <path d="${TOOTH}" fill="${tooth}"/>
    <path d="${SMILE}" stroke="${smile}" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  </g>`;
}

const svg = (size, body, background) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${background ?? ''}${body}</svg>`);

const gradientBg = (size, radius = 0) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
  <stop offset="0" stop-color="${HERO_LIGHT}"/><stop offset="1" stop-color="${HERO}"/></linearGradient></defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>`;

const out = 'assets/images';
await mkdir(out, { recursive: true });

const jobs = [
  // Иконка приложения (iOS/общая) — без прозрачности.
  ['icon.png', 1024, svg(1024, mark({ size: 1024, scale: 0.62 }), gradientBg(1024))],
  // Android adaptive: передний план в безопасной зоне (≈ 66% от 108dp).
  ['adaptive-foreground.png', 1024, svg(1024, mark({ size: 1024, scale: 0.46 }))],
  ['adaptive-background.png', 1024, svg(1024, '', gradientBg(1024))],
  ['adaptive-monochrome.png', 1024, svg(1024, mark({ size: 1024, scale: 0.46, tooth: WHITE, smile: '#000000' }))],
  // Сплэш: знак на прозрачном фоне (фон задаёт плагин expo-splash-screen).
  ['splash-icon.png', 1024, svg(1024, mark({ size: 1024, scale: 0.9 }))],
  ['favicon.png', 96, svg(96, mark({ size: 96, scale: 0.7 }), gradientBg(96, 20))],
  // Google Play: 512×512, без прозрачности.
  ['../../store/google-play/icon-512.png', 512, svg(512, mark({ size: 512, scale: 0.62 }), gradientBg(512))],
];

for (const [file, size, input] of jobs) {
  await sharp(input, { density: 72 }).resize(size, size).png().toFile(`${out}/${file}`);
  console.log(`✓ ${file}`);
}
