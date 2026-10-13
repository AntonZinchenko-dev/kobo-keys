import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DEV_SETTINGS_EVENT, type DevSettings, readDevSettings } from '@mocks/dev-settings';

import { useOnline } from '@/shared/lib';
import { Icon } from '@/shared/ui';

import styles from './layout.module.css';

/** Shown when the browser is offline — or when offline mode is switched on in the dev panel. */
export const OfflineBanner = () => {
  const { t } = useTranslation();
  const online = useOnline();
  const [simulated, setSimulated] = useState(() => readDevSettings().offline);

  useEffect(() => {
    const onChange = (e: Event) => setSimulated((e as CustomEvent<DevSettings>).detail.offline);
    window.addEventListener(DEV_SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(DEV_SETTINGS_EVENT, onChange);
  }, []);

  if (online && !simulated) return null;
  return (
    <div className={styles.offline} role="alert">
      <Icon name="wifi-off" size={18} />
      {t('errors.offline')}
    </div>
  );
};
