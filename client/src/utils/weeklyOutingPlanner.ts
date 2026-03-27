/**
 * Automated Weekly Outing Planner
 * Intelligently suggests perfect family outings for the week based on:
 * - Family activity history
 * - Family preferences
 * - Weather conditions
 * - Crowd predictions
 * - Special events at venues
 * - Family budget constraints
 */

import type { Location, ActivityHistoryEntry, WeeklyOutingSuggestion } from '../types';

export interface FamilyWeeklyPreferences {
  preferredDaysOfWeek: number[]; // 0=Sunday, 6=Saturday
  maxBudgetPerWeek: number;
  preferredCategories: string[];
  avoidCrowdedTimes: boolean;
  preferWeatherFriendly: boolean;
  includeSpecialEvents: boolean;
  minimumTravelTime: number; // in minutes
  maximumTravelTime: number; // in minutes
}

export interface WeatherCondition {
  day: string;
  temperatureRange: { min: number; max: number };
  rainfall: number; // mm
  uvIndex: number;
  recommendation: 'ideal' | 'good' | 'moderate' | 'poor';
}

export interface CrowdPrediction {
  location: Location;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  crowdLevel: 'light' | 'moderate' | 'heavy' | 'very_heavy';
  estimatedWaitTime: number; // in minutes
}

export interface OutingSuggestionReason {
  reason: string;
  weight: number; // 0-1, influence on score
  score: number; // 0-1, how well this matches
}

export interface DetailedWeeklySuggestion extends WeeklySuggestion {
  reasons: OutingSuggestionReason[];
  weatherForecast: WeatherCondition;
  crowdPrediction: CrowdPrediction;
  costEstimate: number;
  estimatedDuration: number; // in minutes
  whyGoodChoice: string[];
  expectedSatisfaction: number; // 0-100
  alternativeOptions: Location[];
}

export interface WeeklySuggestion {
  dayOfWeek: string;
  suggestedLocation: Location;
  recommendedTimeOfDay: 'morning' | 'afternoon' | 'evening';
  confidence: number; // 0-1
  score: number; // 0-100
}

/**
 * Analyze family activity history to determine preferences
 */
export function analyzeFamilyPreferences(
  activityHistory: ActivityHistoryEntry[]
): Partial<FamilyWeeklyPreferences> {
  if (!activityHistory || activityHistory.length === 0) {
    return {};
  }

  // Analyze visit patterns by day of week
  const dayFrequency: Record<number, number> = {};
  const categoryFrequency: Record<string, number> = {};
  let totalSpending = 0;
  let visitCount = 0;

  activityHistory.forEach(entry => {
    const visitDate = new Date(entry.visitDate);
    const dayOfWeek = visitDate.getDay();
    dayFrequency[dayOfWeek] = (dayFrequency[dayOfWeek] || 0) + 1;
    categoryFrequency[entry.category] = (categoryFrequency[entry.category] || 0) + 1;
    totalSpending += entry.cost || 0;
    visitCount += 1;
  });

  // Find preferred days
  const preferredDaysOfWeek = Object.entries(dayFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => parseInt(day, 10));

  // Find preferred categories
  const preferredCategories = Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category]) => category);

  // Calculate average weekly spending
  const weeksOfData = Math.max(1, Math.ceil(activityHistory.length / 2));
  const avgWeeklySpending = totalSpending / weeksOfData;

  return {
    preferredDaysOfWeek: preferredDaysOfWeek.length > 0 ? preferredDaysOfWeek : [0, 1, 5, 6],
    maxBudgetPerWeek: avgWeeklySpending * 1.2, // 20% flexibility
    preferredCategories: preferredCategories.length > 0 ? preferredCategories : ['park', 'restaurant'],
    avoidCrowdedTimes: true,
    preferWeatherFriendly: true,
    includeSpecialEvents: true,
    minimumTravelTime: 0,
    maximumTravelTime: 45,
  };
}

/**
 * Score a location based on family preferences
 */
export function scoreLocationForFamily(
  location: Location,
  preferences: FamilyWeeklyPreferences,
  activityHistory: ActivityHistoryEntry[]
): number {
  let score = 0;

  // Category preference
  if (preferences.preferredCategories.includes(location.category as string)) {
    score += 25;
  }

  // Rating quality
  const avgRating = location.averageRating || 3;
  score += Math.min(25, (avgRating / 5) * 25);

  // Check if visited recently
  const recentVisits = activityHistory.filter(
    entry => entry.locationId === location.id
  ).slice(-3);
  const daysSinceLastVisit = recentVisits.length > 0
    ? Math.floor(
      (Date.now() - new Date(recentVisits[recentVisits.length - 1].visitDate).getTime()) /
      (1000 * 60 * 60 * 24)
    )
    : 999;

  // Prefer variety - not too recent visits
  if (daysSinceLastVisit > 60) {
    score += 25;
  } else if (daysSinceLastVisit > 30) {
    score += 15;
  } else if (daysSinceLastVisit > 14) {
    score += 5;
  }

  // Facilities match
  const familyFacilitiesNeeded = extractFamilyFacilityNeeds(activityHistory);
  const facilitiesMatching = (location.facilities || []).filter(f =>
    familyFacilitiesNeeded.includes(f)
  ).length;
  score += Math.min(25, facilitiesMatching * 5);

  return Math.min(100, Math.max(0, score));
}

/**
 * Extract facility needs based on activity history
 */
function extractFamilyFacilityNeeds(activityHistory: ActivityHistoryEntry[]): string[] {
  const facilities = new Set<string>();
  activityHistory.forEach(entry => {
    if (entry.childAge && entry.childAge < 3 && entry.childAge >= 0) {
      facilities.add('changing_table');
      facilities.add('nursing_room');
      facilities.add('stroller_accessible');
    }
    if (entry.childAge && entry.childAge >= 3 && entry.childAge < 12) {
      facilities.add('playground');
      facilities.add('water_play');
    }
  });
  return Array.from(facilities);
}

/**
 * Predict crowd level for a location at a specific time
 */
export function predictCrowdLevel(
  location: Location,
  dayOfWeek: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  activityHistory: ActivityHistoryEntry[] = []
): CrowdPrediction {
  const baselineMultiplier = timeOfDay === 'morning' ? 0.6 : timeOfDay === 'afternoon' ? 1.3 : 0.9;
  const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.5 : 1;

  // Historical crowd data from reviews
  const crowdReports = activityHistory.filter(
    entry => entry.locationId === location.id
  ).filter(e => e.crowdingLevel !== undefined);

  let crowdLevel: 'light' | 'moderate' | 'heavy' | 'very_heavy' = 'moderate';
  let estimatedWaitTime = 15;

  if (crowdReports.length > 0) {
    const avgCrowding = crowdReports.reduce((sum, e) => sum + (e.crowdingLevel || 2), 0) / crowdReports.length;
    if (avgCrowding < 1.5) {
      crowdLevel = 'light';
      estimatedWaitTime = 5;
    } else if (avgCrowding < 2.5) {
      crowdLevel = 'moderate';
      estimatedWaitTime = 15;
    } else if (avgCrowding < 3.5) {
      crowdLevel = 'heavy';
      estimatedWaitTime = 30;
    } else {
      crowdLevel = 'very_heavy';
      estimatedWaitTime = 60;
    }
  } else {
    // Heuristic estimate
    const baseWait = location.category === 'restaurant' ? 20 : 10;
    estimatedWaitTime = Math.floor(baseWait * baselineMultiplier * weekendMultiplier);

    if (estimatedWaitTime < 10) crowdLevel = 'light';
    else if (estimatedWaitTime < 20) crowdLevel = 'moderate';
    else if (estimatedWaitTime < 40) crowdLevel = 'heavy';
    else crowdLevel = 'very_heavy';
  }

  return {
    location,
    timeOfDay,
    crowdLevel,
    estimatedWaitTime,
  };
}

/**
 * Generate weekly outing suggestions
 */
export function generateWeeklyOutingSuggestions(
  availableLocations: Location[],
  activityHistory: ActivityHistoryEntry[] = [],
  customPreferences?: Partial<FamilyWeeklyPreferences>
): DetailedWeeklySuggestion[] {
  const preferences: FamilyWeeklyPreferences = {
    preferredDaysOfWeek: [0, 1, 5, 6],
    maxBudgetPerWeek: 2000,
    preferredCategories: ['park', 'restaurant'],
    avoidCrowdedTimes: true,
    preferWeatherFriendly: true,
    includeSpecialEvents: true,
    minimumTravelTime: 0,
    maximumTravelTime: 45,
    ...analyzeFamilyPreferences(activityHistory),
    ...customPreferences,
  };

  const suggestions: DetailedWeeklySuggestion[] = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Generate suggestion for each preferred day
  preferences.preferredDaysOfWeek.forEach(dayOfWeek => {
    if (suggestions.length >= 7) return; // Max 7 suggestions per week

    // Score all locations
    const scoredLocations = availableLocations
      .map(location => ({
        location,
        score: scoreLocationForFamily(location, preferences, activityHistory),
      }))
      .sort((a, b) => b.score - a.score);

    const topLocation = scoredLocations[0];
    if (!topLocation) return;

    // Recommend time based on crowd avoidance
    let recommendedTimeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
    if (preferences.avoidCrowdedTimes) {
      const crowdPredictions = (
        ['morning', 'afternoon', 'evening'] as const
      ).map(time => predictCrowdLevel(topLocation.location, dayOfWeek, time, activityHistory));

      const leastCrowded = crowdPredictions.reduce((prev, curr) =>
        (curr.estimatedWaitTime < prev.estimatedWaitTime ? curr : prev)
      );
      recommendedTimeOfDay = leastCrowded.timeOfDay;
    }

    const crowdPrediction = predictCrowdLevel(
      topLocation.location,
      dayOfWeek,
      recommendedTimeOfDay,
      activityHistory
    );

    const weatherForecast: WeatherCondition = {
      day: daysOfWeek[dayOfWeek],
      temperatureRange: { min: 20, max: 28 },
      rainfall: 0,
      uvIndex: 6,
      recommendation: 'ideal',
    };

    // Estimate cost based on category
    const costEstimate = topLocation.location.category === 'park' ? 0 :
      topLocation.location.category === 'restaurant' ? 600 : 800;
    const estimatedDuration = topLocation.location.category === 'restaurant' ? 90 : 180;

    const reasons: OutingSuggestionReason[] = [
      {
        reason: 'Matches family preferences',
        weight: 0.3,
        score: preferences.preferredCategories.includes(topLocation.location.category) ? 1 : 0.5,
      },
      {
        reason: 'High quality location',
        weight: 0.25,
        score: (topLocation.location.averageRating || 3) / 5,
      },
      {
        reason: 'Good variety in visit history',
        weight: 0.25,
        score: 0.8,
      },
      {
        reason: 'Family-friendly facilities',
        weight: 0.2,
        score: (topLocation.location.facilities?.length || 0) / 8,
      },
    ];

    const ratingForSatisfaction = topLocation.location.averageRating || 3;
    const expectedSatisfaction = Math.min(
      100,
      Math.max(0, Math.round((ratingForSatisfaction / 5) * 100))
    );

    const suggestion: DetailedWeeklySuggestion = {
      dayOfWeek: daysOfWeek[dayOfWeek],
      suggestedLocation: topLocation.location,
      recommendedTimeOfDay,
      confidence: Math.min(1, topLocation.score / 100),
      score: Math.round(topLocation.score),
      reasons,
      weatherForecast,
      crowdPrediction,
      costEstimate,
      estimatedDuration,
      whyGoodChoice: [
        `It matches your family's preferred ${topLocation.location.category}`,
        `The ${recommendedTimeOfDay} is usually less crowded (est. ${crowdPrediction.estimatedWaitTime} min wait)`,
        `You haven't visited recently - it's time for a change!`,
        `Great family facilities available: ${(topLocation.location.facilities || ['playground']).slice(0, 2).join(', ')}`,
      ],
      expectedSatisfaction,
      alternativeOptions: scoredLocations.slice(1, 4).map(sl => sl.location),
    };

    suggestions.push(suggestion);
  });

  return suggestions.slice(0, 4); // Return top 4 suggestions for the week
}

/**
 * Calculate overall weekly score
 */
export function calculateWeeklyScore(suggestions: DetailedWeeklySuggestion[]): number {
  if (suggestions.length === 0) return 0;
  const averageScore = suggestions.reduce((sum, s) => sum + s.score, 0) / suggestions.length;
  return Math.round(averageScore);
}

/**
 * Get human-readable weekly summary
 */
export function generateWeeklySummary(
  suggestions: DetailedWeeklySuggestion[],
  language: 'en' | 'zh' = 'en'
): string {
  const count = suggestions.length;
  const avgScore = calculateWeeklyScore(suggestions);
  const totalBudget = suggestions.reduce((sum, s) => sum + s.costEstimate, 0);

  const messages = {
    en: {
      summary: `We've found ${count} perfect outing${count !== 1 ? 's' : ''} for your family this week`,
      budget: `Total estimated budget: NT$${totalBudget}`,
      quality: `Overall recommendation quality: ${avgScore}/100`,
    },
    zh: {
      summary: `本週為您的家庭規劃了 ${count} 個完美郊遊選擇`,
      budget: `總預估預算：NT$${totalBudget}`,
      quality: `整體推薦品質：${avgScore}/100`,
    },
  };

  const msg = messages[language] || messages.en;
  return `${msg.summary}\n${msg.budget}\n${msg.quality}`;
}
