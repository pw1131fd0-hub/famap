import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 5000,
    isolatedModuleTimeout: 5000,
  }
});
