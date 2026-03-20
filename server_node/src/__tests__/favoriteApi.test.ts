import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { mockFavorites } from '../data/seed-data.js';

describe('Favorite API', () => {
  beforeEach(() => {
    mockFavorites.length = 0;
  });

  describe('GET /api/favorites', () => {
    it('should return favorites for a user', async () => {
      mockFavorites.push({ id: 'f1', userId: 'u1', locationId: '1', createdAt: new Date().toISOString() });
      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', 'Bearer mock-token-u1');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/favorites');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/favorites', () => {
    it('should add a favorite', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({ locationId: '2' });
      
      expect(res.status).toBe(201);
      expect(res.body.userId).toBe('u1');
      expect(res.body.locationId).toBe('2');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/favorites', () => {
    it('should remove a favorite', async () => {
      mockFavorites.push({ id: 'f1', userId: 'u1', locationId: '1', createdAt: new Date().toISOString() });
      const res = await request(app)
        .delete('/api/favorites')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({ locationId: '1' });

      expect(res.status).toBe(204);
      expect(mockFavorites.length).toBe(0);
    });

    it('should return 400 if locationId is missing', async () => {
      const res = await request(app)
        .delete('/api/favorites')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 404 if favorite does not exist', async () => {
      const res = await request(app)
        .delete('/api/favorites')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({ locationId: 'non-existent-id' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/favorites/check', () => {
    it('should return isFavorited: true if favorited', async () => {
      mockFavorites.push({ id: 'f1', userId: 'u1', locationId: '1', createdAt: new Date().toISOString() });
      const res = await request(app)
        .get('/api/favorites/check')
        .set('Authorization', 'Bearer mock-token-u1')
        .query({ locationId: '1' });
      
      expect(res.status).toBe(200);
      expect(res.body.isFavorited).toBe(true);
    });

    it('should return isFavorited: false if not favorited', async () => {
      const res = await request(app)
        .get('/api/favorites/check')
        .set('Authorization', 'Bearer mock-token-u1')
        .query({ locationId: '1' });

      expect(res.status).toBe(200);
      expect(res.body.isFavorited).toBe(false);
    });

    it('should return 400 if locationId is missing', async () => {
      const res = await request(app)
        .get('/api/favorites/check')
        .set('Authorization', 'Bearer mock-token-u1');
      expect(res.status).toBe(400);
    });
  });
});