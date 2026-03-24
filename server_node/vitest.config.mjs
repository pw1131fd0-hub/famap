export default {
  test: {
    globals: true,
    environment: 'node',
    pool: 'threads',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
  }
};
