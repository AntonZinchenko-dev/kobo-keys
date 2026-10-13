import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router';

import { CurrencySwitcher } from '@/features/switch-currency';
import { LanguageSwitcher } from '@/features/switch-language';
import { ThemeToggle } from '@/features/toggle-theme';
import { useWishlistStore } from '@/features/toggle-wishlist';
import { selectCount, useCartStore } from '@/entities/cart';
import { useIsAuthorized } from '@/entities/session';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { IconButton, IconLink, Kbd, Logo } from '@/shared/ui';

import styles from './header.module.css';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenSearch: () => void;
}

export const Header = ({ onOpenCart, onOpenSearch }: HeaderProps) => {
  const { t } = useTranslation();
  const lang = useLang();
  const count = useCartStore(selectCount);
  const wishlist = useWishlistStore((s) => s.slugs.length);
  const authorized = useIsAuthorized();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to={paths.home(lang)} className={styles.logo} aria-label={t('nav.home')} viewTransition>
          <Logo />
        </Link>

        <nav className={styles.nav} aria-label={t('nav.main')}>
          <NavLink to={paths.catalog(lang)} className={styles.link} viewTransition>
            {t('nav.catalog')}
          </NavLink>
          <NavLink to={paths.builder(lang)} className={styles.link} viewTransition>
            {t('nav.builder')}
          </NavLink>
          <NavLink to={paths.club(lang)} className={styles.link} viewTransition>
            {t('nav.club')}
          </NavLink>
        </nav>

        <button type="button" className={styles.search} onClick={onOpenSearch}>
          <span className={styles.searchText}>{t('search.placeholder')}</span>
          <span className={styles.shortcut} aria-hidden="true">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
          <span className="visually-hidden">{t('search.open')}</span>
        </button>

        <div className={styles.actions}>
          <IconButton
            icon="search"
            label={t('search.open')}
            onClick={onOpenSearch}
            className={styles.mobileOnly}
          />
          <div className={styles.settings}>
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
          <ThemeToggle />
          <IconLink
            to={paths.wishlist(lang)}
            className={styles.desktopOnly}
            icon="heart"
            label={t('nav.wishlist')}
            badge={wishlist}
          />
          <IconLink
            to={authorized ? paths.account(lang) : paths.login(lang)}
            className={styles.desktopOnly}
            icon="user"
            label={t('nav.account')}
          />
          <IconButton
            icon="shopping-bag"
            label={t('cart.open', { count })}
            badge={count}
            onClick={onOpenCart}
            data-cart-target=""
          />
        </div>
      </div>
    </header>
  );
};
