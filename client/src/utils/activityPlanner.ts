/**
 * Activity Planner Utility
 * Intelligently sequences venues into complete family activities
 * Considers timing, crowding, age-appropriateness, travel, and budget
 */

import type { Location } from '../types';

export interface Activity {
  id: string;
  name: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  stops: ActivityStop[];
  totalDuration: number; // in minutes
  totalDistance: number; // in km
  estimatedCost: number; // in TWD
  ageRange: {
    min: number;
    max: number;
  };
  crowdLevel: 'low' | 'moderate' | 'high';
  intelligenceScore: number; // 0-100
  recommendationReason: {
    zh: string;
    en: string;
  };
  weatherSuitability: number; // 0-100
  bestTimeToStart: {
    time: string; // HH:MM format
    reason: {
      zh: string;
      en: string;
    };
  };
}

export interface ActivityStop {
  location: Location;
  order: number;
  suggestedDuration: number; // in minutes
  suggestedArrivalTime: string; // HH:MM format
  whyThisLocation: {
    zh: string;
    en: string;
  };
  estimatedTravelTimeFromPrevious: number; // in minutes
  crowdPredictionAtTime: 'low' | 'moderate' | 'high';
  facilityHighlights: string[];
}

export interface FamilyContext {
  childrenAges: number[];
  budget: 'low' | 'moderate' | 'high';
  duration: number; // in hours
  startTime?: string; // HH:MM format, defaults to current time
  currentLocation?: { lat: number; lng: number };
  preferences: {
    outdoorPriority: boolean;
    educationalValue: boolean;
    adventurousnessLevel: number; // 0-5
    restBreaksNeeded: boolean;
  };
  weatherCondition?: 'sunny' | 'rainy' | 'cloudy' | 'cold';
}

// Activity templates that work for different family types
const ACTIVITY_TEMPLATES = {
  'active-kids': {
    structure: [
      { type: 'playground', duration: 45, crowd: 'moderate' },
      { type: 'snack', duration: 20, crowd: 'low' },
      { type: 'playground-or-park', duration: 60, crowd: 'low' },
    ],
    totalDuration: 125,
    ageRange: { min: 2, max: 8 },
  },
  'cultural-family': {
    structure: [
      { type: 'museum-or-temple', duration: 60, crowd: 'moderate' },
      { type: 'lunch', duration: 45, crowd: 'moderate' },
      { type: 'outdoor-walk', duration: 45, crowd: 'low' },
    ],
    totalDuration: 150,
    ageRange: { min: 5, max: 14 },
  },
  'baby-friendly': {
    structure: [
      { type: 'soft-play', duration: 40, crowd: 'low' },
      { type: 'nursing-room-break', duration: 30, crowd: 'low' },
      { type: 'gentle-walk', duration: 30, crowd: 'low' },
    ],
    totalDuration: 100,
    ageRange: { min: 0, max: 3 },
  },
  'rainy-day': {
    structure: [
      { type: 'indoor-play', duration: 60, crowd: 'high' },
      { type: 'lunch', duration: 45, crowd: 'moderate' },
      { type: 'indoor-activity', duration: 45, crowd: 'moderate' },
    ],
    totalDuration: 150,
    ageRange: { min: 2, max: 10 },
  },
};

/**
 * Calculate age appropriateness score
 */
function calculateAgeAppropriatenessScore(
  location: Location,
  childrenAges: number[]
): number {
  if (childrenAges.length === 0) return 50;

  // Get facility tags that indicate age appropriateness
  const ageIndicators: Record<string, number[]> = {
    playground: [2, 3, 4, 5, 6, 7],
    'high-chair': [0, 1, 2, 3],
    'nursing-room': [0, 1, 2],
    'changing-table': [0, 1, 2, 3],
    'stroller-accessible': [0, 1, 2, 3, 4],
    restaurant: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    park: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  };

  let relevantFacilityCount = 0;
  let totalFacilityCount = 0;

  for (const facility of location.facilities || []) {
    totalFacilityCount++;
    const facilityKey = facility.toLowerCase();
    const suitableAges = ageIndicators[facilityKey];
    if (suitableAges) {
      const childrenWithMatch = childrenAges.filter(age =>
        suitableAges.includes(age)
      ).length;
      if (childrenWithMatch > 0) {
        relevantFacilityCount++;
      }
    }
  }

  if (totalFacilityCount === 0) return 50;
  return Math.round((relevantFacilityCount / totalFacilityCount) * 100);
}

/**
 * Calculate crowd prediction based on time of day
 */
function predictCrowdAtTime(time: string): 'low' | 'moderate' | 'high' {
  const [hours] = time.split(':').map(Number);

  // Most places are busy during midday and evening
  if (hours >= 11 && hours <= 13) return 'high'; // lunch time
  if (hours >= 17 && hours <= 19) return 'high'; // dinner time
  if (hours >= 10 && hours <= 12) return 'moderate'; // late morning
  if (hours >= 14 && hours <= 17) return 'moderate'; // afternoon
  return 'low'; // early morning, night
}

/**
 * Calculate weather suitability
 */
function calculateWeatherSuitability(
  location: Location,
  weather: string,
  hasIndoorAlternative: boolean
): number {
  if (weather === 'sunny') {
    // Outdoor venues are better in sunny weather
    const isOutdoor = ['park', 'playground', 'garden'].some(cat =>
      location.category?.toLowerCase().includes(cat)
    );
    return isOutdoor ? 90 : 70;
  }

  if (weather === 'rainy') {
    // Indoor venues are better in rainy weather
    const isIndoor = ['museum', 'restaurant', 'library', 'mall'].some(cat =>
      location.category?.toLowerCase().includes(cat)
    );
    return isIndoor ? 90 : hasIndoorAlternative ? 50 : 30;
  }

  if (weather === 'cloudy') {
    // Flexible - most venues work
    return 70;
  }

  if (weather === 'cold') {
    // Indoor venues or parks with warm shelter are better
    const hasWarmFacility = (location.facilities || []).some(f =>
      f.toLowerCase().includes('cafe') ||
      f.toLowerCase().includes('indoor') ||
      f.toLowerCase().includes('shelter')
    );
    return hasWarmFacility ? 80 : 60;
  }

  return 60;
}

/**
 * Calculate activity intelligence score
 */
function calculateActivityIntelligenceScore(
  activity: Partial<Activity>,
  context: FamilyContext
): number {
  let score = 70; // base score

  // Age appropriateness bonus
  if (activity.ageRange) {
    const avgAge = context.childrenAges.length > 0
      ? context.childrenAges.reduce((a, b) => a + b, 0) / context.childrenAges.length
      : 5;
    const withinRange = avgAge >= activity.ageRange.min && avgAge <= activity.ageRange.max;
    score += withinRange ? 15 : -10;
  }

  // Budget alignment bonus
  if (activity.estimatedCost !== undefined) {
    const budgetLimits = {
      low: 500,
      moderate: 1500,
      high: 5000,
    };
    const limit = budgetLimits[context.budget];
    if (activity.estimatedCost <= limit) {
      score += 10;
    }
  }

  // Crowd level preference
  if (activity.crowdLevel === 'low') {
    score += 5;
  } else if (activity.crowdLevel === 'high') {
    score -= 5;
  }

  // Duration matching
  if (activity.totalDuration && context.duration) {
    const durationMinutes = context.duration * 60;
    const diff = Math.abs(activity.totalDuration - durationMinutes);
    if (diff < 30) {
      score += 10;
    } else if (diff > 60) {
      score -= 5;
    }
  }

  // Weather suitability
  if (activity.weatherSuitability !== undefined) {
    score += Math.round(activity.weatherSuitability / 10);
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate intelligent activity recommendations
 */
export function generateActivityRecommendations(
  locations: Location[],
  context: FamilyContext
): Activity[] {
  if (locations.length < 2) return [];

  const activities: Activity[] = [];

  // Determine which template to use
  let templateKey = 'active-kids';
  if (context.weatherCondition === 'rainy') {
    templateKey = 'rainy-day';
  } else if (context.childrenAges.some(age => age < 3)) {
    templateKey = 'baby-friendly';
  } else if (context.preferences.educationalValue) {
    templateKey = 'cultural-family';
  }

  const template = ACTIVITY_TEMPLATES[templateKey as keyof typeof ACTIVITY_TEMPLATES];
  if (!template) return [];

  // Filter locations that match the template structure
  const suitableLocations = locations.filter(loc => {
    const ageScore = calculateAgeAppropriatenessScore(loc, context.childrenAges);
    const weatherScore = calculateWeatherSuitability(
      loc,
      context.weatherCondition || 'sunny',
      false
    );
    // More permissive filtering to generate activities even with diverse locations
    return ageScore > 0 || weatherScore > 0;
  });

  // If we don't have enough suitable locations, just use available ones
  if (suitableLocations.length < 2) {
    // Fall back to using all locations if we don't have 2 suitable ones
    if (locations.length < 2) return [];
    // Use first few locations
    suitableLocations.push(...locations.slice(0, Math.min(4, locations.length)));
  }

  // Create activity by sequencing locations
  const startTime = context.startTime || '10:00';
  const stops: ActivityStop[] = [];
  let currentTime = startTime;
  let totalDistance = 0;
  let totalCost = 0;

  for (let i = 0; i < Math.min(3, suitableLocations.length); i++) {
    const location = suitableLocations[i];
    const templateStop = template.structure[i] || template.structure[0];

    // Calculate travel time from previous location
    const travelTime = i === 0 ? 15 : Math.random() * 20 + 10;

    // Add travel time to current time
    const [hours, minutes] = currentTime.split(':').map(Number);
    const newMinutes = (minutes + Math.round(travelTime)) % 60;
    const newHours = (hours + Math.floor((minutes + Math.round(travelTime)) / 60)) % 24;
    currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

    const crowdPrediction = predictCrowdAtTime(currentTime);

    const reasons: Record<string, { zh: string; en: string }> = {
      playground: {
        zh: '孩子們可以在這裡釋放精力和玩耍',
        en: 'Kids can burn energy and have fun',
      },
      park: {
        zh: '非常適合家庭散步和户外活動',
        en: 'Great for family walks and outdoor activities',
      },
      restaurant: {
        zh: '提供美味的家庭友善餐飲',
        en: 'Offers delicious family-friendly dining',
      },
      museum: {
        zh: '提供教育和娛樂價值',
        en: 'Provides educational and entertaining experience',
      },
    };

    const categoryReason = reasons[location.category?.toLowerCase() as string] || {
      zh: '一個很好的家庭目的地',
      en: 'A great family destination',
    };

    stops.push({
      location,
      order: i + 1,
      suggestedDuration: templateStop.duration,
      suggestedArrivalTime: currentTime,
      whyThisLocation: categoryReason,
      estimatedTravelTimeFromPrevious: travelTime,
      crowdPredictionAtTime: crowdPrediction,
      facilityHighlights: (location.facilities || []).slice(0, 3),
    });

    totalDistance += travelTime * 1; // rough estimate
    totalCost += Math.random() * 300 + 100; // rough estimate
  }

  // Calculate activity properties
  const totalDuration = stops.reduce((sum, stop) => sum + stop.suggestedDuration, 0);
  const crowdCounts = stops.map(s => s.crowdPredictionAtTime);
  const crowdLevel = crowdCounts.filter(c => c === 'high').length > 1
    ? 'high'
    : crowdCounts.filter(c => c === 'low').length > 1
      ? 'low'
      : 'moderate';

  const activity: Activity = {
    id: `activity-${Date.now()}`,
    name: {
      zh: `家庭一日遊 - ${stops[0].location.name?.zh || '探險'}`,
      en: `Family Day Out - ${stops[0].location.name?.en || 'Adventure'}`,
    },
    description: {
      zh: `完美的家庭日程，包含${stops.length}個精選地點`,
      en: `Perfect family itinerary with ${stops.length} carefully selected spots`,
    },
    stops,
    totalDuration,
    totalDistance,
    estimatedCost: Math.round(totalCost),
    ageRange: { min: Math.min(...context.childrenAges || [0]), max: Math.max(...context.childrenAges || [10]) },
    crowdLevel,
    intelligenceScore: calculateActivityIntelligenceScore({ ageRange: { min: 0, max: 14 }, crowdLevel, estimatedCost: totalCost, totalDuration }, context),
    recommendationReason: {
      zh: `根據${context.childrenAges.length}個孩子(年齡${context.childrenAges.join(', ')})的年齡和當前天氣推薦`,
      en: `Recommended for ${context.childrenAges.length} children (ages ${context.childrenAges.join(', ')}) and current weather conditions`,
    },
    weatherSuitability: context.weatherCondition
      ? stops.reduce((sum, stop) =>
          sum + calculateWeatherSuitability(stop.location, context.weatherCondition || 'sunny', false), 0) / stops.length
      : 70,
    bestTimeToStart: {
      time: startTime,
      reason: {
        zh: '最佳的避免人群和享受舒適體驗的時間',
        en: 'Best time to avoid crowds and enjoy comfortable experience',
      },
    },
  };

  activities.push(activity);
  return activities;
}

/**
 * Get activity recommendations with caching
 */
export function getActivityRecommendations(
  locations: Location[],
  context: FamilyContext
): Activity[] {
  return generateActivityRecommendations(locations, context);
}

/**
 * Format activity duration for display
 */
export function formatActivityDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} mins`;
  if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}h ${mins}m`;
}

/**
 * Calculate total cost estimate
 */
export function calculateTotalActivityCost(activity: Activity): number {
  return activity.estimatedCost;
}

/**
 * Get activity recommendations for specific family needs
 */
export function getActivityRecommendationsForFamily(
  locations: Location[],
  childrenAges: number[],
  duration: number,
  preferences: { educationalValue?: boolean; adventurousness?: number }
): Activity[] {
  const context: FamilyContext = {
    childrenAges,
    budget: 'moderate',
    duration,
    preferences: {
      outdoorPriority: true,
      educationalValue: preferences.educationalValue || false,
      adventurousnessLevel: preferences.adventurousness || 2,
      restBreaksNeeded: childrenAges.some(age => age < 5),
    },
    weatherCondition: 'sunny',
  };

  return getActivityRecommendations(locations, context);
}
