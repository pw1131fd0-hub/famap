import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { FavoriteService } from '../services/favoriteService.js';
import { AuthService } from '../services/authService.js';

vi.mock('../services/favoriteService.js', () => ({
  FavoriteService: {
    getFavorites: vi.fn(),
    isFavorited: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  }
}));

vi.mock('../services/authService.js', () => ({
  AuthService: {
    getMe: vi.fn().mockResolvedValue({ id: 'u1', displayName: 'Test User' }),
  }
}));

describe('Favorite API Errors', () => {
  it('should return 500 if FavoriteService.getFavorites throws', async () => {
    vi.mocked(FavoriteService.getFavorites).mockRejectedValue(new Error('DB Error'));
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', 'Bearer mock-token');
    expect(res.status).toBe(500);
  });

  it('should return 500 if FavoriteService.addFavorite throws', async () => {
    vi.mocked(FavoriteService.addFavorite).mockRejectedValue(new Error('DB Error'));
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', 'Bearer mock-token')
      .send({ locationId: '1' });
    expect(res.status).toBe(500);
  });

  it('should return 500 if FavoriteService.isFavorited throws', async () => {
    vi.mocked(FavoriteService.isFavorited).mockRejectedValue(new Error('DB Error'));
    const res = await request(app)
      .get('/api/favorites/check')
      .query({ locationId: '1' })
      .set('Authorization', 'Bearer mock-token');
    expect(res.status).toBe(500);
  });
});
