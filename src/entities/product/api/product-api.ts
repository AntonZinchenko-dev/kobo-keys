import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  api,
  type Lang,
  type ProductDetail,
  type ProductsQuery,
  type ProductsResponse,
  type ReviewsResponse,
  type SearchSuggestResponse,
} from '@/shared/api';

export const productKeys = {
  all: ['products'] as const,
  list: (lang: Lang, query: ProductsQuery) => ['products', 'list', lang, query] as const,
  detail: (lang: Lang, slug: string) => ['products', 'detail', lang, slug] as const,
  reviews: (lang: Lang, slug: string, page: number, rating?: number) =>
    ['products', 'reviews', lang, slug, page, rating ?? 0] as const,
  suggest: (lang: Lang, q: string) => ['products', 'suggest', lang, q] as const,
};

const toQuery = (q: ProductsQuery) => ({ ...q, inStock: q.inStock ? 'true' : undefined });

export const productsQuery = (lang: Lang, query: ProductsQuery) =>
  queryOptions({
    queryKey: productKeys.list(lang, query),
    queryFn: ({ signal }) => api<ProductsResponse>('/products', { query: toQuery(query), signal }),
    placeholderData: keepPreviousData,
  });

/** Catalog uses "show more": pages are appended, the URL keeps how many are loaded. */
export const productsInfiniteQuery = (lang: Lang, query: Omit<ProductsQuery, 'page'>) =>
  infiniteQueryOptions({
    queryKey: [...productKeys.list(lang, query), 'infinite'] as const,
    queryFn: ({ pageParam, signal }) =>
      api<ProductsResponse>('/products', { query: toQuery({ ...query, page: pageParam }), signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

export const productQuery = (lang: Lang, slug: string) =>
  queryOptions({
    queryKey: productKeys.detail(lang, slug),
    queryFn: ({ signal }) => api<ProductDetail>(`/products/${slug}`, { signal }),
  });

export const reviewsQuery = (lang: Lang, slug: string, page: number, rating?: number) =>
  queryOptions({
    queryKey: productKeys.reviews(lang, slug, page, rating),
    queryFn: ({ signal }) =>
      api<ReviewsResponse>(`/products/${slug}/reviews`, { query: { page, rating }, signal }),
    placeholderData: keepPreviousData,
  });

export const suggestQuery = (lang: Lang, q: string) =>
  queryOptions({
    queryKey: productKeys.suggest(lang, q),
    queryFn: ({ signal }) => api<SearchSuggestResponse>('/search/suggest', { query: { q }, signal }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

export const useMarkHelpful = (lang: Lang, slug: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => api<undefined>(`/reviews/${reviewId}/helpful`, { method: 'POST' }),
    onSettled: () => client.invalidateQueries({ queryKey: ['products', 'reviews', lang, slug] }),
  });
};

/** Find the variant key for a set of chosen option values ("white/silk-linear"). */
export const variantKeyOf = (product: Pick<ProductDetail, 'options'>, chosen: Record<string, string>) =>
  product.options.length === 0
    ? 'default'
    : product.options.map((o) => chosen[o.id] ?? o.values[0]?.id ?? '').join('/');

export const variantPriceOf = (product: ProductDetail, key: string) => {
  const ids = key.split('/');
  return product.options.reduce(
    (sum, option, i) => sum + (option.values.find((v) => v.id === ids[i])?.priceDelta ?? 0),
    product.price,
  );
};
