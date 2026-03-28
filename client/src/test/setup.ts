import { vi, afterEach, beforeEach } from 'vitest';

// Setup global storage implementations for Node.js environment
beforeEach(() => {
  const createStorageImpl = (): Storage => {
    const store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;
  };

  if (typeof (global as any).localStorage === 'undefined') {
    (global as any).localStorage = createStorageImpl();
  }
  if (typeof (global as any).sessionStorage === 'undefined') {
    (global as any).sessionStorage = createStorageImpl();
  }
});

// Global cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();

  try {
    if ((global as any).localStorage?.clear) {
      (global as any).localStorage.clear();
    }
  } catch {
    // Ignore errors
  }

  try {
    if ((global as any).sessionStorage?.clear) {
      (global as any).sessionStorage.clear();
    }
  } catch {
    // Ignore errors
  }
});
