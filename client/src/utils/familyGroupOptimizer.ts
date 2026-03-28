/**
 * Smart Family Group Optimizer
 * Helps families find compatible families for group outings based on various factors
 * including children's ages, interests, budget, and venue compatibility
 */

import type { FamilyProfile, Location } from '../types';

export interface FamilyGroupMatch {
  familyId: string;
  familyName: string;
  compatibilityScore: number;
  ageGroupMatch: number;
  interestOverlap: number;
  budgetAlignment: number;
  reasonsForMatch: string[];
  potentialVenues?: Location[];
}

export interface GroupOptimizationResult {
  requestingFamily: string;
  matches: FamilyGroupMatch[];
  optimalGroupSize: number;
  suggestedGroupComposition: string;
  bestOutingTypes: string[];
  estimatedGroupBudget: number;
}

/**
 * Calculate age group compatibility between two families
 * Considers overlapping age ranges for better group dynamics
 */
export function calculateAgeGroupCompatibility(
  family1: FamilyProfile,
  family2: FamilyProfile
): number {
  if (!family1.childrenAges || !family2.childrenAges) return 0;

  const ages1 = family1.childrenAges.sort((a, b) => a - b);
  const ages2 = family2.childrenAges.sort((a, b) => a - b);

  let compatibilityScore = 0;
  let matches = 0;

  // Check for age-appropriate pairings
  for (const age1 of ages1) {
    for (const age2 of ages2) {
      const ageDifference = Math.abs(age1 - age2);
      // Children within 3 years are highly compatible
      if (ageDifference <= 3) {
        compatibilityScore += 100 - ageDifference * 10;
        matches++;
      } else if (ageDifference <= 6) {
        compatibilityScore += 60 - ageDifference * 5;
      }
    }
  }

  return matches > 0 ? compatibilityScore / (ages1.length * ages2.length) : 0;
}

/**
 * Calculate interest overlap between two families
 */
export function calculateInterestOverlap(
  family1: FamilyProfile,
  family2: FamilyProfile
): number {
  const interests1 = new Set(family1.interests || []);
  const interests2 = new Set(family2.interests || []);

  if (interests1.size === 0 || interests2.size === 0) return 50;

  const intersection = Array.from(interests1).filter((i) =>
    interests2.has(i)
  ).length;
  const union = new Set([...interests1, ...interests2]).size;

  return union > 0 ? (intersection / union) * 100 : 0;
}

/**
 * Calculate budget alignment between two families
 */
export function calculateBudgetAlignment(
  family1: FamilyProfile,
  family2: FamilyProfile
): number {
  const budget1 = family1.monthlyBudget || 5000;
  const budget2 = family2.monthlyBudget || 5000;

  const ratio = Math.min(budget1, budget2) / Math.max(budget1, budget2);
  // Budgets within 40% of each other are well-aligned
  return ratio >= 0.6 ? 100 : ratio * 100;
}

/**
 * Assess venue suitability for a group of families
 */
export function assessGroupVenueSuitability(
  families: FamilyProfile[],
  venue: Location
): {
  suitabilityScore: number;
  commonNeeds: string[];
  conflictingNeeds: string[];
} {
  if (families.length === 0) {
    return {
      suitabilityScore: 0,
      commonNeeds: [],
      conflictingNeeds: [],
    };
  }

  const allFamilyNeeds = new Set<string>();
  const familyNeedsArrays: Set<string>[] = [];

  for (const family of families) {
    const needs = new Set<string>();
    if (family.specialNeeds?.length) {
      family.specialNeeds.forEach((n) => needs.add(n));
    }
    familyNeedsArrays.push(needs);
    needs.forEach((n) => allFamilyNeeds.add(n));
  }

  // Find common needs (all families need this)
  const commonNeeds = Array.from(allFamilyNeeds).filter((need) =>
    familyNeedsArrays.every((set) => set.has(need))
  );

  // Find conflicting needs
  const needCounts = new Map<string, number>();
  for (const need of allFamilyNeeds) {
    const count = familyNeedsArrays.filter((set) => set.has(need)).length;
    needCounts.set(need, count);
  }

  const conflictingNeeds = Array.from(needCounts.entries())
    .filter(
      ([, count]) =>
        count > 0 && count < families.length && count !== familyNeedsArrays[0].size
    )
    .map(([need]) => need);

  // Calculate suitability based on common needs
  let suitabilityScore = 50; // Base score
  suitabilityScore += commonNeeds.length * 10;
  suitabilityScore -= conflictingNeeds.length * 5;

  return {
    suitabilityScore: Math.min(100, Math.max(0, suitabilityScore)),
    commonNeeds,
    conflictingNeeds,
  };
}

/**
 * Recommend optimal group size based on family preferences
 */
export function recommendOptimalGroupSize(families: FamilyProfile[]): {
  optimalSize: number;
  reasoning: string;
} {
  // General recommendation: 2-4 families, 6-12 children
  const totalChildren = families.reduce(
    (sum, f) => sum + (f.childrenAges?.length || 0),
    0
  );
  const familyCount = families.length;

  let optimalSize = familyCount;
  let reasoning = '';

  if (totalChildren > 15) {
    optimalSize = Math.min(familyCount, 3);
    reasoning = 'Current group is large; recommend limiting to 3 families';
  } else if (totalChildren < 6) {
    optimalSize = Math.min(familyCount + 1, 4);
    reasoning = 'Small group; consider adding another family for dynamics';
  } else {
    reasoning = 'Current group size is well-balanced';
  }

  return { optimalSize, reasoning };
}

/**
 * Find matching families for group outings
 */
export function findFamilyMatches(
  requestingFamily: FamilyProfile,
  potentialMatches: FamilyProfile[],
  considerBudget = true,
  minimumCompatibility = 60
): FamilyGroupMatch[] {
  const matches: FamilyGroupMatch[] = [];

  for (const candidate of potentialMatches) {
    if (candidate.id === requestingFamily.id) continue;

    const ageScore = calculateAgeGroupCompatibility(requestingFamily, candidate);
    const interestScore = calculateInterestOverlap(requestingFamily, candidate);
    const budgetScore = considerBudget
      ? calculateBudgetAlignment(requestingFamily, candidate)
      : 50;

    const overallScore = (ageScore + interestScore + budgetScore) / 3;

    if (overallScore >= minimumCompatibility) {
      const reasons: string[] = [];

      if (ageScore > 70) reasons.push('Compatible ages for children');
      if (interestScore > 70) reasons.push('Shared family interests');
      if (budgetScore > 70) reasons.push('Similar budget ranges');
      if (candidate.childrenAges && candidate.childrenAges.length > 2) {
        reasons.push('Multiple children for group dynamics');
      }

      matches.push({
        familyId: candidate.id || `family-${Math.random()}`,
        familyName: candidate.displayName || 'Unknown Family',
        compatibilityScore: overallScore,
        ageGroupMatch: ageScore,
        interestOverlap: interestScore,
        budgetAlignment: budgetScore,
        reasonsForMatch: reasons,
      });
    }
  }

  // Sort by compatibility score
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * Optimize a group of families for an outing considering all factors
 */
export function optimizeGroupForOuting(
  families: FamilyProfile[],
  availableVenues: Location[] = [],
  constraints?: {
    maxGroupSize?: number;
    minCompatibility?: number;
    categoryPreferences?: string[];
  }
): GroupOptimizationResult {
  const maxSize = constraints?.maxGroupSize || 4;
  const selectedFamilies = families.slice(0, maxSize);

  const { optimalSize, reasoning: sizeReasoning } =
    recommendOptimalGroupSize(selectedFamilies);

  const bestVenues = availableVenues
    .map((venue) => ({
      venue,
      score: assessGroupVenueSuitability(selectedFamilies, venue),
    }))
    .sort((a, b) => b.score.suitabilityScore - a.score.suitabilityScore)
    .slice(0, 3)
    .map((v) => v.venue);

  // Determine best outing types
  const outingTypes = new Set<string>();
  for (const family of selectedFamilies) {
    family.interests?.forEach((interest) => {
      if (
        ['outdoor', 'indoor', 'cultural', 'educational', 'recreational'].some(
          (t) => interest.toLowerCase().includes(t)
        )
      ) {
        outingTypes.add(interest);
      }
    });
  }

  // Calculate estimated group budget
  const avgBudgetPerFamily =
    selectedFamilies.reduce((sum, f) => sum + (f.monthlyBudget || 5000), 0) /
    selectedFamilies.length;
  const estimatedGroupBudget = avgBudgetPerFamily * selectedFamilies.length;

  const groupComposition =
    selectedFamilies.length === 1
      ? 'Solo family outing'
      : selectedFamilies.length === 2
        ? 'Pair of families'
        : selectedFamilies.length === 3
          ? 'Small group of 3 families'
          : 'Larger group outing';

  return {
    requestingFamily: selectedFamilies[0]?.displayName || 'Your Family',
    matches: [],
    optimalGroupSize: optimalSize,
    suggestedGroupComposition: groupComposition,
    bestOutingTypes: Array.from(outingTypes).slice(0, 3),
    estimatedGroupBudget,
  };
}

/**
 * Generate recommendations for group outing success
 */
export function generateGroupRecommendations(
  families: FamilyProfile[]
): string[] {
  const recommendations: string[] = [];

  const totalChildren = families.reduce(
    (sum, f) => sum + (f.childrenAges?.length || 0),
    0
  );
  const avgChildAge =
    totalChildren > 0
      ? families.reduce(
          (sum, f) =>
            sum +
            (f.childrenAges?.reduce((a, b) => a + b, 0) || 0),
          0
        ) / totalChildren
      : 0;

  // Age-based recommendations
  if (avgChildAge < 5) {
    recommendations.push('Choose venues with playground and rest areas');
    recommendations.push('Consider early morning or afternoon outings');
  } else if (avgChildAge < 10) {
    recommendations.push('Select venues with interactive activities');
    recommendations.push('Plan snack breaks every 1-2 hours');
  } else {
    recommendations.push('Consider educational or adventure activities');
    recommendations.push('Allow more independent exploration time');
  }

  // Size-based recommendations
  if (families.length >= 3) {
    recommendations.push('Book group reservations in advance');
    recommendations.push('Designate a meeting point for group coordination');
    recommendations.push('Have emergency contact information for all families');
  }

  recommendations.push('Check venue capacity for your group size');
  recommendations.push('Share cost estimates in advance');
  recommendations.push('Plan transportation coordination');

  return recommendations;
}
