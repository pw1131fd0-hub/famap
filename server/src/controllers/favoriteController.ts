import type { Request, Response } from 'express';
import { FavoriteService } from '../services/favoriteService.ts';

export class FavoriteController {
  static async getFavorites(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const favorites = await FavoriteService.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addFavorite(req: Request, res: Response) {
    try {
      const { userId, locationId } = req.body;
      if (!userId || !locationId) {
        return res.status(400).json({ error: 'userId and locationId are required' });
      }

      const favorite = await FavoriteService.addFavorite({ userId, locationId });
      if (!favorite) {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async removeFavorite(req: Request, res: Response) {
    try {
      const { userId, locationId } = req.body;
      if (!userId || !locationId) {
        return res.status(400).json({ error: 'userId and locationId are required' });
      }

      const success = await FavoriteService.removeFavorite(userId, locationId);
      if (!success) {
        return res.status(404).json({ error: 'Favorite not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async checkFavorite(req: Request, res: Response) {
    try {
      const { userId, locationId } = req.query;
      if (!userId || !locationId) {
        return res.status(400).json({ error: 'userId and locationId are required' });
      }
      const isFavorited = await FavoriteService.isFavorited(userId as string, locationId as string);
      res.json({ isFavorited });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
