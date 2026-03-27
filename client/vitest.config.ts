import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    env: {
      NODE_ENV: 'development'
    },
    testTimeout: 15000,
    hookTimeout: 5000,
    isolate: true,
    threads: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'src/test/**', '**/*.test.tsx']
    },
    deps: {
      inline: ['react-leaflet-cluster']
    }
  }
});
