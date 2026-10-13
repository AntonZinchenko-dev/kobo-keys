import type { BuilderOptions, Lang, Plan, Promo, Rates, ShippingOption } from '@/shared/api/contracts';

import type { L } from './products';

export const tr = (text: L | string, lang: Lang) => (typeof text === 'string' ? text : text[lang]);

export const RATES: Rates = {
  base: 'EUR',
  rates: { EUR: 1, PLN: 4.27, USD: 1.09 },
  updatedAt: '2026-10-13T09:00:00Z',
};

export const FREE_SHIPPING_THRESHOLD = 15000;

export const SHIPPING: ShippingOption[] = [
  { id: 'courier', price: 990, etaDays: [1, 3] },
  { id: 'pickup', price: 490, etaDays: [2, 4] },
  { id: 'workshop', price: 0, etaDays: [0, 1] },
];

export const PROMOS: Record<string, Promo & { expired?: boolean }> = {
  KOBO10: { code: 'KOBO10', kind: 'percent', value: 10 },
  FREESHIP: { code: 'FREESHIP', kind: 'free_shipping', value: 0 },
  SUMMER24: { code: 'SUMMER24', kind: 'percent', value: 20, expired: true },
};

const PLAN_FEATURES: Record<Plan['id'], L[]> = {
  starter: [
    { ru: '1 набор кейкапов в месяц', en: '1 keycap set a month', pl: '1 zestaw klawiszy miesięcznie' },
    { ru: 'Скидка 5% в магазине', en: '5% off in the shop', pl: '5% rabatu w sklepie' },
    {
      ru: 'Доступ к дропам на час раньше',
      en: 'Early access to drops (1 h)',
      pl: 'Wcześniejszy dostęp do dropów (1 h)',
    },
  ],
  collector: [
    { ru: '1 набор + артизан в месяц', en: '1 set + artisan a month', pl: '1 zestaw + artisan miesięcznie' },
    { ru: 'Скидка 10% в магазине', en: '10% off in the shop', pl: '10% rabatu w sklepie' },
    { ru: 'Бесплатная доставка', en: 'Free shipping', pl: 'Darmowa dostawa' },
    {
      ru: 'Доступ к дропам на сутки раньше',
      en: 'Early access to drops (24 h)',
      pl: 'Wcześniejszy dostęp do dropów (24 h)',
    },
  ],
  master: [
    { ru: 'Всё из Collector', en: 'Everything in Collector', pl: 'Wszystko z Collector' },
    {
      ru: 'Клавиатура-сюрприз раз в квартал',
      en: 'A surprise keyboard every quarter',
      pl: 'Klawiatura-niespodzianka co kwartał',
    },
    {
      ru: 'Скидка 15% и личный мастер',
      en: '15% off and a personal builder',
      pl: '15% rabatu i osobisty mistrz',
    },
    { ru: 'Гравировка бесплатно', en: 'Free engraving', pl: 'Darmowy grawer' },
  ],
};

export const plans = (lang: Lang): Plan[] => [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 2900,
    yearly: 27840,
    highlight: false,
    features: PLAN_FEATURES.starter.map((f) => f[lang]),
  },
  {
    id: 'collector',
    name: 'Collector',
    monthly: 4900,
    yearly: 47040,
    highlight: true,
    features: PLAN_FEATURES.collector.map((f) => f[lang]),
  },
  {
    id: 'master',
    name: 'Master',
    monthly: 9900,
    yearly: 95040,
    highlight: false,
    features: PLAN_FEATURES.master.map((f) => f[lang]),
  },
];

const B = {
  cases: [
    ['milk', { ru: 'Молочный', en: 'Milk', pl: 'Mleczny' }, '#efe8df', 0],
    ['sumi', { ru: 'Тушь', en: 'Sumi ink', pl: 'Tusz' }, '#1d1b24', 0],
    ['matcha', { ru: 'Матча', en: 'Matcha', pl: 'Matcha' }, '#7f9a65', 1500],
    ['sakura', { ru: 'Сакура', en: 'Sakura', pl: 'Sakura' }, '#f2a7bf', 1500],
    ['indigo', { ru: 'Индиго', en: 'Indigo', pl: 'Indygo' }, '#2f3b73', 1500],
    ['clear', { ru: 'Прозрачный', en: 'Clear', pl: 'Przezroczysty' }, 'rgb(220 225 240 / 0.55)', 2500],
  ],
  keycaps: [
    ['sakura', 'Sakura', '#fbf4f1', '#f4b4c8', '#e2557f', 8900],
    ['matcha', 'Matcha', '#f2ecdc', '#8fa874', '#4f6b3a', 8900],
    ['sumi-e', 'Sumi-e', '#1e1d22', '#3a3940', '#ece6da', 9400],
    ['seigaiha', 'Seigaiha', '#f4f2ee', '#26355f', '#c7a35b', 9400],
    ['koi', 'Koi', '#fbf6ee', '#ece3d3', '#ec6a3a', 8400],
    ['lantern', 'Lantern', '#3a1214', '#8e1f26', '#d9a441', 11900],
  ],
  switches: [
    ['silk-linear', 'Silk Linear', 'linear', '#f4a6c1', 45],
    ['bamboo-tactile', 'Bamboo Tactile', 'tactile', '#9fc98b', 45],
    ['taiko-clicky', 'Taiko Clicky', 'clicky', '#7fb2e5', 50],
    ['mochi-silent', 'Mochi Silent', 'silent', '#f1ece4', 60],
  ],
} as const;

export const builderOptions = (lang: Lang): BuilderOptions => ({
  layouts: [
    { id: '60', label: '60%', price: 9900, keys: 61 },
    { id: '65', label: '65%', price: 11900, keys: 68 },
    { id: '75', label: '75%', price: 13900, keys: 84 },
    { id: 'tkl', label: 'TKL', price: 15900, keys: 87 },
  ],
  cases: B.cases.map(([id, label, color, price]) => ({ id, label: label[lang], color, price })),
  keycaps: B.keycaps.map(([id, label, alpha, mod, accent, price]) => ({
    id,
    label,
    alpha,
    mod,
    accent,
    price,
  })),
  switches: B.switches.map(([id, label, type, color, pricePerKey]) => ({
    id,
    label,
    type,
    color,
    pricePerKey,
  })),
  lighting: [
    { id: 'off', label: { ru: 'Без подсветки', en: 'No lighting', pl: 'Bez podświetlenia' }[lang], price: 0 },
    { id: 'static', label: { ru: 'Статичная', en: 'Static', pl: 'Statyczne' }[lang], price: 1500 },
    { id: 'breathing', label: { ru: 'Дыхание', en: 'Breathing', pl: 'Oddech' }[lang], price: 1500 },
    { id: 'wave', label: { ru: 'RGB-волна', en: 'RGB wave', pl: 'Fala RGB' }[lang], price: 2500 },
  ],
  engraving: { price: 1200, maxLength: 16 },
  buildDays: 5,
});

export const FAQ: Record<'keyboards' | 'default', { q: L; a: L }[]> = {
  keyboards: [
    {
      q: {
        ru: 'Можно ли поменять свитчи самому?',
        en: 'Can I swap the switches myself?',
        pl: 'Czy mogę sam wymienić przełączniki?',
      },
      a: {
        ru: 'Да, плата hot-swap: свитчи вынимаются пинцетом из комплекта, паять ничего не нужно.',
        en: 'Yes, the PCB is hot-swap: pull switches with the included tool, no soldering needed.',
        pl: 'Tak, płytka jest hot-swap: przełączniki wyjmiesz dołączonym narzędziem, bez lutowania.',
      },
    },
    {
      q: { ru: 'Работает ли с Mac?', en: 'Does it work with a Mac?', pl: 'Czy działa z Makiem?' },
      a: {
        ru: 'Да, переключатель Win/Mac на задней панели, раскладка меняется одной комбинацией.',
        en: 'Yes, there is a Win/Mac switch on the back; the layout changes with one combo.',
        pl: 'Tak, z tyłu jest przełącznik Win/Mac, układ zmienisz jedną kombinacją.',
      },
    },
    {
      q: { ru: 'Какая гарантия?', en: 'What is the warranty?', pl: 'Jaka jest gwarancja?' },
      a: {
        ru: '2 года на корпус и плату, 30 дней на возврат без объяснения причин.',
        en: '2 years on the case and PCB, 30-day no-questions-asked returns.',
        pl: '2 lata na obudowę i płytkę, 30 dni na zwrot bez podania przyczyny.',
      },
    },
  ],
  default: [
    {
      q: { ru: 'Сколько идёт доставка?', en: 'How long is delivery?', pl: 'Ile trwa dostawa?' },
      a: {
        ru: 'Курьером 1–3 дня, в пункт выдачи 2–4 дня, из мастерской — в день заказа.',
        en: 'Courier 1–3 days, pickup point 2–4 days, from the workshop — same day.',
        pl: 'Kurier 1–3 dni, punkt odbioru 2–4 dni, z pracowni — tego samego dnia.',
      },
    },
    {
      q: { ru: 'Можно вернуть?', en: 'Can I return it?', pl: 'Czy mogę zwrócić?' },
      a: {
        ru: 'Да, в течение 30 дней, если товар не был в использовании.',
        en: 'Yes, within 30 days if the item is unused.',
        pl: 'Tak, w ciągu 30 dni, jeśli produkt nie był używany.',
      },
    },
  ],
};

export const ADDRESSES = [
  'Warszawa, ul. Marszałkowska 104',
  'Warszawa, ul. Nowy Świat 22',
  'Warszawa, ul. Złota 59',
  'Warszawa, al. Jerozolimskie 65',
  'Kraków, ul. Floriańska 12',
  'Kraków, Rynek Główny 1',
  'Gdańsk, ul. Długa 47',
  'Wrocław, ul. Świdnicka 8',
  'Berlin, Friedrichstraße 43',
  'Berlin, Torstraße 140',
  'Tokyo, Shibuya 2-21-1',
  'Kyoto, Gion-machi 570',
];
