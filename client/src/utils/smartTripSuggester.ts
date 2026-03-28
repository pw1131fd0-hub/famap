/**
 * Smart Trip Suggester - Proactive Trip Recommendation System
 * Analyzes family patterns and generates intelligent trip suggestions
 * without requiring user search or input
 *
 * Features:
 * - Pattern-based recommendations from visit history
 * - Multi-day trip planning
 * - Weather-aware suggestions
 * - Budget optimization
 * - Family preference matching
 * - Novelty scoring (avoid repetition)
 */

import type { Location, FamilyProfile, ActivityHistoryEntry } from '../types';

export interface TripSuggestion {
  tripId: string;
  title: string; // e.g., "Weekend Family Adventure"
  venues: Location[];
  startDate: Date;
  endDate: Date;
  duration: number; // days
  estimatedBudget: number;
  confidenceScore: number; // 0-100
  reasons: string[];
  expectedSatisfaction: number; // 0-100
  weatherOutlook: string;
  crowdPrediction: 'light' | 'moderate' | 'heavy';
  bestTimeToVisit: string; // e.g., "Saturday morning"
  packingTips: string[];
  estimatedTravelTime: number; // total minutes
}

export interface SmartSuggestionContext {
  familyProfile: FamilyProfile;
  recentHistory: ActivityHistoryEntry[];
  currentWeather: any;
  upcomingEvents: any[];
  budget: number;
  preferredDuration: number; // days
}

export interface VenueScore {
  venue: Location;
  score: number;
  reasons: {
    visitFrequency: number;
    categoryMatch: number;
    weatherSuitability: number;
    crowdAvoidance: number;
    budgetAlignment: number;
    noveltyBoost: number;
    timeAlignment: number;
  };
}

/**
 * Generate smart trip suggestions based on family patterns
 */
export function generateSmartTripSuggestions(
  context: SmartSuggestionContext,
  availableVenues: Location[],
  count: number = 3
): TripSuggestion[] {
  const suggestions: TripSuggestion[] = [];

  // Analyze family's visiting patterns
  const venueScores = scoreVenuesForSuggestion(
    availableVenues,
    context.recentHistory,
    context.familyProfile,
    context.currentWeather,
    context.budget
  );

  // Generate multi-day trip combinations
  const topVenues = venueScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  for (let i = 0; i < count; i++) {
    const suggestedTrip = createTripFromVenues(
      topVenues.slice(i, i + 3),
      context,
      i
    );
    suggestions.push(suggestedTrip);
  }

  return suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Score venues based on family patterns and current conditions
 */
export function scoreVenuesForSuggestion(
  venues: Location[],
  recentHistory: ActivityHistoryEntry[],
  familyProfile: FamilyProfile,
  currentWeather: any,
  budget: number
): VenueScore[] {
  return venues.map(venue => {
    const scores = {
      visitFrequency: calculateVisitFrequency(venue, recentHistory),
      categoryMatch: calculateCategoryMatch(venue, familyProfile),
      weatherSuitability: calculateWeatherSuitability(venue, currentWeather),
      crowdAvoidance: calculateCrowdAvoidance(venue, recentHistory),
      budgetAlignment: calculateBudgetAlignment(venue, budget),
      noveltyBoost: calculateNoveltyBoost(venue, recentHistory),
      timeAlignment: calculateTimeAlignment(venue, familyProfile),
    };

    const score =
      scores.visitFrequency * 0.15 +
      scores.categoryMatch * 0.2 +
      scores.weatherSuitability * 0.2 +
      scores.crowdAvoidance * 0.15 +
      scores.budgetAlignment * 0.15 +
      scores.noveltyBoost * 0.1 +
      scores.timeAlignment * 0.05;

    return { venue, score, reasons: scores };
  });
}

/**
 * Calculate how frequently family visits this venue
 */
function calculateVisitFrequency(
  venue: Location,
  recentHistory: ActivityHistoryEntry[]
): number {
  const venueVisits = recentHistory.filter(h => h.locationId === venue.id).length;
  const totalVisits = recentHistory.length;

  if (totalVisits === 0) return 0.5; // neutral score

  const frequency = venueVisits / totalVisits;

  // Family likes this venue, but give novelty bonus if not visited recently
  const lastVisit = recentHistory
    .filter(h => h.locationId === venue.id)
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0];

  const daysSinceLastVisit = lastVisit
    ? (Date.now() - new Date(lastVisit.visitDate).getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  // If visited more than 2 weeks ago, boost score; if within 1 week, reduce it
  const noveltyMultiplier =
    daysSinceLastVisit > 14 ? 1.2 : daysSinceLastVisit < 7 ? 0.6 : 1.0;

  return Math.min(1, frequency * noveltyMultiplier);
}

/**
 * Check if venue category matches family preferences
 */
function calculateCategoryMatch(venue: Location, familyProfile: FamilyProfile): number {
  if (!familyProfile.interests || familyProfile.interests.length === 0) return 0.5;

  const isPreferred = familyProfile.interests.includes(
    venue.category as string
  );
  return isPreferred ? 0.95 : 0.3;
}

/**
 * Score venue based on current weather conditions
 */
function calculateWeatherSuitability(venue: Location, currentWeather: any): number {
  if (!currentWeather) return 0.7;

  // Outdoor venues need good weather
  const isOutdoor = (venue.category as string)?.includes('park') || (venue.category as string)?.includes('outdoor');
  const isBadWeather = currentWeather.condition === 'rainy' || currentWeather.condition === 'snow';

  if (isOutdoor && isBadWeather) return 0.2;
  if (!isOutdoor && isBadWeather) return 0.95; // indoor venue in bad weather = good

  return 0.8;
}

/**
 * Avoid venues that are typically crowded at current time
 */
function calculateCrowdAvoidance(
  venue: Location,
  recentHistory: ActivityHistoryEntry[]
): number {
  const venueVisits = recentHistory.filter(h => h.locationId === venue.id);
  if (venueVisits.length === 0) return 0.7; // default

  // Check if visits tend to be during high-crowd times
  const morningVisits = venueVisits.filter(v => {
    const hour = new Date(v.visitDate).getHours();
    return hour >= 6 && hour < 12;
  }).length;

  const ratio = morningVisits / venueVisits.length;
  // Family prefers morning visits (less crowded) - reward this
  return Math.min(1, ratio + 0.3);
}

/**
 * Check if venue cost aligns with budget
 */
function calculateBudgetAlignment(venue: Location, budget: number): number {
  // Estimate venue cost (simple heuristic)
  const estimatedCost = (venue as any).averageSpending || 100;

  if (estimatedCost > budget) return 0.3;
  if (estimatedCost < budget * 0.5) return 0.9; // good value
  return 0.8;
}

/**
 * Boost score for venues not visited recently to add variety
 */
function calculateNoveltyBoost(
  venue: Location,
  recentHistory: ActivityHistoryEntry[]
): number {
  const recentVisits = recentHistory.filter(h => {
    const visitDate = new Date(h.visitDate);
    const daysSince = (Date.now() - visitDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 30;
  });

  const hasRecentVisit = recentVisits.some(h => h.locationId === venue.id);
  return hasRecentVisit ? 0.4 : 0.95; // Strongly prefer novel venues
}

/**
 * Align suggestions with family's typical outing times
 */
function calculateTimeAlignment(
  venue: Location,
  familyProfile: FamilyProfile
): number {
  // Prefer venues open at times family typically visits
  const preferredTimes = (familyProfile.preferences as any)?.preferredVisitTimes || [
    'morning',
    'afternoon',
  ];

  const venueTiming = (venue as any)?.operatingHours;
  if (!venueTiming) return 0.7;

  return preferredTimes.some((t: string) => venueTiming[t]?.open) ? 0.9 : 0.5;
}

/**
 * Create a trip suggestion from selected venues
 */
function createTripFromVenues(
  venueScores: VenueScore[],
  context: SmartSuggestionContext,
  suggestionIndex: number
): TripSuggestion {
  const venues = venueScores.map(v => v.venue);

  if (venues.length === 0) {
    return createDefaultSuggestion(suggestionIndex);
  }

  const startDate = getNextAvailableDate(context.familyProfile);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (context.preferredDuration || 1));

  const totalBudget = venues.reduce((sum, v) => sum + ((v as any).averageSpending || 0), 0);
  const avgConfidence =
    venueScores.reduce((sum, v) => sum + v.score, 0) / Math.max(1, venueScores.length);

  const reasons = generateSuggestionReasons(
    venues,
    context.familyProfile,
    venueScores
  );

  return {
    tripId: `trip_${Date.now()}_${suggestionIndex}`,
    title: generateTripTitle(venues, suggestionIndex),
    venues,
    startDate,
    endDate,
    duration: context.preferredDuration || 1,
    estimatedBudget: totalBudget,
    confidenceScore: Math.round(avgConfidence * 100),
    reasons,
    expectedSatisfaction: Math.round(avgConfidence * 95),
    weatherOutlook: getWeatherOutlook(context.currentWeather),
    crowdPrediction: getPredictedCrowd(venues),
    bestTimeToVisit: 'Saturday morning',
    packingTips: generatePackingTips(venues, context.currentWeather),
    estimatedTravelTime: calculateTravelTime(venues),
  };
}

/**
 * Generate a natural language trip title
 */
function generateTripTitle(venues: Location[], index: number): string {
  const titles = [
    `${venues[0]?.name?.en || 'Adventure'} Family Fun Day`,
    `Explore ${venues[0]?.name?.en || 'somewhere new'} with the Family`,
    `Perfect Weekend at ${venues[0]?.name?.en || 'local spots'}`,
    `Family Adventure: ${venues.length}-Venue Tour`,
    `Discover ${venues[0]?.name?.en || 'amazing places'} Together`,
  ];

  return titles[index % titles.length];
}

/**
 * Generate reasons for the suggestion
 */
function generateSuggestionReasons(
  venues: Location[],
  familyProfile: FamilyProfile,
  venueScores: VenueScore[]
): string[] {
  const reasons: string[] = [];

  if (venueScores[0]?.reasons.categoryMatch > 0.7) {
    reasons.push(`Perfect match for your family's favorite activities`);
  }

  if (venueScores[0]?.reasons.weatherSuitability > 0.7) {
    reasons.push(`Great option for current weather conditions`);
  }

  if (venueScores[0]?.reasons.budgetAlignment > 0.7) {
    reasons.push(`Fits perfectly within your budget`);
  }

  if (venueScores[0]?.reasons.noveltyBoost > 0.7) {
    reasons.push(`New place to explore with the family`);
  }

  if (familyProfile.childrenAges && familyProfile.childrenAges.length > 0) {
    reasons.push(`Great for children ages ${familyProfile.childrenAges.join(', ')}`);
  }

  return reasons.slice(0, 4);
}

/**
 * Get next available date for the trip
 */
function getNextAvailableDate(_familyProfile: FamilyProfile): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Prefer weekends (Saturday = 6, Sunday = 0)
  let daysUntilWeekend = 0;
  if (dayOfWeek >= 0 && dayOfWeek <= 4) {
    daysUntilWeekend = 6 - dayOfWeek;
  } else {
    daysUntilWeekend = 6;
  }

  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + daysUntilWeekend);
  return nextDate;
}

/**
 * Generate human-readable weather outlook
 */
function getWeatherOutlook(weather: any): string {
  if (!weather) return 'Check local forecast';

  const conditions: Record<string, string> = {
    sunny: 'Perfect sunny day',
    cloudy: 'Pleasant with some clouds',
    rainy: 'Rainy - great for indoor venues',
    snow: 'Snowy conditions',
  };

  return conditions[weather.condition] || 'Fair conditions';
}

/**
 * Predict crowd level based on venue and date
 */
function getPredictedCrowd(
  _venues: Location[]
): 'light' | 'moderate' | 'heavy' {
  // Simple heuristic: weekend crowds are typically moderate
  return 'moderate';
}

/**
 * Generate packing tips based on venues and weather
 */
function generatePackingTips(venues: Location[], weather: any): string[] {
  const tips: string[] = [];

  if (weather?.condition === 'rainy') {
    tips.push('Bring umbrellas or rain jackets');
  }

  if (weather?.temperature > 30) {
    tips.push('Pack sunscreen (SPF 50+)');
    tips.push('Bring water bottles to stay hydrated');
  }

  if (weather?.temperature < 15) {
    tips.push('Bring warm layers and jackets');
  }

  const hasParks = venues.some(v => (v.category as string)?.includes('park'));
  if (hasParks) {
    tips.push('Bring a picnic blanket and snacks');
    tips.push('Wear comfortable walking shoes');
  }

  const hasWater = venues.some(v => (v.category as string)?.includes('water'));
  if (hasWater) {
    tips.push('Bring swimwear and towels');
    tips.push('Pack waterproof bag for valuables');
  }

  return tips.slice(0, 5);
}

/**
 * Calculate estimated travel time between venues
 */
function calculateTravelTime(venues: Location[]): number {
  // Simple heuristic: ~20-30 min per venue transition + venue time
  const transitionTime = (venues.length - 1) * 25;
  const venueTime = venues.length * 90; // ~1.5 hours per venue
  return transitionTime + venueTime;
}

/**
 * Create default suggestion when no venues match
 */
function createDefaultSuggestion(index: number): TripSuggestion {
  return {
    tripId: `trip_default_${index}`,
    title: 'Family Outing Suggestion',
    venues: [],
    startDate: new Date(),
    endDate: new Date(),
    duration: 1,
    estimatedBudget: 100,
    confidenceScore: 50,
    reasons: ['Check local venues for availability'],
    expectedSatisfaction: 50,
    weatherOutlook: 'Check forecast',
    crowdPrediction: 'moderate',
    bestTimeToVisit: 'Weekend morning',
    packingTips: ['Bring essentials and check weather'],
    estimatedTravelTime: 120,
  };
}

/**
 * Get next suggested trip date considering family calendar
 */
export function getNextTripDate(familyProfile: FamilyProfile): Date {
  return getNextAvailableDate(familyProfile);
}

/**
 * Calculate family's outing pattern
 */
export function analyzeFamilyOutingPattern(
  history: ActivityHistoryEntry[]
): {
  averageFrequency: number; // outings per week
  preferredDays: number[];
  preferredCategories: string[];
  averageSpending: number;
} {
  if (history.length === 0) {
    return {
      averageFrequency: 1,
      preferredDays: [5, 6], // weekend default
      preferredCategories: ['park', 'restaurant'],
      averageSpending: 150,
    };
  }

  // Group by day of week
  const dayFrequency: Record<number, number> = {};
  const categoryFrequency: Record<string, number> = {};
  let totalSpending = 0;

  history.forEach(entry => {
    const date = new Date(entry.visitDate);
    const dayOfWeek = date.getDay();
    dayFrequency[dayOfWeek] = (dayFrequency[dayOfWeek] || 0) + 1;

    categoryFrequency[entry.category] = (categoryFrequency[entry.category] || 0) + 1;
    totalSpending += entry.cost || 0;
  });

  // Find preferred days (top 3)
  const preferredDays = Object.entries(dayFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => Number(day));

  // Find preferred categories
  const preferredCategories = Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);

  // Calculate frequency (outings per week)
  const weeksSinceFirstOuting = Math.max(
    1,
    (Date.now() - new Date(history[history.length - 1].visitDate).getTime()) /
      (1000 * 60 * 60 * 24 * 7)
  );
  const averageFrequency = history.length / weeksSinceFirstOuting;

  return {
    averageFrequency,
    preferredDays: preferredDays.length > 0 ? preferredDays : [5, 6],
    preferredCategories: preferredCategories.length > 0 ? preferredCategories : ['park'],
    averageSpending: totalSpending / Math.max(1, history.length),
  };
}
