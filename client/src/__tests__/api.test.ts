import { describe, it, expect, vi, beforeEach } from 'vitest';
import { locationApi, reviewApi, favoriteApi, circuitBreakerUtils } from '../services/api';
import axios from 'axios';
import type { LocationCreateDTO, ReviewCreateDTO } from '../types';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    create: vi.fn().mockReturnThis(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
      request: {
        use: vi.fn(),
      },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    }
  };
});

describe('API Services', () => {
  const axiosInstance = axios.create();

  beforeEach(() => {
    vi.clearAllMocks();
    circuitBreakerUtils.reset();
  });

  describe('locationApi', () => {
    it('getNearby calls axios get', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });
      await locationApi.getNearby({ lat: 0, lng: 0, radius: 1000 });
      expect(axiosInstance.get).toHaveBeenCalledWith('/locations/', expect.anything());
    });

    it('getById calls axios get', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: {} });
      await locationApi.getById('1');
      const calls = vi.mocked(axiosInstance.get).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0]).toBe('/locations/1/');
    });

    it('create calls axios post', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: {} });
      const location: LocationCreateDTO = {
        name: { zh: 'Test', en: 'Test' },
        description: { zh: 'Test', en: 'Test' },
        category: 'park',
        coordinates: { lat: 0, lng: 0 },
        address: { zh: 'Test', en: 'Test' },
        facilities: [],
      };
      await locationApi.create(location);
      expect(axiosInstance.post).toHaveBeenCalledWith('/locations/', location);
    });
  });

  describe('reviewApi', () => {
    it('getByLocationId calls axios get', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });
      await reviewApi.getByLocationId('1');
      const calls = vi.mocked(axiosInstance.get).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0]).toBe('/locations/1/reviews');
    });

    it('create calls axios post', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: {} });
      const review: ReviewCreateDTO = {
        rating: 5,
        comment: 'Test',
        userName: 'Test User',
      };
      await reviewApi.create('1', review);
      expect(axiosInstance.post).toHaveBeenCalledWith('/locations/1/reviews', review);
    });
  });

  describe('favoriteApi', () => {
    it('getFavorites calls axios get', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });
      await favoriteApi.getFavorites('u1');
      expect(axiosInstance.get).toHaveBeenCalledWith('/favorites', expect.anything());
    });

    it('add calls axios post', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: {} });
      await favoriteApi.add('u1', 'l1');
      expect(axiosInstance.post).toHaveBeenCalledWith('/favorites', { userId: 'u1', locationId: 'l1' });
    });

    it('remove calls axios delete', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({ data: {} });
      await favoriteApi.remove('u1', 'l1');
      expect(axiosInstance.delete).toHaveBeenCalledWith('/favorites', expect.anything());
    });

    it('check calls axios get', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { isFavorited: true } });
      const result = await favoriteApi.check('u1', 'l1');
      expect(result).toBe(true);
      expect(axiosInstance.get).toHaveBeenCalledWith('/favorites/check', expect.anything());
    });
  });

  describe('Error Handling', () => {
    it('handles getNearby network errors', async () => {
      const error = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(error);
      await expect(locationApi.getNearby({ lat: 0, lng: 0, radius: 1000 })).rejects.toThrow();
    });

    it('handles create location errors', async () => {
      const error = new Error('Validation error');
      vi.mocked(axiosInstance.post).mockRejectedValue(error);
      const location: LocationCreateDTO = {
        name: { zh: 'Test', en: 'Test' },
        description: { zh: 'Test', en: 'Test' },
        category: 'park',
        coordinates: { lat: 0, lng: 0 },
        address: { zh: 'Test', en: 'Test' },
        facilities: [],
      };
      await expect(locationApi.create(location)).rejects.toThrow();
    });

    it('handles review creation errors', async () => {
      const error = new Error('Review creation failed');
      vi.mocked(axiosInstance.post).mockRejectedValue(error);
      const review: ReviewCreateDTO = {
        rating: 5,
        comment: 'Test',
        userName: 'Test User',
      };
      await expect(reviewApi.create('1', review)).rejects.toThrow();
    });

    it('handles favorite retrieval errors', async () => {
      const error = new Error('Favorites fetch failed');
      vi.mocked(axiosInstance.get).mockRejectedValue(error);
      await expect(favoriteApi.getFavorites('u1')).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty location list response', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });
      const result = await locationApi.getNearby({ lat: 25.0, lng: 121.5, radius: 100 });
      expect(result).toEqual([]);
    });

    it('handles null coordinates in getNearby', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });
      await locationApi.getNearby({ lat: 0, lng: 0, radius: 0 });
      expect(axiosInstance.get).toHaveBeenCalled();
    });

    it('handles very large radius in getNearby', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });
      await locationApi.getNearby({ lat: 0, lng: 0, radius: 1000000 });
      expect(axiosInstance.get).toHaveBeenCalledWith('/locations/', expect.anything());
    });

    it('handles empty favorites list', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });
      const result = await favoriteApi.getFavorites('u1');
      expect(result).toEqual([]);
    });

    it('handles review with empty comment', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: {} });
      const review: ReviewCreateDTO = {
        rating: 5,
        comment: '',
        userName: 'Test User',
      };
      await reviewApi.create('1', review);
      expect(axiosInstance.post).toHaveBeenCalled();
    });

    it('handles review with minimum rating', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: {} });
      const review: ReviewCreateDTO = {
        rating: 1,
        comment: 'Not great',
        userName: 'Test User',
      };
      await reviewApi.create('1', review);
      expect(axiosInstance.post).toHaveBeenCalled();
    });

    it('handles review with maximum rating', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: {} });
      const review: ReviewCreateDTO = {
        rating: 5,
        comment: 'Perfect!',
        userName: 'Test User',
      };
      await reviewApi.create('1', review);
      expect(axiosInstance.post).toHaveBeenCalled();
    });

    it('handles location with minimal data', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: {} });
      const location: LocationCreateDTO = {
        name: { zh: 'A', en: 'A' },
        description: { zh: 'B', en: 'B' },
        category: 'park',
        coordinates: { lat: 0, lng: 0 },
        address: { zh: 'C', en: 'C' },
        facilities: [],
      };
      await locationApi.create(location);
      expect(axiosInstance.post).toHaveBeenCalled();
    });

    it('handles check favorite with false result', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { isFavorited: false } });
      const result = await favoriteApi.check('u1', 'l1');
      expect(result).toBe(false);
    });
  });

  describe('Circuit Breaker', () => {
    beforeEach(() => {
      circuitBreakerUtils.reset();
    });

    it('tracks circuit breaker state', () => {
      circuitBreakerUtils.reset();
      const states = circuitBreakerUtils.getAllStates();
      expect(states).toHaveLength(0);
    });

    it('resets individual endpoint circuit breaker', () => {
      circuitBreakerUtils.reset('/test/endpoint');
      expect(circuitBreakerUtils.isOpen('/test/endpoint')).toBe(false);
    });

    it('resets all circuit breakers', () => {
      circuitBreakerUtils.reset();
      const states = circuitBreakerUtils.getAllStates();
      expect(states).toHaveLength(0);
    });

    it('provides circuit breaker state information', () => {
      const state = circuitBreakerUtils.getState('/api/locations');
      expect(state === undefined || state).toBe(true);
    });
  });
});
