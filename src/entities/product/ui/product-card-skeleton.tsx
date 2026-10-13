import { Skeleton } from '@/shared/ui';

export const ProductCardSkeleton = () => (
  <div style={{ display: 'grid', gap: 'var(--space-2)' }} aria-hidden="true">
    <Skeleton style={{ aspectRatio: '4 / 5', borderRadius: 'var(--radius-lg)' }} />
    <Skeleton style={{ height: 18, width: '70%' }} />
    <Skeleton style={{ height: 14, width: '50%' }} />
    <Skeleton style={{ height: 18, width: '35%' }} />
  </div>
);
