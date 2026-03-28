import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test'
    },
    testTimeout: 60000,
    hookTimeout: 40000,
    isolatedModuleTimeout: 300000,
    teardownTimeout: 40000,
    // Optimized for many test files - reduce parallelization to prevent pool timeout
    threads: false, // Disable threading to avoid worker pool initialization overhead
    isolate: false, // Run tests in same process to avoid isolation overhead
    singleThread: true, // Explicit single-threaded mode
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'src/test/**', '**/*.test.tsx']
    },
    // Sequential test execution prevents pool exhaustion with 76 test files
    bail: 0, // Run all tests even if some fail
    maxConcurrency: 1, // Run tests sequentially
  }
});
