import type {
  Badge,
  CategoryId,
  ColorId,
  Lang,
  Layout,
  OptionId,
  SpecKey,
  SwitchType,
} from '@/shared/api/contracts';

export type L = Record<Lang, string>;
type Text = L | string;

export interface SeedOptionValue {
  id: string;
  label: Text;
  priceDelta: number;
  swatch?: string;
  images?: string[];
}

export interface SeedProduct {
  id: string;
  slug: string;
  name: string;
  tagline: L;
  description: L;
  category: CategoryId;
  layout?: Layout;
  switchType?: SwitchType;
  colors: ColorId[];
  price: number;
  compareAt?: number;
  badges: Badge[];
  createdAt: string;
  popularity: number;
  images: string[];
  options: { id: OptionId; values: SeedOptionValue[] }[];
  specs: { key: SpecKey; value: Text }[];
  soundId?: string;
  /** Explicit stock overrides; the rest is generated deterministically */
  stockOverrides?: Record<string, number>;
}

const KB_SHOTS = ['01-main', '02-top', '03-detail', '04-lifestyle'];
const CAPS_SHOTS = ['01-main', '02-detail', '03-on-board'];
const SWITCH_SHOTS = ['01-main', '02-exploded', '03-group'];
const ACC_SHOTS = ['01-main', '02-detail', '03-lifestyle'];
const shots = (dir: string, list: string[]) => list.map((s) => `products/${dir}/${s}`);

const SWITCH_OPTION: SeedProduct['options'][number] = {
  id: 'switch',
  values: [
    { id: 'silk-linear', label: 'Silk Linear', priceDelta: 0, swatch: '#f4a6c1' },
    { id: 'bamboo-tactile', label: 'Bamboo Tactile', priceDelta: 0, swatch: '#9fc98b' },
    { id: 'taiko-clicky', label: 'Taiko Clicky', priceDelta: 500, swatch: '#7fb2e5' },
    { id: 'mochi-silent', label: 'Mochi Silent', priceDelta: 900, swatch: '#f1ece4' },
  ],
};

const KIT_OPTION: SeedProduct['options'][number] = {
  id: 'kit',
  values: [
    {
      id: 'base',
      label: { ru: 'Базовый (TKL)', en: 'Base kit (TKL)', pl: 'Zestaw bazowy (TKL)' },
      priceDelta: 0,
    },
    {
      id: 'full',
      label: { ru: 'Полный + сплит', en: 'Full + split', pl: 'Pełny + split' },
      priceDelta: 3500,
    },
  ],
};

const PACK_OPTION: SeedProduct['options'][number] = {
  id: 'size',
  values: [
    { id: '35', label: { ru: '35 шт.', en: '35 pcs', pl: '35 szt.' }, priceDelta: 0 },
    { id: '70', label: { ru: '70 шт.', en: '70 pcs', pl: '70 szt.' }, priceDelta: 1900 },
    { id: '90', label: { ru: '90 шт.', en: '90 pcs', pl: '90 szt.' }, priceDelta: 2900 },
  ],
};

const kbSpecs = (layout: string, caseMat: Text, weight: string): SeedProduct['specs'] => [
  { key: 'layout', value: layout },
  { key: 'case', value: caseMat },
  { key: 'plate', value: { ru: 'Поликарбонат', en: 'Polycarbonate', pl: 'Poliwęglan' } },
  { key: 'mount', value: 'Gasket' },
  { key: 'hotswap', value: { ru: 'Да, 5-pin', en: 'Yes, 5-pin', pl: 'Tak, 5-pin' } },
  { key: 'connection', value: 'USB-C · Bluetooth 5.3 · 2.4 GHz' },
  { key: 'weight', value: weight },
];

const ALU: L = { ru: 'Алюминий 6063', en: '6063 aluminium', pl: 'Aluminium 6063' };
const PBT_SPECS = (keys: string): SeedProduct['specs'] => [
  { key: 'material', value: 'PBT, double-shot' },
  { key: 'profile', value: 'Cherry' },
  { key: 'keys', value: keys },
];
const switchSpecs = (force: string, travel: string): SeedProduct['specs'] => [
  { key: 'actuation', value: force },
  { key: 'travel', value: travel },
  { key: 'material', value: { ru: 'Корпус PC / POM', en: 'PC / POM housing', pl: 'Obudowa PC / POM' } },
];

export const PRODUCTS: SeedProduct[] = [
  /* ───────── Keyboards ───────── */
  {
    id: 'p-sakura-65',
    slug: 'sakura-65',
    name: 'Sakura 65',
    tagline: {
      ru: 'Молочный корпус и розовый пробел',
      en: 'Milky case, pink spacebar',
      pl: 'Mleczna obudowa, różowa spacja',
    },
    description: {
      ru: 'Компактная 65% клавиатура на гаскет-креплении с мягким, «кремовым» звуком. Розовые акценты, как лепестки в апреле.',
      en: 'A compact 65% gasket-mount board with a soft, creamy sound. Pink accents like petals in April.',
      pl: 'Kompaktowa klawiatura 65% na gaskecie z miękkim, kremowym brzmieniem. Różowe akcenty jak płatki w kwietniu.',
    },
    category: 'keyboards',
    layout: '65',
    switchType: 'linear',
    colors: ['pink', 'white', 'black'],
    price: 18900,
    badges: ['bestseller'],
    createdAt: '2026-03-01',
    popularity: 98,
    images: shots('sakura-65', KB_SHOTS),
    options: [
      {
        id: 'color',
        values: [
          {
            id: 'white',
            label: { ru: 'Молочный', en: 'Milk', pl: 'Mleczny' },
            priceDelta: 0,
            swatch: '#f3ede6',
          },
          {
            id: 'black',
            label: { ru: 'Ночной', en: 'Night', pl: 'Nocny' },
            priceDelta: 1000,
            swatch: '#1c1a22',
            images: [
              'products/sakura-65/01-main-black',
              'products/sakura-65/02-top-black',
              'products/sakura-65/03-detail',
              'products/sakura-65/04-lifestyle',
            ],
          },
        ],
      },
      SWITCH_OPTION,
    ],
    specs: kbSpecs('65%', ALU, '1.6 kg'),
    soundId: 'switch-silk-linear',
    stockOverrides: { 'black/mochi-silent': 0, 'white/taiko-clicky': 0 },
  },
  {
    id: 'p-matcha-75',
    slug: 'matcha-75',
    name: 'Matcha 75',
    tagline: {
      ru: 'Зелёный алюминий и кремовые кейкапы',
      en: 'Green aluminium, cream caps',
      pl: 'Zielone aluminium, kremowe klawisze',
    },
    description: {
      ru: 'Раскладка 75% с ручкой-энкодером и матовым корпусом цвета чая матча. Тактильный отклик — как первый глоток утром.',
      en: 'A 75% layout with a rotary knob and a matte matcha-green case. Tactile feedback like the first sip in the morning.',
      pl: 'Układ 75% z pokrętłem i matową obudową w kolorze matchy. Taktylny feedback jak pierwszy łyk rano.',
    },
    category: 'keyboards',
    layout: '75',
    switchType: 'tactile',
    colors: ['green', 'white'],
    price: 21900,
    badges: ['new'],
    createdAt: '2026-09-20',
    popularity: 90,
    images: shots('matcha-75', KB_SHOTS),
    options: [SWITCH_OPTION],
    specs: kbSpecs('75%', ALU, '1.9 kg'),
    soundId: 'switch-bamboo-tactile',
  },
  {
    id: 'p-sumi-tkl',
    slug: 'sumi-tkl',
    name: 'Sumi TKL',
    tagline: { ru: 'Чёрный как тушь', en: 'Black as sumi ink', pl: 'Czarna jak tusz sumi' },
    description: {
      ru: 'Полноценная TKL-раскладка для тех, кому нужны стрелки и F-ряд. Строгий чёрный корпус и тихий глубокий звук.',
      en: 'A full TKL layout for those who need arrows and the F-row. Strict black case and a deep, quiet sound.',
      pl: 'Pełny układ TKL dla tych, którzy potrzebują strzałek i rzędu F. Surowa czarna obudowa i głęboki, cichy dźwięk.',
    },
    category: 'keyboards',
    layout: 'tkl',
    switchType: 'silent',
    colors: ['black'],
    price: 24900,
    compareAt: 27900,
    badges: ['sale'],
    createdAt: '2025-11-10',
    popularity: 80,
    images: shots('sumi-tkl', KB_SHOTS),
    options: [SWITCH_OPTION],
    specs: kbSpecs('TKL (87)', ALU, '2.3 kg'),
    soundId: 'switch-mochi-silent',
  },
  {
    id: 'p-neon-tokyo-60',
    slug: 'neon-tokyo-60',
    name: 'Neon Tokyo 60',
    tagline: {
      ru: 'Прозрачный корпус и RGB-неон',
      en: 'Clear case, RGB neon',
      pl: 'Przezroczysta obudowa, neon RGB',
    },
    description: {
      ru: 'Минималистичная 60% в прозрачном поликарбонате. Подсветка проходит сквозь корпус и кейкапы — как ночная Синдзюку.',
      en: 'A minimalist 60% in clear polycarbonate. Light shines through the case and caps like Shinjuku at night.',
      pl: 'Minimalistyczna 60% z przezroczystego poliwęglanu. Światło przenika obudowę i klawisze jak Shinjuku nocą.',
    },
    category: 'keyboards',
    layout: '60',
    switchType: 'linear',
    colors: ['purple', 'blue'],
    price: 15900,
    badges: ['bestseller'],
    createdAt: '2026-01-15',
    popularity: 94,
    images: shots('neon-tokyo-60', KB_SHOTS),
    options: [SWITCH_OPTION],
    specs: kbSpecs('60%', { ru: 'Поликарбонат', en: 'Polycarbonate', pl: 'Poliwęglan' }, '1.1 kg'),
    soundId: 'switch-silk-linear',
  },
  {
    id: 'p-fuji-75',
    slug: 'fuji-75',
    name: 'Fuji 75',
    tagline: {
      ru: 'Снежная вершина и красный Esc',
      en: 'Snowy peak, red Esc',
      pl: 'Śnieżny szczyt, czerwony Esc',
    },
    description: {
      ru: 'Светло-серый корпус, бело-голубые кейкапы и единственная красная клавиша Esc — как солнце над Фудзи.',
      en: 'Light grey case, white-and-sky caps and a single red Esc key — like the sun over Mount Fuji.',
      pl: 'Jasnoszara obudowa, biało-błękitne klawisze i jeden czerwony Esc — jak słońce nad Fuji.',
    },
    category: 'keyboards',
    layout: '75',
    switchType: 'clicky',
    colors: ['white', 'blue'],
    price: 19900,
    badges: [],
    createdAt: '2026-05-05',
    popularity: 72,
    images: shots('fuji-75', KB_SHOTS),
    options: [SWITCH_OPTION],
    specs: kbSpecs('75%', ALU, '1.8 kg'),
    soundId: 'switch-taiko-clicky',
  },
  {
    id: 'p-koi-65',
    slug: 'koi-65',
    name: 'Koi 65',
    tagline: { ru: 'Оранжевые акценты карпа кои', en: 'Orange koi accents', pl: 'Pomarańczowe akcenty koi' },
    description: {
      ru: 'Белый корпус и кремовые кейкапы с оранжево-красными модификаторами. Яркая, но спокойная клавиатура на каждый день.',
      en: 'White case and cream caps with orange-red modifiers. Bright yet calm — an everyday board.',
      pl: 'Biała obudowa i kremowe klawisze z pomarańczowo-czerwonymi modyfikatorami. Jasna, a jednak spokojna.',
    },
    category: 'keyboards',
    layout: '65',
    switchType: 'tactile',
    colors: ['orange', 'white'],
    price: 17900,
    badges: [],
    createdAt: '2025-12-01',
    popularity: 70,
    images: shots('koi-65', KB_SHOTS),
    options: [SWITCH_OPTION],
    specs: kbSpecs('65%', ALU, '1.6 kg'),
    soundId: 'switch-bamboo-tactile',
  },
  {
    id: 'p-hinoki-65',
    slug: 'hinoki-65',
    name: 'Hinoki Wood 65',
    tagline: {
      ru: 'Корпус из японского кипариса',
      en: 'Japanese cypress case',
      pl: 'Obudowa z cyprysu japońskiego',
    },
    description: {
      ru: 'Корпус из массива хиноки с тёплым древесным звуком. Каждый экземпляр уникален по рисунку волокон.',
      en: 'A solid hinoki case with a warm, woody sound. Every unit has a unique grain pattern.',
      pl: 'Obudowa z litego hinoki o ciepłym, drewnianym brzmieniu. Każdy egzemplarz ma unikalny rysunek słojów.',
    },
    category: 'keyboards',
    layout: '65',
    switchType: 'linear',
    colors: ['wood', 'yellow'],
    price: 26900,
    badges: ['limited'],
    createdAt: '2026-08-01',
    popularity: 85,
    images: shots('hinoki-65', KB_SHOTS),
    options: [SWITCH_OPTION],
    specs: kbSpecs('65%', { ru: 'Кипарис хиноки', en: 'Hinoki cypress', pl: 'Cyprys hinoki' }, '1.3 kg'),
    soundId: 'switch-silk-linear',
    stockOverrides: { 'silk-linear': 3, 'bamboo-tactile': 2, 'taiko-clicky': 0, 'mochi-silent': 1 },
  },
  {
    id: 'p-kitsune-split',
    slug: 'kitsune-split',
    name: 'Kitsune Split',
    tagline: {
      ru: 'Эргономичный сплит в цвете лисы',
      en: 'Ergonomic split in fox red',
      pl: 'Ergonomiczny split w kolorze lisa',
    },
    description: {
      ru: 'Две половины, которые ставятся на ширину плеч. Спина скажет спасибо, а тёмно-красный корпус — порадует глаз.',
      en: 'Two halves you place shoulder-width apart. Your back says thanks, the dark red case pleases the eye.',
      pl: 'Dwie połówki ustawiane na szerokość ramion. Plecy podziękują, a ciemnoczerwona obudowa cieszy oko.',
    },
    category: 'keyboards',
    layout: 'split',
    switchType: 'tactile',
    colors: ['red', 'black'],
    price: 29900,
    badges: ['new'],
    createdAt: '2026-10-01',
    popularity: 76,
    images: shots('kitsune-split', KB_SHOTS),
    options: [SWITCH_OPTION],
    specs: kbSpecs('Split 70%', ALU, '2 × 0.8 kg'),
    soundId: 'switch-bamboo-tactile',
  },

  /* ───────── Keycaps ───────── */
  ...(
    [
      [
        'sakura',
        'Sakura',
        ['pink', 'white'],
        8900,
        ['bestseller'],
        { ru: 'Белый и пастельно-розовый', en: 'White and pastel pink', pl: 'Biel i pastelowy róż' },
      ],
      [
        'matcha',
        'Matcha',
        ['green', 'white'],
        8900,
        [],
        { ru: 'Зелёный матча и крем', en: 'Matcha green and cream', pl: 'Zieleń matchy i krem' },
      ],
      [
        'sumi-e',
        'Sumi-e',
        ['black', 'white'],
        9400,
        ['new'],
        { ru: 'Тушь на рисовой бумаге', en: 'Ink on rice paper', pl: 'Tusz na papierze ryżowym' },
      ],
      [
        'seigaiha',
        'Seigaiha',
        ['blue', 'white'],
        9400,
        [],
        { ru: 'Тёмно-синие волны', en: 'Navy waves', pl: 'Granatowe fale' },
      ],
      [
        'koi',
        'Koi',
        ['orange', 'white'],
        8400,
        ['sale'],
        {
          ru: 'Белый с оранжевым и красным',
          en: 'White with orange and red',
          pl: 'Biel z pomarańczem i czerwienią',
        },
      ],
      [
        'ramen-night',
        'Ramen Night',
        ['yellow', 'red'],
        8900,
        [],
        {
          ru: 'Тёплый жёлтый, красный и бульон',
          en: 'Warm yellow, red and broth',
          pl: 'Ciepła żółć, czerwień i bulion',
        },
      ],
      [
        'onsen',
        'Onsen',
        ['blue', 'green'],
        8400,
        [],
        {
          ru: 'Бирюза и крем горячих источников',
          en: 'Hot-spring teal and cream',
          pl: 'Turkus i krem gorących źródeł',
        },
      ],
      [
        'lantern',
        'Lantern',
        ['red', 'yellow'],
        11900,
        ['drop', 'limited'],
        { ru: 'Глубокий красный и золото', en: 'Deep red and gold', pl: 'Głęboka czerwień i złoto' },
      ],
    ] as [string, string, ColorId[], number, Badge[], L][]
  ).map(([dir, name, colors, price, badges, tagline], i): SeedProduct => ({
    id: `p-keycaps-${dir}`,
    slug: `keycaps-${dir}`,
    name: `${name} Keycaps`,
    tagline,
    description: {
      ru: `Набор кейкапов ${name} из толстого PBT с литыми символами — не сотрутся никогда. Профиль Cherry подходит к большинству клавиатур.`,
      en: `The ${name} keycap set in thick double-shot PBT — legends never wear off. Cherry profile fits most boards.`,
      pl: `Zestaw klawiszy ${name} z grubego PBT double-shot — znaki nigdy się nie zetrą. Profil Cherry pasuje do większości klawiatur.`,
    },
    category: 'keycaps',
    colors,
    price,
    ...(badges.includes('sale') ? { compareAt: price + 2000 } : {}),
    badges,
    createdAt: `2026-0${(i % 9) + 1}-12`,
    popularity: 60 + ((i * 7) % 30),
    images: shots(`keycaps-${dir}`, CAPS_SHOTS),
    options: [KIT_OPTION],
    specs: PBT_SPECS('142 / 172'),
    ...(dir === 'lantern' ? { stockOverrides: { base: 12, full: 4 } } : {}),
  })),

  /* ───────── Switches ───────── */
  ...(
    [
      [
        'silk-linear',
        'Silk Linear',
        'linear',
        'pink',
        '45 gf',
        { ru: 'Гладкие, как шёлк', en: 'Smooth as silk', pl: 'Gładkie jak jedwab' },
      ],
      [
        'bamboo-tactile',
        'Bamboo Tactile',
        'tactile',
        'green',
        '55 gf',
        { ru: 'Чёткий «бугорок» без щелчка', en: 'Crisp bump, no click', pl: 'Wyraźny próg bez kliku' },
      ],
      [
        'taiko-clicky',
        'Taiko Clicky',
        'clicky',
        'blue',
        '60 gf',
        { ru: 'Звонкий, как барабан тайко', en: 'Loud like a taiko drum', pl: 'Głośne jak bęben taiko' },
      ],
      [
        'mochi-silent',
        'Mochi Silent',
        'silent',
        'white',
        '50 gf',
        { ru: 'Мягкие и почти бесшумные', en: 'Soft and nearly silent', pl: 'Miękkie i prawie bezgłośne' },
      ],
    ] as [string, string, SwitchType, ColorId, string, L][]
  ).map(([dir, name, type, color, force, tagline], i): SeedProduct => ({
    id: `p-switch-${dir}`,
    slug: `switch-${dir}`,
    name,
    tagline,
    description: {
      ru: `Свитчи ${name} с заводской смазкой. Подходят для любой hot-swap клавиатуры с 3- и 5-pin гнёздами.`,
      en: `${name} switches, factory-lubed. Fit any hot-swap board with 3- or 5-pin sockets.`,
      pl: `Przełączniki ${name}, fabrycznie smarowane. Pasują do każdej klawiatury hot-swap z gniazdami 3- i 5-pin.`,
    },
    category: 'switches',
    switchType: type,
    colors: [color],
    price: 2900,
    badges: i === 0 ? ['bestseller'] : [],
    createdAt: `2025-1${i}-01`,
    popularity: 55 + i * 5,
    images: shots(`switch-${dir}`, SWITCH_SHOTS),
    options: [PACK_OPTION],
    specs: switchSpecs(force, '3.8 mm'),
    soundId: `switch-${dir}`,
  })),

  /* ───────── Accessories ───────── */
  {
    id: 'p-deskmat-seigaiha',
    slug: 'deskmat-seigaiha',
    name: 'Seigaiha Desk Mat',
    tagline: { ru: 'Коврик с узором волн', en: 'Wave-pattern desk mat', pl: 'Mata z wzorem fal' },
    description: {
      ru: 'Большой коврик с прошитыми краями и традиционным узором сэйгайха. Глушит звук и защищает стол.',
      en: 'A large stitched-edge mat with the traditional seigaiha pattern. Dampens sound and protects the desk.',
      pl: 'Duża mata z obszytymi brzegami i tradycyjnym wzorem seigaiha. Tłumi dźwięk i chroni biurko.',
    },
    category: 'accessories',
    colors: ['blue', 'white'],
    price: 3900,
    badges: [],
    createdAt: '2026-04-01',
    popularity: 66,
    images: shots('deskmat-seigaiha', ACC_SHOTS),
    options: [
      {
        id: 'size',
        values: [
          { id: 'l', label: '900 × 400', priceDelta: 0 },
          { id: 'xl', label: '1200 × 600', priceDelta: 1000 },
        ],
      },
    ],
    specs: [
      { key: 'size', value: '900 × 400 / 1200 × 600 mm' },
      { key: 'material', value: { ru: 'Ткань и резина', en: 'Cloth and rubber', pl: 'Tkanina i guma' } },
    ],
  },
  {
    id: 'p-cable-sakura',
    slug: 'cable-sakura',
    name: 'Sakura Coiled Cable',
    tagline: {
      ru: 'Витой кабель с авиа-разъёмом',
      en: 'Coiled cable with aviator plug',
      pl: 'Kabel spiralny z wtykiem lotniczym',
    },
    description: {
      ru: 'Витой USB-C кабель в розовой оплётке с отстёгивающимся авиа-разъёмом. Финальный штрих сетапа.',
      en: 'A pink-sleeved coiled USB-C cable with a detachable aviator connector. The finishing touch for a setup.',
      pl: 'Spiralny kabel USB-C w różowym oplocie z odpinanym złączem lotniczym. Ostatni szlif setupu.',
    },
    category: 'accessories',
    colors: ['pink'],
    price: 3400,
    badges: ['new'],
    createdAt: '2026-09-01',
    popularity: 62,
    images: shots('cable-sakura', ACC_SHOTS),
    options: [],
    specs: [
      { key: 'length', value: '1.5 m' },
      { key: 'connection', value: 'USB-C → USB-A / USB-C' },
    ],
  },
  {
    id: 'p-wristrest-hinoki',
    slug: 'wristrest-hinoki',
    name: 'Hinoki Wrist Rest',
    tagline: {
      ru: 'Деревянная подставка под запястья',
      en: 'Wooden wrist rest',
      pl: 'Drewniana podkładka pod nadgarstki',
    },
    description: {
      ru: 'Подставка из кипариса хиноки с прорезиненным дном. Пахнет лесом и снимает нагрузку с запястий.',
      en: 'A hinoki cypress wrist rest with a rubberised base. Smells like a forest and eases your wrists.',
      pl: 'Podkładka z cyprysu hinoki z gumowanym spodem. Pachnie lasem i odciąża nadgarstki.',
    },
    category: 'accessories',
    colors: ['wood'],
    price: 4900,
    badges: [],
    createdAt: '2026-02-01',
    popularity: 58,
    images: shots('wristrest-hinoki', ACC_SHOTS),
    options: [
      {
        id: 'size',
        values: [
          { id: '65', label: '65%', priceDelta: 0 },
          { id: 'tkl', label: 'TKL', priceDelta: 600 },
        ],
      },
    ],
    specs: [{ key: 'material', value: { ru: 'Кипарис хиноки', en: 'Hinoki cypress', pl: 'Cyprys hinoki' } }],
  },
  {
    id: 'p-artisan-shiba',
    slug: 'artisan-shiba',
    name: 'Shiba Artisan Keycap',
    tagline: {
      ru: 'Артизан-кейкап с сибой внутри',
      en: 'Artisan keycap with a shiba inside',
      pl: 'Klawisz artisan z shibą w środku',
    },
    description: {
      ru: 'Кейкап из прозрачной смолы, внутри которого спит маленькая сиба. Ручная работа, тираж ограничен.',
      en: 'A clear resin keycap with a tiny sleeping shiba inside. Handmade, limited run.',
      pl: 'Klawisz z przezroczystej żywicy, w którym śpi mała shiba. Ręczna robota, limitowany nakład.',
    },
    category: 'accessories',
    colors: ['orange', 'white'],
    price: 4500,
    badges: ['limited'],
    createdAt: '2026-07-01',
    popularity: 88,
    images: shots('artisan-shiba', ACC_SHOTS),
    options: [],
    specs: [
      { key: 'material', value: { ru: 'Эпоксидная смола', en: 'Epoxy resin', pl: 'Żywica epoksydowa' } },
      { key: 'profile', value: 'SA R1' },
    ],
    stockOverrides: { default: 7 },
  },
];

export const findSeed = (idOrSlug: string) => PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
