import { describe, it, expect, beforeEach } from 'vitest';
import {
  createOutingPlan,
  optimizeOutingForBudget,
  optimizeOutingForTime,
  type FamilyProfile,
  type OutingPlan,
  type PlanLocation,
} from '../utils/outingPlanner';
import type { Location } from '../types';

describe('OutingPlanner Utils', () => {
  let mockLocations: Location[];
  let familyProfile: FamilyProfile;
  let userLocation: { lat: number; lng: number };

  beforeEach(() => {
    mockLocations = [
      {
        id: '1',
        name: { zh: '公園A', en: 'Park A' },
        category: 'park',
        coordinates: { lat: 25.033, lng: 121.5654 },
        facilities: ['playground', 'restroom'],
        averageRating: 4.5,
        reviewCount: 10,
        address: { zh: '台北市', en: 'Taipei' },
      },
      {
        id: '2',
        name: { zh: '公園B', en: 'Park B' },
        category: 'park',
        coordinates: { lat: 25.035, lng: 121.567 },
        facilities: ['playground', 'restaurant'],
        averageRating: 4.2,
        reviewCount: 8,
        address: { zh: '台北市', en: 'Taipei' },
      },
      {
        id: '3',
        name: { zh: '餐廳', en: 'Restaurant' },
        category: 'restaurant',
        coordinates: { lat: 25.034, lng: 121.5660 },
        facilities: ['high_chair', 'changing_table'],
        averageRating: 4.0,
        reviewCount: 12,
        address: { zh: '台北市', en: 'Taipei' },
      },
    ];

    familyProfile = {
      childrenAges: [5, 8],
      specialNeeds: [],
      interests: ['park', 'restaurant'],
      budget: 1000,
      maxTravelTime: 120,
      duration: 4,
    };

    userLocation = { lat: 25.033, lng: 121.5654 };
  });

  describe('createOutingPlan', () => {
    it('should create an outing plan', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(plan).toBeDefined();
      expect(plan).toHaveProperty('locations');
      expect(plan).toHaveProperty('totalDuration');
      expect(plan).toHaveProperty('totalCost');
    });

    it('should create plan with at least one location', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(Array.isArray(plan.locations)).toBe(true);
      expect(plan.locations.length).toBeGreaterThan(0);
    });

    it('should respect budget constraints', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(plan.totalCost).toBeLessThanOrEqual(familyProfile.budget * 1.2); // Allow 20% buffer
    });

    it('should respect duration constraint', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(plan.totalDuration).toBeLessThanOrEqual(familyProfile.duration * 60 + 30); // Allow 30 min buffer
    });

    it('should respect travel time constraint', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(plan.totalTravelTime || 0).toBeLessThanOrEqual(familyProfile.maxTravelTime + 10);
    });

    it('should handle single location', () => {
      const singleLocation = [mockLocations[0]];
      const plan = createOutingPlan(singleLocation, familyProfile, userLocation);
      expect(plan.locations.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty locations array', () => {
      const plan = createOutingPlan([], familyProfile, userLocation);
      expect(plan).toBeDefined();
      expect(Array.isArray(plan.locations)).toBe(true);
    });
  });

  describe('optimizeOutingForTime', () => {
    it('should optimize plan within time constraint', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const optimizedPlan = optimizeOutingForTime(plan, 180); // 3 hours
      expect(optimizedPlan).toBeDefined();
      expect(optimizedPlan.totalDuration).toBeLessThanOrEqual(180 + 30); // Allow 30 min buffer for realistic optimization
    });

    it('should maintain location quality after optimization', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const originalLocations = plan.locations.length;
      const optimizedPlan = optimizeOutingForTime(plan, 180);
      expect(optimizedPlan.locations.length).toBeLessThanOrEqual(originalLocations);
    });

    it('should handle very short time constraints', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const optimizedPlan = optimizeOutingForTime(plan, 30);
      expect(optimizedPlan).toBeDefined();
    });

    it('should handle unlimited time', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const optimizedPlan = optimizeOutingForTime(plan, 480); // 8 hours
      expect(optimizedPlan.locations.length).toBeGreaterThanOrEqual(plan.locations.length * 0.8);
    });
  });

  describe('optimizeOutingForBudget', () => {
    it('should optimize plan within budget constraint', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const optimizedPlan = optimizeOutingForBudget(plan, 500);
      expect(optimizedPlan.totalCost).toBeLessThanOrEqual(500 * 1.1); // Allow 10% buffer
    });

    it('should maintain efficiency after optimization', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const originalTravelTime = plan.totalTravelTime;
      const optimizedPlan = optimizeOutingForBudget(plan, 500);
      expect(optimizedPlan.totalTravelTime).toBeLessThanOrEqual(originalTravelTime * 1.5);
    });

    it('should handle very low budgets', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const optimizedPlan = optimizeOutingForBudget(plan, 100);
      expect(optimizedPlan).toBeDefined();
      expect(Array.isArray(optimizedPlan.locations)).toBe(true);
    });

    it('should handle high budgets', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const optimizedPlan = optimizeOutingForBudget(plan, 5000);
      expect(optimizedPlan.locations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Travel and Distance Calculations', () => {
    it('should include travel time in plan', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(typeof plan.totalTravelTime).toBe('number');
      expect(plan.totalTravelTime).toBeGreaterThanOrEqual(0);
    });

    it('should include location-specific travel time estimates', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      plan.locations.forEach(loc => {
        expect(typeof loc.travelTimeFromPrevious).toBe('number');
        expect(loc.travelTimeFromPrevious).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('FamilyProfile with different configurations', () => {
    it('should handle profile with special needs', () => {
      const profileWithNeeds: FamilyProfile = {
        ...familyProfile,
        specialNeeds: ['wheelchair_accessible', 'quiet_area'],
      };
      const plan = createOutingPlan(mockLocations, profileWithNeeds, userLocation);
      expect(plan).toBeDefined();
    });

    it('should handle profile with wide age range', () => {
      const wideAgeProfile: FamilyProfile = {
        ...familyProfile,
        childrenAges: [2, 5, 8, 12],
      };
      const plan = createOutingPlan(mockLocations, wideAgeProfile, userLocation);
      expect(plan).toBeDefined();
    });

    it('should handle profile with no interests', () => {
      const noInterestProfile: FamilyProfile = {
        ...familyProfile,
        interests: [],
      };
      const plan = createOutingPlan(mockLocations, noInterestProfile, userLocation);
      expect(plan).toBeDefined();
    });

    it('should handle profile with specific interests', () => {
      const specificProfile: FamilyProfile = {
        ...familyProfile,
        interests: ['nursing_room', 'playground'],
      };
      const plan = createOutingPlan(mockLocations, specificProfile, userLocation);
      expect(plan).toBeDefined();
    });
  });

  describe('Plan quality metrics', () => {
    it('should provide valid cost information', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(plan.totalCost).toBeGreaterThanOrEqual(0);
    });

    it('should provide valid duration information', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(plan.totalDuration).toBeGreaterThan(0);
    });

    it('should provide locations with complete information', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      plan.locations.forEach(loc => {
        expect(loc).toHaveProperty('location');
        expect(loc).toHaveProperty('estimatedStayTime');
        expect(loc).toHaveProperty('estimatedCost');
        expect(loc).toHaveProperty('ageMatch');
      });
    });

    it('should include highlights and recommendations', () => {
      const plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      expect(Array.isArray(plan.highlights)).toBe(true);
      expect(plan.ageRecommendation).toBeDefined();
    });
  });

  describe('Optimization chaining', () => {
    it('should apply multiple optimizations sequentially', () => {
      let plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      plan = optimizeOutingForTime(plan, 180);
      plan = optimizeOutingForBudget(plan, 500);

      expect(plan).toBeDefined();
      expect(plan.totalDuration).toBeLessThanOrEqual(200); // Allow buffer
      expect(plan.totalCost).toBeLessThanOrEqual(550); // Allow 10% buffer
    });

    it('should maintain plan integrity after optimizations', () => {
      let plan = createOutingPlan(mockLocations, familyProfile, userLocation);
      const originalLocations = plan.locations.length;

      plan = optimizeOutingForTime(plan, 180);
      plan = optimizeOutingForBudget(plan, 500);

      expect(plan.locations.length).toBeLessThanOrEqual(originalLocations);
      plan.locations.forEach((loc, index) => {
        expect(loc.location).toBeDefined();
        expect(typeof loc.estimatedStayTime).toBe('number');
      });
    });
  });
});
