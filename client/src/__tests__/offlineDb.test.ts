import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock idb before importing offlineDb
vi.mock('idb', () => {
  interface MockStoreValue {
    id?: string;
    key?: string;
  }

  interface UpgradeHandler {
    (db: { objectStoreNames: { contains: () => boolean }; createObjectStore: () => { createIndex: () => void } }): void;
  }

  interface MockDBUpgradeEvent {
    upgrade?: UpgradeHandler;
  }

  const mockStore = new Map<string, MockStoreValue>();
  const mockMeta = new Map<string, MockStoreValue>();

  const makeStore = (map: Map<string, MockStoreValue>) => ({
    put: vi.fn(async (value: MockStoreValue) => { map.set(value.id ?? value.key ?? '', value); }),
    get: vi.fn(async (key: string) => map.get(key)),
    getAll: vi.fn(async () => [...map.values()]),
    clear: vi.fn(async () => map.clear()),
  });

  const locationStore = makeStore(mockStore);
  const metaStore = makeStore(mockMeta);

  return {
    openDB: vi.fn(async (_name: string, _version: number, config: MockDBUpgradeEvent) => {
      const db = {
        objectStoreNames: { contains: () => false },
        createObjectStore: vi.fn(() => ({
          createIndex: vi.fn(),
        })),
        transaction: vi.fn(() => ({
          objectStore: vi.fn((name: string) => {
            if (name === 'locations') return locationStore;
            return metaStore;
          }),
          done: Promise.resolve(),
        })),
        get: vi.fn(async (store: string, key: string) => {
          if (store === 'meta') return mockMeta.get(key);
          return mockStore.get(key);
        }),
        getAll: vi.fn(async () => [...mockStore.values()]),
      };
      if (config.upgrade) config.upgrade(db);
      return db;
    }),
  };
});

import { saveLocations, loadLocations, clearOfflineDb, isOfflineCacheAvailable } from '../services/offlineDb';
import type { Location } from '../types';

const mockLocation: Location = {
  id: 'test-1',
  name: { zh: '大安森林公園', en: 'Daan Forest Park' },
  description: { zh: '測試地點', en: 'Test location' },
  category: 'park',
  coordinates: { lat: 25.03, lng: 121.54 },
  address: { zh: '台北市', en: 'Taipei' },
  facilities: ['changing_table'],
  averageRating: 4.5,
};

describe('offlineDb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saveLocations does not throw', async () => {
    await expect(saveLocations('test-key', [mockLocation])).resolves.toBeUndefined();
  });

  it('loadLocations returns null when no data cached', async () => {
    const result = await loadLocations('missing-key');
    expect(result).toBeNull();
  });

  it('clearOfflineDb does not throw', async () => {
    await expect(clearOfflineDb()).resolves.toBeUndefined();
  });

  it('isOfflineCacheAvailable returns false when no meta exists', async () => {
    const result = await isOfflineCacheAvailable('missing-key');
    expect(result).toBe(false);
  });
});
