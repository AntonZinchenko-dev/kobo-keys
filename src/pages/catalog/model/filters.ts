import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
  CATEGORIES,
  type CategoryId,
  type ColorId,
  COLORS,
  type Layout,
  LAYOUTS,
  type ProductsQuery,
  type SortId,
  SORTS,
  SWITCH_TYPES,
  type SwitchType,
} from '@/shared/api';

export const PAGE_SIZE = 12;

export interface Filters {
  layout: Layout[];
  switchType: SwitchType[];
  color: ColorId[];
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  inStock: boolean;
  sort: SortId;
  q: string;
}

const pick = <T extends string>(raw: string | null, allowed: readonly T[]) =>
  (raw ?? '').split(',').filter((v): v is T => (allowed as readonly string[]).includes(v));

const int = (raw: string | null) => {
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(n) ? n : undefined;
};

export const parseFilters = (params: URLSearchParams): Filters => ({
  layout: pick(params.get('layout'), LAYOUTS),
  switchType: pick(params.get('switch'), SWITCH_TYPES),
  color: pick(params.get('color'), COLORS),
  priceMin: int(params.get('min')),
  priceMax: int(params.get('max')),
  inStock: params.get('stock') === '1',
  sort: pick(params.get('sort'), SORTS)[0] ?? 'popular',
  q: params.get('q') ?? '',
});

export const serializeFilters = (f: Filters, pages = 1) => {
  const params = new URLSearchParams();
  if (f.layout.length) params.set('layout', f.layout.join(','));
  if (f.switchType.length) params.set('switch', f.switchType.join(','));
  if (f.color.length) params.set('color', f.color.join(','));
  if (f.priceMin !== undefined) params.set('min', String(f.priceMin));
  if (f.priceMax !== undefined) params.set('max', String(f.priceMax));
  if (f.inStock) params.set('stock', '1');
  if (f.sort !== 'popular') params.set('sort', f.sort);
  if (f.q) params.set('q', f.q);
  if (pages > 1) params.set('pages', String(pages));
  return params;
};

export const toQuery = (f: Filters, category: CategoryId | undefined, pages: number): ProductsQuery => ({
  ...(category ? { category } : {}),
  layout: f.layout,
  switchType: f.switchType,
  color: f.color,
  ...(f.priceMin !== undefined ? { priceMin: f.priceMin } : {}),
  ...(f.priceMax !== undefined ? { priceMax: f.priceMax } : {}),
  inStock: f.inStock,
  sort: f.sort,
  ...(f.q ? { q: f.q } : {}),
  page: 1,
  limit: PAGE_SIZE * pages,
});

export const activeCount = (f: Filters) =>
  f.layout.length +
  f.switchType.length +
  f.color.length +
  (f.priceMin !== undefined || f.priceMax !== undefined ? 1 : 0) +
  (f.inStock ? 1 : 0);

export const isCategory = (value: string | undefined): value is CategoryId =>
  (CATEGORIES as readonly string[]).includes(value ?? '');

/**
 * All catalog state lives in the URL: filters, sort, search and how many pages are shown.
 * A link can be shared, the back button works, a refresh keeps everything.
 */
export const useCatalogFilters = () => {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const pages = Math.max(1, int(params.get('pages')) ?? 1);

  const setFilters = useCallback(
    (next: Filters) => setParams(serializeFilters(next), { replace: true, preventScrollReset: true }),
    [setParams],
  );
  const showMore = useCallback(
    () => setParams(serializeFilters(filters, pages + 1), { replace: true, preventScrollReset: true }),
    [filters, pages, setParams],
  );
  return { filters, pages, setFilters, showMore };
};
