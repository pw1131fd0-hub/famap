import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    env: {
      NODE_ENV: 'test'
    },
    testTimeout: 10000,
    hookTimeout: 5000,
    threads: true,
    maxThreads: 1,
    minThreads: 1,
    singleThread: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'src/test/**', '**/*.test.tsx']
    }
  }
});
