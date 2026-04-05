/**
 * Tests for newly added API client methods: fuzzySearch and getTrending.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios at module level
vi.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      response: { use: vi.fn() },
      request: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
  };
  mockInstance.create = vi.fn(() => mockInstance);
  return { default: mockInstance };
});

// Mock offlineDb
vi.mock('../services/offlineDb', () => ({
  saveLocations: vi.fn(),
  loadLocations: vi.fn().mockResolvedValue(null),
  clearOfflineDb: vi.fn(),
}));

import axios from 'axios';
import { locationApi, cacheUtils } from '../services/api';

const mockAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  interceptors: { response: { use: ReturnType<typeof vi.fn> }; request: { use: ReturnType<typeof vi.fn> } };
};

const mockLocations = [
  {
    id: '1',
    name: { zh: '大安森林公園', en: 'Daan Forest Park' },
    category: 'park',
    coordinates: { lat: 25.03, lng: 121.53 },
    address: { zh: '台北市大安區', en: 'Daan, Taipei' },
    facilities: ['stroller_accessible'],
    averageRating: 4.8,
    description: { zh: '測試', en: 'Test' },
  },
];

describe('locationApi.fuzzySearch', () => {
  beforeEach(() => {
    cacheUtils.clear();
    vi.clearAllMocks();
    mockAxios.interceptors.response.use.mockImplementation(() => {});
  });

  it('calls fuzzy-search endpoint', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: mockLocations });
    const result = await locationApi.fuzzySearch({ q: '大安' });
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/locations/fuzzy-search',
      expect.objectContaining({ params: expect.objectContaining({ q: '大安' }) })
    );
    expect(result).toEqual(mockLocations);
  });

  it('supports category filter', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] });
    await locationApi.fuzzySearch({ q: 'park', category: 'park', limit: 5 });
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/locations/fuzzy-search',
      expect.objectContaining({ params: expect.objectContaining({ category: 'park', limit: 5 }) })
    );
  });
});

describe('locationApi.getTrending', () => {
  beforeEach(() => {
    cacheUtils.clear();
    vi.clearAllMocks();
    mockAxios.interceptors.response.use.mockImplementation(() => {});
  });

  it('calls trending endpoint without params', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: mockLocations });
    const result = await locationApi.getTrending();
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/locations/trending',
      expect.anything()
    );
    expect(result).toEqual(mockLocations);
  });

  it('calls trending endpoint with coordinates', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: mockLocations });
    await locationApi.getTrending({ lat: 25.03, lng: 121.53, limit: 5 });
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/locations/trending',
      expect.objectContaining({ params: expect.objectContaining({ lat: 25.03, lng: 121.53 }) })
    );
  });
});
