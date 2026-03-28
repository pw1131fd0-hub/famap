/**
 * Family Venue Consensus System
 * Helps families with multiple members find venues that satisfy everyone's preferences
 * through intelligent consensus-building and compromise recommendations.
 */

import type { Location } from '../types';

export interface FamilyMember {
  id: string;
  name: string;
  preferences: {
    categories?: string[];
    maxDistance?: number;
    requiredFacilities?: string[];
    preferredFacilities?: string[];
    childAge?: number;
    healthConditions?: string[];
    budgetRange?: { min: number; max: number };
    weatherPreferences?: { minTemp?: number; maxTemp?: number };
  };
}

export interface VenueCompatibilityScore {
  venueId: string;
  venueName: string;
  overallScore: number; // 0-100
  memberScores: Map<string, number>; // memberId -> score
  consensusLevel: 'strong' | 'moderate' | 'weak' | 'conflicted';
  satisfiedMembers: string[]; // member IDs that are satisfied (>60 score)
  dissatisfiedMembers: string[]; // member IDs that are not satisfied (<40 score)
  compromiseRating: number; // how well it compromises between members
  conflictAreas: string[]; // areas where members disagree
  recommendationReason: string;
}

export interface ConsensusResult {
  topChoices: VenueCompatibilityScore[];
  consensusLevel: 'strong' | 'moderate' | 'weak' | 'conflicted';
  conflictingPreferences: string[];
  recommendations: string[];
  alternativeCompromises: VenueCompatibilityScore[];
  groupSatisfactionRate: number; // percentage of members satisfied with top choice
}

/**
 * Calculate compatibility score for a single member with a venue
 */
export function calculateMemberVenueScore(
  member: FamilyMember,
  venue: Location
): number {
  let score = 100;
  const weights = {
    category: 25,
    facilities: 25,
    distance: 20,
    childAge: 15,
    budget: 10,
    weather: 5,
  };

  // Category match
  if (member.preferences.categories && member.preferences.categories.length > 0) {
    const categoryMatch = member.preferences.categories.some(
      (cat) => venue.category?.toLowerCase() === cat.toLowerCase()
    );
    if (!categoryMatch) {
      score -= weights.category;
    }
  }

  // Facilities match
  if (member.preferences.requiredFacilities && member.preferences.requiredFacilities.length > 0) {
    const venueFacilities = venue.facilities || [];
    const missingRequired = member.preferences.requiredFacilities.filter(
      (f) => !venueFacilities.some((vf) => vf.toLowerCase() === f.toLowerCase())
    );
    if (missingRequired.length > 0) {
      const deduction = (missingRequired.length / member.preferences.requiredFacilities.length) * weights.facilities;
      score -= deduction;
    }
  }

  // Preferred facilities bonus
  if (member.preferences.preferredFacilities && member.preferences.preferredFacilities.length > 0) {
    const venueFacilities = venue.facilities || [];
    const matchedPreferred = member.preferences.preferredFacilities.filter(
      (f) => venueFacilities.some((vf) => vf.toLowerCase() === f.toLowerCase())
    );
    const bonus = (matchedPreferred.length / member.preferences.preferredFacilities.length) * (weights.facilities * 0.3);
    score = Math.min(100, score + bonus);
  }

  // Distance (mock calculation based on coordinates)
  if (member.preferences.maxDistance && venue.coordinates) {
    const estimatedDistance = Math.random() * 5; // Mock distance in km
    if (estimatedDistance > member.preferences.maxDistance) {
      const distanceDeduction = Math.min(weights.distance, (estimatedDistance / member.preferences.maxDistance - 1) * 20);
      score -= distanceDeduction;
    }
  }

  // Child age appropriateness
  if (member.preferences.childAge && venue.ageRange) {
    const { minAge = 0, maxAge = 100 } = venue.ageRange;
    if (member.preferences.childAge < minAge || member.preferences.childAge > maxAge) {
      const ageDifference = Math.abs(member.preferences.childAge - (minAge + maxAge) / 2);
      const ageDeduction = Math.min(weights.childAge, (ageDifference / 10) * weights.childAge);
      score -= ageDeduction;
    }
  }

  // Budget compatibility - mock based on category/rating
  if (member.preferences.budgetRange) {
    // Mock estimation: higher rated venues tend to be more expensive
    const estimatedCost = venue.averageRating * 100; // Simple mock calculation
    const { min, max } = member.preferences.budgetRange;
    if (estimatedCost < min || estimatedCost > max) {
      score -= weights.budget * 0.5;
    }
  }

  // Weather preferences - would use real weather API in production
  // For now, skip as it requires real-time weather data

  return Math.max(0, Math.min(100, score));
}

/**
 * Identify conflicting preferences among family members
 */
export function identifyConflicts(members: FamilyMember[]): string[] {
  const conflicts: string[] = [];

  // Check category conflicts
  const categories = new Map<string, number>();
  members.forEach((member) => {
    member.preferences.categories?.forEach((cat) => {
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });
  });

  if (categories.size > 1) {
    const categoryList = Array.from(categories.keys()).join(', ');
    conflicts.push(`Members prefer different categories: ${categoryList}`);
  }

  // Check budget conflicts
  const budgets = members
    .filter((m) => m.preferences.budgetRange)
    .map((m) => m.preferences.budgetRange!);
  if (budgets.length > 1) {
    const maxMin = Math.max(...budgets.map((b) => b.min));
    const minMax = Math.min(...budgets.map((b) => b.max));
    if (maxMin > minMax) {
      conflicts.push('Members have conflicting budget ranges');
    }
  }

  // Check age range conflicts
  const ageRanges = members
    .filter((m) => m.preferences.childAge)
    .map((m) => m.preferences.childAge!);
  if (ageRanges.length > 1 && Math.max(...ageRanges) - Math.min(...ageRanges) > 5) {
    conflicts.push('Significant age differences may affect venue suitability');
  }

  return conflicts;
}

/**
 * Calculate consensus level between members for a venue
 */
export function calculateConsensusLevel(
  memberScores: Map<string, number>
): 'strong' | 'moderate' | 'weak' | 'conflicted' {
  if (memberScores.size === 0) return 'weak';

  const scores = Array.from(memberScores.values());
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);

  if (average > 75 && standardDeviation < 15) {
    return 'strong';
  } else if (average > 60 && standardDeviation < 25) {
    return 'moderate';
  } else if (average > 40 || standardDeviation < 30) {
    return 'weak';
  } else {
    return 'conflicted';
  }
}

/**
 * Score a venue for the entire family group
 */
export function scoreVenueForGroup(
  members: FamilyMember[],
  venue: Location
): VenueCompatibilityScore {
  const memberScores = new Map<string, number>();
  members.forEach((member) => {
    memberScores.set(member.id, calculateMemberVenueScore(member, venue));
  });

  const scores = Array.from(memberScores.values());
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Calculate compromise rating (penalizes having outliers)
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - overallScore, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const compromiseRating = Math.max(0, 100 - stdDev);

  const consensusLevel = calculateConsensusLevel(memberScores);
  const satisfiedMembers = Array.from(memberScores.entries())
    .filter(([, score]) => score > 60)
    .map(([id]) => id);
  const dissatisfiedMembers = Array.from(memberScores.entries())
    .filter(([, score]) => score < 40)
    .map(([id]) => id);

  const conflictAreas = identifyConflicts(members);

  const recommendationReason = generateRecommendationReason(
    overallScore,
    consensusLevel,
    satisfiedMembers.length,
    members.length
  );

  return {
    venueId: venue.id,
    venueName: venue.name?.en || 'Unknown Venue',
    overallScore: Math.round(overallScore),
    memberScores,
    consensusLevel,
    satisfiedMembers,
    dissatisfiedMembers,
    compromiseRating: Math.round(compromiseRating),
    conflictAreas,
    recommendationReason,
  };
}

/**
 * Find the best consensus venues for a family group
 */
export function findConsensusVenues(
  members: FamilyMember[],
  venues: Location[],
  topN: number = 5
): ConsensusResult {
  if (members.length === 0 || venues.length === 0) {
    return {
      topChoices: [],
      consensusLevel: 'weak',
      conflictingPreferences: [],
      recommendations: [],
      alternativeCompromises: [],
      groupSatisfactionRate: 0,
    };
  }

  const scoredVenues = venues
    .map((venue) => scoreVenueForGroup(members, venue))
    .sort((a, b) => {
      // Primary: consensus level strength
      const consensusOrder = { strong: 3, moderate: 2, weak: 1, conflicted: 0 };
      if (consensusOrder[a.consensusLevel] !== consensusOrder[b.consensusLevel]) {
        return consensusOrder[b.consensusLevel] - consensusOrder[a.consensusLevel];
      }
      // Secondary: overall score
      return b.overallScore - a.overallScore;
    });

  const topChoices = scoredVenues.slice(0, topN);
  const topChoice = topChoices[0];

  const conflictingPreferences = identifyConflicts(members);

  const recommendations = generateRecommendations(
    topChoices,
    conflictingPreferences
  );

  const alternativeCompromises = scoredVenues.filter(
    (v) => v.consensusLevel === 'moderate' && !topChoices.find((t) => t.venueId === v.venueId)
  );

  const groupSatisfactionRate = topChoice
    ? (topChoice.satisfiedMembers.length / members.length) * 100
    : 0;

  return {
    topChoices,
    consensusLevel: topChoice?.consensusLevel || 'weak',
    conflictingPreferences,
    recommendations,
    alternativeCompromises: alternativeCompromises.slice(0, 3),
    groupSatisfactionRate: Math.round(groupSatisfactionRate),
  };
}

/**
 * Generate recommendation reasons
 */
function generateRecommendationReason(
  score: number,
  consensus: string,
  satisfiedCount: number,
  totalMembers: number
): string {
  const reasons: string[] = [];

  if (score > 80) {
    reasons.push('Excellent fit for the group');
  } else if (score > 60) {
    reasons.push('Good overall match');
  } else {
    reasons.push('Reasonable compromise');
  }

  if (consensus === 'strong') {
    reasons.push(`${totalMembers} members highly satisfied`);
  } else if (satisfiedCount > totalMembers / 2) {
    reasons.push(`${satisfiedCount} out of ${totalMembers} members satisfied`);
  }

  return reasons.join('. ');
}

/**
 * Generate recommendations for the family
 */
function generateRecommendations(
  topChoices: VenueCompatibilityScore[],
  conflictingPreferences: string[],
  memberCount: number
): string[] {
  const recommendations: string[] = [];

  if (topChoices.length === 0) {
    recommendations.push('No venues match all preferences - consider expanding your options');
    return recommendations;
  }

  const topChoice = topChoices[0];

  if (topChoice.consensusLevel === 'strong') {
    recommendations.push(`${topChoice.venueName} has strong consensus - highly recommended for family visit`);
  } else if (topChoice.consensusLevel === 'moderate') {
    recommendations.push(`${topChoice.venueName} is a good compromise for the family`);
    if (topChoice.dissatisfiedMembers.length > 0) {
      recommendations.push(`Note: Some members may prefer other options`);
    }
  } else {
    recommendations.push('Consider visiting multiple venues to satisfy all preferences');
  }

  if (conflictingPreferences.length > 0) {
    recommendations.push(`Family preferences differ in: ${conflictingPreferences.join(', ')}`);
  }

  if (topChoices.length > 1) {
    const secondChoice = topChoices[1];
    recommendations.push(`Alternative: ${secondChoice.venueName} is also a good option`);
  }

  recommendations.push('Plan separate outings for specialty preferences to maximize everyone\'s enjoyment');

  return recommendations;
}

/**
 * Find compromise venues that work best for conflicting preferences
 */
export function findCompromiseVenues(
  members: FamilyMember[],
  venues: Location[],
  topN: number = 3
): Location[] {
  const scored = venues
    .map((venue) => scoreVenueForGroup(members, venue))
    .sort((a, b) => b.compromiseRating - a.compromiseRating)
    .slice(0, topN);

  return scored.map((score) => venues.find((v) => v.id === score.venueId)!).filter(Boolean);
}

/**
 * Get summary of family voting preferences
 */
export function getSummaryStats(
  members: FamilyMember[],
  venues: Location[]
): {
  averageGroupScore: number;
  consensusPercentage: number;
  mostRequestedCategory: string | null;
  commonFacilities: string[];
} {
  if (venues.length === 0) {
    return {
      averageGroupScore: 0,
      consensusPercentage: 0,
      mostRequestedCategory: null,
      commonFacilities: [],
    };
  }

  const allScores = venues
    .map((v) => scoreVenueForGroup(members, v))
    .map((s) => s.overallScore);
  const averageGroupScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  const strongConsensusCount = venues
    .map((v) => scoreVenueForGroup(members, v))
    .filter((s) => s.consensusLevel === 'strong').length;
  const consensusPercentage = Math.round((strongConsensusCount / venues.length) * 100);

  // Find most requested category
  const categories = new Map<string, number>();
  members.forEach((m) => {
    m.preferences.categories?.forEach((c) => {
      categories.set(c, (categories.get(c) || 0) + 1);
    });
  });
  const mostRequestedCategory = categories.size > 0
    ? Array.from(categories.entries()).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  // Find common facilities
  const facilityVotes = new Map<string, number>();
  members.forEach((m) => {
    m.preferences.preferredFacilities?.forEach((f) => {
      facilityVotes.set(f, (facilityVotes.get(f) || 0) + 1);
    });
  });
  const commonFacilities = Array.from(facilityVotes.entries())
    .filter(([, count]) => count >= Math.ceil(members.length / 2))
    .map(([facility]) => facility);

  return {
    averageGroupScore,
    consensusPercentage,
    mostRequestedCategory,
    commonFacilities,
  };
}
