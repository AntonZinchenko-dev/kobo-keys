# KŌBŌ Keys

**A mechanical keyboard shop with a Japanese soul — an e-commerce / SaaS portfolio project.**
Catalog with faceted filters, product page with variants, a live SVG keyboard builder, cart with optimistic
updates, 3-step checkout with a simulated payment gateway (declines, 3-D Secure, idempotency), customer account,
a subscription (“Keycap Club”), three languages and three currencies.

There is no server: the whole backend is mocked with **MSW** and runs in the visitor's browser,
so the project is fully functional on **GitHub Pages**.

**Live demo:** https://antonzinchenko-dev.github.io/kobo-keys/ — the app opens on the sign-in screen;
press **“Enter the demo account”** (or use any email with the code `000000`).

> Test cards: `4242 4242 4242 4242` succeeds · `…0002` is declined · `4000 0027 6000 3184` asks for 3-D Secure (code `1234`) ·
> `…9995` insufficient funds. Promo codes: `KOBO10`, `FREESHIP`, `SUMMER24` (expired). Sign-in code: `000000`.
> Everything is also in the 🧪 developer panel on the site.

---

## What's inside

| Area               | Highlights                                                                                                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Catalog**        | Facets counted with the other filters applied, all state in the URL (shareable, back button works), “show more”, quick view, compare, mobile bottom-sheet filters with a live “Show 18 products” counter                                                |
| **Product page**   | Gallery with cursor zoom / swipe / fullscreen, variants that change price, stock and photos (sold-out combinations crossed out, variant in the URL), synthesized switch sounds (Web Audio), reviews with rating distribution filter and “helpful” votes |
| **Builder**        | Keyboard rendered in SVG from config (layout, case, keycaps, switches, lighting, spacebar engraving), animated RGB wave via `@property`, undo/redo (Ctrl+Z), share link, PNG export, price breakdown popover with CSS anchor positioning                |
| **Cart**           | Optimistic updates with rollback on “out of stock”, undo on remove, sync between tabs, server-side totals, promo codes, free-shipping progress                                                                                                          |
| **Checkout**       | 3 steps, Zod validation, phone mask, address suggestions, Luhn check + card brand detection, Apple/Google Pay imitation, idempotency key, “sold out while you were paying” conflict dialog, 3-D Secure page, confetti 🎉                                |
| **Account & SaaS** | Sign-in screen as the entry point (auth-gated routes, return to the requested page, 401 → sign-in), passwordless sign-in, orders with a live status timeline, reorder, subscription with plan change, pause (retention flow) and cancel                 |
| **i18n**           | ru / en / pl in the URL, ICU plurals (“1 товар / 2 товара / 5 товаров”, “2 produkty / 5 produktów”), `Intl` money/dates/relative time, EUR / PLN / USD, lazy-loaded namespaces, typed keys, pseudo-locale for layout testing                            |
| **Resilience**     | Developer panel: network latency (fast / normal / 3G), random 5xx errors, offline mode, failure scenarios — every loading and error state is visible                                                                                                    |

## Modern CSS

A custom accessible dropdown (WAI-ARIA select-only combobox in the top layer via the Popover API, subgrid-aligned
options, `@starting-style` open/close animation) replaces native selects. View Transitions (product image morphs from the card into the gallery, theme switch as a circle growing from the
button, language switch) · scroll-driven animations (`animation-timeline: scroll()` / `view()`) for the hero
parallax, condensing glass header and section reveals · `@property` for an animated conic border, RGB hue wave and
3D card tilt · container queries · `:has()` · Popover API + `@starting-style` · native `<dialog>` sheets and drawers ·
CSS anchor positioning · `interpolate-size` for `<details>` · `light-dark()` + oklch tokens · `text-wrap: balance` ·
`field-sizing` · `::scroll-marker` carousels · all behind `@supports` and `prefers-reduced-motion`.

## Architecture

**Feature-Sliced Design 2.1**, checked by [Steiger](https://github.com/feature-sliced/steiger).

```
src/
  app/        entry, router, layout, global styles and tokens
  pages/      home, catalog, product, builder, club, cart, checkout, three-ds, order, account, login, wishlist, compare, not-found
  widgets/    header, bottom-nav, footer, mini-cart, search-dialog (Ctrl+K), product-list, dev-panel
  features/   add-to-cart, edit-cart, apply-promo, toggle-wishlist, toggle-compare, switch-language, switch-currency, toggle-theme
  entities/   product, cart, keyboard-build, order, session, subscription
  shared/     api (client + backend contract), ui kit, i18n, lib (money, theme, sound…), config, images
mocks/        MSW handlers + in-browser database (IndexedDB) — the "backend"
```

The UI talks to `/api/*` with plain `fetch`. The contract lives in `src/shared/api/contracts.ts`;
replacing MSW with a real server needs no UI changes.

### How the backend works on GitHub Pages

```
GitHub Pages ── serves static files ──▶ browser
                                         ├─ React app ── fetch('/kobo-keys/api/products') ─┐
                                         └─ MSW service worker ◀───────────────────────────┘
                                              └─ seed JSON + IndexedDB (orders, users, subscriptions)
```

GitHub Pages specifics: base path `/kobo-keys/` (Vite `base` + router `basename`), `404.html` = copy of
`index.html` for deep links, `.nojekyll`, worker registered by base path, images pre-optimised at build time.

## Stack

React 19 · TypeScript (strict) · Vite 7 · React Router 7 · TanStack Query 5 · Zustand · React Hook Form + Zod ·
i18next + ICU · MSW 2 · CSS Modules · Vitest + Testing Library · Playwright + axe · ESLint (typescript-eslint strict,
jsx-a11y, react-hooks) · Stylelint · Prettier · Steiger · Husky + lint-staged + commitlint · size-limit · Lighthouse CI.

## Images

Images are addressed by _slots_ (`products/sakura-65/01-main`). A slot shows an Unsplash stock photo until the real
file is put into `assets-src/` and `npm run images` is run — then it is served as local AVIF/WebP in 6 widths with a
blurred placeholder (`sharp`, see `scripts/build-images.ts`). Each folder in `assets-src/` has a README with the size,
what the picture must show and a ready-made generation prompt.

## Quality

| Check                                   | Command                                                      |
| --------------------------------------- | ------------------------------------------------------------ |
| Types                                   | `npm run typecheck`                                          |
| ESLint / Stylelint / Prettier           | `npm run lint` · `npm run lint:css` · `npm run format:check` |
| FSD architecture                        | `npm run lint:fsd`                                           |
| Unit + component tests (MSW-backed)     | `npm test`                                                   |
| E2E, accessibility (axe), 360 px layout | `npm run test:e2e`                                           |
| Bundle budget                           | `npm run size`                                               |
| Everything at once                      | `npm run check`                                              |

CI (`.github/workflows/ci.yml`) runs all of it plus Lighthouse budgets on every PR; `deploy.yml` publishes to
GitHub Pages on every push to `main`.

## Run locally

```bash
nvm use            # Node 22
npm ci
npm run dev        # http://localhost:5173/kobo-keys/
```

## Deploy your own copy

1. Push the repository to GitHub.
2. _Settings → Pages → Build and deployment → Source: **GitHub Actions**_.
3. Push to `main` — the site appears at `https://<user>.github.io/<repo>/` (the base path is taken from the repo name).

---

Stock photos: [Unsplash](https://unsplash.com/license). Icons: [Lucide](https://lucide.dev) (ISC).
Fonts: Unbounded, Onest, JetBrains Mono (OFL). Portfolio project by Anton Zinchenko.
