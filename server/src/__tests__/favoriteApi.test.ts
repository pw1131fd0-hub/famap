import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.ts';
import { mockFavorites } from '../data/seed-data.ts';

describe('Favorite API', () => {
  beforeEach(() => {
    mockFavorites.length = 0;
  });

  describe('GET /api/favorites', () => {
    it('should return 400 if userId is missing', async () => {
      const res = await request(app).get('/api/favorites');
      expect(res.status).toBe(400);
    });

    it('should return favorites for a user', async () => {
      mockFavorites.push({ id: 'f1', userId: 'u1', locationId: '1', createdAt: new Date().toISOString() });
      const res = await request(app).get('/api/favorites').query({ userId: 'u1' });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe('POST /api/favorites', () => {
    it('should add a favorite', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .send({ userId: 'u1', locationId: '2' });
      
      expect(res.status).toBe(201);
      expect(res.body.userId).toBe('u1');
      expect(res.body.locationId).toBe('2');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/favorites').send({ userId: 'u1' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/favorites', () => {
    it('should remove a favorite', async () => {
      mockFavorites.push({ id: 'f1', userId: 'u1', locationId: '1', createdAt: new Date().toISOString() });
      const res = await request(app)
        .delete('/api/favorites')
        .send({ userId: 'u1', locationId: '1' });
      
      expect(res.status).toBe(204);
      expect(mockFavorites.length).toBe(0);
    });
  });

  describe('GET /api/favorites/check', () => {
    it('should return isFavorited: true if favorited', async () => {
      mockFavorites.push({ id: 'f1', userId: 'u1', locationId: '1', createdAt: new Date().toISOString() });
      const res = await request(app).get('/api/favorites/check').query({ userId: 'u1', locationId: '1' });
      expect(res.status).toBe(200);
      expect(res.body.isFavorited).toBe(true);
    });

    it('should return isFavorited: false if not favorited', async () => {
      const res = await request(app).get('/api/favorites/check').query({ userId: 'u1', locationId: '1' });
      expect(res.status).toBe(200);
      expect(res.body.isFavorited).toBe(false);
    });
  });
});
