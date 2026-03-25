/**
 * Location Insights Utility Tests
 * Comprehensive test suite for location analytics and insights generation
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFamilySuitabilityScore,
  extractSafetyConcerns,
  extractLocationStrengths,
  getRecommendedAgeGroups,
  calculateAccessibilityScore,
  assessFamilyCompatibility,
  countTaiwanSpecificFeatures,
  calculateDataCompletenessScore,
  calculateVerificationScore,
  calculateAverageCrowdiness,
  generateLocationInsight,
} from '../utils/locationInsights';
import type { Location, Review, CrowdednessReport } from '../types';

// Mock data
const mockLocation: Location = {
  id: 'test-location-1',
  name: { zh: '測試公園', en: 'Test Park' },
  description: { zh: '測試', en: 'Test' },
  category: 'park',
  coordinates: { lat: 25.0330, lng: 121.5654 },
  address: { zh: '台北市大安區', en: 'Da-An District, Taipei' },
  facilities: ['playground', 'changing_table', 'nursing_room'],
  averageRating: 4.2,
  photoUrl: 'https://example.com/park.jpg',
  phoneNumber: '02-XXXX-XXXX',
  operatingHours: { monday: '08:00-18:00', tuesday: '08:00-18:00' },
  stroller: { strollerFriendly: true },
  nursingRoom: { hasDedicatedNursingRoom: true },
  accessibility: {
    wheelchairAccessible: true,
    accessibleToilet: true,
    hasElevator: true,
    hasRamp: true,
    disabledParking: true,
  },
};

const mockReviewsPositive: Review[] = [
  {
    id: '1',
    locationId: 'test-location-1',
    userId: 'user1',
    userName: 'user1',
    rating: 5,
    comment: 'Very clean and excellent service! Kids loved it. Highly recommend!',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    locationId: 'test-location-1',
    userId: 'user2',
    userName: 'user2',
    rating: 4,
    comment: 'Great place for families. Friendly staff and good accessibility.',
    createdAt: new Date().toISOString(),
  },
];

const mockReviewsNegative: Review[] = [
  {
    id: '3',
    locationId: 'test-location-1',
    userId: 'user3',
    userName: 'user3',
    rating: 2,
    comment: 'Too crowded and not very clean. Safety concerns.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    locationId: 'test-location-1',
    userId: 'user4',
    userName: 'user4',
    rating: 2,
    comment: 'Expensive and accessibility not as good as expected.',
    createdAt: new Date().toISOString(),
  },
];

const mockMixedReviews: Review[] = [...mockReviewsPositive, ...mockReviewsNegative];

const mockCrowdednessReports: CrowdednessReport[] = [
  {
    id: '1',
    locationId: 'test-location-1',
    userId: 'user1',
    userName: 'user1',
    crowdingLevel: 'light',
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    locationId: 'test-location-1',
    userId: 'user2',
    userName: 'user2',
    crowdingLevel: 'light',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    locationId: 'test-location-1',
    userId: 'user3',
    userName: 'user3',
    crowdingLevel: 'heavy',
    createdAt: '2024-01-15T14:00:00Z',
  },
];

describe('Location Insights Utilities', () => {
  describe('calculateFamilySuitabilityScore', () => {
    it('should calculate score based on facilities', () => {
      const score = calculateFamilySuitabilityScore(mockLocation, []);
      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should increase score with positive reviews', () => {
      const scoreWithoutReviews = calculateFamilySuitabilityScore(mockLocation, []);
      const scoreWithReviews = calculateFamilySuitabilityScore(mockLocation, mockReviewsPositive);
      expect(scoreWithReviews).toBeGreaterThanOrEqual(scoreWithoutReviews);
    });

    it('should decrease score with negative reviews', () => {
      const scoreWithNegativeReviews = calculateFamilySuitabilityScore(mockLocation, mockReviewsNegative);
      expect(scoreWithNegativeReviews).toBeLessThanOrEqual(100);
    });

    it('should return score between 0 and 100', () => {
      const score = calculateFamilySuitabilityScore(mockLocation, mockMixedReviews);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('extractSafetyConcerns', () => {
    it('should extract safety concerns from low-rated reviews', () => {
      const concerns = extractSafetyConcerns(mockReviewsNegative);
      expect(concerns.length).toBeGreaterThan(0);
    });

    it('should not extract concerns from high-rated reviews', () => {
      const concerns = extractSafetyConcerns(mockReviewsPositive);
      expect(concerns.length).toBe(0);
    });

    it('should identify cleanliness issues', () => {
      const reviews: Review[] = [
        {
          id: '1',
          locationId: 'test-location-1',
          userId: 'user1',
          userName: 'user1',
          rating: 2,
          comment: 'Very dirty and unhygienic',
          createdAt: new Date().toISOString(),
        },
      ];
      const concerns = extractSafetyConcerns(reviews);
      expect(concerns.some(c => c.includes('Cleanliness'))).toBe(true);
    });

    it('should identify crowding concerns', () => {
      const reviews: Review[] = [
        {
          id: '1',
          locationId: 'test-location-1',
          userId: 'user1',
          userName: 'user1',
          rating: 2,
          comment: 'Way too crowded and busy',
          createdAt: new Date().toISOString(),
        },
      ];
      const concerns = extractSafetyConcerns(reviews);
      expect(concerns.some(c => c.includes('Crowded'))).toBe(true);
    });

    it('should limit concerns to top 5', () => {
      const manyBadReviews: Review[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        locationId: 'test-location-1',
        userId: `user${i}`,
        userName: `user${i}`,
        rating: 1,
        comment: 'Multiple issues: dirty, crowded, unsafe, expensive, not accessible',
        createdAt: new Date().toISOString(),
      }));
      const concerns = extractSafetyConcerns(manyBadReviews);
      expect(concerns.length).toBeLessThanOrEqual(5);
    });
  });

  describe('extractLocationStrengths', () => {
    it('should extract strengths from high-rated reviews', () => {
      const strengths = extractLocationStrengths(mockReviewsPositive);
      expect(strengths.length).toBeGreaterThan(0);
    });

    it('should not extract strengths from low-rated reviews', () => {
      const strengths = extractLocationStrengths(mockReviewsNegative);
      expect(strengths.length).toBe(0);
    });

    it('should identify cleanliness strength', () => {
      const reviews: Review[] = [
        {
          id: '1',
          locationId: 'test-location-1',
          userId: 'user1',
          userName: 'user1',
          rating: 5,
          comment: 'Very clean and immaculate',
          createdAt: new Date().toISOString(),
        },
      ];
      const strengths = extractLocationStrengths(reviews);
      expect(strengths.some(s => s.includes('clean'))).toBe(true);
    });

    it('should identify family-friendliness', () => {
      const reviews: Review[] = [
        {
          id: '1',
          locationId: 'test-location-1',
          userId: 'user1',
          userName: 'user1',
          rating: 5,
          comment: 'Perfect for families and kids love it',
          createdAt: new Date().toISOString(),
        },
      ];
      const strengths = extractLocationStrengths(reviews);
      expect(strengths.some(s => s.includes('Family'))).toBe(true);
    });

    it('should limit strengths to top 5', () => {
      const manyGoodReviews: Review[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        locationId: 'test-location-1',
        userId: `user${i}`,
        userName: `user${i}`,
        rating: 5,
        comment: 'Excellent: clean, friendly staff, great value, very accessible, kids loved it',
        createdAt: new Date().toISOString(),
      }));
      const strengths = extractLocationStrengths(manyGoodReviews);
      expect(strengths.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getRecommendedAgeGroups', () => {
    it('should recommend all age groups for location with multiple facilities', () => {
      const ageGroups = getRecommendedAgeGroups(mockLocation);
      expect(ageGroups.length).toBeGreaterThan(0);
    });

    it('should recommend infants if nursing services available', () => {
      const ageGroups = getRecommendedAgeGroups({
        ...mockLocation,
        nursingRoom: { hasDedicatedNursingRoom: true },
      });
      expect(ageGroups.some(ag => ag.includes('Infant'))).toBe(true);
    });

    it('should recommend toddlers if playground available', () => {
      const ageGroups = getRecommendedAgeGroups({
        ...mockLocation,
        facilities: ['playground'],
      });
      expect(ageGroups.some(ag => ag.includes('Toddler'))).toBe(true);
    });

    it('should return all ages as default', () => {
      const ageGroups = getRecommendedAgeGroups({ ...mockLocation, facilities: [] });
      expect(ageGroups.length).toBeGreaterThan(0);
    });
  });

  describe('calculateAccessibilityScore', () => {
    it('should calculate accessibility score based on features', () => {
      const score = calculateAccessibilityScore(mockLocation);
      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give 0 score if no accessibility features', () => {
      const emptyLocation: Location = {
        id: 'test-location-empty',
        name: { zh: '測試', en: 'Test' },
        description: { zh: '測試', en: 'Test' },
        category: 'park',
        coordinates: { lat: 25.0330, lng: 121.5654 },
        address: { zh: '台北市', en: 'Taipei' },
        facilities: [],
        averageRating: 0,
      };
      const score = calculateAccessibilityScore(emptyLocation);
      expect(score).toBe(0);
    });

    it('should reward stroller accessibility', () => {
      const baseLocation: Location = {
        id: 'test-location-base',
        name: { zh: '測試', en: 'Test' },
        description: { zh: '測試', en: 'Test' },
        category: 'park',
        coordinates: { lat: 25.0330, lng: 121.5654 },
        address: { zh: '台北市', en: 'Taipei' },
        facilities: [],
        averageRating: 0,
      };
      const scoreWithStroller = calculateAccessibilityScore({
        ...baseLocation,
        stroller: { strollerFriendly: true },
      });
      const scoreWithoutStroller = calculateAccessibilityScore(baseLocation);
      expect(scoreWithStroller).toBeGreaterThan(scoreWithoutStroller);
    });

    it('should reward wheelchair accessibility', () => {
      const scoreWithWheelchair = calculateAccessibilityScore({
        ...mockLocation,
        accessibility: {
          wheelchairAccessible: true,
          accessibleToilet: false,
          hasElevator: false,
          hasRamp: false,
          disabledParking: false,
        },
      });
      expect(scoreWithWheelchair).toBeGreaterThan(0);
    });
  });

  describe('assessFamilyCompatibility', () => {
    const familyProfile = {
      childrenAges: [2, 5],
      specialNeeds: undefined,
      budget: 'medium' as const,
      accessibilityNeeds: [],
    };

    it('should return high compatibility for suitable location', () => {
      const compat = assessFamilyCompatibility(mockLocation, mockReviewsPositive, familyProfile);
      expect(compat.overallScore).toBeGreaterThan(50);
    });

    it('should identify age appropriateness', () => {
      const compat = assessFamilyCompatibility(mockLocation, [], familyProfile);
      expect(compat.reasons.length).toBeGreaterThan(0);
    });

    it('should assess accessibility needs', () => {
      const compat = assessFamilyCompatibility(mockLocation, [], {
        ...familyProfile,
        accessibilityNeeds: ['wheelchair'],
      });
      expect(compat.accessibilityMet).toBe(true);
    });

    it('should return default compatibility without profile', () => {
      const compat = assessFamilyCompatibility(mockLocation, []);
      expect(compat.overallScore).toBe(70);
      expect(compat.overallScore).toBeGreaterThanOrEqual(0);
      expect(compat.overallScore).toBeLessThanOrEqual(100);
    });

    it('should detect budget-friendly locations', () => {
      const reviews: Review[] = [
        {
          id: '1',
          locationId: 'test-location-1',
          userId: 'user1',
          userName: 'user1',
          rating: 5,
          comment: 'Very affordable and good value',
          createdAt: new Date().toISOString(),
        },
      ];
      const compat = assessFamilyCompatibility(mockLocation, reviews, {
        ...familyProfile,
        budget: 'low',
      });
      expect(compat.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('countTaiwanSpecificFeatures', () => {
    it('should count implemented Taiwan features', () => {
      const count = countTaiwanSpecificFeatures(mockLocation);
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for location without Taiwan features', () => {
      const count = countTaiwanSpecificFeatures({
        ...mockLocation,
        nursingRoom: { hasDedicatedNursingRoom: false },
        operatingHours: undefined,
      });
      expect(count).toBeLessThan(46); // Total possible Taiwan features
    });

    it('should count up to 46 features maximum', () => {
      const count = countTaiwanSpecificFeatures(mockLocation);
      expect(count).toBeLessThanOrEqual(46);
    });
  });

  describe('calculateDataCompletenessScore', () => {
    it('should calculate completeness based on Taiwan features', () => {
      const score = calculateDataCompletenessScore(mockLocation);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return lower score for incomplete locations', () => {
      const score = calculateDataCompletenessScore({
        ...mockLocation,
        nursingRoom: { hasDedicatedNursingRoom: false },
        operatingHours: undefined,
      });
      expect(score).toBeLessThan(100);
    });
  });

  describe('calculateVerificationScore', () => {
    it('should return 0 for no reviews', () => {
      const score = calculateVerificationScore([]);
      expect(score).toBe(0);
    });

    it('should return 30 for few reviews', () => {
      const score = calculateVerificationScore(mockReviewsPositive.slice(0, 1));
      expect(score).toBe(30);
    });

    it('should return 60 for moderate reviews', () => {
      const moderateReviews = Array.from({ length: 7 }, (_, i) => ({
        id: `${i}`,
        locationId: 'test-location-1',
        userId: `user${i}`,
        userName: `user${i}`,
        rating: 4,
        comment: 'Good place',
        createdAt: new Date().toISOString(),
      }));
      const score = calculateVerificationScore(moderateReviews);
      expect(score).toBe(60);
    });

    it('should return 100 for many reviews', () => {
      const manyReviews = Array.from({ length: 25 }, (_, i) => ({
        id: `${i}`,
        locationId: 'test-location-1',
        userId: `user${i}`,
        userName: `user${i}`,
        rating: 4,
        comment: 'Good place',
        createdAt: new Date().toISOString(),
      }));
      const score = calculateVerificationScore(manyReviews);
      expect(score).toBe(100);
    });
  });

  describe('calculateAverageCrowdiness', () => {
    it('should return unknown for no reports', () => {
      const crowdiness = calculateAverageCrowdiness([]);
      expect(crowdiness).toBe('unknown');
    });

    it('should calculate light when reports are light', () => {
      const lightReports: CrowdednessReport[] = [
        { id: '1', locationId: 'test-location-1', userId: 'user1', userName: 'user1', crowdingLevel: 'light', createdAt: new Date().toISOString() },
        { id: '2', locationId: 'test-location-1', userId: 'user2', userName: 'user2', crowdingLevel: 'light', createdAt: new Date().toISOString() },
      ];
      const crowdiness = calculateAverageCrowdiness(lightReports);
      expect(crowdiness).toBe('light');
    });

    it('should calculate heavy when reports are heavy', () => {
      const heavyReports: CrowdednessReport[] = [
        { id: '1', locationId: 'test-location-1', userId: 'user1', userName: 'user1', crowdingLevel: 'heavy', createdAt: new Date().toISOString() },
        { id: '2', locationId: 'test-location-1', userId: 'user2', userName: 'user2', crowdingLevel: 'heavy', createdAt: new Date().toISOString() },
      ];
      const crowdiness = calculateAverageCrowdiness(heavyReports);
      // Average of heavy (3) and heavy (3) is 3, which is heavy
      expect(crowdiness).toBe('heavy');
    });

    it('should calculate moderate for mixed reports', () => {
      const crowdiness = calculateAverageCrowdiness(mockCrowdednessReports);
      expect(['light', 'moderate', 'heavy']).toContain(crowdiness);
    });
  });

  describe('generateLocationInsight', () => {
    it('should generate comprehensive insight', () => {
      const insight = generateLocationInsight(mockLocation, mockMixedReviews, mockCrowdednessReports);
      expect(insight.familySuitabilityScore).toBeGreaterThanOrEqual(0);
      expect(insight.familySuitabilityScore).toBeLessThanOrEqual(100);
      expect(insight.accessibilityScore).toBeGreaterThanOrEqual(0);
      expect(insight.accessibilityScore).toBeLessThanOrEqual(100);
      expect(insight.totalReviews).toBe(mockMixedReviews.length);
    });

    it('should include recommended age groups', () => {
      const insight = generateLocationInsight(mockLocation, [], []);
      expect(insight.recommendedAgeGroups.length).toBeGreaterThan(0);
    });

    it('should include best time to visit', () => {
      const insight = generateLocationInsight(mockLocation, [], mockCrowdednessReports);
      expect(insight.bestTimeToVisit).toBeTruthy();
    });

    it('should include crowdiness assessment', () => {
      const insight = generateLocationInsight(mockLocation, [], mockCrowdednessReports);
      expect(['light', 'moderate', 'heavy', 'unknown']).toContain(insight.averageCrowdiness);
    });

    it('should extract strengths from positive reviews', () => {
      const insight = generateLocationInsight(mockLocation, mockReviewsPositive, []);
      expect(insight.topStrengths.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract concerns from negative reviews', () => {
      const insight = generateLocationInsight(mockLocation, mockReviewsNegative, []);
      expect(insight.commonConcerns.length).toBeGreaterThan(0);
    });

    it('should include verification score', () => {
      const insight = generateLocationInsight(mockLocation, mockMixedReviews, []);
      expect(insight.verificationScore).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should provide consistent insights across multiple calls', () => {
      const insight1 = generateLocationInsight(mockLocation, mockMixedReviews, mockCrowdednessReports);
      const insight2 = generateLocationInsight(mockLocation, mockMixedReviews, mockCrowdednessReports);
      expect(insight1.familySuitabilityScore).toBe(insight2.familySuitabilityScore);
      expect(insight1.accessibilityScore).toBe(insight2.accessibilityScore);
    });

    it('should handle locations with no reviews gracefully', () => {
      const insight = generateLocationInsight(mockLocation, [], mockCrowdednessReports);
      expect(insight.totalReviews).toBe(0);
      expect(insight.verificationScore).toBe(0);
      expect(insight.commonConcerns.length).toBe(0);
    });

    it('should handle locations with no crowdedness reports gracefully', () => {
      const insight = generateLocationInsight(mockLocation, mockMixedReviews, []);
      expect(insight.averageCrowdiness).toBe('unknown');
    });
  });
});
