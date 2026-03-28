/**
 * Comprehensive tests for Family Milestone Planner utility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  analyzeMilestoneContext,
  calculateCelebrationScore,
  generateCelebrationTips,
  createBudgetBreakdown,
  generateCelebrationTimeline,
  calculateCelebrationSuccessScore,
  createCelebrationPlan,
  getStyleRecommendations,
  checkMilestoneUrgency,
  type FamilyMilestone,
  type CelebrationVenueSuggestion
} from '../utils/milestonePlanner';

describe('milestonePlanner utility', () => {
  let testMilestone: FamilyMilestone;
  let testVenue: CelebrationVenueSuggestion;

  beforeEach(() => {
    testMilestone = {
      type: 'birthday',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      title: "Sarah's 5th Birthday Party",
      description: 'Birthday celebration for Sarah',
      celebrant: {
        name: 'Sarah',
        age: 5
      },
      attendees: 12,
      budget: 3000,
      preferredStyle: ['outdoor', 'casual'],
      specialRequirements: []
    };

    testVenue = {
      venueId: 'venue-001',
      venueName: 'Happy Park',
      category: 'park',
      matchScore: 75,
      celebrationReason: 'Outdoor space perfect for birthday party',
      suggestedActivities: ['playground', 'picnic', 'games'],
      estimatedCost: {
        perPerson: 150,
        total: 1800,
        includesFood: true,
        includesEntertainment: true
      },
      capacity: {
        minGroup: 5,
        maxGroup: 30,
        eventSpaceAvailable: true
      },
      besttimes: {
        weekdays: ['morning', 'afternoon'],
        weekend: true,
        peakTimes: ['10am-12pm', '2pm-4pm']
      },
      advantages: ['Spacious outdoor area', 'Nearby parking', 'Picnic facilities'],
      considerations: ['Weather dependent', 'Need backup indoor space']
    };
  });

  describe('analyzeMilestoneContext', () => {
    it('should correctly determine celebration intensity for moderate group', () => {
      const result = analyzeMilestoneContext(testMilestone);
      expect(result.celebrationIntensity).toBe('moderate');
      expect(result.suggestedGroupSize).toEqual([12, 17]);
    });

    it('should classify intimate celebrations correctly', () => {
      const intimateMilestone = { ...testMilestone, attendees: 5 };
      const result = analyzeMilestoneContext(intimateMilestone);
      expect(result.celebrationIntensity).toBe('intimate');
    });

    it('should classify grand celebrations correctly', () => {
      const grandMilestone = { ...testMilestone, attendees: 30 };
      const result = analyzeMilestoneContext(grandMilestone);
      expect(result.celebrationIntensity).toBe('grand');
    });

    it('should suggest appropriate timeframe', () => {
      const result = analyzeMilestoneContext(testMilestone);
      expect(['immediate', 'short-notice', 'planned']).toContain(result.timeframe);
    });

    it('should categorize budget guidelines correctly', () => {
      const premiumMilestone = { ...testMilestone, budget: 6000 };
      const result = analyzeMilestoneContext(premiumMilestone);
      expect(result.budgetGuideline).toBe('premium');
    });

    it('should categorize budget as mid-range', () => {
      const midRangeMilestone = { ...testMilestone, budget: 3000 };
      const result = analyzeMilestoneContext(midRangeMilestone);
      expect(result.budgetGuideline).toBe('mid-range');
    });

    it('should categorize budget as budget-friendly', () => {
      const budgetMilestone = { ...testMilestone, budget: 1000 };
      const result = analyzeMilestoneContext(budgetMilestone);
      expect(result.budgetGuideline).toBe('budget-friendly');
    });
  });

  describe('calculateCelebrationScore', () => {
    it('should return a score between 0 and 100', () => {
      const score = calculateCelebrationScore(
        {
          category: 'park',
          capacity: 30,
          facilities: ['changing-table', 'restroom'],
          reviews: 4.8
        },
        testMilestone
      );
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher scores to category matches', () => {
      const matchingVenue = {
        category: 'park',
        capacity: 30,
        facilities: ['changing-table'],
        reviews: 4.5
      };
      const nonMatchingVenue = {
        category: 'medical',
        capacity: 30,
        facilities: [],
        reviews: 4.5
      };

      const matchingScore = calculateCelebrationScore(matchingVenue, testMilestone);
      const nonMatchingScore = calculateCelebrationScore(nonMatchingVenue, testMilestone);

      expect(matchingScore).toBeGreaterThan(nonMatchingScore);
    });

    it('should reward appropriate capacity', () => {
      const appropriateCapacity = {
        category: 'park',
        capacity: 15,
        facilities: [],
        reviews: 3
      };
      const inadequateCapacity = {
        category: 'park',
        capacity: 5,
        facilities: [],
        reviews: 3
      };

      const appropriateScore = calculateCelebrationScore(appropriateCapacity, testMilestone);
      const inadequateScore = calculateCelebrationScore(inadequateCapacity, testMilestone);

      expect(appropriateScore).toBeGreaterThan(inadequateScore);
    });

    it('should recognize facilities presence', () => {
      const withFacilities = {
        category: 'restaurant',
        facilities: ['high-chair', 'changing-table', 'restroom', 'parking'],
        capacity: 20,
        reviews: 4
      };
      const withoutFacilities = {
        category: 'restaurant',
        facilities: [],
        capacity: 20,
        reviews: 4
      };

      const withScore = calculateCelebrationScore(withFacilities, testMilestone);
      const withoutScore = calculateCelebrationScore(withoutFacilities, testMilestone);

      expect(withScore).toBeGreaterThan(withoutScore);
    });

    it('should consider venue ratings', () => {
      const highRatedVenue = {
        category: 'restaurant',
        capacity: 20,
        facilities: [],
        reviews: 4.8
      };
      const lowRatedVenue = {
        category: 'restaurant',
        capacity: 20,
        facilities: [],
        reviews: 2.5
      };

      const highScore = calculateCelebrationScore(highRatedVenue, testMilestone);
      const lowScore = calculateCelebrationScore(lowRatedVenue, testMilestone);

      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  describe('generateCelebrationTips', () => {
    it('should return array of celebration tips', () => {
      const tips = generateCelebrationTips(testMilestone, [testMilestone.celebrant.age]);
      expect(Array.isArray(tips)).toBe(true);
      expect(tips.length).toBeGreaterThan(0);
    });

    it('should include planning tips for birthdays', () => {
      const tips = generateCelebrationTips(testMilestone, [5]);
      const planningTips = tips.filter(t => t.category === 'Planning');
      expect(planningTips.length).toBeGreaterThan(0);
    });

    it('should include birthday-specific tips', () => {
      const tips = generateCelebrationTips(testMilestone, [5]);
      const activityTips = tips.filter(t => t.category === 'Activities');
      expect(activityTips.length).toBeGreaterThan(0);
    });

    it('should include infant-specific tips for young children', () => {
      const youngMilestone = { ...testMilestone, celebrant: { name: 'Baby', age: 1 } };
      const tips = generateCelebrationTips(youngMilestone, [1, 2, 3]);
      expect(tips.some(t => t.relevantAges && t.relevantAges[0] <= 3)).toBe(true);
    });

    it('should handle family reunion milestones differently', () => {
      const reunionMilestone = { ...testMilestone, type: 'family-reunion' };
      const tips = generateCelebrationTips(reunionMilestone, [5]);
      expect(tips.some(t => t.category === 'Space')).toBe(true);
    });

    it('should handle anniversary milestones with romance tips', () => {
      const anniversaryMilestone = { ...testMilestone, type: 'anniversary' };
      const tips = generateCelebrationTips(anniversaryMilestone, [40]);
      expect(tips.some(t => t.category === 'Ambiance')).toBe(true);
    });

    it('should address dietary restrictions when specified', () => {
      const dietaryMilestone = {
        ...testMilestone,
        specialRequirements: ['dietary-restrictions']
      };
      const tips = generateCelebrationTips(dietaryMilestone, [5]);
      expect(tips.some(t => t.category === 'Food')).toBe(true);
    });
  });

  describe('createBudgetBreakdown', () => {
    it('should return a complete budget breakdown', () => {
      const breakdown = createBudgetBreakdown(testMilestone, testVenue);
      expect(breakdown).toHaveProperty('venueRental');
      expect(breakdown).toHaveProperty('food');
      expect(breakdown).toHaveProperty('entertainment');
      expect(breakdown).toHaveProperty('decorations');
      expect(breakdown).toHaveProperty('gifts');
      expect(breakdown).toHaveProperty('transportation');
      expect(breakdown).toHaveProperty('contingency');
      expect(breakdown).toHaveProperty('total');
      expect(breakdown).toHaveProperty('savingsOpportunities');
    });

    it('should have non-negative line items', () => {
      const breakdown = createBudgetBreakdown(testMilestone, testVenue);
      expect(breakdown.venueRental).toBeGreaterThanOrEqual(0);
      expect(breakdown.food).toBeGreaterThanOrEqual(0);
      expect(breakdown.entertainment).toBeGreaterThanOrEqual(0);
      expect(breakdown.total).toEqual(testMilestone.budget);
    });

    it('should include savings opportunities for large groups', () => {
      const largeMilestone = { ...testMilestone, attendees: 20 };
      const breakdown = createBudgetBreakdown(largeMilestone, testVenue);
      expect(breakdown.savingsOpportunities.length).toBeGreaterThan(0);
    });

    it('should provide suggestions for young child celebrations', () => {
      const youngMilestone = { ...testMilestone, celebrant: { name: 'Baby', age: 2 } };
      const breakdown = createBudgetBreakdown(youngMilestone, testVenue);
      expect(breakdown.savingsOpportunities.some(s => s.includes('decoration'))).toBe(true);
    });
  });

  describe('generateCelebrationTimeline', () => {
    it('should generate timeline for future milestone', () => {
      const timeline = generateCelebrationTimeline(testMilestone);
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
    });

    it('should include critical tasks', () => {
      const timeline = generateCelebrationTimeline(testMilestone);
      const criticalTasks = timeline.filter(t => t.priority === 'critical');
      expect(criticalTasks.length).toBeGreaterThan(0);
    });

    it('should be in reverse chronological order', () => {
      const timeline = generateCelebrationTimeline(testMilestone);
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].daysBeforeEvent).toBeLessThanOrEqual(timeline[i - 1].daysBeforeEvent);
      }
    });

    it('should adapt timeline for soon-approaching milestones', () => {
      const urgentMilestone = {
        ...testMilestone,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days away
      };
      const timeline = generateCelebrationTimeline(urgentMilestone);
      const hasImmediateTasks = timeline.some(t => t.daysBeforeEvent <= 5);
      expect(hasImmediateTasks).toBe(true);
    });

    it('should include day-of preparations', () => {
      const timeline = generateCelebrationTimeline(testMilestone);
      expect(timeline.some(t => t.daysBeforeEvent === 0 || t.daysBeforeEvent === 1)).toBe(true);
    });
  });

  describe('calculateCelebrationSuccessScore', () => {
    it('should return score between 0 and 100', () => {
      const plan = {
        milestone: testMilestone,
        suggestedVenues: [testVenue],
        celebrationTips: generateCelebrationTips(testMilestone, [5]),
        budgetBreakdown: createBudgetBreakdown(testMilestone, testVenue),
        timelineRecommendation: generateCelebrationTimeline(testMilestone)
      };

      const score = calculateCelebrationSuccessScore(plan);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should reward good venue quality', () => {
      const goodVenue = { ...testVenue, matchScore: 95 };
      const plan = {
        milestone: testMilestone,
        suggestedVenues: [goodVenue],
        celebrationTips: generateCelebrationTips(testMilestone, [5]),
        budgetBreakdown: createBudgetBreakdown(testMilestone, goodVenue),
        timelineRecommendation: generateCelebrationTimeline(testMilestone)
      };

      const score = calculateCelebrationSuccessScore(plan);
      expect(score).toBeGreaterThan(60); // Base score
    });

    it('should consider budget alignment', () => {
      const wellFittedVenue = {
        ...testVenue,
        estimatedCost: {
          ...testVenue.estimatedCost,
          total: 2800 // ~93% of budget
        }
      };

      const plan = {
        milestone: testMilestone,
        suggestedVenues: [wellFittedVenue],
        celebrationTips: generateCelebrationTips(testMilestone, [5]),
        budgetBreakdown: createBudgetBreakdown(testMilestone, wellFittedVenue),
        timelineRecommendation: generateCelebrationTimeline(testMilestone)
      };

      const score = calculateCelebrationSuccessScore(plan);
      expect(score).toBeGreaterThan(75);
    });
  });

  describe('createCelebrationPlan', () => {
    it('should create a complete celebration plan', () => {
      const plan = createCelebrationPlan(testMilestone, [testVenue]);

      expect(plan).toHaveProperty('milestone');
      expect(plan).toHaveProperty('suggestedVenues');
      expect(plan).toHaveProperty('celebrationTips');
      expect(plan).toHaveProperty('budgetBreakdown');
      expect(plan).toHaveProperty('timelineRecommendation');
      expect(plan).toHaveProperty('successScore');
    });

    it('should include provided venues', () => {
      const plan = createCelebrationPlan(testMilestone, [testVenue]);
      expect(plan.suggestedVenues).toContain(testVenue);
    });

    it('should calculate success score', () => {
      const plan = createCelebrationPlan(testMilestone, [testVenue]);
      expect(plan.successScore).toBeGreaterThanOrEqual(0);
      expect(plan.successScore).toBeLessThanOrEqual(100);
    });

    it('should handle empty venue list gracefully', () => {
      const plan = createCelebrationPlan(testMilestone, []);
      expect(plan).toBeDefined();
      expect(plan.successScore).toBeDefined();
    });
  });

  describe('getStyleRecommendations', () => {
    it('should recommend outdoor style for young children', () => {
      const { recommendedStyle } = getStyleRecommendations(3, ['casual', 'outdoor']);
      expect(recommendedStyle).toBe('outdoor');
    });

    it('should recommend adventure style for school-age children', () => {
      const { recommendedStyle } = getStyleRecommendations(8, ['adventure', 'casual']);
      expect(recommendedStyle).toBe('adventure');
    });

    it('should recommend entertainment style for teens', () => {
      const { recommendedStyle } = getStyleRecommendations(14, ['entertainment', 'formal']);
      expect(recommendedStyle).toBe('entertainment');
    });

    it('should recommend dining for adults', () => {
      const { recommendedStyle } = getStyleRecommendations(40, ['dining', 'formal']);
      expect(recommendedStyle).toBe('dining');
    });

    it('should provide reasons for recommendations', () => {
      const { reasons } = getStyleRecommendations(5, ['outdoor']);
      expect(Array.isArray(reasons)).toBe(true);
      expect(reasons.length).toBeGreaterThan(0);
    });

    it('should mention preference alignment when applicable', () => {
      const { reasons } = getStyleRecommendations(5, ['outdoor']);
      expect(reasons.some(r => r.includes('stated preference'))).toBe(true);
    });
  });

  describe('checkMilestoneUrgency', () => {
    it('should identify urgent milestones', () => {
      const urgentMilestone = {
        ...testMilestone,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days away
      };
      const result = checkMilestoneUrgency(urgentMilestone);
      expect(result.isUrgent).toBe(true);
    });

    it('should provide appropriate action for urgent cases', () => {
      const urgentMilestone = {
        ...testMilestone,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days away
      };
      const result = checkMilestoneUrgency(urgentMilestone);
      expect(result.recommendedAction).toContain('immediately');
    });

    it('should calculate days remaining correctly', () => {
      const futureMilestone = {
        ...testMilestone,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // ~30 days
      };
      const result = checkMilestoneUrgency(futureMilestone);
      expect(result.daysRemaining).toBeGreaterThanOrEqual(29);
      expect(result.daysRemaining).toBeLessThanOrEqual(31);
    });

    it('should suggest search action for reasonable timeframe', () => {
      const reasonableMilestone = {
        ...testMilestone,
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days
      };
      const result = checkMilestoneUrgency(reasonableMilestone);
      expect(result.recommendedAction).toContain('search');
    });

    it('should note plenty of time for distant milestones', () => {
      const distantMilestone = {
        ...testMilestone,
        date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) // 120 days
      };
      const result = checkMilestoneUrgency(distantMilestone);
      expect(result.isUrgent).toBe(false);
      expect(result.recommendedAction).toContain('plenty of time');
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle very small budgets', () => {
      const tightBudgetMilestone = { ...testMilestone, budget: 500 };
      const context = analyzeMilestoneContext(tightBudgetMilestone);
      expect(context.budgetGuideline).toBe('budget-friendly');
    });

    it('should handle very large groups', () => {
      const largeGroupMilestone = { ...testMilestone, attendees: 100 };
      const context = analyzeMilestoneContext(largeGroupMilestone);
      expect(context.celebrationIntensity).toBe('grand');
    });

    it('should handle past milestones gracefully', () => {
      const pastMilestone = {
        ...testMilestone,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      };
      const urgency = checkMilestoneUrgency(pastMilestone);
      expect(urgency.daysRemaining).toBeLessThan(0);
    });

    it('should handle milestones with special requirements', () => {
      const specialMilestone = {
        ...testMilestone,
        specialRequirements: ['dietary-restrictions', 'wheelchair-accessible', 'sensory-friendly']
      };
      const tips = generateCelebrationTips(specialMilestone, [5]);
      const specialTips = tips.filter(t => t.category !== 'Planning');
      expect(specialTips.length).toBeGreaterThan(0);
    });

    it('should work with all milestone types', () => {
      const milestoneTypes = ['birthday', 'anniversary', 'graduation', 'achievement', 'holiday', 'school-milestone', 'family-reunion', 'new-baby'];

      for (const type of milestoneTypes) {
        const milestone = { ...testMilestone, type: type as any };
        const tips = generateCelebrationTips(milestone, [5]);
        expect(tips.length).toBeGreaterThan(0);
      }
    });
  });
});
