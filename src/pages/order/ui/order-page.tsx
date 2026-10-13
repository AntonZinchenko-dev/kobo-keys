import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { useCartStore } from '@/entities/cart';
import { orderQuery, OrderTimeline } from '@/entities/order';
import { paths } from '@/shared/config';
import { INTL_LOCALE, useLang } from '@/shared/i18n';
import { Badge, Button, ButtonLink, EmptyState, Icon, Picture, Price, Skeleton, toast } from '@/shared/ui';

import { launchConfetti } from '../lib/confetti';

import styles from './order-page.module.css';

export const OrderPage = () => {
  const { t } = useTranslation('checkout');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const isNew = params.get('new') === '1';
  const add = useCartStore((s) => s.add);
  const { data: order, isPending, isError } = useQuery(orderQuery(id));

  useEffect(() => {
    if (isNew) launchConfetti();
  }, [isNew]);

  if (isError) {
    return (
      <div className="container">
        <EmptyState
          mascot="not-found"
          title={t('order.notFound')}
          action={<ButtonLink to={paths.home(lang)}>{tc('nav.home')}</ButtonLink>}
        />
      </div>
    );
  }
  if (isPending) {
    return (
      <div className={`container ${styles.page}`}>
        <Skeleton style={{ height: 60, width: '50%' }} />
        <Skeleton style={{ height: 200, marginTop: 24 }} />
      </div>
    );
  }

  const date = new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: 'long', timeStyle: 'short' });
  const repeat = () => {
    for (const l of order.lines) {
      add(
        { productId: l.productId, variantKey: l.variantKey, qty: l.qty },
        { name: l.name, slug: l.slug, image: l.image, unitPrice: l.unitPrice, variantLabel: l.variantLabel },
      );
    }
    toast.success(t('order.repeated'));
  };

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${t('order.title', { number: order.number })} — KŌBŌ Keys`}</title>
      {isNew && (
        <section className={styles.success} aria-live="polite">
          <div className={styles.mascot}>
            <Picture slot="mascot/success" alt="" ratio={1} sizes="120px" />
          </div>
          <div>
            <h1>{t('order.thanks')}</h1>
            <p>{t('order.thanksText', { email: order.contact.email })}</p>
          </div>
        </section>
      )}

      <header className={styles.head}>
        <div>
          {isNew ? (
            <h2>{t('order.title', { number: order.number })}</h2>
          ) : (
            <h1>{t('order.title', { number: order.number })}</h1>
          )}
          <p className={styles.date}>{date.format(new Date(order.createdAt))}</p>
        </div>
        <Badge tone={order.status === 'delivered' ? 'matcha' : 'gold'}>
          {tc(`order.status.${order.status}`)}
        </Badge>
      </header>

      <div className={styles.card}>
        <OrderTimeline order={order} />
        <p className={styles.liveNote}>
          <Icon name="info" size={16} /> {t('order.liveNote')}
        </p>
      </div>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="order-items">
          <h2 id="order-items">{t('order.items')}</h2>
          <ul className={styles.lines}>
            {order.lines.map((l) => (
              <li key={l.key}>
                <div className={styles.thumb}>
                  {l.image ? (
                    <Picture slot={l.image} alt="" ratio={1} sizes="64px" />
                  ) : (
                    <Icon name="keyboard" size={26} />
                  )}
                </div>
                <div>
                  <strong>{l.name}</strong>
                  <span>
                    {l.variantLabel} · ×{l.qty}
                  </span>
                </div>
                <Price value={l.total} size="sm" />
              </li>
            ))}
          </ul>
          <dl className={styles.totals}>
            <div>
              <dt>{tc('summary.subtotal')}</dt>
              <dd>
                <Price value={order.subtotal} size="sm" />
              </dd>
            </div>
            {order.discount > 0 && (
              <div>
                <dt>{tc('summary.discount', { code: '' })}</dt>
                <dd>
                  −<Price value={order.discount} size="sm" />
                </dd>
              </div>
            )}
            <div>
              <dt>{tc('summary.shipping')}</dt>
              <dd>
                {order.shippingPrice === 0 ? (
                  tc('summary.free')
                ) : (
                  <Price value={order.shippingPrice} size="sm" />
                )}
              </dd>
            </div>
            <div className={styles.grand}>
              <dt>{tc('summary.total')}</dt>
              <dd>
                <Price value={order.total} />
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.card} aria-labelledby="order-delivery">
          <h2 id="order-delivery">{t('order.delivery')}</h2>
          <p>
            <strong>{t(`delivery.${order.shipping}`)}</strong>
          </p>
          {order.address ? (
            <p className={styles.muted}>
              {order.address.street}, {order.address.zip} {order.address.city}
            </p>
          ) : (
            <p className={styles.muted}>{t('delivery.workshopAddress')}</p>
          )}
          <p className={styles.muted}>
            {order.contact.name} · {order.contact.phone}
          </p>
          {order.payment && (
            <>
              <h2>{t('order.payment')}</h2>
              <p className={styles.muted}>
                {order.payment.method === 'card'
                  ? `${(order.payment.brand ?? '').toUpperCase()} •••• ${order.payment.last4 ?? ''}`
                  : t(`payment.methods.${order.payment.method}`)}
              </p>
            </>
          )}
          <div className={styles.actions}>
            <ButtonLink to={paths.catalog(lang)} variant="secondary" iconEnd="arrow-right">
              {t('order.continue')}
            </ButtonLink>
            <Button variant="ghost" icon="refresh-cw" onClick={repeat}>
              {t('order.repeat')}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};
