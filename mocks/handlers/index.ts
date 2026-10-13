import { accountHandlers } from './account';
import { catalogHandlers } from './catalog';
import { chaosHandler } from './chaos';
import { checkoutHandlers } from './checkout';

/** Order matters: the chaos handler runs first and falls through to the real ones. */
export const handlers = [chaosHandler, ...catalogHandlers, ...checkoutHandlers, ...accountHandlers];
