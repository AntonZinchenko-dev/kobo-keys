import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { AddToCartButton } from '@/features/add-to-cart';
import { productQuery } from '@/entities/product';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { ButtonLink, Dialog, Picture, Price, Rating, Skeleton } from '@/shared/ui';

import styles from './product-list.module.css';

/** Product preview without leaving the catalog. */
export const QuickView = ({ slug, onClose }: { slug: string | null; onClose: () => void }) => {
  const { t } = useTranslation();
  const lang = useLang();
  const { data: product } = useQuery({ ...productQuery(lang, slug ?? ''), enabled: slug !== null });

  return (
    <Dialog
      open={slug !== null}
      onClose={onClose}
      title={product?.name ?? '…'}
      size="lg"
      closeLabel={t('actions.close')}
    >
      {product ? (
        <div className={styles.quick}>
          <Picture
            slot={product.images[0] ?? ''}
            alt={product.name}
            ratio={4 / 5}
            sizes="(min-width: 768px) 400px, 100vw"
          />
          <div className={styles.quickInfo}>
            <Rating
              value={product.rating}
              count={product.reviewCount}
              label={t('product.ratingLabel', { rating: product.rating, count: product.reviewCount })}
            />
            <p className={styles.quickTagline}>{product.tagline}</p>
            <Price value={product.price} compareAt={product.compareAt} size="lg" />
            <p>{product.description}</p>
            <div className={styles.quickActions}>
              <AddToCartButton
                product={product}
                variantKey={product.defaultVariant}
                unitPrice={product.price}
                onAdded={onClose}
                size="lg"
              />
              <ButtonLink to={paths.product(lang, product.slug)} variant="ghost" size="lg" onClick={onClose}>
                {t('product.details')}
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.quick}>
          <Skeleton style={{ aspectRatio: '4 / 5' }} />
          <div className={styles.quickInfo}>
            <Skeleton style={{ height: 24, width: '60%' }} />
            <Skeleton style={{ height: 80 }} />
          </div>
        </div>
      )}
    </Dialog>
  );
};
