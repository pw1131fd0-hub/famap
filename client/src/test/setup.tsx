import '@testing-library/jest-dom';
import { vi, afterEach, beforeEach } from 'vitest';
import * as React from 'react';

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
  // Clear all mocks
  vi.clearAllMocks();
  // Clear all timers
  vi.clearAllTimers();
  // Clear localStorage (with safe guard)
  try {
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
  } catch {
    // Ignore errors if localStorage is not available
  }
  // Clear sessionStorage (with safe guard)
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.clear) {
      sessionStorage.clear();
    }
  } catch {
    // Ignore errors if sessionStorage is not available
  }
});

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    create: vi.fn().mockReturnThis(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    }
  };
});

// Mock Leaflet as it doesn't work in JSDOM well
vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(() => ({})),
    divIcon: vi.fn(() => ({})),
    map: vi.fn(() => ({
      setView: vi.fn(),
      remove: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn(),
      bindPopup: vi.fn(),
    })),
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
  },
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: vi.fn(),
    },
  },
}));

interface MockComponentProps {
  children?: React.ReactNode;
}

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: MockComponentProps) => React.createElement('div', null, children),
  TileLayer: () => React.createElement('div', null, 'TileLayer'),
  Marker: ({ children }: MockComponentProps) => React.createElement('div', null, children),
  Popup: ({ children }: MockComponentProps) => React.createElement('div', null, children),
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 13),
    getCenter: vi.fn(() => ({ lat: 25.0330, lng: 121.5654 })),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

vi.mock('react-leaflet-cluster', () => ({
  default: ({ children }: MockComponentProps) => React.createElement('div', null, children),
}));
