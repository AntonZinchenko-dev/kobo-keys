import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { FreeShippingProgress } from '@/widgets/mini-cart';
import { ProductRail } from '@/widgets/product-list';
import { PromoForm } from '@/features/apply-promo';
import { EditableCartLines } from '@/features/edit-cart';
import { QuoteTotals, selectCount, useCartQuote, useCartStore } from '@/entities/cart';
import { productsQuery } from '@/entities/product';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { ButtonLink, EmptyState, Skeleton } from '@/shared/ui';

import styles from './cart-page.module.css';

export const CartPage = () => {
  const { t } = useTranslation('checkout');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const count = useCartStore(selectCount);
  const { lines, quote } = useCartQuote();
  const { data: upsell } = useQuery(productsQuery(lang, { category: 'accessories', limit: 6 }));
  const q = quote.data;

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${t('cart.title')} — KŌBŌ Keys`}</title>
      <h1 className={styles.title}>
        {t('cart.title')} <span>{tc('cart.items', { count })}</span>
      </h1>

      {lines.length === 0 ? (
        <EmptyState
          mascot="empty-cart"
          title={tc('cart.empty')}
          text={tc('cart.emptyText')}
          action={<ButtonLink to={paths.catalog(lang)}>{tc('cart.toCatalog')}</ButtonLink>}
        />
      ) : (
        <div className={styles.layout}>
          <section aria-label={t('cart.items')}>
            <EditableCartLines />
          </section>
          <aside className={styles.summary} aria-label={t('summary.title')}>
            <h2>{t('summary.title')}</h2>
            {q ? (
              <>
                <FreeShippingProgress
                  subtotal={q.subtotal - q.discount}
                  threshold={q.freeShippingThreshold}
                />
                <QuoteTotals quote={q} />
              </>
            ) : (
              <Skeleton style={{ height: 160 }} />
            )}
            <PromoForm />
            <ButtonLink to={paths.checkout(lang)} size="lg" block iconEnd="arrow-right">
              {tc('cart.checkout')}
            </ButtonLink>
            <p className={styles.secure}>{t('summary.secure')}</p>
          </aside>
        </div>
      )}

      <div className={styles.upsell}>
        <ProductRail title={t('cart.upsell')} products={upsell?.items} />
      </div>
    </div>
  );
};
