import type { ReactNode } from 'react';

import { ProductCardSkeleton } from '@/entities/product';
import type { ProductSummary } from '@/shared/api';

import { ProductTile } from './product-tile';

import styles from './product-list.module.css';

interface ProductRailProps {
  title: ReactNode;
  products: ProductSummary[] | undefined;
  action?: ReactNode;
}

/** Horizontal carousel on CSS scroll-snap; scroll markers/buttons appear where ::scroll-marker is supported. */
export const ProductRail = ({ title, products, action }: ProductRailProps) => (
  <section className={styles.rail}>
    <div className={styles.railHead}>
      <h2 className={styles.railTitle}>{title}</h2>
      {action}
    </div>
    {/* Focusable region so keyboard users can scroll the carousel with arrow keys */}
    <div
      className={styles.scroller}
      tabIndex={0}
      role="region"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <ul className={styles.track}>
        {products
          ? products.map((p) => (
              <li key={p.id} className={styles.slide}>
                <ProductTile product={p} />
              </li>
            ))
          : Array.from({ length: 4 }, (_, i) => (
              <li key={i} className={styles.slide}>
                <ProductCardSkeleton />
              </li>
            ))}
      </ul>
    </div>
  </section>
);
