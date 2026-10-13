/**
 * App icons and Open Graph previews, generated from the logo and the hero image.
 * Run: npm run icons  (outputs to public/)
 */
import { mkdirSync, readFileSync } from 'node:fs';

import sharp from 'sharp';

const logo = readFileSync('public/favicon.svg');
const scaled = async (size: number) => sharp(logo, { density: 600 }).resize(size, size).png().toBuffer();

const run = async () => {
  await sharp(await scaled(180))
    .flatten({ background: '#0b0a10' })
    .toFile('public/apple-touch-icon.png');
  await sharp(await scaled(192)).toFile('public/icon-192.png');
  await sharp(await scaled(512)).toFile('public/icon-512.png');
  // Maskable: logo inside the 80% safe zone on a solid background
  const inner = await sharp(logo, { density: 600 }).resize(330, 330).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#0b0a10' } })
    .composite([{ input: inner, top: 91, left: 91 }])
    .png()
    .toFile('public/icon-maskable-512.png');

  mkdirSync('public/og', { recursive: true });
  const slogans: Record<string, [string, string]> = {
    ru: ['Клавиатуры,', 'которые хочется трогать'],
    en: ['Keyboards', 'you want to touch'],
    pl: ['Klawiatury,', 'których chce się dotykać'],
  };
  for (const [lang, [a, b]] of Object.entries(slogans)) {
    const text = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#050407" stop-opacity=".95"/><stop offset=".55" stop-color="#050407" stop-opacity=".55"/><stop offset="1" stop-color="#050407" stop-opacity="0"/></linearGradient></defs>
      <rect width="1200" height="630" fill="url(#g)"/>
      <text x="64" y="120" font-family="sans-serif" font-size="28" letter-spacing="6" fill="#f2a7bf">KŌBŌ KEYS · 工房</text>
      <text x="64" y="300" font-family="sans-serif" font-weight="800" font-size="76" fill="#f7f3ec">${a}</text>
      <text x="64" y="390" font-family="sans-serif" font-weight="800" font-size="60" fill="#f2a7bf">${b}</text>
      <text x="64" y="560" font-family="sans-serif" font-size="26" fill="#bdb6c8">antonzinchenko-dev.github.io/kobo-keys</text>
    </svg>`);
    await sharp('assets-src/marketing/hero.jpg')
      .resize(1200, 630, { fit: 'cover', position: 'right' })
      .composite([{ input: text }])
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(`public/og/og-${lang}.jpg`);
  }
  console.log('icons + og images ready');
};

void run();
