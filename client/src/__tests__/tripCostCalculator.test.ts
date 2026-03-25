/**
 * Trip Cost Calculator Tests
 * Tests for cost calculation, budget planning, and savings optimization
 */

import {
  calculateLocationCost,
  calculateParkingCost,
  calculateMealCost,
  calculateActivityCost,
  calculateTotalTripCost,
  calculateCostPerPerson,
  determineBudgetCategory,
  formatCurrency,
  getCostPercentages,
  isWithinBudget,
  generateSavingsTips,
  identifyPaymentOpportunities,
  generateBudgetReport,
  compareVenueCombinations,
  suggestBudgetAlternatives,
} from '../utils/tripCostCalculator';
import type { Location, CostBreakdown } from '../types';

// Mock location data
const mockLocation: Location = {
  id: '1',
  name: { zh: '大安森林公園', en: 'Daan Forest Park' },
  description: { zh: '台北市最大的都市公園', en: 'Taipei\'s largest urban park' },
  category: 'park',
  coordinates: { lat: 25.033, lng: 121.545 },
  address: { zh: '台北市大安區辛亥路四段1號', en: '1 Xinhai Road Section 4, Daan District' },
  averageRating: 4.5,
  totalReviews: 150,
  facilities: ['playground', 'restroom', 'picnic_area'],
  pricing: {
    isFree: true,
    priceRange: '0',
  },
  parking: {
    available: true,
    cost: '30-50',
    hasValidation: true,
  },
  nearby: {
    nearbyRestaurants: true,
    nearbyPublicTransit: 'MRT Da\'an Station 800m',
  },
  booking: {
    requiresPreBooking: false,
  },
  payment: {
    acceptsCash: true,
    acceptsLinePay: true,
  },
};

const mockLocation2: Location = {
  ...mockLocation,
  id: '2',
  name: { zh: '台北101', en: 'Taipei 101' },
  pricing: {
    isFree: false,
    priceRange: '200-300',
  },
};

describe('Trip Cost Calculator', () => {
  describe('calculateLocationCost', () => {
    it('should return 0 for free locations', () => {
      const cost = calculateLocationCost(mockLocation);
      expect(cost).toBe(0);
    });

    it('should calculate cost based on family size', () => {
      const cost = calculateLocationCost(mockLocation2, 4, 2);
      expect(cost).toBeGreaterThan(0);
    });

    it('should apply duration multipliers', () => {
      const shortCost = calculateLocationCost(mockLocation2, 2, 1, 'short');
      const longCost = calculateLocationCost(mockLocation2, 2, 1, 'long');
      expect(longCost).toBeGreaterThan(shortCost);
    });
  });

  describe('calculateParkingCost', () => {
    it('should return 0 without a car', () => {
      const cost = calculateParkingCost(mockLocation, 'moderate', false);
      expect(cost).toBe(0);
    });

    it('should return 0 if parking not available', () => {
      const noParkingLocation = { ...mockLocation, parking: { available: false } };
      const cost = calculateParkingCost(noParkingLocation, 'moderate', true);
      expect(cost).toBe(0);
    });

    it('should calculate parking cost with car', () => {
      const cost = calculateParkingCost(mockLocation, 'moderate', true);
      expect(cost).toBeGreaterThan(0);
    });

    it('should apply duration multipliers', () => {
      const shortCost = calculateParkingCost(mockLocation, 'short', true);
      const longCost = calculateParkingCost(mockLocation, 'long', true);
      expect(longCost).toBeGreaterThan(shortCost);
    });
  });

  describe('calculateMealCost', () => {
    it('should calculate meal cost for family', () => {
      const cost = calculateMealCost(mockLocation, 2, 2, true);
      expect(cost).toBeGreaterThan(0);
    });

    it('should consider children count', () => {
      const cost1 = calculateMealCost(mockLocation, 2, 1, true);
      const cost2 = calculateMealCost(mockLocation, 2, 2, true);
      expect(cost2).toBeGreaterThan(cost1);
    });

    it('should return 0 if no dining', () => {
      const noDiningLocation = { ...mockLocation, nearby: { nearbyRestaurants: false } };
      const cost = calculateMealCost(noDiningLocation, 2, 1, false);
      expect(cost).toBe(0);
    });
  });

  describe('calculateActivityCost', () => {
    it('should return 0 for no activities', () => {
      const cost = calculateActivityCost(mockLocation, [], 2);
      expect(cost).toBe(0);
    });

    it('should calculate cost for activities', () => {
      const cost = calculateActivityCost(mockLocation, ['workshop', 'class'], 2);
      expect(cost).toBeGreaterThan(0);
    });

    it('should multiply by children count', () => {
      const cost1 = calculateActivityCost(mockLocation, ['workshop'], 1);
      const cost2 = calculateActivityCost(mockLocation, ['workshop'], 2);
      expect(cost2).toBeGreaterThan(cost1);
    });
  });

  describe('calculateTotalTripCost', () => {
    it('should calculate total for single location', () => {
      const analysis = calculateTotalTripCost([mockLocation], 2, 2, 0, false);
      expect(analysis.breakdown.total).toBeGreaterThan(0);
      expect(analysis.breakdown.total).toBeLessThanOrEqual(5000);
    });

    it('should calculate total for multiple locations', () => {
      const analysis = calculateTotalTripCost([mockLocation, mockLocation2], 2, 2, 0);
      expect(analysis.breakdown.total).toBeGreaterThan(0);
    });

    it('should include all cost categories', () => {
      const analysis = calculateTotalTripCost([mockLocation, mockLocation2], 4, 2, 2, true);
      expect(analysis.breakdown.admission).toBeDefined();
      expect(analysis.breakdown.parking).toBeDefined();
      expect(analysis.breakdown.meals).toBeDefined();
      expect(analysis.breakdown.total).toBeGreaterThan(0);
    });

    it('should generate budget estimates', () => {
      const analysis = calculateTotalTripCost([mockLocation]);
      expect(analysis.budgetEstimates.lowBudget).toBeLessThan(analysis.budgetEstimates.moderateBudget);
      expect(analysis.budgetEstimates.moderateBudget).toBeLessThan(analysis.budgetEstimates.premiumBudget);
    });

    it('should provide savings tips', () => {
      const analysis = calculateTotalTripCost([mockLocation2], 4, 2, 2, true);
      expect(analysis.savingsTips.length).toBeGreaterThan(0);
      expect(Array.isArray(analysis.savingsTips)).toBe(true);
    });

    it('should identify payment opportunities', () => {
      const analysis = calculateTotalTripCost([mockLocation]);
      expect(analysis.paymentMethods.length).toBeGreaterThan(0);
    });
  });

  describe('calculateCostPerPerson', () => {
    it('should divide total by family size', () => {
      const analysis = calculateTotalTripCost([mockLocation2], 4, 2, 2);
      const perPerson = calculateCostPerPerson(analysis);
      expect(perPerson).toBe(Math.round(analysis.breakdown.total / 4));
    });

    it('should handle single person', () => {
      const analysis = calculateTotalTripCost([mockLocation2], 1, 1, 0);
      const perPerson = calculateCostPerPerson(analysis);
      expect(perPerson).toBe(analysis.breakdown.total);
    });
  });

  describe('determineBudgetCategory', () => {
    it('should categorize budget_friendly', () => {
      expect(determineBudgetCategory(300)).toBe('budget_friendly');
    });

    it('should categorize moderate', () => {
      expect(determineBudgetCategory(750)).toBe('moderate');
    });

    it('should categorize premium', () => {
      expect(determineBudgetCategory(1200)).toBe('premium');
    });

    it('should categorize luxury', () => {
      expect(determineBudgetCategory(2000)).toBe('luxury');
    });
  });

  describe('formatCurrency', () => {
    it('should format as TWD', () => {
      const formatted = formatCurrency(1000, 'NTD');
      expect(formatted).toContain('1');
      expect(formatted).toContain('000');
    });

    it('should format zero', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toBeDefined();
    });

    it('should format large numbers', () => {
      const formatted = formatCurrency(999999);
      expect(formatted).toBeDefined();
    });
  });

  describe('getCostPercentages', () => {
    it('should return percentages for all categories', () => {
      const breakdown: CostBreakdown = {
        admission: 500,
        parking: 100,
        meals: 300,
        rentals: 50,
        activities: 50,
        miscellaneous: 0,
        total: 1000,
      };

      const percentages = getCostPercentages(breakdown);
      expect(percentages.admission).toBe(50);
      expect(percentages.parking).toBe(10);
      expect(percentages.meals).toBe(30);
      expect(percentages.total).toBeUndefined(); // Only cost categories
    });

    it('should sum to approximately 100', () => {
      const breakdown: CostBreakdown = {
        admission: 400,
        parking: 200,
        meals: 300,
        rentals: 50,
        activities: 50,
        miscellaneous: 0,
        total: 1000,
      };

      const percentages = getCostPercentages(breakdown);
      const total = Object.values(percentages).reduce((a, b) => a + b, 0);
      expect(total).toBeLessThanOrEqual(101); // Allow 1% rounding error
    });
  });

  describe('isWithinBudget', () => {
    it('should return true if within budget', () => {
      const analysis = calculateTotalTripCost([mockLocation], 2, 2, 0, false);
      expect(isWithinBudget(analysis, 10000)).toBe(true);
    });

    it('should return false if over budget', () => {
      const analysis = calculateTotalTripCost([mockLocation, mockLocation2], 4, 2, 2, true);
      expect(isWithinBudget(analysis, 100)).toBe(false);
    });

    it('should return true at exact budget', () => {
      const analysis = calculateTotalTripCost([mockLocation], 2, 2, 0, false);
      expect(isWithinBudget(analysis, analysis.breakdown.total)).toBe(true);
    });
  });

  describe('generateSavingsTips', () => {
    it('should generate tips for high-cost trips', () => {
      const breakdown: CostBreakdown = {
        admission: 500,
        parking: 100,
        meals: 800,
        rentals: 0,
        activities: 0,
        miscellaneous: 0,
        total: 1400,
      };

      const tips = generateSavingsTips([mockLocation2], breakdown, true);
      expect(tips.length).toBeGreaterThan(0);
      expect(tips.some(t => t.toLowerCase().includes('snack'))).toBe(true);
    });

    it('should suggest parking alternatives', () => {
      const breakdown: CostBreakdown = {
        admission: 200,
        parking: 100,
        meals: 200,
        rentals: 0,
        activities: 0,
        miscellaneous: 0,
        total: 500,
      };

      const tips = generateSavingsTips([mockLocation], breakdown, false);
      expect(tips.some(t => t.toLowerCase().includes('transit'))).toBe(true);
    });
  });

  describe('identifyPaymentOpportunities', () => {
    it('should return payment methods', () => {
      const breakdown: CostBreakdown = {
        admission: 1000,
        parking: 0,
        meals: 0,
        rentals: 0,
        activities: 0,
        miscellaneous: 0,
        total: 1000,
      };

      const opportunities = identifyPaymentOpportunities([mockLocation], breakdown);
      expect(opportunities.length).toBeGreaterThan(0);
    });

    it('should calculate savings for each method', () => {
      const breakdown: CostBreakdown = {
        admission: 1000,
        parking: 0,
        meals: 0,
        rentals: 0,
        activities: 0,
        miscellaneous: 0,
        total: 1000,
      };

      const opportunities = identifyPaymentOpportunities([mockLocation], breakdown);
      opportunities.forEach(opp => {
        expect(opp.savings).toBeGreaterThan(0);
        expect(opp.discount).toBeGreaterThan(0);
      });
    });
  });

  describe('generateBudgetReport', () => {
    it('should generate markdown report', () => {
      const analysis = calculateTotalTripCost([mockLocation], 2, 2, 0);
      const report = generateBudgetReport(analysis);
      expect(report).toContain('預算報告');
      expect(report).toContain(formatCurrency(analysis.breakdown.total));
    });

    it('should include actual spending comparison', () => {
      const analysis = calculateTotalTripCost([mockLocation], 2, 2, 0);
      const report = generateBudgetReport(analysis, 600);
      expect(report).toContain('實際支出');
      expect(report).toContain('600');
    });

    it('should include savings tips', () => {
      const analysis = calculateTotalTripCost([mockLocation2], 2, 2, 0);
      const report = generateBudgetReport(analysis);
      expect(report).toContain('省錢建議');
    });
  });

  describe('compareVenueCombinations', () => {
    it('should compare multiple venue groups', () => {
      const groups = [[mockLocation], [mockLocation2], [mockLocation, mockLocation2]];
      const comparison = compareVenueCombinations(groups);
      expect(comparison.length).toBe(3);
      expect(comparison.every(c => c.analysis.breakdown.total)).toBe(true);
    });

    it('should rank by cost', () => {
      const groups = [[mockLocation], [mockLocation2]];
      const comparison = compareVenueCombinations(groups);
      const costs = comparison.map(c => c.analysis.breakdown.total);
      expect(costs[0]).toBeLessThanOrEqual(costs[1]);
    });
  });

  describe('suggestBudgetAlternatives', () => {
    it('should suggest when over budget', () => {
      const suggestions = suggestBudgetAlternatives(mockLocation2, 1000, 500);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('省下');
    });

    it('should indicate on-budget', () => {
      const suggestions = suggestBudgetAlternatives(mockLocation, 100, 500);
      expect(suggestions[0]).toContain('within your budget');
    });

    it('should suggest free alternatives', () => {
      const suggestions = suggestBudgetAlternatives(mockLocation2, 1000, 200);
      expect(suggestions.some(s => s.includes('免費'))).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty location array', () => {
      const analysis = calculateTotalTripCost([], 2, 2, 0);
      expect(analysis.breakdown.total).toBe(0);
    });

    it('should handle zero family size', () => {
      const cost = calculateLocationCost(mockLocation, 0, 0);
      expect(cost).toBe(0);
    });

    it('should handle missing pricing info', () => {
      const locationNoPricing = { ...mockLocation, pricing: undefined };
      const cost = calculateLocationCost(locationNoPricing);
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('should handle large family sizes', () => {
      const analysis = calculateTotalTripCost([mockLocation2], 20, 10, 10);
      expect(analysis.breakdown.total).toBeGreaterThan(0);
      expect(analysis.totalFamilyMembers).toBe(20);
    });
  });

  describe('Integration tests', () => {
    it('should calculate complete trip with all features', () => {
      const locations = [mockLocation, mockLocation2];
      const analysis = calculateTotalTripCost(locations, 4, 2, 2, true, true, ['workshop']);

      expect(analysis.breakdown.admission).toBeGreaterThan(0);
      expect(analysis.breakdown.meals).toBeGreaterThan(0);
      expect(analysis.breakdown.activities).toBeGreaterThan(0);
      expect(analysis.savingsTips.length).toBeGreaterThan(0);
      expect(analysis.paymentMethods.length).toBeGreaterThan(0);
      expect(analysis.recommendedBudget).toBeGreaterThan(0);
    });

    it('should provide comprehensive budget planning', () => {
      const locations = [mockLocation, mockLocation2];
      const analysis = calculateTotalTripCost(locations, 4, 2, 2);

      // User checks if within budget
      const isAffordable = isWithinBudget(analysis, 2000);
      expect(typeof isAffordable).toBe('boolean');

      // User checks cost per person
      const perPerson = calculateCostPerPerson(analysis);
      expect(perPerson).toBeGreaterThan(0);

      // User gets budget category
      const category = determineBudgetCategory(analysis.breakdown.total);
      expect(['budget_friendly', 'moderate', 'premium', 'luxury']).toContain(category);

      // User generates report
      const report = generateBudgetReport(analysis);
      expect(report.length).toBeGreaterThan(0);
    });
  });
});
