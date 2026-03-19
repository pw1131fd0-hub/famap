import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocationService } from '../services/locationService.js';
import { mockLocations } from '../data/seed-data.js';

describe('LocationService', () => {
  const originalLocations = [...mockLocations];

  beforeEach(() => {
    // Reset mockLocations to initial state
    mockLocations.length = 0;
    mockLocations.push(...originalLocations);
  });

  describe('findNearby', () => {
    it('should find locations within radius', async () => {
      // Daan Forest Park (25.0312, 121.5361)
      const results = await LocationService.findNearby({
        lat: 25.03,
        lng: 121.53,
        radius: 1000 // 1km
      });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(l => l.id === '1')).toBe(true);
    });

    it('should filter by category', async () => {
      const results = await LocationService.findNearby({
        lat: 25.03,
        lng: 121.53,
        radius: 5000,
        category: 'park'
      });
      expect(results.every(l => l.category === 'park')).toBe(true);
    });

    it('should filter by stroller accessibility', async () => {
      const results = await LocationService.findNearby({
        lat: 25.03,
        lng: 121.53,
        radius: 10000,
        stroller_accessible: true
      });
      expect(results.every(l => l.facilities.includes('stroller_accessible'))).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return location by id', async () => {
      const location = await LocationService.findById('1');
      expect(location).not.toBeNull();
      expect(location?.id).toBe('1');
    });

    it('should return null for non-existent id', async () => {
      const location = await LocationService.findById('999');
      expect(location).toBeNull();
    });
  });

  describe('create', () => {
    it('should add a new location', async () => {
      const newLocationData = {
        name: { zh: '新公園', en: 'New Park' },
        description: { zh: '描述', en: 'Desc' },
        category: 'park' as const,
        coordinates: { lat: 25.0, lng: 121.0 },
        address: { zh: '地址', en: 'Addr' },
        facilities: ['nursing_room'],
      };
      const created = await LocationService.create(newLocationData);
      expect(created.id).toBeDefined();
      expect(mockLocations.find(l => l.id === created.id)).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an existing location', async () => {
      const updated = await LocationService.update('1', {
        name: { zh: '更新後的公園', en: 'Updated Park' }
      });
      expect(updated?.name.zh).toBe('更新後的公園');
      expect(mockLocations.find(l => l.id === '1')?.name.zh).toBe('更新後的公園');
    });

    it('should return null when updating non-existent location', async () => {
      const updated = await LocationService.update('999', {
        name: { zh: '無效', en: 'Invalid' }
      });
      expect(updated).toBeNull();
    });
  });
});
