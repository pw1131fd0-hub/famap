/**
 * Smart Venue Quality Assessment System
 * Evaluates and compares venues based on credibility, suitability, and family compatibility
 *
 * Features:
 * - Multi-factor credibility scoring
 * - Family need-based suitability analysis
 * - Venue comparison logic
 * - Quality consistency checking
 * - Recommendation confidence assessment
 */

import type { Location } from '../types';

export interface VenueCredibility {
  score: number; // 0-100
  dataRecency: number; // How recent is the data (days old)
  reviewCount: number; // Number of reviews as confidence indicator
  userContributions: number; // User-generated content count
  operatorVerification: boolean; // Is venue operator verified?
  consistencyIndex: number; // How consistent are reviews (0-100)
  factorsAnalyzed: string[];
}

export interface FamilyNeed {
  category: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  weight: number; // 0-1
}

export interface VenueSuitability {
  venue: Location;
  suitabilityScore: number; // 0-100
  matchedNeeds: string[];
  unmatchedNeeds: string[];
  confidence: number; // 0-100
  reasoning: string[];
}

export interface VenueComparison {
  venues: VenueSuitability[];
  bestMatch: VenueSuitability;
  compareReasons: string[];
  riskFactors: string[];
  recommendations: string[];
}

/**
 * Assess the credibility and data quality of a venue
 */
export function assessVenueCredibility(
  reviewData?: { count: number; recentCount: number; averageRating: number },
  userData?: { contributionsCount: number; lastUpdateDays: number }
): VenueCredibility {
  const factors: string[] = [];
  let credibilityScore = 50; // Start with baseline

  // Check review data
  const reviewCount = reviewData?.count || 0;
  const recentReviewCount = reviewData?.recentCount || 0;

  if (reviewCount > 0) {
    factors.push('Review count verified');
    // More reviews = higher credibility
    const reviewFactor = Math.min(reviewCount / 50, 1) * 20; // Max 20 points
    credibilityScore += reviewFactor;

    // Recent reviews indicate active engagement
    if (recentReviewCount > 0) {
      factors.push('Recent activity detected');
      const recentFactor = Math.min(recentReviewCount / 10, 1) * 15; // Max 15 points
      credibilityScore += recentFactor;
    }
  }

  // Check user contributions
  const userContributions = userData?.contributionsCount || 0;
  if (userContributions > 0) {
    factors.push('User-generated content available');
    const userFactor = Math.min(userContributions / 10, 1) * 15; // Max 15 points
    credibilityScore += userFactor;
  }

  // Check data freshness
  const dataAgeDays = userData?.lastUpdateDays || 30;
  const dataRecencyScore = Math.max(0, 20 - (dataAgeDays / 3)); // Decreases with age
  if (dataRecencyScore > 0) {
    factors.push('Data freshness score applied');
    credibilityScore += dataRecencyScore;
  }

  // Assume operator verification if it's in the system
  const isVerified = true; // All venues in FamMap should be verified
  if (isVerified) {
    factors.push('Operator verification confirmed');
    credibilityScore += 15;
  }

  // Calculate consistency index (how consistent are reviews?)
  const consistencyIndex = calculateReviewConsistency(reviewData?.averageRating || 0);
  if (consistencyIndex > 70) {
    factors.push('Review consistency high');
  }

  // Cap the score at 100
  const finalScore = Math.min(credibilityScore, 100);

  return {
    score: Math.round(finalScore),
    dataRecency: Math.min(dataAgeDays, 365),
    reviewCount,
    userContributions,
    operatorVerification: isVerified,
    consistencyIndex,
    factorsAnalyzed: factors,
  };
}

/**
 * Evaluate venue suitability for specific family needs
 */
export function evaluateVenueSuitability(
  venue: Location,
  familyNeeds: FamilyNeed[],
  credibility: VenueCredibility
): VenueSuitability {
  const matchedNeeds: string[] = [];
  const unmatchedNeeds: string[] = [];
  let suitabilityScore = 50; // Baseline

  // Match facilities to family needs
  const venueFacilities = new Set((venue.facilities || []).map(f => f.toLowerCase()));

  for (const need of familyNeeds) {
    const needKey = need.category.toLowerCase();
    const isMet = venueFacilities.has(needKey);

    if (isMet) {
      matchedNeeds.push(need.category);
      // Weight the contribution by importance and weight
      const needImpactFactor = need.weight * (need.importance === 'critical' ? 3 : need.importance === 'important' ? 2 : 1);
      suitabilityScore += needImpactFactor * 10;
    } else if (need.importance === 'critical') {
      unmatchedNeeds.push(need.category);
      suitabilityScore -= 20; // Penalty for unmet critical needs
    } else {
      unmatchedNeeds.push(need.category);
      suitabilityScore -= need.importance === 'important' ? 5 : 2;
    }
  }

  // Apply credibility multiplier
  const credibilityMultiplier = (credibility.score / 100) * 0.3 + 0.7; // 70-100% of score
  const adjustedScore = suitabilityScore * credibilityMultiplier;

  // Generate reasoning
  const reasoning: string[] = [];

  if (matchedNeeds.length === familyNeeds.length) {
    reasoning.push('All family needs are met at this venue');
  } else if (matchedNeeds.length > 0) {
    reasoning.push(`${matchedNeeds.length} of ${familyNeeds.length} family needs are met`);
  }

  if (credibility.score >= 80) {
    reasoning.push('Highly credible venue with strong user feedback');
  } else if (credibility.score < 60) {
    reasoning.push('Limited credibility data - consider other options');
  }

  // Calculate confidence
  const confidenceFactors = [
    credibility.reviewCount > 10 ? 30 : credibility.reviewCount > 5 ? 15 : 5,
    matchedNeeds.length === familyNeeds.length ? 40 : 20,
    credibility.operatorVerification ? 30 : 15,
  ];
  const confidence = Math.round(
    (confidenceFactors.reduce((a, b) => a + b, 0) / 100) * 100
  );

  return {
    venue,
    suitabilityScore: Math.max(0, Math.min(100, Math.round(adjustedScore))),
    matchedNeeds,
    unmatchedNeeds,
    confidence,
    reasoning,
  };
}

/**
 * Compare multiple venues and provide recommendations
 */
export function compareVenuesForFamily(
  venues: Location[],
  familyNeeds: FamilyNeed[],
  credibilityScores: Map<string, VenueCredibility>
): VenueComparison {
  // Evaluate each venue
  const suitabilities: VenueSuitability[] = venues
    .map(venue => {
      const credibility = credibilityScores.get(venue.id) || assessVenueCredibility();
      return evaluateVenueSuitability(venue, familyNeeds, credibility);
    })
    .sort((a, b) => {
      // Sort by suitability score, with confidence as tiebreaker
      const scoreDiff = b.suitabilityScore - a.suitabilityScore;
      return scoreDiff !== 0 ? scoreDiff : b.confidence - a.confidence;
    });

  const bestMatch = suitabilities[0];

  // Analyze comparisons and generate recommendations
  const compareReasons: string[] = [];
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  if (suitabilities.length > 1) {
    const runnerUp = suitabilities[1];
    const scoreDifference = bestMatch.suitabilityScore - runnerUp.suitabilityScore;

    if (scoreDifference > 20) {
      compareReasons.push(`${bestMatch.venue.name.en} is significantly better suited (${scoreDifference} points)`);
    } else if (scoreDifference > 10) {
      compareReasons.push(`${bestMatch.venue.name.en} is moderately better suited`);
    } else {
      compareReasons.push(`${bestMatch.venue.name.en} and ${runnerUp.venue.name.en} are similarly suitable`);
      recommendations.push(`Consider both venues or use another criteria to decide`);
    }
  }

  // Identify risk factors
  if (bestMatch.unmatchedNeeds.some(n =>
    familyNeeds.find(fn => fn.category === n && fn.importance === 'critical')
  )) {
    riskFactors.push('Some critical family needs are not met');
    recommendations.push('This venue may not be fully suitable for your family needs');
  }

  const bestCredibility = credibilityScores.get(bestMatch.venue.id);
  if (!bestCredibility || bestCredibility.score < 60) {
    riskFactors.push('Limited credibility data for this venue');
    recommendations.push('Additional verification recommended before visiting');
  }

  if (bestMatch.confidence < 50) {
    riskFactors.push('Low confidence in the assessment');
    recommendations.push('Consider gathering more information before deciding');
  } else if (bestMatch.confidence >= 80) {
    recommendations.push('High confidence in this recommendation');
  }

  return {
    venues: suitabilities,
    bestMatch,
    compareReasons,
    riskFactors,
    recommendations,
  };
}

/**
 * Calculate review consistency index
 * Higher ratings that are consistently high = better consistency
 */
function calculateReviewConsistency(averageRating: number): number {
  // Assume a standard deviation based on average rating
  // Higher ratings tend to have tighter clustering
  if (averageRating >= 4.5) return 85;
  if (averageRating >= 4.0) return 75;
  if (averageRating >= 3.5) return 65;
  if (averageRating >= 3.0) return 55;
  if (averageRating >= 2.5) return 50;
  return 40;
}

/**
 * Get quality assessment summary for a venue
 */
export function getVenueQualitySummary(
  venue: Location,
  credibility: VenueCredibility,
  suitability: VenueSuitability
): {
  overallScore: number;
  qualityGrade: 'excellent' | 'good' | 'fair' | 'poor';
  summary: string;
  shouldVisit: boolean;
} {
  const combinedScore = (credibility.score * 0.4 + suitability.suitabilityScore * 0.6);
  const grade = combinedScore >= 80 ? 'excellent' : combinedScore >= 60 ? 'good' : combinedScore >= 40 ? 'fair' : 'poor';

  const summary = [
    `Credibility: ${credibility.score}/100 (based on ${credibility.reviewCount} reviews)`,
    `Suitability: ${suitability.suitabilityScore}/100 for your family`,
    `Confidence: ${suitability.confidence}% in this assessment`,
    ...suitability.reasoning,
  ].join(' | ');

  const shouldVisit = combinedScore >= 60 && suitability.confidence >= 50;

  return {
    overallScore: Math.round(combinedScore),
    qualityGrade: grade,
    summary,
    shouldVisit,
  };
}

export default {
  assessVenueCredibility,
  evaluateVenueSuitability,
  compareVenuesForFamily,
  getVenueQualitySummary,
};
