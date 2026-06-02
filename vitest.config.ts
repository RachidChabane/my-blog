import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{ts,js}'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
