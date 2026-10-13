import { ProductCardSkeleton } from '@/entities/product';
import type { ProductSummary } from '@/shared/api';

import { ProductTile } from './product-tile';

import styles from './product-list.module.css';

interface ProductGridProps {
  products: ProductSummary[];
  loading?: boolean;
  skeletons?: number;
  onQuickView?: (slug: string) => void;
}

export const ProductGrid = ({ products, loading, skeletons = 8, onQuickView }: ProductGridProps) => (
  <ul className={styles.grid} aria-busy={loading || undefined}>
    {products.map((p, i) => (
      <li key={p.id}>
        <ProductTile product={p} priority={i < 2} {...(onQuickView ? { onQuickView } : {})} />
      </li>
    ))}
    {loading &&
      Array.from({ length: skeletons }, (_, i) => (
        <li key={`s${i}`}>
          <ProductCardSkeleton />
        </li>
      ))}
  </ul>
);
