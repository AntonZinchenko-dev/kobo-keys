/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * GitHub Pages serves the project from https://<user>.github.io/<repo>/,
 * so every asset path must be prefixed with the repo name.
 * Override with BASE_PATH=/ for a custom domain or local preview at the root.
 */
const base = process.env.BASE_PATH ?? '/kobo-keys/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mocks': fileURLToPath(new URL('./mocks', import.meta.url)),
    },
  },
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
  build: {
    target: 'es2022',
    cssTarget: ['chrome111', 'safari16.4', 'firefox128'],
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app-[hash].js',
        // Each page is its own lazily loaded chunk: assets/page-<name>-<hash>.js
        chunkFileNames: (chunk) => {
          const page = /src\/pages\/([^/]+)\//.exec(chunk.facadeModuleId ?? '')?.[1];
          return page ? `assets/page-${page}-[hash].js` : 'assets/[name]-[hash].js';
        },
        // Vendor code in long-lived chunks: app updates don't invalidate the browser cache for libraries.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'react';
          if (/@tanstack|zustand/.test(id)) return 'query';
          if (/i18next|intl-messageformat|@formatjs/.test(id)) return 'i18n';
          if (/react-hook-form|@hookform|zod/.test(id)) return 'forms';
          if (
            /msw|@mswjs|idb-keyval|outvariant|strict-event-emitter|headers-polyfill|graphql|cookie|tough-cookie/.test(
              id,
            )
          )
            return 'mocks';
          return 'vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'mocks/**/*.test.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'mocks/**/*.ts'],
      exclude: ['**/*.test.*', '**/index.ts', 'src/app/index.tsx'],
      reporter: ['text-summary', 'html', 'json-summary'],
    },
  },
});
