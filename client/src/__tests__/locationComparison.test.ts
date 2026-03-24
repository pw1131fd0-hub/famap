import { describe, it, expect } from 'vitest';
import {
  extractComparisonMetrics,
  calculateComparisonScores,
  getComparisonSummary
} from '../utils/locationComparison';
import type { Location } from '../types';

// Mock location data
const mockLocations: Location[] = [
  {
    id: 'loc1',
    name: { en: 'Park A', zh: '公園A' },
    category: 'park',
    coordinates: { lat: 25.05, lng: 121.55 },
    address: { en: '123 Main St', zh: '123號主街' },
    description: { en: 'Nice park', zh: '很好的公園' },
    facilities: ['playground', 'restroom', 'parking'],
    averageRating: 4.5,
    stroller: { strollerFriendly: true },
    nursingRoom: { hasDedicatedNursingRoom: true },
    operatingHours: { monday: '08:00 - 18:00' },
    noiseAndSensoryEnvironment: { overallNoiseLevel: 'quiet' },
    ageRange: { minAge: 1, maxAge: 12 }
  } as Location,
  {
    id: 'loc2',
    name: { en: 'Museum B', zh: '博物館B' },
    category: 'attraction',
    coordinates: { lat: 25.06, lng: 121.56 },
    address: { en: '456 Oak Ave', zh: '456橡樹大道' },
    description: { en: 'Interactive museum', zh: '互動式博物館' },
    facilities: ['restroom', 'cafe', 'wheelchair_accessible'],
    averageRating: 4.8,
    stroller: { strollerFriendly: false },
    nursingRoom: { hasDedicatedNursingRoom: false },
    operatingHours: { monday: '09:00 - 17:00' },
    noiseAndSensoryEnvironment: { overallNoiseLevel: 'moderate' },
    ageRange: { minAge: 3, maxAge: 15 }
  } as Location,
  {
    id: 'loc3',
    name: { en: 'Restaurant C', zh: '餐廳C' },
    category: 'restaurant',
    coordinates: { lat: 25.04, lng: 121.54 },
    address: { en: '789 Elm St', zh: '789榆樹街' },
    description: { en: 'Family restaurant', zh: '家庭餐廳' },
    facilities: ['high_chair', 'restroom', 'parking'],
    averageRating: 4.2,
    stroller: { strollerFriendly: true },
    nursingRoom: { hasDedicatedNursingRoom: true },
    operatingHours: { monday: '11:00 - 22:00' },
    noiseAndSensoryEnvironment: { overallNoiseLevel: 'loud' },
    ageRange: { minAge: 0, maxAge: 12 }
  } as Location
];

describe('Location Comparison Utils', () => {
  describe('extractComparisonMetrics', () => {
    it('should extract comparison metrics from locations', () => {
      const metrics = extractComparisonMetrics(mockLocations);
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.some(m => m.category === 'Category')).toBe(true);
      expect(metrics.some(m => m.category === 'Average Rating')).toBe(true);
    });

    it('should include all locations in metrics', () => {
      const metrics = extractComparisonMetrics(mockLocations);
      metrics.forEach(metric => {
        expect(Object.keys(metric.locations).length).toBe(3);
        mockLocations.forEach(loc => {
          expect(metric.locations[loc.id]).toBeDefined();
        });
      });
    });

    it('should handle empty locations array', () => {
      const metrics = extractComparisonMetrics([]);
      expect(metrics.length).toBe(0);
    });

    it('should include facilities metric with correct data', () => {
      const metrics = extractComparisonMetrics(mockLocations);
      const facilitiesMetric = metrics.find(m => m.category === 'Available Facilities');
      expect(facilitiesMetric).toBeDefined();
      expect(facilitiesMetric!.locations['loc1']).toContain('playground');
      expect(facilitiesMetric!.locations['loc2']).toContain('wheelchair_accessible');
    });

    it('should include stroller accessibility metric', () => {
      const metrics = extractComparisonMetrics(mockLocations);
      const strollerMetric = metrics.find(m => m.category === 'Stroller Accessible');
      expect(strollerMetric).toBeDefined();
      expect(strollerMetric!.locations['loc1']).toBe('Yes');
      expect(strollerMetric!.locations['loc2']).toBe('No');
    });

    it('should assign appropriate weights to metrics', () => {
      const metrics = extractComparisonMetrics(mockLocations);
      metrics.forEach(metric => {
        expect(metric.weight).toBeGreaterThan(0);
        expect(metric.weight).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('calculateComparisonScores', () => {
    it('should calculate scores for all locations', () => {
      const scores = calculateComparisonScores(mockLocations);
      expect(scores.length).toBe(3);
      scores.forEach(score => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
        expect(score.locationId).toBeDefined();
        expect(score.locationName).toBeDefined();
      });
    });

    it('should sort scores by highest to lowest', () => {
      const scores = calculateComparisonScores(mockLocations);
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i].score).toBeGreaterThanOrEqual(scores[i + 1].score);
      }
    });

    it('should include rating in score calculation', () => {
      const scores = calculateComparisonScores(mockLocations);
      const museumScore = scores.find(s => s.locationId === 'loc2')!;
      expect(museumScore.breakdown['rating']).toBeGreaterThan(0);
    });

    it('should consider user preferences for stroller accessibility', () => {
      const preferences = { stroller: true };
      const scores = calculateComparisonScores(mockLocations, preferences);
      const parkScore = scores.find(s => s.locationId === 'loc1')!;
      const museumScore = scores.find(s => s.locationId === 'loc2')!;
      expect(parkScore.breakdown['stroller_match']).toBe(10);
      expect(museumScore.breakdown['stroller_match']).toBeUndefined();
    });

    it('should consider user preferences for age matching', () => {
      const preferences = { childAge: 5 };
      const scores = calculateComparisonScores(mockLocations, preferences);
      const parkScore = scores.find(s => s.locationId === 'loc1')!;
      expect(parkScore.breakdown['age_match']).toBe(10);
    });

    it('should include nursing room bonus points', () => {
      const scores = calculateComparisonScores(mockLocations);
      const parkScore = scores.find(s => s.locationId === 'loc1')!;
      const museumScore = scores.find(s => s.locationId === 'loc2')!;
      expect(parkScore.breakdown['nursing_room']).toBe(5);
      expect(museumScore.breakdown['nursing_room']).toBeUndefined();
    });

    it('should include noise level in scoring', () => {
      const scores = calculateComparisonScores(mockLocations);
      const parkScore = scores.find(s => s.locationId === 'loc1')!;
      const restaurantScore = scores.find(s => s.locationId === 'loc3')!;
      expect(parkScore.breakdown['noise_level']).toBe(8); // quiet
      expect(restaurantScore.breakdown['noise_level']).toBe(2); // loud
    });

    it('should handle missing data gracefully', () => {
      const incompleteLoc: Location = {
        id: 'loc4',
        name: { en: 'Incomplete', zh: '不完整' },
        category: 'park',
        coordinates: { lat: 25.0, lng: 121.5 },
        address: { en: 'Test', zh: '測試' },
        description: { en: 'Test', zh: '測試' },
        facilities: [],
        averageRating: 0
      } as Location;

      const scores = calculateComparisonScores([incompleteLoc]);
      expect(scores[0].score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getComparisonSummary', () => {
    it('should generate comparison summary', () => {
      const summary = getComparisonSummary(mockLocations);
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should identify highest rated location', () => {
      const summary = getComparisonSummary(mockLocations);
      const ratingInsight = summary.find(s => s.includes('Highest rated'));
      expect(ratingInsight).toBeDefined();
      expect(ratingInsight).toContain('Museum B');
    });

    it('should identify most facilities', () => {
      const summary = getComparisonSummary(mockLocations);
      const facilitiesInsight = summary.find(s => s.includes('Most facilities'));
      expect(facilitiesInsight).toBeDefined();
    });

    it('should identify stroller friendly locations', () => {
      const summary = getComparisonSummary(mockLocations);
      const strollerInsight = summary.find(s => s.includes('stroller accessible'));
      expect(strollerInsight).toBeDefined();
      expect(strollerInsight).toContain('2/3');
    });

    it('should identify quietest location', () => {
      const summary = getComparisonSummary(mockLocations);
      const quietInsight = summary.find(s => s.includes('Quietest'));
      expect(quietInsight).toBeDefined();
      expect(quietInsight).toContain('Park A');
    });

    it('should handle empty locations array', () => {
      const summary = getComparisonSummary([]);
      expect(summary.length).toBe(0);
    });

    it('should handle single location', () => {
      const summary = getComparisonSummary([mockLocations[0]]);
      expect(summary.length).toBeGreaterThan(0);
    });
  });

  describe('Score calculation edge cases', () => {
    it('should handle locations with zero rating', () => {
      const locations: Location[] = [
        { ...mockLocations[0], averageRating: 0 } as Location
      ];
      const scores = calculateComparisonScores(locations);
      expect(scores[0].breakdown['rating']).toBe(0);
    });

    it('should handle locations with no age compatibility', () => {
      const locations: Location[] = [
        { ...mockLocations[0], ageRange: undefined } as Location
      ];
      const scores = calculateComparisonScores(locations, { childAge: 5 });
      expect(scores[0].breakdown['age_match']).toBeUndefined();
    });

    it('should cap score at 100', () => {
      // Create a location with many bonus conditions met
      const perfectLocation: Location = {
        id: 'perfect',
        name: { en: 'Perfect Place', zh: '完美地點' },
        category: 'park',
        coordinates: { lat: 25.0, lng: 121.5 },
        address: { en: 'Test', zh: '測試' },
        description: { en: 'Test', zh: '測試' },
        facilities: Array(15).fill('facility'),
        averageRating: 5,
        stroller: { strollerFriendly: true },
        nursingRoom: { hasDedicatedNursingRoom: true },
        noiseAndSensoryEnvironment: { overallNoiseLevel: 'very_quiet' },
        ageRange: { minAge: 0, maxAge: 18 },
        rainyDayAlternatives: { rainyCoveragePercentage: 100 }
      } as Location;

      const scores = calculateComparisonScores([perfectLocation]);
      expect(scores[0].score).toBeLessThanOrEqual(100);
    });
  });
});
