import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/lib/benchmarks/**/*.bench.{ts,tsx}'],
    environment: 'jsdom',
    reporters: ['json'],
    globals: true,
    setupFiles: ['./src/lib/benchmarks/setup.ts'],
    env: {
      NODE_ENV: 'test'
    }
  }
});
