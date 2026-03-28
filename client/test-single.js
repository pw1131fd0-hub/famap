import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    env: {
      NODE_ENV: 'test'
    },
    threads: false,
    isolate: false,
    singleThread: true,
  }
});
