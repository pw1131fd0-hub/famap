import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, FavoriteController.getFavorites);
router.get('/check', authMiddleware, FavoriteController.isFavorited);
router.post('/', authMiddleware, FavoriteController.addFavorite);
router.delete('/', authMiddleware, FavoriteController.removeFavorite);

export default router;
