/**
 * Best Time to Visit Predictor
 * Uses historical patterns, weather, and family profile to recommend optimal visit times
 */

export interface VisitTimeRecommendation {
  dayOfWeek: string;
  date: Date;
  timeWindow: string; // e.g., "09:00-12:00"
  suitabilityScore: number; // 0-100
  crowdLevel: 'very_light' | 'light' | 'moderate' | 'busy' | 'very_busy';
  weatherCondition: 'excellent' | 'good' | 'fair' | 'poor';
  expectedWaitTime: number; // minutes
  reasonsToVisit: string[];
  reasonsToAvoid: string[];
  facilities: {
    restrooms: 'available' | 'crowded' | 'unavailable';
    nursingRoom: 'available' | 'crowded' | 'unavailable';
    restaurants: 'available' | 'crowded' | 'unavailable';
    parkingAvailable: boolean;
  };
}

export interface VisitPredictionInput {
  locationId: string;
  locationCategory: string;
  locationType: 'park' | 'restaurant' | 'amusement_park' | 'museum' | 'water_park' | 'shopping' | 'other';
  familyProfile?: {
    childrenAges: number[];
    preferredActivityType: string;
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'any';
    crowdTolerance: 'low' | 'medium' | 'high';
    mobilityNeeds: boolean;
  };
  historicalData?: {
    averageCrowdByDayOfWeek: Record<string, number>;
    averageCrowdByTime: Record<string, number>;
    popularTimes: string[];
    quietTimes: string[];
  };
}

// Generate best time recommendations based on patterns
export function predictBestTimes(input: VisitPredictionInput): VisitTimeRecommendation[] {
  const recommendations: VisitTimeRecommendation[] = [];
  const now = new Date();

  // Analyze next 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Generate time windows for the day
    const timeWindows = generateTimeWindows(input.locationType);

    for (const timeWindow of timeWindows) {
      const recommendation = evaluateTimeWindow(
        date,
        timeWindow,
        dayOfWeek,
        isWeekend,
        input
      );
      recommendations.push(recommendation);
    }
  }

  // Sort by suitability score and return top recommendations
  return recommendations
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 7); // Return weekly recommendations
}

function generateTimeWindows(locationType: string): string[] {
  const windows: Record<string, string[]> = {
    park: ['06:00-09:00', '09:00-12:00', '14:00-17:00', '17:00-19:00'],
    restaurant: ['11:00-12:00', '12:00-14:00', '17:00-18:00', '18:00-20:00'],
    amusement_park: ['09:00-12:00', '14:00-17:00', '17:00-19:00'],
    museum: ['09:00-12:00', '13:00-16:00', '16:00-18:00'],
    water_park: ['09:00-12:00', '14:00-17:00'],
    shopping: ['10:00-12:00', '14:00-17:00', '19:00-21:00'],
    other: ['09:00-12:00', '14:00-17:00', '17:00-19:00'],
  };

  return windows[locationType] || windows.other;
}

function evaluateTimeWindow(
  date: Date,
  timeWindow: string,
  dayOfWeek: string,
  isWeekend: boolean,
  input: VisitPredictionInput
): VisitTimeRecommendation {
  const [startTime] = timeWindow.split('-');
  const hour = parseInt(startTime.split(':')[0], 10);

  // Base crowdedness prediction
  let crowdScore = 50;

  if (input.historicalData?.averageCrowdByDayOfWeek[dayOfWeek]) {
    crowdScore = input.historicalData.averageCrowdByDayOfWeek[dayOfWeek];
  }

  // Adjust for day of week patterns
  if (isWeekend) {
    crowdScore += 15; // Weekends tend to be busier
  }

  // Adjust for time of day
  if (hour >= 11 && hour <= 13) {
    crowdScore += 20; // Lunch rush
  } else if (hour >= 17 && hour <= 19) {
    crowdScore += 15; // Evening rush
  } else if (hour >= 6 && hour <= 9) {
    crowdScore -= 10; // Early morning is quieter
  }

  // Apply family preferences
  if (input.familyProfile?.crowdTolerance === 'low' && crowdScore > 60) {
    crowdScore = Math.min(crowdScore, 70);
  }

  // Calculate suitability score (0-100)
  let suitabilityScore = 100;
  suitabilityScore -= crowdScore * 0.4; // 40% weight on crowds
  suitabilityScore += (100 - crowdScore) * 0.3; // 30% weight on quietness preference

  // Add bonus for family-preferred times
  if (input.familyProfile?.preferredTimeOfDay) {
    if (
      (input.familyProfile.preferredTimeOfDay === 'morning' && hour < 12) ||
      (input.familyProfile.preferredTimeOfDay === 'afternoon' && hour >= 12 && hour < 17) ||
      (input.familyProfile.preferredTimeOfDay === 'evening' && hour >= 17)
    ) {
      suitabilityScore = Math.min(100, suitabilityScore + 10);
    }
  }

  const crowdLevel = getCrowdLevel(crowdScore);
  const expectedWaitTime = estimateWaitTime(crowdScore, input.locationType);

  return {
    dayOfWeek,
    date,
    timeWindow,
    suitabilityScore: Math.max(0, Math.min(100, suitabilityScore)),
    crowdLevel,
    weatherCondition: predictWeatherCondition(date),
    expectedWaitTime,
    reasonsToVisit: generateReasonsToVisit(crowdScore, hour, isWeekend),
    reasonsToAvoid: generateReasonsToAvoid(crowdScore, hour),
    facilities: predictFacilityAvailability(crowdScore, input.locationType),
  };
}

function getCrowdLevel(score: number): VisitTimeRecommendation['crowdLevel'] {
  if (score < 20) return 'very_light';
  if (score < 40) return 'light';
  if (score < 60) return 'moderate';
  if (score < 80) return 'busy';
  return 'very_busy';
}

function estimateWaitTime(crowdScore: number, locationType: string): number {
  const baseWaitTimes: Record<string, number> = {
    park: 5,
    restaurant: 10,
    amusement_park: 20,
    museum: 5,
    water_park: 15,
    shopping: 5,
    other: 10,
  };

  const baseWait = baseWaitTimes[locationType] || 10;
  return Math.round(baseWait + (crowdScore / 100) * baseWait * 3);
}

function predictWeatherCondition(
  date: Date
): VisitTimeRecommendation['weatherCondition'] {
  // Simplified weather prediction (in production, would use real weather API)
  const month = date.getMonth();

  // Taiwan weather patterns
  if (month >= 6 && month <= 9) {
    return 'fair'; // Typhoon season
  }
  if (month >= 11 || month <= 2) {
    return 'good'; // Cool and clear
  }

  return 'good';
}

function predictFacilityAvailability(
  crowdScore: number,
  locationType: string
): VisitTimeRecommendation['facilities'] {
  const highCrowd = crowdScore > 70;

  return {
    restrooms: highCrowd ? 'crowded' : 'available',
    nursingRoom: locationType === 'shopping' || locationType === 'amusement_park' ? (highCrowd ? 'crowded' : 'available') : 'unavailable',
    restaurants: locationType === 'amusement_park' || locationType === 'shopping' ? (highCrowd ? 'crowded' : 'available') : 'unavailable',
    parkingAvailable: crowdScore < 80,
  };
}

function generateReasonsToVisit(crowdScore: number, hour: number, isWeekend: boolean): string[] {
  const reasons: string[] = [];

  if (crowdScore < 40) {
    reasons.push('Light crowds - more relaxing experience');
  }

  if (hour >= 6 && hour < 9) {
    reasons.push('Early bird advantage - fewer visitors');
  }

  if (!isWeekend) {
    reasons.push('Weekday pricing often available');
  }

  if (hour >= 14 && hour < 16) {
    reasons.push('Post-lunch window - less crowded');
  }

  return reasons;
}

function generateReasonsToAvoid(crowdScore: number, hour: number): string[] {
  const reasons: string[] = [];

  if (crowdScore > 70) {
    reasons.push('Expected to be very crowded');
  }

  if (hour >= 11 && hour <= 13) {
    reasons.push('Lunch rush - restaurants may be overwhelmed');
  }

  if (hour >= 17 && hour <= 19) {
    reasons.push('Evening rush hour');
  }

  return reasons;
}

/**
 * Calculate a composite suitability score for a location based on family profile
 */
export function calculateFamilySuitabilityScore(
  location: any,
  familyProfile?: any
): number {
  let score = 50;

  if (!familyProfile) return score;

  // Age appropriateness
  if (familyProfile.childrenAges) {
    const avgAge = familyProfile.childrenAges.reduce((a: number, b: number) => a + b, 0) / familyProfile.childrenAges.length;

    if (location.category === 'park' && avgAge >= 2) score += 15;
    if (location.category === 'restaurant' && avgAge >= 0) score += 10;
    if (location.category === 'amusement_park' && avgAge >= 5) score += 20;
    if (location.category === 'museum' && avgAge >= 3) score += 15;
  }

  // Facility matching
  if (familyProfile.mobilityNeeds && location.facilities?.includes('stroller_accessible')) {
    score += 20;
  }

  // Average rating boost
  if (location.averageRating) {
    score += location.averageRating * 5;
  }

  return Math.min(100, score);
}

export default {
  predictBestTimes,
  calculateFamilySuitabilityScore,
};
