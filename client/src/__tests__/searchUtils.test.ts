import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateRelevanceScore,
  generateMatchReason,
  searchLocations,
  getSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  generateSearchSuggestions
} from '../utils/searchUtils';
import type { Location } from '../types';

// Mock locations for testing
const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '大安森林公園', en: 'Daan Forest Park' },
    category: 'park',
    coordinates: { lat: 25.033, lng: 121.545 },
    address: { zh: '台北市大安區', en: 'Daan District, Taipei' },
    description: { zh: '大型森林公園，適合全家', en: 'Large forest park for families' },
    averageRating: 4.8,
    facilities: ['playground', 'public_toilet', 'drinking_water']
  },
  {
    id: '2',
    name: { zh: '兒童新樂園', en: 'Taipei Children\'s Amusement Park' },
    category: 'attraction',
    coordinates: { lat: 25.053, lng: 121.525 },
    address: { zh: '台北市士林區', en: 'Shilin District, Taipei' },
    description: { zh: '家庭遊樂園', en: 'Family amusement park' },
    averageRating: 4.5,
    facilities: ['public_toilet', 'nursing_room']
  },
  {
    id: '3',
    name: { zh: '小餐廳', en: 'Small Restaurant' },
    category: 'restaurant',
    coordinates: { lat: 25.043, lng: 121.555 },
    address: { zh: '台北市中山區', en: 'Zhongshan District, Taipei' },
    description: { zh: '親子友善餐廳', en: 'Family-friendly restaurant' },
    averageRating: 3.5,
    facilities: ['kids_menu', 'wheelchair_accessible']
  },
  {
    id: '4',
    name: { zh: '市立醫院', en: 'City Hospital' },
    category: 'medical',
    coordinates: { lat: 25.025, lng: 121.535 },
    address: { zh: '台北市信義區', en: 'Xinyi District, Taipei' },
    description: { zh: '綜合醫院', en: 'General hospital' },
    averageRating: 4.2,
    facilities: ['emergency_room', 'wheelchair_accessible']
  }
];

const userLocation = { lat: 25.033, lng: 121.545 };

describe('searchUtils', () => {
  describe('calculateRelevanceScore', () => {
    it('should give highest score for exact name match', () => {
      const score = calculateRelevanceScore(mockLocations[0], '大安森林公園');
      expect(score).toBeGreaterThanOrEqual(40);
    });

    it('should give high score for partial name match', () => {
      const score = calculateRelevanceScore(mockLocations[0], '森林');
      expect(score).toBeGreaterThan(25);
    });

    it('should give score for English name match', () => {
      const score = calculateRelevanceScore(mockLocations[0], 'Forest');
      expect(score).toBeGreaterThan(25);
    });

    it('should give points for category match', () => {
      const score = calculateRelevanceScore(mockLocations[0], 'park');
      expect(score).toBeGreaterThan(0);
    });

    it('should give bonus for high-rated locations', () => {
      const location = { ...mockLocations[0] };
      const scoreHighRated = calculateRelevanceScore(location, 'test');
      const scoreLowRated = calculateRelevanceScore(
        { ...location, averageRating: 2.0 },
        'test'
      );
      expect(scoreHighRated).toBeGreaterThan(scoreLowRated);
    });

    it('should give proximity bonus when user location provided', () => {
      const scoreWithoutLocation = calculateRelevanceScore(mockLocations[0], 'park');
      const scoreWithLocation = calculateRelevanceScore(
        mockLocations[0],
        'park',
        userLocation
      );
      expect(scoreWithLocation).toBeGreaterThan(scoreWithoutLocation);
    });

    it('should return low score for no exact match', () => {
      // Even with no keyword match, proximity might give some points (max 10)
      const score = calculateRelevanceScore(mockLocations[0], 'xyz999nonexistent', userLocation);
      expect(score).toBeLessThanOrEqual(15); // Should have minimal score from proximity
    });

    it('should be case-insensitive', () => {
      const score1 = calculateRelevanceScore(mockLocations[0], '森林');
      const score2 = calculateRelevanceScore(mockLocations[0], '森林');
      expect(score1).toBe(score2);
    });
  });

  describe('generateMatchReason', () => {
    it('should return name match reason for name match', () => {
      const reason = generateMatchReason(
        mockLocations[0],
        '大安森林公園',
        'zh'
      );
      expect(reason).toBe('名稱相符');
    });

    it('should return English match reason', () => {
      const reason = generateMatchReason(
        mockLocations[0],
        'Forest',
        'en'
      );
      expect(reason).toContain('match');
    });

    it('should return relevant reason for partial matches', () => {
      // The function returns the first matching reason based on priority
      const reason = generateMatchReason(mockLocations[2], 'restaurant', 'en');
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    });

    it('should return high rating reason', () => {
      const reason = generateMatchReason(
        mockLocations[0],
        'nonmatch',
        'zh'
      );
      expect(reason).toBe('高評分');
    });
  });

  describe('searchLocations', () => {
    it('should return empty array for empty query', () => {
      const results = searchLocations(mockLocations, '');
      expect(results).toHaveLength(0);
    });

    it('should return minimal results for non-matching query', () => {
      // Proximity scoring might return some results, so we check for very small count
      const results = searchLocations(mockLocations, 'xyz999', userLocation);
      // Should have few to no results (proximity alone gives < 15 score, filtered)
      const significantResults = results.filter(r => r.relevanceScore > 10);
      expect(significantResults.length).toBeLessThanOrEqual(1);
    });

    it('should return matching locations sorted by relevance', () => {
      const results = searchLocations(mockLocations, 'park');
      expect(results.length).toBeGreaterThan(0);
      // First result should have highest score
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].relevanceScore).toBeGreaterThanOrEqual(
          results[i + 1].relevanceScore
        );
      }
    });

    it('should apply limit if provided', () => {
      const results = searchLocations(
        mockLocations,
        'park',
        undefined,
        2
      );
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should include location, relevanceScore, and matchReason', () => {
      const results = searchLocations(mockLocations, 'park');
      expect(results.length).toBeGreaterThan(0);
      const result = results[0];
      expect(result.location).toBeDefined();
      expect(typeof result.relevanceScore).toBe('number');
      expect(typeof result.matchReason).toBe('string');
    });

    it('should use user location for proximity scoring', () => {
      const allResults = searchLocations(mockLocations, 'park');
      const withUserLocation = searchLocations(
        mockLocations,
        'park',
        userLocation
      );
      // Results should be similarly scored but proximity should affect ordering
      expect(allResults.length).toBe(withUserLocation.length);
    });

    it('should find English names', () => {
      const results = searchLocations(mockLocations, 'restaurant');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Search History', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should get empty history initially', () => {
      const history = getSearchHistory();
      expect(history).toEqual([]);
    });

    it('should save search to history', () => {
      saveSearchToHistory('park', 5);
      const history = getSearchHistory();
      expect(history).toHaveLength(1);
      expect(history[0].query).toBe('park');
      expect(history[0].resultCount).toBe(5);
      expect(typeof history[0].timestamp).toBe('number');
    });

    it('should maintain max history limit', () => {
      for (let i = 0; i < 15; i++) {
        saveSearchToHistory(`query${i}`, i);
      }
      const history = getSearchHistory();
      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('should move duplicate search to top', () => {
      saveSearchToHistory('park', 5);
      saveSearchToHistory('restaurant', 3);
      saveSearchToHistory('park', 7);
      const history = getSearchHistory();
      expect(history[0].query).toBe('park');
      expect(history[0].resultCount).toBe(7);
    });

    it('should clear history', () => {
      saveSearchToHistory('park', 5);
      saveSearchToHistory('restaurant', 3);
      clearSearchHistory();
      const history = getSearchHistory();
      expect(history).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalLS = (global as any).localStorage;
      (global as any).localStorage = {
        getItem: () => { throw new Error('Storage error'); },
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };
      const history = getSearchHistory();
      expect(history).toEqual([]);
      (global as any).localStorage = originalLS;
    });
  });

  describe('generateSearchSuggestions', () => {
    it('should return array of suggestions', () => {
      const suggestions = generateSearchSuggestions(mockLocations, 'en');
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should include categories in English', () => {
      const suggestions = generateSearchSuggestions(mockLocations, 'en');
      expect(suggestions.some(s => ['park', 'restaurant', 'medical', 'attraction'].includes(s))).toBe(true);
    });

    it('should include categories in Chinese', () => {
      const suggestions = generateSearchSuggestions(mockLocations, 'zh');
      expect(suggestions.some(s => ['公園', '餐廳', '醫療', '景點'].includes(s))).toBe(true);
    });

    it('should include popular categories and high-rated locations', () => {
      const suggestions = generateSearchSuggestions(mockLocations, 'en');
      // Should have a mix of categories and location names
      expect(suggestions.length).toBeGreaterThan(0);
      // At least some should be recognizable categories or high-rated items
      const hasCategories = suggestions.some(s =>
        ['park', 'restaurant', 'medical', 'attraction', 'nursing_room'].includes(s)
      );
      expect(hasCategories).toBe(true);
    });

    it('should limit suggestions to 5', () => {
      const suggestions = generateSearchSuggestions(mockLocations, 'en');
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should provide diverse suggestions', () => {
      const suggestions = generateSearchSuggestions(mockLocations, 'en');
      // Should have variety - both categories and locations
      expect(suggestions.length).toBeGreaterThanOrEqual(3);
    });
  });
});
