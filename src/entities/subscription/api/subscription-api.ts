import { queryOptions } from '@tanstack/react-query';

import {
  api,
  type BillingPeriod,
  type Lang,
  type Plan,
  type PlanId,
  type Subscription,
  type SubscriptionAction,
} from '@/shared/api';

export const plansQuery = (lang: Lang) =>
  queryOptions({
    queryKey: ['subscription', 'plans', lang],
    queryFn: ({ signal }) => api<Plan[]>('/subscription/plans', { signal }),
    staleTime: Infinity,
  });

export const subscriptionQuery = (token: string | null) =>
  queryOptions({
    queryKey: ['subscription', 'mine', token],
    queryFn: ({ signal }) => api<Subscription | null>('/subscription', { signal }),
    enabled: token !== null,
  });

export const subscribe = (plan: PlanId, period: BillingPeriod) =>
  api<Subscription>('/subscription', { method: 'POST', body: { plan, period } });

export const updateSubscription = (action: SubscriptionAction) =>
  api<Subscription>('/subscription', { method: 'PATCH', body: action });
