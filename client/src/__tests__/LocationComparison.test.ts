import { describe, it, expect, beforeEach } from 'vitest';
import { extractComparisonMetrics, calculateComparisonScores, getComparisonSummary } from '../utils/locationComparison';
import type { Location } from '../types';

describe('LocationComparison Utils', () => {
  let mockLocations: Location[];

  beforeEach(() => {
    mockLocations = [
      {
        id: '1',
        name: { zh: '公園A', en: 'Park A' },
        category: 'park',
        coordinates: { lat: 25.033, lng: 121.5654 },
        facilities: ['playground', 'restroom', 'parking'],
        averageRating: 4.5,
        reviewCount: 10,
        address: { zh: '台北市', en: 'Taipei' },
      },
      {
        id: '2',
        name: { zh: '公園B', en: 'Park B' },
        category: 'park',
        coordinates: { lat: 25.0330, lng: 121.5660 },
        facilities: ['playground', 'restaurant', 'nursing_room'],
        averageRating: 4.2,
        reviewCount: 8,
        address: { zh: '台北市', en: 'Taipei' },
      },
    ];
  });

  describe('extractComparisonMetrics', () => {
    it('should extract metrics from multiple locations', () => {
      const metrics = extractComparisonMetrics(mockLocations);
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should handle empty location array', () => {
      const metrics = extractComparisonMetrics([]);
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should extract metrics with ratings', () => {
      const metrics = extractComparisonMetrics(mockLocations);
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('calculateComparisonScores', () => {
    it('should calculate scores for all locations', () => {
      const scores = calculateComparisonScores(mockLocations);
      expect(Array.isArray(scores)).toBe(true);
      expect(scores.length).toBe(mockLocations.length);
    });

    it('should assign location IDs to scores', () => {
      const scores = calculateComparisonScores(mockLocations);
      const ids = scores.map(s => s.locationId);
      expect(ids).toContain('1');
      expect(ids).toContain('2');
    });

    it('should provide numeric scores between 0 and 100', () => {
      const scores = calculateComparisonScores(mockLocations);
      scores.forEach(score => {
        expect(typeof score.score).toBe('number');
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      });
    });

    it('should include location names in scores', () => {
      const scores = calculateComparisonScores(mockLocations);
      scores.forEach(score => {
        expect(score.locationName).toBeDefined();
        expect(typeof score.locationName).toBe('string');
      });
    });

    it('should handle empty location array', () => {
      const scores = calculateComparisonScores([]);
      expect(Array.isArray(scores)).toBe(true);
      expect(scores.length).toBe(0);
    });
  });

  describe('getComparisonSummary', () => {
    it('should generate summary for locations', () => {
      const summary = getComparisonSummary(mockLocations);
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('object');
    });

    it('should include summary items', () => {
      const summary = getComparisonSummary(mockLocations);
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
      summary.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty location array', () => {
      const summary = getComparisonSummary([]);
      expect(summary).toBeDefined();
    });

    it('should identify best location by rating', () => {
      const summary = getComparisonSummary(mockLocations);
      const bestLocation = mockLocations.find(l => l.averageRating === Math.max(...mockLocations.map(l => l.averageRating || 0)));
      if (bestLocation) {
        expect(summary.some(s => s.includes(bestLocation.name.en || bestLocation.name.zh))).toBe(true);
      }
    });
  });

  describe('Comparison workflow', () => {
    it('should complete full comparison workflow', () => {
      const metrics = extractComparisonMetrics(mockLocations);
      const scores = calculateComparisonScores(mockLocations);
      const summary = getComparisonSummary(mockLocations);

      expect(metrics).toBeDefined();
      expect(scores.length).toBe(mockLocations.length);
      expect(summary).toBeDefined();
    });

    it('should handle locations with different attributes', () => {
      const diverseLocations: Location[] = [
        {
          id: '3',
          name: { zh: '餐廳', en: 'Restaurant' },
          category: 'restaurant',
          coordinates: { lat: 25.033, lng: 121.5654 },
          facilities: ['high_chair', 'changing_table'],
          averageRating: 3.8,
          reviewCount: 5,
          address: { zh: '台北市', en: 'Taipei' },
        },
        {
          id: '4',
          name: { zh: '醫療設施', en: 'Medical' },
          category: 'medical',
          coordinates: { lat: 25.034, lng: 121.5664 },
          facilities: ['first_aid', 'restroom'],
          averageRating: 4.9,
          reviewCount: 20,
          address: { zh: '台北市', en: 'Taipei' },
        },
      ];

      const scores = calculateComparisonScores(diverseLocations);
      expect(scores.length).toBe(2);
    });
  });
});
