import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

import { Icon } from '../icon/icon';

import styles from './misc.module.css';

export const Skeleton = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <span className={clsx(styles.skeleton, className)} style={style} aria-hidden="true" />
);

export const Spinner = ({ label }: { label: string }) => (
  <span className={styles.spinner} role="status" aria-label={label} />
);

interface RatingProps {
  value: number;
  count?: number;
  label: string;
  size?: number;
}

/** Stars are filled by a CSS mask with a percentage width — one element, any fraction. */
export const Rating = ({ value, count, label, size = 14 }: RatingProps) => (
  <span className={styles.rating} role="img" aria-label={label}>
    <span
      className={styles.stars}
      style={{ '--value': `${(value / 5) * 100}%`, '--size': `${size}px` } as CSSProperties}
    />
    <span className={styles.ratingValue}>{value.toFixed(1)}</span>
    {count !== undefined && <span className={styles.ratingCount}>({count})</span>}
  </span>
);

export const Badge = ({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'sakura' | 'matcha' | 'gold' | 'danger';
  children: ReactNode;
}) => <span className={clsx(styles.badge, styles[tone])}>{children}</span>;

export const Kbd = ({ children }: { children: ReactNode }) => <kbd className={styles.kbd}>{children}</kbd>;

interface QuantityProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  labels: { decrease: string; increase: string; quantity: string };
  disabled?: boolean;
}

export const Quantity = ({ value, min = 1, max = 99, onChange, labels, disabled }: QuantityProps) => (
  <div className={styles.quantity} role="group" aria-label={labels.quantity}>
    <button
      type="button"
      aria-label={labels.decrease}
      disabled={disabled || value <= min}
      onClick={() => onChange(value - 1)}
    >
      <Icon name="minus" size={16} />
    </button>
    <output aria-live="polite">{value}</output>
    <button
      type="button"
      aria-label={labels.increase}
      disabled={disabled || value >= max}
      onClick={() => onChange(value + 1)}
    >
      <Icon name="plus" size={16} />
    </button>
  </div>
);

/** <details> with a smooth height animation (interpolate-size: allow-keywords + ::details-content). */
export const Accordion = ({
  summary,
  children,
  open,
}: {
  summary: ReactNode;
  children: ReactNode;
  open?: boolean;
}) => (
  <details className={styles.accordion} open={open}>
    <summary>
      <span>{summary}</span>
      <Icon name="chevron-down" size={18} className={styles.chevron} />
    </summary>
    <div className={styles.accordionBody}>{children}</div>
  </details>
);

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

export const Segmented = <T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: SegmentedProps<T>) => (
  <div className={clsx(styles.segmented, className)} role="radiogroup" aria-label={label}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        role="radio"
        aria-checked={o.value === value}
        className={clsx(styles.segment, o.value === value && styles.segmentActive)}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const Marquee = ({ items, label }: { items: ReactNode[]; label: string }) => (
  <div className={styles.marquee} aria-label={label} role="marquee">
    {[0, 1].map((copy) => (
      <ul key={copy} className={styles.marqueeTrack} aria-hidden={copy === 1 || undefined}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    ))}
  </div>
);
