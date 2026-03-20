import { mockLocations } from '../data/seed-data.js';
import type { Location, SearchParams } from '../types/location.js';

export class LocationService {
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  static async findNearby(params: SearchParams & { limit?: number }): Promise<Location[]> {
    const { lat, lng, radius, category, stroller_accessible, limit = 500 } = params;

    const results = mockLocations.filter((location: Location) => {
      const distance = this.calculateDistance(
        lat,
        lng,
        location.coordinates.lat,
        location.coordinates.lng
      );

      const withinRadius = distance <= radius;
      const matchCategory = !category || location.category === category;
      const matchStroller = !stroller_accessible || location.facilities.includes('stroller_accessible');

      return withinRadius && matchCategory && matchStroller;
    });

    return results.slice(0, limit);
  }

  static async findById(id: string): Promise<Location | null> {
    return mockLocations.find((l: Location) => l.id === id) || null;
  }

  static async create(locationData: Omit<Location, 'id' | 'averageRating'>): Promise<Location> {
    const newLocation: Location = {
      ...locationData,
      id: (mockLocations.length + 1).toString(),
      averageRating: 0,
    };
    mockLocations.push(newLocation);
    return newLocation;
  }

  static async update(id: string, locationData: Partial<Omit<Location, 'id' | 'averageRating'>>): Promise<Location | null> {
    const index = mockLocations.findIndex((l: Location) => l.id === id);
    if (index === -1) return null;

    const existing = mockLocations[index];
    if (!existing) return null;

    const updated: Location = {
      ...existing,
      ...locationData,
      name: locationData.name ? { ...existing.name, ...locationData.name } : existing.name,
      description: locationData.description ? { ...existing.description, ...locationData.description } : existing.description,
      address: locationData.address ? { ...existing.address, ...locationData.address } : existing.address,
      coordinates: locationData.coordinates ? { ...existing.coordinates, ...locationData.coordinates } : existing.coordinates,
    };

    mockLocations[index] = updated;
    return updated;
  }
}
