import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.ts';
import { ReviewService } from '../services/reviewService.ts';

vi.mock('../services/reviewService.ts', () => ({
  ReviewService: {
    findByLocationId: vi.fn(),
    create: vi.fn(),
  }
}));

describe('Review API Errors', () => {
  it('should return 500 if ReviewService.findByLocationId throws', async () => {
    vi.mocked(ReviewService.findByLocationId).mockRejectedValue(new Error('DB Error'));
    const res = await request(app).get('/api/locations/1/reviews');
    expect(res.status).toBe(500);
  });

  it('should return 500 if ReviewService.create throws', async () => {
    vi.mocked(ReviewService.create).mockRejectedValue(new Error('DB Error'));
    const res = await request(app).post('/api/locations/1/reviews').send({ rating: 5, comment: 'ok' });
    expect(res.status).toBe(500);
  });
});
