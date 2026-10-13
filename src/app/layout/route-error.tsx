import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { Button, EmptyState } from '@/shared/ui';

/** Last line of defence: an unexpected error in a page shows the mascot instead of a white screen. */
export const RouteError = () => {
  const error = useRouteError();
  const { t } = useTranslation();
  console.error(error);
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main id="main" className="container">
      <EmptyState
        mascot={notFound ? 'not-found' : 'error'}
        title={notFound ? t('errors.notFound') : t('errors.crashed')}
        text={t('errors.crashedText')}
        action={
          <Button icon="refresh-cw" onClick={() => window.location.reload()}>
            {t('actions.reload')}
          </Button>
        }
      />
    </main>
  );
};
