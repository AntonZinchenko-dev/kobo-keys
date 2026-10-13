import { useTranslation } from 'react-i18next';

import { AddToCartButton } from '@/features/add-to-cart';
import { CompareButton } from '@/features/toggle-compare';
import { WishlistButton } from '@/features/toggle-wishlist';
import { ProductCard } from '@/entities/product';
import type { ProductSummary } from '@/shared/api';
import { Button } from '@/shared/ui';

import styles from './product-list.module.css';

interface ProductTileProps {
  product: ProductSummary;
  priority?: boolean;
  onQuickView?: (slug: string) => void;
}

/** A product card composed with its actions: wishlist, compare, add to cart, quick view. */
export const ProductTile = ({ product, priority, onQuickView }: ProductTileProps) => {
  const { t } = useTranslation();
  return (
    <ProductCard
      product={product}
      priority={priority ?? false}
      actions={
        <>
          <WishlistButton slug={product.slug} name={product.name} />
          <CompareButton slug={product.slug} name={product.name} />
        </>
      }
      footer={
        <div className={styles.tileFooter}>
          <AddToCartButton
            product={product}
            variantKey={product.defaultVariant}
            unitPrice={product.price}
            size="sm"
            block
          />
          {onQuickView && (
            <Button
              variant="ghost"
              size="sm"
              icon="eye"
              onClick={() => onQuickView(product.slug)}
              aria-label={t('product.quickView', { name: product.name })}
            >
              <span className={styles.quickLabel}>{t('product.quickViewShort')}</span>
            </Button>
          )}
        </div>
      }
    />
  );
};
