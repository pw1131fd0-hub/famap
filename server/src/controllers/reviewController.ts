import type { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService.ts';
import { LocationService } from '../services/locationService.ts';

export class ReviewController {
  static async getReviews(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Location ID is required' });
      }
      const reviews = await ReviewService.findByLocationId(id as string);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  static async createReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rating, comment, userName } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Location ID is required' });
      }

      if (!rating || !comment) {
        return res.status(400).json({ error: 'Rating and comment are required' });
      }

      const location = await LocationService.findById(id as string);
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }

      const review = await ReviewService.create(id as string, { rating, comment, userName });
      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }
}
