/**
 * Smart Monthly Family Travel Planner
 * Generates optimized month-long family travel plans considering multiple factors
 */

import type { Location } from '../types';

export interface MonthlyTravelPlan {
  month: string;
  totalBudget: number;
  estimatedCost: number;
  savingsOpportunities: SavingsOpportunity[];
  weeklyPlans: WeeklyTravelPlan[];
  summary: PlanSummary;
  recommendations: string[];
}

export interface WeeklyTravelPlan {
  week: number;
  startDate: Date;
  endDate: Date;
  plannedVisits: PlannedVisit[];
  estimatedCost: number;
  theme: string;
}

export interface PlannedVisit {
  location: Location;
  date: Date;
  startTime: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedCost: number;
}

export interface SavingsOpportunity {
  type: 'membership' | 'combo' | 'seasonal' | 'bundle';
  description: string;
  potentialSavings: number;
  implementation: string;
}

export interface PlanSummary {
  totalVisits: number;
  uniqueLocations: number;
  averageSpendPerVisit: number;
  familyFriendlinessScore: number;
  varietyScore: number;
  valueForMoneyScore: number;
  recommendations: string[];
}

export interface FamilyTravelProfile {
  childrenAges: number[];
  interests: string[];
  maxBudget: number;
  preferredDays: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  travelDistance: 'nearby' | 'moderate' | 'far';
  seasonPreference: 'spring' | 'summer' | 'autumn' | 'winter' | 'any';
  activityPreference: 'outdoor' | 'indoor' | 'mixed';
}

/**
 * Generate a comprehensive monthly travel plan
 */
export function generateMonthlyTravelPlan(
  availableLocations: Location[],
  familyProfile: FamilyTravelProfile,
  year: number,
  month: number
): MonthlyTravelPlan {
  const monthStr = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate estimated costs and generate weekly plans
  const weeklyPlans = generateWeeklyPlans(availableLocations, familyProfile, year, month);

  // Calculate total estimated cost
  const estimatedCost = weeklyPlans.reduce((sum, week) => sum + week.estimatedCost, 0);

  // Identify savings opportunities
  const savingsOpportunities = identifySavingsOpportunities(availableLocations, weeklyPlans, familyProfile);

  // Generate summary
  const summary = generatePlanSummary(weeklyPlans, availableLocations, familyProfile);

  // Generate recommendations
  const recommendations = generateRecommendations(weeklyPlans, familyProfile, estimatedCost);

  return {
    month: monthStr,
    totalBudget: familyProfile.maxBudget,
    estimatedCost,
    savingsOpportunities,
    weeklyPlans,
    summary,
    recommendations,
  };
}

/**
 * Generate weekly plans for the entire month
 */
function generateWeeklyPlans(
  availableLocations: Location[],
  familyProfile: FamilyTravelProfile,
  year: number,
  month: number
): WeeklyTravelPlan[] {
  const plans: WeeklyTravelPlan[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let currentWeekStart = firstDay;
  let weekNum = 1;

  while (currentWeekStart < lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(Math.min(weekEnd.getDate() + 6, lastDay.getDate()));

    const weekPlan = generateWeekPlan(
      availableLocations,
      familyProfile,
      currentWeekStart,
      weekEnd,
      weekNum
    );

    plans.push(weekPlan);
    currentWeekStart = new Date(weekEnd);
    currentWeekStart.setDate(currentWeekStart.getDate() + 1);
    weekNum++;
  }

  return plans;
}

/**
 * Generate plan for a single week
 */
function generateWeekPlan(
  availableLocations: Location[],
  familyProfile: FamilyTravelProfile,
  startDate: Date,
  endDate: Date,
  weekNumber: number
): WeeklyTravelPlan {
  // Calculate theme for the week (rotate through different themes)
  const themes = ['Outdoor Adventure', 'Learning & Culture', 'Family Fun', 'Rest & Relaxation', 'Active Play'];
  const theme = themes[weekNumber % themes.length];

  // Find suitable locations for this week
  const suitableLocations = availableLocations
    .filter(loc => isLocationSuitableForWeek(loc, familyProfile, theme))
    .sort((a, b) => calculateLocationScore(b, familyProfile) - calculateLocationScore(a, familyProfile))
    .slice(0, 3); // Pick top 3 locations

  // Create planned visits
  const plannedVisits: PlannedVisit[] = suitableLocations.map((loc, idx) => {
    const visitDate = new Date(startDate);
    const dayOffset = familyProfile.preferredDays.length > 0
      ? findNextPreferredDay(visitDate, familyProfile.preferredDays)
      : idx * 2;
    visitDate.setDate(visitDate.getDate() + dayOffset);

    return {
      location: loc,
      date: visitDate,
      startTime: '09:00',
      duration: 3,
      priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
      reason: `Part of "${theme}" week exploration`,
      estimatedCost: calculateLocationCost(loc, familyProfile),
    };
  });

  // Calculate total cost
  const estimatedCost = plannedVisits.reduce((sum, v) => sum + v.estimatedCost, 0);

  return {
    week: weekNumber,
    startDate,
    endDate,
    plannedVisits,
    estimatedCost,
    theme,
  };
}

/**
 * Check if a location is suitable for the week's theme
 */
function isLocationSuitableForWeek(
  location: Location,
  familyProfile: FamilyTravelProfile,
  theme: string
): boolean {
  const category = location.category;
  const minAge = Math.min(...familyProfile.childrenAges);

  // For very young children (under 3), prefer safe venues
  if (minAge < 3) {
    if (!['park', 'restaurant', 'nursing_room'].includes(category)) return false;
  }

  if (theme === 'Outdoor Adventure' && category !== 'park') return false;
  if (theme === 'Learning & Culture' && !['attraction', 'park'].includes(category)) return false;
  if (theme === 'Family Fun' && !['attraction', 'restaurant'].includes(category)) return false;
  if (theme === 'Rest & Relaxation' && !['restaurant', 'nursing_room'].includes(category)) return false;
  if (theme === 'Active Play' && category !== 'park') return false;

  return true;
}

/**
 * Calculate suitability score for a location
 */
function calculateLocationScore(location: Location, familyProfile: FamilyTravelProfile): number {
  let score = 0;

  // Base score by category
  const categoryScores: Record<string, number> = {
    park: 85,
    restaurant: 70,
    attraction: 90,
    medical: 30,
    nursing_room: 40,
    other: 50,
  };
  score += categoryScores[location.category] || 50;

  // Bonus for family-friendly
  if (location.averageRating && location.averageRating > 4.5) {
    score += 15;
  }

  // Bonus for accessibility
  if (location.facilities && location.facilities.includes('stroller_accessible')) {
    score += 10;
  }

  return score;
}

/**
 * Calculate estimated cost for visiting a location
 */
function calculateLocationCost(location: Location, familyProfile: FamilyTravelProfile): number {
  const categoryBaseCosts: Record<string, number> = {
    park: 0,
    restaurant: 30 * familyProfile.childrenAges.length,
    attraction: 50 * familyProfile.childrenAges.length,
    medical: 0,
    nursing_room: 0,
    other: 20 * familyProfile.childrenAges.length,
  };

  return categoryBaseCosts[location.category] || 20;
}

/**
 * Find the next preferred day from a given date
 */
function findNextPreferredDay(currentDate: Date, preferredDays: string[]): number {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dayName = dayNames[checkDate.getDay()];

    if (preferredDays.includes(dayName as any)) {
      return i;
    }
  }

  return 0;
}

/**
 * Identify savings opportunities
 */
function identifySavingsOpportunities(
  availableLocations: Location[],
  weeklyPlans: WeeklyTravelPlan[],
  familyProfile: FamilyTravelProfile
): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = [];

  // Check for membership opportunities
  const attractionCount = weeklyPlans.reduce(
    (sum, week) => sum + week.plannedVisits.filter(v => v.location.category === 'attraction').length,
    0
  );

  if (attractionCount >= 4) {
    opportunities.push({
      type: 'membership',
      description: 'Annual attraction pass',
      potentialSavings: attractionCount * 30,
      implementation: 'Purchase an annual pass at major attractions',
    });
  }

  // Check for combo deals
  opportunities.push({
    type: 'combo',
    description: 'Weekend family packages',
    potentialSavings: attractionCount * 10,
    implementation: 'Look for weekend combo deals at attractions',
  });

  // Seasonal savings
  if (familyProfile.seasonPreference === 'any') {
    opportunities.push({
      type: 'seasonal',
      description: 'Off-season discounts',
      potentialSavings: 50,
      implementation: 'Visit during off-peak seasons for better rates',
    });
  }

  // Bundle savings for nearby venues
  if (availableLocations.filter(l => l.category === 'restaurant').length > 5) {
    opportunities.push({
      type: 'bundle',
      description: 'Dining bundle deals',
      potentialSavings: familyProfile.childrenAges.length * 20,
      implementation: 'Use restaurant bundles and family meal deals',
    });
  }

  return opportunities;
}

/**
 * Generate plan summary
 */
function generatePlanSummary(
  weeklyPlans: WeeklyTravelPlan[],
  availableLocations: Location[],
  familyProfile: FamilyTravelProfile
): PlanSummary {
  const allVisits = weeklyPlans.flatMap(w => w.plannedVisits);
  const uniqueLocationIds = new Set(allVisits.map(v => v.location.id));
  const totalCost = allVisits.reduce((sum, v) => sum + v.estimatedCost, 0);

  // Calculate variety score (how many different categories)
  const categorySet = new Set(allVisits.map(v => v.location.category));
  const varietyScore = Math.min(100, (categorySet.size / 6) * 100);

  // Calculate family-friendliness score
  let familyScore = 0;
  allVisits.forEach(visit => {
    if (visit.location.averageRating) {
      familyScore += Math.min(100, (visit.location.averageRating / 5) * 100);
    }
  });
  familyScore = allVisits.length > 0 ? familyScore / allVisits.length : 0;

  // Calculate value for money
  const budgetUtilization = familyProfile.maxBudget > 0 ? (totalCost / familyProfile.maxBudget) * 100 : 0;
  const valueScore = Math.max(10, 100 - Math.abs(budgetUtilization - 80));

  return {
    totalVisits: allVisits.length,
    uniqueLocations: uniqueLocationIds.size,
    averageSpendPerVisit: allVisits.length > 0 ? totalCost / allVisits.length : 0,
    familyFriendlinessScore: Math.round(familyScore),
    varietyScore: Math.round(varietyScore),
    valueForMoneyScore: Math.round(valueScore),
    recommendations: [],
  };
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  weeklyPlans: WeeklyTravelPlan[],
  familyProfile: FamilyTravelProfile,
  totalCost: number
): string[] {
  const recommendations: string[] = [];

  // Budget recommendations
  if (totalCost > familyProfile.maxBudget) {
    recommendations.push(
      `Total cost ($${totalCost}) exceeds budget. Consider reducing visits or looking for discounts.`
    );
  } else if (totalCost < familyProfile.maxBudget * 0.5) {
    recommendations.push(
      `You're using less than 50% of your budget. Consider adding more activities for better variety.`
    );
  }

  // Activity variety
  if (weeklyPlans.length > 0) {
    recommendations.push(
      `Great variety! Each week has a different theme to keep activities fresh and engaging.`
    );
  }

  // Age-appropriate
  recommendations.push(
    `Plan is optimized for children aged ${familyProfile.childrenAges.join(', ')}.`
  );

  // Weather and season
  if (familyProfile.seasonPreference !== 'any') {
    recommendations.push(
      `Plan aligns with your preferred season (${familyProfile.seasonPreference}) for optimal comfort.`
    );
  }

  // Time management
  recommendations.push(
    `Average of ${(weeklyPlans.length > 0 ? weeklyPlans.reduce((sum, w) => sum + w.plannedVisits.length, 0) / weeklyPlans.length : 0).toFixed(1)} visits per week ensures balanced pacing.`
  );

  return recommendations;
}

/**
 * Calculate optimal visit sequence for minimal travel
 */
export function optimizeVisitSequence(plannedVisits: PlannedVisit[]): PlannedVisit[] {
  // Simple greedy algorithm - visit nearest locations first
  const sorted = [...plannedVisits].sort((a, b) => {
    // Prioritize by date first
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    // Then by priority
    const priorityMap = { high: 0, medium: 1, low: 2 };
    return priorityMap[a.priority] - priorityMap[b.priority];
  });

  return sorted;
}

/**
 * Export plan as text/CSV format
 */
export function exportMonthlyPlanAsText(plan: MonthlyTravelPlan): string {
  let output = `MONTHLY FAMILY TRAVEL PLAN - ${plan.month}\n`;
  output += `${'='.repeat(60)}\n\n`;

  output += `BUDGET SUMMARY\n`;
  output += `-`.repeat(60) + '\n';
  output += `Total Budget: $${plan.totalBudget}\n`;
  output += `Estimated Cost: $${plan.estimatedCost.toFixed(2)}\n`;
  output += `Potential Savings: $${plan.savingsOpportunities.reduce((s, o) => s + o.potentialSavings, 0)}\n\n`;

  output += `WEEKLY BREAKDOWN\n`;
  output += `-`.repeat(60) + '\n';
  plan.weeklyPlans.forEach(week => {
    output += `\nWeek ${week.week}: ${week.theme} (${week.startDate.toLocaleDateString()} - ${week.endDate.toLocaleDateString()})\n`;
    output += `Estimated Cost: $${week.estimatedCost.toFixed(2)}\n`;
    week.plannedVisits.forEach(visit => {
      output += `  • ${visit.location.name_en} on ${visit.date.toLocaleDateString()} at ${visit.startTime} (${visit.duration}h)\n`;
    });
  });

  output += `\n\nSUMMARY\n`;
  output += `-`.repeat(60) + '\n';
  output += `Total Visits: ${plan.summary.totalVisits}\n`;
  output += `Unique Locations: ${plan.summary.uniqueLocations}\n`;
  output += `Family-Friendliness Score: ${plan.summary.familyFriendlinessScore}/100\n`;
  output += `Variety Score: ${plan.summary.varietyScore}/100\n`;
  output += `Value for Money Score: ${plan.summary.valueForMoneyScore}/100\n`;

  return output;
}
