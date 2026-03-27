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
    testTimeout: 30000,
    hookTimeout: 10000,
    threads: false,
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
