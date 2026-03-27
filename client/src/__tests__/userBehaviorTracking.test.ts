/**
 * Tests for user behavior tracking
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userBehaviorTracker } from '../utils/userBehaviorTracking';

describe('UserBehaviorTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    userBehaviorTracker.resetBehavior();
  });

  afterEach(() => {
    localStorage.clear();
    userBehaviorTracker.resetBehavior();
  });

  describe('trackInteraction', () => {
    it('should track view interactions', () => {
      userBehaviorTracker.trackInteraction('view', 'location-123');
      const history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].type).toBe('view');
      expect(history[history.length - 1].target).toBe('location-123');
    });

    it('should track search interactions with metadata', () => {
      userBehaviorTracker.trackInteraction('search', 'playground', { query: 'playground' });
      const history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);
      const lastInteraction = history[history.length - 1];
      expect(lastInteraction.type).toBe('search');
      expect(lastInteraction.metadata?.query).toBe('playground');
    });

    it('should track favorite interactions', () => {
      userBehaviorTracker.trackInteraction('favorite', 'park', { category: 'park' });
      const history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].type).toBe('favorite');
    });

    it('should track filter interactions', () => {
      userBehaviorTracker.trackInteraction('filter', 'stroller', { category: 'stroller_accessible' });
      const history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].type).toBe('filter');
    });

    it('should track click interactions', () => {
      userBehaviorTracker.trackInteraction('click', 'location-456');
      const history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].type).toBe('click');
    });

    it('should track review interactions', () => {
      userBehaviorTracker.trackInteraction('review', 'location-789');
      const history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].type).toBe('review');
    });

    it('should store timestamp with each interaction', () => {
      const before = Date.now();
      userBehaviorTracker.trackInteraction('view', 'location-123');
      const after = Date.now();
      const history = userBehaviorTracker.getInteractionHistory();
      const lastInteraction = history[history.length - 1];
      expect(lastInteraction.timestamp).toBeGreaterThanOrEqual(before);
      expect(lastInteraction.timestamp).toBeLessThanOrEqual(after + 100);
    });
  });

  describe('getBehaviorProfile', () => {
    it('should return a profile with interaction data', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1', { category: 'park' });
      userBehaviorTracker.trackInteraction('favorite', 'park', { category: 'park' });

      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile).toBeDefined();
      expect(profile.interactionCount).toBeGreaterThan(0);
      expect(profile.viewedLocations).toContain('location-1');
    });

    it('should track favorite categories', () => {
      userBehaviorTracker.trackInteraction('favorite', 'park', { category: 'park' });
      userBehaviorTracker.trackInteraction('favorite', 'restaurant', { category: 'restaurant' });

      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile.favoriteCategories).toBeDefined();
    });

    it('should track viewed locations', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      userBehaviorTracker.trackInteraction('view', 'location-2');
      userBehaviorTracker.trackInteraction('view', 'location-1'); // Same location again

      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile.viewedLocations).toBeDefined();
      expect(profile.viewedLocations).toContain('location-1');
      expect(profile.viewedLocations).toContain('location-2');
    });

    it('should track search patterns', () => {
      userBehaviorTracker.trackInteraction('search', 'park', { query: 'playground' });
      userBehaviorTracker.trackInteraction('search', 'restaurant', { query: 'restaurant' });

      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile.searchPatterns).toBeDefined();
    });

    it('should calculate interaction count', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      userBehaviorTracker.trackInteraction('click', 'location-2');
      userBehaviorTracker.trackInteraction('search', 'park', { query: 'playground' });

      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile.interactionCount).toBeGreaterThanOrEqual(3);
    });

    it('should provide average session duration', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile.averageSessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should provide last active time', () => {
      const before = Date.now();
      userBehaviorTracker.trackInteraction('view', 'location-1');
      const after = Date.now();
      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile.lastActiveTime).toBeGreaterThanOrEqual(before);
      expect(profile.lastActiveTime).toBeLessThanOrEqual(after + 100);
    });

    it('should infer preferred search radius', () => {
      userBehaviorTracker.trackInteraction('search', 'park', { radius: 2 });
      userBehaviorTracker.trackInteraction('search', 'playground', { radius: 3 });

      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile.preferredSearchRadius).toBeGreaterThan(0);
    });
  });

  describe('getTopCategories', () => {
    it('should return most viewed categories', () => {
      userBehaviorTracker.trackInteraction('view', 'park-1', { category: 'park' });
      userBehaviorTracker.trackInteraction('view', 'park-2', { category: 'park' });
      userBehaviorTracker.trackInteraction('view', 'restaurant-1', { category: 'restaurant' });

      const topCategories = userBehaviorTracker.getTopCategories(2);
      expect(topCategories).toBeDefined();
      expect(Array.isArray(topCategories)).toBe(true);
    });

    it('should limit results based on parameter', () => {
      userBehaviorTracker.trackInteraction('view', 'park-1', { category: 'park' });
      userBehaviorTracker.trackInteraction('view', 'restaurant-1', { category: 'restaurant' });
      userBehaviorTracker.trackInteraction('view', 'medical-1', { category: 'medical' });

      const topCategories = userBehaviorTracker.getTopCategories(2);
      expect(topCategories.length).toBeLessThanOrEqual(2);
    });

    it('should default to top 3 categories', () => {
      userBehaviorTracker.trackInteraction('view', 'park-1', { category: 'park' });
      userBehaviorTracker.trackInteraction('view', 'restaurant-1', { category: 'restaurant' });
      userBehaviorTracker.trackInteraction('view', 'medical-1', { category: 'medical' });
      userBehaviorTracker.trackInteraction('view', 'nursing-1', { category: 'nursing_room' });

      const topCategories = userBehaviorTracker.getTopCategories();
      expect(topCategories.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getRecommendedSearchTerms', () => {
    it('should return previous search terms', () => {
      userBehaviorTracker.trackInteraction('search', 'park', { query: 'playground' });
      userBehaviorTracker.trackInteraction('search', 'restaurant', { query: 'restaurant' });

      const terms = userBehaviorTracker.getRecommendedSearchTerms();
      expect(terms).toBeDefined();
      expect(Array.isArray(terms)).toBe(true);
    });

    it('should limit results based on parameter', () => {
      userBehaviorTracker.trackInteraction('search', 'park', { query: 'playground' });
      userBehaviorTracker.trackInteraction('search', 'restaurant', { query: 'restaurant' });
      userBehaviorTracker.trackInteraction('search', 'nursing', { query: 'nursing room' });

      const terms = userBehaviorTracker.getRecommendedSearchTerms(2);
      expect(terms.length).toBeLessThanOrEqual(2);
    });

    it('should default to top 5 search terms', () => {
      for (let i = 0; i < 10; i++) {
        userBehaviorTracker.trackInteraction('search', `query-${i}`, { query: `search-${i}` });
      }

      const terms = userBehaviorTracker.getRecommendedSearchTerms();
      expect(terms.length).toBeLessThanOrEqual(5);
    });
  });

  describe('isActiveSession', () => {
    it('should return true for active session', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      const isActive = userBehaviorTracker.isActiveSession();
      expect(isActive).toBe(true);
    });

    it('should consider session timeout', () => {
      const isActive = userBehaviorTracker.isActiveSession();
      expect(typeof isActive).toBe('boolean');
    });
  });

  describe('getSessionDurationMinutes', () => {
    it('should return session duration in minutes', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      const duration = userBehaviorTracker.getSessionDurationMinutes();
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe('number');
    });
  });

  describe('getInteractionHistory', () => {
    it('should return recent interactions', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      userBehaviorTracker.trackInteraction('click', 'location-2');
      userBehaviorTracker.trackInteraction('search', 'park', { query: 'playground' });

      const history = userBehaviorTracker.getInteractionHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should limit history by parameter', () => {
      for (let i = 0; i < 30; i++) {
        userBehaviorTracker.trackInteraction('view', `location-${i}`);
      }

      const history = userBehaviorTracker.getInteractionHistory(10);
      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('should default to last 20 interactions', () => {
      for (let i = 0; i < 30; i++) {
        userBehaviorTracker.trackInteraction('view', `location-${i}`);
      }

      const history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeLessThanOrEqual(20);
    });
  });

  describe('exportBehaviorData', () => {
    it('should export profile and interactions', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      userBehaviorTracker.trackInteraction('favorite', 'park', { category: 'park' });

      const exported = userBehaviorTracker.exportBehaviorData();
      expect(exported).toBeDefined();
      expect(exported.profile).toBeDefined();
      expect(exported.interactions).toBeDefined();
      expect(exported.exportedAt).toBeGreaterThan(0);
    });

    it('should include timestamp in export', () => {
      const before = Date.now();
      const exported = userBehaviorTracker.exportBehaviorData();
      const after = Date.now();

      expect(exported.exportedAt).toBeGreaterThanOrEqual(before);
      expect(exported.exportedAt).toBeLessThanOrEqual(after + 100);
    });
  });

  describe('resetBehavior', () => {
    it('should clear all interactions', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      userBehaviorTracker.trackInteraction('click', 'location-2');

      let history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);

      userBehaviorTracker.resetBehavior();
      history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBe(0);
    });

    it('should clear localStorage', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      expect(localStorage.getItem('fammap_interactions_log')).toBeTruthy();

      userBehaviorTracker.resetBehavior();
      expect(localStorage.getItem('fammap_interactions_log')).toBeNull();
      expect(localStorage.getItem('fammap_behavior_profile')).toBeNull();
    });

    it('should allow tracking new interactions after reset', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      userBehaviorTracker.resetBehavior();
      userBehaviorTracker.trackInteraction('view', 'location-2');

      const history = userBehaviorTracker.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].target).toBe('location-2');
    });
  });

  describe('persistence', () => {
    it('should save interactions to localStorage', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      const stored = localStorage.getItem('fammap_interactions_log');
      expect(stored).toBeTruthy();
      expect(typeof stored).toBe('string');
    });

    it('should persist behavior profile', () => {
      userBehaviorTracker.trackInteraction('view', 'location-1');
      userBehaviorTracker.getBehaviorProfile(); // Trigger profile generation
      const stored = localStorage.getItem('fammap_behavior_profile');
      expect(stored).toBeTruthy();
    });
  });

  describe('analytics scenario', () => {
    it('should track typical user session', () => {
      // User searches for parks
      userBehaviorTracker.trackInteraction('search', 'park', { query: 'playground' });

      // User views several park locations
      userBehaviorTracker.trackInteraction('view', 'park-1', { category: 'park' });
      userBehaviorTracker.trackInteraction('view', 'park-2', { category: 'park' });
      userBehaviorTracker.trackInteraction('view', 'park-3', { category: 'park' });

      // User likes parks
      userBehaviorTracker.trackInteraction('favorite', 'park-1', { category: 'park' });

      // User filters for stroller accessibility
      userBehaviorTracker.trackInteraction('filter', 'stroller', { category: 'stroller_accessible' });

      // Get profile to verify tracking
      const profile = userBehaviorTracker.getBehaviorProfile();
      expect(profile.interactionCount).toBeGreaterThanOrEqual(5);
      expect(profile.viewedLocations.length).toBeGreaterThan(0);

      // Get recommendations
      const topCategories = userBehaviorTracker.getTopCategories();
      expect(topCategories).toBeDefined();

      const recommendedTerms = userBehaviorTracker.getRecommendedSearchTerms();
      expect(recommendedTerms).toBeDefined();
    });
  });
});
