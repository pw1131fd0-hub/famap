import '@testing-library/jest-dom';
import { vi, afterEach, beforeEach } from 'vitest';

// Ensure localStorage and sessionStorage are available
beforeEach(() => {
  if (typeof global !== 'undefined' && !global.localStorage) {
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => Object.keys(store).forEach(key => delete store[key]),
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;
  }
  if (typeof global !== 'undefined' && !global.sessionStorage) {
    const store: Record<string, string> = {};
    global.sessionStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => Object.keys(store).forEach(key => delete store[key]),
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;
  }
});

// Global cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  try {
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
  } catch {
    // Ignore errors if localStorage is not available
  }
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.clear) {
      sessionStorage.clear();
    }
  } catch {
    // Ignore errors if sessionStorage is not available
  }
});
