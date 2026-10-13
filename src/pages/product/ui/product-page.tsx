import { type CSSProperties, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { ProductRail } from '@/widgets/product-list';
import { AddToCartButton } from '@/features/add-to-cart';
import { CompareButton } from '@/features/toggle-compare';
import { WishlistButton } from '@/features/toggle-wishlist';
import { productQuery, variantKeyOf, variantPriceOf } from '@/entities/product';
import { isApiError } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { playSwitchSound } from '@/shared/lib';
import {
  Accordion,
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  Icon,
  Price,
  Quantity,
  Rating,
  Skeleton,
  toast,
} from '@/shared/ui';

import { Gallery } from './gallery';
import { Reviews } from './reviews';

import styles from './product-page.module.css';

const BADGE_TONE = {
  new: 'matcha',
  drop: 'sakura',
  bestseller: 'gold',
  sale: 'danger',
  limited: 'sakura',
} as const;

export const ProductPage = () => {
  const { t } = useTranslation('shop');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const [qty, setQty] = useState(1);
  const { data: product, isPending, error } = useQuery(productQuery(lang, slug));

  if (error) {
    const notFound = isApiError(error) && error.status === 404;
    return (
      <div className="container">
        <EmptyState
          mascot={notFound ? 'not-found' : 'error'}
          title={notFound ? t('product.notFound') : tc('errors.loadFailed')}
          action={<ButtonLink to={paths.catalog(lang)}>{tc('cart.toCatalog')}</ButtonLink>}
        />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className={`container ${styles.layout}`} aria-busy="true">
        <Skeleton
          style={{
            aspectRatio: '4 / 5',
            borderRadius: 'var(--radius-lg)',
            viewTransitionName: 'product-image',
          }}
        />
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <Skeleton style={{ height: 40, width: '70%' }} />
          <Skeleton style={{ height: 20, width: '40%' }} />
          <Skeleton style={{ height: 120 }} />
        </div>
      </div>
    );
  }

  // Selected variant lives in the URL (?v=white/silk-linear) — shareable and survives a refresh.
  const chosen: Record<string, string> = {};
  const fromUrl = params.get('v')?.split('/') ?? product.defaultVariant.split('/');
  product.options.forEach((o, i) => {
    const id = fromUrl[i];
    chosen[o.id] = o.values.some((v) => v.id === id) ? (id ?? '') : (o.values[0]?.id ?? '');
  });
  const variantKey = variantKeyOf(product, chosen);
  const stock = product.stock[variantKey] ?? 0;
  const price = variantPriceOf(product, variantKey);
  const colorValue = product.options.find((o) => o.id === 'color')?.values.find((v) => v.id === chosen.color);
  const images = colorValue?.images ?? product.images;
  const variantLabel = product.options
    .map((o) => o.values.find((v) => v.id === chosen[o.id])?.label)
    .filter(Boolean)
    .join(' · ');

  const choose = (optionId: string, valueId: string) => {
    const next = { ...chosen, [optionId]: valueId };
    setParams({ v: variantKeyOf(product, next) }, { replace: true, preventScrollReset: true });
    setQty(1);
  };

  /** Would choosing this value lead to a variant that is in stock (keeping other choices)? */
  const available = (optionId: string, valueId: string) =>
    (product.stock[variantKeyOf(product, { ...chosen, [optionId]: valueId })] ?? 0) > 0;

  const share = async () => {
    const url = window.location.href;
    const nav: Partial<Navigator> = navigator;
    if (nav.share) {
      await nav.share({ title: product.name, url }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(tc('actions.copied'));
    }
  };

  const buy = (
    <AddToCartButton
      product={{ ...product, inStock: stock > 0 }}
      variantKey={variantKey}
      unitPrice={price}
      variantLabel={variantLabel}
      image={images[0]}
      qty={qty}
      size="lg"
      block
    />
  );

  return (
    <div className={styles.page}>
      <title>{`${product.name} — KŌBŌ Keys`}</title>
      <meta name="description" content={product.description} />

      <div className="container">
        <nav aria-label={t('catalog.breadcrumbs')} className={styles.breadcrumbs}>
          <ol>
            <li>
              <Link to={paths.catalog(lang)}>{t('catalog.title')}</Link>
            </li>
            <li>
              <Link to={paths.catalog(lang, product.category)}>{tc(`categories.${product.category}`)}</Link>
            </li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className={styles.layout}>
          <Gallery key={images.join()} images={images} alt={product.name} />

          <div className={styles.info}>
            <div className={styles.badges}>
              {product.badges.map((b) => (
                <Badge key={b} tone={BADGE_TONE[b]}>
                  {tc(`badges.${b}`)}
                </Badge>
              ))}
            </div>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.tagline}>{product.tagline}</p>
            <a href="#reviews" className={styles.ratingLink}>
              <Rating
                value={product.rating}
                count={product.reviewCount}
                label={tc('product.ratingLabel', { rating: product.rating, count: product.reviewCount })}
              />
            </a>
            <Price
              value={price}
              compareAt={product.compareAt ? product.compareAt + (price - product.price) : undefined}
              size="lg"
            />

            {product.options.map((option) => (
              <fieldset key={option.id} className={styles.option}>
                <legend>
                  {t(`options.${option.id}`)}:{' '}
                  <strong>{option.values.find((v) => v.id === chosen[option.id])?.label}</strong>
                </legend>
                <div className={styles.values}>
                  {option.values.map((v) => {
                    const ok = available(option.id, v.id);
                    const selected = chosen[option.id] === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className={clsx(
                          styles.value,
                          option.id === 'color' && styles.colorValue,
                          !ok && styles.unavailable,
                        )}
                        aria-pressed={selected}
                        aria-label={`${v.label}${ok ? '' : ` — ${tc('product.soldOut')}`}`}
                        style={v.swatch ? ({ '--swatch': v.swatch } as CSSProperties) : undefined}
                        onClick={() => choose(option.id, v.id)}
                      >
                        {option.id === 'color' ? <span className="visually-hidden">{v.label}</span> : v.label}
                        {option.id === 'switch' && v.swatch && (
                          <span className={styles.switchDot} aria-hidden="true" />
                        )}
                        {v.priceDelta > 0 && option.id !== 'color' && <span className={styles.delta}>+</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {product.switchType && (
              <Button
                variant="ghost"
                size="sm"
                icon="volume-2"
                onClick={() => {
                  const sw = chosen.switch ?? '';
                  const kind = sw.includes('tactile')
                    ? 'tactile'
                    : sw.includes('clicky')
                      ? 'clicky'
                      : sw.includes('silent')
                        ? 'silent'
                        : 'linear';
                  playSwitchSound(product.category === 'switches' ? (product.switchType ?? 'linear') : kind);
                }}
                className={styles.sound}
              >
                {t('product.listen')}
              </Button>
            )}

            <p
              className={clsx(styles.stock, stock === 0 && styles.out, stock > 0 && stock <= 5 && styles.low)}
              aria-live="polite"
            >
              <span className={styles.stockDot} aria-hidden="true" />
              {stock === 0
                ? tc('product.soldOut')
                : stock <= 5
                  ? tc('cart.onlyLeft', { count: stock })
                  : t('product.inStock')}
            </p>

            <div className={styles.buyRow}>
              <Quantity
                value={qty}
                max={Math.max(1, stock)}
                onChange={setQty}
                disabled={stock === 0}
                labels={{
                  decrease: tc('cart.decrease'),
                  increase: tc('cart.increase'),
                  quantity: tc('cart.quantity'),
                }}
              />
              <div className={styles.buyMain}>{buy}</div>
              <WishlistButton slug={product.slug} name={product.name} />
              <CompareButton slug={product.slug} name={product.name} />
              <Button
                variant="ghost"
                icon="share-2"
                aria-label={tc('actions.share')}
                onClick={() => void share()}
                className={styles.shareButton}
              />
            </div>

            <ul className={styles.perks}>
              <li>
                <Icon name="truck" size={18} /> {t('product.perkShipping')}
              </li>
              <li>
                <Icon name="refresh-cw" size={18} /> {t('product.perkReturns')}
              </li>
              <li>
                <Icon name="shield-check" size={18} /> {t('product.perkWarranty')}
              </li>
            </ul>

            <div className={styles.details}>
              <Accordion summary={t('product.description')} open>
                <p>{product.description}</p>
              </Accordion>
              <Accordion summary={t('product.specs')}>
                <dl className={styles.specs}>
                  {product.specs.map((s) => (
                    <div key={s.key}>
                      <dt>{t(`specs.${s.key}`)}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
              {product.faq.map((f) => (
                <Accordion key={f.q} summary={f.q}>
                  <p>{f.a}</p>
                </Accordion>
              ))}
            </div>
          </div>
        </div>

        <Reviews slug={product.slug} />

        <div className={styles.rails}>
          {product.boughtTogether.length > 0 && (
            <ProductRail title={t('product.together')} products={product.boughtTogether} />
          )}
          {product.related.length > 0 && (
            <ProductRail title={t('product.related')} products={product.related} />
          )}
        </div>
      </div>

      {/* Sticky buy bar on phones */}
      <div className={styles.stickyBar}>
        <div>
          <strong>{product.name}</strong>
          <Price value={price * qty} size="sm" />
        </div>
        {buy}
      </div>
    </div>
  );
};
