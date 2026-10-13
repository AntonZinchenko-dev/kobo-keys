import { http, HttpResponse } from 'msw';

import type {
  CategoryId,
  ColorId,
  Layout,
  ProductsQuery,
  ReviewsResponse,
  SearchSuggestResponse,
  SortId,
  SwitchType,
} from '@/shared/api/contracts';

import { builderOptions, RATES } from '../db/catalog';
import { findSeed, PRODUCTS } from '../db/products';
import { listProducts, toDetail, toSummary } from '../db/queries';
import { reviewsFor } from '../db/reviews';
import { db, saveDb } from '../db/store';
import { API, fail, langOf, list, num } from './utils';

export const catalogHandlers = [
  http.get(`${API}/rates`, () => HttpResponse.json(RATES)),

  http.get(`${API}/products`, ({ request }) => {
    const p = new URL(request.url).searchParams;
    const query: ProductsQuery = {
      category: (p.get('category') ?? undefined) as CategoryId | undefined,
      layout: list(p.get('layout')) as Layout[] | undefined,
      switchType: list(p.get('switchType')) as SwitchType[] | undefined,
      color: list(p.get('color')) as ColorId[] | undefined,
      priceMin: num(p.get('priceMin')),
      priceMax: num(p.get('priceMax')),
      inStock: p.get('inStock') === 'true',
      q: p.get('q') ?? undefined,
      sort: (p.get('sort') ?? undefined) as SortId | undefined,
      page: num(p.get('page')),
      limit: num(p.get('limit')),
      slugs: list(p.get('slugs')),
    };
    return HttpResponse.json(listProducts(query, langOf(request)));
  }),

  http.get(`${API}/products/:slug`, ({ params, request }) => {
    const seed = findSeed(String(params.slug));
    if (!seed) return fail(404, 'PRODUCT_NOT_FOUND');
    return HttpResponse.json(toDetail(seed, langOf(request)));
  }),

  http.get(`${API}/products/:slug/reviews`, ({ params, request }) => {
    const slug = String(params.slug);
    if (!findSeed(slug)) return fail(404, 'PRODUCT_NOT_FOUND');
    const search = new URL(request.url).searchParams;
    const rating = num(search.get('rating'));
    const page = num(search.get('page')) ?? 1;
    const limit = 5;
    const all = reviewsFor(slug, langOf(request)).map((r) => ({
      ...r,
      helpful: r.helpful + (db.helpful[r.id] ?? 0),
    }));
    const filtered = rating ? all.filter((r) => r.rating === rating) : all;
    const distribution: ReviewsResponse['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of all) distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
    const body: ReviewsResponse = {
      items: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      page,
      pageCount: Math.max(1, Math.ceil(filtered.length / limit)),
      average: Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10,
      distribution,
    };
    return HttpResponse.json(body);
  }),

  http.post(`${API}/reviews/:id/helpful`, ({ params }) => {
    const id = String(params.id);
    db.helpful[id] = (db.helpful[id] ?? 0) + 1;
    saveDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/search/suggest`, ({ request }) => {
    const lang = langOf(request);
    const q = (new URL(request.url).searchParams.get('q') ?? '').trim().toLowerCase();
    const found = q
      ? PRODUCTS.filter((p) => `${p.name} ${p.tagline[lang]}`.toLowerCase().includes(q))
      : [...PRODUCTS].sort((a, b) => b.popularity - a.popularity);
    const body: SearchSuggestResponse = {
      products: found.slice(0, 6).map((p) => {
        const s = toSummary(p, lang);
        return { slug: s.slug, name: s.name, images: s.images, price: s.price, category: s.category };
      }),
      categories: [...new Set(found.map((p) => p.category))],
    };
    return HttpResponse.json(body);
  }),

  http.get(`${API}/builder/options`, ({ request }) => HttpResponse.json(builderOptions(langOf(request)))),
];
