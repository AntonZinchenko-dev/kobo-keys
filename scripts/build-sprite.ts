/**
 * Builds public/sprite.svg from the icon list in src/shared/ui/icon/names.ts.
 * One cached request for all icons instead of inlining SVG into the JS bundle.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { ICON_NAMES } from '../src/shared/ui/icon/names';

const require = createRequire(import.meta.url);
const iconsDir = join(dirname(require.resolve('lucide-static/package.json')), 'icons');

const symbols = ICON_NAMES.map((name) => {
  const svg = readFileSync(join(iconsDir, `${name}.svg`), 'utf8');
  const inner = svg
    .replace(/<!--.*?-->/gs, '')
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
  return `<symbol id="${name}" viewBox="0 0 24 24">${inner}</symbol>`;
});

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><!-- lucide-static, ISC license -->${symbols.join('')}</svg>\n`;
writeFileSync(new URL('../public/sprite.svg', import.meta.url), sprite);
console.log(`sprite.svg: ${ICON_NAMES.length} icons, ${(sprite.length / 1024).toFixed(1)} KB`);
