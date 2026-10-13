import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results', 'public/mockServiceWorker.js'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked, jsxA11y.flatConfigs.recommended],
    files: ['src/**/*.{ts,tsx}', 'mocks/**/*.ts', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: { project: ['./tsconfig.app.json'], tsconfigRootDir: import.meta.dirname },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'simple-import-sort/imports': [
        'error',
        {
          // external → @mocks → FSD layers top-down → relative → styles
          groups: [
            ['^react', '^@?\\w'],
            ['^@mocks'],
            ['^@/app', '^@/pages', '^@/widgets', '^@/features', '^@/entities', '^@/shared'],
            ['^\\.'],
            ['\\.css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*/*/*/**', '!@/shared/**'],
              message: 'Import slices only through their public API (index.ts).',
            },
          ],
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      'react-hooks/set-state-in-effect': 'off',
      // Scrollable carousels are focusable regions so keyboard users can scroll them
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'], tags: [] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // The mock backend is a tiny in-memory database: dynamic keys are its nature.
    files: ['mocks/**/*.ts'],
    rules: { '@typescript-eslint/no-dynamic-delete': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['scripts/**/*.{ts,mjs}', 'e2e/**/*.ts', '*.config.{ts,js}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
