import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { ProductGrid, QuickView } from '@/widgets/product-list';
import { useCompareStore } from '@/features/toggle-compare';
import { productsQuery } from '@/entities/product';
import { CATEGORIES, type SortId, SORTS } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { useMediaQuery } from '@/shared/lib';
import { Button, ButtonLink, Dialog, EmptyState, Select } from '@/shared/ui';

import {
  activeCount,
  type Filters,
  isCategory,
  PAGE_SIZE,
  toQuery,
  useCatalogFilters,
} from '../model/filters';
import { ActiveFilters } from './active-filters';
import { FiltersPanel } from './filters-panel';

import styles from './catalog-page.module.css';

export const CatalogPage = () => {
  const { t } = useTranslation('shop');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const { category: rawCategory } = useParams();
  const category = isCategory(rawCategory) ? rawCategory : undefined;
  const { filters, pages, setFilters, showMore } = useCatalogFilters();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const [quickView, setQuickView] = useState<string | null>(null);
  const compareCount = useCompareStore((s) => s.slugs.length);

  const { data, isPending, isFetching, isError, refetch, isPlaceholderData } = useQuery(
    productsQuery(lang, toQuery(filters, category, pages)),
  );
  // In the mobile sheet filters are a draft: we only ask "how many would match?"
  const { data: draftData } = useQuery({
    ...productsQuery(lang, { ...toQuery(draft, category, 1), limit: 1 }),
    enabled: sheetOpen,
  });

  const title = category ? tc(`categories.${category}`) : t('catalog.title');
  const count = activeCount(filters);
  const items = data?.items ?? [];
  const hasMore = data ? items.length < data.total : false;

  const openSheet = () => {
    setDraft(filters);
    setSheetOpen(true);
  };

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${title} — KŌBŌ Keys`}</title>
      <meta name="description" content={t('catalog.description')} />

      <nav aria-label={t('catalog.breadcrumbs')} className={styles.breadcrumbs}>
        <ol>
          <li>
            <Link to={paths.home(lang)}>{tc('nav.home')}</Link>
          </li>
          <li aria-current={category ? undefined : 'page'}>
            {category ? <Link to={paths.catalog(lang)}>{t('catalog.title')}</Link> : t('catalog.title')}
          </li>
          {category && <li aria-current="page">{title}</li>}
        </ol>
      </nav>

      <header className={styles.head}>
        <h1 className={styles.title}>
          {title}
          {data && <span className={styles.total}>{data.total}</span>}
        </h1>
        {filters.q && (
          <p className={styles.searchNote}>
            {t('catalog.searchFor', { q: filters.q })}{' '}
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setFilters({ ...filters, q: '' })}
            >
              {t('catalog.clearSearch')}
            </button>
          </p>
        )}
      </header>

      <nav className={styles.categories} aria-label={t('catalog.categories')}>
        <NavLink to={paths.catalog(lang)} end className={styles.chip}>
          {t('catalog.all')}
        </NavLink>
        {CATEGORIES.map((c) => (
          <NavLink key={c} to={paths.catalog(lang, c)} className={styles.chip}>
            {tc(`categories.${c}`)}
            {data?.facets.category[c] !== undefined && (
              <span className={styles.chipCount}>{data.facets.category[c]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.toolbar}>
        {!desktop && (
          <Button variant="secondary" icon="sliders-horizontal" onClick={openSheet}>
            {t('filters.title')}
            {count > 0 && <span className={styles.filterBadge}>{count}</span>}
          </Button>
        )}
        <div className={styles.sort}>
          <span className={styles.sortLabel} aria-hidden="true">
            {t('sort.label')}
          </span>
          <Select<SortId>
            label={t('sort.label')}
            value={filters.sort}
            options={SORTS.map((s) => ({ value: s, label: t(`sort.${s}`) }))}
            onChange={(sort) => setFilters({ ...filters, sort })}
            align="end"
            className={styles.select}
          />
        </div>
      </div>

      <ActiveFilters filters={filters} onChange={setFilters} />

      <div className={styles.layout}>
        {desktop && (
          <aside className={styles.sidebar} aria-label={t('filters.title')}>
            <FiltersPanel value={filters} facets={data?.facets} onChange={setFilters} />
          </aside>
        )}

        <section
          aria-live="polite"
          aria-busy={isFetching}
          className={isPlaceholderData ? styles.stale : undefined}
        >
          {isError ? (
            <EmptyState
              mascot="error"
              title={tc('errors.loadFailed')}
              text={tc('errors.tryAgain')}
              action={
                <Button icon="refresh-cw" onClick={() => void refetch()}>
                  {tc('errors.retry')}
                </Button>
              }
            />
          ) : !isPending && items.length === 0 ? (
            <EmptyState
              mascot="not-found"
              title={t('catalog.empty')}
              text={t('catalog.emptyText')}
              action={
                <ButtonLink to={paths.catalog(lang)} variant="secondary">
                  {t('filters.reset')}
                </ButtonLink>
              }
            />
          ) : (
            <>
              <ProductGrid
                products={items}
                loading={isPending}
                skeletons={PAGE_SIZE}
                onQuickView={setQuickView}
              />
              {hasMore && (
                <div className={styles.more}>
                  <p>{t('catalog.shown', { shown: items.length, total: data?.total ?? 0 })}</p>
                  <progress max={data?.total ?? 1} value={items.length} className={styles.progress} />
                  <Button variant="secondary" loading={isFetching} onClick={showMore}>
                    {tc('actions.showMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {compareCount >= 2 && (
        <ButtonLink to={paths.compare(lang)} className={styles.compareBar} icon="git-compare-arrows">
          {t('catalog.compareNow', { count: compareCount })}
        </ButtonLink>
      )}

      <QuickView slug={quickView} onClose={() => setQuickView(null)} />

      {!desktop && (
        <Dialog
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          placement="bottom"
          title={t('filters.title')}
          closeLabel={tc('actions.close')}
          footer={
            <div className={styles.sheetFooter}>
              <Button
                variant="ghost"
                onClick={() =>
                  setDraft({
                    ...filters,
                    layout: [],
                    switchType: [],
                    color: [],
                    inStock: false,
                    priceMin: undefined,
                    priceMax: undefined,
                  })
                }
              >
                {t('filters.reset')}
              </Button>
              <Button
                block
                onClick={() => {
                  setFilters(draft);
                  setSheetOpen(false);
                }}
              >
                {t('filters.show', { count: draftData?.total ?? data?.total ?? 0 })}
              </Button>
            </div>
          }
        >
          <FiltersPanel value={draft} facets={draftData?.facets ?? data?.facets} onChange={setDraft} />
        </Dialog>
      )}
    </div>
  );
};
