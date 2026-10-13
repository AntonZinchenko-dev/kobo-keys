import { useTranslation } from 'react-i18next';

import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { ButtonLink, Picture } from '@/shared/ui';

import styles from './club-teaser.module.css';

export const ClubTeaser = () => {
  const { t } = useTranslation('home');
  const lang = useLang();
  return (
    <section className={`${styles.club} reveal`} aria-labelledby="club-title">
      <div className={styles.text}>
        <p className={styles.kicker}>Keycap Club</p>
        <h2 id="club-title">{t('club.title')}</h2>
        <p>{t('club.text')}</p>
        <ButtonLink to={paths.club(lang)} variant="secondary" size="lg" icon="gift" viewTransition>
          {t('club.cta')}
        </ButtonLink>
      </div>
      <Picture
        slot="marketing/club-box"
        alt={t('club.imageAlt')}
        ratio={4 / 3}
        sizes="(min-width: 1024px) 40vw, 100vw"
        className={styles.image}
      />
    </section>
  );
};
