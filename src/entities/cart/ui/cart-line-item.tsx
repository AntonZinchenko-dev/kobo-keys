import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { IconButton, Picture, Price, Quantity } from '@/shared/ui';

import type { CartLine } from '../model/cart-store';

import styles from './cart-line-item.module.css';

interface CartLineItemProps {
  line: CartLine;
  /** Live price/availability from the server quote (falls back to the snapshot) */
  unitPrice?: number | undefined;
  available?: number | undefined;
  onQty: (qty: number) => void;
  onRemove: () => void;
  /** Custom builds render an SVG preview instead of a photo */
  thumbnail?: ReactNode;
  compact?: boolean;
}

export const CartLineItem = ({
  line,
  unitPrice,
  available,
  onQty,
  onRemove,
  thumbnail,
  compact,
}: CartLineItemProps) => {
  const { t } = useTranslation();
  const lang = useLang();
  const price = unitPrice ?? line.snapshot.unitPrice;
  const limited = available !== undefined && available < line.qty;

  const title = line.snapshot.slug ? (
    <Link to={paths.product(lang, line.snapshot.slug)} className={styles.name}>
      {line.snapshot.name}
    </Link>
  ) : (
    <span className={styles.name}>{line.snapshot.name}</span>
  );

  return (
    <li className={styles.line} data-compact={compact || undefined}>
      <div className={styles.thumb}>
        {thumbnail ??
          (line.snapshot.image ? <Picture slot={line.snapshot.image} alt="" ratio={1} sizes="96px" /> : null)}
      </div>
      <div className={styles.info}>
        {title}
        {line.snapshot.variantLabel && <span className={styles.variant}>{line.snapshot.variantLabel}</span>}
        {limited && (
          <span className={styles.warning} role="alert">
            {available === 0 ? t('cart.outOfStock') : t('cart.onlyLeft', { count: available })}
          </span>
        )}
        <div className={styles.controls}>
          <Quantity
            value={line.qty}
            max={available ? Math.max(available, 1) : 20}
            onChange={onQty}
            labels={{
              decrease: t('cart.decrease'),
              increase: t('cart.increase'),
              quantity: t('cart.quantity'),
            }}
          />
          <IconButton
            icon="trash-2"
            label={t('cart.remove', { name: line.snapshot.name })}
            onClick={onRemove}
          />
        </div>
      </div>
      <Price value={price * line.qty} className={styles.price} />
    </li>
  );
};
