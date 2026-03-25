/**
 * Trip Cost Calculator & Budget Advisor
 * Provides comprehensive cost estimation and budgeting for family outings
 * Helps families understand total trip costs and optimize spending
 */

import type { Location } from '../types';

export interface CostBreakdown {
  admission: number;
  parking: number;
  meals: number;
  rentals: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface BudgetEstimate {
  lowBudget: number;      // 節省預算 - Basic trip
  moderateBudget: number; // 中等預算 - Comfortable trip
  premiumBudget: number;  // 豪華預算 - Premium experience
}

export interface TripCostAnalysis {
  breakdown: CostBreakdown;
  budgetEstimates: BudgetEstimate;
  totalFamilyMembers: number;
  recommendedBudget: number;
  savingsTips: string[];
  paymentMethods: PaymentOpportunity[];
  currencyCode: string;
}

export interface PaymentOpportunity {
  method: string;
  discount: number;
  savings: number;
  availability: string;
}

export interface TripBudgetPlan {
  id: string;
  name: string;
  date: string;
  locations: Location[];
  estimatedCost: TripCostAnalysis;
  actualCost?: CostBreakdown;
  status: 'planned' | 'completed' | 'overbudget';
}

/**
 * Calculate cost for a single location visit
 */
export function calculateLocationCost(
  location: Location,
  familySize: number = 2,
  duration: 'short' | 'moderate' | 'long' = 'moderate'
): number {
  let cost = 0;

  // Admission cost
  if (location.pricing && !location.pricing.isFree) {
    const baseAdmission = extractPriceFromRange(location.pricing.priceRange || '100-200');
    cost += baseAdmission * familySize;
  }

  // Duration-based additional costs
  const durationMultipliers = {
    short: 0.5,    // 1-2 hours
    moderate: 1.0, // 2-4 hours
    long: 1.5,     // 4+ hours
  };
  cost *= durationMultipliers[duration];

  return Math.round(cost);
}

/**
 * Calculate parking cost estimate
 */
export function calculateParkingCost(
  location: Location,
  duration: 'short' | 'moderate' | 'long' = 'moderate',
  hasCar: boolean = true
): number {
  if (!hasCar || !location.parking?.available) {
    return 0;
  }

  const parkingCost = extractPriceFromRange(location.parking.cost || '30-50');
  const hours = { short: 2, moderate: 3, long: 5 }[duration];

  return Math.round(parkingCost * (hours / 1)); // Simplified hourly calculation
}

/**
 * Calculate meal cost estimate
 */
export function calculateMealCost(
  location: Location,
  adults: number = 2,
  children: number = 1,
  hasOnSiteDining: boolean = true
): number {
  if (!hasOnSiteDining && !location.nearbyAmenities?.nearbyRestaurants) {
    return 0;
  }

  // Taiwan average meal costs (in NTD)
  const adultMealCost = 200;
  const childMealCost = 100;

  return adults * adultMealCost + children * childMealCost;
}

/**
 * Calculate activity/rental cost estimate
 */
export function calculateActivityCost(
  activities: string[] = [],
  children: number = 1
): number {
  if (activities.length === 0) {
    return 0;
  }

  // Sample activity costs (in NTD)
  const activityCosts: Record<string, number> = {
    'equipment_rental': 100,
    'bike_rental': 150,
    'scooter_rental': 100,
    'flotation_device': 50,
    'workshop': 300,
    'class': 250,
    'activity': 100,
  };

  return activities.reduce((total, activity) => {
    return total + (activityCosts[activity] || 0) * children;
  }, 0);
}

/**
 * Calculate total trip cost for multiple locations
 */
export function calculateTotalTripCost(
  locations: Location[],
  familySize: number = 2,
  adults: number = 2,
  children: number = 1,
  hasCar: boolean = true,
  hasOnSiteDining: boolean = true,
  activities: string[] = []
): TripCostAnalysis {
  const breakdown: CostBreakdown = {
    admission: 0,
    parking: 0,
    meals: 0,
    rentals: 0,
    activities: 0,
    miscellaneous: 0,
    total: 0,
  };

  // Calculate costs for each location
  locations.forEach((location) => {
    breakdown.admission += calculateLocationCost(location, familySize);
    breakdown.parking += calculateParkingCost(location, 'moderate', hasCar);
    breakdown.meals += calculateMealCost(location, adults, children, hasOnSiteDining);
  });

  breakdown.activities = calculateActivityCost(activities, children);

  // Miscellaneous costs (transportation, tips, etc.)
  breakdown.miscellaneous = Math.round(breakdown.admission * 0.1); // 10% buffer

  breakdown.total =
    breakdown.admission +
    breakdown.parking +
    breakdown.meals +
    breakdown.activities +
    breakdown.miscellaneous;

  // Budget estimates
  const budgetEstimates: BudgetEstimate = {
    lowBudget: Math.round(breakdown.total * 0.7),
    moderateBudget: Math.round(breakdown.total * 1.0),
    premiumBudget: Math.round(breakdown.total * 1.4),
  };

  // Generate savings tips
  const savingsTips = generateSavingsTips(locations, breakdown, hasOnSiteDining);

  // Payment opportunities
  const paymentMethods = identifyPaymentOpportunities(locations, breakdown);

  return {
    breakdown,
    budgetEstimates,
    totalFamilyMembers: familySize,
    recommendedBudget: budgetEstimates.moderateBudget,
    savingsTips,
    paymentMethods,
    currencyCode: 'NTD',
  };
}

/**
 * Generate actionable savings tips
 */
export function generateSavingsTips(
  locations: Location[],
  breakdown: CostBreakdown,
  hasOnSiteDining: boolean
): string[] {
  const tips: string[] = [];

  // Meal savings
  if (hasOnSiteDining && breakdown.meals > 500) {
    tips.push('💡 Bring your own snacks to reduce meal costs by 30-50%');
  }

  // Parking savings
  if (breakdown.parking > 0) {
    tips.push('💡 Use public transit (MRT/bus) to save on parking costs (saves ~100 NTD)');
  }

  // Bundle discounts
  const hasGroupDiscount = locations.some(loc => loc.booking?.groupDiscountAvailable);
  if (hasGroupDiscount) {
    tips.push('💡 Ask about family/group discounts - could save 10-20% on admission');
  }

  // Activity savings
  if (breakdown.activities > 0) {
    tips.push('💡 Check for weekday specials and student discounts on activities');
  }

  // Duration optimization
  if (breakdown.meals > 1000) {
    tips.push('💡 Visit during off-peak hours (weekday mornings) for potential discounts');
  }

  // Payment method optimization
  tips.push('💡 Use LINE Pay or mobile payment for loyalty rewards (1-5% cashback)');

  // Free activities
  if (locations.some(loc => loc.pricing?.isFree)) {
    tips.push('✨ Include free or low-cost attractions to balance your budget');
  }

  return tips;
}

/**
 * Identify payment method opportunities
 */
export function identifyPaymentOpportunities(
  locations: Location[],
  breakdown: CostBreakdown
): PaymentOpportunity[] {
  const opportunities: PaymentOpportunity[] = [];

  // LINE Pay rewards
  if (locations.some(loc => loc.payment?.acceptsLinePay)) {
    opportunities.push({
      method: 'LINE Pay',
      discount: 3,
      savings: Math.round(breakdown.total * 0.03),
      availability: '📱 Most Taiwan venues (3% cashback)',
    });
  }

  // Credit card points
  opportunities.push({
    method: 'Credit Card Points',
    discount: 2,
    savings: Math.round(breakdown.total * 0.02),
    availability: '💳 Most major credit cards (2-5% rewards)',
  });

  // Membership discounts
  opportunities.push({
    method: 'Membership/Annual Pass',
    discount: 15,
    savings: Math.round(breakdown.total * 0.15),
    availability: '🎫 Check venue membership programs',
  });

  // Online booking discounts
  if (locations.some(loc => loc.booking?.offersOnlineBooking)) {
    opportunities.push({
      method: 'Online Booking',
      discount: 5,
      savings: Math.round(breakdown.total * 0.05),
      availability: '🌐 Book in advance for discounts',
    });
  }

  return opportunities;
}

/**
 * Extract numerical value from price range string
 */
function extractPriceFromRange(priceRange: string): number {
  const match = priceRange.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 100;
}

/**
 * Compare costs across different venue combinations
 */
export function compareVenueCombinations(
  venueGroups: Location[][],
  familySize: number = 2,
  adults: number = 2,
  children: number = 1
): Array<{ venues: Location[]; analysis: TripCostAnalysis }> {
  return venueGroups.map(venues => ({
    venues,
    analysis: calculateTotalTripCost(venues, familySize, adults, children),
  }));
}

/**
 * Calculate cost per person
 */
export function calculateCostPerPerson(
  analysis: TripCostAnalysis
): number {
  return Math.round(analysis.breakdown.total / analysis.totalFamilyMembers);
}

/**
 * Determine budget category based on costs
 */
export function determineBudgetCategory(
  totalCost: number
): 'budget_friendly' | 'moderate' | 'premium' | 'luxury' {
  if (totalCost < 500) return 'budget_friendly';
  if (totalCost < 1000) return 'moderate';
  if (totalCost < 1500) return 'premium';
  return 'luxury';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'NTD'): string {
  const formatter = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: currency === 'NTD' ? 'TWD' : currency,
    minimumFractionDigits: 0,
  });
  return formatter.format(amount);
}

/**
 * Calculate cost breakdown percentage
 */
export function getCostPercentages(breakdown: CostBreakdown): Record<string, number> {
  const total = breakdown.total;
  return {
    admission: Math.round((breakdown.admission / total) * 100),
    parking: Math.round((breakdown.parking / total) * 100),
    meals: Math.round((breakdown.meals / total) * 100),
    rentals: Math.round((breakdown.rentals / total) * 100),
    activities: Math.round((breakdown.activities / total) * 100),
    miscellaneous: Math.round((breakdown.miscellaneous / total) * 100),
  };
}

/**
 * Check if trip is within budget
 */
export function isWithinBudget(
  analysis: TripCostAnalysis,
  budget: number
): boolean {
  return analysis.breakdown.total <= budget;
}

/**
 * Suggest budget-friendly alternatives
 */
export function suggestBudgetAlternatives(
  location: Location,
  currentCost: number,
  targetBudget: number
): string[] {
  const suggestions: string[] = [];
  const savings = currentCost - targetBudget;

  if (savings <= 0) {
    return ['✅ This trip is already within your budget!'];
  }

  suggestions.push(`需要省下約 ${formatCurrency(savings)} 來符合預算`);

  if (location.pricing && !location.pricing.isFree) {
    suggestions.push('🎟️ 尋找免費或低價景點作為替代');
  }

  suggestions.push('🚌 改用大眾交通取代開車停車');
  suggestions.push('🍱 帶便當而不在現場用餐');
  suggestions.push('⏰ 選擇平日訪問以享受更低折扣');
  suggestions.push('👥 查詢家庭/團體優惠方案');

  return suggestions;
}

/**
 * Generate trip budget report
 */
export function generateBudgetReport(
  analysis: TripCostAnalysis,
  actualSpent?: number
): string {
  let report = `## 預算報告\n\n`;
  report += `### 預計成本\n`;
  report += `- **總額**: ${formatCurrency(analysis.breakdown.total)}\n`;
  report += `- **人均**: ${formatCurrency(calculateCostPerPerson(analysis))}\n`;
  report += `- **分類**: ${determineBudgetCategory(analysis.breakdown.total)}\n\n`;

  report += `### 成本明細\n`;
  report += `- 門票: ${formatCurrency(analysis.breakdown.admission)}\n`;
  if (analysis.breakdown.parking > 0) {
    report += `- 停車: ${formatCurrency(analysis.breakdown.parking)}\n`;
  }
  if (analysis.breakdown.meals > 0) {
    report += `- 餐飲: ${formatCurrency(analysis.breakdown.meals)}\n`;
  }
  if (analysis.breakdown.activities > 0) {
    report += `- 活動: ${formatCurrency(analysis.breakdown.activities)}\n`;
  }
  if (analysis.breakdown.miscellaneous > 0) {
    report += `- 雜支: ${formatCurrency(analysis.breakdown.miscellaneous)}\n`;
  }

  if (actualSpent) {
    const difference = actualSpent - analysis.breakdown.total;
    report += `\n### 實際支出\n`;
    report += `- **實花**: ${formatCurrency(actualSpent)}\n`;
    report += `- **差異**: ${difference > 0 ? '+' : ''}${formatCurrency(difference)}\n`;
  }

  report += `\n### 省錢建議\n`;
  analysis.savingsTips.forEach(tip => {
    report += `- ${tip}\n`;
  });

  return report;
}
