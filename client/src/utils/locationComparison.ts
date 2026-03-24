import type { Location } from '../types';

export interface ComparisonMetric {
  category: string;
  locations: Record<string, string | number | boolean | null>;
  weight: number; // For weighted scoring
}

export interface LocationComparisonScore {
  locationId: string;
  locationName: string;
  score: number;
  breakdown: Record<string, number>;
}

export const extractComparisonMetrics = (locations: Location[]): ComparisonMetric[] => {
  const metrics: ComparisonMetric[] = [];

  // Basic Info Metrics
  if (locations.some(l => l.category)) {
    metrics.push({
      category: 'Category',
      locations: locations.reduce((acc, l) => ({ ...acc, [l.id]: l.category }), {}),
      weight: 1
    });
  }

  // Facilities Metrics
  if (locations.some(l => l.facilities && l.facilities.length > 0)) {
    metrics.push({
      category: 'Available Facilities',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: (l.facilities || []).join(', ') || 'None'
      }), {}),
      weight: 2
    });
  }

  // Rating Metrics
  if (locations.some(l => l.averageRating)) {
    metrics.push({
      category: 'Average Rating',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: l.averageRating ? l.averageRating.toFixed(1) : 'N/A'
      }), {}),
      weight: 2
    });
  }

  // Address (for reference)
  if (locations.some(l => l.address)) {
    metrics.push({
      category: 'Address',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: (l.address?.en || l.address?.zh) || 'N/A'
      }), {}),
      weight: 1
    });
  }

  // Phone (for reference)
  if (locations.some(l => l.phoneNumber)) {
    metrics.push({
      category: 'Phone Number',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: l.phoneNumber || 'N/A'
      }), {}),
      weight: 1
    });
  }

  // Stroller Accessibility
  if (locations.some(l => l.stroller)) {
    metrics.push({
      category: 'Stroller Accessible',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: l.stroller?.strollerFriendly ? 'Yes' : 'No'
      }), {}),
      weight: 2
    });
  }

  // Nursing Room
  if (locations.some(l => l.nursingRoom)) {
    metrics.push({
      category: 'Nursing Room',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: l.nursingRoom?.hasDedicatedNursingRoom ? 'Yes' : 'No'
      }), {}),
      weight: 2
    });
  }

  // Operating Hours
  if (locations.some(l => l.operatingHours)) {
    metrics.push({
      category: 'Hours',
      locations: locations.reduce((acc, l) => {
        const oh = l.operatingHours;
        const monHours = oh?.monday ? `${oh.monday}` : 'N/A';
        return { ...acc, [l.id]: monHours };
      }, {}),
      weight: 1
    });
  }

  // Dining Options
  if (locations.some(l => l.onSiteDining)) {
    metrics.push({
      category: 'Dining',
      locations: locations.reduce((acc, l) => {
        const dining = l.onSiteDining;
        const options = [];
        if (dining?.hasFoodCourt) options.push('Food Court');
        if (dining?.hasCafe) options.push('Cafe');
        if (dining?.hasRestaurant) options.push('Restaurant');
        return { ...acc, [l.id]: options.length > 0 ? options.join(', ') : 'None' };
      }, {}),
      weight: 1
    });
  }

  // Outdoor Food Policy
  if (locations.some(l => l.outsideFood)) {
    metrics.push({
      category: 'Outside Food',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: l.outsideFood?.allowsOutsideFood ? 'Allowed' : 'Not Allowed'
      }), {}),
      weight: 1
    });
  }

  // Payment Methods
  if (locations.some(l => l.payment)) {
    metrics.push({
      category: 'Payment',
      locations: locations.reduce((acc, l) => {
        const payment = l.payment;
        const methods = [];
        if (payment?.acceptsCash) methods.push('Cash');
        if (payment?.acceptsLinePay) methods.push('LINE Pay');
        if (payment?.acceptsCreditCard) methods.push('Credit Card');
        return { ...acc, [l.id]: methods.length > 0 ? methods.join(', ') : 'None' };
      }, {}),
      weight: 1
    });
  }

  // Noise Level
  if (locations.some(l => l.noiseAndSensoryEnvironment)) {
    metrics.push({
      category: 'Noise Level',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: l.noiseAndSensoryEnvironment?.overallNoiseLevel || 'Unknown'
      }), {}),
      weight: 2
    });
  }

  // Age Appropriateness
  if (locations.some(l => l.ageRange)) {
    metrics.push({
      category: 'Age Range',
      locations: locations.reduce((acc, l) => ({
        ...acc,
        [l.id]: l.ageRange ?
          `${l.ageRange.minAge || 0} - ${l.ageRange.maxAge || 18} years` :
          'N/A'
      }), {}),
      weight: 2
    });
  }

  return metrics;
};

export const calculateComparisonScores = (
  locations: Location[],
  userPreferences?: { childAge?: number; budget?: number; stroller?: boolean }
): LocationComparisonScore[] => {
  const scores: LocationComparisonScore[] = [];

  for (const location of locations) {
    let score = 0;
    const breakdown: Record<string, number> = {};

    // Rating score (0-25 points)
    if (location.averageRating !== undefined && location.averageRating !== null) {
      const ratingScore = (location.averageRating / 5) * 25;
      score += ratingScore;
      breakdown['rating'] = ratingScore;
    }

    // Facilities score (0-25 points)
    if (location.facilities) {
      const facilitiesScore = Math.min((location.facilities.length / 10) * 25, 25);
      score += facilitiesScore;
      breakdown['facilities'] = facilitiesScore;
    }

    // User preference matching (0-25 points)
    if (userPreferences?.stroller && location.stroller?.strollerFriendly) {
      score += 10;
      breakdown['stroller_match'] = 10;
    }

    if (userPreferences?.childAge && location.ageRange) {
      const minAge = location.ageRange.minAge || 0;
      const maxAge = location.ageRange.maxAge || 18;
      if (userPreferences.childAge >= minAge && userPreferences.childAge <= maxAge) {
        score += 10;
        breakdown['age_match'] = 10;
      }
    }

    if (location.nursingRoom?.hasDedicatedNursingRoom) {
      score += 5;
      breakdown['nursing_room'] = 5;
    }

    // Noise level score (lower is better for families with sensory sensitivities)
    if (location.noiseAndSensoryEnvironment?.overallNoiseLevel) {
      const noiseScore: Record<string, number> = {
        'very_quiet': 10,
        'quiet': 8,
        'moderate': 5,
        'loud': 2,
        'very_loud': 0
      };
      const points = noiseScore[location.noiseAndSensoryEnvironment.overallNoiseLevel] || 0;
      score += points;
      breakdown['noise_level'] = points;
    }

    // Weather suitability (bonus for covered areas)
    if (location.rainyDayAlternatives?.rainyCoveragePercentage && location.rainyDayAlternatives.rainyCoveragePercentage > 50) {
      score += 5;
      breakdown['weather_protection'] = 5;
    }

    scores.push({
      locationId: location.id,
      locationName: location.name.en || location.name.zh || location.id,
      score: Math.min(score, 100),
      breakdown
    });
  }

  return scores.sort((a, b) => b.score - a.score);
};

export const getComparisonSummary = (locations: Location[]): string[] => {
  const summary: string[] = [];

  if (locations.length === 0) return summary;

  // Most family-friendly (by rating)
  const topRated = locations.reduce((prev, current) =>
    (current.averageRating || 0) > (prev.averageRating || 0) ? current : prev
  );
  if (topRated.averageRating) {
    summary.push(`Highest rated: ${topRated.name.en || topRated.name.zh} (${topRated.averageRating}/5)`);
  }

  // Most facilities
  const mostFacilities = locations.reduce((prev, current) =>
    (current.facilities || []).length > (prev.facilities || []).length ? current : prev
  );
  if ((mostFacilities.facilities || []).length > 0) {
    summary.push(`Most facilities: ${mostFacilities.name.en || mostFacilities.name.zh} (${(mostFacilities.facilities || []).length})`);
  }

  // Best for strollers
  const strollerFriendly = locations.filter(l => l.stroller?.strollerFriendly);
  if (strollerFriendly.length > 0) {
    summary.push(`${strollerFriendly.length}/${locations.length} locations are stroller accessible`);
  }

  // Quietest location
  const quietest = locations.reduce((prev, current) => {
    const currentNoise = current.noiseAndSensoryEnvironment?.overallNoiseLevel || '';
    const prevNoise = prev.noiseAndSensoryEnvironment?.overallNoiseLevel || '';
    const noiseRank: Record<string, number> = { very_quiet: 0, quiet: 1, moderate: 2, loud: 3, very_loud: 4 };
    return (noiseRank[currentNoise] || 5) < (noiseRank[prevNoise] || 5) ? current : prev;
  });
  if (quietest.noiseAndSensoryEnvironment?.overallNoiseLevel) {
    summary.push(`Quietest: ${quietest.name.en || quietest.name.zh}`);
  }

  return summary;
};
