import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { ProductRail } from '@/widgets/product-list';
import { productsQuery } from '@/entities/product';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { ButtonLink, Icon, Marquee, Picture } from '@/shared/ui';

import { Bento } from './bento';
import { BuilderTeaser } from './builder-teaser';
import { ClubTeaser } from './club-teaser';
import { DropOfTheWeek } from './drop-of-the-week';
import { Newsletter } from './newsletter';
import { Testimonials } from './testimonials';

import styles from './home-page.module.css';

export const HomePage = () => {
  const { t } = useTranslation('home');
  const lang = useLang();
  const { data: popular } = useQuery(productsQuery(lang, { sort: 'popular', limit: 8 }));

  return (
    <>
      <title>{t('meta.title')}</title>
      <meta name="description" content={t('meta.description')} />

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroMedia}>
          <Picture
            slot="marketing/hero"
            mobileSlot="marketing/hero-mobile"
            alt={t('hero.imageAlt')}
            ratio={16 / 9}
            sizes="100vw"
            priority
            className={styles.heroImage}
          />
        </div>
        <span className={styles.heroKanji} lang="ja" aria-hidden="true">
          工房
        </span>
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.kicker}>
            <span lang="ja">工房</span> · {t('hero.kicker')}
          </p>
          <h1 id="hero-title" className={styles.heroTitle}>
            {t('hero.title1')} <em>{t('hero.title2')}</em>
          </h1>
          <p className={styles.heroText}>{t('hero.text')}</p>
          <div className={styles.heroActions}>
            <ButtonLink to={paths.catalog(lang)} size="lg" iconEnd="arrow-right" viewTransition>
              {t('hero.ctaCatalog')}
            </ButtonLink>
            <ButtonLink to={paths.builder(lang)} size="lg" variant="secondary" icon="sparkles" viewTransition>
              {t('hero.ctaBuilder')}
            </ButtonLink>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>{t('hero.stat1')}</dt>
              <dd>2 400+</dd>
            </div>
            <div>
              <dt>{t('hero.stat2')}</dt>
              <dd>4.9 ★</dd>
            </div>
            <div>
              <dt>{t('hero.stat3')}</dt>
              <dd>24 h</dd>
            </div>
          </dl>
        </div>
        <span className={styles.scrollHint} aria-hidden="true">
          <Icon name="chevron-down" size={22} />
        </span>
      </section>

      <div className={styles.marquee}>
        <Marquee
          label={t('marquee.label')}
          items={[
            t('marquee.handmade'),
            t('marquee.hotswap'),
            t('marquee.shipping'),
            t('marquee.returns'),
            t('marquee.warranty'),
            t('marquee.lubed'),
          ].map((text) => (
            <span key={text} className={styles.marqueeItem}>
              <span className={styles.marqueeDot} aria-hidden="true">
                ✦
              </span>
              {text}
            </span>
          ))}
        />
      </div>

      <div className={`container ${styles.sections}`}>
        <Bento />
        <div className="reveal">
          <ProductRail
            title={t('bestsellers')}
            products={popular?.items}
            action={
              <ButtonLink to={paths.catalog(lang)} variant="ghost" size="sm" iconEnd="arrow-right">
                {t('allProducts')}
              </ButtonLink>
            }
          />
        </div>
        <DropOfTheWeek />
        <BuilderTeaser />
        <section className={`${styles.workshop} reveal`} aria-labelledby="workshop-title">
          <Picture
            slot="marketing/workshop"
            alt={t('workshop.imageAlt')}
            ratio={3 / 2}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={styles.workshopImage}
          />
          <div className={styles.workshopText}>
            <p className={styles.kicker}>{t('workshop.kicker')}</p>
            <h2 id="workshop-title">{t('workshop.title')}</h2>
            <p>{t('workshop.text')}</p>
            <ul className={styles.workshopList}>
              <li>
                <Icon name="check" size={18} /> {t('workshop.point1')}
              </li>
              <li>
                <Icon name="check" size={18} /> {t('workshop.point2')}
              </li>
              <li>
                <Icon name="check" size={18} /> {t('workshop.point3')}
              </li>
            </ul>
          </div>
        </section>
        <Testimonials />
        <ClubTeaser />
        <Newsletter />
      </div>
    </>
  );
};
