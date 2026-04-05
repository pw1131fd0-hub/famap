/**
 * Monthly Travel Planner
 * Generates comprehensive monthly family travel plans with:
 * - Weekly themed itineraries
 * - Budget tracking and savings opportunities
 * - Age-appropriate venue selection
 * - Visit sequence optimization
 * - Text export for sharing
 */

import type { Location } from '../types';

export interface FamilyTravelProfile {
  childrenAges: number[];
  interests: string[];
  maxBudget: number;
  preferredDays: string[]; // e.g., ['Sat', 'Sun']
  travelDistance: 'nearby' | 'moderate' | 'far';
  seasonPreference: string;
  activityPreference: 'indoor' | 'outdoor' | 'mixed';
}

export interface PlannedVisit {
  location: Location;
  date: Date;
  startTime: string;
  duration: number; // hours
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedCost: number;
}

export interface WeeklyPlan {
  week: number;
  startDate: Date;
  endDate: Date;
  theme: string;
  plannedVisits: PlannedVisit[];
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
  familyFriendlinessScore: number; // 0-100
  varietyScore: number; // 0-100
  valueForMoneyScore: number; // 0-100
}

export interface MonthlyTravelPlan {
  month: string;
  totalBudget: number;
  estimatedCost: number;
  weeklyPlans: WeeklyPlan[];
  savingsOpportunities: SavingsOpportunity[];
  summary: PlanSummary;
  recommendations: string[];
}

const WEEK_THEMES = [
  'Nature & Exploration',
  'Learning & Discovery',
  'Active Fun & Sports',
  'Arts & Culture',
  'Animal Adventures',
  'Water & Outdoor Play',
  'Science & Technology',
  'Community & Social',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_COST_ESTIMATE: Record<string, number> = {
  park: 10,
  attraction: 40,
  restaurant: 35,
  nursing_room: 0,
  medical: 0,
  other: 20,
};

const AGE_SUITABLE_CATEGORIES: Record<string, string[]> = {
  baby: ['park', 'restaurant', 'nursing_room'], // 0-2
  toddler: ['park', 'restaurant', 'nursing_room', 'attraction'], // 3-4
  child: ['park', 'restaurant', 'attraction', 'other'], // 5-12
  teen: ['park', 'restaurant', 'attraction', 'other'], // 13+
};

function getAgeGroup(age: number): string {
  if (age <= 2) return 'baby';
  if (age <= 4) return 'toddler';
  if (age <= 12) return 'child';
  return 'teen';
}

function getSuitableCategories(childrenAges: number[]): string[] {
  if (childrenAges.length === 0) return ['park', 'restaurant', 'attraction', 'other'];
  const youngest = Math.min(...childrenAges);
  const group = getAgeGroup(youngest);
  return AGE_SUITABLE_CATEGORIES[group] || ['park', 'restaurant', 'attraction'];
}

function filterLocationsByAge(locations: Location[], childrenAges: number[]): Location[] {
  const suitable = getSuitableCategories(childrenAges);
  const filtered = locations.filter((loc) => suitable.includes(loc.category));
  return filtered.length > 0 ? filtered : locations;
}

function getWeeksInMonth(year: number, month: number): { start: Date; end: Date }[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: { start: Date; end: Date }[] = [];

  const current = new Date(firstDay);
  while (current <= lastDay) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > lastDay) {
      weekEnd.setTime(lastDay.getTime());
    }
    weeks.push({ start: weekStart, end: weekEnd });
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

function getPreferredDatesInRange(
  start: Date,
  end: Date,
  preferredDays: string[]
): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    const dayName = DAY_NAMES[current.getDay()];
    if (preferredDays.length === 0 || preferredDays.includes(dayName)) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function estimateCost(location: Location): number {
  return CATEGORY_COST_ESTIMATE[location.category] || 20;
}

function selectTheme(weekIndex: number, _locations: Location[]): string {
  return WEEK_THEMES[weekIndex % WEEK_THEMES.length];
}

function scoreFamilyFriendliness(locations: Location[]): number {
  if (locations.length === 0) return 50;
  const facilityScore = locations.reduce((sum, loc) => {
    return sum + Math.min(loc.facilities.length * 15, 40);
  }, 0) / locations.length;
  const ratingScore = locations.reduce((sum, loc) => sum + (loc.averageRating / 5) * 60, 0) / locations.length;
  return Math.min(100, Math.round(facilityScore + ratingScore));
}

function scoreVariety(locations: Location[]): number {
  if (locations.length === 0) return 50;
  const categories = new Set(locations.map((l) => l.category));
  return Math.min(100, Math.round((categories.size / Math.max(locations.length, 1)) * 100));
}

function scoreValueForMoney(totalCost: number, budget: number, visitCount: number): number {
  if (budget <= 0 || visitCount === 0) return 50;
  const utilizationRatio = totalCost / budget;
  if (utilizationRatio <= 1) {
    return Math.min(100, Math.round(70 + (1 - utilizationRatio) * 30));
  }
  return Math.max(10, Math.round(70 - (utilizationRatio - 1) * 50));
}

function generateSavingsOpportunities(
  _locations: Location[],
  _totalCost: number
): SavingsOpportunity[] {
  return [
    {
      type: 'membership',
      description: 'Consider annual passes for frequently visited venues',
      potentialSavings: 50,
      implementation: 'Purchase annual membership after 3+ visits to the same venue',
    },
    {
      type: 'combo',
      description: 'Bundle nearby venue visits to save on transportation',
      potentialSavings: 20,
      implementation: 'Plan visits to nearby venues on the same day',
    },
    {
      type: 'seasonal',
      description: 'Take advantage of off-peak pricing and seasonal promotions',
      potentialSavings: 30,
      implementation: 'Visit during weekday mornings or off-season periods',
    },
    {
      type: 'bundle',
      description: 'Look for family bundle tickets and group discounts',
      potentialSavings: 25,
      implementation: 'Check venue websites for family package deals before visiting',
    },
  ];
}

function generateRecommendations(
  plan: { weeklyPlans: WeeklyPlan[]; estimatedCost: number; totalBudget: number },
  profile: FamilyTravelProfile
): string[] {
  const recs: string[] = [];

  if (plan.estimatedCost > plan.totalBudget) {
    recs.push('Consider reducing visit frequency or choosing free venues to stay within budget.');
  } else {
    recs.push('Your plan is within budget - great job planning!');
  }

  if (profile.childrenAges.some((a) => a <= 2)) {
    recs.push('Pack essentials: diapers, snacks, and a portable changing pad for young children.');
  }

  if (profile.activityPreference === 'outdoor' || profile.activityPreference === 'mixed') {
    recs.push('Check weather forecasts before outdoor visits and have indoor backup plans.');
  }

  recs.push('Book popular venues in advance to avoid disappointment on weekends.');

  return recs;
}

/**
 * Generate a comprehensive monthly travel plan for a family
 */
export function generateMonthlyTravelPlan(
  locations: Location[],
  profile: FamilyTravelProfile,
  year: number,
  month: number // 0-indexed (0=January, 11=December)
): MonthlyTravelPlan {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const suitableLocations = filterLocationsByAge(locations, profile.childrenAges);
  const weeks = getWeeksInMonth(year, month);

  let totalEstimatedCost = 0;
  const weeklyPlans: WeeklyPlan[] = weeks.map((week, index) => {
    const theme = selectTheme(index, suitableLocations);
    const preferredDates = getPreferredDatesInRange(week.start, week.end, profile.preferredDays);

    const plannedVisits: PlannedVisit[] = [];
    // Use preferred days; if none in range and preferredDays is specified, skip this week
    const datesToUse = preferredDates.length > 0
      ? preferredDates
      : (profile.preferredDays.length === 0 ? [week.start] : []);

    datesToUse.forEach((date, dateIndex) => {
      if (suitableLocations.length === 0) return;
      const locIndex = (index * 2 + dateIndex) % suitableLocations.length;
      const location = suitableLocations[locIndex];
      const cost = estimateCost(location);

      const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
      const priority = priorities[dateIndex % 3];

      const reasons = [
        `Great ${location.category} for family ${theme.toLowerCase()} day`,
        `Highly rated venue perfect for ages ${profile.childrenAges.join(' and ')}`,
        `Matches your interest in ${profile.interests[dateIndex % profile.interests.length] || 'family activities'}`,
      ];

      plannedVisits.push({
        location,
        date: new Date(date),
        startTime: dateIndex === 0 ? '10:00' : '14:00',
        duration: location.category === 'restaurant' ? 1.5 : 2.5,
        priority,
        reason: reasons[dateIndex % reasons.length],
        estimatedCost: cost,
      });
    });

    const weekCost = plannedVisits.reduce((sum, v) => sum + v.estimatedCost, 0);
    totalEstimatedCost += weekCost;

    return {
      week: index + 1,
      startDate: week.start,
      endDate: week.end,
      theme,
      plannedVisits,
      estimatedCost: weekCost,
    };
  }).filter((w) => w.plannedVisits.length > 0);

  // Renumber weeks after filtering
  weeklyPlans.forEach((w, i) => { w.week = i + 1; });

  const allVisits = weeklyPlans.flatMap((w) => w.plannedVisits);
  const allLocations = allVisits.map((v) => v.location);
  const uniqueLocationIds = new Set(allVisits.map((v) => v.location.id));

  const summary: PlanSummary = {
    totalVisits: allVisits.length,
    uniqueLocations: uniqueLocationIds.size,
    familyFriendlinessScore: scoreFamilyFriendliness(allLocations),
    varietyScore: scoreVariety(allLocations),
    valueForMoneyScore: scoreValueForMoney(totalEstimatedCost, profile.maxBudget, allVisits.length),
  };

  const plan: MonthlyTravelPlan = {
    month: `${monthNames[month]} ${year}`,
    totalBudget: profile.maxBudget,
    estimatedCost: totalEstimatedCost,
    weeklyPlans,
    savingsOpportunities: generateSavingsOpportunities(suitableLocations, totalEstimatedCost),
    summary,
    recommendations: [],
  };

  plan.recommendations = generateRecommendations(plan, profile);

  return plan;
}

/**
 * Optimize the sequence of planned visits by date and priority
 */
export function optimizeVisitSequence(visits: PlannedVisit[]): PlannedVisit[] {
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  return [...visits].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Export a monthly travel plan as formatted text
 */
export function exportMonthlyPlanAsText(plan: MonthlyTravelPlan): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('MONTHLY FAMILY TRAVEL PLAN');
  lines.push(plan.month);
  lines.push('='.repeat(60));
  lines.push('');

  // Budget summary
  lines.push('--- BUDGET SUMMARY ---');
  lines.push(`Total Budget: $${plan.totalBudget.toFixed(2)}`);
  lines.push(`Estimated Cost: $${plan.estimatedCost.toFixed(2)}`);
  const remaining = plan.totalBudget - plan.estimatedCost;
  lines.push(`Remaining: $${remaining.toFixed(2)}`);
  lines.push('');

  // Weekly breakdown
  lines.push('--- WEEKLY BREAKDOWN ---');
  plan.weeklyPlans.forEach((week) => {
    lines.push('');
    lines.push(`Week ${week.week}: ${week.theme}`);
    lines.push(`  Estimated Cost: $${week.estimatedCost.toFixed(2)}`);
    week.plannedVisits.forEach((visit) => {
      const dateStr = visit.date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const name =
        (visit.location as any).name_en ||
        (typeof visit.location.name === 'object' ? visit.location.name.en : visit.location.name) ||
        'Unknown';
      lines.push(`  - ${dateStr} at ${visit.startTime}: ${name} (${visit.duration}h, $${visit.estimatedCost.toFixed(2)}) [${visit.priority}]`);
      lines.push(`    Reason: ${visit.reason}`);
    });
  });
  lines.push('');

  // Savings opportunities
  if (plan.savingsOpportunities.length > 0) {
    lines.push('--- SAVINGS OPPORTUNITIES ---');
    plan.savingsOpportunities.forEach((opp) => {
      lines.push(`  [${opp.type}] ${opp.description} (Save up to $${opp.potentialSavings.toFixed(2)})`);
      lines.push(`    How: ${opp.implementation}`);
    });
    lines.push('');
  }

  // Summary
  lines.push('--- SUMMARY ---');
  lines.push(`Total Visits: ${plan.summary.totalVisits}`);
  lines.push(`Unique Locations: ${plan.summary.uniqueLocations}`);
  lines.push(`Family-Friendliness Score: ${plan.summary.familyFriendlinessScore}/100`);
  lines.push(`Variety Score: ${plan.summary.varietyScore}/100`);
  lines.push(`Value for Money Score: ${plan.summary.valueForMoneyScore}/100`);
  lines.push('');

  // Recommendations
  if (plan.recommendations.length > 0) {
    lines.push('--- RECOMMENDATIONS ---');
    plan.recommendations.forEach((rec, i) => {
      lines.push(`  ${i + 1}. ${rec}`);
    });
  }

  lines.push('');
  lines.push('='.repeat(60));

  return lines.join('\n');
}
