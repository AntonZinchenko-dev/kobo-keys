import { type CSSProperties, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { reviewsQuery, useMarkHelpful } from '@/entities/product';
import { INTL_LOCALE, useLang } from '@/shared/i18n';
import { Badge, Button, Icon, Picture, Rating, Skeleton } from '@/shared/ui';

import styles from './product-page.module.css';

export const Reviews = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('shop');
  const lang = useLang();
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | undefined>();
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [now] = useState(() => Date.now());
  const { data, isPending } = useQuery(reviewsQuery(lang, slug, page, rating));
  const helpful = useMarkHelpful(lang, slug);
  const date = new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: 'long' });
  const relative = new Intl.RelativeTimeFormat(INTL_LOCALE[lang], { numeric: 'auto' });
  const ago = (iso: string) => {
    const days = Math.round((Date.parse(iso) - now) / 86_400_000);
    return Math.abs(days) < 31
      ? relative.format(days, 'day')
      : relative.format(Math.round(days / 30), 'month');
  };

  return (
    <section id="reviews" className={styles.reviews} aria-labelledby="reviews-title">
      <h2 id="reviews-title" className={styles.sectionTitle}>
        {t('reviews.title')}
      </h2>
      {isPending || !data ? (
        <Skeleton style={{ height: 240 }} />
      ) : (
        <div className={styles.reviewsLayout}>
          <div className={styles.summary}>
            <p className={styles.average}>{data.average.toFixed(1)}</p>
            <Rating value={data.average} label={t('reviews.average', { rating: data.average })} size={18} />
            <p className={styles.reviewCount}>
              {t('reviews.count', { count: Object.values(data.distribution).reduce((a, b) => a + b, 0) })}
            </p>
            <ul className={styles.bars}>
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const total = Object.values(data.distribution).reduce((a, b) => a + b, 0);
                const share = total ? data.distribution[star] / total : 0;
                return (
                  <li key={star}>
                    <button
                      type="button"
                      className={clsx(styles.bar, rating === star && styles.barActive)}
                      aria-pressed={rating === star}
                      onClick={() => {
                        setRating(rating === star ? undefined : star);
                        setPage(1);
                      }}
                      style={{ '--share': share } as CSSProperties}
                    >
                      <span>{star} ★</span>
                      <span className={styles.barTrack} />
                      <span className={styles.barCount}>{data.distribution[star]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            {rating && (
              <p className={styles.filterNote}>
                {t('reviews.filtered', { rating })}{' '}
                <button type="button" className={styles.linkButton} onClick={() => setRating(undefined)}>
                  {t('reviews.showAll')}
                </button>
              </p>
            )}
            <ul className={styles.reviewList}>
              {data.items.map((r) => (
                <li key={r.id} className={styles.review}>
                  <header className={styles.reviewHead}>
                    <span className={styles.avatar} aria-hidden="true">
                      {r.author.slice(0, 1)}
                    </span>
                    <div>
                      <strong>{r.author}</strong>
                      <time dateTime={r.date} title={date.format(new Date(r.date))}>
                        {ago(r.date)}
                      </time>
                    </div>
                    {r.verified && <Badge tone="matcha">{t('reviews.verified')}</Badge>}
                  </header>
                  <Rating value={r.rating} label={t('reviews.stars', { rating: r.rating })} />
                  <h3 className={styles.reviewTitle}>{r.title}</h3>
                  <p>{r.body}</p>
                  {r.photos.length > 0 && (
                    <div className={styles.reviewPhotos}>
                      {r.photos.map((p) => (
                        <Picture key={p} slot={p} alt={t('reviews.photo')} ratio={1} sizes="96px" />
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.helpful}
                    disabled={voted.has(r.id)}
                    onClick={() => {
                      setVoted(new Set(voted).add(r.id));
                      helpful.mutate(r.id);
                    }}
                  >
                    <Icon name="thumbs-up" size={16} /> {t('reviews.helpful')} ·{' '}
                    {r.helpful + (voted.has(r.id) && !helpful.isSuccess ? 1 : 0)}
                  </button>
                </li>
              ))}
            </ul>
            {data.pageCount > 1 && (
              <nav className={styles.pager} aria-label={t('reviews.pages')}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="chevron-left"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {t('reviews.prev')}
                </Button>
                <span>
                  {page} / {data.pageCount}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  iconEnd="chevron-right"
                  disabled={page === data.pageCount}
                  onClick={() => setPage(page + 1)}
                >
                  {t('reviews.next')}
                </Button>
              </nav>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
