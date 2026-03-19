import { mockFavorites, mockLocations } from '../data/seed-data.js';
import type { Favorite, FavoriteCreateDTO } from '../types/favorite.js';
import type { Location } from '../types/location.js';

export class FavoriteService {
  static async getFavorites(userId: string): Promise<Location[]> {
    const userFavorites = mockFavorites.filter(f => f.userId === userId);
    const locationIds = userFavorites.map(f => f.locationId);
    return mockLocations.filter(l => locationIds.includes(l.id));
  }

  static async addFavorite(data: FavoriteCreateDTO): Promise<Favorite | null> {
    // Check if already favorited
    const existing = mockFavorites.find(
      f => f.userId === data.userId && f.locationId === data.locationId
    );
    if (existing) return existing;

    // Check if location exists
    const location = mockLocations.find(l => l.id === data.locationId);
    if (!location) return null;

    const newFavorite: Favorite = {
      id: (mockFavorites.length + 1).toString(),
      userId: data.userId,
      locationId: data.locationId,
      createdAt: new Date().toISOString(),
    };

    mockFavorites.push(newFavorite);
    return newFavorite;
  }

  static async removeFavorite(userId: string, locationId: string): Promise<boolean> {
    const index = mockFavorites.findIndex(
      f => f.userId === userId && f.locationId === locationId
    );
    if (index === -1) return false;

    mockFavorites.splice(index, 1);
    return true;
  }

  static async isFavorited(userId: string, locationId: string): Promise<boolean> {
    return mockFavorites.some(f => f.userId === userId && f.locationId === locationId);
  }
}
