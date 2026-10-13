# assets-src/brand — логотип и иконки

Сейчас логотип — простой SVG: иероглиф 工 («мастерство») на кейкапе (`public/favicon.svg`,
компонент `src/shared/ui/logo`).

Чтобы заменить:

1. Нарисуйте `logo.svg` (знак + надпись KŌBŌ Keys) — лучше в Figma, в векторе.
2. Знак без надписи сохраните как `public/favicon.svg`.
3. Запустите `npm run icons` — пересоберутся `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`,
   `icon-maskable-512.png` и OG-превью `public/og/og-{ru,en,pl}.jpg` (из hero-картинки + слоган).

Иконки интерфейса — спрайт `public/sprite.svg` из набора Lucide (лицензия ISC).
Нужна новая иконка — добавьте имя в `src/shared/ui/icon/names.ts` и запустите `npm run sprite`.
