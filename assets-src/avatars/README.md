# assets-src/avatars — аватары для отзывов

Сейчас вместо фото в отзывах — первая буква имени в градиентном кружке (честнее, чем чужие лица со стоков).

Если хотите иллюстрации: 8 портретов `avatar-01.png` … `avatar-08.png`, 512 × 512, аниме-стиль,
пастельный однотонный фон, разные люди. Промпт:

```text
illustrated anime-style portrait avatar of a [young woman / man / ...], friendly smile,
pastel solid background, soft lighting, head and shoulders, no text
```

После генерации — `npm run images`, затем в `src/pages/product/ui/reviews.tsx` показать `<Picture slot="avatars/avatar-0N">`.
