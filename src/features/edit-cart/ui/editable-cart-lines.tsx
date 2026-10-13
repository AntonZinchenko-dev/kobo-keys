import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';

import { CartLineItem, checkStock, useCartQuote, useCartStore } from '@/entities/cart';
import { builderOptionsQuery, KeyboardPreview } from '@/entities/keyboard-build';
import { CUSTOM_BUILD_ID, decodeBuild, isApiError } from '@/shared/api';
import { useLang } from '@/shared/i18n';
import { toast } from '@/shared/ui';

import styles from './editable-cart-lines.module.css';

/**
 * Quantity changes are optimistic: the number changes instantly, the server checks stock.
 * On "not enough stock" (or a network error) the line rolls back and the user is told why.
 */
const useChangeQty = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({
      productId,
      variantKey,
      qty,
    }: {
      key: string;
      productId: string;
      variantKey: string;
      qty: number;
    }) => checkStock({ productId, variantKey, qty }),
    onMutate: ({ key, qty }) => {
      const previous = useCartStore.getState().lines.find((l) => l.key === key)?.qty ?? 1;
      useCartStore.getState().setQty(key, qty);
      return { previous };
    },
    onError: (error, { key }, context) => {
      if (context) useCartStore.getState().setQty(key, context.previous);
      if (isApiError(error) && error.code === 'OUT_OF_STOCK') {
        const available = (error.details as { available?: number } | undefined)?.available ?? 0;
        toast.error(t('cart.onlyLeft', { count: available }));
      } else {
        toast.error(t('errors.generic'), { description: t('errors.rolledBack') });
      }
    },
  });
};

export const EditableCartLines = ({ compact }: { compact?: boolean }) => {
  const { t } = useTranslation();
  const lang = useLang();
  const { lines, byKey } = useCartQuote();
  const remove = useCartStore((s) => s.remove);
  const add = useCartStore((s) => s.add);
  const changeQty = useChangeQty();
  const hasBuilds = lines.some((l) => l.productId === CUSTOM_BUILD_ID);
  const { data: options } = useQuery({ ...builderOptionsQuery(lang), enabled: hasBuilds });

  return (
    <ul className={styles.list}>
      {lines.map((line) => {
        const server = byKey.get(line.key);
        const build = line.productId === CUSTOM_BUILD_ID ? decodeBuild(line.variantKey) : null;
        return (
          <CartLineItem
            key={line.key}
            line={line}
            compact={compact}
            unitPrice={server?.unitPrice}
            available={server?.available}
            thumbnail={
              build && options ? (
                <div className={styles.build}>
                  <KeyboardPreview build={build} options={options} title={line.snapshot.name} still />
                </div>
              ) : undefined
            }
            onQty={(qty) =>
              changeQty.mutate({ key: line.key, productId: line.productId, variantKey: line.variantKey, qty })
            }
            onRemove={() => {
              remove(line.key);
              toast.info(t('cart.removed', { name: line.snapshot.name }), {
                action: { label: t('cart.undo'), onClick: () => add(line, line.snapshot) },
              });
            }}
          />
        );
      })}
    </ul>
  );
};
