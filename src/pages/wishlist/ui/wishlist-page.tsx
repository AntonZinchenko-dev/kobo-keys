import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { ProductGrid } from '@/widgets/product-list';
import { useWishlistStore } from '@/features/toggle-wishlist';
import { productsQuery } from '@/entities/product';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Button, ButtonLink, EmptyState } from '@/shared/ui';

import styles from './wishlist-page.module.css';

export const WishlistPage = () => {
  const { t } = useTranslation('shop');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const slugs = useWishlistStore((s) => s.slugs);
  const remove = useWishlistStore((s) => s.remove);
  const { data, isPending } = useQuery({
    ...productsQuery(lang, { slugs, limit: 50 }),
    enabled: slugs.length > 0,
  });
  // Keep the order in which items were added (newest first)
  const items = slugs.map((s) => data?.items.find((p) => p.slug === s)).filter((p) => p !== undefined);

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${t('wishlist.title')} — KŌBŌ Keys`}</title>
      <header className={styles.head}>
        <h1>
          {t('wishlist.title')} <span>{slugs.length}</span>
        </h1>
        {slugs.length > 0 && (
          <Button variant="ghost" size="sm" icon="trash-2" onClick={() => slugs.forEach(remove)}>
            {t('wishlist.clear')}
          </Button>
        )}
      </header>
      {slugs.length === 0 ? (
        <EmptyState
          mascot="empty-cart"
          title={t('wishlist.empty')}
          text={t('wishlist.emptyText')}
          action={<ButtonLink to={paths.catalog(lang)}>{tc('cart.toCatalog')}</ButtonLink>}
        />
      ) : (
        <ProductGrid products={items} loading={isPending} skeletons={slugs.length} />
      )}
    </div>
  );
};
