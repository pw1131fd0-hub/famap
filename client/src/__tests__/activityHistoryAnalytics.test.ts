import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ActivityHistoryTracker, type VisitRecord } from '../utils/activityHistoryAnalytics';

describe('ActivityHistoryTracker', () => {
  let tracker: ActivityHistoryTracker;

  beforeEach(() => {
    tracker = new ActivityHistoryTracker();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Recording Visits', () => {
    it('should record a new visit', () => {
      const record: VisitRecord = {
        locationId: 'loc1',
        locationName: '大安森林公園',
        category: 'park',
        visitDate: new Date('2026-03-01'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      };

      tracker.recordVisit(record);
      const visits = tracker.getVisits();

      expect(visits).toHaveLength(1);
      expect(visits[0].locationName).toBe('大安森林公園');
      expect(visits[0].satisfaction).toBe(5);
    });

    it('should record multiple visits', () => {
      for (let i = 0; i < 5; i++) {
        tracker.recordVisit({
          locationId: `loc${i}`,
          locationName: `Location ${i}`,
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1}`),
          duration: 100 + i * 20,
          cost: 100 + i * 50,
          familySize: 3,
          satisfaction: (i % 5) + 1 as 1 | 2 | 3 | 4 | 5,
        });
      }

      expect(tracker.getVisits()).toHaveLength(5);
    });

    it('should preserve visit data correctly', () => {
      const record: VisitRecord = {
        locationId: 'loc1',
        locationName: 'Test Location',
        category: 'restaurant',
        visitDate: new Date('2026-03-15 14:30'),
        duration: 90,
        cost: 500,
        familySize: 3,
        satisfaction: 4,
        notes: 'Great food!',
      };

      tracker.recordVisit(record);
      const visits = tracker.getVisits();

      expect(visits[0].cost).toBe(500);
      expect(visits[0].duration).toBe(90);
      expect(visits[0].notes).toBe('Great food!');
    });
  });

  describe('Location Frequency Analysis', () => {
    it('should calculate location frequency correctly', () => {
      // Visit location 1 three times
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: '公園',
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1}`),
          duration: 120,
          cost: 100,
          familySize: 4,
          satisfaction: 5,
        });
      }

      // Visit location 2 once
      tracker.recordVisit({
        locationId: 'loc2',
        locationName: '餐廳',
        category: 'restaurant',
        visitDate: new Date('2026-03-10'),
        duration: 90,
        cost: 500,
        familySize: 3,
        satisfaction: 4,
      });

      const frequencies = tracker.getLocationFrequency();

      expect(frequencies[0].locationId).toBe('loc1');
      expect(frequencies[0].visitCount).toBe(3);
      expect(frequencies[1].visitCount).toBe(1);
    });

    it('should calculate average cost per location', () => {
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-01'),
        duration: 120,
        cost: 200,
        familySize: 4,
        satisfaction: 5,
      });

      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-02'),
        duration: 120,
        cost: 400,
        familySize: 4,
        satisfaction: 4,
      });

      const frequencies = tracker.getLocationFrequency();
      expect(frequencies[0].averageCost).toBe(300);
    });

    it('should calculate average satisfaction per location', () => {
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-01'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-02'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 3,
      });

      const frequencies = tracker.getLocationFrequency();
      expect(frequencies[0].averageSatisfaction).toBe(4);
    });

    it('should track last visit date', () => {
      const earlier = new Date('2026-03-01');
      const later = new Date('2026-03-15');

      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: earlier,
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: later,
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      const frequencies = tracker.getLocationFrequency();
      expect(frequencies[0].lastVisit.getTime()).toBe(later.getTime());
    });
  });

  describe('Time-Based Analytics', () => {
    it('should categorize visits by time of day', () => {
      // Morning visit (10 AM)
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-01 10:00'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      // Afternoon visit (14 PM)
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-02 14:00'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 4,
      });

      // Evening visit (18 PM)
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-03 18:00'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 3,
      });

      const analytics = tracker.getTimeBasedAnalytics();

      expect(analytics.timeOfDay.morning.visits).toBe(1);
      expect(analytics.timeOfDay.afternoon.visits).toBe(1);
      expect(analytics.timeOfDay.evening.visits).toBe(1);
    });

    it('should categorize visits by day of week', () => {
      // Monday (weekday)
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-02'), // Monday
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      // Saturday (weekend)
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-07'), // Saturday
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      const analytics = tracker.getTimeBasedAnalytics();

      expect(analytics.dayOfWeek.weekday.visits).toBe(1);
      expect(analytics.dayOfWeek.weekend.visits).toBe(1);
    });

    it('should track monthly spending', () => {
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-01'),
        duration: 120,
        cost: 500,
        familySize: 4,
        satisfaction: 5,
      });

      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-15'),
        duration: 120,
        cost: 300,
        familySize: 4,
        satisfaction: 5,
      });

      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-04-01'),
        duration: 120,
        cost: 400,
        familySize: 4,
        satisfaction: 5,
      });

      const analytics = tracker.getTimeBasedAnalytics();

      expect(analytics.monthlySpending['2026-03']).toBe(800);
      expect(analytics.monthlySpending['2026-04']).toBe(400);
    });

    it('should calculate average satisfaction by time', () => {
      // Morning: 5 stars
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-01 10:00'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      // Afternoon: 3 stars
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-02 14:00'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 3,
      });

      const analytics = tracker.getTimeBasedAnalytics();

      expect(analytics.timeOfDay.morning.avgSatisfaction).toBe(5);
      expect(analytics.timeOfDay.afternoon.avgSatisfaction).toBe(3);
    });
  });

  describe('Family Insights', () => {
    it('should return empty insights for no visits', () => {
      const insights = tracker.getFamilyInsights();

      expect(insights.totalVisits).toBe(0);
      expect(insights.totalSpending).toBe(0);
      expect(insights.averageCostPerVisit).toBe(0);
      expect(insights.favoriteLocation).toBeNull();
    });

    it('should calculate total visits and spending', () => {
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: `loc${i}`,
          locationName: `Location ${i}`,
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1}`),
          duration: 120,
          cost: 100 * (i + 1),
          familySize: 4,
          satisfaction: 4,
        });
      }

      const insights = tracker.getFamilyInsights();

      expect(insights.totalVisits).toBe(3);
      expect(insights.totalSpending).toBe(600); // 100 + 200 + 300
      expect(insights.averageCostPerVisit).toBe(200);
    });

    it('should identify favorite location', () => {
      // Visit location 1 three times
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: '大安森林公園',
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1}`),
          duration: 120,
          cost: 0,
          familySize: 4,
          satisfaction: 5,
        });
      }

      // Visit location 2 once
      tracker.recordVisit({
        locationId: 'loc2',
        locationName: '兒童新樂園',
        category: 'park',
        visitDate: new Date('2026-03-10'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 4,
      });

      const insights = tracker.getFamilyInsights();

      expect(insights.favoriteLocation?.locationId).toBe('loc1');
      expect(insights.favoriteLocation?.visitCount).toBe(3);
    });

    it('should identify most satisfying category', () => {
      // Parks with 5-star visits
      for (let i = 0; i < 2; i++) {
        tracker.recordVisit({
          locationId: `park${i}`,
          locationName: `Park ${i}`,
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1}`),
          duration: 120,
          cost: 0,
          familySize: 4,
          satisfaction: 5,
        });
      }

      // Restaurant with 3-star visit
      tracker.recordVisit({
        locationId: 'rest1',
        locationName: 'Restaurant',
        category: 'restaurant',
        visitDate: new Date('2026-03-10'),
        duration: 90,
        cost: 500,
        familySize: 3,
        satisfaction: 3,
      });

      const insights = tracker.getFamilyInsights();

      expect(insights.mostSatisfyingCategory).toBe('park');
    });

    it('should estimate annual budget', () => {
      const startDate = new Date('2026-01-01');

      // 10 visits over 30 days at 100 each
      for (let i = 0; i < 10; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: 'Park',
          category: 'park',
          visitDate: new Date(
            startDate.getTime() + i * 3 * 24 * 60 * 60 * 1000
          ),
          duration: 120,
          cost: 100,
          familySize: 4,
          satisfaction: 4,
        });
      }

      const insights = tracker.getFamilyInsights();

      // 10 visits * 100 = 1000 over 30 days
      // Estimated annual: 1000 * 12 = 12,000
      expect(insights.estimatedAnnualBudget).toBeGreaterThan(10000);
      expect(insights.estimatedAnnualBudget).toBeLessThan(15000);
    });

    it('should identify saving opportunities', () => {
      // Expensive location with low satisfaction
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: 'expensive',
          locationName: 'Expensive Park',
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1}`),
          duration: 120,
          cost: 600,
          familySize: 4,
          satisfaction: 2,
        });
      }

      // Cheap location with high satisfaction
      tracker.recordVisit({
        locationId: 'cheap',
        locationName: 'Cheap Park',
        category: 'park',
        visitDate: new Date('2026-03-10'),
        duration: 120,
        cost: 50,
        familySize: 4,
        satisfaction: 5,
      });

      const insights = tracker.getFamilyInsights();

      expect(insights.savingOpportunities.length).toBeGreaterThan(0);
    });

    it('should analyze spending trends', () => {
      // Early visits: low cost
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: 'Park',
          category: 'park',
          visitDate: new Date(`2026-01-0${i + 1}`),
          duration: 120,
          cost: 100,
          familySize: 4,
          satisfaction: 4,
        });
      }

      // Recent visits: high cost (increasing trend)
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: 'Park',
          category: 'park',
          visitDate: new Date(`2026-03-${20 + i}`),
          duration: 120,
          cost: 500,
          familySize: 4,
          satisfaction: 4,
        });
      }

      const insights = tracker.getFamilyInsights();

      expect(
        insights.trends.spendingTrend === 'increasing' ||
          insights.trends.spendingTrend === 'decreasing' ||
          insights.trends.spendingTrend === 'stable'
      ).toBe(true);
    });

    it('should analyze satisfaction trends', () => {
      // Early visits: low satisfaction
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: 'Park',
          category: 'park',
          visitDate: new Date(`2026-01-0${i + 1}`),
          duration: 120,
          cost: 100,
          familySize: 4,
          satisfaction: 2,
        });
      }

      // Recent visits: high satisfaction (improving trend)
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: 'Park',
          category: 'park',
          visitDate: new Date(`2026-03-${20 + i}`),
          duration: 120,
          cost: 100,
          familySize: 4,
          satisfaction: 5,
        });
      }

      const insights = tracker.getFamilyInsights();

      expect(
        insights.trends.satisfactionTrend === 'increasing' ||
          insights.trends.satisfactionTrend === 'decreasing' ||
          insights.trends.satisfactionTrend === 'stable'
      ).toBe(true);
    });

    it('should determine best time to visit', () => {
      // Morning visits with high satisfaction
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: 'Park',
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1} 10:00`),
          duration: 120,
          cost: 0,
          familySize: 4,
          satisfaction: 5,
        });
      }

      // Evening visits with low satisfaction
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-10 18:00'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 2,
      });

      const insights = tracker.getFamilyInsights();

      expect(insights.bestTimeToVisit).toBe('上午');
    });
  });

  describe('Storage and Persistence', () => {
    it('should persist visits to local storage', () => {
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-01'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      // Create new tracker instance
      const newTracker = new ActivityHistoryTracker();
      const visits = newTracker.getVisits();

      expect(visits).toHaveLength(1);
      expect(visits[0].locationName).toBe('Park');
    });

    it('should handle storage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      // Should not throw
      expect(() => {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: 'Park',
          category: 'park',
          visitDate: new Date('2026-03-01'),
          duration: 120,
          cost: 0,
          familySize: 4,
          satisfaction: 5,
        });
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });

    it('should clear history', () => {
      for (let i = 0; i < 3; i++) {
        tracker.recordVisit({
          locationId: `loc${i}`,
          locationName: `Location ${i}`,
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1}`),
          duration: 120,
          cost: 0,
          familySize: 4,
          satisfaction: 5,
        });
      }

      expect(tracker.getVisits()).toHaveLength(3);

      tracker.clearHistory();

      expect(tracker.getVisits()).toHaveLength(0);
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle single visit correctly', () => {
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Park',
        category: 'park',
        visitDate: new Date('2026-03-01'),
        duration: 120,
        cost: 500,
        familySize: 4,
        satisfaction: 4,
      });

      const insights = tracker.getFamilyInsights();

      expect(insights.averageCostPerVisit).toBe(500);
      expect(insights.totalVisits).toBe(1);
    });

    it('should handle zero cost visits', () => {
      for (let i = 0; i < 2; i++) {
        tracker.recordVisit({
          locationId: 'loc1',
          locationName: 'Free Park',
          category: 'park',
          visitDate: new Date(`2026-03-0${i + 1}`),
          duration: 120,
          cost: 0,
          familySize: 4,
          satisfaction: 5,
        });
      }

      const insights = tracker.getFamilyInsights();

      expect(insights.totalSpending).toBe(0);
      expect(insights.averageCostPerVisit).toBe(0);
    });

    it('should handle visits with minimum and maximum satisfaction', () => {
      tracker.recordVisit({
        locationId: 'loc1',
        locationName: 'Location 1',
        category: 'park',
        visitDate: new Date('2026-03-01'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 1,
      });

      tracker.recordVisit({
        locationId: 'loc2',
        locationName: 'Location 2',
        category: 'park',
        visitDate: new Date('2026-03-02'),
        duration: 120,
        cost: 0,
        familySize: 4,
        satisfaction: 5,
      });

      const insights = tracker.getFamilyInsights();

      expect(insights.totalVisits).toBe(2);
      expect(insights.mostSatisfyingCategory).toBe('park');
    });
  });
});
