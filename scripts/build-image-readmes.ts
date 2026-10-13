/**
 * Writes a README.md into every folder of assets-src/ describing which files belong there,
 * what they must show, the generation prompt and which stock photo stands in for now.
 * Run: npm run images:readme
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { STOCK } from '../src/shared/images/stock';
import { BRIEFS } from './image-briefs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'assets-src');

const groups = new Map<string, string[]>();
for (const slot of Object.keys(BRIEFS)) {
  const dir = slot.split('/').slice(0, -1).join('/');
  groups.set(dir, [...(groups.get(dir) ?? []), slot]);
}

const hasSource = (slot: string) => {
  const dir = join(SRC, dirname(slot));
  const base = slot.split('/').at(-1);
  return existsSync(dir) && readdirSync(dir).some((f) => f.replace(/\.(png|jpe?g|webp)$/i, '') === base);
};

for (const [dir, slots] of groups) {
  const lines = [
    `# assets-src/${dir}`,
    '',
    'Положите сюда сгенерированные картинки **с именами из таблицы** (PNG, JPG или WebP) и запустите `npm run images`.',
    'Пока файла нет, на сайте показывается стоковая заглушка из колонки «Сейчас стоит».',
    '',
  ];
  for (const slot of slots) {
    const brief = BRIEFS[slot]!;
    const file = slot.split('/').at(-1);
    const stock = STOCK[slot];
    const status = hasSource(slot) ? '✅ готово' : '⏳ нужно сгенерировать';
    lines.push(
      `## \`${file}.png\` — ${status}`,
      '',
      `- **Размер исходника:** ${brief.size[0]} × ${brief.size[1]} px`,
      `- **Где на сайте:** ${brief.where}`,
      `- **Что на картинке:** ${brief.what}`,
      `- **Сейчас стоит:** ${stock ? `[фото с Unsplash](https://images.unsplash.com/photo-${stock}?w=1200)` : 'реальная картинка из этой папки'}`,
      '',
      '```text',
      brief.prompt,
      '```',
      '',
    );
  }
  mkdirSync(join(SRC, dir), { recursive: true });
  writeFileSync(join(SRC, dir, 'README.md'), lines.join('\n'));
}
console.log(`README.md written to ${groups.size} folders`);
