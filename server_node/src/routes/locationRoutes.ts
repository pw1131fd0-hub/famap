import { Router } from 'express';
import { LocationController } from '../controllers/locationController.js';
import { ReviewController } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', LocationController.getNearby);
router.get('/:id', LocationController.getById);
router.post('/', authMiddleware, LocationController.create);
router.patch('/:id', authMiddleware, LocationController.update);

// Review routes nested under locations
router.get('/:id/reviews', ReviewController.getReviews);
router.post('/:id/reviews', authMiddleware, ReviewController.createReview);

export default router;