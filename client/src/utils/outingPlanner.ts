// Outing Planner Utility - Suggests complete family outing itineraries
import type { Location } from '../types';

export interface FamilyProfile {
  childrenAges: number[];
  specialNeeds?: string[];
  interests: string[];
  budget: number; // in currency units
  maxTravelTime: number; // in minutes
  duration: number; // total outing duration in hours
}

export interface OutingPlan {
  id: string;
  name: string;
  locations: PlanLocation[];
  totalCost: number;
  totalTravelTime: number;
  totalDuration: number;
  estimatedStartTime: string;
  estimatedEndTime: string;
  highlights: string[];
  ageRecommendation: string;
  crowdnessLevel: 'low' | 'medium' | 'high';
  weatherConsiderations: string[];
  bestTimeToGo: string;
}

export interface PlanLocation {
  location: Location;
  estimatedStayTime: number; // in minutes
  estimatedCost: number;
  travelTimeFromPrevious: number; // in minutes
  highlights: string[];
  ageMatch: number; // 0-100, how well this location matches the family's children ages
  accessibilityScore: number; // 0-100
  recommendationReason: string;
}

const AVERAGE_WALKING_SPEED = 1.4; // km/min
const TRAVEL_BUFFER = 5; // minutes buffer for each location transition

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate age match score for a location based on children's ages
 */
function calculateAgeMatch(location: Location, childrenAges: number[]): number {
  if (!location.ageRange || childrenAges.length === 0) {
    return 50; // neutral if no age data
  }

  let totalMatch = 0;
  const minAge = location.ageRange.minAge ?? 0;
  const maxAge = location.ageRange.maxAge ?? 100;

  for (const childAge of childrenAges) {
    if (childAge >= minAge && childAge <= maxAge) {
      totalMatch += 100;
    } else {
      totalMatch += 50; // partial match if age is outside range
    }
  }

  return Math.round(totalMatch / childrenAges.length);
}

/**
 * Calculate accessibility score based on facilities
 */
function calculateAccessibilityScore(location: Location): number {
  const accessibleFacilities = [
    'stroller_accessible',
    'changing_table',
    'nursing_room',
    'family_bathroom',
    'wheelchair_accessible',
    'elevator',
  ];

  if (!location.facilities) {
    return 50;
  }

  const matchedFacilities = location.facilities.filter((f) =>
    accessibleFacilities.some((af) => f.includes(af))
  );

  return Math.min(100, Math.round((matchedFacilities.length / accessibleFacilities.length) * 100));
}

/**
 * Estimate stay time at a location based on age groups and type
 */
function estimateStayTime(location: Location, childrenAges: number[]): number {
  // Base stay time for different categories
  const baseTime: Record<string, number> = {
    park: 60,
    playground: 75,
    museum: 90,
    restaurant: 45,
    zoo: 120,
    aquarium: 100,
    amusement_park: 150,
    cinema: 120,
    library: 45,
    shopping_mall: 90,
    nursing_room: 15,
    medical: 30,
    default: 60,
  };

  const category = (location.category as keyof typeof baseTime) || 'default';
  let time = baseTime[category] || baseTime.default;

  // Adjust based on youngest child's age
  if (childrenAges.length > 0) {
    const youngestAge = Math.min(...childrenAges);
    if (youngestAge < 3) {
      time = Math.round(time * 0.7); // toddlers need shorter activities
    } else if (youngestAge > 10) {
      time = Math.round(time * 1.1); // older kids can stay longer
    }
  }

  return Math.max(15, time); // minimum 15 minutes
}

/**
 * Estimate cost for a location
 */
function estimateCost(location: Location, familySize: number): number {
  // Default pricing estimates
  const basePrice: Record<string, number> = {
    park: 0,
    playground: 0,
    museum: 20,
    restaurant: 15,
    zoo: 25,
    aquarium: 30,
    amusement_park: 40,
    cinema: 12,
    library: 0,
    shopping_mall: 5,
    nursing_room: 0,
    medical: 0,
    default: 10,
  };

  const category = (location.category as keyof typeof basePrice) || 'default';
  const unitPrice = basePrice[category] || basePrice.default;

  return Math.round(unitPrice * familySize);
}

/**
 * Check if a location fits accessibility needs
 */
function meetsAccessibilityNeeds(location: Location, specialNeeds?: string[]): boolean {
  if (!specialNeeds || specialNeeds.length === 0) {
    return true;
  }

  const facilities = location.facilities || [];
  return specialNeeds.some((need) =>
    facilities.some((f) => f.toLowerCase().includes(need.toLowerCase()))
  );
}

/**
 * Generate a recommendation reason for a location
 */
function generateRecommendationReason(
  location: Location,
  ageMatch: number,
  accessibility: number,
  interests: string[]
): string {
  const reasons: string[] = [];

  if (ageMatch > 75) {
    reasons.push('Perfect age match');
  } else if (ageMatch > 50) {
    reasons.push('Good for your children');
  }

  if (accessibility > 75) {
    reasons.push('Excellent accessibility');
  }

  const locationName =
    typeof location.name === 'string' ? location.name : location.name.en || location.name.zh;

  if (
    interests.some((i) =>
      location.category.toLowerCase().includes(i.toLowerCase()) ||
      locationName.toLowerCase().includes(i.toLowerCase())
    )
  ) {
    reasons.push('Matches family interests');
  }

  if (location.averageRating && location.averageRating > 4.0) {
    reasons.push('Highly rated');
  }

  return reasons.join(' • ') || 'Popular family destination';
}

/**
 * Suggest locations for an outing plan
 */
function suggestLocations(
  allLocations: Location[],
  profile: FamilyProfile,
  userLocation?: { lat: number; lng: number }
): PlanLocation[] {
  // Filter by accessibility needs
  const accessibleLocations = allLocations.filter((loc) =>
    meetsAccessibilityNeeds(loc, profile.specialNeeds)
  );

  // Score and sort locations
  const scoredLocations = accessibleLocations.map((location) => {
    const ageMatch = calculateAgeMatch(location, profile.childrenAges);
    const accessibility = calculateAccessibilityScore(location);
    const cost = estimateCost(location, profile.childrenAges.length + 2); // +2 for parents
    const stayTime = estimateStayTime(location, profile.childrenAges);

    // Calculate composite score (0-100)
    const distancePenalty = userLocation
      ? Math.min(50, calculateDistance(userLocation.lat, userLocation.lng, location.coordinates.lat, location.coordinates.lng) * 5)
      : 0;

    const costPenalty = Math.min(30, (cost / (profile.budget / 5)) * 30);
    const compositeScore = ageMatch * 0.35 + accessibility * 0.25 + (100 - costPenalty) * 0.2 + (100 - distancePenalty) * 0.2;

    return {
      location,
      ageMatch,
      accessibility,
      cost,
      stayTime,
      compositeScore: Math.round(compositeScore),
      distance: userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, location.coordinates.lat, location.coordinates.lng)
        : 0,
    };
  });

  // Sort by composite score and return top locations
  return scoredLocations
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 5) // Return top 5 suggestions
    .map((scored, index) => {
      const travelTime = scored.distance ? Math.round((scored.distance / AVERAGE_WALKING_SPEED) * 60 + TRAVEL_BUFFER) : 0;

      return {
        location: scored.location,
        estimatedStayTime: scored.stayTime,
        estimatedCost: scored.cost,
        travelTimeFromPrevious: index === 0 ? (userLocation ? travelTime : 0) : travelTime,
        highlights: scored.location.facilities?.slice(0, 3) || [],
        ageMatch: scored.ageMatch,
        accessibilityScore: scored.accessibility,
        recommendationReason: generateRecommendationReason(
          scored.location,
          scored.ageMatch,
          scored.accessibility,
          profile.interests
        ),
      };
    });
}

/**
 * Create a complete outing plan
 */
export function createOutingPlan(
  locations: Location[],
  profile: FamilyProfile,
  userLocation?: { lat: number; lng: number }
): OutingPlan {
  const suggestedLocations = suggestLocations(locations, profile, userLocation);

  // Calculate totals
  let totalCost = 0;
  let totalTravelTime = 0;
  let totalActivityTime = 0;

  suggestedLocations.forEach((loc) => {
    totalCost += loc.estimatedCost;
    totalTravelTime += loc.travelTimeFromPrevious;
    totalActivityTime += loc.estimatedStayTime;
  });

  // Add buffer time between activities
  const bufferTime = (suggestedLocations.length - 1) * 10;
  const totalDuration = totalTravelTime + totalActivityTime + bufferTime;

  // Calculate time slots
  const startDate = new Date();
  startDate.setHours(10, 0, 0); // Default start time 10:00 AM
  const endDate = new Date(startDate.getTime() + totalDuration * 60000);

  // Determine crowd level (mock implementation)
  const crowdnessLevel = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'low' : 'medium') : 'high';

  // Weather considerations
  const weatherConsiderations: string[] = [];
  if (suggestedLocations.some((loc) => loc.location.category === 'park')) {
    weatherConsiderations.push('Check weather forecast for outdoor activities');
  }
  if (totalDuration > 360) {
    weatherConsiderations.push('Plan sun protection and hydration breaks');
  }

  // Best time to visit
  const bestTimes: Record<string, string> = {
    park: 'Early morning or late afternoon',
    museum: 'Weekday mornings for fewer crowds',
    restaurant: 'Off-peak times (11am or 2pm)',
    zoo: 'Opening hours or afternoon',
    playground: 'Weekday mornings',
    default: 'Check location hours',
  };

  const primaryCategory = suggestedLocations[0]?.location.category || 'default';
  const bestTimeToGo = bestTimes[primaryCategory as keyof typeof bestTimes] || bestTimes.default;

  // Age recommendation
  const ageRange = [Math.min(...profile.childrenAges), Math.max(...profile.childrenAges)];
  const ageRecommendation = `Ages ${ageRange[0]}-${ageRange[1]}`;

  return {
    id: `plan-${Date.now()}`,
    name: `Family Outing - ${suggestedLocations.map((l) => l.location.name).join(' → ')}`,
    locations: suggestedLocations,
    totalCost,
    totalTravelTime,
    totalDuration,
    estimatedStartTime: startDate.toLocaleTimeString(),
    estimatedEndTime: endDate.toLocaleTimeString(),
    highlights: suggestedLocations.flatMap((loc) => loc.highlights),
    ageRecommendation,
    crowdnessLevel: crowdnessLevel as 'low' | 'medium' | 'high',
    weatherConsiderations,
    bestTimeToGo,
  };
}

/**
 * Optimize outing plan for time constraints
 */
export function optimizeOutingForTime(
  plan: OutingPlan,
  maxDuration: number
): OutingPlan {
  if (plan.totalDuration <= maxDuration) {
    return plan;
  }

  // Remove lowest-scoring locations
  const optimized = {
    ...plan,
    locations: plan.locations.slice(0, Math.max(1, Math.ceil(plan.locations.length * (maxDuration / plan.totalDuration)))),
  };

  // Recalculate totals
  let totalCost = 0;
  let totalTravelTime = 0;
  let totalActivityTime = 0;

  optimized.locations.forEach((loc) => {
    totalCost += loc.estimatedCost;
    totalTravelTime += loc.travelTimeFromPrevious;
    totalActivityTime += loc.estimatedStayTime;
  });

  const newDuration = totalTravelTime + totalActivityTime;
  const endDate = new Date();
  endDate.setHours(10, 0, 0);
  endDate.setTime(endDate.getTime() + newDuration * 60000);

  return {
    ...optimized,
    totalCost,
    totalTravelTime,
    totalDuration: newDuration,
    estimatedEndTime: endDate.toLocaleTimeString(),
  };
}

/**
 * Optimize outing plan for budget constraints
 */
export function optimizeOutingForBudget(
  plan: OutingPlan,
  maxBudget: number
): OutingPlan {
  if (plan.totalCost <= maxBudget) {
    return plan;
  }

  // Remove most expensive locations
  const sorted = [...plan.locations].sort((a, b) => a.estimatedCost - b.estimatedCost);

  let currentCost = 0;
  const optimized = sorted.filter((loc) => {
    if (currentCost + loc.estimatedCost <= maxBudget) {
      currentCost += loc.estimatedCost;
      return true;
    }
    return false;
  });

  if (optimized.length === 0) {
    // Keep at least the first location
    optimized.push(sorted[0]);
  }

  return {
    ...plan,
    locations: optimized,
    totalCost: currentCost,
  };
}
