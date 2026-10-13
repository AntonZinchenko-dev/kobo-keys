import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import {
  type DevSettings,
  type Latency,
  readDevSettings,
  type Scenario,
  writeDevSettings,
} from '@mocks/dev-settings';

import { apiUrl } from '@/shared/api';
import { PSEUDO_STORAGE_KEY } from '@/shared/i18n';
import { Button, Check, Icon, Segmented, toast } from '@/shared/ui';

import styles from './dev-panel.module.css';

const readPseudo = () => {
  try {
    return localStorage.getItem(PSEUDO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * "Developer remote" of the demo: makes the mock network slow, flaky or offline and switches
 * failure scenarios — so a reviewer can see that loading and error states are handled everywhere.
 * Built on the Popover API (light dismiss, top layer, no JS positioning).
 */
export const DevPanel = () => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [settings, setSettings] = useState<DevSettings>(readDevSettings);
  const [pseudo, setPseudo] = useState(readPseudo);

  const update = (patch: Partial<DevSettings>) => setSettings(writeDevSettings(patch));

  const reset = async () => {
    await fetch(apiUrl('/__reset'), { method: 'POST' });
    for (const key of [
      'kobo-cart',
      'kobo-session',
      'kobo-wishlist',
      'kobo-compare',
      'kobo-recent-searches',
    ]) {
      localStorage.removeItem(key);
    }
    client.clear();
    toast.success(t('dev.resetDone'));
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        popoverTarget="dev-panel"
        aria-label={t('dev.open')}
        data-dev-panel=""
      >
        <Icon name="flask-conical" size={20} />
        {(settings.offline ||
          settings.errorRate > 0 ||
          settings.latency === 'slow3g' ||
          settings.scenario !== 'none') && <span className={styles.dot} aria-hidden="true" />}
      </button>
      <div
        id="dev-panel"
        popover="auto"
        className={styles.panel}
        aria-label={t('dev.title')}
        data-dev-panel=""
      >
        <h2 className={styles.title}>
          <Icon name="flask-conical" size={18} /> {t('dev.title')}
        </h2>
        <p className={styles.lead}>{t('dev.lead')}</p>

        <fieldset className={styles.group}>
          <legend>{t('dev.latency')}</legend>
          <Segmented<Latency>
            label={t('dev.latency')}
            value={settings.latency}
            onChange={(latency) => update({ latency })}
            options={[
              { value: 'fast', label: t('dev.fast') },
              { value: 'normal', label: t('dev.normal') },
              { value: 'slow3g', label: '3G' },
            ]}
          />
        </fieldset>

        <fieldset className={styles.group}>
          <legend>{t('dev.errors')}</legend>
          <Segmented<'0' | '0.1' | '0.5'>
            label={t('dev.errors')}
            value={String(settings.errorRate) as '0' | '0.1' | '0.5'}
            onChange={(v) => update({ errorRate: Number(v) as DevSettings['errorRate'] })}
            options={[
              { value: '0', label: '0%' },
              { value: '0.1', label: '10%' },
              { value: '0.5', label: '50%' },
            ]}
          />
        </fieldset>

        <fieldset className={styles.group}>
          <legend>{t('dev.scenario')}</legend>
          {(['none', 'out-of-stock-on-checkout', 'payment-server-down'] as Scenario[]).map((s) => (
            <Check
              key={s}
              type="radio"
              name="scenario"
              label={t(`dev.scenarios.${s}`)}
              checked={settings.scenario === s}
              onChange={() => update({ scenario: s })}
            />
          ))}
        </fieldset>

        <fieldset className={styles.group}>
          <legend>{t('dev.other')}</legend>
          <Check
            label={t('dev.offline')}
            checked={settings.offline}
            onChange={(e) => update({ offline: e.target.checked })}
          />
          <Check
            label={t('dev.pseudo')}
            checked={pseudo}
            onChange={(e) => {
              localStorage.setItem(PSEUDO_STORAGE_KEY, e.target.checked ? '1' : '0');
              setPseudo(e.target.checked);
              window.location.reload();
            }}
          />
        </fieldset>

        <details className={styles.cheats}>
          <summary>{t('dev.cheatsheet')}</summary>
          <dl>
            <dt>4242 4242 4242 4242</dt>
            <dd>{t('dev.cards.success')}</dd>
            <dt>4000 0000 0000 0002</dt>
            <dd>{t('dev.cards.declined')}</dd>
            <dt>4000 0027 6000 3184</dt>
            <dd>{t('dev.cards.threeDs')}</dd>
            <dt>4000 0000 0000 9995</dt>
            <dd>{t('dev.cards.funds')}</dd>
            <dt>KOBO10 · FREESHIP · SUMMER24</dt>
            <dd>{t('dev.promos')}</dd>
            <dt>000000</dt>
            <dd>{t('dev.loginCode')}</dd>
          </dl>
        </details>

        <Button variant="danger" size="sm" icon="refresh-cw" block onClick={() => void reset()}>
          {t('dev.reset')}
        </Button>
      </div>
    </>
  );
};
