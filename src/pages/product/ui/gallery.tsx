import { type CSSProperties, type PointerEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { Dialog, Icon, Picture } from '@/shared/ui';

import styles from './gallery.module.css';

interface GalleryProps {
  images: string[];
  alt: string;
}

/**
 * Desktop: thumbnails + zoom under the cursor. Phone: swipeable scroll-snap strip.
 * The first image carries the shared view-transition name, so it morphs from the catalog card.
 */
export const Gallery = ({ images, alt }: GalleryProps) => {
  const { t } = useTranslation('shop');
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const goTo = (i: number) => {
    setActive(i);
    const el = track.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  return (
    <div className={styles.gallery} data-product-media="">
      <div
        ref={track}
        className={styles.track}
        tabIndex={0}
        role="region"
        aria-label={t('product.photos')}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {images.map((slot, i) => (
          <div
            key={slot}
            className={clsx(styles.slide, zoom && i === active && styles.zooming)}
            onPointerMove={onMove}
            onPointerLeave={() => setZoom(null)}
            style={zoom ? ({ '--zx': `${zoom.x}%`, '--zy': `${zoom.y}%` } as CSSProperties) : undefined}
          >
            <Picture
              slot={slot}
              alt={`${alt} — ${t('product.photo', { n: i + 1 })}`}
              ratio={4 / 5}
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              transitionName={i === 0 ? 'product-image' : undefined}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className={styles.expand}
        onClick={() => setFullscreen(true)}
        aria-label={t('product.fullscreen')}
      >
        <Icon name="maximize-2" size={18} />
      </button>
      <div className={styles.dots} aria-hidden="true">
        {images.map((slot, i) => (
          <span key={slot} className={clsx(styles.dot, i === active && styles.dotActive)} />
        ))}
      </div>
      <div className={styles.thumbs} role="tablist" aria-label={t('product.photos')}>
        {images.map((slot, i) => (
          <button
            key={slot}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={t('product.photo', { n: i + 1 })}
            className={clsx(styles.thumb, i === active && styles.thumbActive)}
            onClick={() => goTo(i)}
          >
            <Picture slot={slot} alt="" ratio={1} sizes="80px" />
          </button>
        ))}
      </div>

      <Dialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={alt}
        size="lg"
        closeLabel={t('product.closeFullscreen')}
      >
        <div className={styles.full}>
          {images.map((slot, i) => (
            <Picture
              key={slot}
              slot={slot}
              alt={`${alt} — ${t('product.photo', { n: i + 1 })}`}
              ratio={4 / 5}
              sizes="90vw"
              fit="contain"
            />
          ))}
        </div>
      </Dialog>
    </div>
  );
};
