import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node', // Default: node for utilities. Use '// @vitest-env jsdom' in .test.tsx files that need DOM
    setupFiles: ['./src/test/setup.ts'],
    env: {
      NODE_ENV: 'test'
    },
    testTimeout: 30000,
    hookTimeout: 20000,
    isolatedModuleTimeout: 150000,
    teardownTimeout: 20000,
    // Optimized for many test files
    threads: false,
    isolate: false,
    singleThread: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'src/test/**', '**/*.test.tsx']
    },
    bail: 0,
    maxConcurrency: 1,
  }
});
