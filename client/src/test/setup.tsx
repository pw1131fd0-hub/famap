import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import * as React from 'react';

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
  MapContainer: ({ children }: MockComponentProps) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
  Marker: ({ children }: MockComponentProps) => <div>{children}</div>,
  Popup: ({ children }: MockComponentProps) => <div>{children}</div>,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 13),
    getCenter: vi.fn(() => ({ lat: 25.0330, lng: 121.5654 })),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

vi.mock('react-leaflet-cluster', () => ({
  default: ({ children }: MockComponentProps) => <div>{children}</div>,
}));
