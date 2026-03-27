/**
 * Tests for Best Time Visit Predictor utility
 */

import {
  predictBestTimes,
  calculateFamilySuitabilityScore,
  type VisitPredictionInput,
} from '../utils/bestTimeVisitPredictor';

describe('bestTimeVisitPredictor', () => {
  const mockInput: VisitPredictionInput = {
    locationId: 'test-loc-1',
    locationCategory: 'park',
    locationType: 'park',
    familyProfile: {
      childrenAges: [3, 5],
      preferredActivityType: 'outdoor',
      preferredTimeOfDay: 'morning',
      crowdTolerance: 'medium',
      mobilityNeeds: true,
    },
    historicalData: {
      averageCrowdByDayOfWeek: {
        'Monday': 40,
        'Tuesday': 35,
        'Wednesday': 38,
        'Thursday': 42,
        'Friday': 55,
        'Saturday': 75,
        'Sunday': 80,
      },
      averageCrowdByTime: {
        '09:00': 45,
        '12:00': 75,
        '15:00': 50,
        '18:00': 65,
      },
      popularTimes: ['Saturday 10:00-12:00', 'Sunday 14:00-16:00'],
      quietTimes: ['Tuesday 09:00-11:00', 'Wednesday 14:00-16:00'],
    },
  };

  describe('predictBestTimes', () => {
    it('should generate recommendations for future days', () => {
      const recommendations = predictBestTimes(mockInput);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(7);
    });

    it('should return recommendations with valid structure', () => {
      const recommendations = predictBestTimes(mockInput);
      const rec = recommendations[0];

      expect(rec).toHaveProperty('dayOfWeek');
      expect(rec).toHaveProperty('date');
      expect(rec).toHaveProperty('timeWindow');
      expect(rec).toHaveProperty('suitabilityScore');
      expect(rec).toHaveProperty('crowdLevel');
      expect(rec).toHaveProperty('weatherCondition');
      expect(rec).toHaveProperty('expectedWaitTime');
      expect(rec).toHaveProperty('reasonsToVisit');
      expect(rec).toHaveProperty('reasonsToAvoid');
      expect(rec).toHaveProperty('facilities');
    });

    it('should have suitability scores between 0 and 100', () => {
      const recommendations = predictBestTimes(mockInput);

      recommendations.forEach((rec) => {
        expect(rec.suitabilityScore).toBeGreaterThanOrEqual(0);
        expect(rec.suitabilityScore).toBeLessThanOrEqual(100);
      });
    });

    it('should have valid crowd levels', () => {
      const recommendations = predictBestTimes(mockInput);
      const validLevels = ['very_light', 'light', 'moderate', 'busy', 'very_busy'];

      recommendations.forEach((rec) => {
        expect(validLevels).toContain(rec.crowdLevel);
      });
    });

    it('should have valid weather conditions', () => {
      const recommendations = predictBestTimes(mockInput);
      const validConditions = ['excellent', 'good', 'fair', 'poor'];

      recommendations.forEach((rec) => {
        expect(validConditions).toContain(rec.weatherCondition);
      });
    });

    it('should have positive expected wait times', () => {
      const recommendations = predictBestTimes(mockInput);

      recommendations.forEach((rec) => {
        expect(rec.expectedWaitTime).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have facility availability information', () => {
      const recommendations = predictBestTimes(mockInput);
      const rec = recommendations[0];

      expect(rec.facilities).toHaveProperty('restrooms');
      expect(rec.facilities).toHaveProperty('nursingRoom');
      expect(rec.facilities).toHaveProperty('restaurants');
      expect(rec.facilities).toHaveProperty('parkingAvailable');

      const validAvailability = ['available', 'crowded', 'unavailable'];
      expect(validAvailability).toContain(rec.facilities.restrooms);
      expect(validAvailability).toContain(rec.facilities.nursingRoom);
      expect(validAvailability).toContain(rec.facilities.restaurants);
      expect(typeof rec.facilities.parkingAvailable).toBe('boolean');
    });

    it('should sort by suitability score descending', () => {
      const recommendations = predictBestTimes(mockInput);

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].suitabilityScore).toBeGreaterThanOrEqual(recommendations[i].suitabilityScore);
      }
    });

    it('should prefer morning times for morning-preferring families', () => {
      const morningInput: VisitPredictionInput = {
        ...mockInput,
        familyProfile: {
          ...mockInput.familyProfile!,
          preferredTimeOfDay: 'morning',
        },
      };

      const recommendations = predictBestTimes(morningInput);
      const morningRecommendation = recommendations.find((r) => {
        const hour = parseInt(r.timeWindow.split(':')[0], 10);
        return hour < 12;
      });

      expect(morningRecommendation).toBeDefined();
    });

    it('should handle different location types', () => {
      const types: Array<'park' | 'restaurant' | 'amusement_park' | 'museum' | 'water_park' | 'shopping' | 'other'> = [
        'park',
        'restaurant',
        'amusement_park',
        'museum',
        'water_park',
        'shopping',
        'other',
      ];

      types.forEach((type) => {
        const input: VisitPredictionInput = {
          ...mockInput,
          locationType: type,
        };

        const recommendations = predictBestTimes(input);
        expect(recommendations.length).toBeGreaterThan(0);
      });
    });

    it('should handle family profiles with different crowd tolerances', () => {
      const tolerances: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

      tolerances.forEach((tolerance) => {
        const input: VisitPredictionInput = {
          ...mockInput,
          familyProfile: {
            ...mockInput.familyProfile!,
            crowdTolerance: tolerance,
          },
        };

        const recommendations = predictBestTimes(input);
        expect(recommendations.length).toBeGreaterThan(0);
      });
    });

    it('should generate reasons to visit and avoid', () => {
      const recommendations = predictBestTimes(mockInput);
      const rec = recommendations[0];

      expect(Array.isArray(rec.reasonsToVisit)).toBe(true);
      expect(Array.isArray(rec.reasonsToAvoid)).toBe(true);

      // Top recommendations should have reasons to visit
      if (rec.suitabilityScore > 60) {
        expect(rec.reasonsToVisit.length).toBeGreaterThan(0);
      }
    });

    it('should handle missing historical data', () => {
      const inputWithoutHistorical: VisitPredictionInput = {
        locationId: 'test-loc-2',
        locationCategory: 'restaurant',
        locationType: 'restaurant',
      };

      const recommendations = predictBestTimes(inputWithoutHistorical);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('calculateFamilySuitabilityScore', () => {
    const mockLocation = {
      id: 'loc-1',
      name: { zh: '公園', en: 'Park' },
      category: 'park',
      coordinates: { lat: 25.0, lng: 121.0 },
      facilities: ['swings', 'sandbox', 'stroller_accessible'],
      averageRating: 4.5,
    };

    it('should return a score between 0 and 100', () => {
      const score = calculateFamilySuitabilityScore(mockLocation);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return default score without family profile', () => {
      const score = calculateFamilySuitabilityScore(mockLocation);
      expect(score).toBe(50);
    });

    it('should increase score for age-appropriate parks', () => {
      const familyProfile = {
        childrenAges: [3, 5],
        preferredActivityType: 'outdoor',
        preferredTimeOfDay: 'morning',
        crowdTolerance: 'medium',
        mobilityNeeds: false,
      };

      const score = calculateFamilySuitabilityScore(mockLocation, familyProfile);
      expect(score).toBeGreaterThan(50);
    });

    it('should increase score for restaurants with families', () => {
      const restaurantLocation = {
        ...mockLocation,
        category: 'restaurant',
      };

      const familyProfile = {
        childrenAges: [2, 4],
        preferredActivityType: 'dining',
        preferredTimeOfDay: 'afternoon',
        crowdTolerance: 'medium',
        mobilityNeeds: false,
      };

      const score = calculateFamilySuitabilityScore(restaurantLocation, familyProfile);
      expect(score).toBeGreaterThan(50);
    });

    it('should increase score for amusement parks with older children', () => {
      const parkLocation = {
        ...mockLocation,
        category: 'amusement_park',
      };

      const familyProfile = {
        childrenAges: [5, 8],
        preferredActivityType: 'rides',
        preferredTimeOfDay: 'afternoon',
        crowdTolerance: 'high',
        mobilityNeeds: false,
      };

      const score = calculateFamilySuitabilityScore(parkLocation, familyProfile);
      expect(score).toBeGreaterThan(50);
    });

    it('should boost score for stroller accessibility when needed', () => {
      const familyProfile = {
        childrenAges: [1, 3],
        preferredActivityType: 'outdoor',
        preferredTimeOfDay: 'morning',
        crowdTolerance: 'medium',
        mobilityNeeds: true,
      };

      const score = calculateFamilySuitabilityScore(mockLocation, familyProfile);
      expect(score).toBeGreaterThan(50);
    });

    it('should factor in location rating', () => {
      const highRatedLocation = {
        ...mockLocation,
        averageRating: 4.8,
      };

      const familyProfile = {
        childrenAges: [3, 5],
        preferredActivityType: 'outdoor',
        preferredTimeOfDay: 'morning',
        crowdTolerance: 'medium',
        mobilityNeeds: false,
      };

      const scoreHighRated = calculateFamilySuitabilityScore(highRatedLocation, familyProfile);
      const scoreLowRated = calculateFamilySuitabilityScore(
        { ...mockLocation, averageRating: 2.5 },
        familyProfile
      );

      expect(scoreHighRated).toBeGreaterThan(scoreLowRated);
    });

    it('should handle locations without averageRating', () => {
      const locationNoRating = {
        ...mockLocation,
        averageRating: undefined,
      };

      const familyProfile = {
        childrenAges: [3, 5],
        preferredActivityType: 'outdoor',
        preferredTimeOfDay: 'morning',
        crowdTolerance: 'medium',
        mobilityNeeds: false,
      };

      const score = calculateFamilySuitabilityScore(locationNoRating, familyProfile);
      expect(score).toBeDefined();
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle different location categories', () => {
      const categories = ['park', 'restaurant', 'amusement_park', 'museum'];

      categories.forEach((category) => {
        const location = {
          ...mockLocation,
          category: category as any,
        };

        const familyProfile = {
          childrenAges: [4],
          preferredActivityType: 'any',
          preferredTimeOfDay: 'afternoon',
          crowdTolerance: 'medium',
          mobilityNeeds: false,
        };

        const score = calculateFamilySuitabilityScore(location, familyProfile);
        expect(score).toBeDefined();
      });
    });
  });
});
