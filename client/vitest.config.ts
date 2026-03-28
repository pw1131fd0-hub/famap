import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    env: {
      NODE_ENV: 'test'
    },
    testTimeout: 25000,
    hookTimeout: 15000,
    isolatedModuleTimeout: 120000,
    teardownTimeout: 15000,
    // Vitest 4.1 compatible pool configuration
    threads: true,
    isolate: true,
    maxThreads: 2, // Reduce from 4 to prevent resource exhaustion
    minThreads: 1,
    maxWorkers: 2,
    singleThread: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'src/test/**', '**/*.test.tsx']
    },
    // Improved test execution strategy
    testNamePattern: undefined,
    bail: 0, // Run all tests even if some fail
    maxConcurrency: 2,
  }
});
