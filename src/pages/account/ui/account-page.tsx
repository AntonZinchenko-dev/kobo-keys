import { useTranslation } from 'react-i18next';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { CurrencySwitcher } from '@/features/switch-currency';
import { LanguageSwitcher } from '@/features/switch-language';
import { ThemeToggle } from '@/features/toggle-theme';
import { useCartStore } from '@/entities/cart';
import { ordersQuery } from '@/entities/order';
import { logout, useSessionStore } from '@/entities/session';
import { paths } from '@/shared/config';
import { INTL_LOCALE, useLang } from '@/shared/i18n';
import { Badge, Button, ButtonLink, EmptyState, Icon, Price, Segmented, Skeleton, toast } from '@/shared/ui';

import { SubscriptionPanel } from './subscription-panel';

import styles from './account-page.module.css';

type Tab = 'orders' | 'subscription' | 'addresses' | 'settings';
const TABS: Tab[] = ['orders', 'subscription', 'addresses', 'settings'];

export const AccountPage = () => {
  const { t } = useTranslation('account');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const { token, user, clear } = useSessionStore();
  const add = useCartStore((s) => s.add);
  const tab = (TABS as string[]).includes(params.get('tab') ?? '') ? (params.get('tab') as Tab) : 'orders';
  const { data: orders, isPending } = useQuery(ordersQuery(token));

  if (!token || !user) return <Navigate to={paths.login(lang, paths.account(lang))} replace />;

  const date = new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: 'medium' });
  const signOut = async () => {
    await logout().catch(() => undefined);
    clear();
    client.removeQueries({ queryKey: ['orders'] });
    client.removeQueries({ queryKey: ['subscription'] });
  };

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${tc('nav.account')} — KŌBŌ Keys`}</title>
      <header className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h1>{t('account.hello', { name: user.name })}</h1>
          <p className={styles.muted}>{user.email}</p>
        </div>
        <Button variant="ghost" icon="log-out" onClick={() => void signOut()} className={styles.logout}>
          {t('account.logout')}
        </Button>
      </header>

      <Segmented<Tab>
        label={t('account.sections')}
        value={tab}
        onChange={(next) => setParams({ tab: next }, { replace: true })}
        options={TABS.map((x) => ({ value: x, label: t(`account.tabs.${x}`) }))}
        className={styles.tabs}
      />

      <section className={styles.panel} aria-live="polite">
        {tab === 'orders' &&
          (isPending ? (
            <Skeleton style={{ height: 200 }} />
          ) : !orders?.length ? (
            <EmptyState
              compact
              mascot="empty-cart"
              title={t('orders.empty')}
              action={<ButtonLink to={paths.catalog(lang)}>{tc('cart.toCatalog')}</ButtonLink>}
            />
          ) : (
            <ul className={styles.orders}>
              {orders.map((o) => (
                <li key={o.id} className={styles.order}>
                  <div>
                    <Link to={paths.order(lang, o.id)} className={styles.orderLink}>
                      {o.number}
                    </Link>
                    <span className={styles.muted}>
                      {date.format(new Date(o.createdAt))} ·{' '}
                      {tc('cart.items', { count: o.lines.reduce<number>((s, l) => s + l.qty, 0) })}
                    </span>
                  </div>
                  <Badge
                    tone={
                      o.status === 'delivered' ? 'matcha' : o.status === 'pending_payment' ? 'danger' : 'gold'
                    }
                  >
                    {tc(`order.status.${o.status}`)}
                  </Badge>
                  <Price value={o.total} size="sm" />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="refresh-cw"
                    onClick={() => {
                      for (const l of o.lines)
                        add(
                          { productId: l.productId, variantKey: l.variantKey, qty: l.qty },
                          {
                            name: l.name,
                            slug: l.slug,
                            image: l.image,
                            unitPrice: l.unitPrice,
                            variantLabel: l.variantLabel,
                          },
                        );
                      toast.success(t('orders.repeated'));
                    }}
                  >
                    {t('orders.repeat')}
                  </Button>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'subscription' && <SubscriptionPanel />}

        {tab === 'addresses' &&
          (user.addresses.length === 0 ? (
            <p className={styles.muted}>{t('addresses.empty')}</p>
          ) : (
            <ul className={styles.addresses}>
              {user.addresses.map((a) => (
                <li key={`${a.city}-${a.street}`} className={styles.card}>
                  <Icon name="map-pin" size={18} />
                  <span>
                    {a.street}, {a.zip} {a.city}
                  </span>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'settings' && (
          <dl className={styles.settings}>
            <div>
              <dt>{tc('settings.language')}</dt>
              <dd>
                <LanguageSwitcher />
              </dd>
            </div>
            <div>
              <dt>{tc('settings.currency')}</dt>
              <dd>
                <CurrencySwitcher />
              </dd>
            </div>
            <div>
              <dt>{t('settings.theme')}</dt>
              <dd>
                <ThemeToggle />
              </dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
};
