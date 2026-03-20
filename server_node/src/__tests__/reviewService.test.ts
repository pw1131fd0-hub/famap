import { describe, it, expect, beforeEach } from 'vitest';
import { ReviewService } from '../services/reviewService.js';
import { mockReviews } from '../data/seed-data.js';

describe('ReviewService', () => {
  const originalReviews = [...mockReviews];

  beforeEach(() => {
    mockReviews.length = 0;
    mockReviews.push(...originalReviews);
  });

  describe('create', () => {
    it('should use fallback userId and userName when not provided', async () => {
      const review = await ReviewService.create('1', {
        rating: 4,
        comment: 'Good place',
      });
      expect(review.userId).toMatch(/^u-/);
      expect(review.userName).toBe('Anonymous');
    });

    it('should use provided userId and userName', async () => {
      const review = await ReviewService.create('1', {
        rating: 5,
        comment: 'Excellent!',
        userId: 'u-custom',
        userName: 'Custom User',
      });
      expect(review.userId).toBe('u-custom');
      expect(review.userName).toBe('Custom User');
    });
  });
});
