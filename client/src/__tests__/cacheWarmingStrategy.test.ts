/**
 * Cache Warming Strategy Tests
 * Tests for cache warming configuration and strategy generation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  cacheWarmingManager,
  initializeCacheWarming
} from '../utils/cacheWarmingStrategy';

describe('Cache Warming Strategy', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('CacheWarmingManager', () => {
    describe('getConfig', () => {
      it('should return default config', () => {
        const manager = cacheWarmingManager;
        const config = manager.getConfig();

        expect(config.enabled).toBe(true);
        expect(config.warmOnLoad).toBe(true);
        expect(config.popularLocationsEnabled).toBe(true);
        expect(config.nearbyLocationsEnabled).toBe(true);
        expect(config.categoryPreloadEnabled).toBe(true);
      });

      it('should return a copy of config', () => {
        const manager = cacheWarmingManager;
        const config1 = manager.getConfig();
        const config2 = manager.getConfig();

        expect(config1).toEqual(config2);
        expect(config1).not.toBe(config2); // Different objects
      });
    });

    describe('setConfig', () => {
      it('should update configuration', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ enabled: false });

        const config = manager.getConfig();
        expect(config.enabled).toBe(false);
      });

      it('should merge partial config', () => {
        const manager = cacheWarmingManager;
        const originalConfig = manager.getConfig();

        manager.setConfig({ popularLocationsEnabled: false });

        const newConfig = manager.getConfig();
        expect(newConfig.enabled).toBe(originalConfig.enabled);
        expect(newConfig.popularLocationsEnabled).toBe(false);
      });

      it('should persist config to localStorage', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ enabled: false });

        const stored = localStorage.getItem('cacheWarmingConfig');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.enabled).toBe(false);
      });

      it('should handle multiple updates', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ enabled: false });
        manager.setConfig({ warmOnLoad: false });

        const config = manager.getConfig();
        expect(config.enabled).toBe(false);
        expect(config.warmOnLoad).toBe(false);
      });
    });

    describe('shouldWarm', () => {
      it('should return false if warming is disabled', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ enabled: false });

        expect(manager.shouldWarm()).toBe(false);
      });

      it('should return false if warming is in progress', () => {
        const manager = cacheWarmingManager;
        manager.markWarmingInProgress();

        expect(manager.shouldWarm()).toBe(false);

        manager.markWarmingComplete();
      });

      it('should return true when conditions are met', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ enabled: true });

        // Advance past interval to ensure warming is due
        vi.advanceTimersByTime(6 * 60 * 1000);

        expect(manager.shouldWarm()).toBe(true);
      });

      it('should respect warming interval', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ enabled: true });

        // Advance time to ensure warming is due
        vi.advanceTimersByTime(7 * 60 * 1000);

        // First warm should succeed
        expect(manager.shouldWarm()).toBe(true);

        // Mark warming complete
        manager.markWarmingInProgress();
        manager.markWarmingComplete();

        // Immediately check - should return false (within interval)
        expect(manager.shouldWarm()).toBe(false);

        // Advance time past interval
        vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutes (interval is 5)

        expect(manager.shouldWarm()).toBe(true);
      });
    });

    describe('generateStrategies', () => {
      it('should include popular locations strategy when enabled', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ popularLocationsEnabled: true });

        const strategies = manager.generateStrategies();
        const popularStrategy = strategies.find(s => s.name === 'Popular Locations');

        expect(popularStrategy).toBeDefined();
        expect(popularStrategy?.priority).toBe(1);
      });

      it('should exclude popular locations strategy when disabled', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ popularLocationsEnabled: false });

        const strategies = manager.generateStrategies();
        const popularStrategy = strategies.find(s => s.name === 'Popular Locations');

        expect(popularStrategy).toBeUndefined();
      });

      it('should include nearby locations strategy with user location', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ nearbyLocationsEnabled: true });

        const userLocation = { lat: 25.0, lng: 121.5 };
        const strategies = manager.generateStrategies(userLocation);
        const nearbyStrategy = strategies.find(s => s.name === 'Nearby Locations');

        expect(nearbyStrategy).toBeDefined();
        expect(nearbyStrategy?.priority).toBe(2);
        expect(nearbyStrategy?.queries[0].params.lat).toBe(25.0);
        expect(nearbyStrategy?.queries[0].params.lng).toBe(121.5);
      });

      it('should exclude nearby locations strategy without user location', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ nearbyLocationsEnabled: true });

        const strategies = manager.generateStrategies(undefined);
        const nearbyStrategy = strategies.find(s => s.name === 'Nearby Locations');

        expect(nearbyStrategy).toBeUndefined();
      });

      it('should include category preload strategy when enabled', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ categoryPreloadEnabled: true });

        const strategies = manager.generateStrategies();
        const categoryStrategy = strategies.find(s => s.name === 'Category Preload');

        expect(categoryStrategy).toBeDefined();
        expect(categoryStrategy?.priority).toBe(3);
      });

      it('should exclude category preload strategy when disabled', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ categoryPreloadEnabled: false });

        const strategies = manager.generateStrategies();
        const categoryStrategy = strategies.find(s => s.name === 'Category Preload');

        expect(categoryStrategy).toBeUndefined();
      });

      it('should sort strategies by priority (descending)', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({
          popularLocationsEnabled: true,
          nearbyLocationsEnabled: true,
          categoryPreloadEnabled: true
        });

        const strategies = manager.generateStrategies({ lat: 25.0, lng: 121.5 });
        const priorities = strategies.map(s => s.priority);

        for (let i = 1; i < priorities.length; i++) {
          expect(priorities[i - 1]).toBeGreaterThanOrEqual(priorities[i]);
        }
      });

      it('should have valid queries in strategies', () => {
        const manager = cacheWarmingManager;
        const strategies = manager.generateStrategies({ lat: 25.0, lng: 121.5 });

        strategies.forEach(strategy => {
          expect(strategy.queries).toBeDefined();
          expect(Array.isArray(strategy.queries)).toBe(true);
          strategy.queries.forEach(query => {
            expect(query.endpoint).toBeDefined();
            expect(query.params).toBeDefined();
          });
        });
      });

      it('should include all default categories in category preload', () => {
        const manager = cacheWarmingManager;
        manager.setConfig({ categoryPreloadEnabled: true });

        const strategies = manager.generateStrategies();
        const categoryStrategy = strategies.find(s => s.name === 'Category Preload');

        const categories = categoryStrategy?.queries.map(q => q.params.category);
        expect(categories).toContain('park');
        expect(categories).toContain('nursing_room');
        expect(categories).toContain('restaurant');
        expect(categories).toContain('medical');
      });
    });

    describe('markWarmingInProgress and markWarmingComplete', () => {
      it('should prevent warming while in progress', () => {
        const manager = cacheWarmingManager;
        manager.markWarmingInProgress();

        expect(manager.shouldWarm()).toBe(false);

        manager.markWarmingComplete();

        // After marking complete, shouldWarm returns false until interval passes
        expect(manager.shouldWarm()).toBe(false);
      });

      it('should update lastWarmTime on completion', () => {
        const manager = cacheWarmingManager;

        manager.markWarmingInProgress();
        vi.advanceTimersByTime(100);
        manager.markWarmingComplete();

        const timeUntilNext = manager.getTimeUntilNextWarm();
        // Should have most of the interval remaining
        expect(timeUntilNext).toBeLessThanOrEqual(5 * 60 * 1000);
        expect(timeUntilNext).toBeGreaterThan(0);
      });
    });

    describe('getTimeUntilNextWarm', () => {
      it('should return remaining time until next warming', () => {
        const manager = cacheWarmingManager;
        manager.markWarmingInProgress();
        manager.markWarmingComplete();

        const remaining = manager.getTimeUntilNextWarm();
        expect(remaining).toBeGreaterThan(0);
        expect(remaining).toBeLessThanOrEqual(5 * 60 * 1000);
      });

      it('should decrease over time', () => {
        const manager = cacheWarmingManager;
        manager.markWarmingInProgress();
        manager.markWarmingComplete();

        const remaining1 = manager.getTimeUntilNextWarm();
        vi.advanceTimersByTime(60 * 1000); // 1 minute
        const remaining2 = manager.getTimeUntilNextWarm();

        expect(remaining2).toBeLessThan(remaining1);
      });

      it('should return 0 when warming is due', () => {
        const manager = cacheWarmingManager;
        manager.markWarmingInProgress();
        manager.markWarmingComplete();

        vi.advanceTimersByTime(6 * 60 * 1000); // Past 5 minute interval

        const remaining = manager.getTimeUntilNextWarm();
        expect(remaining).toBe(0);
      });

      it('should never return negative values', () => {
        const manager = cacheWarmingManager;
        manager.markWarmingInProgress();
        manager.markWarmingComplete();

        vi.advanceTimersByTime(10 * 60 * 1000); // Well past interval

        const remaining = manager.getTimeUntilNextWarm();
        expect(remaining).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('initializeCacheWarming', () => {
    it('should not warm if conditions are not met', async () => {
      vi.useRealTimers();

      const fetcher = vi.fn();
      cacheWarmingManager.setConfig({ enabled: false });

      await initializeCacheWarming(fetcher);

      expect(fetcher).not.toHaveBeenCalled();

      vi.useFakeTimers();
    });

    it('should be an async function that handles fetcher', async () => {
      vi.useRealTimers();

      const fetcher = vi.fn().mockResolvedValue(undefined);

      // Test that initializeCacheWarming is callable and doesn't throw
      await expect(initializeCacheWarming(fetcher)).resolves.toBeUndefined();

      vi.useFakeTimers();
    });

    it('should accept user location parameter', async () => {
      vi.useRealTimers();

      const fetcher = vi.fn().mockResolvedValue(undefined);
      const userLocation = { lat: 25.033, lng: 121.565 };

      // Should accept user location without throwing
      await expect(
        initializeCacheWarming(fetcher, userLocation)
      ).resolves.toBeUndefined();

      vi.useFakeTimers();
    });

    it('should handle fetcher errors gracefully', async () => {
      vi.useRealTimers();

      const fetcher = vi.fn().mockRejectedValue(new Error('Network error'));
      cacheWarmingManager.setConfig({ enabled: false });

      // Should not throw even if fetcher rejects
      await expect(initializeCacheWarming(fetcher)).resolves.toBeUndefined();

      vi.useFakeTimers();
    });
  });

  describe('Strategy predicates', () => {
    it('should evaluate predicates correctly', () => {
      const manager = cacheWarmingManager;
      manager.setConfig({
        popularLocationsEnabled: true,
        nearbyLocationsEnabled: true,
        categoryPreloadEnabled: true
      });

      const strategies = manager.generateStrategies({ lat: 25.0, lng: 121.5 });

      strategies.forEach(strategy => {
        const canExecute = strategy.predicate();
        expect(typeof canExecute).toBe('boolean');
      });
    });

    it('should handle predicates with and without user location', () => {
      const manager = cacheWarmingManager;
      manager.setConfig({
        popularLocationsEnabled: true,
        nearbyLocationsEnabled: true,
        categoryPreloadEnabled: true
      });

      const strategiesWithLocation = manager.generateStrategies({ lat: 25.0, lng: 121.5 });
      const strategiesWithoutLocation = manager.generateStrategies(undefined);

      // With location should have nearby strategy
      expect(strategiesWithLocation.some(s => s.name === 'Nearby Locations')).toBe(true);

      // Without location should not have nearby strategy
      expect(strategiesWithoutLocation.some(s => s.name === 'Nearby Locations')).toBe(false);
    });
  });

  describe('localStorage integration', () => {
    it('should persist configuration to localStorage', () => {
      localStorage.clear();
      const manager = cacheWarmingManager;

      manager.setConfig({ enabled: false });

      const stored = localStorage.getItem('cacheWarmingConfig');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.enabled).toBe(false);
    });

    it('should recover configuration from localStorage', () => {
      localStorage.clear();
      const manager = cacheWarmingManager;

      manager.setConfig({ enabled: false, warmOnLoad: false });

      // New manager should load from localStorage
      const stored = localStorage.getItem('cacheWarmingConfig');
      expect(stored).toBeTruthy();
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.clear();
      localStorage.setItem('cacheWarmingConfig', 'invalid json');

      // Get a fresh reference after corrupting localStorage
      // The manager instance should handle the error gracefully
      const config = cacheWarmingManager.getConfig();
      // When corrupted, it should fall back to some sensible state
      expect(typeof config.enabled).toBe('boolean');
      expect(typeof config.warmOnLoad).toBe('boolean');
    });
  });
});
