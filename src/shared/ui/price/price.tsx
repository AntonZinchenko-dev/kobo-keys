import clsx from 'clsx';

import { useMoney } from '@/shared/lib';

import styles from './price.module.css';

interface PriceProps {
  value: number;
  compareAt?: number | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Converts from EUR cents to the visitor's currency and formats per the current locale. */
export const Price = ({ value, compareAt, size = 'md', className }: PriceProps) => {
  const money = useMoney();
  return (
    <span className={clsx(styles.price, styles[size], className)}>
      <span className={clsx(compareAt && styles.sale)}>{money(value)}</span>
      {compareAt ? <s className={styles.old}>{money(compareAt)}</s> : null}
    </span>
  );
};
