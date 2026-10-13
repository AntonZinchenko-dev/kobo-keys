/**
 * What every image slot should eventually contain. Used by `npm run images:readme`
 * to write a README.md next to each group of images in assets-src/.
 */
import { PRODUCTS } from '../mocks/db/products';

export interface Brief {
  /** Source size to generate, px */
  size: [number, number];
  where: string;
  what: string;
  prompt: string;
}

const NEGATIVE =
  'letters, text, legends, logo, watermark, brand name, distorted keys, missing keys, extra rows, melted plastic, blurry, hands, people';

const STUDIO =
  'seamless warm light grey paper backdrop, soft diffused key light from the left, subtle rim light, realistic materials, sharp focus, 85mm lens, high detail';

const COLORS: Record<string, string> = {
  'sakura-65': 'milky white case, white and pastel pink blank keycaps, pink spacebar',
  'matcha-75': 'matte green aluminium case, cream keycaps, green modifier keys, rotary knob',
  'sumi-tkl': 'matte black case, black keycaps, dark grey modifiers',
  'neon-tokyo-60': 'clear polycarbonate case, translucent keycaps, purple and cyan RGB glow',
  'fuji-75': 'light grey case, white and sky blue keycaps, a single red escape key',
  'koi-65': 'white case, cream keycaps, orange and red accent keys',
  'hinoki-65': 'light natural hinoki wood case, beige keycaps',
  'kitsune-split': 'split keyboard, two separate halves, dark red case, black and red keycaps',
  'keycaps-sakura': 'white and pastel pink keycaps',
  'keycaps-matcha': 'matcha green and cream keycaps',
  'keycaps-sumi-e': 'black and off-white keycaps, ink wash mood',
  'keycaps-seigaiha': 'navy blue and white keycaps',
  'keycaps-koi': 'white keycaps with orange and red accents',
  'keycaps-ramen-night': 'warm yellow, red and brown keycaps',
  'keycaps-onsen': 'teal and cream keycaps',
  'keycaps-lantern': 'deep red and gold keycaps',
  'switch-silk-linear': 'translucent pink housing, linear switch',
  'switch-bamboo-tactile': 'translucent green housing, tactile switch',
  'switch-taiko-clicky': 'translucent blue housing, clicky switch',
  'switch-mochi-silent': 'milky white housing, silent switch',
  'deskmat-seigaiha': 'large desk mat, navy with white seigaiha wave pattern, stitched edges',
  'cable-sakura': 'coiled pink USB-C cable with aviator connector',
  'wristrest-hinoki': 'light hinoki wooden wrist rest',
  'artisan-shiba': 'clear resin artisan keycap with a tiny cute sleeping shiba inu inside',
};

const SHOT: Record<string, [string, string]> = {
  '01-main': ['Главное фото: вид 3/4 сверху', 'three-quarter view from above, 30 degree angle'],
  '01-main-black': [
    'Главное фото, чёрный вариант корпуса',
    'three-quarter view from above, 30 degree angle, BLACK case variant',
  ],
  '02-top': ['Строго сверху, по центру', 'top-down flat view, perfectly centered'],
  '02-top-black': ['Сверху, чёрный вариант', 'top-down flat view, perfectly centered, BLACK case variant'],
  '03-detail': ['Макро кейкапов', 'macro close-up, shallow depth of field'],
  '02-detail': ['Макро-деталь', 'macro close-up, shallow depth of field'],
  '04-lifestyle': [
    'На столе в уютном сетапе (фон не серый)',
    'on a wooden desk in a cozy Japanese apartment at night, warm lamp light, soft neon glow in the background, no people',
  ],
  '03-lifestyle': [
    'В интерьере (фон не серый)',
    'on a wooden desk in a cozy Japanese apartment at night, warm lamp light, no people',
  ],
  '03-on-board': [
    'Кейкапы, установленные на клавиатуру',
    'installed on a mechanical keyboard, three-quarter view',
  ],
  '02-exploded': ['Свитч, разобранный по деталям', 'exploded view, parts floating apart in a vertical line'],
  '03-group': ['Россыпь свитчей сверху', 'many switches scattered, top-down'],
};

const subject = (slug: string, category: string) =>
  category === 'keyboards'
    ? `studio product photo of a mechanical keyboard, ${COLORS[slug]}, blank keycaps with no legends`
    : category === 'keycaps'
      ? `studio product photo of a set of blank mechanical keyboard keycaps, ${COLORS[slug]}, neatly arranged on a light wooden tray`
      : category === 'switches'
        ? `macro studio photo of a mechanical keyboard switch, ${COLORS[slug]}, visible metal spring and stem`
        : `studio product photo of a ${COLORS[slug]}`;

export const BRIEFS: Record<string, Brief> = {};

for (const p of PRODUCTS) {
  for (const slot of p.images.concat(p.options.flatMap((o) => o.values.flatMap((v) => v.images ?? [])))) {
    const shot = slot.split('/').at(-1) ?? '01-main';
    const [what, angle] = SHOT[shot] ?? SHOT['01-main']!;
    const lifestyle = shot.includes('lifestyle');
    BRIEFS[slot] = {
      size: [2048, 2560],
      where: `Карточка товара «${p.name}», каталог`,
      what,
      prompt: `${subject(p.slug, p.category)}, ${angle}${lifestyle ? '' : `, ${STUDIO}`}\nNegative: ${NEGATIVE}`,
    };
  }
}

const marketing: [string, [number, number], string, string, string][] = [
  [
    'marketing/hero',
    [2560, 1440],
    'Главная, первый экран (десктоп)',
    'УЖЕ ГОТОВО — сгенерировано. Клавиатура, разобранная на слои, лепестки сакуры, левая треть пустая под текст',
    'mechanical keyboard floating and exploded into layers (case, plate, PCB, switches, keycaps) above a dark ink background, cherry blossom petals flying, pink neon rim light, cinematic, the left third of the frame is empty for text',
  ],
  [
    'marketing/hero-mobile',
    [1080, 1920],
    'Главная, первый экран (телефон)',
    'УЖЕ ГОТОВО — вырезано скриптом из hero. Можно заменить отдельной вертикальной генерацией: клавиатура в нижней половине, верх свободен под текст',
    'Same scene as hero, vertical 9:16 composition, exploded keyboard in the lower half, empty dark space on top for text',
  ],
  [
    'marketing/collection-sakura',
    [1200, 1500],
    'Главная, bento — высокая плитка «Сакура»',
    'Розово-белый сетап, ветка сакуры, мягкий утренний свет',
    'pink and white mechanical keyboard setup on a desk, cherry blossom branch in a vase, soft morning light, pastel tones, no text',
  ],
  [
    'marketing/collection-matcha',
    [2000, 1000],
    'Главная, bento — широкая плитка «Матча»',
    'Зелёный сетап, чашка матча, бамбук, дневной свет',
    'green mechanical keyboard next to a bowl of matcha and a bamboo whisk, daylight, calm japanese interior, no text',
  ],
  [
    'marketing/collection-sumi',
    [1200, 1200],
    'Главная, bento — квадрат «Суми»',
    'Чёрно-белый минимализм, кисть и тушь, жёсткий контраст',
    'black mechanical keyboard on rice paper with an ink brush and ink stone, black and white minimalism, hard contrast, no text',
  ],
  [
    'marketing/collection-neon',
    [1200, 1200],
    'Главная, bento — квадрат «Неон»',
    'Прозрачная клавиатура с RGB, ночной Токио за окном размыт',
    'clear mechanical keyboard with RGB glow, blurred Tokyo night city through a window, neon reflections, no text',
  ],
  [
    'marketing/drop-desktop',
    [2400, 1000],
    'Главная, блок «Дроп недели» (десктоп)',
    'Лимитированный набор Lantern на тёмном фоне с бумажными фонариками',
    'deep red and gold keycaps on a dark background, glowing japanese paper lanterns, cinematic, empty space on the left for text',
  ],
  [
    'marketing/drop-mobile',
    [1080, 1350],
    'Главная, «Дроп недели» (телефон)',
    'Та же сцена вертикально',
    'deep red and gold keycaps, glowing paper lanterns above, vertical composition',
  ],
  [
    'marketing/club-box',
    [1600, 1200],
    'Keycap Club, главный баннер',
    'Открытая коробка подписки: кейкапы в бумаге washi, лента, открытка без текста',
    'open gift box with keycaps wrapped in washi paper, ribbon, blank greeting card, top-down, warm light, no text',
  ],
  [
    'marketing/workshop',
    [1920, 1280],
    'Главная, блок «О мастерской»',
    'Верстак ночью: инструменты, свитчи, паяльник, тёплая лампа, неоновая вывеска без букв',
    'keyboard workshop bench at night, tools, switches, soldering iron, warm desk lamp, neon sign without letters, cinematic',
  ],
  [
    'marketing/setup-01',
    [1080, 1350],
    'Отзывы, фото сетапов покупателей',
    'Сетап покупателя №1 (без людей)',
    'cozy desk setup with a pink mechanical keyboard, plants, evening light, no people',
  ],
  [
    'marketing/setup-02',
    [1080, 1350],
    'Отзывы, фото сетапов покупателей',
    'Сетап покупателя №2',
    'minimal white desk setup with a green mechanical keyboard, daylight, no people',
  ],
  [
    'marketing/setup-03',
    [1080, 1350],
    'Отзывы, фото сетапов покупателей',
    'Сетап покупателя №3',
    'dark gaming desk setup with a clear RGB mechanical keyboard, neon, no people',
  ],
  [
    'marketing/setup-04',
    [1080, 1350],
    'Отзывы, фото сетапов покупателей',
    'Сетап покупателя №4',
    'wooden desk with a wooden mechanical keyboard and a coffee cup, morning, no people',
  ],
];
for (const [slot, size, where, what, prompt] of marketing) BRIEFS[slot] = { size, where, what, prompt };

const MASCOT_STYLE =
  'cute cartoon shiba inu mascot named Kobo, anime style, thick outline, flat colours, pink #f2a7bf, matcha green #8fa874 and ink black palette, transparent background';
const mascot: [string, string, string, string][] = [
  ['hello', 'Машет лапой', 'Сплэш при запуске, вход в аккаунт', 'waving a paw, happy'],
  [
    'empty-cart',
    'Заглядывает в пустую коробку',
    'Пустая корзина, пустое избранное',
    'peeking into an empty cardboard box, curious',
  ],
  ['not-found', 'С лупой, растерянный', '«Ничего не найдено», 404', 'holding a magnifying glass, confused'],
  ['error', 'Запутался в витом кабеле', 'Ошибка сервера', 'tangled in a coiled keyboard cable, embarrassed'],
  ['offline', 'Спит на клавиатуре', 'Нет сети', 'sleeping on a keyboard, small zzz bubble'],
  ['success', 'Прыгает в конфетти', 'Заказ оформлен', 'jumping with joy in confetti'],
  [
    'typing',
    'Быстро печатает',
    'Загрузка, мини-игра на 404',
    'typing very fast on a tiny keyboard, motion lines',
  ],
];
for (const [id, what, where, pose] of mascot) {
  BRIEFS[`mascot/${id}`] = {
    size: [1024, 1024],
    where,
    what: `Маскот «Кобо»: ${what}. PNG с прозрачным фоном`,
    prompt: `${MASCOT_STYLE}, ${pose}, sitting on a big keycap`,
  };
}
