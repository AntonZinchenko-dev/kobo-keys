import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { useMoney } from '@/shared/lib';
import { Icon } from '@/shared/ui';

import styles from './mini-cart.module.css';

export const FreeShippingProgress = ({ subtotal, threshold }: { subtotal: number; threshold: number }) => {
  const { t } = useTranslation();
  const money = useMoney();
  const left = Math.max(0, threshold - subtotal);
  const progress = Math.min(1, subtotal / threshold);
  return (
    <div className={styles.progress} style={{ '--progress': progress } as CSSProperties}>
      <p>
        <Icon name="truck" size={18} />
        {left === 0 ? t('cart.freeShippingReached') : t('cart.freeShippingLeft', { amount: money(left) })}
      </p>
      <div
        className={styles.bar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label={t('cart.freeShipping')}
      />
    </div>
  );
};
