import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { AddToCartButton } from '@/features/add-to-cart';
import { productQuery } from '@/entities/product';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { useCountdown } from '@/shared/lib';
import { Badge, ButtonLink, Picture, Price } from '@/shared/ui';

import styles from './drop-of-the-week.module.css';

const nextSunday = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  d.setHours(23, 59, 59, 0);
  return d.getTime();
};

const pad = (n: number) => String(n).padStart(2, '0');

export const DropOfTheWeek = () => {
  const { t } = useTranslation('home');
  const lang = useLang();
  const [target] = useState(nextSunday);
  const left = useCountdown(target);
  const { data: product } = useQuery(productQuery(lang, 'keycaps-lantern'));
  const stock = product ? Object.values(product.stock).reduce((a, b) => a + b, 0) : null;

  return (
    <div className="reveal">
      <section className={styles.drop} aria-labelledby="drop-title">
        <Picture
          slot="marketing/drop-desktop"
          mobileSlot="marketing/drop-mobile"
          mobileRatio={4 / 5}
          alt=""
          ratio={12 / 5}
          sizes="100vw"
          className={styles.image}
        />
        <div className={styles.content}>
          <Badge tone="sakura">{t('drop.badge')}</Badge>
          <h2 id="drop-title" className={styles.title}>
            {t('drop.title')}
          </h2>
          <p className={styles.text}>{t('drop.text')}</p>
          <div className={styles.timer} role="timer" aria-label={t('drop.endsIn')}>
            {[
              [left.days, t('drop.days')],
              [left.hours, t('drop.hours')],
              [left.minutes, t('drop.minutes')],
              [left.seconds, t('drop.seconds')],
            ].map(([value, label]) => (
              <span key={label} className={styles.unit}>
                <span className={styles.digits}>{pad(Number(value))}</span>
                <span className={styles.unitLabel}>{label}</span>
              </span>
            ))}
          </div>
          {product && (
            <div className={styles.buy}>
              <Price value={product.price} size="lg" />
              {stock !== null && <span className={styles.stock}>{t('drop.left', { count: stock })}</span>}
              <div className={styles.buttons}>
                <AddToCartButton
                  product={product}
                  variantKey={product.defaultVariant}
                  unitPrice={product.price}
                  size="lg"
                />
                <ButtonLink to={paths.product(lang, product.slug)} variant="ghost" size="lg">
                  {t('drop.more')}
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
