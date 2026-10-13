import { queryOptions } from '@tanstack/react-query';

import { api, type AuthResponse, type User } from '@/shared/api';

export const requestCode = (email: string) =>
  api<undefined>('/auth/login', { method: 'POST', body: { email } });

export const verifyCode = (email: string, code: string) =>
  api<AuthResponse>('/auth/verify', { method: 'POST', body: { email, code } });

export const logout = () => api<undefined>('/auth/logout', { method: 'POST' });

export const meQuery = (token: string | null) =>
  queryOptions({
    queryKey: ['me', token],
    queryFn: ({ signal }) => api<User>('/me', { signal }),
    enabled: token !== null,
  });

export const updateMe = (patch: Partial<User>) => api<User>('/me', { method: 'PATCH', body: patch });
