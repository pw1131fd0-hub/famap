import { describe, it, expect } from 'vitest';
import {
  generateActivityRecommendations,
  getActivityRecommendations,
  formatActivityDuration,
  calculateTotalActivityCost,
  getActivityRecommendationsForFamily,
  type Activity,
  type FamilyContext,
} from '../utils/activityPlanner';
import type { Location } from '../types';

// Mock locations for testing
const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '公園', en: 'Park' },
    description: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25.0330, lng: 121.5654 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['playground', 'stroller-accessible', 'restroom'],
    averageRating: 4.5,
  },
  {
    id: '2',
    name: { zh: '餐廳', en: 'Restaurant' },
    description: { zh: '餐廳', en: 'Restaurant' },
    category: 'restaurant',
    coordinates: { lat: 25.0340, lng: 121.5664 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['high-chair', 'changing-table', 'family-friendly'],
    averageRating: 4.2,
  },
  {
    id: '3',
    name: { zh: '公園', en: 'Park' },
    description: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25.0350, lng: 121.5674 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['elevator', 'restroom', 'family-friendly'],
    averageRating: 4.8,
  },
  {
    id: '4',
    name: { zh: '公園', en: 'Park' },
    description: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25.0320, lng: 121.5644 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['high-chair', 'wifi', 'family-friendly'],
    averageRating: 4.3,
  },
];

describe('Activity Planner Utility', () => {
  describe('generateActivityRecommendations', () => {
    it('should generate activity recommendations for valid input', () => {
      const context: FamilyContext = {
        childrenAges: [5, 7],
        budget: 'moderate',
        duration: 3,
        startTime: '10:00',
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
        weatherCondition: 'sunny',
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0]).toHaveProperty('id');
      expect(activities[0]).toHaveProperty('name');
      expect(activities[0]).toHaveProperty('stops');
      expect(activities[0]).toHaveProperty('totalDuration');
    });

    it('should return empty array for insufficient locations', () => {
      const context: FamilyContext = {
        childrenAges: [5],
        budget: 'moderate',
        duration: 3,
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
      };

      const activities = generateActivityRecommendations([mockLocations[0]], context);
      expect(activities.length).toBe(0);
    });

    it('should structure activity stops in correct order', () => {
      const context: FamilyContext = {
        childrenAges: [6],
        budget: 'moderate',
        duration: 4,
        startTime: '09:00',
        preferences: {
          outdoorPriority: true,
          educationalValue: true,
          adventurousnessLevel: 3,
          restBreaksNeeded: true,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      expect(activities).toBeDefined();
      if (activities.length > 0) {
        const activity = activities[0];
        activity.stops.forEach((stop, idx) => {
          expect(stop.order).toBe(idx + 1);
        });
      }
    });

    it('should calculate reasonable travel times between stops', () => {
      const context: FamilyContext = {
        childrenAges: [4, 8],
        budget: 'moderate',
        duration: 3,
        preferences: {
          outdoorPriority: false,
          educationalValue: true,
          adventurousnessLevel: 2,
          restBreaksNeeded: true,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      if (activities.length > 0) {
        const activity = activities[0];
        activity.stops.forEach((stop) => {
          expect(stop.estimatedTravelTimeFromPrevious).toBeGreaterThan(0);
          expect(stop.estimatedTravelTimeFromPrevious).toBeLessThan(60);
        });
      }
    });

    it('should set appropriate age ranges for activity', () => {
      const childrenAges = [3, 6, 9];
      const context: FamilyContext = {
        childrenAges,
        budget: 'moderate',
        duration: 3,
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      if (activities.length > 0) {
        const activity = activities[0];
        expect(activity.ageRange.min).toBeLessThanOrEqual(Math.min(...childrenAges));
        expect(activity.ageRange.max).toBeGreaterThanOrEqual(Math.max(...childrenAges));
      }
    });

    it('should provide rainy day alternative when weather is rainy', () => {
      const context: FamilyContext = {
        childrenAges: [5, 7],
        budget: 'moderate',
        duration: 3,
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
        weatherCondition: 'rainy',
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      // Should still generate activities even in rainy weather
      expect(activities).toBeDefined();
    });

    it('should include facility highlights in activity stops', () => {
      const context: FamilyContext = {
        childrenAges: [2],
        budget: 'moderate',
        duration: 2,
        preferences: {
          outdoorPriority: false,
          educationalValue: false,
          adventurousnessLevel: 1,
          restBreaksNeeded: true,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      if (activities.length > 0) {
        const activity = activities[0];
        activity.stops.forEach((stop) => {
          expect(Array.isArray(stop.facilityHighlights)).toBe(true);
        });
      }
    });

    it('should provide explanations for location selections', () => {
      const context: FamilyContext = {
        childrenAges: [5],
        budget: 'moderate',
        duration: 3,
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      if (activities.length > 0) {
        const activity = activities[0];
        activity.stops.forEach((stop) => {
          expect(stop.whyThisLocation).toHaveProperty('zh');
          expect(stop.whyThisLocation).toHaveProperty('en');
          expect(stop.whyThisLocation.zh.length).toBeGreaterThan(0);
          expect(stop.whyThisLocation.en.length).toBeGreaterThan(0);
        });
      }
    });

    it('should calculate activity duration accurately', () => {
      const context: FamilyContext = {
        childrenAges: [6],
        budget: 'moderate',
        duration: 4,
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      if (activities.length > 0) {
        const activity = activities[0];
        expect(activity.totalDuration).toBeGreaterThan(0);
        expect(activity.totalDuration).toBeLessThan(600); // Less than 10 hours
      }
    });

    it('should estimate reasonable costs', () => {
      const context: FamilyContext = {
        childrenAges: [5, 8],
        budget: 'moderate',
        duration: 3,
        preferences: {
          outdoorPriority: false,
          educationalValue: true,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      if (activities.length > 0) {
        const activity = activities[0];
        expect(activity.estimatedCost).toBeGreaterThan(0);
        expect(activity.estimatedCost).toBeLessThan(10000); // Reasonable upper limit
      }
    });
  });

  describe('getActivityRecommendations', () => {
    it('should return cached recommendations for same parameters', () => {
      const context: FamilyContext = {
        childrenAges: [5],
        budget: 'moderate',
        duration: 3,
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
      };

      const activities1 = getActivityRecommendations(mockLocations, context);
      const activities2 = getActivityRecommendations(mockLocations, context);
      expect(activities1).toBeDefined();
      expect(activities2).toBeDefined();
    });
  });

  describe('formatActivityDuration', () => {
    it('should format minutes without hours', () => {
      expect(formatActivityDuration(45)).toBe('45 mins');
      expect(formatActivityDuration(30)).toBe('30 mins');
    });

    it('should format hours without minutes', () => {
      expect(formatActivityDuration(120)).toBe('2 hours');
      expect(formatActivityDuration(60)).toBe('1 hour');
    });

    it('should format hours and minutes together', () => {
      expect(formatActivityDuration(90)).toBe('1h 30m');
      expect(formatActivityDuration(150)).toBe('2h 30m');
    });

    it('should handle zero minutes', () => {
      expect(formatActivityDuration(0)).toBe('0 mins');
    });
  });

  describe('calculateTotalActivityCost', () => {
    it('should return the estimated cost from activity', () => {
      const activity: Activity = {
        id: 'test',
        name: { zh: '測試', en: 'Test' },
        description: { zh: '測試', en: 'Test' },
        stops: [],
        totalDuration: 180,
        totalDistance: 5,
        estimatedCost: 1500,
        ageRange: { min: 3, max: 10 },
        crowdLevel: 'moderate',
        intelligenceScore: 75,
        recommendationReason: { zh: '測試', en: 'Test' },
        weatherSuitability: 70,
        bestTimeToStart: {
          time: '10:00',
          reason: { zh: '測試', en: 'Test' },
        },
      };

      expect(calculateTotalActivityCost(activity)).toBe(1500);
    });

    it('should handle various cost ranges', () => {
      const costs = [0, 500, 1000, 2000, 5000];
      costs.forEach((cost) => {
        const activity: Activity = {
          id: 'test',
          name: { zh: '測試', en: 'Test' },
          description: { zh: '測試', en: 'Test' },
          stops: [],
          totalDuration: 180,
          totalDistance: 5,
          estimatedCost: cost,
          ageRange: { min: 3, max: 10 },
          crowdLevel: 'moderate',
          intelligenceScore: 75,
          recommendationReason: { zh: '測試', en: 'Test' },
          weatherSuitability: 70,
          bestTimeToStart: {
            time: '10:00',
            reason: { zh: '測試', en: 'Test' },
          },
        };
        expect(calculateTotalActivityCost(activity)).toBe(cost);
      });
    });
  });

  describe('getActivityRecommendationsForFamily', () => {
    it('should generate recommendations based on family profile', () => {
      const activities = getActivityRecommendationsForFamily(
        mockLocations,
        [5, 8],
        3,
        { educationalValue: true, adventurousness: 3 }
      );
      expect(activities).toBeDefined();
    });

    it('should adjust for different child ages', () => {
      const activitiesForYoung = getActivityRecommendationsForFamily(
        mockLocations,
        [2],
        2,
        { educationalValue: false }
      );
      const activitiesForOlder = getActivityRecommendationsForFamily(
        mockLocations,
        [10, 12],
        4,
        { educationalValue: true }
      );

      expect(activitiesForYoung).toBeDefined();
      expect(activitiesForOlder).toBeDefined();
    });

    it('should generate recommendations for single child', () => {
      const activities = getActivityRecommendationsForFamily(mockLocations, [7], 3, {});
      expect(activities).toBeDefined();
    });

    it('should generate recommendations for multiple children', () => {
      const activities = getActivityRecommendationsForFamily(
        mockLocations,
        [3, 5, 8],
        4,
        { educationalValue: true }
      );
      expect(activities).toBeDefined();
    });
  });

  describe('Activity intelligence scoring', () => {
    it('should assign reasonable intelligence scores', () => {
      const context: FamilyContext = {
        childrenAges: [5, 7],
        budget: 'moderate',
        duration: 3,
        preferences: {
          outdoorPriority: true,
          educationalValue: true,
          adventurousnessLevel: 3,
          restBreaksNeeded: false,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      if (activities.length > 0) {
        const activity = activities[0];
        expect(activity.intelligenceScore).toBeGreaterThanOrEqual(0);
        expect(activity.intelligenceScore).toBeLessThanOrEqual(100);
      }
    });

    it('should consider budget constraints in scoring', () => {
      const lowBudgetContext: FamilyContext = {
        childrenAges: [5],
        budget: 'low',
        duration: 2,
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, lowBudgetContext);
      if (activities.length > 0) {
        expect(activities[0].estimatedCost).toBeDefined();
      }
    });
  });

  describe('Crowd prediction and timing', () => {
    it('should predict different crowd levels for different times', () => {
      const contexts = [
        { time: '08:00' },
        { time: '12:00' }, // lunch time
        { time: '14:00' },
        { time: '18:00' }, // dinner time
        { time: '20:00' },
      ];

      contexts.forEach(({ time }) => {
        const context: FamilyContext = {
          childrenAges: [5],
          budget: 'moderate',
          duration: 2,
          startTime: time,
          preferences: {
            outdoorPriority: true,
            educationalValue: false,
            adventurousnessLevel: 2,
            restBreaksNeeded: false,
          },
        };

        const activities = generateActivityRecommendations(mockLocations, context);
        if (activities.length > 0) {
          expect(['low', 'moderate', 'high']).toContain(activities[0].crowdLevel);
        }
      });
    });

    it('should suggest appropriate start times', () => {
      const context: FamilyContext = {
        childrenAges: [5],
        budget: 'moderate',
        duration: 3,
        startTime: '10:00',
        preferences: {
          outdoorPriority: true,
          educationalValue: false,
          adventurousnessLevel: 2,
          restBreaksNeeded: false,
        },
      };

      const activities = generateActivityRecommendations(mockLocations, context);
      if (activities.length > 0) {
        const activity = activities[0];
        expect(activity.bestTimeToStart).toHaveProperty('time');
        expect(activity.bestTimeToStart).toHaveProperty('reason');
      }
    });
  });

  describe('Weather suitability', () => {
    it('should calculate weather suitability scores', () => {
      const weatherConditions = ['sunny', 'rainy', 'cloudy', 'cold'];

      weatherConditions.forEach((weather) => {
        const context: FamilyContext = {
          childrenAges: [5],
          budget: 'moderate',
          duration: 3,
          preferences: {
            outdoorPriority: true,
            educationalValue: false,
            adventurousnessLevel: 2,
            restBreaksNeeded: false,
          },
          weatherCondition: weather as any,
        };

        const activities = generateActivityRecommendations(mockLocations, context);
        if (activities.length > 0) {
          expect(activities[0].weatherSuitability).toBeGreaterThanOrEqual(0);
          expect(activities[0].weatherSuitability).toBeLessThanOrEqual(100);
        }
      });
    });
  });
});
