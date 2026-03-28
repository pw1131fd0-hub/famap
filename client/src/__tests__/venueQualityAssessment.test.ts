import { describe, it, expect, beforeEach } from 'vitest';
import type {
  VenueCredibility,
  VenueSuitability,
  VenueComparison,
  FamilyNeed,
} from '../utils/venueQualityAssessment';
import {
  assessVenueCredibility,
  evaluateVenueSuitability,
  compareVenuesForFamily,
  getVenueQualitySummary,
} from '../utils/venueQualityAssessment';
import type { Location } from '../types';

describe('venueQualityAssessment utility', () => {
  let mockLocation: Location;
  let mockFamilyNeeds: FamilyNeed[];

  beforeEach(() => {
    mockLocation = {
      id: 'venue_test_1',
      name: {
        zh: '測試公園',
        en: 'Test Park',
      },
      category: 'park',
      coordinates: {
        lat: 25.0355,
        lng: 121.5655,
      },
      facilities: ['changing_table', 'stroller_accessible', 'high_chair'],
      averageRating: 4.5,
      description: {
        zh: '美麗的公園',
        en: 'Beautiful park',
      },
    };

    mockFamilyNeeds = [
      {
        category: 'changing_table',
        importance: 'critical',
        weight: 1.0,
      },
      {
        category: 'stroller_accessible',
        importance: 'important',
        weight: 0.8,
      },
      {
        category: 'high_chair',
        importance: 'nice-to-have',
        weight: 0.5,
      },
    ];
  });

  describe('assessVenueCredibility', () => {
    it('should return baseline credibility with no review data', () => {
      const credibility = assessVenueCredibility(mockLocation);

      expect(credibility).toBeDefined();
      expect(credibility.score).toBeGreaterThanOrEqual(0);
      expect(credibility.score).toBeLessThanOrEqual(100);
      expect(credibility.dataRecency).toBeGreaterThan(0);
      expect(credibility.reviewCount).toBe(0);
      expect(credibility.operatorVerification).toBe(true);
      expect(credibility.factorsAnalyzed).toBeInstanceOf(Array);
    });

    it('should increase credibility score with review data', () => {
      const reviewData = {
        count: 50,
        recentCount: 10,
        averageRating: 4.5,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        reviewData
      );

      expect(credibility.score).toBeGreaterThan(50);
      expect(credibility.reviewCount).toBe(50);
      expect(credibility.factorsAnalyzed).toContain('Review count verified');
    });

    it('should account for recent review activity', () => {
      const reviewData = {
        count: 30,
        recentCount: 15,
        averageRating: 4.8,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        reviewData
      );

      expect(credibility.factorsAnalyzed).toContain('Recent activity detected');
      expect(credibility.score).toBeGreaterThan(50);
    });

    it('should incorporate user contributions', () => {
      const reviewData = {
        count: 20,
        recentCount: 5,
        averageRating: 4.0,
      };

      const userData = {
        contributionsCount: 8,
        lastUpdateDays: 5,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        reviewData,
        userData
      );

      expect(credibility.userContributions).toBe(8);
      expect(credibility.factorsAnalyzed).toContain(
        'User-generated content available'
      );
    });

    it('should factor in data freshness', () => {
      const reviewData = {
        count: 25,
        recentCount: 8,
        averageRating: 4.2,
      };

      const userData = {
        contributionsCount: 5,
        lastUpdateDays: 2,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        reviewData,
        userData
      );

      expect(credibility.dataRecency).toBeLessThanOrEqual(365);
      expect(credibility.score).toBeGreaterThan(50);
    });

    it('should verify operator verification', () => {
      const credibility = assessVenueCredibility(mockLocation);

      expect(credibility.operatorVerification).toBe(true);
      expect(credibility.factorsAnalyzed).toContain(
        'Operator verification confirmed'
      );
    });

    it('should calculate consistency index', () => {
      const reviewData = {
        count: 40,
        recentCount: 12,
        averageRating: 4.7,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        reviewData
      );

      expect(credibility.consistencyIndex).toBeGreaterThanOrEqual(0);
      expect(credibility.consistencyIndex).toBeLessThanOrEqual(100);
    });

    it('should cap score at 100', () => {
      const reviewData = {
        count: 500,
        recentCount: 100,
        averageRating: 5.0,
      };

      const userData = {
        contributionsCount: 50,
        lastUpdateDays: 1,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        reviewData,
        userData
      );

      expect(credibility.score).toBeLessThanOrEqual(100);
    });

    it('should handle missing review data gracefully', () => {
      const credibility = assessVenueCredibility(mockLocation, undefined);

      expect(credibility.score).toBeGreaterThanOrEqual(0);
      expect(credibility.score).toBeLessThanOrEqual(100);
      expect(credibility.reviewCount).toBe(0);
    });

    it('should handle missing user data gracefully', () => {
      const reviewData = {
        count: 15,
        recentCount: 5,
        averageRating: 4.0,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        reviewData,
        undefined
      );

      expect(credibility.score).toBeGreaterThan(50);
      expect(credibility.userContributions).toBe(0);
    });
  });

  describe('evaluateVenueSuitability', () => {
    it('should return high suitability when all needs are met', () => {
      const credibility = assessVenueCredibility(mockLocation);

      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability).toBeDefined();
      expect(suitability.suitabilityScore).toBeGreaterThan(0);
      expect(suitability.matchedNeeds.length).toBeGreaterThan(0);
      expect(suitability.venue.id).toBe(mockLocation.id);
    });

    it('should match facilities to family needs', () => {
      const credibility = assessVenueCredibility(mockLocation);

      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.matchedNeeds).toContain('changing_table');
      expect(suitability.matchedNeeds).toContain('stroller_accessible');
      expect(suitability.matchedNeeds).toContain('high_chair');
    });

    it('should identify unmet critical needs', () => {
      const locationWithoutCritical: Location = {
        ...mockLocation,
        facilities: ['wifi', 'playground'],
      };

      const credibility = assessVenueCredibility(locationWithoutCritical);

      const suitability = evaluateVenueSuitability(
        locationWithoutCritical,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.unmatchedNeeds).toContain('changing_table');
    });

    it('should calculate suitability score based on need weights', () => {
      const credibility = assessVenueCredibility(mockLocation);

      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.suitabilityScore).toBeGreaterThan(0);
      expect(suitability.suitabilityScore).toBeLessThanOrEqual(100);
    });

    it('should include reasoning in suitability assessment', () => {
      const credibility = assessVenueCredibility(mockLocation);

      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.reasoning).toBeInstanceOf(Array);
      expect(suitability.reasoning.length).toBeGreaterThan(0);
    });

    it('should provide confidence score', () => {
      const credibility = assessVenueCredibility(mockLocation);

      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.confidence).toBeGreaterThanOrEqual(0);
      expect(suitability.confidence).toBeLessThanOrEqual(100);
    });

    it('should handle empty family needs array', () => {
      const credibility = assessVenueCredibility(mockLocation);

      const suitability = evaluateVenueSuitability(
        mockLocation,
        [],
        credibility
      );

      expect(suitability.suitabilityScore).toBeGreaterThanOrEqual(0);
      expect(suitability.matchedNeeds.length).toBe(0);
    });

    it('should handle empty facilities array', () => {
      const locationWithoutFacilities: Location = {
        ...mockLocation,
        facilities: [],
      };

      const credibility = assessVenueCredibility(locationWithoutFacilities);

      const suitability = evaluateVenueSuitability(
        locationWithoutFacilities,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.unmatchedNeeds.length).toBeGreaterThan(0);
    });

    it('should weight critical needs more heavily', () => {
      const criticalNeedsOnly: FamilyNeed[] = [
        {
          category: 'changing_table',
          importance: 'critical',
          weight: 1.0,
        },
      ];

      const credibility = assessVenueCredibility(mockLocation);

      const suitability = evaluateVenueSuitability(
        mockLocation,
        criticalNeedsOnly,
        credibility
      );

      expect(suitability.suitabilityScore).toBeGreaterThan(50);
    });
  });

  describe('compareVenuesForFamily', () => {
    it('should compare multiple venues and identify best match', () => {
      const venue2: Location = {
        ...mockLocation,
        id: 'venue_test_2',
        name: { zh: '公園2', en: 'Park 2' },
        facilities: ['stroller_accessible'],
      };

      const credibility1 = assessVenueCredibility(mockLocation);
      const credibility2 = assessVenueCredibility(venue2);

      const suitability1 = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility1
      );

      const suitability2 = evaluateVenueSuitability(
        venue2,
        mockFamilyNeeds,
        credibility2
      );

      const comparison = compareVenuesForFamily(
        [suitability1, suitability2],
        mockFamilyNeeds
      );

      expect(comparison).toBeDefined();
      expect(comparison.venues.length).toBe(2);
      expect(comparison.bestMatch).toBeDefined();
      expect(comparison.compareReasons).toBeInstanceOf(Array);
    });

    it('should select venue with most matched needs as best match', () => {
      const venueFullMatch: Location = {
        ...mockLocation,
        facilities: [
          'changing_table',
          'stroller_accessible',
          'high_chair',
        ],
      };

      const venuePartialMatch: Location = {
        ...mockLocation,
        id: 'venue_partial',
        facilities: ['stroller_accessible'],
      };

      const cred1 = assessVenueCredibility(venueFullMatch);
      const cred2 = assessVenueCredibility(venuePartialMatch);

      const suit1 = evaluateVenueSuitability(
        venueFullMatch,
        mockFamilyNeeds,
        cred1
      );

      const suit2 = evaluateVenueSuitability(
        venuePartialMatch,
        mockFamilyNeeds,
        cred2
      );

      const comparison = compareVenuesForFamily(
        [suit1, suit2],
        mockFamilyNeeds
      );

      expect(comparison.bestMatch.venue.id).toBe(venueFullMatch.id);
    });

    it('should provide comparison reasons', () => {
      const venue2: Location = {
        ...mockLocation,
        id: 'venue_test_2',
        facilities: ['playground'],
      };

      const cred1 = assessVenueCredibility(mockLocation);
      const cred2 = assessVenueCredibility(venue2);

      const suit1 = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        cred1
      );

      const suit2 = evaluateVenueSuitability(
        venue2,
        mockFamilyNeeds,
        cred2
      );

      const comparison = compareVenuesForFamily(
        [suit1, suit2],
        mockFamilyNeeds
      );

      expect(comparison.compareReasons.length).toBeGreaterThan(0);
    });

    it('should identify risk factors', () => {
      const riskyVenue: Location = {
        ...mockLocation,
        id: 'venue_risky',
        facilities: [],
      };

      const safeVenue: Location = {
        ...mockLocation,
        facilities: ['changing_table', 'stroller_accessible'],
      };

      const credRisky = assessVenueCredibility(riskyVenue);
      const credSafe = assessVenueCredibility(safeVenue);

      const suitRisky = evaluateVenueSuitability(
        riskyVenue,
        mockFamilyNeeds,
        credRisky
      );

      const suitSafe = evaluateVenueSuitability(
        safeVenue,
        mockFamilyNeeds,
        credSafe
      );

      const comparison = compareVenuesForFamily(
        [suitRisky, suitSafe],
        mockFamilyNeeds
      );

      expect(comparison.riskFactors).toBeInstanceOf(Array);
    });

    it('should provide recommendations', () => {
      const venue2: Location = {
        ...mockLocation,
        id: 'venue_test_2',
      };

      const cred1 = assessVenueCredibility(mockLocation);
      const cred2 = assessVenueCredibility(venue2);

      const suit1 = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        cred1
      );

      const suit2 = evaluateVenueSuitability(
        venue2,
        mockFamilyNeeds,
        cred2
      );

      const comparison = compareVenuesForFamily(
        [suit1, suit2],
        mockFamilyNeeds
      );

      expect(comparison.recommendations).toBeInstanceOf(Array);
    });

    it('should handle single venue comparison', () => {
      const credibility = assessVenueCredibility(mockLocation);
      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      const comparison = compareVenuesForFamily(
        [suitability],
        mockFamilyNeeds
      );

      expect(comparison.venues.length).toBe(1);
      expect(comparison.bestMatch.venue.id).toBe(mockLocation.id);
    });
  });

  describe('getVenueQualitySummary', () => {
    it('should generate quality summary with grade', () => {
      const credibility = assessVenueCredibility(mockLocation);
      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(summary).toBeDefined();
      expect(summary.qualityGrade).toBeDefined();
      expect(summary.overallScore).toBeGreaterThanOrEqual(0);
      expect(summary.overallScore).toBeLessThanOrEqual(100);
    });

    it('should assign appropriate grade based on score', () => {
      const credibility = assessVenueCredibility(mockLocation, {
        count: 100,
        recentCount: 50,
        averageRating: 4.8,
      });

      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(['A', 'B', 'C', 'D', 'F']).toContain(summary.qualityGrade);
    });

    it('should include quality metrics in summary', () => {
      const credibility = assessVenueCredibility(mockLocation);
      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(summary.credibilityScore).toBeDefined();
      expect(summary.suitabilityScore).toBeDefined();
    });

    it('should provide quality explanation', () => {
      const credibility = assessVenueCredibility(mockLocation);
      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(summary.explanation).toBeDefined();
      expect(summary.explanation.length).toBeGreaterThan(0);
    });

    it('should list key strengths', () => {
      const credibility = assessVenueCredibility(mockLocation, {
        count: 50,
        recentCount: 15,
        averageRating: 4.5,
      });

      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(summary.keyStrengths).toBeInstanceOf(Array);
    });

    it('should list areas for improvement', () => {
      const credibility = assessVenueCredibility(mockLocation);
      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(summary.areasForImprovement).toBeInstanceOf(Array);
    });

    it('should handle low-quality venues', () => {
      const poorVenue: Location = {
        ...mockLocation,
        facilities: [],
      };

      const credibility = assessVenueCredibility(poorVenue);
      const suitability = evaluateVenueSuitability(
        poorVenue,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(summary.overallScore).toBeLessThan(70);
      expect(summary.qualityGrade).toBeDefined();
    });

    it('should handle high-quality venues', () => {
      const excellentVenue: Location = {
        ...mockLocation,
        facilities: [
          'changing_table',
          'stroller_accessible',
          'high_chair',
          'nursing_room',
          'wifi',
          'parking',
        ],
      };

      const credibility = assessVenueCredibility(excellentVenue, {
        count: 200,
        recentCount: 100,
        averageRating: 4.9,
      });

      const suitability = evaluateVenueSuitability(
        excellentVenue,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(summary.overallScore).toBeGreaterThan(80);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow for venue assessment', () => {
      // Step 1: Assess credibility
      const credibility = assessVenueCredibility(mockLocation, {
        count: 45,
        recentCount: 12,
        averageRating: 4.3,
      });

      expect(credibility.score).toBeGreaterThan(0);

      // Step 2: Evaluate suitability
      const suitability = evaluateVenueSuitability(
        mockLocation,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.suitabilityScore).toBeGreaterThan(0);

      // Step 3: Get summary
      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(summary.overallScore).toBeGreaterThan(0);
      expect(summary.qualityGrade).toBeDefined();
    });

    it('should compare multiple venues end-to-end', () => {
      const venues = [
        mockLocation,
        { ...mockLocation, id: 'venue_2', facilities: ['playground'] },
        {
          ...mockLocation,
          id: 'venue_3',
          facilities: [
            'changing_table',
            'stroller_accessible',
            'nursing_room',
          ],
        },
      ];

      const suitabilities = venues.map((venue) => {
        const cred = assessVenueCredibility(venue);
        return evaluateVenueSuitability(venue, mockFamilyNeeds, cred);
      });

      const comparison = compareVenuesForFamily(
        suitabilities,
        mockFamilyNeeds
      );

      expect(comparison.venues.length).toBe(3);
      expect(comparison.bestMatch).toBeDefined();
      expect(comparison.compareReasons.length).toBeGreaterThan(0);
    });

    it('should handle edge case with very low venue quality', () => {
      const poorVenue: Location = {
        ...mockLocation,
        facilities: [],
      };

      const credibility = assessVenueCredibility(poorVenue);
      const suitability = evaluateVenueSuitability(
        poorVenue,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.suitabilityScore).toBeLessThan(50);
      expect(suitability.unmatchedNeeds.length).toBeGreaterThan(0);
    });

    it('should handle edge case with perfect venue match', () => {
      const perfectVenue: Location = {
        ...mockLocation,
        facilities: [
          'changing_table',
          'stroller_accessible',
          'high_chair',
          'nursing_room',
          'playground',
          'wifi',
          'parking',
          'restaurant',
        ],
      };

      const credibility = assessVenueCredibility(perfectVenue, {
        count: 500,
        recentCount: 200,
        averageRating: 4.95,
      });

      const suitability = evaluateVenueSuitability(
        perfectVenue,
        mockFamilyNeeds,
        credibility
      );

      const summary = getVenueQualitySummary(
        credibility,
        suitability
      );

      expect(suitability.suitabilityScore).toBeGreaterThan(85);
      expect(suitability.matchedNeeds.length).toBeGreaterThanOrEqual(
        mockFamilyNeeds.length
      );
      expect(summary.overallScore).toBeGreaterThan(85);
    });
  });

  describe('Boundary conditions', () => {
    it('should handle zero reviews gracefully', () => {
      const credibility = assessVenueCredibility(mockLocation, {
        count: 0,
        recentCount: 0,
        averageRating: 0,
      });

      expect(credibility.score).toBeGreaterThanOrEqual(0);
      expect(credibility.score).toBeLessThanOrEqual(100);
    });

    it('should handle very old data', () => {
      const userData = {
        contributionsCount: 2,
        lastUpdateDays: 365,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        undefined,
        userData
      );

      expect(credibility.dataRecency).toBeLessThanOrEqual(365);
    });

    it('should handle very new data', () => {
      const userData = {
        contributionsCount: 10,
        lastUpdateDays: 1,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        undefined,
        userData
      );

      expect(credibility.score).toBeGreaterThan(50);
    });

    it('should handle large number of reviews', () => {
      const reviewData = {
        count: 10000,
        recentCount: 5000,
        averageRating: 4.7,
      };

      const credibility = assessVenueCredibility(
        mockLocation,
        reviewData
      );

      expect(credibility.score).toBeLessThanOrEqual(100);
      expect(credibility.reviewCount).toBe(10000);
    });

    it('should handle empty location facilities array', () => {
      const locationNofacilities: Location = {
        ...mockLocation,
        facilities: [],
      };

      const credibility = assessVenueCredibility(locationNofacilities);
      const suitability = evaluateVenueSuitability(
        locationNofacilities,
        mockFamilyNeeds,
        credibility
      );

      expect(suitability.unmatchedNeeds.length).toEqual(mockFamilyNeeds.length);
    });
  });
});
