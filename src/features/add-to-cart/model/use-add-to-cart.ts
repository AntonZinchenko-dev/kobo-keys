import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';

import { type CartLineSnapshot, checkStock, lineKey, useCartStore } from '@/entities/cart';
import { type CartLineInput, isApiError } from '@/shared/api';
import { toast } from '@/shared/ui';

import { flyToCart } from '../lib/fly-to-cart';

interface AddToCartInput extends CartLineInput {
  snapshot: CartLineSnapshot;
  /** Element whose image flies into the cart icon */
  source?: HTMLElement | null;
}

/**
 * Optimistic add: the line appears in the cart immediately, the server confirms stock.
 * If the server says "out of stock", the cart rolls back and the user sees why.
 */
export const useAddToCart = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async ({ productId, variantKey }: AddToCartInput) => {
      const current =
        useCartStore.getState().lines.find((l) => l.key === lineKey(productId, variantKey))?.qty ?? 0;
      return checkStock({ productId, variantKey, qty: current });
    },
    onMutate: (input) => {
      const previous = useCartStore.getState().lines;
      const { productId, variantKey, qty, snapshot } = input;
      useCartStore.getState().add({ productId, variantKey, qty }, snapshot);
      flyToCart(input.source);
      return { previous };
    },
    onSuccess: (_data, input) => {
      toast.success(t('cart.added'), { description: input.snapshot.name });
    },
    onError: (error, input, context) => {
      if (context) useCartStore.getState().restore(context.previous);
      if (isApiError(error) && error.code === 'OUT_OF_STOCK') {
        const available = (error.details as { available?: number } | undefined)?.available ?? 0;
        toast.error(t('cart.notEnough', { name: input.snapshot.name }), {
          description: t('cart.onlyLeft', { count: available }),
        });
      } else {
        toast.error(t('errors.generic'), { description: t('errors.tryAgain') });
      }
    },
  });
};
