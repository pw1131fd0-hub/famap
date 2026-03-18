import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.ts';
import { mockReviews } from '../data/seed-data.ts';

describe('Review API', () => {
  const originalReviews = [...mockReviews];

  beforeEach(() => {
    mockReviews.length = 0;
    mockReviews.push(...originalReviews);
  });

  describe('GET /api/locations/:id/reviews', () => {
    it('should return reviews for a location', async () => {
      const res = await request(app).get('/api/locations/1/reviews');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return empty array for location with no reviews', async () => {
      const res = await request(app).get('/api/locations/999/reviews');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/locations/:id/reviews', () => {
    it('should create a new review', async () => {
      const newReview = {
        rating: 5,
        comment: 'Great place!',
      };

      const res = await request(app)
        .post('/api/locations/1/reviews')
        .set('Authorization', 'Bearer mock-token-u1')
        .send(newReview);
      
      expect(res.status).toBe(201);
      expect(res.body.rating).toBe(5);
      expect(res.body.comment).toBe('Great place!');
    });

    it('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .post('/api/locations/1/reviews')
        .send({ rating: 5, comment: 'test' });
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent location', async () => {
      const newReview = {
        rating: 5,
        comment: 'Great place!',
      };

      const res = await request(app)
        .post('/api/locations/999/reviews')
        .set('Authorization', 'Bearer mock-token-u1')
        .send(newReview);
      
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/locations/1/reviews')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({ rating: 5 });
      
      expect(res.status).toBe(400);
    });
  });
});
