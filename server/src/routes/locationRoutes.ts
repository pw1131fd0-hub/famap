import { Router } from 'express';
import { LocationController } from '../controllers/locationController.js';
import { ReviewController } from '../controllers/reviewController.js';

const router = Router();

// /api/locations
router.get('/', LocationController.getNearby);
router.get('/:id', LocationController.getById);

// Reviews
router.get('/:id/reviews', ReviewController.getReviews);
router.post('/:id/reviews', ReviewController.createReview);

export default router;
