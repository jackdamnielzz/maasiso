import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  root: './frontend',
  envDir: './frontend',
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/lib/benchmarks/setup.ts'],
    include: [
      '**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.bench.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },
  },
});
