import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { builderOptionsQuery, KeyboardPreview } from '@/entities/keyboard-build';
import { DEFAULT_BUILD } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { ButtonLink, Skeleton } from '@/shared/ui';

import styles from './builder-teaser.module.css';

export const BuilderTeaser = () => {
  const { t } = useTranslation('home');
  const lang = useLang();
  const { data: options } = useQuery(builderOptionsQuery(lang));
  return (
    <section className={`${styles.teaser} reveal`} aria-labelledby="builder-title">
      <div className={styles.text}>
        <p className={styles.kicker}>{t('builder.kicker')}</p>
        <h2 id="builder-title">{t('builder.title')}</h2>
        <p>{t('builder.text')}</p>
        <ButtonLink to={paths.builder(lang)} size="lg" icon="sparkles" viewTransition>
          {t('builder.cta')}
        </ButtonLink>
      </div>
      <div className={styles.preview}>
        {options ? (
          <KeyboardPreview build={DEFAULT_BUILD} options={options} title={t('builder.previewAlt')} />
        ) : (
          <Skeleton style={{ aspectRatio: '16 / 6' }} />
        )}
      </div>
    </section>
  );
};
