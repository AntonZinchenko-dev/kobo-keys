import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Tests and stories live next to the code they cover; they are not part of the public API.
    ignores: ['**/*.test.ts', '**/*.test.tsx'],
  },
]);
