import type { Location } from '../types';

export interface TravelTime {
  from: string;
  to: string;
  duration: number; // minutes
  distance: number; // km
}

export interface VenueStop {
  location: Location;
  arrivalTime: Date;
  departureTime: Date;
  visitDuration: number; // minutes
  order: number;
}

export interface OptimizedTrip {
  stops: VenueStop[];
  totalTravelTime: number; // minutes
  totalVisitTime: number; // minutes
  totalTime: number; // minutes
  totalDistance: number; // km
  estimatedCost: number;
  bestTimeToStart: Date;
  recommendations: string[];
  routeEfficiency: number; // 0-100, higher is better
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate travel time based on distance (assuming average city travel speed)
function estimateTravelTime(distanceKm: number): number {
  // Assume average speed of 20 km/h in city (accounting for traffic, walking, transit)
  // Plus 10 minutes overhead for each trip (finding parking, navigation, etc.)
  return Math.ceil((distanceKm / 20) * 60 + 10);
}

// Nearest neighbor algorithm for basic route optimization
function optimizeRoute(locations: Location[]): Location[] {
  if (locations.length <= 1) return locations;

  const unvisited = [...locations];
  const route: Location[] = [];

  // Start from first location
  const start = unvisited.shift()!;
  route.push(start);

  while (unvisited.length > 0) {
    const current = route[route.length - 1];
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.coordinates.lat,
        current.coordinates.lng,
        unvisited[i].coordinates.lat,
        unvisited[i].coordinates.lng
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const next = unvisited.splice(nearestIndex, 1)[0];
    route.push(next);
  }

  return route;
}

// Calculate travel times between consecutive venues
function calculateTravelTimes(locations: Location[]): number[] {
  const times: number[] = [];
  for (let i = 0; i < locations.length - 1; i++) {
    const distance = calculateDistance(
      locations[i].coordinates.lat,
      locations[i].coordinates.lng,
      locations[i + 1].coordinates.lat,
      locations[i + 1].coordinates.lng
    );
    times.push(estimateTravelTime(distance));
  }
  return times;
}

// Estimate typical visit duration based on category
function estimateVisitDuration(location: Location): number {
  const categoryDurations: Record<string, number> = {
    park: 90,
    nursing_room: 30,
    restaurant: 60,
    medical: 45,
    playground: 120,
    water_park: 180,
    museum: 120,
    attraction: 120,
    shopping: 90,
  };
  return categoryDurations[location.category] || 60;
}

export function optimizeMultiVenueTrip(
  locations: Location[],
  startTime: Date = new Date(),
  familySize: number = 1,
  childAges: number[] = []
): OptimizedTrip {
  if (locations.length === 0) {
    return {
      stops: [],
      totalTravelTime: 0,
      totalVisitTime: 0,
      totalTime: 0,
      totalDistance: 0,
      estimatedCost: 0,
      bestTimeToStart: startTime,
      recommendations: ['No venues selected'],
      routeEfficiency: 0,
    };
  }

  // Optimize route
  const optimizedLocations = optimizeRoute(locations);

  // Calculate distances and travel times
  let totalDistance = 0;
  const travelTimes = calculateTravelTimes(optimizedLocations);
  const totalTravelTime = travelTimes.reduce((sum, time) => sum + time, 0);

  // Calculate total distance
  for (let i = 0; i < optimizedLocations.length - 1; i++) {
    const distance = calculateDistance(
      optimizedLocations[i].coordinates.lat,
      optimizedLocations[i].coordinates.lng,
      optimizedLocations[i + 1].coordinates.lat,
      optimizedLocations[i + 1].coordinates.lng
    );
    totalDistance += distance;
  }

  // Create stops with estimated timing
  const stops: VenueStop[] = [];
  let currentTime = new Date(startTime);

  for (let i = 0; i < optimizedLocations.length; i++) {
    const location = optimizedLocations[i];
    const visitDuration = estimateVisitDuration(location);

    const arrivalTime = new Date(currentTime);
    const departureTime = new Date(arrivalTime.getTime() + visitDuration * 60000);

    stops.push({
      location,
      arrivalTime,
      departureTime,
      visitDuration,
      order: i + 1,
    });

    // Add travel time to next venue (if not last)
    if (i < optimizedLocations.length - 1) {
      currentTime = new Date(
        departureTime.getTime() + travelTimes[i] * 60000
      );
    }
  }

  // Calculate total visit time
  const totalVisitTime = stops.reduce((sum, stop) => sum + stop.visitDuration, 0);
  const totalTime = totalTravelTime + totalVisitTime;

  // Estimate cost (simplified: assume ~10-15 per person per venue)
  const baseCostPerVenue = 12;
  const estimatedCost = locations.length * baseCostPerVenue * familySize;

  // Generate route efficiency score (0-100)
  // Better efficiency = less travel time relative to visit time
  const routeEfficiency = Math.min(100, Math.round((totalVisitTime / (totalVisitTime + totalTravelTime)) * 100));

  // Generate recommendations
  const recommendations: string[] = [];

  if (totalTime > 480) {
    // More than 8 hours
    recommendations.push('This is a full-day trip - consider planning it for a weekend or special occasion');
  } else if (totalTime > 300) {
    // More than 5 hours
    recommendations.push('This is a substantial half-day to full-day trip');
  }

  if (childAges.length > 0) {
    const hasToddlers = childAges.some(age => age < 3);
    if (hasToddlers && totalTime > 240) {
      recommendations.push('Consider nap time when scheduling (typically 1-3 PM) for toddlers');
    }

    const hasTeens = childAges.some(age => age >= 13);
    if (hasTeens && locations.length > 4) {
      recommendations.push('Teens might prefer fewer but longer venue visits');
    }
  }

  if (totalDistance > 20) {
    recommendations.push(`Total travel distance is ${totalDistance.toFixed(1)} km - plan for transit time and vehicle availability`);
  }

  if (routeEfficiency < 40) {
    recommendations.push('Consider reducing the number of venues or adjusting the order to minimize travel time');
  }

  // Check venue compatibility with family composition
  const hasNursingRooms = locations.some(l => l.category === 'nursing_room');
  const hasToddlers = childAges.some(age => age < 3);
  if (hasToddlers || childAges.some(age => age < 5)) {
    if (!hasNursingRooms) {
      recommendations.push('No nursing rooms in itinerary - ensure venues have baby facilities if needed');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('This is a well-planned itinerary!');
  }

  return {
    stops,
    totalTravelTime,
    totalVisitTime,
    totalTime,
    totalDistance,
    estimatedCost,
    bestTimeToStart: startTime,
    recommendations,
    routeEfficiency,
  };
}

// Calculate best time to start based on venue operating hours
export function suggestOptimalStartTime(
  locations: Location[],
  preferredStartTime: Date = new Date()
): Date {
  if (locations.length === 0) return preferredStartTime;

  // Get the earliest opening time from all venues
  const earliestTime = new Date(preferredStartTime);
  earliestTime.setHours(9, 0, 0, 0); // Default to 9 AM if no opening hours

  // For demonstration, suggest starting 30 minutes before first venue's typical opening
  // In production, would check actual operating hours from location data
  const suggestionTime = new Date(earliestTime);
  suggestionTime.setMinutes(suggestionTime.getMinutes() - 30);

  return suggestionTime;
}

// Format trip summary for display
export function formatTripSummary(trip: OptimizedTrip): string {
  if (trip.stops.length === 0) return 'No venues in trip';

  const hours = Math.floor(trip.totalTime / 60);
  const minutes = trip.totalTime % 60;
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    `${trip.stops.length} venues | ${timeStr} total | ` +
    `${trip.totalDistance.toFixed(1)} km | $${trip.estimatedCost}`
  );
}

// Export trip as shareable URL-friendly format
export function encodeTrip(trip: OptimizedTrip): string {
  try {
    const data = {
      stops: trip.stops.map(s => ({
        id: s.location.id,
        order: s.order,
      })),
      startTime: trip.bestTimeToStart.toISOString(),
    };
    return btoa(JSON.stringify(data));
  } catch {
    return '';
  }
}

// Import trip from encoded format
export function decodeTrip(encoded: string): { stopIds: string[]; startTime: Date } | null {
  try {
    const data = JSON.parse(atob(encoded));
    return {
      stopIds: data.stops.map((s: { id: string }) => s.id),
      startTime: new Date(data.startTime),
    };
  } catch {
    return null;
  }
}
