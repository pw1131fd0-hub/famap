import { describe, it, expect } from 'vitest';
import type { Location, ActivityHistoryEntry } from '../types';
import {
  analyzeFamilyPreferences,
  scoreLocationForFamily,
  predictCrowdLevel,
  generateWeeklyOutingSuggestions,
  calculateWeeklyScore,
  generateWeeklySummary,
  type FamilyWeeklyPreferences,
} from '../utils/weeklyOutingPlanner';

// Mock location data
const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '台北動物園', en: 'Taipei Zoo' },
    description: { zh: '大型動物園', en: 'Large Zoo' },
    category: 'attraction',
    coordinates: { lat: 25.0336, lng: 121.5813 },
    address: { zh: '台北市文山區', en: 'Taipei Zoo Park' },
    photoUrl: 'photo1.jpg',
    facilities: ['playground', 'stroller_accessible', 'changing_table', 'restaurant'],
    averageRating: 4.5,
  },
  {
    id: '2',
    name: { zh: '中山公園', en: 'Zhongshan Park' },
    description: { zh: '綠色公園', en: 'Green Park' },
    category: 'park',
    coordinates: { lat: 25.0441, lng: 121.5343 },
    address: { zh: '台北市中山區', en: 'Zhongshan Park' },
    photoUrl: 'photo2.jpg',
    facilities: ['playground', 'restroom', 'parking'],
    averageRating: 4.2,
  },
  {
    id: '3',
    name: { zh: '小餐廳', en: 'Cozy Restaurant' },
    description: { zh: '家庭餐廳', en: 'Family Restaurant' },
    category: 'restaurant',
    coordinates: { lat: 25.0331, lng: 121.5645 },
    address: { zh: '台北市信義區', en: 'Xinyi District' },
    photoUrl: 'photo3.jpg',
    facilities: ['high_chair', 'changing_table', 'restroom'],
    averageRating: 4.0,
  },
  {
    id: '4',
    name: { zh: '公立醫院', en: 'Public Hospital' },
    description: { zh: '醫療設施', en: 'Healthcare' },
    category: 'medical',
    coordinates: { lat: 25.0500, lng: 121.5500 },
    address: { zh: '台北市大安區', en: 'Da\'an District' },
    photoUrl: 'photo4.jpg',
    facilities: ['restroom', 'parking', 'wheelchair_accessible'],
    averageRating: 3.8,
  },
];

// Mock activity history
const mockActivityHistory: ActivityHistoryEntry[] = [
  {
    id: 'h1',
    userId: 'u1',
    locationId: '1',
    category: 'attraction',
    visitDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    duration: 240,
    cost: 800,
    familySize: 4,
    childAge: 5,
    crowdingLevel: 3,
    satisfactionRating: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'h2',
    userId: 'u1',
    locationId: '2',
    category: 'park',
    visitDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    duration: 120,
    cost: 0,
    familySize: 3,
    childAge: 5,
    crowdingLevel: 2,
    satisfactionRating: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'h3',
    userId: 'u1',
    locationId: '3',
    category: 'restaurant',
    visitDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    duration: 90,
    cost: 600,
    familySize: 4,
    childAge: 5,
    crowdingLevel: 2,
    satisfactionRating: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'h4',
    userId: 'u1',
    locationId: '1',
    category: 'attraction',
    visitDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days ago
    duration: 180,
    cost: 800,
    familySize: 4,
    childAge: 3,
    crowdingLevel: 4,
    satisfactionRating: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('weeklyOutingPlanner', () => {
  describe('analyzeFamilyPreferences', () => {
    it('should return empty object for empty history', () => {
      const result = analyzeFamilyPreferences([]);
      expect(result).toEqual({});
    });

    it('should analyze preferred days from history', () => {
      const result = analyzeFamilyPreferences(mockActivityHistory);
      expect(result.preferredDaysOfWeek).toBeDefined();
      expect(Array.isArray(result.preferredDaysOfWeek)).toBe(true);
    });

    it('should identify preferred categories', () => {
      const result = analyzeFamilyPreferences(mockActivityHistory);
      expect(result.preferredCategories).toBeDefined();
      expect(Array.isArray(result.preferredCategories)).toBe(true);
      expect(result.preferredCategories).toContain('attraction');
    });

    it('should calculate max budget from history', () => {
      const result = analyzeFamilyPreferences(mockActivityHistory);
      expect(result.maxBudgetPerWeek).toBeDefined();
      expect(typeof result.maxBudgetPerWeek).toBe('number');
      expect(result.maxBudgetPerWeek).toBeGreaterThan(0);
    });

    it('should set default preferences when needed', () => {
      const result = analyzeFamilyPreferences(mockActivityHistory);
      expect(result.avoidCrowdedTimes).toBe(true);
      expect(result.preferWeatherFriendly).toBe(true);
    });

    it('should handle multiple visits to same location', () => {
      const result = analyzeFamilyPreferences(mockActivityHistory);
      expect(result.preferredCategories).toContain('attraction');
    });

    it('should calculate travel time preferences', () => {
      const result = analyzeFamilyPreferences(mockActivityHistory);
      expect(result.minimumTravelTime).toBeDefined();
      expect(result.maximumTravelTime).toBeDefined();
    });
  });

  describe('scoreLocationForFamily', () => {
    const preferences: FamilyWeeklyPreferences = {
      preferredDaysOfWeek: [0, 1, 5, 6],
      maxBudgetPerWeek: 2000,
      preferredCategories: ['park', 'attraction'],
      avoidCrowdedTimes: true,
      preferWeatherFriendly: true,
      includeSpecialEvents: true,
      minimumTravelTime: 0,
      maximumTravelTime: 45,
    };

    it('should score locations', () => {
      const score = scoreLocationForFamily(mockLocations[0], preferences, mockActivityHistory);
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher scores to preferred categories', () => {
      const parkScore = scoreLocationForFamily(mockLocations[1], preferences, mockActivityHistory);
      const medicalScore = scoreLocationForFamily(mockLocations[3], preferences, mockActivityHistory);
      expect(parkScore).toBeGreaterThan(medicalScore);
    });

    it('should consider location ratings', () => {
      const highRatedLocation: Location = {
        ...mockLocations[0],
        averageRating: 5,
      };
      const lowRatedLocation: Location = {
        ...mockLocations[0],
        averageRating: 2,
      };
      const highScore = scoreLocationForFamily(highRatedLocation, preferences, mockActivityHistory);
      const lowScore = scoreLocationForFamily(lowRatedLocation, preferences, mockActivityHistory);
      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should consider visit recency', () => {
      // Location with recent visit should score lower
      const recentHistory: ActivityHistoryEntry[] = [
        {
          ...mockActivityHistory[0],
          visitDate: new Date().toISOString(),
        },
      ];
      const recentScore = scoreLocationForFamily(mockLocations[0], preferences, recentHistory);
      const oldScore = scoreLocationForFamily(mockLocations[0], preferences, mockActivityHistory);
      expect(oldScore).toBeGreaterThan(recentScore);
    });

    it('should consider facility match', () => {
      const facilityMatchPrefs: FamilyWeeklyPreferences = {
        ...preferences,
        preferredCategories: ['attraction'],
      };
      const zooScore = scoreLocationForFamily(mockLocations[0], facilityMatchPrefs, mockActivityHistory);
      expect(zooScore).toBeGreaterThan(0);
    });

    it('should return score between 0 and 100', () => {
      mockLocations.forEach(location => {
        const score = scoreLocationForFamily(location, preferences, mockActivityHistory);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('predictCrowdLevel', () => {
    it('should predict crowd level for location', () => {
      const prediction = predictCrowdLevel(mockLocations[0], 0, 'morning');
      expect(prediction).toBeDefined();
      expect(prediction.location).toBe(mockLocations[0]);
      expect(prediction.timeOfDay).toBe('morning');
      expect(['light', 'moderate', 'heavy', 'very_heavy']).toContain(prediction.crowdLevel);
    });

    it('should estimate wait time', () => {
      const prediction = predictCrowdLevel(mockLocations[0], 0, 'afternoon');
      expect(prediction.estimatedWaitTime).toBeGreaterThan(0);
      expect(prediction.estimatedWaitTime).toBeLessThan(120);
    });

    it('should predict heavier crowds on weekends', () => {
      const weekdayPrediction = predictCrowdLevel(mockLocations[0], 1, 'afternoon');
      const weekendPrediction = predictCrowdLevel(mockLocations[0], 6, 'afternoon');
      expect(weekendPrediction.estimatedWaitTime).toBeGreaterThan(
        weekdayPrediction.estimatedWaitTime * 0.8
      );
    });

    it('should predict different crowds for different times of day', () => {
      const morningPrediction = predictCrowdLevel(mockLocations[0], 0, 'morning');
      const afternoonPrediction = predictCrowdLevel(mockLocations[0], 0, 'afternoon');

      expect(afternoonPrediction.estimatedWaitTime).toBeGreaterThan(
        morningPrediction.estimatedWaitTime * 0.8
      );
    });

    it('should use historical crowd data when available', () => {
      const prediction = predictCrowdLevel(mockLocations[0], 0, 'afternoon', mockActivityHistory);
      expect(prediction).toBeDefined();
      expect(prediction.crowdLevel).toBeDefined();
    });

    it('should return valid crowd prediction object', () => {
      const prediction = predictCrowdLevel(mockLocations[2], 3, 'morning', mockActivityHistory);
      expect(prediction.location).toBeDefined();
      expect(prediction.timeOfDay).toBeDefined();
      expect(prediction.crowdLevel).toBeDefined();
      expect(prediction.estimatedWaitTime).toBeDefined();
    });
  });

  describe('generateWeeklyOutingSuggestions', () => {
    it('should generate suggestions', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(7);
    });

    it('should include all required suggestion properties', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      suggestions.forEach(suggestion => {
        expect(suggestion.dayOfWeek).toBeDefined();
        expect(suggestion.suggestedLocation).toBeDefined();
        expect(suggestion.recommendedTimeOfDay).toBeDefined();
        expect(suggestion.confidence).toBeDefined();
        expect(suggestion.score).toBeDefined();
        expect(suggestion.reasons).toBeDefined();
        expect(suggestion.weatherForecast).toBeDefined();
        expect(suggestion.crowdPrediction).toBeDefined();
        expect(suggestion.costEstimate).toBeDefined();
        expect(suggestion.estimatedDuration).toBeDefined();
        expect(suggestion.whyGoodChoice).toBeDefined();
        expect(suggestion.expectedSatisfaction).toBeDefined();
        expect(suggestion.alternativeOptions).toBeDefined();
      });
    });

    it('should suggest different locations', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const locationIds = suggestions.map(s => s.suggestedLocation.id);
      const uniqueIds = new Set(locationIds);
      // Should have variety in suggestions
      expect(uniqueIds.size).toBeGreaterThan(0);
    });

    it('should consider custom preferences', () => {
      const customPrefs = {
        preferredCategories: ['restaurant'],
        maxBudgetPerWeek: 1000,
      };
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory, customPrefs);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should generate suggestions with valid scores', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      suggestions.forEach(suggestion => {
        expect(suggestion.score).toBeGreaterThanOrEqual(0);
        expect(suggestion.score).toBeLessThanOrEqual(100);
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should include reasons for suggestions', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      suggestions.forEach(suggestion => {
        expect(suggestion.reasons.length).toBeGreaterThan(0);
        suggestion.reasons.forEach(reason => {
          expect(reason.reason).toBeDefined();
          expect(reason.weight).toBeGreaterThanOrEqual(0);
          expect(reason.weight).toBeLessThanOrEqual(1);
          expect(reason.score).toBeGreaterThanOrEqual(0);
          expect(reason.score).toBeLessThanOrEqual(1);
        });
      });
    });

    it('should include why good choice explanations', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      suggestions.forEach(suggestion => {
        expect(suggestion.whyGoodChoice.length).toBeGreaterThan(0);
        expect(suggestion.whyGoodChoice.length).toBeLessThanOrEqual(5);
      });
    });

    it('should include alternative options', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      suggestions.forEach(suggestion => {
        expect(Array.isArray(suggestion.alternativeOptions)).toBe(true);
        expect(suggestion.alternativeOptions.length).toBeLessThanOrEqual(3);
      });
    });

    it('should work with empty activity history', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, []);
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle single location', () => {
      const suggestions = generateWeeklyOutingSuggestions([mockLocations[0]], mockActivityHistory);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].suggestedLocation.id).toBe(mockLocations[0].id);
    });
  });

  describe('calculateWeeklyScore', () => {
    it('should return 0 for empty suggestions', () => {
      const score = calculateWeeklyScore([]);
      expect(score).toBe(0);
    });

    it('should calculate average score', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const score = calculateWeeklyScore(suggestions);
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should be average of individual suggestion scores', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const calculatedScore = calculateWeeklyScore(suggestions);
      const averageScore = Math.round(
        suggestions.reduce((sum, s) => sum + s.score, 0) / suggestions.length
      );
      expect(calculatedScore).toBe(averageScore);
    });
  });

  describe('generateWeeklySummary', () => {
    it('should generate English summary', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const summary = generateWeeklySummary(suggestions, 'en');
      expect(typeof summary).toBe('string');
      expect(summary).toContain('outing');
    });

    it('should generate Chinese summary', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const summary = generateWeeklySummary(suggestions, 'zh');
      expect(typeof summary).toBe('string');
      expect(summary).toContain('本週');
    });

    it('should include budget information', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const summary = generateWeeklySummary(suggestions, 'en');
      expect(summary).toContain('NT$');
    });

    it('should include quality rating', () => {
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const summary = generateWeeklySummary(suggestions, 'en');
      expect(summary).toContain('/100');
    });

    it('should handle empty suggestions', () => {
      const summary = generateWeeklySummary([], 'en');
      expect(typeof summary).toBe('string');
    });
  });

  describe('Integration tests', () => {
    it('should complete full workflow', () => {
      // Analyze preferences
      const prefs = analyzeFamilyPreferences(mockActivityHistory);
      expect(prefs).toBeDefined();

      // Generate suggestions
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory, prefs);
      expect(suggestions.length).toBeGreaterThan(0);

      // Calculate score
      const score = calculateWeeklyScore(suggestions);
      expect(score).toBeGreaterThan(0);

      // Generate summary
      const summary = generateWeeklySummary(suggestions, 'en');
      expect(summary).toContain(score.toString());
    });

    it('should handle diverse family preferences', () => {
      const customPrefs = {
        preferredCategories: ['park', 'restaurant'],
        avoidCrowdedTimes: true,
        maxBudgetPerWeek: 1500,
      };
      const suggestions = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory, customPrefs);
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(s => {
        expect(s.costEstimate).toBeLessThanOrEqual(1500);
      });
    });

    it('should provide consistent recommendations', () => {
      const suggestions1 = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const suggestions2 = generateWeeklyOutingSuggestions(mockLocations, mockActivityHistory);
      const score1 = calculateWeeklyScore(suggestions1);
      const score2 = calculateWeeklyScore(suggestions2);
      expect(Math.abs(score1 - score2)).toBeLessThanOrEqual(5);
    });
  });
});
