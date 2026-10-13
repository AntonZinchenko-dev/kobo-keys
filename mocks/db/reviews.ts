import type { Lang, Review } from '@/shared/api/contracts';

import { PRODUCTS } from './products';

/** Small deterministic PRNG so every visitor sees the same "random" reviews. */
export const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const hashString = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const AUTHORS = [
  'Kasia W.',
  'Ren T.',
  'Anna K.',
  'Mateusz P.',
  'Yuki S.',
  'Dmitry L.',
  'Olga M.',
  'Sam R.',
  'Hana I.',
  'Piotr Z.',
  'Elena V.',
  'Kenji O.',
];

const TEMPLATES: Record<Lang, { title: string; body: string; rating: number }[]> = {
  ru: [
    {
      rating: 5,
      title: 'Звук — просто масло',
      body: 'Ожидал хорошего, получил отличное. Звучит глухо и мягко, соседи по офису не жалуются.',
    },
    {
      rating: 5,
      title: 'Красивее, чем на фото',
      body: 'Цвета вживую ещё приятнее. Упаковка как подарок, внутри даже открытка.',
    },
    {
      rating: 4,
      title: 'Почти идеально',
      body: 'Качество сборки отличное, но хотелось бы кабель подлиннее. В остальном доволен.',
    },
    {
      rating: 5,
      title: 'Печатать одно удовольствие',
      body: 'Пишу код по 8 часов — руки не устают. Свитчи ровные, ничего не дребезжит.',
    },
    {
      rating: 3,
      title: 'Хорошо, но не моё',
      body: 'Объективно качественно, но я привык к более тяжёлым свитчам. Поменял — стало супер.',
    },
    {
      rating: 4,
      title: 'Доставка быстрая',
      body: 'Пришло за два дня. Одна клавиша была чуть туже остальных, после недели разработалась.',
    },
    {
      rating: 5,
      title: 'Лучшая покупка года',
      body: 'Брал в подарок себе на день рождения. Каждое утро радует на столе.',
    },
  ],
  en: [
    {
      rating: 5,
      title: 'Sounds like butter',
      body: 'Expected good, got great. Deep and soft, my office mates don’t complain.',
    },
    {
      rating: 5,
      title: 'Prettier than the photos',
      body: 'Colours are even nicer in person. Packaging feels like a gift, there is even a card.',
    },
    {
      rating: 4,
      title: 'Almost perfect',
      body: 'Build quality is excellent, I’d like a longer cable though. Otherwise very happy.',
    },
    {
      rating: 5,
      title: 'A joy to type on',
      body: 'I code 8 hours a day and my hands don’t get tired. Switches are smooth, no rattle.',
    },
    {
      rating: 3,
      title: 'Good, just not for me',
      body: 'Objectively well made, but I’m used to heavier switches. Swapped them — now it’s great.',
    },
    {
      rating: 4,
      title: 'Fast delivery',
      body: 'Arrived in two days. One key was a bit tighter, it broke in after a week.',
    },
    {
      rating: 5,
      title: 'Best purchase this year',
      body: 'Bought it as a birthday gift to myself. Makes me smile every morning.',
    },
  ],
  pl: [
    {
      rating: 5,
      title: 'Brzmi jak masło',
      body: 'Spodziewałem się dobrego, dostałem świetne. Głęboki i miękki dźwięk, koledzy z biura nie narzekają.',
    },
    {
      rating: 5,
      title: 'Ładniejsza niż na zdjęciach',
      body: 'Kolory na żywo są jeszcze przyjemniejsze. Opakowanie jak prezent, w środku nawet kartka.',
    },
    {
      rating: 4,
      title: 'Prawie idealnie',
      body: 'Jakość wykonania świetna, ale kabel mógłby być dłuższy. Poza tym jestem zadowolony.',
    },
    {
      rating: 5,
      title: 'Pisanie to przyjemność',
      body: 'Koduję po 8 godzin — ręce się nie męczą. Przełączniki gładkie, nic nie grzechocze.',
    },
    {
      rating: 3,
      title: 'Dobra, ale nie dla mnie',
      body: 'Obiektywnie dobrze zrobiona, ale wolę cięższe przełączniki. Wymieniłem — jest super.',
    },
    {
      rating: 4,
      title: 'Szybka dostawa',
      body: 'Doszło w dwa dni. Jeden klawisz był trochę twardszy, po tygodniu się dotarł.',
    },
    {
      rating: 5,
      title: 'Najlepszy zakup roku',
      body: 'Kupiłem sobie na urodziny. Codziennie rano cieszy na biurku.',
    },
  ],
};

const SETUP_PHOTOS = ['marketing/setup-01', 'marketing/setup-02', 'marketing/setup-03', 'marketing/setup-04'];

export const reviewsFor = (slug: string, lang: Lang): Review[] => {
  const rand = mulberry32(hashString(slug));
  const count = 6 + Math.floor(rand() * 9);
  const base = Date.parse('2026-10-01T12:00:00Z');
  return Array.from({ length: count }, (_, i) => {
    const list = TEMPLATES[lang];
    const template = list[Math.floor(rand() * list.length)] ?? { rating: 5, title: '', body: '' };
    const withPhoto = rand() > 0.72;
    return {
      id: `${slug}-r${i}`,
      author: AUTHORS[Math.floor(rand() * AUTHORS.length)] ?? 'Guest',
      rating: template.rating,
      title: template.title,
      body: template.body,
      date: new Date(base - Math.floor(rand() * 200) * 86_400_000).toISOString(),
      helpful: Math.floor(rand() * 40),
      verified: rand() > 0.2,
      photos: withPhoto
        ? [SETUP_PHOTOS[Math.floor(rand() * SETUP_PHOTOS.length)] ?? 'marketing/setup-01']
        : [],
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
};

/** Precomputed rating + count per product (language independent). */
export const RATING_STATS: Record<string, { average: number; count: number }> = Object.fromEntries(
  PRODUCTS.map((p) => {
    const list = reviewsFor(p.slug, 'en');
    const average = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
    return [p.slug, { average: Math.round(average * 10) / 10, count: list.length }];
  }),
);
