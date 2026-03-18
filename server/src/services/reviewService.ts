import { mockReviews } from '../data/seed-data.js';
import type { Review, ReviewCreateDTO } from '../types/review.js';

export class ReviewService {
  private static reviews: Review[] = [...mockReviews];

  static async findByLocationId(locationId: string): Promise<Review[]> {
    return this.reviews.filter((r) => r.locationId === locationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async create(locationId: string, dto: ReviewCreateDTO): Promise<Review> {
    const newReview: Review = {
      id: Math.random().toString(36).substring(2, 11),
      locationId,
      userId: 'u-' + Math.random().toString(36).substring(2, 5),
      userName: dto.userName || 'Anonymous',
      rating: dto.rating,
      comment: dto.comment,
      createdAt: new Date().toISOString(),
    };

    if (dto.photos) {
      newReview.photos = dto.photos;
    }

    this.reviews.push(newReview);
    return newReview;
  }
}
