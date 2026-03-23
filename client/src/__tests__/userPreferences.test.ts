import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initializePreferences,
  loadPreferences,
  savePreferences,
  recordLocationView,
  recordSearch,
  recordLocationSave,
  recordLocationUnsave,
  setChildAgeRange,
  calculateLocationPreferenceScore,
  getPersonalizedRecommendations,
  getPreferenceSummary,
  clearPreferences,
} from '../utils/userPreferences';

describe('User Preferences System', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initializePreferences', () => {
    it('should create empty preferences', () => {
      const prefs = initializePreferences();
      expect(prefs.preferredCategories).toEqual([]);
      expect(prefs.preferredFacilities).toEqual([]);
      expect(prefs.childAgeRange).toBeNull();
      expect(prefs.interactionCount).toBe(0);
    });

    it('should have non-null timestamps', () => {
      const prefs = initializePreferences();
      expect(prefs.lastUpdatedAt).toBeDefined();
      expect(new Date(prefs.lastUpdatedAt)).toBeInstanceOf(Date);
    });
  });

  describe('savePreferences and loadPreferences', () => {
    it('should save and load preferences from localStorage', () => {
      const prefs = initializePreferences();
      prefs.preferredCategories = [{ category: 'park', score: 10 }];
      prefs.childAgeRange = [2, 5];

      savePreferences(prefs);
      const loaded = loadPreferences();

      expect(loaded.preferredCategories).toEqual([{ category: 'park', score: 10 }]);
      expect(loaded.childAgeRange).toEqual([2, 5]);
    });

    it('should convert savedLocations back to Set', () => {
      const prefs = initializePreferences();
      prefs.savedLocations.add('loc-1');
      prefs.savedLocations.add('loc-2');

      savePreferences(prefs);
      const loaded = loadPreferences();

      expect(loaded.savedLocations).toBeInstanceOf(Set);
      expect(loaded.savedLocations.has('loc-1')).toBe(true);
      expect(loaded.savedLocations.has('loc-2')).toBe(true);
    });

    it('should handle invalid localStorage gracefully', () => {
      localStorage.setItem('famap_user_preferences', 'invalid json');
      const prefs = loadPreferences();
      expect(prefs.interactionCount).toBe(0);
    });
  });

  describe('recordLocationView', () => {
    it('should record first location view', () => {
      const prefs = initializePreferences();
      const location = {
        category: 'park',
        facilities: ['playground', 'restroom'],
        averageRating: 4.5,
      };

      const updated = recordLocationView(prefs, 'park-1', location);

      expect(updated.viewedLocations).toHaveLength(1);
      expect(updated.viewedLocations[0].locationId).toBe('park-1');
      expect(updated.viewedLocations[0].viewCount).toBe(1);
      expect(updated.interactionCount).toBe(1);
    });

    it('should increment view count for repeated views', () => {
      let prefs = initializePreferences();
      const location = { category: 'park' };

      prefs = recordLocationView(prefs, 'park-1', location);
      prefs = recordLocationView(prefs, 'park-1', location);
      prefs = recordLocationView(prefs, 'park-1', location);

      expect(prefs.viewedLocations[0].viewCount).toBe(3);
      expect(prefs.interactionCount).toBe(3);
    });

    it('should update category preferences', () => {
      const prefs = initializePreferences();
      const location = { category: 'park' };

      const updated = recordLocationView(prefs, 'park-1', location);

      expect(updated.preferredCategories).toContainEqual(
        expect.objectContaining({ category: 'park', score: 5 })
      );
    });

    it('should update facility preferences', () => {
      const prefs = initializePreferences();
      const location = {
        category: 'park',
        facilities: ['playground', 'restroom'],
      };

      const updated = recordLocationView(prefs, 'park-1', location);

      expect(updated.preferredFacilities.length).toBeGreaterThanOrEqual(2);
      expect(updated.preferredFacilities.some((f) => f.facility === 'playground')).toBe(true);
      expect(updated.preferredFacilities.some((f) => f.facility === 'restroom')).toBe(true);
    });

    it('should maintain max viewed locations limit', () => {
      let prefs = initializePreferences();
      const location = { category: 'park' };

      for (let i = 0; i < 150; i++) {
        prefs = recordLocationView(prefs, `park-${i}`, location);
      }

      expect(prefs.viewedLocations.length).toBeLessThanOrEqual(100);
    });

    it('should sort preferences by score', () => {
      let prefs = initializePreferences();
      prefs = recordLocationView(prefs, 'loc-1', { category: 'park' });
      prefs = recordLocationView(prefs, 'loc-2', { category: 'restaurant' });
      prefs = recordLocationView(prefs, 'loc-1', { category: 'park' });

      const scores = prefs.preferredCategories.map((c) => c.score);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });
  });

  describe('recordSearch', () => {
    it('should record search with query and result count', () => {
      const prefs = initializePreferences();
      const updated = recordSearch(prefs, 'playground near me', 5);

      expect(updated.searchHistory).toHaveLength(1);
      expect(updated.searchHistory[0].query).toBe('playground near me');
      expect(updated.searchHistory[0].resultCount).toBe(5);
    });

    it('should maintain search history order', () => {
      let prefs = initializePreferences();
      prefs = recordSearch(prefs, 'query1', 1);
      prefs = recordSearch(prefs, 'query2', 2);
      prefs = recordSearch(prefs, 'query3', 3);

      expect(prefs.searchHistory.map((s) => s.query)).toEqual(['query1', 'query2', 'query3']);
    });

    it('should limit search history to max entries', () => {
      let prefs = initializePreferences();
      for (let i = 0; i < 30; i++) {
        prefs = recordSearch(prefs, `query-${i}`, 1);
      }

      expect(prefs.searchHistory.length).toBeLessThanOrEqual(20);
    });
  });

  describe('recordLocationSave and recordLocationUnsave', () => {
    it('should add location to saved locations', () => {
      const prefs = initializePreferences();
      const updated = recordLocationSave(prefs, 'park-1');

      expect(updated.savedLocations.has('park-1')).toBe(true);
    });

    it('should not duplicate saved locations', () => {
      let prefs = initializePreferences();
      prefs = recordLocationSave(prefs, 'park-1');
      prefs = recordLocationSave(prefs, 'park-1');

      expect(prefs.savedLocations.size).toBe(1);
    });

    it('should remove location from saved locations', () => {
      let prefs = initializePreferences();
      prefs = recordLocationSave(prefs, 'park-1');
      prefs = recordLocationUnsave(prefs, 'park-1');

      expect(prefs.savedLocations.has('park-1')).toBe(false);
    });

    it('should update save count in view record', () => {
      let prefs = initializePreferences();
      prefs = recordLocationView(prefs, 'park-1', { category: 'park' });
      prefs = recordLocationSave(prefs, 'park-1');

      const viewRecord = prefs.viewedLocations.find((v) => v.locationId === 'park-1');
      expect(viewRecord?.saveCount).toBe(1);
    });
  });

  describe('setChildAgeRange', () => {
    it('should set child age range', () => {
      const prefs = initializePreferences();
      const updated = setChildAgeRange(prefs, 2, 8);

      expect(updated.childAgeRange).toEqual([2, 8]);
    });

    it('should update existing age range', () => {
      let prefs = initializePreferences();
      prefs = setChildAgeRange(prefs, 2, 5);
      prefs = setChildAgeRange(prefs, 3, 10);

      expect(prefs.childAgeRange).toEqual([3, 10]);
    });
  });

  describe('calculateLocationPreferenceScore', () => {
    it('should score location based on category match', () => {
      const prefs = initializePreferences();
      const updated = recordLocationView(prefs, 'park-1', { category: 'park' });

      const location = { category: 'park' };
      const score = calculateLocationPreferenceScore(location, updated);

      expect(score).toBeGreaterThan(0);
    });

    it('should boost score for high-rated locations', () => {
      const prefs = initializePreferences();
      const lowRatedLoc = { category: 'park', averageRating: 2 };
      const highRatedLoc = { category: 'park', averageRating: 4.5 };

      const lowScore = calculateLocationPreferenceScore(lowRatedLoc, prefs);
      const highScore = calculateLocationPreferenceScore(highRatedLoc, prefs);

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should score zero for unknown categories', () => {
      const prefs = initializePreferences();
      const location = { category: 'unknown-category' };

      const score = calculateLocationPreferenceScore(location, prefs);
      expect(score).toBe(0);
    });

    it('should consider facility matches', () => {
      let prefs = initializePreferences();
      prefs = recordLocationView(prefs, 'park-1', {
        category: 'park',
        facilities: ['playground', 'restroom'],
      });

      const location = {
        category: 'park',
        facilities: ['playground', 'restroom'],
      };
      const score = calculateLocationPreferenceScore(location, prefs);

      expect(score).toBeGreaterThan(0);
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should recommend locations matching user preferences', () => {
      let prefs = initializePreferences();
      prefs = recordLocationView(prefs, 'loc-1', { category: 'park' });

      const locations = [
        { id: 'park-1', category: 'park' },
        { id: 'rest-1', category: 'restaurant' },
        { id: 'park-2', category: 'park' },
      ];

      const recs = getPersonalizedRecommendations(locations, prefs, 2);
      expect(recs).toHaveLength(2);
      expect(recs[0]).toBe('park-1');
    });

    it('should respect limit parameter', () => {
      const prefs = initializePreferences();
      const locations = Array.from({ length: 10 }, (_, i) => ({
        id: `loc-${i}`,
        category: 'park',
      }));

      const recs = getPersonalizedRecommendations(locations, prefs, 3);
      expect(recs).toHaveLength(3);
    });

    it('should return empty array for empty locations', () => {
      const prefs = initializePreferences();
      const recs = getPersonalizedRecommendations([], prefs);
      expect(recs).toEqual([]);
    });
  });

  describe('getPreferenceSummary', () => {
    it('should summarize user preferences', () => {
      let prefs = initializePreferences();
      prefs = recordLocationView(prefs, 'park-1', { category: 'park' });
      prefs = setChildAgeRange(prefs, 2, 5);

      const summary = getPreferenceSummary(prefs);

      expect(summary.topCategories).toContain('park');
      expect(summary.totalInteractions).toBe(1);
      expect(summary.childAgeRange).toBe('2-5 years');
    });

    it('should handle empty preferences', () => {
      const prefs = initializePreferences();
      const summary = getPreferenceSummary(prefs);

      expect(summary.topCategories).toEqual([]);
      expect(summary.topFacilities).toEqual([]);
      expect(summary.totalInteractions).toBe(0);
    });
  });

  describe('clearPreferences', () => {
    it('should clear all preferences from localStorage', () => {
      const prefs = initializePreferences();
      savePreferences(prefs);

      clearPreferences();

      localStorage.getItem('famap_user_preferences');
      expect(localStorage.getItem('famap_user_preferences')).toBeNull();
    });
  });

  describe('Integration tests', () => {
    it('should maintain consistent state through multiple operations', () => {
      let prefs = initializePreferences();

      prefs = recordLocationView(prefs, 'park-1', {
        category: 'park',
        facilities: ['playground'],
      });
      prefs = recordLocationSave(prefs, 'park-1');
      prefs = recordSearch(prefs, 'parks with playgrounds', 1);
      prefs = setChildAgeRange(prefs, 3, 6);

      savePreferences(prefs);
      const loaded = loadPreferences();

      expect(loaded.interactionCount).toBe(1);
      expect(loaded.savedLocations.has('park-1')).toBe(true);
      expect(loaded.searchHistory).toHaveLength(1);
      expect(loaded.childAgeRange).toEqual([3, 6]);
    });

    it('should adapt recommendations as user interacts', () => {
      let prefs = initializePreferences();
      const locations = [
        { id: 'park-1', category: 'park' },
        { id: 'rest-1', category: 'restaurant' },
      ];

      // User views parks multiple times
      prefs = recordLocationView(prefs, 'park-1', { category: 'park' });
      prefs = recordLocationView(prefs, 'park-1', { category: 'park' });

      const recs = getPersonalizedRecommendations(locations, prefs, 1);
      expect(recs[0]).toBe('park-1');
    });
  });
});
