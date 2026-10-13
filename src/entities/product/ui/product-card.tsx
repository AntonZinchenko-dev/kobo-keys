import type { PointerEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useViewTransitionState } from 'react-router';
import clsx from 'clsx';

import type { ProductSummary } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Badge, Picture, Price, Rating } from '@/shared/ui';

import styles from './product-card.module.css';

interface ProductCardProps {
  product: ProductSummary;
  /** Top-right overlay (wishlist / compare toggles) */
  actions?: ReactNode;
  /** Bottom action (add to cart, quick view) */
  footer?: ReactNode;
  priority?: boolean;
  sizes?: string;
}

const BADGE_TONE = {
  new: 'matcha',
  drop: 'sakura',
  bestseller: 'gold',
  sale: 'danger',
  limited: 'sakura',
} as const;

/** Card tilts towards the pointer with a moving glare; pure CSS transforms driven by two custom properties. */
const onPointerMove = (e: PointerEvent<HTMLElement>) => {
  if (e.pointerType !== 'mouse') return;
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', String((e.clientX - rect.left) / rect.width));
  e.currentTarget.style.setProperty('--my', String((e.clientY - rect.top) / rect.height));
};
const onPointerLeave = (e: PointerEvent<HTMLElement>) => {
  e.currentTarget.style.setProperty('--mx', '0.5');
  e.currentTarget.style.setProperty('--my', '0.5');
};

export const ProductCard = ({ product, actions, footer, priority, sizes }: ProductCardProps) => {
  const { t } = useTranslation();
  const lang = useLang();
  const href = paths.product(lang, product.slug);
  // While navigating to this product, give the image a shared name so it morphs into the gallery.
  const transitioning = useViewTransitionState(href);
  const [first, second] = product.images;

  return (
    <article
      className={clsx(styles.card, !product.inStock && styles.soldOut)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className={styles.media}>
        <Link to={href} viewTransition className={styles.mediaLink} tabIndex={-1} aria-hidden="true">
          {first && (
            <Picture
              slot={first}
              alt=""
              ratio={4 / 5}
              priority={priority ?? false}
              sizes={sizes ?? '(min-width: 1200px) 320px, (min-width: 768px) 33vw, 50vw'}
              style={transitioning ? { viewTransitionName: 'product-image' } : undefined}
            />
          )}
          {second && <Picture slot={second} alt="" ratio={4 / 5} sizes="320px" className={styles.alt} />}
        </Link>
        <div className={styles.badges}>
          {product.badges.slice(0, 2).map((b) => (
            <Badge key={b} tone={BADGE_TONE[b]}>
              {t(`badges.${b}`)}
            </Badge>
          ))}
          {!product.inStock && <Badge>{t('product.soldOut')}</Badge>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
        <span className={styles.glare} aria-hidden="true" />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link to={href} viewTransition className={styles.link}>
            {product.name}
          </Link>
        </h3>
        <p className={styles.tagline}>{product.tagline}</p>
        <div className={styles.meta}>
          <Price value={product.price} compareAt={product.compareAt} />
          <Rating
            value={product.rating}
            count={product.reviewCount}
            label={t('product.ratingLabel', { rating: product.rating, count: product.reviewCount })}
          />
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </article>
  );
};
