import { HttpResponse } from 'msw';

import { type ApiErrorBody, type Lang, LANGS } from '@/shared/api/contracts';

/** MSW matches absolute paths with a wildcard host, so the same handlers work under any base path. */
export const API = '*/api';

export const langOf = (request: Request): Lang => {
  const header = request.headers.get('Accept-Language')?.slice(0, 2);
  return (LANGS as readonly string[]).includes(header ?? '') ? (header as Lang) : 'en';
};

export const fail = (status: number, code: string, details?: unknown) =>
  HttpResponse.json<ApiErrorBody>({ code, ...(details === undefined ? {} : { details }) }, { status });

export const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : undefined);

export const num = (value: string | null) => {
  if (value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
