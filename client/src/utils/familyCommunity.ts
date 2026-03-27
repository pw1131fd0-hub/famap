import type {
  FamilyProfile,
  FamilyCompatibilityScore,
  FamilyCommunityExperience,
  GroupOutingProposal,
  FamilyDiscoveryRecommendation,
  Location,
} from '../types';

export function calculateFamilyCompatibility(
  family1: FamilyProfile,
  family2: FamilyProfile,
): FamilyCompatibilityScore {
  const matchReasons: string[] = [];
  let compatibilityScore = 0;

  const ageOverlap = calculateAgeOverlap(family1.childrenAges, family2.childrenAges);
  if (ageOverlap > 0) {
    compatibilityScore += ageOverlap * 30;
    matchReasons.push('similar_ages');
  }

  const commonInterests = findCommonElements(family1.interests, family2.interests);
  const interestScore = (commonInterests.length / Math.max(family1.interests.length, 1)) * 25;
  compatibilityScore += interestScore;
  if (commonInterests.length > 0) {
    matchReasons.push('shared_interests');
  }

  if (family1.budget === family2.budget || isCompatibleBudget(family1.budget, family2.budget)) {
    compatibilityScore += 20;
    matchReasons.push('compatible_budget');
  }

  if (family1.visitFrequency === family2.visitFrequency) {
    compatibilityScore += 15;
    matchReasons.push('similar_visit_frequency');
  }

  const commonSpecialNeeds = findCommonElements(
    family1.specialNeeds || [],
    family2.specialNeeds || [],
  );
  if (commonSpecialNeeds.length > 0) {
    compatibilityScore += 10;
    matchReasons.push('shared_accommodations');
  }

  if (family1.childrenCount + family2.childrenCount <= 6) {
    compatibilityScore += 5;
    matchReasons.push('compatible_group_size');
  }

  return {
    familyProfileId: family1.id,
    otherFamilyProfileId: family2.id,
    compatibilityScore: Math.min(100, compatibilityScore),
    matchReasons,
    commonInterests,
    sharedLocations: findCommonElements(family1.preferredLocations || [], family2.preferredLocations || []),
    potentialGroupActivities: generateGroupActivitySuggestions(family1, family2),
  };
}

function calculateAgeOverlap(ages1: number[], ages2: number[]): number {
  if (ages1.length === 0 || ages2.length === 0) return 0;
  const avgAge1 = ages1.reduce((a, b) => a + b, 0) / ages1.length;
  const avgAge2 = ages2.reduce((a, b) => a + b, 0) / ages2.length;
  const ageDifference = Math.abs(avgAge1 - avgAge2);
  return Math.max(0, 1 - ageDifference / 10);
}

function isCompatibleBudget(budget1: string, budget2: string): boolean {
  if (budget1 === budget2) return true;
  if ((budget1 === 'budget_conscious' && budget2 === 'moderate') ||
      (budget1 === 'moderate' && budget2 === 'budget_conscious')) {
    return true;
  }
  return budget1 === 'flexible' || budget2 === 'flexible';
}

function findCommonElements<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => arr2.includes(item));
}

function generateGroupActivitySuggestions(family1: FamilyProfile, family2: FamilyProfile): string[] {
  const suggestions: string[] = [];
  const commonInterests = findCommonElements(family1.interests, family2.interests);
  const interestActivities: Record<string, string> = {
    outdoor_activities: 'hiking',
    educational: 'museum',
  };
  commonInterests.forEach(interest => {
    const activity = interestActivities[interest];
    if (activity && !suggestions.includes(activity)) {
      suggestions.push(activity);
    }
  });
  return suggestions;
}

export function findCompatibleFamilies(
  targetFamily: FamilyProfile,
  allFamilies: FamilyProfile[],
  threshold: number = 50,
): FamilyCompatibilityScore[] {
  return allFamilies
    .filter(family => family.id !== targetFamily.id)
    .map(family => calculateFamilyCompatibility(targetFamily, family))
    .filter(score => score.compatibilityScore >= threshold)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

export function scoreGroupOutingForFamily(
  family: FamilyProfile,
  outing: GroupOutingProposal,
): number {
  let score = 0;
  const childrenInRange = family.childrenAges.filter(
    age => (!outing.ageRangeTarget.minAge || age >= outing.ageRangeTarget.minAge) &&
           (!outing.ageRangeTarget.maxAge || age <= outing.ageRangeTarget.maxAge),
  );
  if (childrenInRange.length === family.childrenAges.length) {
    score += 40;
  } else if (childrenInRange.length > 0) {
    score += 20;
  }
  const commonInterests = findCommonElements(family.interests, outing.interests);
  score += (commonInterests.length / Math.max(family.interests.length, 1)) * 30;
  if (outing.status === 'open' && outing.currentMembers.length < outing.maxFamilies) {
    score += 10;
  }
  return Math.min(100, score);
}

export function createAnonymousFamilyProfile(childrenAges: number[], interests: string[]): FamilyProfile {
  return {
    id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    childrenAges,
    childrenCount: childrenAges.length,
    interests,
    visitFrequency: 'monthly',
    budget: 'moderate',
    groupSize: 'couple',
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function calculateCommunityEngagement(
  familyId: string,
  experiences: FamilyCommunityExperience[],
  groupOutings: GroupOutingProposal[],
): {
  experienceCount: number;
  totalLikes: number;
  averageRating: number;
  groupOutingsAttended: number;
  engagementScore: number;
} {
  const familyExperiences = experiences.filter(exp => exp.familyId === familyId);
  const totalLikes = familyExperiences.reduce((sum, exp) => sum + exp.likes, 0);
  const averageRating = familyExperiences.length > 0
    ? familyExperiences.reduce((sum, exp) => sum + exp.rating, 0) / familyExperiences.length
    : 0;
  const groupOutingsAttended = groupOutings.filter(
    outing => outing.currentMembers.includes(familyId) && outing.status === 'completed',
  ).length;
  const engagementScore = Math.min(100,
    (familyExperiences.length * 10) + (totalLikes * 2) + (averageRating * 15) + (groupOutingsAttended * 20),
  );
  return {
    experienceCount: familyExperiences.length,
    totalLikes,
    averageRating,
    groupOutingsAttended,
    engagementScore,
  };
}

export function filterCommunityByPreferences(
  families: FamilyProfile[],
  interests?: string[],
  ageRange?: { min: number; max: number },
  budget?: string,
): FamilyProfile[] {
  return families.filter(family => {
    if (interests && interests.length > 0) {
      const hasCommonInterests = interests.some(interest => family.interests.includes(interest));
      if (!hasCommonInterests) return false;
    }
    if (ageRange) {
      const hasChildInRange = family.childrenAges.some(
        age => age >= ageRange.min && age <= ageRange.max,
      );
      if (!hasChildInRange) return false;
    }
    if (budget && !isCompatibleBudget(family.budget, budget)) {
      return false;
    }
    return true;
  });
}

export function generateFamilyRecommendations(
  family: FamilyProfile,
  allFamilies: FamilyProfile[],
  allLocations: Location[],
  allGroupOutings: GroupOutingProposal[],
): FamilyDiscoveryRecommendation[] {
  const recommendations: FamilyDiscoveryRecommendation[] = [];
  const compatibleFamilies = findCompatibleFamilies(family, allFamilies, 60);
  compatibleFamilies.slice(0, 3).forEach(compatibleFamily => {
    recommendations.push({
      recommendationType: 'compatible_families',
      targetFamilyId: compatibleFamily.otherFamilyProfileId,
      reason: 'Compatible family found',
      confidence: Math.min(1, compatibleFamily.compatibilityScore / 100),
      action: 'view_family_profile',
    });
  });
  return recommendations;
}
