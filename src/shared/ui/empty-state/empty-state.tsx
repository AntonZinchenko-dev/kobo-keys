import type { ReactNode } from 'react';
import clsx from 'clsx';

import { Picture } from '../picture/picture';

import styles from './empty-state.module.css';

export type MascotPose = 'hello' | 'empty-cart' | 'not-found' | 'error' | 'offline' | 'success' | 'typing';

interface EmptyStateProps {
  mascot: MascotPose;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

/** Empty / error states with the shop mascot "Kobo" instead of a dry message. */
export const EmptyState = ({ mascot, title, text, action, compact }: EmptyStateProps) => (
  <div className={clsx(styles.root, compact && styles.compact)}>
    <div className={styles.mascot}>
      <Picture slot={`mascot/${mascot}`} alt="" ratio={1} sizes="160px" />
    </div>
    <h2 className={styles.title}>{title}</h2>
    {text && <p className={styles.text}>{text}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);
