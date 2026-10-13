/**
 * Image pipeline (runs locally, before the build — GitHub Pages can't resize on the fly).
 *
 *   assets-src/<slot>.(png|jpg|jpeg|webp)  →  public/img/<slot>-<width>.(avif|webp|jpg)
 *                                           →  src/shared/images/manifest.generated.json
 *
 * The manifest stores real size, a ~300 B blurred placeholder and the dominant colour.
 * Unchanged sources are skipped (content hash), so re-runs are fast.
 * Slots without a source keep using the stock photo from src/shared/images/stock.ts.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'assets-src');
const OUT = join(root, 'public', 'img');
const MANIFEST = join(root, 'src', 'shared', 'images', 'manifest.generated.json');
const WIDTHS = [480, 768, 1080, 1440, 1920, 2560];
const FALLBACK_JPG_WIDTH = 1080;

export interface ManifestEntry {
  width: number;
  height: number;
  widths: number[];
  jpg: number;
  blur: string;
  color: string;
  hash: string;
}

const walk = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((name) => {
        const full = join(dir, name);
        return statSync(full).isDirectory() ? walk(full) : [full];
      })
    : [];

const manifest: Record<string, ManifestEntry> = existsSync(MANIFEST)
  ? (JSON.parse(readFileSync(MANIFEST, 'utf8')) as Record<string, ManifestEntry>)
  : {};

const sources = walk(SRC).filter((f) =>
  ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(f).toLowerCase()),
);
const seen = new Set<string>();
let built = 0;

for (const file of sources) {
  const slot = relative(SRC, file).slice(0, -extname(file).length).split(sep).join('/');
  seen.add(slot);
  const buffer = readFileSync(file);
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 12);
  if (manifest[slot]?.hash === hash && existsSync(join(OUT, `${slot}-${manifest[slot].jpg}.jpg`))) continue;

  const image = sharp(buffer, { limitInputPixels: false }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const widths = WIDTHS.filter((w) => w <= width);
  if (widths.length === 0) widths.push(width);
  const jpg = widths.reduce((best, w) =>
    Math.abs(w - FALLBACK_JPG_WIDTH) < Math.abs(best - FALLBACK_JPG_WIDTH) ? w : best,
  );

  mkdirSync(dirname(join(OUT, slot)), { recursive: true });
  for (const w of widths) {
    const resized = image.clone().resize({ width: w });
    await resized
      .clone()
      .avif({ quality: 50, effort: 4 })
      .toFile(join(OUT, `${slot}-${w}.avif`));
    await resized
      .clone()
      .webp({ quality: 72 })
      .toFile(join(OUT, `${slot}-${w}.webp`));
    if (w === jpg)
      await resized
        .clone()
        .jpeg({ quality: 78, mozjpeg: true })
        .toFile(join(OUT, `${slot}-${w}.jpg`));
  }

  const blurBuffer = await image.clone().resize({ width: 16 }).blur(1).webp({ quality: 40 }).toBuffer();
  const { dominant } = await image.clone().resize({ width: 64 }).stats();
  manifest[slot] = {
    width,
    height,
    widths,
    jpg,
    blur: `data:image/webp;base64,${blurBuffer.toString('base64')}`,
    color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
    hash,
  };
  built += 1;
  console.log(`✓ ${slot} (${width}×${height}) → ${widths.join(', ')}`);
}

// Drop entries whose source was deleted
for (const slot of Object.keys(manifest)) {
  if (!seen.has(slot)) {
    delete manifest[slot];
    const dir = dirname(join(OUT, slot));
    const base = `${slot.split('/').at(-1) ?? ''}-`;
    if (existsSync(dir)) {
      for (const f of readdirSync(dir)) if (f.startsWith(base)) rmSync(join(dir, f), { force: true });
    }
  }
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(
  `images: ${built} built, ${sources.length - built} unchanged, ${Object.keys(sorted).length} in manifest`,
);
