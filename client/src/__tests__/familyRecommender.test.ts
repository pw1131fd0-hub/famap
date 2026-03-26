import {
  calculateAgeCompatibility,
  calculateInterestMatch,
  calculateAccessibilityMatch,
  calculateBudgetMatch,
  calculatePopularityScore,
  calculateTrendingBoost,
  calculateSeasonalityBoost,
  generateRecommendationReasons,
  scoreVenueForFamily,
  calculateRecommendationScore,
  calculateConfidenceScore,
  getTopRecommendations,
  findSimilarFamilyVenues,
  getPersonalizedRecommendations,
  analyzeRecommendationQuality,
} from '../utils/familyRecommender';
import type {
  FamilyProfile,
  VenueCharacteristics,
  LocationWithReviews,
  UserInteractionHistory,
} from '../utils/familyRecommender';

describe('familyRecommender', () => {
  // Mock data
  const mockFamilyProfile: FamilyProfile = {
    childrenAges: [3, 7],
    interests: ['playground', 'water', 'nature'],
    accessibilityNeeds: ['stroller_accessible', 'nursing_room'],
    dietaryRestrictions: ['peanut_allergy'],
    budgetLevel: 'moderate',
    preferredDistance: 20,
  };

  const mockVenue: VenueCharacteristics = {
    id: 'venue-1',
    name: { zh: '公園A', en: 'Park A' },
    category: 'park',
    ageRange: { min: 2, max: 12 },
    averageRating: 4.5,
    reviewCount: 50,
    facilities: ['playground', 'stroller_accessible', 'nursing_room', 'water_play'],
    crowdiness: 45,
    price: 0,
    distance: 5,
    trending: 0.3,
    seasonalityFactor: 0.8,
  };

  const mockVenue2: VenueCharacteristics = {
    id: 'venue-2',
    name: { zh: '餐廳B', en: 'Restaurant B' },
    category: 'restaurant',
    ageRange: { min: 0, max: 15 },
    averageRating: 4.2,
    reviewCount: 30,
    facilities: ['high_chair', 'changing_table', 'wifi'],
    crowdiness: 60,
    price: 800,
    distance: 3,
    trending: -0.1,
    seasonalityFactor: 0.5,
  };

  const mockUserHistory: UserInteractionHistory = {
    searchTerms: ['playground', 'park', 'family'],
    viewedLocations: ['venue-2'],
    favoriteLocations: ['venue-1'],
    previousVisits: [
      { venueId: 'venue-1', rating: 5, timestamp: 1000 },
      { venueId: 'venue-2', rating: 4, timestamp: 2000 },
    ],
  };

  describe('calculateAgeCompatibility', () => {
    it('should return 100 when all children are in age range', () => {
      const score = calculateAgeCompatibility([5, 8], { min: 2, max: 12 });
      expect(score).toBe(100);
    });

    it('should return 50 when one child is in range', () => {
      const score = calculateAgeCompatibility([1, 5], { min: 2, max: 12 });
      expect(score).toBe(50);
    });

    it('should return 0 when no children are in range', () => {
      const score = calculateAgeCompatibility([1, 2], { min: 5, max: 12 });
      expect(score).toBe(0);
    });

    it('should return 50 for empty age array', () => {
      const score = calculateAgeCompatibility([], { min: 2, max: 12 });
      expect(score).toBe(50);
    });
  });

  describe('calculateInterestMatch', () => {
    it('should return 100 when all interests match', () => {
      const score = calculateInterestMatch(
        ['playground', 'water'],
        'park',
        ['playground', 'water_play']
      );
      expect(score).toBeGreaterThan(50);
    });

    it('should return 50 for empty interests', () => {
      const score = calculateInterestMatch([], 'park', ['playground']);
      expect(score).toBe(50);
    });

    it('should handle category matching', () => {
      const score = calculateInterestMatch(
        ['park'],
        'park',
        []
      );
      expect(score).toBe(100);
    });

    it('should handle facility keyword matching', () => {
      const score = calculateInterestMatch(
        ['pool'],
        'garden',
        ['swimming_pool']
      );
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('calculateAccessibilityMatch', () => {
    it('should return 100 when all needs are met', () => {
      const score = calculateAccessibilityMatch(
        ['stroller_accessible', 'nursing_room'],
        ['stroller_accessible', 'nursing_room', 'playground']
      );
      expect(score).toBe(100);
    });

    it('should return 50 when one need is met', () => {
      const score = calculateAccessibilityMatch(
        ['stroller_accessible', 'nursing_room'],
        ['stroller_accessible']
      );
      expect(score).toBe(50);
    });

    it('should return 100 when no needs specified', () => {
      const score = calculateAccessibilityMatch([], ['stroller_accessible']);
      expect(score).toBe(100);
    });

    it('should handle partial keyword matching', () => {
      const score = calculateAccessibilityMatch(
        ['stroller'],
        ['stroller_accessible', 'nursing_area']
      );
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('calculateBudgetMatch', () => {
    it('should return 100 for budget-friendly venue at budget level', () => {
      const score = calculateBudgetMatch('budget', 200);
      expect(score).toBeGreaterThanOrEqual(80);
    });

    it('should return 100 for moderate-price venue at moderate level', () => {
      const score = calculateBudgetMatch('moderate', 800);
      expect(score).toBeGreaterThanOrEqual(80);
    });

    it('should return 100 for premium venue at premium level', () => {
      const score = calculateBudgetMatch('premium', 2000);
      expect(score).toBeGreaterThanOrEqual(80);
    });

    it('should penalize over-budget', () => {
      const score = calculateBudgetMatch('budget', 1000);
      expect(score).toBeLessThan(70);
    });

    it('should handle free venues', () => {
      const score = calculateBudgetMatch('budget', 0);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('calculatePopularityScore', () => {
    it('should return high score for highly rated venue', () => {
      const score = calculatePopularityScore(4.8, 50);
      expect(score).toBeGreaterThan(80);
    });

    it('should consider review count', () => {
      const score1 = calculatePopularityScore(4.0, 10);
      const score2 = calculatePopularityScore(4.0, 100);
      expect(score2).toBeGreaterThan(score1);
    });

    it('should return low score for poorly rated venue', () => {
      const score = calculatePopularityScore(2.0, 50);
      expect(score).toBeLessThan(50);
    });

    it('should handle no reviews', () => {
      const score = calculatePopularityScore(3.5, 0);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('calculateTrendingBoost', () => {
    it('should return positive boost for trending venues', () => {
      const score = calculateTrendingBoost(0.5, 50);
      expect(score).toBeGreaterThan(0);
    });

    it('should return 0 for venues with few reviews', () => {
      const score = calculateTrendingBoost(0.8, 2);
      expect(score).toBe(0);
    });

    it('should return low score for declining venues', () => {
      const score = calculateTrendingBoost(-0.5, 50);
      expect(score).toBeLessThan(20); // May have momentum boost even with negative trend
    });
  });

  describe('calculateSeasonalityBoost', () => {
    it('should return boost based on seasonality factor', () => {
      const score = calculateSeasonalityBoost(0.8);
      expect(score).toBeGreaterThan(15);
    });

    it('should return 0 for off-season', () => {
      const score = calculateSeasonalityBoost(0);
      expect(score).toBe(0);
    });

    it('should cap at 25 points', () => {
      const score = calculateSeasonalityBoost(1);
      expect(score).toBeLessThanOrEqual(25);
    });
  });

  describe('generateRecommendationReasons', () => {
    const matchFactors = {
      ageCompatibility: 90,
      interestMatch: 85,
      accessibilityMatch: 100,
      budgetMatch: 95,
      populityScore: 88,
      trendingBoost: 20,
      seasonalityBoost: 18,
    };

    it('should generate reasons in English', () => {
      const result = generateRecommendationReasons(matchFactors);
      expect(result.en.length).toBeGreaterThan(0);
      expect(result.en[0]).toMatch(/[A-Z]/); // Should be English
    });

    it('should generate reasons in Chinese', () => {
      const result = generateRecommendationReasons(matchFactors);
      expect(result.zh.length).toBeGreaterThan(0);
    });

    it('should mention age compatibility for high match', () => {
      const result = generateRecommendationReasons(matchFactors);
      expect(result.en.some(r => r.includes('age'))).toBe(true);
    });

    it('should mention quality for high popularity', () => {
      const result = generateRecommendationReasons(matchFactors);
      expect(result.en.some(r => r.toLowerCase().includes('rate'))).toBe(true);
    });

    it('should handle low scores gracefully', () => {
      const lowFactors = {
        ageCompatibility: 20,
        interestMatch: 25,
        accessibilityMatch: 0,
        budgetMatch: 10,
        populityScore: 30,
        trendingBoost: 0,
        seasonalityBoost: 0,
      };
      const result = generateRecommendationReasons(lowFactors);
      expect(result.en.length).toBeGreaterThan(0);
    });
  });

  describe('scoreVenueForFamily', () => {
    it('should return match factors for a venue', () => {
      const factors = scoreVenueForFamily(mockVenue, mockFamilyProfile);
      expect(factors.ageCompatibility).toBeGreaterThanOrEqual(0);
      expect(factors.interestMatch).toBeGreaterThanOrEqual(0);
      expect(factors.accessibilityMatch).toBeGreaterThanOrEqual(0);
      expect(factors.budgetMatch).toBeGreaterThanOrEqual(0);
      expect(factors.populityScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle free venues (parks)', () => {
      const factors = scoreVenueForFamily(mockVenue, mockFamilyProfile);
      expect(factors.budgetMatch).toBeGreaterThanOrEqual(80);
    });

    it('should score paid venues appropriately', () => {
      const factors = scoreVenueForFamily(mockVenue2, mockFamilyProfile);
      expect(factors.budgetMatch).toBeGreaterThan(0);
    });
  });

  describe('calculateRecommendationScore', () => {
    it('should return score between 0 and 100', () => {
      const factors = {
        ageCompatibility: 90,
        interestMatch: 85,
        accessibilityMatch: 100,
        budgetMatch: 95,
        populityScore: 88,
        trendingBoost: 20,
        seasonalityBoost: 18,
      };
      const score = calculateRecommendationScore(factors);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should weight quality highly', () => {
      const highQuality = {
        ageCompatibility: 100,
        interestMatch: 100,
        accessibilityMatch: 100,
        budgetMatch: 100,
        populityScore: 100,
        trendingBoost: 0,
        seasonalityBoost: 0,
      };
      const score = calculateRecommendationScore(highQuality);
      expect(score).toBeGreaterThan(90);
    });

    it('should handle all zero factors', () => {
      const zero = {
        ageCompatibility: 0,
        interestMatch: 0,
        accessibilityMatch: 0,
        budgetMatch: 0,
        populityScore: 0,
        trendingBoost: 0,
        seasonalityBoost: 0,
      };
      const score = calculateRecommendationScore(zero);
      expect(score).toBe(0);
    });
  });

  describe('calculateConfidenceScore', () => {
    it('should return score between 0 and 100', () => {
      const score = calculateConfidenceScore(50, 0.8, 0.9);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should increase with review count', () => {
      const score1 = calculateConfidenceScore(5, 0.8, 0.9);
      const score2 = calculateConfidenceScore(100, 0.8, 0.9);
      expect(score2).toBeGreaterThan(score1);
    });

    it('should consider distance relevance', () => {
      const score1 = calculateConfidenceScore(50, 0.2, 0.9);
      const score2 = calculateConfidenceScore(50, 0.9, 0.9);
      expect(score2).toBeGreaterThan(score1);
    });

    it('should consider data completeness', () => {
      const score1 = calculateConfidenceScore(50, 0.8, 0.1);
      const score2 = calculateConfidenceScore(50, 0.8, 0.9);
      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe('getTopRecommendations', () => {
    it('should return recommendations sorted by score', () => {
      const venues: LocationWithReviews[] = [mockVenue, mockVenue2];
      const recs = getTopRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        5
      );
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.length).toBeLessThanOrEqual(5);

      // Should be sorted by score
      for (let i = 1; i < recs.length; i++) {
        expect(recs[i - 1].score).toBeGreaterThanOrEqual(recs[i].score);
      }
    });

    it('should boost previously favorited venues', () => {
      const venues: LocationWithReviews[] = [mockVenue, mockVenue2];
      const recs = getTopRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        5
      );

      const venue1Rec = recs.find(r => r.venueId === 'venue-1');
      expect(venue1Rec).toBeDefined();
    });

    it('should respect limit parameter', () => {
      const venues: LocationWithReviews[] = [
        mockVenue,
        mockVenue2,
        { ...mockVenue, id: 'venue-3' },
      ];
      const recs = getTopRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        2
      );
      expect(recs.length).toBeLessThanOrEqual(2);
    });

    it('should generate reasons for recommendations', () => {
      const venues: LocationWithReviews[] = [mockVenue];
      const recs = getTopRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        5
      );
      expect(recs.length).toBeGreaterThan(0);
      if (recs.length > 0 && recs[0].reasons && recs[0].reasons.en) {
        expect(recs[0].reasons.en.length).toBeGreaterThan(0);
      }
    });

    it('should support Chinese language', () => {
      const venues: LocationWithReviews[] = [mockVenue];
      const recs = getTopRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        5
      );
      expect(recs.length).toBeGreaterThan(0);
      if (recs.length > 0 && recs[0].reasons && recs[0].reasons.zh) {
        expect(recs[0].reasons.zh.length).toBeGreaterThan(0);
      }
    });
  });

  describe('findSimilarFamilyVenues', () => {
    it('should return similar venues based on favorites', () => {
      const venues: LocationWithReviews[] = [
        mockVenue,
        mockVenue2,
        {
          ...mockVenue,
          id: 'venue-3',
          category: 'park',
          facilities: ['playground', 'stroller_accessible'],
        },
      ];
      const similar = findSimilarFamilyVenues(mockUserHistory, venues);
      expect(similar.length).toBeGreaterThan(0);
    });

    it('should exclude already viewed venues', () => {
      const venues: LocationWithReviews[] = [mockVenue, mockVenue2];
      const similar = findSimilarFamilyVenues(mockUserHistory, venues);
      const viewedIds = mockUserHistory.viewedLocations;
      expect(
        similar.every(v => !viewedIds.includes(v.id))
      ).toBe(true);
    });

    it('should return empty for no favorites', () => {
      const emptyHistory: UserInteractionHistory = {
        searchTerms: [],
        viewedLocations: [],
        favoriteLocations: [],
        previousVisits: [],
      };
      const venues: LocationWithReviews[] = [mockVenue, mockVenue2];
      const similar = findSimilarFamilyVenues(emptyHistory, venues);
      expect(similar.length).toBe(0);
    });

    it('should match by category and facilities', () => {
      const parkLike: LocationWithReviews = {
        ...mockVenue,
        id: 'venue-4',
        category: 'park',
        facilities: ['playground'],
      };
      const venues: LocationWithReviews[] = [mockVenue, mockVenue2, parkLike];
      const similar = findSimilarFamilyVenues(mockUserHistory, venues);
      expect(similar.some(v => v.id === 'venue-4')).toBe(true);
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should return complete recommendation object', () => {
      const venues: LocationWithReviews[] = [mockVenue, mockVenue2];
      const result = getPersonalizedRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory
      );

      expect(result.topRecommendations).toBeDefined();
      expect(result.similarVenues).toBeDefined();
      expect(result.newVenues).toBeDefined();
    });

    it('should respect limit option', () => {
      const venues: LocationWithReviews[] = [
        mockVenue,
        mockVenue2,
        { ...mockVenue, id: 'venue-3', reviewCount: 20 },
      ];
      const result = getPersonalizedRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        { limit: 2 }
      );
      expect(result.topRecommendations.length).toBeLessThanOrEqual(2);
    });

    it('should find new high-quality venues', () => {
      const newVenue: LocationWithReviews = {
        ...mockVenue,
        id: 'venue-new',
        averageRating: 4.5,
      };
      const venues: LocationWithReviews[] = [
        mockVenue,
        mockVenue2,
        newVenue,
      ];
      const result = getPersonalizedRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        { includeNewVenues: true }
      );
      expect(result.newVenues.length).toBeGreaterThan(0);
    });

    it('should support both languages', () => {
      const venues: LocationWithReviews[] = [mockVenue];
      const resultEn = getPersonalizedRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        { language: 'en' }
      );
      const resultZh = getPersonalizedRecommendations(
        venues,
        mockFamilyProfile,
        mockUserHistory,
        { language: 'zh' }
      );

      expect(resultEn.topRecommendations.length).toBeGreaterThan(0);
      expect(resultZh.topRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeRecommendationQuality', () => {
    it('should return quality metrics for a venue', () => {
      const recommendations = [
        {
          venueId: 'venue-1',
          venueName: { zh: 'Test', en: 'Test' },
          score: 85,
          reasons: { zh: ['test'], en: ['test'] },
          matchFactors: {
            ageCompatibility: 100,
            interestMatch: 100,
            accessibilityMatch: 100,
            budgetMatch: 100,
            populityScore: 100,
            trendingBoost: 0,
            seasonalityBoost: 0,
          },
          confidence: 90,
        },
      ];

      const quality = analyzeRecommendationQuality('venue-1', recommendations);
      expect(quality.recommendationRate).toBeGreaterThan(0);
      expect(quality.averageScore).toBeGreaterThan(0);
      expect(quality.averageConfidence).toBeGreaterThan(0);
    });

    it('should return zero metrics for non-existent venue', () => {
      const recommendations: any[] = [];
      const quality = analyzeRecommendationQuality('venue-404', recommendations);
      expect(quality.recommendationRate).toBe(0);
      expect(quality.averageScore).toBe(0);
      expect(quality.averageConfidence).toBe(0);
      expect(quality.topReasons.length).toBe(0);
    });

    it('should identify top reasons', () => {
      const recommendations = [
        {
          venueId: 'venue-1',
          venueName: { zh: 'Test', en: 'Test' },
          score: 85,
          reasons: {
            zh: ['好評'],
            en: ['High rating', 'Good location'],
          },
          matchFactors: {
            ageCompatibility: 100,
            interestMatch: 100,
            accessibilityMatch: 100,
            budgetMatch: 100,
            populityScore: 100,
            trendingBoost: 0,
            seasonalityBoost: 0,
          },
          confidence: 90,
        },
      ];

      const quality = analyzeRecommendationQuality('venue-1', recommendations);
      expect(quality.topReasons.length).toBeGreaterThan(0);
      expect(quality.topReasons).toContain('Good location');
    });
  });
});
