import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      NEXT_PUBLIC_BACKEND_URL: 'http://localhost:1337',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    },
    include: [
      'src/lib/tests/**/*.test.ts',
      'src/lib/testing/**/*.test.ts',
      'src/lib/api/__tests__/payload-schema.test.ts',
      'src/lib/api/__tests__/url-handling.test.ts',
      'src/lib/monitoring/__tests__/service.test.ts',
    ],
    exclude: ['node_modules', '.next'],
  },
});
