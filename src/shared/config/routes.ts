import type { CategoryId, Lang } from '@/shared/api/contracts';

/** Every URL in the app starts with the language: /ru/catalog, /pl/product/sakura-65 … */
export const paths = {
  home: (lang: Lang) => `/${lang}`,
  catalog: (lang: Lang, category?: CategoryId) => `/${lang}/catalog${category ? `/${category}` : ''}`,
  product: (lang: Lang, slug: string) => `/${lang}/product/${slug}`,
  builder: (lang: Lang, code?: string) => `/${lang}/builder${code ? `?b=${encodeURIComponent(code)}` : ''}`,
  club: (lang: Lang) => `/${lang}/club`,
  cart: (lang: Lang) => `/${lang}/cart`,
  checkout: (lang: Lang) => `/${lang}/checkout`,
  threeDs: (lang: Lang, paymentId: string) => `/${lang}/checkout/3ds?payment=${paymentId}`,
  order: (lang: Lang, id: string) => `/${lang}/order/${id}`,
  account: (lang: Lang) => `/${lang}/account`,
  login: (lang: Lang, returnTo?: string) =>
    `/${lang}/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`,
  wishlist: (lang: Lang) => `/${lang}/wishlist`,
  compare: (lang: Lang) => `/${lang}/compare`,
};
