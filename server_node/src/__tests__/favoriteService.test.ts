import { describe, it, expect, beforeEach } from 'vitest';
import { FavoriteService } from '../services/favoriteService.js';
import { mockFavorites, mockLocations } from '../data/seed-data.js';

describe('FavoriteService', () => {
  beforeEach(() => {
    mockFavorites.length = 0;
  });

  describe('addFavorite', () => {
    it('should return null if location does not exist', async () => {
      const result = await FavoriteService.addFavorite({ userId: 'u1', locationId: '999' });
      expect(result).toBeNull();
    });

    it('should return existing favorite if already favorited', async () => {
      const fav = { id: 'f1', userId: 'u1', locationId: '1', createdAt: '...' };
      mockFavorites.push(fav);
      const result = await FavoriteService.addFavorite({ userId: 'u1', locationId: '1' });
      expect(result).toEqual(fav);
    });
  });

  describe('removeFavorite', () => {
    it('should return false if favorite does not exist', async () => {
      const result = await FavoriteService.removeFavorite('u1', '1');
      expect(result).toBe(false);
    });
  });
});
