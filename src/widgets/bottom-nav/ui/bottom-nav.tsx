import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { selectCount, useCartStore } from '@/entities/cart';
import { useIsAuthorized } from '@/entities/session';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui';

import styles from './bottom-nav.module.css';

/** Phone navigation in the thumb zone; hidden from tablet width up. */
export const BottomNav = ({ onOpenSearch }: { onOpenSearch: () => void }) => {
  const { t } = useTranslation();
  const lang = useLang();
  const count = useCartStore(selectCount);
  const authorized = useIsAuthorized();

  const item = (to: string, icon: IconName, label: string, badge?: number, end?: boolean) => (
    <li>
      <NavLink
        to={to}
        end={end}
        className={styles.item}
        viewTransition
        {...(icon === 'shopping-bag' ? { 'data-cart-target': '' } : {})}
      >
        <span className={styles.icon}>
          <Icon name={icon} size={22} />
          {badge ? <span className={styles.badge}>{badge}</span> : null}
        </span>
        <span>{label}</span>
      </NavLink>
    </li>
  );

  return (
    <nav className={styles.nav} aria-label={t('nav.mobile')}>
      <ul>
        {item(paths.home(lang), 'house', t('nav.home'), undefined, true)}
        {item(paths.catalog(lang), 'layout-grid', t('nav.catalog'))}
        <li>
          <button type="button" className={styles.item} onClick={onOpenSearch}>
            <span className={styles.icon}>
              <Icon name="search" size={22} />
            </span>
            <span>{t('nav.search')}</span>
          </button>
        </li>
        {item(paths.cart(lang), 'shopping-bag', t('nav.cart'), count)}
        {item(authorized ? paths.account(lang) : paths.login(lang), 'user', t('nav.profile'))}
      </ul>
    </nav>
  );
};
