import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProductSummary } from '@/shared/api';
import { Button } from '@/shared/ui';

import { useAddToCart } from '../model/use-add-to-cart';

interface AddToCartButtonProps {
  product: Pick<ProductSummary, 'id' | 'slug' | 'name' | 'images' | 'inStock'>;
  variantKey: string;
  unitPrice: number;
  variantLabel?: string;
  image?: string | undefined;
  qty?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  onAdded?: () => void;
}

export const AddToCartButton = ({
  product,
  variantKey,
  unitPrice,
  variantLabel = '',
  image,
  qty = 1,
  disabled,
  size = 'md',
  block,
  onAdded,
}: AddToCartButtonProps) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const { mutate, isPending } = useAddToCart();
  const soldOut = !product.inStock || disabled;

  return (
    <Button
      ref={ref}
      size={size}
      block={block}
      icon={soldOut ? undefined : 'shopping-bag'}
      disabled={soldOut}
      loading={isPending}
      onClick={() => {
        mutate(
          {
            productId: product.id,
            variantKey,
            qty,
            snapshot: {
              name: product.name,
              slug: product.slug,
              image: image ?? product.images[0],
              unitPrice,
              variantLabel,
            },
            source: ref.current?.closest<HTMLElement>('[data-product-media], article') ?? null,
          },
          { onSuccess: onAdded },
        );
      }}
    >
      {soldOut ? t('product.soldOut') : t('product.addToCart')}
    </Button>
  );
};
