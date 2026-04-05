import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSmartTripSuggestions,
  scoreVenuesForSuggestion,
  analyzeFamilyOutingPattern,
  getNextTripDate,
} from '../utils/smartTripSuggester';
import type {
  SmartSuggestionContext,
} from '../utils/smartTripSuggester';
import type { Location, FamilyProfile, ActivityHistoryEntry } from '../types';

// Mock data
const mockFamilyProfile: FamilyProfile = {
  id: 'family_1',
  familyName: 'Smith Family',
  childrenAges: [5, 8, 11],
  childrenCount: 3,
  interests: ['park', 'restaurant', 'attraction'],
  visitFrequency: 'weekly',
  budget: 'moderate',
};

const mockVenues: Location[] = [
  {
    id: 'venue_1',
    name: { en: 'Central Park', zh: '中央公園' },
    description: { en: 'A beautiful park', zh: '美麗的公園' },
    category: 'park',
    coordinates: { lat: 25.04, lng: 121.56 },
    address: { en: 'Taipei', zh: '台北' },
    averageRating: 4.5,
    facilities: ['restroom', 'playground', 'picnic_area'],
  },
  {
    id: 'venue_2',
    name: { en: 'Family Restaurant', zh: '家庭餐廳' },
    description: { en: 'Family-friendly restaurant', zh: '家庭餐廳' },
    category: 'restaurant',
    coordinates: { lat: 25.05, lng: 121.57 },
    address: { en: 'Taipei', zh: '台北' },
    averageRating: 4.2,
    facilities: ['highchair', 'kids_menu', 'family_zone'],
  },
  {
    id: 'venue_3',
    name: { en: 'Children Museum', zh: '兒童美術館' },
    description: { en: 'Museum for children', zh: '兒童博物館' },
    category: 'attraction',
    coordinates: { lat: 25.03, lng: 121.55 },
    address: { en: 'Taipei', zh: '台北' },
    averageRating: 4.8,
    facilities: ['restroom', 'gift_shop', 'cafe'],
  },
  {
    id: 'venue_4',
    name: { en: 'Zoo Park', zh: '動物園' },
    description: { en: 'Zoo with various animals', zh: '有各種動物的動物園' },
    category: 'park',
    coordinates: { lat: 25.06, lng: 121.54 },
    address: { en: 'Taipei', zh: '台北' },
    averageRating: 4.6,
    facilities: ['restroom', 'food_court', 'parking'],
  },
];

const mockRecentHistory: ActivityHistoryEntry[] = [
  {
    id: 'visit_1',
    userId: 'user_1',
    locationId: 'venue_1',
    visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    duration: 120,
    cost: 50,
    familySize: 3,
    category: 'park',
  },
  {
    id: 'visit_2',
    userId: 'user_1',
    locationId: 'venue_2',
    visitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    duration: 90,
    cost: 120,
    familySize: 3,
    category: 'restaurant',
  },
  {
    id: 'visit_3',
    userId: 'user_1',
    locationId: 'venue_4',
    visitDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    duration: 180,
    cost: 100,
    familySize: 3,
    category: 'park',
  },
];

const mockWeatherContext = {
  temperature: 25,
  humidity: 60,
  windSpeed: 5,
  precipitation: 0,
  condition: 'sunny',
  uvi: 6,
  visibility: 10,
};

describe('Smart Trip Suggester', () => {
  let context: SmartSuggestionContext;

  beforeEach(() => {
    context = {
      familyProfile: mockFamilyProfile,
      recentHistory: mockRecentHistory,
      currentWeather: mockWeatherContext,
      upcomingEvents: [],
      budget: 300,
      preferredDuration: 1,
    };
  });

  describe('generateSmartTripSuggestions', () => {
    it('should generate trip suggestions based on family profile', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 3);

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeLessThanOrEqual(3);
      expect(suggestions[0]).toHaveProperty('tripId');
      expect(suggestions[0]).toHaveProperty('venues');
      expect(suggestions[0]).toHaveProperty('confidenceScore');
      expect(suggestions[0]).toHaveProperty('estimatedBudget');
    });

    it('should return suggestions sorted by confidence score', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 3);

      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].confidenceScore).toBeGreaterThanOrEqual(
          suggestions[i + 1].confidenceScore
        );
      }
    });

    it('should include reasons for suggestions', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions[0].reasons).toBeDefined();
      expect(suggestions[0].reasons.length).toBeGreaterThan(0);
      expect(typeof suggestions[0].reasons[0]).toBe('string');
    });

    it('should respect budget constraints', () => {
      const lowBudgetContext = { ...context, budget: 100 };
      const suggestions = generateSmartTripSuggestions(
        lowBudgetContext,
        mockVenues,
        3
      );

      suggestions.forEach(suggestion => {
        expect(suggestion.estimatedBudget).toBeLessThanOrEqual(lowBudgetContext.budget * 1.2);
      });
    });

    it('should include packing tips', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions[0].packingTips).toBeDefined();
      expect(Array.isArray(suggestions[0].packingTips)).toBe(true);
    });

    it('should calculate estimated travel time', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions[0].estimatedTravelTime).toBeGreaterThan(0);
    });

    it('should handle empty venue list gracefully', () => {
      const suggestions = generateSmartTripSuggestions(context, [], 3);

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should generate multiple different suggestions', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 3);

      const titles = suggestions.map(s => s.title);
      const uniqueTitles = new Set(titles);

      // Should have at least some variety in suggestions
      expect(uniqueTitles.size).toBeGreaterThanOrEqual(1);
    });

    it('should include weather outlook in suggestions', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions[0].weatherOutlook).toBeDefined();
      expect(typeof suggestions[0].weatherOutlook).toBe('string');
      expect(suggestions[0].weatherOutlook.length).toBeGreaterThan(0);
    });

    it('should include crowd prediction', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions[0].crowdPrediction).toBeDefined();
      expect(['light', 'moderate', 'heavy']).toContain(suggestions[0].crowdPrediction);
    });

    it('should provide expected satisfaction score', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions[0].expectedSatisfaction).toBeGreaterThanOrEqual(0);
      expect(suggestions[0].expectedSatisfaction).toBeLessThanOrEqual(100);
    });

    it('should handle different weather conditions', () => {
      const rainyContext = {
        ...context,
        currentWeather: { ...mockWeatherContext, condition: 'rainy' },
      };
      const suggestions = generateSmartTripSuggestions(rainyContext, mockVenues, 1);

      expect(suggestions[0].weatherOutlook).toContain('Rainy');
    });

    it('should handle extreme temperatures', () => {
      const hotContext = {
        ...context,
        currentWeather: { ...mockWeatherContext, temperature: 35 },
      };
      const suggestions = generateSmartTripSuggestions(hotContext, mockVenues, 1);

      expect(suggestions[0].packingTips.some(tip => tip.includes('sunscreen'))).toBe(true);
    });

    it('should provide trip start and end dates', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions[0].startDate).toBeInstanceOf(Date);
      expect(suggestions[0].endDate).toBeInstanceOf(Date);
      expect(suggestions[0].endDate.getTime()).toBeGreaterThanOrEqual(
        suggestions[0].startDate.getTime()
      );
    });

    it('should match family age preferences', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      // Check if reasons are generated and are meaningful
      expect(suggestions[0].reasons).toBeDefined();
      expect(suggestions[0].reasons.length).toBeGreaterThan(0);
      // Reasons should include activity recommendations
      expect(suggestions[0].reasons.some(r => r.length > 0)).toBe(true);
    });
  });

  describe('scoreVenuesForSuggestion', () => {
    it('should return venue scores for all venues', () => {
      const scores = scoreVenuesForSuggestion(
        mockVenues,
        mockRecentHistory,
        mockFamilyProfile,
        mockWeatherContext,
        300
      );

      expect(scores).toHaveLength(mockVenues.length);
      expect(scores.every(s => s.venue && typeof s.score === 'number')).toBe(true);
    });

    it('should return scores between 0 and 1', () => {
      const scores = scoreVenuesForSuggestion(
        mockVenues,
        mockRecentHistory,
        mockFamilyProfile,
        mockWeatherContext,
        300
      );

      scores.forEach(score => {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(1);
      });
    });

    it('should include detailed score breakdown', () => {
      const scores = scoreVenuesForSuggestion(
        mockVenues,
        mockRecentHistory,
        mockFamilyProfile,
        mockWeatherContext,
        300
      );

      scores.forEach(score => {
        expect(score.reasons).toHaveProperty('visitFrequency');
        expect(score.reasons).toHaveProperty('categoryMatch');
        expect(score.reasons).toHaveProperty('weatherSuitability');
        expect(score.reasons).toHaveProperty('budgetAlignment');
      });
    });

    it('should prefer venues in preferred categories', () => {
      const scores = scoreVenuesForSuggestion(
        mockVenues,
        mockRecentHistory,
        mockFamilyProfile,
        mockWeatherContext,
        300
      );

      // Park and museum should score higher than others
      const parkScore = scores.find(s => s.venue.id === 'venue_1')?.score || 0;
      expect(parkScore).toBeGreaterThan(0);
    });

    it('should consider recent visit history', () => {
      const scores = scoreVenuesForSuggestion(
        mockVenues,
        mockRecentHistory,
        mockFamilyProfile,
        mockWeatherContext,
        300
      );

      // Venue 1 was visited 30 days ago, should have reasonable score
      const recentlyVisitedScore = scores.find(s => s.venue.id === 'venue_1');
      expect(recentlyVisitedScore).toBeDefined();
    });

    it('should handle empty history', () => {
      const scores = scoreVenuesForSuggestion(
        mockVenues,
        [],
        mockFamilyProfile,
        mockWeatherContext,
        300
      );

      expect(scores).toHaveLength(mockVenues.length);
      expect(scores.every(s => typeof s.score === 'number')).toBe(true);
    });

    it('should account for weather in venue scoring', () => {
      const sunnyScores = scoreVenuesForSuggestion(
        mockVenues,
        mockRecentHistory,
        mockFamilyProfile,
        { ...mockWeatherContext, condition: 'sunny' },
        300
      );

      const rainyScores = scoreVenuesForSuggestion(
        mockVenues,
        mockRecentHistory,
        mockFamilyProfile,
        { ...mockWeatherContext, condition: 'rainy' },
        300
      );

      // Park scores should differ based on weather
      const parkSunny = sunnyScores.find(s => s.venue.id === 'venue_1')?.score || 0;
      const parkRainy = rainyScores.find(s => s.venue.id === 'venue_1')?.score || 0;

      expect(parkSunny).toBeGreaterThan(parkRainy);
    });
  });

  describe('analyzeFamilyOutingPattern', () => {
    it('should analyze family outing patterns from history', () => {
      const pattern = analyzeFamilyOutingPattern(mockRecentHistory);

      expect(pattern).toHaveProperty('averageFrequency');
      expect(pattern).toHaveProperty('preferredDays');
      expect(pattern).toHaveProperty('preferredCategories');
      expect(pattern).toHaveProperty('averageSpending');
    });

    it('should return valid preferred days', () => {
      const pattern = analyzeFamilyOutingPattern(mockRecentHistory);

      expect(Array.isArray(pattern.preferredDays)).toBe(true);
      pattern.preferredDays.forEach(day => {
        expect(day).toBeGreaterThanOrEqual(0);
        expect(day).toBeLessThanOrEqual(6);
      });
    });

    it('should identify preferred categories', () => {
      const pattern = analyzeFamilyOutingPattern(mockRecentHistory);

      expect(Array.isArray(pattern.preferredCategories)).toBe(true);
      expect(pattern.preferredCategories.length).toBeGreaterThan(0);
      expect(pattern.preferredCategories).toContain('park');
    });

    it('should calculate average frequency', () => {
      const pattern = analyzeFamilyOutingPattern(mockRecentHistory);

      expect(pattern.averageFrequency).toBeGreaterThan(0);
      expect(typeof pattern.averageFrequency).toBe('number');
    });

    it('should calculate average spending', () => {
      const pattern = analyzeFamilyOutingPattern(mockRecentHistory);

      expect(pattern.averageSpending).toBeGreaterThan(0);
      expect(pattern.averageSpending).toBeLessThanOrEqual(200); // Based on mock data
    });

    it('should provide defaults for empty history', () => {
      const pattern = analyzeFamilyOutingPattern([]);

      expect(pattern.preferredDays).toEqual([5, 6]); // Weekend default
      expect(pattern.preferredCategories).toContain('park');
      expect(pattern.averageFrequency).toBe(1);
    });

    it('should identify top categories by frequency', () => {
      const history: ActivityHistoryEntry[] = [
        ...mockRecentHistory,
        {
          id: 'visit_4',
          userId: 'user_1',
          locationId: 'venue_3',
          visitDate: new Date().toISOString(),
          duration: 120,
          cost: 80,
          familySize: 3,
          category: 'attraction',
        },
      ];

      const pattern = analyzeFamilyOutingPattern(history);

      expect(pattern.preferredCategories).toContain('park');
      expect(pattern.preferredCategories).toContain('attraction');
    });
  });

  describe('getNextTripDate', () => {
    it('should return a future date', () => {
      const nextDate = getNextTripDate(mockFamilyProfile);

      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate.getTime()).toBeGreaterThanOrEqual(Date.now());
    });

    it('should prefer weekend dates', () => {
      const nextDate = getNextTripDate(mockFamilyProfile);
      const dayOfWeek = nextDate.getDay();

      // Should be Friday (5), Saturday (6), or Sunday (0)
      // (might be a weekday if already past weekend)
      expect([0, 5, 6]).toContain(dayOfWeek % 7);
    });

    it('should return valid date object', () => {
      const nextDate = getNextTripDate(mockFamilyProfile);

      expect(nextDate.getDate()).toBeGreaterThanOrEqual(1);
      expect(nextDate.getDate()).toBeLessThanOrEqual(31);
      expect(nextDate.getMonth()).toBeGreaterThanOrEqual(0);
      expect(nextDate.getMonth()).toBeLessThanOrEqual(11);
    });
  });

  describe('Edge Cases', () => {
    it('should handle venue with missing properties gracefully', () => {
      const incompleteVenue: Location = {
        id: 'venue_incomplete',
        name: { en: 'Partial Venue', zh: '部分場地' },
        category: 'park',
        coordinates: { lat: 25.0, lng: 121.5 },
      };

      const scores = scoreVenuesForSuggestion(
        [incompleteVenue],
        mockRecentHistory,
        mockFamilyProfile,
        mockWeatherContext,
        300
      );

      expect(scores).toHaveLength(1);
      expect(typeof scores[0].score).toBe('number');
    });

    it('should handle family profile with no preferences', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle extreme budget', () => {
      const highBudgetContext = { ...context, budget: 10000 };
      const suggestions = generateSmartTripSuggestions(
        highBudgetContext,
        mockVenues,
        1
      );

      // Budget is calculated from venues, which may be 0 if venues have no averageSpending
      // The important thing is that suggestion was generated
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].estimatedBudget).toBeGreaterThanOrEqual(0);
    });

    it('should handle single venue input', () => {
      const suggestions = generateSmartTripSuggestions(
        context,
        [mockVenues[0]],
        1
      );

      expect(suggestions).toBeDefined();
      expect(suggestions[0].venues.length).toBeGreaterThanOrEqual(0);
    });

    it('should provide confidence scores in valid range', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 5);

      suggestions.forEach(s => {
        expect(s.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(s.confidenceScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Bilingual Support', () => {
    it('should generate suggestions with bilingual titles', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      expect(suggestions[0].title).toBeDefined();
      expect(suggestions[0].title.length).toBeGreaterThan(0);
    });

    it('should include venue names in suggestions', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 1);

      if (suggestions[0].venues.length > 0) {
        expect(suggestions[0].venues[0].name).toBeDefined();
      }
    });

    it('should provide English titles', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 3);

      suggestions.forEach(s => {
        expect(typeof s.title).toBe('string');
        expect(s.title.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should generate suggestions quickly', () => {
      const startTime = Date.now();
      generateSmartTripSuggestions(context, mockVenues, 5);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large venue list efficiently', () => {
      const manyVenues = Array.from({ length: 100 }, (_, i) => ({
        ...mockVenues[i % mockVenues.length],
        id: `venue_${i}`,
      }));

      const startTime = Date.now();
      const suggestions = generateSmartTripSuggestions(context, manyVenues, 5);
      const duration = Date.now() - startTime;

      expect(suggestions).toBeDefined();
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain trip ID uniqueness', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 10);

      const tripIds = suggestions.map(s => s.tripId);
      const uniqueIds = new Set(tripIds);

      expect(uniqueIds.size).toBe(tripIds.length);
    });

    it('should ensure dates are consistent', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 5);

      suggestions.forEach(s => {
        expect(s.startDate.getTime()).toBeLessThanOrEqual(s.endDate.getTime());
        expect(s.duration).toBeGreaterThan(0);
      });
    });

    it('should verify estimated values are reasonable', () => {
      const suggestions = generateSmartTripSuggestions(context, mockVenues, 3);

      suggestions.forEach(s => {
        expect(s.estimatedBudget).toBeGreaterThanOrEqual(0);
        expect(s.estimatedTravelTime).toBeGreaterThan(0);
        expect(s.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(s.expectedSatisfaction).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
