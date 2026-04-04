import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadCheckIns,
  saveCheckIns,
  addCheckIn,
  removeCheckIn,
  getCheckInsForLocation,
  hasCheckedInToday,
  clearAllCheckIns,
  getEarnedBadges,
  getNewlyEarnedBadges,
  getExplorationStats,
  calculateWeeklyStreak,
  ALL_BADGES,
  type CheckIn,
} from '../utils/checkInSystem';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('checkInSystem', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  describe('loadCheckIns', () => {
    it('returns empty array when nothing saved', () => {
      expect(loadCheckIns()).toEqual([]);
    });

    it('returns saved check-ins', () => {
      const checkIn: CheckIn = {
        id: 'ci_1',
        locationId: 'loc1',
        locationName: 'Test Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      };
      localStorageMock.setItem('fammap_checkins', JSON.stringify([checkIn]));
      const result = loadCheckIns();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('ci_1');
    });

    it('returns empty array on parse error', () => {
      localStorageMock.setItem('fammap_checkins', 'invalid json{{{');
      expect(loadCheckIns()).toEqual([]);
    });
  });

  describe('saveCheckIns', () => {
    it('saves check-ins to localStorage', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci_2',
        locationId: 'loc2',
        locationName: 'Nursing Room',
        locationCategory: 'nursing_room',
        timestamp: new Date().toISOString(),
      }];
      saveCheckIns(checkIns);
      expect(loadCheckIns()).toHaveLength(1);
      expect(loadCheckIns()[0].id).toBe('ci_2');
    });
  });

  describe('addCheckIn', () => {
    it('adds a check-in with generated id and current timestamp', () => {
      const ci = addCheckIn('loc1', 'My Park', 'park');
      expect(ci.id).toMatch(/^ci_/);
      expect(ci.locationId).toBe('loc1');
      expect(ci.locationName).toBe('My Park');
      expect(ci.locationCategory).toBe('park');
      expect(ci.timestamp).toBeTruthy();
      expect(loadCheckIns()).toHaveLength(1);
    });

    it('accumulates multiple check-ins', () => {
      addCheckIn('loc1', 'Park A', 'park');
      addCheckIn('loc2', 'Restaurant B', 'restaurant');
      expect(loadCheckIns()).toHaveLength(2);
    });

    it('saves optional notes and childrenPresent', () => {
      const ci = addCheckIn('loc1', 'Park', 'park', 'Great visit!', 2);
      expect(ci.notes).toBe('Great visit!');
      expect(ci.childrenPresent).toBe(2);
    });
  });

  describe('removeCheckIn', () => {
    it('removes a check-in by id', () => {
      const ci = addCheckIn('loc1', 'Park', 'park');
      addCheckIn('loc2', 'Hospital', 'medical');
      removeCheckIn(ci.id);
      const remaining = loadCheckIns();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].locationId).toBe('loc2');
    });

    it('does not throw if id not found', () => {
      addCheckIn('loc1', 'Park', 'park');
      expect(() => removeCheckIn('nonexistent')).not.toThrow();
      expect(loadCheckIns()).toHaveLength(1);
    });
  });

  describe('getCheckInsForLocation', () => {
    it('returns only check-ins for a specific location', () => {
      addCheckIn('loc1', 'Park A', 'park');
      addCheckIn('loc2', 'Park B', 'park');
      addCheckIn('loc1', 'Park A', 'park');
      const result = getCheckInsForLocation('loc1');
      expect(result).toHaveLength(2);
      result.forEach((ci) => expect(ci.locationId).toBe('loc1'));
    });

    it('returns empty array when no check-ins for location', () => {
      addCheckIn('loc1', 'Park A', 'park');
      expect(getCheckInsForLocation('loc99')).toEqual([]);
    });
  });

  describe('hasCheckedInToday', () => {
    it('returns false when no check-ins for location', () => {
      expect(hasCheckedInToday('loc1')).toBe(false);
    });

    it('returns true after checking in today', () => {
      addCheckIn('loc1', 'Park', 'park');
      expect(hasCheckedInToday('loc1')).toBe(true);
    });

    it('returns false for check-in on different date', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      const checkIn: CheckIn = {
        id: 'ci_old',
        locationId: 'loc1',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: past.toISOString(),
      };
      saveCheckIns([checkIn]);
      expect(hasCheckedInToday('loc1')).toBe(false);
    });
  });

  describe('clearAllCheckIns', () => {
    it('removes all check-ins', () => {
      addCheckIn('loc1', 'Park', 'park');
      addCheckIn('loc2', 'Restaurant', 'restaurant');
      clearAllCheckIns();
      expect(loadCheckIns()).toEqual([]);
    });
  });

  describe('getEarnedBadges', () => {
    it('returns empty array for no check-ins', () => {
      expect(getEarnedBadges([])).toEqual([]);
    });

    it('earns first_step badge after one check-in', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }];
      const badges = getEarnedBadges(checkIns);
      const ids = badges.map((b) => b.id);
      expect(ids).toContain('first_step');
      expect(ids).toContain('park_explorer');
    });

    it('earns adventurer_5 badge after 5 check-ins', () => {
      const checkIns: CheckIn[] = Array.from({ length: 5 }, (_, i) => ({
        id: `ci${i}`,
        locationId: `loc${i}`,
        locationName: `Location ${i}`,
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }));
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).toContain('adventurer_5');
    });

    it('earns all_categories badge when all categories visited', () => {
      const categories = ['park', 'nursing_room', 'restaurant', 'medical'];
      const checkIns: CheckIn[] = categories.map((cat, i) => ({
        id: `ci${i}`,
        locationId: `loc${i}`,
        locationName: cat,
        locationCategory: cat,
        timestamp: new Date().toISOString(),
      }));
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).toContain('all_categories');
    });

    it('earns nursing_pioneer for nursing_room check-in', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Nursing Room',
        locationCategory: 'nursing_room',
        timestamp: new Date().toISOString(),
      }];
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).toContain('nursing_pioneer');
    });

    it('earns foodie_family for restaurant check-in', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Restaurant',
        locationCategory: 'restaurant',
        timestamp: new Date().toISOString(),
      }];
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).toContain('foodie_family');
    });

    it('earns health_guardian for medical check-in', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Clinic',
        locationCategory: 'medical',
        timestamp: new Date().toISOString(),
      }];
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).toContain('health_guardian');
    });

    it('earns unique_5 badge after 5 unique locations', () => {
      const checkIns: CheckIn[] = Array.from({ length: 5 }, (_, i) => ({
        id: `ci${i}`,
        locationId: `unique_loc_${i}`,
        locationName: `Location ${i}`,
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }));
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).toContain('unique_5');
    });

    it('does not earn unique_5 for repeated same location', () => {
      const checkIns: CheckIn[] = Array.from({ length: 5 }, (_, i) => ({
        id: `ci${i}`,
        locationId: 'same_location',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }));
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).not.toContain('unique_5');
    });

    it('earns weekend_warrior for 3 weekend check-ins', () => {
      // Create dates that are Sunday (day=0)
      const sundayDates = Array.from({ length: 3 }, (_, i) => {
        const d = new Date('2024-01-07'); // Sunday
        d.setDate(d.getDate() + i * 7);
        return d.toISOString();
      });
      const checkIns: CheckIn[] = sundayDates.map((ts, i) => ({
        id: `ci${i}`,
        locationId: `loc${i}`,
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: ts,
      }));
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).toContain('weekend_warrior');
    });

    it('does not earn explorer_10 with only 5 check-ins', () => {
      const checkIns: CheckIn[] = Array.from({ length: 5 }, (_, i) => ({
        id: `ci${i}`,
        locationId: `loc${i}`,
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }));
      const badges = getEarnedBadges(checkIns);
      expect(badges.map((b) => b.id)).not.toContain('explorer_10');
    });

    it('sets earnedAt on badges', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: '2024-06-15T10:00:00Z',
      }];
      const badges = getEarnedBadges(checkIns);
      const firstStep = badges.find((b) => b.id === 'first_step');
      expect(firstStep?.earnedAt).toBe('2024-06-15T10:00:00Z');
    });
  });

  describe('getNewlyEarnedBadges', () => {
    it('returns new badges not in previous set', () => {
      const previous: CheckIn[] = [];
      const current: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }];
      const newBadges = getNewlyEarnedBadges(previous, current);
      expect(newBadges.length).toBeGreaterThan(0);
      expect(newBadges.map((b) => b.id)).toContain('first_step');
    });

    it('returns empty array when no new badges earned', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }];
      // Same check-ins, same badges
      const newBadges = getNewlyEarnedBadges(checkIns, checkIns);
      expect(newBadges).toEqual([]);
    });
  });

  describe('calculateWeeklyStreak', () => {
    it('returns 0 for empty check-ins', () => {
      expect(calculateWeeklyStreak([])).toBe(0);
    });

    it('returns at least 0 for any check-ins', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }];
      expect(calculateWeeklyStreak(checkIns)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getExplorationStats', () => {
    it('returns zero stats for empty check-ins', () => {
      const stats = getExplorationStats([]);
      expect(stats.totalCheckIns).toBe(0);
      expect(stats.uniqueLocations).toBe(0);
      expect(stats.categoriesVisited).toEqual([]);
      expect(stats.earnedBadges).toEqual([]);
      expect(stats.firstCheckIn).toBeUndefined();
      expect(stats.latestCheckIn).toBeUndefined();
    });

    it('returns correct total and unique counts', () => {
      const checkIns: CheckIn[] = [
        { id: 'ci1', locationId: 'l1', locationName: 'Park A', locationCategory: 'park', timestamp: '2024-01-01T10:00:00Z' },
        { id: 'ci2', locationId: 'l1', locationName: 'Park A', locationCategory: 'park', timestamp: '2024-01-08T10:00:00Z' },
        { id: 'ci3', locationId: 'l2', locationName: 'Restaurant', locationCategory: 'restaurant', timestamp: '2024-01-15T10:00:00Z' },
      ];
      const stats = getExplorationStats(checkIns);
      expect(stats.totalCheckIns).toBe(3);
      expect(stats.uniqueLocations).toBe(2);
      expect(stats.categoriesVisited).toContain('park');
      expect(stats.categoriesVisited).toContain('restaurant');
    });

    it('sets firstCheckIn and latestCheckIn correctly', () => {
      const checkIns: CheckIn[] = [
        { id: 'ci1', locationId: 'l1', locationName: 'Park', locationCategory: 'park', timestamp: '2024-03-01T10:00:00Z' },
        { id: 'ci2', locationId: 'l2', locationName: 'Restaurant', locationCategory: 'restaurant', timestamp: '2024-01-01T10:00:00Z' },
      ];
      const stats = getExplorationStats(checkIns);
      expect(stats.firstCheckIn).toBe('2024-01-01T10:00:00Z');
      expect(stats.latestCheckIn).toBe('2024-03-01T10:00:00Z');
    });

    it('includes earned badges in stats', () => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }];
      const stats = getExplorationStats(checkIns);
      expect(stats.earnedBadges.length).toBeGreaterThan(0);
    });
  });

  describe('ALL_BADGES', () => {
    it('contains expected badge IDs', () => {
      const ids = ALL_BADGES.map((b) => b.id);
      expect(ids).toContain('first_step');
      expect(ids).toContain('park_explorer');
      expect(ids).toContain('nursing_pioneer');
      expect(ids).toContain('foodie_family');
      expect(ids).toContain('health_guardian');
      expect(ids).toContain('adventurer_5');
      expect(ids).toContain('explorer_10');
      expect(ids).toContain('veteran_25');
      expect(ids).toContain('all_categories');
      expect(ids).toContain('unique_5');
      expect(ids).toContain('unique_10');
      expect(ids).toContain('weekend_warrior');
    });

    it('all badges have required bilingual fields', () => {
      ALL_BADGES.forEach((badge) => {
        expect(badge.name_zh).toBeTruthy();
        expect(badge.name_en).toBeTruthy();
        expect(badge.description_zh).toBeTruthy();
        expect(badge.description_en).toBeTruthy();
        expect(badge.icon).toBeTruthy();
        expect(typeof badge.condition).toBe('function');
      });
    });

    it('all badge IDs are unique', () => {
      const ids = ALL_BADGES.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
