import type { PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { ColorId } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Icon, Picture } from '@/shared/ui';

import styles from './bento.module.css';

const TILES: {
  id: 'sakura' | 'matcha' | 'sumi' | 'neon';
  color: ColorId;
  ratio: number;
  className: string;
}[] = [
  { id: 'sakura', color: 'pink', ratio: 4 / 5, className: styles.tall ?? '' },
  { id: 'matcha', color: 'green', ratio: 2 / 1, className: styles.wide ?? '' },
  { id: 'sumi', color: 'black', ratio: 1, className: '' },
  { id: 'neon', color: 'purple', ratio: 1, className: '' },
];

/** Glow follows the cursor: the tile writes the pointer position into CSS variables. */
const track = (e: PointerEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--gx', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--gy', `${e.clientY - rect.top}px`);
};

export const Bento = () => {
  const { t } = useTranslation('home');
  const lang = useLang();
  return (
    <section className="reveal" aria-labelledby="bento-title">
      <div className={styles.head}>
        <h2 id="bento-title" className={styles.title}>
          {t('bento.title')}
        </h2>
        <p className={styles.lead}>{t('bento.lead')}</p>
      </div>
      <ul className={styles.grid}>
        {TILES.map((tile) => (
          <li key={tile.id} className={`${styles.tile} ${tile.className}`} onPointerMove={track}>
            <Picture
              slot={`marketing/collection-${tile.id}`}
              alt=""
              ratio={tile.ratio}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={styles.image}
            />
            <div className={styles.caption}>
              <span className={styles.kanji} lang="ja" aria-hidden="true">
                {t(`bento.${tile.id}.kanji`)}
              </span>
              <h3>
                <Link
                  to={`${paths.catalog(lang)}?color=${tile.color}`}
                  className={styles.link}
                  viewTransition
                >
                  {t(`bento.${tile.id}.title`)}
                </Link>
              </h3>
              <p>{t(`bento.${tile.id}.text`)}</p>
              <Icon name="arrow-right" size={20} className={styles.arrow} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
