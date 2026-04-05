import { describe, it, expect } from 'vitest';
import type { FamilyProfile } from '../types';
import {
  calculateAgeGroupCompatibility,
  calculateInterestOverlap,
  calculateBudgetAlignment,
  assessGroupVenueSuitability,
  recommendOptimalGroupSize,
  findFamilyMatches,
  optimizeGroupForOuting,
  generateGroupRecommendations,
} from '../utils/familyGroupOptimizer';

describe('familyGroupOptimizer', () => {
  // Mock family profiles
  const familyA: FamilyProfile = {
    id: 'family-1',
    displayName: 'Family A',
    childrenAges: [5, 8],
    interests: ['parks', 'outdoor', 'educational'],
    monthlyBudget: 5000,
    specialNeeds: [],
  };

  const familyB: FamilyProfile = {
    id: 'family-2',
    displayName: 'Family B',
    childrenAges: [6, 9],
    interests: ['parks', 'outdoor', 'recreational'],
    monthlyBudget: 5500,
    specialNeeds: [],
  };

  const familyC: FamilyProfile = {
    id: 'family-3',
    displayName: 'Family C',
    childrenAges: [15, 17],
    interests: ['cultural', 'adventure'],
    monthlyBudget: 10000,
    specialNeeds: [],
  };

  const familyD: FamilyProfile = {
    id: 'family-4',
    displayName: 'Family D',
    childrenAges: [4, 7],
    interests: ['parks', 'outdoor'],
    monthlyBudget: 4500,
    specialNeeds: [],
  };

  describe('calculateAgeGroupCompatibility', () => {
    it('should calculate high compatibility for similar age groups', () => {
      const score = calculateAgeGroupCompatibility(familyA, familyB);
      expect(score).toBeGreaterThan(70);
    });

    it('should calculate low compatibility for very different age groups', () => {
      const score = calculateAgeGroupCompatibility(familyA, familyC);
      expect(score).toBeLessThan(30);
    });

    it('should return 0 for families without children ages', () => {
      const emptyFamily: FamilyProfile = {
        id: 'empty',
        displayName: 'Empty Family',
      };
      const score = calculateAgeGroupCompatibility(familyA, emptyFamily);
      expect(score).toBe(0);
    });

    it('should properly calculate compatibility for single child families', () => {
      const singleChildA: FamilyProfile = {
        ...familyA,
        childrenAges: [8],
      };
      const singleChildB: FamilyProfile = {
        ...familyB,
        childrenAges: [9],
      };
      const score = calculateAgeGroupCompatibility(singleChildA, singleChildB);
      expect(score).toBeGreaterThan(50);
    });
  });

  describe('calculateInterestOverlap', () => {
    it('should calculate high overlap for families with shared interests', () => {
      const score = calculateInterestOverlap(familyA, familyB);
      expect(score).toBeGreaterThan(50);
    });

    it('should calculate low overlap for families with different interests', () => {
      const score = calculateInterestOverlap(familyA, familyC);
      expect(score).toBeLessThan(50);
    });

    it('should return 50 for families without interest data', () => {
      const noInterestFamily: FamilyProfile = {
        id: 'no-interest',
        displayName: 'No Interest Family',
      };
      const score = calculateInterestOverlap(familyA, noInterestFamily);
      expect(score).toBe(50);
    });

    it('should handle perfect interest match', () => {
      const family1: FamilyProfile = {
        ...familyA,
        interests: ['parks', 'outdoor'],
      };
      const family2: FamilyProfile = {
        ...familyB,
        interests: ['parks', 'outdoor'],
      };
      const score = calculateInterestOverlap(family1, family2);
      expect(score).toBeGreaterThanOrEqual(90);
    });
  });

  describe('calculateBudgetAlignment', () => {
    it('should calculate high alignment for similar budgets', () => {
      const score = calculateBudgetAlignment(familyA, familyB);
      expect(score).toBeGreaterThan(80);
    });

    it('should calculate low alignment for very different budgets', () => {
      const score = calculateBudgetAlignment(familyA, familyC);
      expect(score).toBeLessThan(60);
    });

    it('should use default budget for families without specified budget', () => {
      const noBudgetFamily: FamilyProfile = {
        id: 'no-budget',
        displayName: 'No Budget Family',
      };
      const score = calculateBudgetAlignment(familyA, noBudgetFamily);
      expect(score).toBeGreaterThan(0);
    });

    it('should perfectly align families with same budget', () => {
      const family1: FamilyProfile = {
        ...familyA,
        monthlyBudget: 5000,
      };
      const family2: FamilyProfile = {
        ...familyB,
        monthlyBudget: 5000,
      };
      const score = calculateBudgetAlignment(family1, family2);
      expect(score).toBe(100);
    });
  });

  describe('assessGroupVenueSuitability', () => {
    const mockVenue = {
      id: 'venue-1',
      name: 'Park',
      coordinates: { lat: 25.0, lng: 121.5 },
      category: 'park' as const,
    };

    it('should assess venue suitability for a group', () => {
      const result = assessGroupVenueSuitability([familyA, familyB], mockVenue);
      expect(result.suitabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.suitabilityScore).toBeLessThanOrEqual(100);
    });

    it('should return empty arrays for families without special needs', () => {
      const result = assessGroupVenueSuitability([familyA, familyB], mockVenue);
      expect(Array.isArray(result.commonNeeds)).toBe(true);
      expect(Array.isArray(result.conflictingNeeds)).toBe(true);
    });

    it('should identify common special needs across families', () => {
      const family1: FamilyProfile = {
        ...familyA,
        specialNeeds: ['wheelchair', 'quiet'],
      };
      const family2: FamilyProfile = {
        ...familyB,
        specialNeeds: ['wheelchair', 'quiet', 'allergen-free'],
      };
      const result = assessGroupVenueSuitability([family1, family2], mockVenue);
      expect(result.commonNeeds).toContain('wheelchair');
      expect(result.commonNeeds).toContain('quiet');
    });

    it('should return zero suitability for empty group', () => {
      const result = assessGroupVenueSuitability([], mockVenue);
      expect(result.suitabilityScore).toBe(0);
    });
  });

  describe('recommendOptimalGroupSize', () => {
    it('should recommend limiting large groups', () => {
      const largeGroup = [
        familyA,
        familyB,
        familyC,
        familyD,
        {
          ...familyA,
          id: 'family-5',
          childrenAges: [3, 5, 7],
        },
      ];
      const result = recommendOptimalGroupSize(largeGroup);
      expect(result.optimalSize).toBeLessThanOrEqual(largeGroup.length);
      expect(result.reasoning).toContain('recommend limiting');
    });

    it('should recommend adding family for small groups', () => {
      const smallGroup = [
        {
          ...familyA,
          childrenAges: [5],
        },
      ];
      const result = recommendOptimalGroupSize(smallGroup);
      expect(result.reasoning).toBeDefined();
    });

    it('should identify well-balanced groups', () => {
      const balancedGroup = [familyA, familyB];
      const result = recommendOptimalGroupSize(balancedGroup);
      expect(result.reasoning).toContain('well-balanced');
    });
  });

  describe('findFamilyMatches', () => {
    it('should find compatible families', () => {
      const matches = findFamilyMatches(familyA, [familyB, familyC, familyD]);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should exclude the requesting family from matches', () => {
      const matches = findFamilyMatches(familyA, [familyA, familyB, familyC]);
      const matchIds = matches.map((m) => m.familyId);
      expect(matchIds).not.toContain(familyA.id);
    });

    it('should respect minimum compatibility threshold', () => {
      const matches = findFamilyMatches(
        familyA,
        [familyB, familyC],
        true,
        80
      );
      expect(
        matches.every((m) => m.compatibilityScore >= 80)
      ).toBe(true);
    });

    it('should return matches sorted by compatibility score', () => {
      const matches = findFamilyMatches(familyA, [familyB, familyC, familyD]);
      if (matches.length > 1) {
        for (let i = 0; i < matches.length - 1; i++) {
          expect(matches[i].compatibilityScore).toBeGreaterThanOrEqual(
            matches[i + 1].compatibilityScore
          );
        }
      }
    });

    it('should populate reasons for match', () => {
      const matches = findFamilyMatches(familyA, [familyB]);
      if (matches.length > 0) {
        expect(matches[0].reasonsForMatch.length).toBeGreaterThan(0);
      }
    });

    it('should handle budget filter correctly', () => {
      const matchesWithBudget = findFamilyMatches(
        familyA,
        [familyB, familyC],
        true
      );
      const matchesWithoutBudget = findFamilyMatches(
        familyA,
        [familyB, familyC],
        false
      );
      expect(matchesWithBudget.length).toBeLessThanOrEqual(
        matchesWithoutBudget.length
      );
    });
  });

  describe('optimizeGroupForOuting', () => {
    it('should optimize a group for outing', () => {
      const result = optimizeGroupForOuting([familyA, familyB]);
      expect(result).toBeDefined();
      expect(result.optimalGroupSize).toBeGreaterThan(0);
      expect(result.estimatedGroupBudget).toBeGreaterThan(0);
    });

    it('should suggest reasonable group composition', () => {
      const result = optimizeGroupForOuting([familyA]);
      expect(result.suggestedGroupComposition).toContain('family');
    });

    it('should identify best outing types', () => {
      const result = optimizeGroupForOuting([familyA, familyB]);
      expect(Array.isArray(result.bestOutingTypes)).toBe(true);
    });

    it('should calculate estimated group budget', () => {
      const result = optimizeGroupForOuting([familyA, familyB]);
      expect(result.estimatedGroupBudget).toBeGreaterThan(0);
    });

    it('should respect max group size constraint', () => {
      const largeGroup = [familyA, familyB, familyC, familyD];
      const result = optimizeGroupForOuting(largeGroup, [], {
        maxGroupSize: 2,
      });
      expect(result.optimalGroupSize).toBeLessThanOrEqual(2);
    });
  });

  describe('generateGroupRecommendations', () => {
    it('should generate recommendations for a group', () => {
      const recommendations = generateGroupRecommendations([familyA, familyB]);
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should tailor recommendations for young children', () => {
      const youngFamily: FamilyProfile = {
        ...familyA,
        childrenAges: [2, 3],
      };
      const recommendations = generateGroupRecommendations([youngFamily]);
      expect(
        recommendations.some((r) =>
          r.toLowerCase().includes('playground') ||
          r.toLowerCase().includes('rest')
        )
      ).toBe(true);
    });

    it('should tailor recommendations for older children', () => {
      const olderFamily: FamilyProfile = {
        ...familyC,
        childrenAges: [12, 15],
      };
      const recommendations = generateGroupRecommendations([olderFamily]);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should include group-specific recommendations for large groups', () => {
      const largeGroup = [familyA, familyB, familyC, familyD];
      const recommendations = generateGroupRecommendations(largeGroup);
      expect(
        recommendations.some((r) =>
          r.toLowerCase().includes('group') ||
          r.toLowerCase().includes('reservation')
        )
      ).toBe(true);
    });

    it('should always include essential recommendations', () => {
      const recommendations = generateGroupRecommendations([familyA]);
      expect(recommendations.length).toBeGreaterThan(4);
    });
  });

  describe('integration scenarios', () => {
    it('should handle a complete matching and optimization workflow', () => {
      const allFamilies = [familyB, familyC, familyD];
      const matches = findFamilyMatches(familyA, allFamilies);

      expect(matches.length).toBeGreaterThan(0);

      const selectedFamilies = [
        familyA,
        ...matches.slice(0, 2).map((m) => {
          const found = allFamilies.find((f) => f.id === m.familyId);
          return found || { id: m.familyId, displayName: m.familyName };
        }),
      ];

      const optimization = optimizeGroupForOuting(
        selectedFamilies as FamilyProfile[]
      );
      expect(optimization.optimalGroupSize).toBeGreaterThan(0);

      const recommendations = generateGroupRecommendations(
        selectedFamilies as FamilyProfile[]
      );
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should consistently score same family pairs', () => {
      const score1 = calculateAgeGroupCompatibility(familyA, familyB);
      const score2 = calculateAgeGroupCompatibility(familyA, familyB);
      expect(score1).toBe(score2);
    });

    it('should handle edge case of single family group', () => {
      const result = optimizeGroupForOuting([familyA]);
      expect(result.optimalGroupSize).toBeGreaterThan(0);
      expect(result.suggestedGroupComposition).toContain('family');
    });
  });
});
