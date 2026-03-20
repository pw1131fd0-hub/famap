import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
  Marker: ({ children }: any) => <div>{children}</div>,
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 13),
    getCenter: vi.fn(() => ({ lat: 25.0330, lng: 121.5654 })),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

vi.mock('react-leaflet-cluster', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
