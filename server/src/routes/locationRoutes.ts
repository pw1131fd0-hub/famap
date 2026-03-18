import { Router } from 'express';
import { LocationController } from '../controllers/locationController.ts';
import { ReviewController } from '../controllers/reviewController.ts';

const router = Router();

// /api/locations
router.get('/', LocationController.getNearby);
router.post('/', LocationController.create);
router.get('/:id', LocationController.getById);
router.patch('/:id', LocationController.update);

// Reviews
router.get('/:id/reviews', ReviewController.getReviews);
router.post('/:id/reviews', ReviewController.createReview);

export default router;
