import { describe, it, expect, vi, beforeEach } from 'vitest';
import { locationApi, reviewApi, favoriteApi } from '../services/api';
import axios from 'axios';
import type { LocationCreateDTO, ReviewCreateDTO } from '../types';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    create: vi.fn().mockReturnThis(),
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
      expect(axiosInstance.get).toHaveBeenCalledWith('/locations/1/');
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
      expect(axiosInstance.get).toHaveBeenCalledWith('/locations/1/reviews');
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
});
