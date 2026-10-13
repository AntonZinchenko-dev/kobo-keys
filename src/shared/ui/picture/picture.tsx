import { type CSSProperties, useState } from 'react';
import clsx from 'clsx';

import { manifest, STOCK, stockUrl } from '@/shared/images';

import { Icon } from '../icon/icon';

import styles from './picture.module.css';

interface ManifestEntry {
  width: number;
  height: number;
  widths: number[];
  jpg: number;
  blur: string;
  color: string;
}

const MANIFEST = manifest as Record<string, ManifestEntry>;
const STOCK_WIDTHS = [320, 480, 640, 960, 1280, 1600];
const BASE = import.meta.env.BASE_URL;

interface Source {
  avif: string;
  webp: string;
  fallback: string;
  placeholder?: string;
  color?: string;
}

/** Local optimised files win; otherwise the stock CDN crops to the requested ratio. */
const resolve = (slot: string, ratio: number): Source | null => {
  const local = MANIFEST[slot];
  if (local) {
    const set = (ext: string) => local.widths.map((w) => `${BASE}img/${slot}-${w}.${ext} ${w}w`).join(', ');
    return {
      avif: set('avif'),
      webp: set('webp'),
      fallback: `${BASE}img/${slot}-${local.jpg}.jpg`,
      placeholder: local.blur,
      color: local.color,
    };
  }
  const stock = STOCK[slot];
  if (!stock) return null;
  const set = (fm: 'avif' | 'webp') =>
    STOCK_WIDTHS.map((w) => `${stockUrl(stock, w, Math.round(w / ratio), fm)} ${w}w`).join(', ');
  return {
    avif: set('avif'),
    webp: set('webp'),
    fallback: stockUrl(stock, 960, Math.round(960 / ratio), 'jpg'),
  };
};

export interface PictureProps {
  slot: string;
  alt: string;
  /** width / height, e.g. 4 / 5 for product photos */
  ratio?: number;
  sizes?: string;
  /** Above-the-fold image: eager loading + high fetch priority (LCP) */
  priority?: boolean;
  className?: string;
  fit?: 'cover' | 'contain';
  /** Different crop for narrow screens (art direction) */
  mobileSlot?: string;
  mobileRatio?: number;
  /** Shared-element name for the View Transitions API */
  transitionName?: string;
  style?: CSSProperties;
}

export const Picture = ({
  slot,
  alt,
  ratio = 4 / 5,
  sizes = '100vw',
  priority = false,
  className,
  fit = 'cover',
  mobileSlot,
  mobileRatio = 9 / 16,
  transitionName,
  style,
}: PictureProps) => {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const source = resolve(slot, ratio);
  const mobile = mobileSlot ? resolve(mobileSlot, mobileRatio) : null;

  const frameStyle: CSSProperties = {
    aspectRatio: String(ratio),
    backgroundColor: source?.color,
    backgroundImage: source?.placeholder && state !== 'loaded' ? `url("${source.placeholder}")` : undefined,
    viewTransitionName: transitionName,
    ...style,
  };

  if (!source || state === 'error') {
    return (
      <div
        className={clsx(styles.frame, styles.missing, className)}
        style={frameStyle}
        {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      >
        <Icon name="image-off" size={28} />
        <code>{slot}</code>
      </div>
    );
  }

  return (
    <div className={clsx(styles.frame, state === 'loading' && styles.shimmer, className)} style={frameStyle}>
      <picture>
        {mobile && (
          <>
            <source media="(max-width: 640px)" type="image/avif" srcSet={mobile.avif} sizes="100vw" />
            <source media="(max-width: 640px)" type="image/webp" srcSet={mobile.webp} sizes="100vw" />
          </>
        )}
        <source type="image/avif" srcSet={source.avif} sizes={sizes} />
        <source type="image/webp" srcSet={source.webp} sizes={sizes} />
        <img
          src={source.fallback}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={clsx(
            styles.img,
            fit === 'contain' && styles.contain,
            state === 'loaded' && styles.loaded,
          )}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      </picture>
    </div>
  );
};
