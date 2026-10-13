import { decodeBuild, priceBuild } from '@/shared/api/build-code';
import {
  type CartLineInput,
  CUSTOM_BUILD_ID,
  type Facets,
  type Lang,
  type ProductDetail,
  type ProductsQuery,
  type ProductsResponse,
  type ProductSummary,
  type QuoteLine,
} from '@/shared/api/contracts';

import { builderOptions, FAQ, tr } from './catalog';
import { findSeed, PRODUCTS, type SeedProduct } from './products';
import { hashString, RATING_STATS } from './reviews';
import { db } from './store';

/* ───────── Variants & stock ───────── */

export const variantKeys = (p: SeedProduct): string[] =>
  p.options.length === 0
    ? ['default']
    : p.options.reduce<string[]>(
        (keys, option) => keys.flatMap((k) => option.values.map((v) => (k ? `${k}/${v.id}` : v.id))),
        [''],
      );

export const defaultVariant = (p: SeedProduct) => variantKeys(p)[0] ?? 'default';

const seedStock = (p: SeedProduct, key: string) => {
  const override = p.stockOverrides?.[key];
  if (override !== undefined) return override;
  return 4 + (hashString(`${p.slug}:${key}`) % 22);
};

export const stockOf = (p: SeedProduct, key: string) =>
  Math.max(0, seedStock(p, key) - (db.sold[`${p.id}::${key}`] ?? 0));

export const variantPrice = (p: SeedProduct, key: string) => {
  const ids = key.split('/');
  return p.options.reduce((price, option, i) => {
    const value = option.values.find((v) => v.id === ids[i]);
    return price + (value?.priceDelta ?? 0);
  }, p.price);
};

export const variantLabel = (p: SeedProduct, key: string, lang: Lang) => {
  if (key === 'default') return '';
  const ids = key.split('/');
  return p.options
    .map((option, i) => option.values.find((v) => v.id === ids[i]))
    .filter((v) => v !== undefined)
    .map((v) => tr(v.label, lang))
    .join(' · ');
};

export const isValidVariant = (p: SeedProduct, key: string) => variantKeys(p).includes(key);

/* ───────── DTO mapping ───────── */

export const toSummary = (p: SeedProduct, lang: Lang): ProductSummary => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  tagline: p.tagline[lang],
  category: p.category,
  ...(p.layout ? { layout: p.layout } : {}),
  ...(p.switchType ? { switchType: p.switchType } : {}),
  colors: p.colors,
  price: p.price,
  ...(p.compareAt ? { compareAt: p.compareAt } : {}),
  rating: RATING_STATS[p.slug]?.average ?? 0,
  reviewCount: RATING_STATS[p.slug]?.count ?? 0,
  badges: p.badges,
  images: p.images.slice(0, 2),
  inStock: variantKeys(p).some((k) => stockOf(p, k) > 0),
  defaultVariant: variantKeys(p).find((k) => stockOf(p, k) > 0) ?? defaultVariant(p),
  createdAt: p.createdAt,
});

const relatedFor = (p: SeedProduct) =>
  PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

const boughtTogetherFor = (p: SeedProduct) => {
  const want =
    p.category === 'keyboards'
      ? ['keycaps-sakura', 'cable-sakura', 'wristrest-hinoki']
      : ['sakura-65', 'deskmat-seigaiha', 'artisan-shiba'];
  return want.map((slug) => findSeed(slug)).filter((x): x is SeedProduct => !!x && x.id !== p.id);
};

export const toDetail = (p: SeedProduct, lang: Lang): ProductDetail => ({
  ...toSummary(p, lang),
  images: p.images,
  description: p.description[lang],
  options: p.options.map((o) => ({
    id: o.id,
    values: o.values.map((v) => ({
      id: v.id,
      label: tr(v.label, lang),
      priceDelta: v.priceDelta,
      ...(v.swatch ? { swatch: v.swatch } : {}),
      ...(v.images ? { images: v.images } : {}),
    })),
  })),
  stock: Object.fromEntries(variantKeys(p).map((k) => [k, stockOf(p, k)])),
  specs: p.specs.map((s) => ({ key: s.key, value: tr(s.value, lang) })),
  ...(p.soundId ? { soundId: p.soundId } : {}),
  related: relatedFor(p).map((x) => toSummary(x, lang)),
  boughtTogether: boughtTogetherFor(p).map((x) => toSummary(x, lang)),
  faq: (p.category === 'keyboards' ? [...FAQ.keyboards, ...FAQ.default] : FAQ.default).map((f) => ({
    q: f.q[lang],
    a: f.a[lang],
  })),
});

/* ───────── Listing with facets ───────── */

const matches = (p: SeedProduct, q: ProductsQuery, lang: Lang, skip?: keyof Facets) => {
  if (q.slugs?.length && !q.slugs.includes(p.slug)) return false;
  if (skip !== 'category' && q.category && p.category !== q.category) return false;
  if (skip !== 'layout' && q.layout?.length && (!p.layout || !q.layout.includes(p.layout))) return false;
  if (
    skip !== 'switchType' &&
    q.switchType?.length &&
    (!p.switchType || !q.switchType.includes(p.switchType))
  )
    return false;
  if (skip !== 'color' && q.color?.length && !p.colors.some((c) => q.color?.includes(c))) return false;
  if (skip !== 'price' && q.priceMin !== undefined && p.price < q.priceMin) return false;
  if (skip !== 'price' && q.priceMax !== undefined && p.price > q.priceMax) return false;
  if (skip !== 'inStock' && q.inStock && !variantKeys(p).some((k) => stockOf(p, k) > 0)) return false;
  if (q.q) {
    const needle = q.q.toLowerCase();
    const haystack = `${p.name} ${p.tagline[lang]} ${p.category}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
};

const count = <K extends string>(list: SeedProduct[], pick: (p: SeedProduct) => K[] | K | undefined) => {
  const out: Partial<Record<K, number>> = {};
  for (const p of list) {
    const value = pick(p);
    const keys = Array.isArray(value) ? value : value === undefined ? [] : [value];
    for (const key of keys) out[key] = (out[key] ?? 0) + 1;
  }
  return out;
};

const SORTERS: Record<NonNullable<ProductsQuery['sort']>, (a: SeedProduct, b: SeedProduct) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  new: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => (RATING_STATS[b.slug]?.average ?? 0) - (RATING_STATS[a.slug]?.average ?? 0),
};

export const listProducts = (q: ProductsQuery, lang: Lang): ProductsResponse => {
  const filtered = PRODUCTS.filter((p) => matches(p, q, lang)).sort(SORTERS[q.sort ?? 'popular']);
  const limit = q.limit ?? 12;
  const page = Math.max(1, q.page ?? 1);
  const allPrices = PRODUCTS.filter((p) => matches(p, q, lang, 'price')).map((p) => p.price);

  // Each facet counts results with all *other* filters applied — the classic e-commerce behaviour.
  const facets: Facets = {
    category: count(
      PRODUCTS.filter((p) => matches(p, q, lang, 'category')),
      (p) => p.category,
    ),
    layout: count(
      PRODUCTS.filter((p) => matches(p, q, lang, 'layout')),
      (p) => p.layout,
    ),
    switchType: count(
      PRODUCTS.filter((p) => matches(p, q, lang, 'switchType')),
      (p) => p.switchType,
    ),
    color: count(
      PRODUCTS.filter((p) => matches(p, q, lang, 'color')),
      (p) => p.colors,
    ),
    price: { min: Math.min(...allPrices, 0), max: Math.max(...allPrices, 0) },
    inStock: PRODUCTS.filter((p) => matches(p, { ...q, inStock: true }, lang)).length,
  };

  return {
    // Page-based slices; the client stitches them together with useInfiniteQuery ("show more").
    items: filtered.slice((page - 1) * limit, page * limit).map((p) => toSummary(p, lang)),
    total: filtered.length,
    page,
    pageCount: Math.max(1, Math.ceil(filtered.length / limit)),
    facets,
  };
};

/* ───────── Pricing of cart lines ───────── */

export type PricedLine = QuoteLine & { seed?: SeedProduct };

export const priceLine = (line: CartLineInput, lang: Lang): PricedLine | null => {
  if (line.productId === CUSTOM_BUILD_ID) {
    const build = decodeBuild(line.variantKey);
    const options = builderOptions(lang);
    const price = build && priceBuild(build, options);
    if (!build || !price) return null;
    const caps = options.keycaps.find((k) => k.id === build.keycaps)?.label ?? '';
    const caseLabel = options.cases.find((c) => c.id === build.case)?.label ?? '';
    return {
      key: `${line.productId}::${line.variantKey}`,
      productId: line.productId,
      variantKey: line.variantKey,
      name: { ru: 'Своя сборка', en: 'Custom build', pl: 'Własna konfiguracja' }[lang],
      variantLabel: [build.layout.toUpperCase(), caseLabel, caps, build.engraving && `«${build.engraving}»`]
        .filter(Boolean)
        .join(' · '),
      unitPrice: price.total,
      qty: line.qty,
      total: price.total * line.qty,
      available: 10,
    };
  }
  const seed = findSeed(line.productId);
  if (!seed || !isValidVariant(seed, line.variantKey)) return null;
  const variantImages = seed.options
    .find((o) => o.id === 'color')
    ?.values.find((v) => line.variantKey.split('/').includes(v.id))?.images;
  const unitPrice = variantPrice(seed, line.variantKey);
  return {
    key: `${line.productId}::${line.variantKey}`,
    productId: seed.id,
    slug: seed.slug,
    variantKey: line.variantKey,
    name: seed.name,
    variantLabel: variantLabel(seed, line.variantKey, lang),
    image: variantImages?.[0] ?? seed.images[0] ?? '',
    unitPrice,
    qty: line.qty,
    total: unitPrice * line.qty,
    available: stockOf(seed, line.variantKey),
    seed,
  };
};
