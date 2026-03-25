/**
 * FamMap Family Recommendation Engine
 *
 * Provides intelligent, personalized venue recommendations based on:
 * - Family profile (children's ages, interests)
 * - User search and interaction history
 * - Venue characteristics and quality metrics
 * - Community feedback and ratings
 * - Seasonal factors and current trends
 *
 * This system helps families discover the best venues that match their
 * specific needs and preferences.
 */

// Type definitions
export interface FamilyProfile {
  childrenAges: number[];
  interests: string[];
  accessibilityNeeds: string[];
  dietaryRestrictions: string[];
  budgetLevel: 'budget' | 'moderate' | 'premium';
  preferredDistance: number; // km
}

export interface VenueCharacteristics {
  id: string;
  name: {
    zh: string;
    en: string;
  };
  category: string;
  ageRange: {
    min: number;
    max: number;
  };
  averageRating: number;
  reviewCount: number;
  facilities: string[];
  crowdiness: number; // 0-100
  price: number;
  distance: number; // km from user
  trending: number; // -1 to 1
  seasonalityFactor: number; // 0-1
}

export interface LocationWithReviews extends VenueCharacteristics {
  reviews?: Array<{
    rating: number;
    comment: string;
    tags: string[];
  }>;
}

export interface RecommendationResult {
  venueId: string;
  venueName: {
    zh: string;
    en: string;
  };
  score: number; // 0-100
  reasons: {
    zh: string[];
    en: string[];
  };
  matchFactors: {
    ageCompatibility: number;
    interestMatch: number;
    accessibilityMatch: number;
    budgetMatch: number;
    populityScore: number;
    trendingBoost: number;
    seasonalityBoost: number;
  };
  confidence: number; // 0-100
}

export interface UserInteractionHistory {
  searchTerms: string[];
  viewedLocations: string[];
  favoriteLocations: string[];
  previousVisits: {
    venueId: string;
    rating: number;
    timestamp: number;
  }[];
}

/**
 * Calculate age compatibility score between family and venue
 */
export function calculateAgeCompatibility(
  childrenAges: number[],
  venueAgeRange: { min: number; max: number }
): number {
  if (childrenAges.length === 0) return 50; // Neutral score

  const compatibleChildren = childrenAges.filter(
    age => age >= venueAgeRange.min && age <= venueAgeRange.max
  );

  const compatibilityRatio = compatibleChildren.length / childrenAges.length;
  return Math.round(compatibilityRatio * 100);
}

/**
 * Calculate interest match score based on venue category and family interests
 */
export function calculateInterestMatch(
  familyInterests: string[],
  venueCategory: string,
  facilityKeywords: string[]
): number {
  if (familyInterests.length === 0) return 50;

  const allVenueKeywords = [venueCategory, ...facilityKeywords].map(k =>
    k.toLowerCase()
  );

  const matchingInterests = familyInterests.filter(interest =>
    allVenueKeywords.some(keyword =>
      keyword.includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(keyword)
    )
  );

  return Math.round((matchingInterests.length / familyInterests.length) * 100);
}

/**
 * Calculate accessibility match score
 */
export function calculateAccessibilityMatch(
  accessibilityNeeds: string[],
  venueFacilities: string[]
): number {
  if (accessibilityNeeds.length === 0) return 100; // No needs = full match

  const venueFacilitiesLower = venueFacilities.map(f => f.toLowerCase());

  const matchingFacilities = accessibilityNeeds.filter(need =>
    venueFacilitiesLower.some(facility =>
      facility.includes(need.toLowerCase()) ||
      need.toLowerCase().includes(facility)
    )
  );

  const fulfillmentRatio = matchingFacilities.length / accessibilityNeeds.length;
  return Math.round(fulfillmentRatio * 100);
}

/**
 * Calculate budget match score
 */
export function calculateBudgetMatch(
  budgetLevel: 'budget' | 'moderate' | 'premium',
  venuePrice: number
): number {
  // Assume budget tiers: budget < 500, moderate 500-1500, premium > 1500
  const budgetRanges = {
    budget: { min: 0, max: 500, optimalMax: 300 },
    moderate: { min: 200, max: 1500, optimalMin: 500 },
    premium: { min: 1000, max: Infinity, optimalMin: 1500 },
  };

  const range = budgetRanges[budgetLevel];

  if (venuePrice >= range.min && venuePrice <= range.max) {
    // Within range
    const optimalMax = (range as { optimalMax?: number }).optimalMax;
    const optimalMin = (range as { optimalMin?: number }).optimalMin;
    if ((optimalMax && venuePrice <= optimalMax) || (optimalMin && venuePrice >= optimalMin)) {
      return 100;
    }
    return 80;
  } else if (venuePrice < range.min) {
    return Math.max(0, 60 + ((range.min - venuePrice) / range.min) * 40);
  } else {
    return Math.max(0, 60 - ((venuePrice - range.max) / range.max) * 40);
  }
}

/**
 * Calculate quality/popularity score based on ratings
 */
export function calculatePopularityScore(
  averageRating: number,
  reviewCount: number
): number {
  // Weighted combination of rating and review count
  const ratingScore = (averageRating / 5) * 100;
  const reviewScore = Math.min((reviewCount / 100) * 100, 100); // Cap at 100

  return Math.round(ratingScore * 0.7 + reviewScore * 0.3);
}

/**
 * Calculate trending boost based on trend and review sentiment
 */
export function calculateTrendingBoost(
  trending: number, // -1 to 1
  reviewCount: number
): number {
  if (reviewCount < 5) return 0; // Not enough data

  const trendBoost = Math.max(0, trending * 30); // Max 30 points from trend
  const momentumBoost = Math.min(20, (reviewCount / 100) * 20); // Max 20 points from momentum

  return Math.round(trendBoost + momentumBoost);
}

/**
 * Calculate seasonal boost based on current season
 */
export function calculateSeasonalityBoost(
  seasonalityFactor: number // 0-1
): number {
  return Math.round(seasonalityFactor * 25); // Max 25 points
}

/**
 * Generate recommendation reasons in multiple languages
 */
export function generateRecommendationReasons(
  matchFactors: RecommendationResult['matchFactors'],
  _venue: VenueCharacteristics,
  _language: 'zh' | 'en' = 'en'
): { zh: string[]; en: string[] } {
  const reasonsZh: string[] = [];
  const reasonsEn: string[] = [];

  // Age compatibility
  if (matchFactors.ageCompatibility >= 80) {
    reasonsZh.push('非常適合您孩子的年齡');
    reasonsEn.push('Perfect age match for your children');
  } else if (matchFactors.ageCompatibility >= 60) {
    reasonsZh.push('適合您孩子的年齡');
    reasonsEn.push('Good age match for your children');
  }

  // Interest match
  if (matchFactors.interestMatch >= 80) {
    reasonsZh.push('與您的興趣完全相符');
    reasonsEn.push('Perfectly matches your interests');
  } else if (matchFactors.interestMatch >= 60) {
    reasonsZh.push('符合您的興趣');
    reasonsEn.push('Matches your interests');
  }

  // Accessibility
  if (matchFactors.accessibilityMatch === 100) {
    reasonsZh.push('提供所有需要的設施');
    reasonsEn.push('Has all accessibility features you need');
  } else if (matchFactors.accessibilityMatch >= 70) {
    reasonsZh.push('提供大多數您需要的設施');
    reasonsEn.push('Has most accessibility features');
  }

  // Budget
  if (matchFactors.budgetMatch >= 90) {
    reasonsZh.push('符合您的預算');
    reasonsEn.push('Within your preferred budget');
  }

  // Popularity/Quality
  if (matchFactors.populityScore >= 85) {
    reasonsZh.push('家長高度評價');
    reasonsEn.push('Highly rated by families');
  } else if (matchFactors.populityScore >= 70) {
    reasonsZh.push('受好評');
    reasonsEn.push('Well-reviewed');
  }

  // Trending
  if (matchFactors.trendingBoost > 15) {
    reasonsZh.push('目前很受歡迎');
    reasonsEn.push('Trending now');
  }

  // Seasonal
  if (matchFactors.seasonalityBoost > 15) {
    reasonsZh.push('目前季節的最佳時間');
    reasonsEn.push('Perfect for this season');
  }

  // Fallback
  if (reasonsZh.length === 0) {
    reasonsZh.push('很好的選擇');
    reasonsEn.push('A great choice');
  }

  return {
    zh: reasonsZh,
    en: reasonsEn,
  };
}

/**
 * Score a single venue for a family
 */
export function scoreVenueForFamily(
  venue: VenueCharacteristics,
  familyProfile: FamilyProfile
): RecommendationResult['matchFactors'] {
  const ageCompatibility = calculateAgeCompatibility(
    familyProfile.childrenAges,
    venue.ageRange
  );

  const interestMatch = calculateInterestMatch(
    familyProfile.interests,
    venue.category,
    venue.facilities
  );

  const accessibilityMatch = calculateAccessibilityMatch(
    familyProfile.accessibilityNeeds,
    venue.facilities
  );

  const budgetMatch = calculateBudgetMatch(
    familyProfile.budgetLevel,
    venue.price
  );

  const populityScore = calculatePopularityScore(
    venue.averageRating,
    venue.reviewCount
  );

  const trendingBoost = calculateTrendingBoost(venue.trending, venue.reviewCount);

  const seasonalityBoost = calculateSeasonalityBoost(venue.seasonalityFactor);

  return {
    ageCompatibility,
    interestMatch,
    accessibilityMatch,
    budgetMatch,
    populityScore,
    trendingBoost,
    seasonalityBoost,
  };
}

/**
 * Calculate overall recommendation score (0-100)
 */
export function calculateRecommendationScore(
  matchFactors: RecommendationResult['matchFactors']
): number {
  const {
    ageCompatibility,
    interestMatch,
    accessibilityMatch,
    budgetMatch,
    populityScore,
    trendingBoost,
    seasonalityBoost,
  } = matchFactors;

  // Weighted formula: quality and accessibility are most important
  const baseScore =
    ageCompatibility * 0.25 + // Core requirement
    populityScore * 0.25 + // Quality/popularity
    interestMatch * 0.2 + // User interests
    accessibilityMatch * 0.15 + // Accessibility
    budgetMatch * 0.1; // Budget

  // Add boosts for trending and seasonal
  const boostedScore = Math.min(
    100,
    baseScore + (trendingBoost + seasonalityBoost) / 2
  );

  return Math.round(boostedScore);
}

/**
 * Calculate confidence score based on data quality
 */
export function calculateConfidenceScore(
  reviewCount: number,
  distanceRelevance: number, // 0-1
  dataCompleteness: number // 0-1 (how complete venue data is)
): number {
  const reviewConfidence = Math.min(reviewCount / 50, 1) * 40; // Up to 40 points
  const distanceConfidence = distanceRelevance * 30; // Up to 30 points
  const dataConfidence = dataCompleteness * 30; // Up to 30 points

  return Math.round(reviewConfidence + distanceConfidence + dataConfidence);
}

/**
 * Get top recommendations for a family
 */
export function getTopRecommendations(
  venues: LocationWithReviews[],
  familyProfile: FamilyProfile,
  userHistory: UserInteractionHistory,
  limit: number = 5,
  _language: 'zh' | 'en' = 'en'
): RecommendationResult[] {
  const recommendations = venues
    .map(venue => {
      const matchFactors = scoreVenueForFamily(venue, familyProfile);
      const score = calculateRecommendationScore(matchFactors);

      // Apply boost for previously viewed/favorited
      const viewBoost =
        userHistory.viewedLocations.includes(venue.id) ? 5 : 0;
      const favBoost = userHistory.favoriteLocations.includes(venue.id) ? 10 : 0;
      const finalScore = Math.min(100, score + viewBoost + favBoost);

      // Calculate confidence based on review count and data
      const distanceRelevance =
        1 - Math.min(venue.distance / familyProfile.preferredDistance, 1);
      const dataCompleteness = Math.min(venue.facilities.length / 15, 1);
      const confidence = calculateConfidenceScore(
        venue.reviewCount,
        distanceRelevance,
        dataCompleteness
      );

      return {
        venueId: venue.id,
        venueName: venue.name,
        score: finalScore,
        reasons: generateRecommendationReasons(matchFactors, venue, 'en'),
        matchFactors,
        confidence,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recommendations;
}

/**
 * Find similar families based on favorite locations
 */
export function findSimilarFamilyVenues(
  userHistory: UserInteractionHistory,
  allLocations: LocationWithReviews[]
): LocationWithReviews[] {
  const favoriteVenueIds = new Set(userHistory.favoriteLocations);
  const favoriteVenues = allLocations.filter(loc =>
    favoriteVenueIds.has(loc.id)
  );

  if (favoriteVenues.length === 0) return [];

  // Get categories and characteristics from favorite venues
  const favoriteCategories = new Set(favoriteVenues.map(v => v.category));
  const averageFacilities = favoriteVenues.reduce(
    (acc, v) => {
      v.facilities.forEach(f => {
        acc[f] = (acc[f] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // Find venues with similar characteristics but not yet visited
  const viewedVenueIds = new Set(userHistory.viewedLocations);

  return allLocations
    .filter(
      loc =>
        !viewedVenueIds.has(loc.id) &&
        (favoriteCategories.has(loc.category) ||
          loc.facilities.some(f => averageFacilities[f]))
    )
    .sort((a, b) => {
      const aFacilityMatch = a.facilities.filter(
        f => averageFacilities[f]
      ).length;
      const bFacilityMatch = b.facilities.filter(
        f => averageFacilities[f]
      ).length;
      return bFacilityMatch - aFacilityMatch;
    })
    .slice(0, 5);
}

/**
 * Get personalized recommendations for a family
 */
export function getPersonalizedRecommendations(
  venues: LocationWithReviews[],
  familyProfile: FamilyProfile,
  userHistory: UserInteractionHistory,
  options: {
    limit?: number;
    language?: 'zh' | 'en';
    includeNewVenues?: boolean;
    boostTrending?: boolean;
  } = {}
): {
  topRecommendations: RecommendationResult[];
  similarVenues: LocationWithReviews[];
  newVenues: LocationWithReviews[];
} {
  const {
    limit = 5,
    language = 'en',
    boostTrending = true,
  } = options;

  // Get top recommendations
  const topRecommendations = getTopRecommendations(
    venues,
    familyProfile,
    userHistory,
    limit,
    language
  );

  // Find similar venues based on favorites
  const similarVenues = findSimilarFamilyVenues(userHistory, venues).slice(0, 3);

  // Find new high-quality venues
  const newVenues = venues
    .filter(v => !userHistory.viewedLocations.includes(v.id))
    .filter(v => v.averageRating >= 4.0)
    .sort((a, b) => {
      if (boostTrending) {
        return b.trending - a.trending || b.averageRating - a.averageRating;
      }
      return b.averageRating - a.averageRating;
    })
    .slice(0, 3);

  return {
    topRecommendations,
    similarVenues,
    newVenues,
  };
}

/**
 * Analyze recommendation quality for venue operators
 */
export function analyzeRecommendationQuality(
  venueId: string,
  recommendations: RecommendationResult[]
): {
  recommendationRate: number;
  averageScore: number;
  averageConfidence: number;
  topReasons: string[];
} {
  const venueRecommendations = recommendations.filter(
    r => r.venueId === venueId
  );

  if (venueRecommendations.length === 0) {
    return {
      recommendationRate: 0,
      averageScore: 0,
      averageConfidence: 0,
      topReasons: [],
    };
  }

  const recommendationRate = venueRecommendations.length / recommendations.length;
  const averageScore =
    venueRecommendations.reduce((acc, r) => acc + r.score, 0) /
    venueRecommendations.length;
  const averageConfidence =
    venueRecommendations.reduce((acc, r) => acc + r.confidence, 0) /
    venueRecommendations.length;

  // Get top reasons
  const reasonCounts = new Map<string, number>();
  venueRecommendations.forEach(r => {
    r.reasons.en.forEach(reason => {
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    });
  });

  const topReasons = Array.from(reasonCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason]) => reason);

  return {
    recommendationRate: Math.round(recommendationRate * 100) / 100,
    averageScore: Math.round(averageScore * 100) / 100,
    averageConfidence: Math.round(averageConfidence),
    topReasons,
  };
}
