import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** The very same handlers back the unit/component tests. */
export const server = setupServer(...handlers);
