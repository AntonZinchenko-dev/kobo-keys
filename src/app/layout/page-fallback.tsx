import { Skeleton } from '@/shared/ui';

import styles from './layout.module.css';

export const PageFallback = () => (
  <div className={`container ${styles.fallback}`} aria-busy="true">
    <Skeleton style={{ height: 40, width: '40%' }} />
    <Skeleton style={{ height: 18, width: '60%' }} />
    <div className={styles.fallbackGrid}>
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} style={{ aspectRatio: '4 / 5', borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  </div>
);
