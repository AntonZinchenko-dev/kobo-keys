import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import clsx from 'clsx';

import { AddToCartButton } from '@/features/add-to-cart';
import { useCompareStore } from '@/features/toggle-compare';
import { productQuery } from '@/entities/product';
import type { ProductDetail, SpecKey } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { ButtonLink, Check, EmptyState, IconButton, Picture, Price, Rating, Skeleton } from '@/shared/ui';

import styles from './compare-page.module.css';

export const ComparePage = () => {
  const { t } = useTranslation('shop');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const slugs = useCompareStore((s) => s.slugs);
  const remove = useCompareStore((s) => s.remove);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const results = useQueries({ queries: slugs.map((slug) => productQuery(lang, slug)) });
  const products = results.map((r) => r.data).filter((p): p is ProductDetail => p !== undefined);
  const loading = results.some((r) => r.isPending);

  if (slugs.length < 2) {
    return (
      <div className="container">
        <title>{`${t('compare.title')} — KŌBŌ Keys`}</title>
        <EmptyState
          mascot="not-found"
          title={t('compare.empty')}
          text={t('compare.emptyText')}
          action={<ButtonLink to={paths.catalog(lang)}>{tc('cart.toCatalog')}</ButtonLink>}
        />
      </div>
    );
  }

  const specKeys = [...new Set(products.flatMap((p) => p.specs.map((s) => s.key)))];
  const rows: { label: string; values: string[] }[] = [
    { label: t('compare.category'), values: products.map((p) => tc(`categories.${p.category}`)) },
    {
      label: t('compare.availability'),
      values: products.map((p) => (p.inStock ? t('product.inStock') : tc('product.soldOut'))),
    },
    ...specKeys.map((key: SpecKey) => ({
      label: t(`specs.${key}`),
      values: products.map((p) => p.specs.find((s) => s.key === key)?.value ?? '—'),
    })),
  ];
  const visible = onlyDiff ? rows.filter((r) => new Set(r.values).size > 1) : rows;
  const best = Math.min(...products.map((p) => p.price));

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${t('compare.title')} — KŌBŌ Keys`}</title>
      <header className={styles.head}>
        <h1>{t('compare.title')}</h1>
        <Check
          label={t('compare.onlyDiff')}
          checked={onlyDiff}
          onChange={(e) => setOnlyDiff(e.target.checked)}
        />
      </header>
      {loading ? (
        <Skeleton style={{ height: 400 }} />
      ) : (
        <div className={styles.wrap}>
          <table className={styles.table} style={{ '--cols': products.length } as React.CSSProperties}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">{t('compare.feature')}</span>
                </th>
                {products.map((p) => (
                  <th key={p.id} scope="col" className={styles.productCell}>
                    <IconButton
                      icon="x"
                      label={`${t('compare.remove')}: ${p.name}`}
                      onClick={() => remove(p.slug)}
                      className={styles.remove}
                    />
                    <Link to={paths.product(lang, p.slug)} className={styles.productLink}>
                      <Picture slot={p.images[0] ?? ''} alt="" ratio={1} sizes="200px" />
                      <span>{p.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{t('compare.price')}</th>
                {products.map((p) => (
                  <td key={p.id} className={clsx(p.price === best && styles.best)}>
                    <Price value={p.price} compareAt={p.compareAt} />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">{t('compare.rating')}</th>
                {products.map((p) => (
                  <td key={p.id}>
                    <Rating
                      value={p.rating}
                      count={p.reviewCount}
                      label={tc('product.ratingLabel', { rating: p.rating, count: p.reviewCount })}
                    />
                  </td>
                ))}
              </tr>
              {visible.map((row) => {
                const differs = new Set(row.values).size > 1;
                return (
                  <tr key={row.label} className={clsx(differs && styles.differs)}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <th scope="row">
                  <span className="visually-hidden">{tc('product.addToCart')}</span>
                </th>
                {products.map((p) => (
                  <td key={p.id}>
                    <AddToCartButton
                      product={p}
                      variantKey={p.defaultVariant}
                      unitPrice={p.price}
                      size="sm"
                      block
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
