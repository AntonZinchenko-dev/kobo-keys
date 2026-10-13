import { queryOptions } from '@tanstack/react-query';

import { api, type BuilderOptions, type Lang } from '@/shared/api';

export const builderOptionsQuery = (lang: Lang) =>
  queryOptions({
    queryKey: ['builder', 'options', lang],
    queryFn: ({ signal }) => api<BuilderOptions>('/builder/options', { signal }),
    staleTime: Infinity,
  });
