/**
 * Backend contract (DTOs). In a real project this file would be generated from OpenAPI.
 * The MSW mock backend (/mocks) implements exactly this contract, so swapping it for a
 * real server needs no changes in the UI code.
 *
 * Money is always integer cents in the base currency (EUR); the client converts for display.
 */

export const LANGS = ['ru', 'en', 'pl'] as const;
export type Lang = (typeof LANGS)[number];

export const CURRENCIES = ['EUR', 'PLN', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CATEGORIES = ['keyboards', 'keycaps', 'switches', 'accessories'] as const;
export type CategoryId = (typeof CATEGORIES)[number];

export const LAYOUTS = ['60', '65', '75', 'tkl', 'split'] as const;
export type Layout = (typeof LAYOUTS)[number];

export const SWITCH_TYPES = ['linear', 'tactile', 'clicky', 'silent'] as const;
export type SwitchType = (typeof SWITCH_TYPES)[number];

export const COLORS = [
  'pink',
  'white',
  'black',
  'green',
  'blue',
  'red',
  'orange',
  'yellow',
  'purple',
  'wood',
] as const;
export type ColorId = (typeof COLORS)[number];

export const SORTS = ['popular', 'new', 'price-asc', 'price-desc', 'rating'] as const;
export type SortId = (typeof SORTS)[number];

export type Badge = 'new' | 'drop' | 'bestseller' | 'sale' | 'limited';

export interface ApiErrorBody {
  code: string;
  message?: string;
  details?: unknown;
}

/* ───────── Catalog ───────── */

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: CategoryId;
  layout?: Layout;
  switchType?: SwitchType;
  colors: ColorId[];
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  badges: Badge[];
  /** Image slot ids, e.g. "products/sakura-65/01-main" */
  images: string[];
  inStock: boolean;
  /** Variant key used by "add to cart" from a listing */
  defaultVariant: string;
  createdAt: string;
}

export type OptionId = 'color' | 'switch' | 'size' | 'kit';

export interface ProductOptionValue {
  id: string;
  label: string;
  priceDelta: number;
  /** CSS color for swatches */
  swatch?: string;
  /** Replaces the gallery when this value is selected */
  images?: string[];
}

export interface ProductOption {
  id: OptionId;
  values: ProductOptionValue[];
}

export type SpecKey =
  | 'layout'
  | 'case'
  | 'plate'
  | 'mount'
  | 'hotswap'
  | 'connection'
  | 'weight'
  | 'material'
  | 'profile'
  | 'keys'
  | 'actuation'
  | 'travel'
  | 'size'
  | 'length';

export interface ProductDetail extends ProductSummary {
  description: string;
  options: ProductOption[];
  /** Stock per variant key ("white/silk-linear"); 0 = sold out */
  stock: Record<string, number>;
  specs: { key: SpecKey; value: string }[];
  soundId?: string;
  related: ProductSummary[];
  boughtTogether: ProductSummary[];
  faq: { q: string; a: string }[];
}

export interface ProductsQuery {
  category?: CategoryId;
  layout?: Layout[];
  switchType?: SwitchType[];
  color?: ColorId[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  q?: string;
  sort?: SortId;
  page?: number;
  limit?: number;
  slugs?: string[];
}

export interface Facets {
  category: Partial<Record<CategoryId, number>>;
  layout: Partial<Record<Layout, number>>;
  switchType: Partial<Record<SwitchType, number>>;
  color: Partial<Record<ColorId, number>>;
  price: { min: number; max: number };
  inStock: number;
}

export interface ProductsResponse {
  items: ProductSummary[];
  total: number;
  page: number;
  pageCount: number;
  facets: Facets;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
  verified: boolean;
  variantLabel?: string;
  photos: string[];
}

export interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  pageCount: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface SearchSuggestResponse {
  products: Pick<ProductSummary, 'slug' | 'name' | 'images' | 'price' | 'category'>[];
  categories: CategoryId[];
}

/* ───────── Builder ───────── */

export interface BuilderOptions {
  layouts: { id: Exclude<Layout, 'split'>; label: string; price: number; keys: number }[];
  cases: { id: string; label: string; color: string; price: number }[];
  keycaps: { id: string; label: string; alpha: string; mod: string; accent: string; price: number }[];
  switches: { id: string; label: string; type: SwitchType; color: string; pricePerKey: number }[];
  lighting: { id: 'off' | 'static' | 'breathing' | 'wave'; label: string; price: number }[];
  engraving: { price: number; maxLength: number };
  buildDays: number;
}

export interface KeyboardBuild {
  layout: Exclude<Layout, 'split'>;
  case: string;
  keycaps: string;
  switch: string;
  lighting: 'off' | 'static' | 'breathing' | 'wave';
  engraving: string;
}

/* ───────── Cart / checkout ───────── */

export const CUSTOM_BUILD_ID = 'custom-build';

export interface CartLineInput {
  productId: string;
  variantKey: string;
  qty: number;
}

export type ShippingMethod = 'courier' | 'pickup' | 'workshop';

export interface ShippingOption {
  id: ShippingMethod;
  price: number;
  etaDays: [number, number];
}

export interface QuoteRequest {
  lines: CartLineInput[];
  promo?: string;
  shipping?: ShippingMethod;
}

export interface QuoteLine {
  key: string;
  productId: string;
  variantKey: string;
  name: string;
  variantLabel: string;
  image?: string;
  slug?: string;
  unitPrice: number;
  qty: number;
  total: number;
  available: number;
}

export interface Promo {
  code: string;
  kind: 'percent' | 'free_shipping';
  value: number;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promo?: Promo;
  freeShippingThreshold: number;
}

export interface StockCheckResponse {
  available: number;
}

export interface Contact {
  email: string;
  name: string;
  phone: string;
}

export interface Address {
  country: string;
  city: string;
  street: string;
  zip: string;
}

export interface CheckoutRequest {
  lines: CartLineInput[];
  promo?: string;
  shipping: ShippingMethod;
  contact: Contact;
  address?: Address;
  comment?: string;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'canceled';

export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay';

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  shippingPrice: number;
  total: number;
  shipping: ShippingMethod;
  contact: Contact;
  address?: Address;
  payment?: { method: PaymentMethod; brand?: string; last4?: string };
  timeline: { status: OrderStatus; at: string }[];
}

export interface PaymentRequest {
  orderId: string;
  method: PaymentMethod;
  card?: { number: string; exp: string; cvc: string; name: string };
}

export interface PaymentResponse {
  status: 'succeeded' | 'requires_action';
  paymentId: string;
  orderId: string;
}

/* ───────── Account / subscription ───────── */

export interface User {
  id: string;
  email: string;
  name: string;
  addresses: Address[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type PlanId = 'starter' | 'collector' | 'master';
export type BillingPeriod = 'month' | 'year';

export interface Plan {
  id: PlanId;
  name: string;
  monthly: number;
  yearly: number;
  features: string[];
  highlight: boolean;
}

export interface Subscription {
  plan: PlanId;
  period: BillingPeriod;
  status: 'active' | 'paused' | 'canceled';
  startedAt: string;
  nextBillingAt: string | null;
  pausedUntil: string | null;
  history: { date: string; amount: number; status: 'paid' | 'refunded' }[];
}

export type SubscriptionAction =
  | { type: 'change'; plan: PlanId; period: BillingPeriod }
  | { type: 'pause'; months: 1 | 2 | 3 }
  | { type: 'resume' }
  | { type: 'cancel' };

export interface Rates {
  base: 'EUR';
  rates: Record<Currency, number>;
  updatedAt: string;
}
