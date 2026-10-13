import type { ApiErrorBody, Lang } from './contracts';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? body.code);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/** Session-level request context, set by the app layer (language from URL, token from session store). */
const context: { lang: Lang; token: string | null } = { lang: 'ru', token: null };

export const setApiLanguage = (lang: Lang) => {
  context.lang = lang;
};
export const setApiToken = (token: string | null) => {
  context.token = token;
};

type QueryValue = string | number | boolean | undefined | null | readonly (string | number)[];

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export const buildQuery = (query: Record<string, QueryValue> = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

/** All requests go to <base>/api/* — intercepted by the MSW service worker on GitHub Pages. */
export const apiUrl = (path: string) =>
  new URL(`${import.meta.env.BASE_URL}api${path}`, window.location.origin).href;

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, headers = {}, signal } = options;
  let response: Response;
  try {
    response = await fetch(apiUrl(path) + buildQuery(query), {
      method,
      signal: signal ?? null,
      headers: {
        Accept: 'application/json',
        'Accept-Language': context.lang,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(context.token ? { Authorization: `Bearer ${context.token}` } : {}),
        ...headers,
      },
      body: body === undefined ? null : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, { code: 'NETWORK_ERROR' });
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({ code: 'UNKNOWN' }))) as ApiErrorBody;
    throw new ApiError(response.status, errorBody);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
