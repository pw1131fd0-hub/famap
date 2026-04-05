/**
 * Smart Emergency & Last-Minute Venue Finder
 * Helps families quickly locate exactly what they need in urgent or time-constrained situations
 */

import type { Location } from '../types';

export interface EmergencyNeed {
  type: 'nursing_room' | 'bathroom' | 'medical' | 'shelter_rain' | 'meal' | 'activity' | 'parking' | 'rest_area';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  timeAvailable: number; // in minutes
  preferredDistance: number; // in kilometers
  familySize: number;
  childAges: number[];
  specialNeeds?: string[];
}

export interface EmergencyVenueScore {
  locationId: string;
  locationName: string;
  score: number; // 0-100
  urgencyMatch: number; // How well it matches the urgency
  timeMatch: number; // Can we get there and back in time?
  facilityReliability: number; // How certain is the facility available
  crowdingLevel: 'low' | 'moderate' | 'high';
  estimatedWaitTime: number; // in minutes
  travelTime: number; // in minutes
  suitabilityForAges: boolean;
  recommendationReason: string[];
  alternativeSuggestions?: string[];
}

export interface LastMinutePlans {
  durationMinutes: number;
  nearbyVenues: EmergencyVenueScore[];
  quickActivities: {
    category: string;
    duration: number;
    venues: string[];
  }[];
  weatherConsiderations: string;
  estimatedCost: number;
  bestTimeWindow: {
    startTime: Date;
    endTime: Date;
    crowdingPrediction: string;
  };
}

/**
 * Finds the best venue for an emergency need
 */
export function findEmergencyVenue(
  locations: Location[],
  need: EmergencyNeed,
  userLat: number,
  userLng: number
): EmergencyVenueScore[] {
  if (!locations || locations.length === 0) {
    return [];
  }

  const scoredVenues = locations
    .filter((loc) => meetsEmergencyNeed(loc, need))
    .map((loc) => scoreVenueForEmergency(loc, need, userLat, userLng))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scoredVenues;
}

/**
 * Check if a venue can meet the emergency need
 */
function meetsEmergencyNeed(location: Location, need: EmergencyNeed): boolean {
  if (!location || !location.facilities) {
    return false;
  }

  const facilityMap: Record<string, string[]> = {
    nursing_room: ['nursing_room'],
    bathroom: ['bathroom', 'toilet', 'restroom'],
    medical: ['medical_facility', 'first_aid', 'clinic'],
    shelter_rain: ['indoor_activity', 'roof_coverage', 'weather_shelter'],
    meal: ['restaurant', 'cafe', 'food_court'],
    activity: ['playground', 'activity', 'entertainment'],
    parking: ['parking'],
    rest_area: ['parent_rest_area', 'seating'],
  };

  const requiredFacilities = facilityMap[need.type] || [];
  const hasRequiredFacility = requiredFacilities.some((facility) =>
    location.facilities.some((f) => f.includes(facility))
  );

  // For medical emergencies, any facility in that category works
  if (need.type === 'medical') {
    return location.category === 'medical' || hasRequiredFacility;
  }

  return hasRequiredFacility;
}

/**
 * Score a venue for emergency suitability (0-100)
 */
function scoreVenueForEmergency(
  location: Location,
  need: EmergencyNeed,
  userLat: number,
  userLng: number
): EmergencyVenueScore {
  const travelTime = calculateTravelTime(userLat, userLng, location.coordinates.lat, location.coordinates.lng);
  const canGetThere = travelTime <= need.timeAvailable * 0.3; // Use 30% of time for travel
  const facilityReliability = calculateFacilityReliability(location, need);
  const urgencyMatch = calculateUrgencyMatch(location, need);
  const timeMatch = calculateTimeMatch(travelTime, need);
  const crowdingLevel = estimateCrowdingLevel(location, need);
  const estimatedWaitTime = estimateWaitTime(crowdingLevel, need);
  const suitabilityForAges = checkAgeSuitability(location, need.childAges);

  // Weight calculation for emergency score
  let score = 0;
  score += canGetThere ? 25 : 5; // Reachability is critical
  score += facilityReliability * 0.25;
  score += urgencyMatch * 0.2;
  score += timeMatch * 0.15;
  score += (100 - estimatedWaitTime) * 0.15; // Less wait time = better score

  // Penalize if not age-appropriate
  if (!suitabilityForAges && need.urgency !== 'critical') {
    score *= 0.7;
  }

  const recommendationReason = generateRecommendationReason(
    location,
    need,
    travelTime,
    facilityReliability,
    urgencyMatch,
    crowdingLevel
  );

  return {
    locationId: location.id,
    locationName: location.name.en || location.name.zh || '',
    score: Math.min(100, Math.max(0, Math.round(score))),
    urgencyMatch,
    timeMatch,
    facilityReliability,
    crowdingLevel,
    estimatedWaitTime,
    travelTime,
    suitabilityForAges,
    recommendationReason,
  };
}

/**
 * Calculate travel time in minutes
 */
function calculateTravelTime(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Estimate travel time: 15 km/h average urban speed
  return Math.ceil((distance / 15) * 60);
}

/**
 * Calculate how reliable the facility is available
 */
function calculateFacilityReliability(location: Location, need: EmergencyNeed): number {
  if (!location || !location.facilities) {
    return 50;
  }

  let reliability = 75; // Base reliability

  // Higher reliability if it's a dedicated facility for the need
  const isDedicated = location.facilities.some((f) => f.includes(need.type));
  if (isDedicated) {
    reliability += 15;
  }

  // Check if location is currently open (weekday bias for reliability)
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 18) {
    reliability += 10; // More reliable during business hours
  }

  // Reduce reliability for high-uncertainty locations
  if (!location.category || location.category === 'other') {
    reliability -= 15;
  }

  return Math.min(100, reliability);
}

/**
 * Calculate how well the venue matches urgency level
 */
function calculateUrgencyMatch(location: Location, need: EmergencyNeed): number {
  if (need.urgency === 'critical') {
    // Medical facilities are best for critical needs
    if (location.category === 'medical') {
      return 100;
    }
    // Nursing rooms are critical for certain needs
    if (need.type === 'nursing_room' && location.facilities?.some((f) => f.includes('nursing_room'))) {
      return 95;
    }
    return 70; // Generic match for critical
  }

  if (need.urgency === 'high') {
    return location.category === need.type || location.category === 'restaurant' ? 85 : 65;
  }

  return 75; // Medium and low urgency have more flexibility
}

/**
 * Calculate if we have time to visit and return
 */
function calculateTimeMatch(travelTime: number, need: EmergencyNeed): number {
  const roundTripTime = travelTime * 2;
  const availableForActivity = need.timeAvailable - roundTripTime;

  if (availableForActivity < 5) {
    return 0; // No time to actually do anything
  }

  if (availableForActivity < 15) {
    return 40; // Quick visit only
  }

  if (availableForActivity < 30) {
    return 70; // Short visit
  }

  return 100; // Comfortable time
}

/**
 * Estimate current crowding level
 */
function estimateCrowdingLevel(
  location: Location,
  need: EmergencyNeed
): 'low' | 'moderate' | 'high' {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();

  // Weekends are busier
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (hour >= 10 && hour <= 16) {
      return 'high';
    }
    if (hour >= 9 && hour <= 18) {
      return 'moderate';
    }
  }

  // Weekdays
  if (hour >= 11 && hour <= 13) {
    // Lunch time
    return need.type === 'meal' ? 'high' : 'moderate';
  }

  if (hour >= 15 && hour <= 17) {
    // After school
    return 'moderate';
  }

  return 'low';
}

/**
 * Estimate wait time in minutes
 */
function estimateWaitTime(crowdingLevel: 'low' | 'moderate' | 'high', need: EmergencyNeed): number {
  const waitMap: Record<string, Record<string, number>> = {
    low: {
      nursing_room: 2,
      bathroom: 3,
      medical: 5,
      meal: 5,
      shelter_rain: 0,
      activity: 5,
      parking: 2,
      rest_area: 0,
    },
    moderate: {
      nursing_room: 5,
      bathroom: 8,
      medical: 10,
      meal: 15,
      shelter_rain: 0,
      activity: 10,
      parking: 5,
      rest_area: 3,
    },
    high: {
      nursing_room: 10,
      bathroom: 15,
      medical: 15,
      meal: 30,
      shelter_rain: 0,
      activity: 20,
      parking: 10,
      rest_area: 5,
    },
  };

  return waitMap[crowdingLevel][need.type] || 5;
}

/**
 * Check if location is appropriate for children's ages
 */
function checkAgeSuitability(location: Location, childAges: number[]): boolean {
  if (!location || childAges.length === 0) {
    return true;
  }

  // Basic age-based filtering
  const minAge = Math.min(...childAges);
  const _maxAge = Math.max(...childAges);

  // Nursing rooms and rest areas suit all ages
  if (
    location.facilities?.some(
      (f) => f.includes('nursing_room') || f.includes('rest_area') || f.includes('bathroom')
    )
  ) {
    return true;
  }

  // Medical facilities suit all ages
  if (location.category === 'medical') {
    return true;
  }

  // Restaurants need appropriate seating
  if (location.category === 'restaurant') {
    const hasHighChairs = location.facilities?.some((f) => f.includes('high_chair'));
    const hasFamilySeating = location.facilities?.some((f) =>
      f.includes('family_seating') || f.includes('spacious')
    );
    return hasHighChairs || hasFamilySeating || minAge > 3;
  }

  // Parks and attractions: check for age-appropriate equipment
  if (location.category === 'park' || location.category === 'attraction') {
    // Assume parks have equipment for ages 2-12
    return minAge >= 1;
  }

  return true;
}

/**
 * Generate human-readable reasons for the recommendation
 */
function generateRecommendationReason(
  location: Location,
  need: EmergencyNeed,
  travelTime: number,
  facilityReliability: number,
  urgencyMatch: number,
  crowdingLevel: 'low' | 'moderate' | 'high'
): string[] {
  const reasons: string[] = [];

  if (travelTime <= 10) {
    reasons.push(`Very close: ${travelTime} min travel time`);
  } else if (travelTime <= 20) {
    reasons.push(`Nearby: ${travelTime} min travel time`);
  }

  if (facilityReliability >= 85) {
    reasons.push('High confidence facility available');
  }

  if (urgencyMatch >= 90) {
    reasons.push('Excellent match for your need');
  }

  if (crowdingLevel === 'low') {
    reasons.push('Expected to be quiet');
  } else if (crowdingLevel === 'high') {
    reasons.push('May be busy - consider alternate times');
  }

  if (location.category === 'medical' && need.type === 'medical') {
    reasons.push('Professional medical staff on site');
  }

  return reasons.length > 0
    ? reasons
    : ['Good option for your needs', 'Meets requirements and available'];
}

/**
 * Generate last-minute outing plans
 */
export function generateLastMinuteOutingPlans(
  locations: Location[],
  timeAvailableMinutes: number,
  userLat: number,
  userLng: number,
  familySize: number,
  childAges: number[],
  weatherCondition?: 'sunny' | 'rainy' | 'cloudy'
): LastMinutePlans {
  const travelTimePerStop = Math.ceil(timeAvailableMinutes * 0.2); // 20% for travel
  const _activityTimePerStop = Math.ceil((timeAvailableMinutes - travelTimePerStop * 2) / 2);

  // Filter locations by travel time
  const nearbyLocations = locations.filter((loc) => {
    const travelTime = calculateTravelTime(userLat, userLng, loc.coordinates.lat, loc.coordinates.lng);
    return travelTime <= travelTimePerStop;
  });

  // Organize by activity type
  const quickActivities = organizeByActivityType(nearbyLocations, timeAvailableMinutes);

  // Weather considerations
  let weatherConsiderations = '';
  if (weatherCondition === 'rainy') {
    weatherConsiderations = 'Prefer indoor activities and venues with weather coverage';
  } else if (weatherCondition === 'sunny') {
    weatherConsiderations = 'Consider sun protection and shaded areas. Best times: morning or late afternoon';
  }

  // Estimate costs
  const estimatedCost = calculateEstimatedCost(nearbyLocations, childAges);

  // Find best time window
  const bestTimeWindow = findBestTimeWindow(timeAvailableMinutes);

  return {
    durationMinutes: timeAvailableMinutes,
    nearbyVenues: nearbyLocations.slice(0, 5).map((loc) =>
      scoreVenueForEmergency(loc, {
        type: 'activity',
        urgency: 'medium',
        timeAvailable: timeAvailableMinutes,
        preferredDistance: 15,
        familySize,
        childAges,
      }, userLat, userLng)
    ),
    quickActivities,
    weatherConsiderations,
    estimatedCost,
    bestTimeWindow,
  };
}

/**
 * Organize locations by activity type
 */
function organizeByActivityType(
  locations: Location[],
  timeAvailable: number
): { category: string; duration: number; venues: string[] }[] {
  const activities: Record<string, Location[]> = {
    playground: [],
    dining: [],
    indoor: [],
    entertainment: [],
  };

  locations.forEach((loc) => {
    if (loc.category === 'park') {
      activities.playground.push(loc);
    } else if (loc.category === 'restaurant') {
      activities.dining.push(loc);
    } else if (
      loc.facilities?.some((f) =>
        f.includes('indoor') || f.includes('shelter') || f.includes('roof')
      )
    ) {
      activities.indoor.push(loc);
    } else if (loc.category === 'attraction') {
      activities.entertainment.push(loc);
    }
  });

  return Object.entries(activities)
    .filter(([, venues]) => venues.length > 0)
    .map(([category, venues]) => ({
      category,
      duration: timeAvailable > 60 ? 30 : 15,
      venues: venues.slice(0, 3).map((v) => v.name.en || v.name.zh || ''),
    }));
}

/**
 * Calculate estimated cost
 */
function calculateEstimatedCost(locations: Location[], childAges: number[]): number {
  const avgCostPerChild = 200; // TWD estimate
  const costPerVenue = avgCostPerChild * childAges.length;
  const venueCount = Math.min(2, locations.length); // Usually 1-2 venues

  return costPerVenue * venueCount;
}

/**
 * Find best time window for activities
 */
function findBestTimeWindow(durationMinutes: number): {
  startTime: Date;
  endTime: Date;
  crowdingPrediction: string;
} {
  const now = new Date();
  const hour = now.getHours();
  let startHour = hour + 1; // Start 1 hour from now
  let crowdingPrediction = 'moderate';

  // Adjust for better times
  if (hour >= 9 && hour <= 11) {
    startHour = 11; // Avoid pre-lunch rush
    crowdingPrediction = 'light';
  } else if (hour >= 11 && hour <= 14) {
    startHour = 14; // After lunch
    crowdingPrediction = 'moderate';
  } else if (hour >= 14 && hour <= 16) {
    crowdingPrediction = 'moderate to busy';
  } else if (hour >= 16 && hour <= 18) {
    crowdingPrediction = 'busy - after school';
  } else if (hour >= 18 && hour <= 20) {
    crowdingPrediction = 'moderate - dinner time';
  } else {
    crowdingPrediction = 'light - off hours';
  }

  const startTime = new Date(now);
  startTime.setHours(Math.min(startHour, 21), 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  return {
    startTime,
    endTime,
    crowdingPrediction,
  };
}

/**
 * Find venues for specific emergency types
 */
export function findSpecificEmergencyVenue(
  locations: Location[],
  emergencyType: string,
  userLat: number,
  userLng: number
): EmergencyVenueScore[] {
  const emergencyNeeds: Record<string, EmergencyNeed> = {
    nursing: {
      type: 'nursing_room',
      urgency: 'critical',
      timeAvailable: 15,
      preferredDistance: 2,
      familySize: 1,
      childAges: [0, 2],
    },
    bathroom: {
      type: 'bathroom',
      urgency: 'high',
      timeAvailable: 10,
      preferredDistance: 1,
      familySize: 1,
      childAges: [2, 8],
    },
    medical: {
      type: 'medical',
      urgency: 'critical',
      timeAvailable: 20,
      preferredDistance: 3,
      familySize: 1,
      childAges: [0, 18],
    },
    shelter: {
      type: 'shelter_rain',
      urgency: 'high',
      timeAvailable: 30,
      preferredDistance: 2,
      familySize: 2,
      childAges: [3, 12],
    },
    meal: {
      type: 'meal',
      urgency: 'medium',
      timeAvailable: 45,
      preferredDistance: 2,
      familySize: 3,
      childAges: [5, 12],
    },
  };

  const need = emergencyNeeds[emergencyType.toLowerCase()] || {
    type: 'activity' as const,
    urgency: 'medium',
    timeAvailable: 60,
    preferredDistance: 5,
    familySize: 2,
    childAges: [3, 12],
  };

  return findEmergencyVenue(locations, need, userLat, userLng);
}
