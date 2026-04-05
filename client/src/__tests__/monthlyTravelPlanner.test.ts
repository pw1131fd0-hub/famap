import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateMonthlyTravelPlan,
  optimizeVisitSequence,
  exportMonthlyPlanAsText,
  type FamilyTravelProfile,
  type PlannedVisit,
} from '../utils/monthlyTravelPlanner';
import type { Location } from '../types';

describe('monthlyTravelPlanner', () => {
  let mockLocations: Location[];
  let familyProfile: FamilyTravelProfile;

  beforeEach(() => {
    mockLocations = [
      {
        id: '1',
        name_en: 'Central Park',
        name_zh: '中央公園',
        category: 'park',
        coordinates: { lat: 40.7829, lng: -73.9654 },
        facilities: ['stroller_accessible'],
        averageRating: 4.8,
        address_en: '123 Park Ave',
        address_zh: '公園大街123號',
      },
      {
        id: '2',
        name_en: 'Children Museum',
        name_zh: '兒童博物館',
        category: 'attraction',
        coordinates: { lat: 40.7614, lng: -73.7776 },
        facilities: ['stroller_accessible', 'parking'],
        averageRating: 4.6,
        address_en: '456 Museum Rd',
        address_zh: '博物館路456號',
      },
      {
        id: '3',
        name_en: 'Family Restaurant',
        name_zh: '家庭餐廳',
        category: 'restaurant',
        coordinates: { lat: 40.7505, lng: -73.9972 },
        facilities: ['high_chair'],
        averageRating: 4.3,
        address_en: '789 Food St',
        address_zh: '美食街789號',
      },
      {
        id: '4',
        name_en: 'Zoo',
        name_zh: '動物園',
        category: 'attraction',
        coordinates: { lat: 40.7677, lng: -73.9541 },
        facilities: [],
        averageRating: 4.7,
        address_en: '321 Zoo Way',
        address_zh: '動物園路321號',
      },
      {
        id: '5',
        name_en: 'Playground Park',
        name_zh: '遊樂場公園',
        category: 'park',
        coordinates: { lat: 40.7489, lng: -73.9680 },
        facilities: ['stroller_accessible'],
        averageRating: 4.5,
        address_en: '654 Play Ave',
        address_zh: '遊樂大街654號',
      },
    ];

    familyProfile = {
      childrenAges: [4, 7],
      interests: ['outdoor', 'learning', 'animals'],
      maxBudget: 500,
      preferredDays: ['Sat', 'Sun'],
      travelDistance: 'nearby',
      seasonPreference: 'spring',
      activityPreference: 'mixed',
    };
  });

  describe('generateMonthlyTravelPlan', () => {
    it('should generate a complete monthly plan', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      expect(plan).toBeDefined();
      expect(plan.month).toBe('April 2026');
      expect(plan.totalBudget).toBe(500);
      expect(plan.estimatedCost).toBeGreaterThan(0);
      expect(plan.weeklyPlans.length).toBeGreaterThan(0);
      expect(plan.savingsOpportunities).toBeDefined();
      expect(plan.summary).toBeDefined();
      expect(plan.recommendations).toBeDefined();
    });

    it('should create weekly plans with themes', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      plan.weeklyPlans.forEach((week) => {
        expect(week.week).toBeGreaterThan(0);
        expect(week.startDate).toBeInstanceOf(Date);
        expect(week.endDate).toBeInstanceOf(Date);
        expect(week.theme).toBeTruthy();
        expect(week.plannedVisits.length).toBeGreaterThan(0);
        expect(week.estimatedCost).toBeGreaterThanOrEqual(0);
      });
    });

    it('should create planned visits with locations', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      const allVisits = plan.weeklyPlans.flatMap((w) => w.plannedVisits);
      expect(allVisits.length).toBeGreaterThan(0);

      allVisits.forEach((visit) => {
        expect(visit.location).toBeDefined();
        expect(visit.date).toBeInstanceOf(Date);
        expect(visit.startTime).toBeTruthy();
        expect(visit.duration).toBeGreaterThan(0);
        expect(['high', 'medium', 'low']).toContain(visit.priority);
        expect(visit.reason).toBeTruthy();
        expect(visit.estimatedCost).toBeGreaterThanOrEqual(0);
      });
    });

    it('should respect preferred days', () => {
      const profile = { ...familyProfile, preferredDays: ['Sat', 'Sun'] };
      const plan = generateMonthlyTravelPlan(mockLocations, profile, 2026, 3);

      const allVisits = plan.weeklyPlans.flatMap((w) => w.plannedVisits);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      allVisits.forEach((visit) => {
        const dayName = dayNames[visit.date.getDay()];
        // Most visits should be on preferred days
        expect(profile.preferredDays).toContain(dayName);
      });
    });

    it('should estimate reasonable costs', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      expect(plan.estimatedCost).toBeLessThanOrEqual(familyProfile.maxBudget * 1.5);
      expect(plan.estimatedCost).toBeGreaterThan(0);

      plan.weeklyPlans.forEach((week) => {
        expect(week.estimatedCost).toBeGreaterThanOrEqual(0);
      });
    });

    it('should identify savings opportunities', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      expect(plan.savingsOpportunities).toBeDefined();
      expect(Array.isArray(plan.savingsOpportunities)).toBe(true);

      plan.savingsOpportunities.forEach((opp) => {
        expect(['membership', 'combo', 'seasonal', 'bundle']).toContain(opp.type);
        expect(opp.description).toBeTruthy();
        expect(opp.potentialSavings).toBeGreaterThanOrEqual(0);
        expect(opp.implementation).toBeTruthy();
      });
    });

    it('should generate meaningful recommendations', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      expect(plan.recommendations.length).toBeGreaterThan(0);
      plan.recommendations.forEach((rec) => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty location list', () => {
      const plan = generateMonthlyTravelPlan([], familyProfile, 2026, 3);

      expect(plan).toBeDefined();
      expect(plan.weeklyPlans).toBeDefined();
      // Should still generate structure even with no locations
    });

    it('should vary themes across weeks', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      const themes = plan.weeklyPlans.map((w) => w.theme);
      const uniqueThemes = new Set(themes);

      // Should have variety in themes
      expect(uniqueThemes.size).toBeGreaterThan(1);
    });

    it('should respect family age requirements', () => {
      const youngProfile = { ...familyProfile, childrenAges: [1, 2] };
      const plan = generateMonthlyTravelPlan(mockLocations, youngProfile, 2026, 3);

      const allVisits = plan.weeklyPlans.flatMap((w) => w.plannedVisits);
      // All visits should be in suitable venues for very young children
      allVisits.forEach((visit) => {
        expect(['park', 'restaurant', 'nursing_room']).toContain(visit.location.category);
      });
    });

    it('should distribute visits evenly across month', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      const visitsPerWeek = plan.weeklyPlans.map((w) => w.plannedVisits.length);
      const avgVisits = visitsPerWeek.reduce((a, b) => a + b, 0) / visitsPerWeek.length;

      // Should be relatively balanced
      visitsPerWeek.forEach((count) => {
        expect(Math.abs(count - avgVisits)).toBeLessThanOrEqual(2);
      });
    });

    it('should calculate accurate summary statistics', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      const allVisits = plan.weeklyPlans.flatMap((w) => w.plannedVisits);
      const uniqueLocationIds = new Set(allVisits.map((v) => v.location.id));

      expect(plan.summary.totalVisits).toBe(allVisits.length);
      expect(plan.summary.uniqueLocations).toBe(uniqueLocationIds.size);
      expect(plan.summary.familyFriendlinessScore).toBeGreaterThanOrEqual(0);
      expect(plan.summary.familyFriendlinessScore).toBeLessThanOrEqual(100);
      expect(plan.summary.varietyScore).toBeGreaterThanOrEqual(0);
      expect(plan.summary.varietyScore).toBeLessThanOrEqual(100);
      expect(plan.summary.valueForMoneyScore).toBeGreaterThanOrEqual(0);
      expect(plan.summary.valueForMoneyScore).toBeLessThanOrEqual(100);
    });
  });

  describe('optimizeVisitSequence', () => {
    it('should order visits by date and priority', () => {
      const visits: PlannedVisit[] = [
        {
          location: mockLocations[0],
          date: new Date(2026, 3, 5),
          startTime: '10:00',
          duration: 2,
          priority: 'low',
          reason: 'test',
          estimatedCost: 50,
        },
        {
          location: mockLocations[1],
          date: new Date(2026, 3, 3),
          startTime: '09:00',
          duration: 2,
          priority: 'high',
          reason: 'test',
          estimatedCost: 50,
        },
        {
          location: mockLocations[2],
          date: new Date(2026, 3, 3),
          startTime: '14:00',
          duration: 1,
          priority: 'medium',
          reason: 'test',
          estimatedCost: 30,
        },
      ];

      const optimized = optimizeVisitSequence(visits);

      expect(optimized.length).toBe(3);
      expect(optimized[0].priority).toBe('high');
      expect(optimized[0].date.getTime()).toBeLessThanOrEqual(optimized[1].date.getTime());
    });

    it('should not modify original array', () => {
      const visits: PlannedVisit[] = [
        {
          location: mockLocations[0],
          date: new Date(2026, 3, 5),
          startTime: '10:00',
          duration: 2,
          priority: 'low',
          reason: 'test',
          estimatedCost: 50,
        },
      ];

      const original = [...visits];
      optimizeVisitSequence(visits);

      expect(visits).toEqual(original);
    });

    it('should handle empty list', () => {
      const optimized = optimizeVisitSequence([]);
      expect(optimized).toEqual([]);
    });

    it('should handle single visit', () => {
      const visit: PlannedVisit = {
        location: mockLocations[0],
        date: new Date(2026, 3, 5),
        startTime: '10:00',
        duration: 2,
        priority: 'high',
        reason: 'test',
        estimatedCost: 50,
      };

      const optimized = optimizeVisitSequence([visit]);
      expect(optimized.length).toBe(1);
      expect(optimized[0]).toEqual(visit);
    });
  });

  describe('exportMonthlyPlanAsText', () => {
    it('should export valid text format', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);
      const text = exportMonthlyPlanAsText(plan);

      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('should include plan month', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);
      const text = exportMonthlyPlanAsText(plan);

      expect(text).toContain('MONTHLY FAMILY TRAVEL PLAN');
      expect(text).toContain('April 2026');
    });

    it('should include budget information', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);
      const text = exportMonthlyPlanAsText(plan);

      expect(text).toContain('BUDGET SUMMARY');
      expect(text).toContain('Total Budget:');
      expect(text).toContain('Estimated Cost:');
    });

    it('should include weekly breakdown', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);
      const text = exportMonthlyPlanAsText(plan);

      expect(text).toContain('WEEKLY BREAKDOWN');
      expect(text).toContain('Week 1:');
    });

    it('should include summary scores', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);
      const text = exportMonthlyPlanAsText(plan);

      expect(text).toContain('SUMMARY');
      expect(text).toContain('Family-Friendliness Score:');
      expect(text).toContain('Variety Score:');
      expect(text).toContain('Value for Money Score:');
    });

    it('should format currency correctly', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);
      const text = exportMonthlyPlanAsText(plan);

      expect(text).toMatch(/\$\d+(\.\d{2})?/);
    });
  });

  describe('edge cases', () => {
    it('should handle February in leap year', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2024, 1); // February 2024 (leap year)

      expect(plan).toBeDefined();
      expect(plan.weeklyPlans.length).toBeGreaterThan(0);
    });

    it('should handle December (year boundary)', () => {
      const plan = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 11); // December

      expect(plan).toBeDefined();
      expect(plan.month).toContain('December');
    });

    it('should handle very small budget', () => {
      const smallBudgetProfile = { ...familyProfile, maxBudget: 50 };
      const plan = generateMonthlyTravelPlan(mockLocations, smallBudgetProfile, 2026, 3);

      expect(plan.summary.valueForMoneyScore).toBeGreaterThan(0);
    });

    it('should handle large family', () => {
      const largeFamilyProfile = { ...familyProfile, childrenAges: [2, 5, 8, 12, 14] };
      const plan = generateMonthlyTravelPlan(mockLocations, largeFamilyProfile, 2026, 3);

      expect(plan).toBeDefined();
      expect(plan.weeklyPlans.length).toBeGreaterThan(0);
    });

    it('should handle very young children', () => {
      const babyProfile = { ...familyProfile, childrenAges: [0, 1] };
      const plan = generateMonthlyTravelPlan(mockLocations, babyProfile, 2026, 3);

      expect(plan).toBeDefined();
      const allVisits = plan.weeklyPlans.flatMap((w) => w.plannedVisits);
      expect(allVisits.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle no preferred days', () => {
      const anyDayProfile = { ...familyProfile, preferredDays: [] };
      const plan = generateMonthlyTravelPlan(mockLocations, anyDayProfile, 2026, 3);

      expect(plan).toBeDefined();
      expect(plan.weeklyPlans.length).toBeGreaterThan(0);
    });

    it('should handle single location', () => {
      const singleLocation = [mockLocations[0]];
      const plan = generateMonthlyTravelPlan(singleLocation, familyProfile, 2026, 3);

      expect(plan).toBeDefined();
      const allVisits = plan.weeklyPlans.flatMap((w) => w.plannedVisits);
      expect(allVisits.length).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('should handle 50 locations efficiently', () => {
      const manyLocations = Array.from({ length: 50 }, (_, i) => ({
        ...mockLocations[i % mockLocations.length],
        id: `loc-${i}`,
      }));

      const start = performance.now();
      const plan = generateMonthlyTravelPlan(manyLocations, familyProfile, 2026, 3);
      const end = performance.now();

      expect(plan).toBeDefined();
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should generate consistent results', () => {
      const plan1 = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);
      const plan2 = generateMonthlyTravelPlan(mockLocations, familyProfile, 2026, 3);

      expect(plan1.weeklyPlans.length).toBe(plan2.weeklyPlans.length);
      expect(plan1.estimatedCost).toBe(plan2.estimatedCost);
    });
  });
});
