import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateMemberVenueScore,
  identifyConflicts,
  calculateConsensusLevel,
  scoreVenueForGroup,
  findConsensusVenues,
  findCompromiseVenues,
  getSummaryStats,
  type FamilyMember,
} from '../utils/familyVenueConsensus';
import type { Location } from '../types';

describe('familyVenueConsensus', () => {
  let parentMember: FamilyMember;
  let childMember: FamilyMember;
  let sampleVenue: Location;
  let venues: Location[];

  beforeEach(() => {
    parentMember = {
      id: 'parent1',
      name: 'Parent 1',
      preferences: {
        categories: ['restaurant', 'cafe'],
        maxDistance: 5,
        requiredFacilities: ['parking'],
        preferredFacilities: ['high_chair', 'wifi'],
        childAge: 25,
        budgetRange: { min: 200, max: 500 },
      },
    };

    childMember = {
      id: 'child1',
      name: 'Child 1',
      preferences: {
        categories: ['park', 'playground'],
        maxDistance: 2,
        requiredFacilities: ['playground_equipment'],
        preferredFacilities: ['shade', 'water_fountain'],
        childAge: 5,
        budgetRange: { min: 0, max: 100 },
      },
    };

    sampleVenue = {
      id: 'venue1',
      name: { en: 'Family Restaurant', zh: '家庭餐廳' },
      description: { en: 'A family-friendly restaurant', zh: '家庭友善餐廳' },
      category: 'restaurant',
      coordinates: { lat: 25.0, lng: 121.5 },
      address: { en: 'Downtown', zh: '市中心' },
      facilities: ['parking', 'high_chair', 'wifi', 'changing_table'],
      averageRating: 4.5,
    };

    venues = [
      sampleVenue,
      {
        id: 'venue2',
        name: { en: 'City Park', zh: '城市公園' },
        description: { en: 'A beautiful city park', zh: '美麗的城市公園' },
        category: 'park',
        coordinates: { lat: 25.05, lng: 121.55 },
        address: { en: 'North District', zh: '北區' },
        facilities: ['playground_equipment', 'shade', 'water_fountain', 'restrooms'],
        averageRating: 4.8,
        ageRange: { minAge: 2, maxAge: 12 },
      },
      {
        id: 'venue3',
        name: { en: 'Shopping Mall', zh: '購物中心' },
        description: { en: 'A large shopping mall', zh: '大型購物中心' },
        category: 'other',
        coordinates: { lat: 25.1, lng: 121.6 },
        address: { en: 'East Side', zh: '東側' },
        facilities: ['parking', 'restrooms', 'food_court', 'high_chair'],
        averageRating: 4.2,
      },
    ];
  });

  describe('calculateMemberVenueScore', () => {
    it('should calculate high score when venue matches all preferences', () => {
      const score = calculateMemberVenueScore(parentMember, sampleVenue);
      expect(score).toBeGreaterThan(70);
    });

    it('should calculate lower score when venue lacks required facilities', () => {
      const venueWithoutParking = { ...sampleVenue, facilities: ['high_chair', 'wifi'] };
      const score = calculateMemberVenueScore(parentMember, venueWithoutParking);
      expect(score).toBeLessThan(75);
    });

    it('should return score between 0 and 100', () => {
      const score = calculateMemberVenueScore(parentMember, sampleVenue);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should score park higher for child than restaurant', () => {
      const parkVenue = venues.find((v) => v.id === 'venue2')!;
      const restaurantScore = calculateMemberVenueScore(childMember, sampleVenue);
      const parkScore = calculateMemberVenueScore(childMember, parkVenue);
      expect(parkScore).toBeGreaterThan(restaurantScore);
    });

    it('should consider age appropriateness', () => {
      const toddler: FamilyMember = {
        id: 'toddler',
        name: 'Toddler',
        preferences: { childAge: 2 },
      };
      const parkVenue = venues.find((v) => v.id === 'venue2')!;
      const score = calculateMemberVenueScore(toddler, parkVenue);
      expect(score).toBeGreaterThan(40);
    });

    it('should penalize venues outside budget range', () => {
      const lowBudgetParent: FamilyMember = {
        id: 'budget',
        name: 'Budget Parent',
        preferences: { budgetRange: { min: 50, max: 100 } },
      };
      const score = calculateMemberVenueScore(lowBudgetParent, sampleVenue);
      expect(score).toBeLessThan(90);
    });

    it('should boost score for preferred facilities', () => {
      const venue1 = { ...sampleVenue, facilities: ['parking'] };
      const venue2 = { ...sampleVenue, facilities: ['parking', 'high_chair', 'wifi'] };
      const score1 = calculateMemberVenueScore(parentMember, venue1);
      const score2 = calculateMemberVenueScore(parentMember, venue2);
      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe('identifyConflicts', () => {
    it('should identify category conflicts', () => {
      const conflicts = identifyConflicts([parentMember, childMember]);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some((c) => c.includes('category'))).toBe(true);
    });

    it('should identify budget conflicts', () => {
      const parent: FamilyMember = {
        id: 'p1',
        name: 'Parent',
        preferences: { budgetRange: { min: 300, max: 600 } },
      };
      const conflicts = identifyConflicts([parent, childMember]);
      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('should identify age conflicts', () => {
      const teenager: FamilyMember = {
        id: 't1',
        name: 'Teenager',
        preferences: { childAge: 15 },
      };
      const conflicts = identifyConflicts([childMember, teenager]);
      expect(conflicts.some((c) => c.includes('age'))).toBe(true);
    });

    it('should return empty array when no conflicts exist', () => {
      const member1: FamilyMember = {
        id: 'm1',
        name: 'Member 1',
        preferences: { categories: ['park'], budgetRange: { min: 0, max: 100 } },
      };
      const member2: FamilyMember = {
        id: 'm2',
        name: 'Member 2',
        preferences: { categories: ['park'], budgetRange: { min: 0, max: 100 } },
      };
      const conflicts = identifyConflicts([member1, member2]);
      expect(conflicts.length).toBe(0);
    });
  });

  describe('calculateConsensusLevel', () => {
    it('should return strong consensus when all scores are high and similar', () => {
      const scores = new Map([
        ['m1', 85],
        ['m2', 82],
        ['m3', 88],
      ]);
      const level = calculateConsensusLevel(scores);
      expect(level).toBe('strong');
    });

    it('should return moderate consensus when scores are decent with variation', () => {
      const scores = new Map([
        ['m1', 75],
        ['m2', 65],
        ['m3', 70],
      ]);
      const level = calculateConsensusLevel(scores);
      expect(['moderate', 'weak']).toContain(level);
    });

    it('should return conflicted when scores vary greatly', () => {
      const scores = new Map([
        ['m1', 90],
        ['m2', 30],
        ['m3', 45],
      ]);
      const level = calculateConsensusLevel(scores);
      expect(['weak', 'conflicted']).toContain(level);
    });

    it('should return weak consensus for empty scores', () => {
      const scores = new Map<string, number>();
      const level = calculateConsensusLevel(scores);
      expect(level).toBe('weak');
    });
  });

  describe('scoreVenueForGroup', () => {
    it('should return valid VenueCompatibilityScore object', () => {
      const result = scoreVenueForGroup([parentMember, childMember], sampleVenue);
      expect(result.venueId).toBe(sampleVenue.id);
      expect(result.venueName).toBe(sampleVenue.name.en);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.consensusLevel).toMatch(/^(strong|moderate|weak|conflicted)$/);
    });

    it('should calculate memberScores for each family member', () => {
      const result = scoreVenueForGroup([parentMember, childMember], sampleVenue);
      expect(result.memberScores.size).toBe(2);
      expect(result.memberScores.has(parentMember.id)).toBe(true);
      expect(result.memberScores.has(childMember.id)).toBe(true);
    });

    it('should identify satisfied and dissatisfied members', () => {
      const result = scoreVenueForGroup([parentMember, childMember], sampleVenue);
      const satisfied = result.satisfiedMembers;
      const dissatisfied = result.dissatisfiedMembers;
      expect(satisfied.length + dissatisfied.length).toBeLessThanOrEqual(2);
    });

    it('should generate recommendation reason', () => {
      const result = scoreVenueForGroup([parentMember, childMember], sampleVenue);
      expect(result.recommendationReason).toBeTruthy();
      expect(result.recommendationReason.length).toBeGreaterThan(0);
    });

    it('should set compromise rating based on variance', () => {
      const result = scoreVenueForGroup([parentMember, childMember], sampleVenue);
      expect(result.compromiseRating).toBeGreaterThanOrEqual(0);
      expect(result.compromiseRating).toBeLessThanOrEqual(100);
    });
  });

  describe('findConsensusVenues', () => {
    it('should return ConsensusResult with topChoices', () => {
      const result = findConsensusVenues([parentMember, childMember], venues, 3);
      expect(result.topChoices).toBeDefined();
      expect(result.topChoices.length).toBeLessThanOrEqual(3);
    });

    it('should return venues sorted by consensus level and score', () => {
      const result = findConsensusVenues([parentMember, childMember], venues, 5);
      for (let i = 0; i < result.topChoices.length - 1; i++) {
        const current = result.topChoices[i];
        const next = result.topChoices[i + 1];
        const consensusOrder = { strong: 3, moderate: 2, weak: 1, conflicted: 0 };
        expect(consensusOrder[current.consensusLevel as keyof typeof consensusOrder])
          .toBeGreaterThanOrEqual(consensusOrder[next.consensusLevel as keyof typeof consensusOrder]);
      }
    });

    it('should identify conflicting preferences', () => {
      const result = findConsensusVenues([parentMember, childMember], venues, 3);
      expect(result.conflictingPreferences).toBeDefined();
      expect(Array.isArray(result.conflictingPreferences)).toBe(true);
    });

    it('should generate recommendations', () => {
      const result = findConsensusVenues([parentMember, childMember], venues, 3);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should return group satisfaction rate as percentage', () => {
      const result = findConsensusVenues([parentMember, childMember], venues, 3);
      expect(result.groupSatisfactionRate).toBeGreaterThanOrEqual(0);
      expect(result.groupSatisfactionRate).toBeLessThanOrEqual(100);
    });

    it('should return empty result for empty inputs', () => {
      const result = findConsensusVenues([], venues, 3);
      expect(result.topChoices.length).toBe(0);
    });

    it('should respect topN parameter', () => {
      const result1 = findConsensusVenues([parentMember, childMember], venues, 1);
      const result2 = findConsensusVenues([parentMember, childMember], venues, 5);
      expect(result1.topChoices.length).toBeLessThanOrEqual(1);
      expect(result2.topChoices.length).toBeLessThanOrEqual(5);
    });
  });

  describe('findCompromiseVenues', () => {
    it('should return array of compromise venues', () => {
      const result = findCompromiseVenues([parentMember, childMember], venues, 2);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should rank venues by compromise rating', () => {
      const result = findCompromiseVenues([parentMember, childMember], venues, 5);
      for (let i = 0; i < result.length - 1; i++) {
        const current = scoreVenueForGroup([parentMember, childMember], result[i]);
        const next = scoreVenueForGroup([parentMember, childMember], result[i + 1]);
        expect(current.compromiseRating).toBeGreaterThanOrEqual(next.compromiseRating);
      }
    });

    it('should respect topN parameter', () => {
      const result = findCompromiseVenues([parentMember, childMember], venues, 1);
      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should return actual Location objects', () => {
      const result = findCompromiseVenues([parentMember, childMember], venues, 3);
      result.forEach((venue) => {
        expect(venue.id).toBeDefined();
        expect(venue.name).toBeDefined();
      });
    });
  });

  describe('getSummaryStats', () => {
    it('should return summary statistics object', () => {
      const stats = getSummaryStats([parentMember, childMember], venues);
      expect(stats.averageGroupScore).toBeDefined();
      expect(stats.consensusPercentage).toBeDefined();
      expect(stats.mostRequestedCategory).toBeDefined();
      expect(stats.commonFacilities).toBeDefined();
    });

    it('should calculate average group score from all venues', () => {
      const stats = getSummaryStats([parentMember, childMember], venues);
      expect(stats.averageGroupScore).toBeGreaterThanOrEqual(0);
      expect(stats.averageGroupScore).toBeLessThanOrEqual(100);
    });

    it('should calculate consensus percentage', () => {
      const stats = getSummaryStats([parentMember, childMember], venues);
      expect(stats.consensusPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.consensusPercentage).toBeLessThanOrEqual(100);
    });

    it('should identify most requested category', () => {
      const stats = getSummaryStats([parentMember, childMember], venues);
      expect(['restaurant', 'park', null]).toContain(stats.mostRequestedCategory);
    });

    it('should identify common facilities', () => {
      const stats = getSummaryStats([parentMember, childMember], venues);
      expect(Array.isArray(stats.commonFacilities)).toBe(true);
    });

    it('should return zero values for empty inputs', () => {
      const stats = getSummaryStats([parentMember, childMember], []);
      expect(stats.averageGroupScore).toBe(0);
      expect(stats.consensusPercentage).toBe(0);
    });
  });

  describe('Multi-member family scenarios', () => {
    it('should handle 3+ family members', () => {
      const thirdMember: FamilyMember = {
        id: 'grandparent',
        name: 'Grandparent',
        preferences: {
          categories: ['restaurant', 'park'],
          requiredFacilities: ['seating', 'restrooms'],
          childAge: 65,
        },
      };
      const result = findConsensusVenues([parentMember, childMember, thirdMember], venues, 3);
      expect(result.topChoices.length).toBeGreaterThan(0);
    });

    it('should handle families with very diverse preferences', () => {
      const diverseFamily: FamilyMember[] = [
        {
          id: 'parent1',
          name: 'Parent 1',
          preferences: { categories: ['restaurant'], budgetRange: { min: 300, max: 600 } },
        },
        {
          id: 'parent2',
          name: 'Parent 2',
          preferences: { categories: ['park'], budgetRange: { min: 0, max: 200 } },
        },
        {
          id: 'child1',
          name: 'Child 1',
          preferences: { categories: ['playground'], childAge: 4 },
        },
        {
          id: 'child2',
          name: 'Child 2',
          preferences: { categories: ['playground'], childAge: 8 },
        },
      ];
      const result = findConsensusVenues(diverseFamily, venues, 3);
      expect(result.conflictingPreferences.length).toBeGreaterThan(0);
    });

    it('should handle families with aligned preferences', () => {
      const alignedFamily: FamilyMember[] = [
        {
          id: 'm1',
          name: 'Member 1',
          preferences: { categories: ['park'], requiredFacilities: ['playground_equipment'] },
        },
        {
          id: 'm2',
          name: 'Member 2',
          preferences: { categories: ['park'], requiredFacilities: ['playground_equipment'] },
        },
      ];
      const result = findConsensusVenues(alignedFamily, venues, 3);
      expect(result.consensusLevel).toBe('strong');
    });
  });

  describe('Edge cases', () => {
    it('should handle venues with missing optional fields', () => {
      const minimalVenue: Location = {
        id: 'minimal',
        name: { en: 'Minimal Venue', zh: '最小場地' },
        description: { en: 'Minimal venue', zh: '最小場地' },
        category: 'park',
        coordinates: { lat: 25, lng: 121.5 },
        address: { en: 'Somewhere', zh: '某地' },
        facilities: [],
        averageRating: 3.5,
      };
      const result = scoreVenueForGroup([parentMember], [minimalVenue]);
      expect(result.overallScore).toBeDefined();
    });

    it('should handle members with empty preferences', () => {
      const emptyPrefMember: FamilyMember = {
        id: 'empty',
        name: 'Empty',
        preferences: {},
      };
      const result = findConsensusVenues([emptyPrefMember], venues, 3);
      expect(result.topChoices.length).toBeGreaterThan(0);
    });

    it('should handle single family member', () => {
      const result = findConsensusVenues([parentMember], venues, 3);
      expect(result.consensusLevel).toBe('strong');
    });

    it('should handle venues with duplicate IDs (first wins)', () => {
      const dupVenues = [...venues, { ...sampleVenue, id: 'venue1' }];
      const result = findConsensusVenues([parentMember], dupVenues, 3);
      expect(result.topChoices.length).toBeGreaterThan(0);
    });
  });
});
