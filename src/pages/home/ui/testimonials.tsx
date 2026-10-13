import { useTranslation } from 'react-i18next';

import { Picture, Rating } from '@/shared/ui';

import styles from './testimonials.module.css';

const ITEMS = [1, 2, 3, 4] as const;

export const Testimonials = () => {
  const { t } = useTranslation('home');
  return (
    <section className="reveal" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className={styles.title}>
        {t('reviews.title')}
      </h2>
      <div className={styles.track} tabIndex={0} role="region" aria-labelledby="reviews-title">
        <ul className={styles.list}>
          {ITEMS.map((i) => (
            <li key={i} className={styles.card}>
              <Picture
                slot={`marketing/setup-0${i}`}
                alt={t('reviews.photoAlt')}
                ratio={4 / 5}
                sizes="(min-width: 768px) 320px, 80vw"
              />
              <blockquote className={styles.quote}>
                <Rating value={5} label={t('reviews.stars')} />
                <p>{t(`reviews.items.${i}.text`)}</p>
                <footer>— {t(`reviews.items.${i}.author`)}</footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
