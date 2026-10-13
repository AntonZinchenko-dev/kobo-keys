import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '@/entities/session';
import { plansQuery, subscriptionQuery, updateSubscription } from '@/entities/subscription';
import type { BillingPeriod, PlanId, SubscriptionAction } from '@/shared/api';
import { paths } from '@/shared/config';
import { INTL_LOCALE, useLang } from '@/shared/i18n';
import {
  Badge,
  Button,
  ButtonLink,
  Dialog,
  EmptyState,
  Price,
  Segmented,
  Skeleton,
  toast,
} from '@/shared/ui';

import styles from './account-page.module.css';

export const SubscriptionPanel = () => {
  const { t } = useTranslation('account');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const token = useSessionStore((s) => s.token);
  const client = useQueryClient();
  const { data: sub, isPending } = useQuery(subscriptionQuery(token));
  const { data: plans } = useQuery(plansQuery(lang));
  const [cancelStep, setCancelStep] = useState<0 | 1 | 2>(0);
  const [changeOpen, setChangeOpen] = useState(false);
  const [draft, setDraft] = useState<{ plan: PlanId; period: BillingPeriod } | null>(null);
  const date = new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: 'long' });

  const action = useMutation({
    mutationFn: (a: SubscriptionAction) => updateSubscription(a),
    onSuccess: (next, a) => {
      client.setQueryData(subscriptionQuery(token).queryKey, next);
      toast.success(t(`subscription.done.${a.type}`));
      setCancelStep(0);
      setChangeOpen(false);
    },
    onError: () => toast.error(tc('errors.generic')),
  });

  if (isPending) return <Skeleton style={{ height: 240 }} />;
  if (!sub) {
    return (
      <EmptyState
        compact
        mascot="hello"
        title={t('subscription.none')}
        text={t('subscription.noneText')}
        action={<ButtonLink to={paths.club(lang)}>{t('subscription.join')}</ButtonLink>}
      />
    );
  }

  const plan = plans?.find((p) => p.id === sub.plan);
  const tone = sub.status === 'active' ? 'matcha' : sub.status === 'paused' ? 'gold' : 'danger';

  return (
    <div className={styles.panelGrid}>
      <div className={styles.card}>
        <div className={styles.subHead}>
          <h3>{plan?.name ?? sub.plan}</h3>
          <Badge tone={tone}>{t(`subscription.status.${sub.status}`)}</Badge>
        </div>
        <p className={styles.muted}>
          {t(`subscription.period.${sub.period}`)} ·{' '}
          {plan && <Price value={sub.period === 'year' ? plan.yearly : plan.monthly} size="sm" />}
        </p>
        {sub.status === 'active' && sub.nextBillingAt && (
          <p>{t('subscription.next', { date: date.format(new Date(sub.nextBillingAt)) })}</p>
        )}
        {sub.status === 'paused' && sub.pausedUntil && (
          <p>{t('subscription.pausedUntil', { date: date.format(new Date(sub.pausedUntil)) })}</p>
        )}

        <div className={styles.actions}>
          {sub.status !== 'canceled' && (
            <Button
              variant="secondary"
              onClick={() => {
                setDraft({ plan: sub.plan, period: sub.period });
                setChangeOpen(true);
              }}
            >
              {t('subscription.change')}
            </Button>
          )}
          {sub.status === 'active' && (
            <Button variant="ghost" icon="pause" onClick={() => setCancelStep(1)}>
              {t('subscription.pauseOrCancel')}
            </Button>
          )}
          {sub.status !== 'active' && (
            <Button icon="play" loading={action.isPending} onClick={() => action.mutate({ type: 'resume' })}>
              {t('subscription.resume')}
            </Button>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h3>{t('subscription.history')}</h3>
        <ul className={styles.history}>
          {sub.history.map((h) => (
            <li key={h.date}>
              <span>{date.format(new Date(h.date))}</span>
              <Price value={h.amount} size="sm" />
              <Badge tone="matcha">{t(`subscription.paid`)}</Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* Retention flow: offer a pause before cancelling */}
      <Dialog
        open={cancelStep > 0}
        onClose={() => setCancelStep(0)}
        title={cancelStep === 1 ? t('subscription.pauseTitle') : t('subscription.cancelTitle')}
        size="sm"
        closeLabel={tc('actions.close')}
      >
        {cancelStep === 1 ? (
          <div className={styles.dialogBody}>
            <p>{t('subscription.pauseText')}</p>
            <div className={styles.pauseOptions}>
              {([1, 2, 3] as const).map((m) => (
                <Button
                  key={m}
                  variant="secondary"
                  loading={action.isPending && action.variables.type === 'pause'}
                  onClick={() => action.mutate({ type: 'pause', months: m })}
                >
                  {t('subscription.months', { count: m })}
                </Button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setCancelStep(2)}>
              {t('subscription.stillCancel')}
            </Button>
          </div>
        ) : (
          <div className={styles.dialogBody}>
            <p>{t('subscription.cancelText')}</p>
            <Button
              variant="danger"
              loading={action.isPending}
              onClick={() => action.mutate({ type: 'cancel' })}
            >
              {t('subscription.confirmCancel')}
            </Button>
            <Button variant="ghost" onClick={() => setCancelStep(0)}>
              {t('subscription.keep')}
            </Button>
          </div>
        )}
      </Dialog>

      <Dialog
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        title={t('subscription.change')}
        size="sm"
        closeLabel={tc('actions.close')}
      >
        {draft && plans && (
          <div className={styles.dialogBody}>
            <Segmented<BillingPeriod>
              label={t('subscription.periodLabel')}
              value={draft.period}
              onChange={(period) => setDraft({ ...draft, period })}
              options={[
                { value: 'month', label: t('subscription.period.month') },
                { value: 'year', label: t('subscription.period.year') },
              ]}
            />
            <div className={styles.planChoices}>
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={draft.plan === p.id}
                  className={styles.planChoice}
                  onClick={() => setDraft({ ...draft, plan: p.id })}
                >
                  <strong>{p.name}</strong>
                  <Price value={draft.period === 'year' ? p.yearly : p.monthly} size="sm" />
                </button>
              ))}
            </div>
            <Button loading={action.isPending} onClick={() => action.mutate({ type: 'change', ...draft })}>
              {t('subscription.save')}
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
};
