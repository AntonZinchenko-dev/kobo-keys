import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';

import { useSessionStore } from '@/entities/session';
import { plansQuery, subscribe } from '@/entities/subscription';
import type { BillingPeriod, Plan } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import {
  Accordion,
  Badge,
  Button,
  Dialog,
  Icon,
  Picture,
  Price,
  Segmented,
  Skeleton,
  toast,
} from '@/shared/ui';

import styles from './club-page.module.css';

const ROWS = ['sets', 'artisan', 'discount', 'shipping', 'early', 'surprise', 'engraving'] as const;
const MATRIX: Record<(typeof ROWS)[number], [string, string, string]> = {
  sets: ['1', '1', '1'],
  artisan: ['—', '✓', '✓'],
  discount: ['5%', '10%', '15%'],
  shipping: ['—', '✓', '✓'],
  early: ['1 h', '24 h', '24 h'],
  surprise: ['—', '—', '✓'],
  engraving: ['—', '—', '✓'],
};

export const ClubPage = () => {
  const { t } = useTranslation('account');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();
  const client = useQueryClient();
  const token = useSessionStore((s) => s.token);
  const [period, setPeriod] = useState<BillingPeriod>('year');
  const [chosen, setChosen] = useState<Plan | null>(null);
  const { data: plans } = useQuery(plansQuery(lang));

  const mutation = useMutation({
    mutationFn: (plan: Plan) => subscribe(plan.id, period),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['subscription'] });
      toast.success(t('club.welcome'));
      setChosen(null);
      void navigate(`${paths.account(lang)}?tab=subscription`);
    },
    onError: () => toast.error(tc('errors.generic')),
  });

  const pick = (plan: Plan) => {
    if (!token) {
      void navigate(paths.login(lang, paths.club(lang)));
      return;
    }
    setChosen(plan);
  };

  return (
    <div className={styles.page}>
      <title>{`Keycap Club — KŌBŌ Keys`}</title>
      <meta name="description" content={t('club.lead')} />

      <section className={styles.hero}>
        <Picture
          slot="marketing/club-box"
          alt={t('club.imageAlt')}
          ratio={4 / 3}
          sizes="100vw"
          priority
          className={styles.heroImage}
        />
        <div className={`container ${styles.heroText}`}>
          <Badge tone="gold">Keycap Club</Badge>
          <h1>{t('club.title')}</h1>
          <p>{t('club.lead')}</p>
        </div>
      </section>

      <div className="container">
        <div className={styles.toggle}>
          <Segmented<BillingPeriod>
            label={t('club.period')}
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'month', label: t('club.monthly') },
              {
                value: 'year',
                label: (
                  <>
                    {t('club.yearly')} <span className={styles.save}>−20%</span>
                  </>
                ),
              },
            ]}
          />
        </div>

        <ul className={styles.plans}>
          {plans
            ? plans.map((plan) => {
                const perMonth = period === 'year' ? Math.round(plan.yearly / 12) : plan.monthly;
                return (
                  <li key={plan.id} className={clsx(styles.plan, plan.highlight && styles.highlight)}>
                    {plan.highlight && <span className={styles.ribbon}>{t('club.popular')}</span>}
                    <h2>{plan.name}</h2>
                    {/* key on period → the price re-animates when the toggle flips */}
                    <div key={period} className={styles.price}>
                      <Price value={perMonth} size="lg" />
                      <span>{t('club.perMonth')}</span>
                    </div>
                    <p className={styles.billed}>
                      {period === 'year' ? t('club.billedYearly') : t('club.billedMonthly')}
                      {period === 'year' && <Price value={plan.yearly} size="sm" />}
                    </p>
                    <ul className={styles.features}>
                      {plan.features.map((f) => (
                        <li key={f}>
                          <Icon name="check" size={16} /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      block
                      variant={plan.highlight ? 'primary' : 'secondary'}
                      onClick={() => pick(plan)}
                    >
                      {t('club.choose', { plan: plan.name })}
                    </Button>
                  </li>
                );
              })
            : [0, 1, 2].map((i) => (
                <li key={i}>
                  <Skeleton style={{ height: 420, borderRadius: 'var(--radius-lg)' }} />
                </li>
              ))}
        </ul>

        <section className={styles.compare} aria-labelledby="club-compare">
          <h2 id="club-compare">{t('club.compareTitle')}</h2>
          <div className={styles.tableWrap} tabIndex={0} role="region" aria-labelledby="club-compare">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="visually-hidden">{t('club.feature')}</span>
                  </th>
                  <th scope="col">Starter</th>
                  <th scope="col">Collector</th>
                  <th scope="col">Master</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row}>
                    <th scope="row">{t(`club.rows.${row}`)}</th>
                    {MATRIX[row].map((v, i) => (
                      <td key={i} className={v === '✓' ? styles.yes : v === '—' ? styles.no : undefined}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.faq} aria-labelledby="club-faq">
          <h2 id="club-faq">{t('club.faqTitle')}</h2>
          {(['cancel', 'pause', 'ship', 'gift'] as const).map((q) => (
            <Accordion key={q} summary={t(`club.faq.${q}.q`)}>
              <p>{t(`club.faq.${q}.a`)}</p>
            </Accordion>
          ))}
        </section>
      </div>

      <Dialog
        open={chosen !== null}
        onClose={() => setChosen(null)}
        title={t('club.confirmTitle')}
        size="sm"
        closeLabel={tc('actions.close')}
      >
        {chosen && (
          <div className={styles.confirm}>
            <p>{t('club.confirmText', { plan: chosen.name })}</p>
            <Price value={period === 'year' ? chosen.yearly : chosen.monthly} size="lg" />
            <p className={styles.billed}>{period === 'year' ? t('club.perYear') : t('club.perMonth')}</p>
            <Button block size="lg" loading={mutation.isPending} onClick={() => mutation.mutate(chosen)}>
              {t('club.subscribe')}
            </Button>
            <p className={styles.demoNote}>{t('club.demo')}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
};
