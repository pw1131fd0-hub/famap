/**
 * Family Context System
 * Manages family profiles, composition, and special needs
 * Enables smarter, family-aware location recommendations
 */

export interface ChildProfile {
  id: string;
  name?: string;
  age: number;
  specialNeeds?: string[];
  allergies?: string[];
  mobilityChallenges?: boolean;
  sensoryPreferences?: {
    lowNoise?: boolean;
    lowCrowds?: boolean;
    avoidStrobe?: boolean;
    preferOutdoor?: boolean;
  };
}

export interface FamilyProfile {
  id: string;
  name?: string;
  numberOfChildren: number;
  children: ChildProfile[];
  adultsCount: number;
  familyType: FamilyType;
  specialNeeds: string[];
  preferences: FamilyPreferences;
  createdAt: number;
  updatedAt: number;
}

export type FamilyType =
  | 'single_child'
  | 'twins'
  | 'close_age_gap'
  | 'mixed_ages'
  | 'special_needs'
  | 'extended_family';

export interface FamilyPreferences {
  preferOutdoor: boolean;
  preferIndoor: boolean;
  preferQuiet: boolean;
  preferStructured: boolean;
  preferFreePlay: boolean;
  wheelchairAccessRequired: boolean;
  dietaryRestrictions: string[];
  languagePreferences: string[];
  budgetLevel: 'budget' | 'moderate' | 'premium';
  timePreferences: TimePreferences;
}

export interface TimePreferences {
  preferredDays: number[]; // 0 = Sunday, 6 = Saturday
  preferredTimes: {
    start: number; // hours (0-23)
    end: number;
  }[];
  avoidPeakHours: boolean;
  preferWeekend: boolean;
}

export interface FamilySuitabilityScore {
  overall: number;
  safety: number;
  facilities: number;
  accessibility: number;
  atmosphere: number;
  timing: number;
  reasoning: string[];
}

const STORAGE_KEY = 'fammap_family_profiles';
const CURRENT_PROFILE_KEY = 'fammap_current_profile_id';

/**
 * Initialize a new family profile
 */
export function createFamilyProfile(
  numberOfChildren: number,
  children: Omit<ChildProfile, 'id'>[]
): FamilyProfile {
  const childrenWithIds = children.map((child, idx) => ({
    ...child,
    id: `child_${Date.now()}_${idx}`,
  }));

  const familyType = determineFamilyType(numberOfChildren, childrenWithIds);

  return {
    id: `family_${Date.now()}`,
    numberOfChildren,
    children: childrenWithIds,
    adultsCount: 1,
    familyType,
    specialNeeds: extractSpecialNeeds(childrenWithIds),
    preferences: {
      preferOutdoor: true,
      preferIndoor: true,
      preferQuiet: false,
      preferStructured: false,
      preferFreePlay: true,
      wheelchairAccessRequired: false,
      dietaryRestrictions: [],
      languagePreferences: ['zh', 'en'],
      budgetLevel: 'moderate',
      timePreferences: {
        preferredDays: [0, 1, 2, 3, 4, 5, 6],
        preferredTimes: [{ start: 9, end: 17 }],
        avoidPeakHours: false,
        preferWeekend: true,
      },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Determine family type based on composition
 */
function determineFamilyType(
  numberOfChildren: number,
  children: Omit<ChildProfile, 'id'>[]
): FamilyType {
  const hasSpecialNeeds = children.some(
    (c) => c.specialNeeds?.length || c.mobilityChallenges
  );

  if (hasSpecialNeeds) return 'special_needs';
  if (numberOfChildren === 1) return 'single_child';

  const ages = children.map((c) => c.age);
  const maxAge = Math.max(...ages);
  const minAge = Math.min(...ages);
  const ageGap = maxAge - minAge;

  if (numberOfChildren === 2 && ageGap <= 1) return 'twins';
  if (ageGap <= 2) return 'close_age_gap';
  return 'mixed_ages';
}

/**
 * Extract all special needs from children
 */
function extractSpecialNeeds(
  children: Omit<ChildProfile, 'id'>[]
): string[] {
  const needs = new Set<string>();
  children.forEach((child) => {
    child.specialNeeds?.forEach((need) => needs.add(need));
    if (child.mobilityChallenges) needs.add('mobility_challenges');
  });
  return Array.from(needs);
}

/**
 * Save family profiles to localStorage
 */
export function saveFamilyProfiles(profiles: FamilyProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

/**
 * Load family profiles from localStorage
 */
export function loadFamilyProfiles(): FamilyProfile[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get current active family profile
 */
export function getCurrentFamilyProfile(): FamilyProfile | null {
  const profileId = localStorage.getItem(CURRENT_PROFILE_KEY);
  if (!profileId) return null;

  const profiles = loadFamilyProfiles();
  return profiles.find((p) => p.id === profileId) || null;
}

/**
 * Set current family profile
 */
export function setCurrentFamilyProfile(profileId: string): void {
  const profiles = loadFamilyProfiles();
  if (profiles.find((p) => p.id === profileId)) {
    localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
  }
}

/**
 * Calculate family suitability score for a location
 */
export function calculateFamilySuitabilityScore(
  location: {
    id: string;
    category?: string;
    facilities?: string[];
    averageRating?: number;
    reviews?: Array<{ comment?: string }>;
  },
  family: FamilyProfile
): FamilySuitabilityScore {
  const reasoning: string[] = [];

  // Safety score (based on location type and child ages)
  let safetyScore = calculateSafetyScore(location, family, reasoning);

  // Facilities score (based on available facilities)
  let facilitiesScore = calculateFacilitiesScore(location, family, reasoning);

  // Accessibility score
  let accessibilityScore = calculateAccessibilityScore(
    location,
    family,
    reasoning
  );

  // Atmosphere score (based on location type and family preference)
  let atmosphereScore = calculateAtmosphereScore(location, family, reasoning);

  // Timing score (based on crowd info if available)
  let timingScore = calculateTimingScore(location, family, reasoning);

  const overall =
    (safetyScore * 0.25 +
      facilitiesScore * 0.25 +
      accessibilityScore * 0.2 +
      atmosphereScore * 0.2 +
      timingScore * 0.1) /
    100;

  return {
    overall: Math.round(overall * 100),
    safety: safetyScore,
    facilities: facilitiesScore,
    accessibility: accessibilityScore,
    atmosphere: atmosphereScore,
    timing: timingScore,
    reasoning,
  };
}

function calculateSafetyScore(
  location: { category?: string; reviews?: Array<{ comment?: string }> },
  family: FamilyProfile,
  reasoning: string[]
): number {
  let score = 75; // baseline

  // Check for age-appropriate location type
  if (family.children.some((c) => c.age < 3)) {
    if (['park', 'nursing_room', 'restaurant'].includes(location.category || '')) {
      score += 15;
      reasoning.push('Safe for toddlers');
    } else if (['attraction', 'medical'].includes(location.category || '')) {
      score -= 10;
    }
  }

  // Check for special needs considerations
  if (family.specialNeeds.includes('mobility_challenges')) {
    if (family.preferences.wheelchairAccessRequired) {
      score += 10;
      reasoning.push('Wheelchair accessibility considered');
    }
  }

  // Analyze review sentiment for safety mentions
  const safetyMentions = (location.reviews || []).filter(
    (r) =>
      r.comment?.toLowerCase().includes('safe') ||
      r.comment?.toLowerCase().includes('danger')
  ).length;

  if (safetyMentions > 0) {
    score += 5;
    reasoning.push('Safety mentioned in reviews');
  }

  return Math.min(100, score);
}

function calculateFacilitiesScore(
  location: { facilities?: string[] },
  family: FamilyProfile,
  reasoning: string[]
): number {
  const facilities = location.facilities || [];
  let score = 50;

  // Critical facilities for toddlers
  if (family.children.some((c) => c.age < 3)) {
    if (facilities.includes('changing_table')) {
      score += 15;
      reasoning.push('Has changing facilities');
    }
    if (facilities.includes('nursing_room')) {
      score += 10;
      reasoning.push('Has nursing facilities');
    }
  }

  // General facilities
  const facilityMatch = facilities.filter(
    (f) =>
      f.includes('toilet') ||
      f.includes('drinking') ||
      f.includes('food') ||
      f.includes('rest')
  ).length;

  score += Math.min(15, facilityMatch * 5);

  if (facilityMatch > 0) {
    reasoning.push(`${facilityMatch} useful facilities found`);
  }

  return Math.min(100, score);
}

function calculateAccessibilityScore(
  location: { facilities?: string[] },
  family: FamilyProfile,
  reasoning: string[]
): number {
  const facilities = location.facilities || [];
  let score = 70;

  if (family.preferences.wheelchairAccessRequired) {
    if (facilities.includes('wheelchair_accessible')) {
      score += 25;
      reasoning.push('Wheelchair accessible');
    } else {
      score -= 20;
      reasoning.push('Wheelchair accessibility uncertain');
    }
  }

  if (facilities.includes('stroller_accessible')) {
    score += 10;
    reasoning.push('Stroller-friendly');
  }

  return Math.min(100, score);
}

function calculateAtmosphereScore(
  location: { category?: string },
  family: FamilyProfile,
  reasoning: string[]
): number {
  let score = 70;

  // Prefer quiet locations if family has special needs
  if (family.children.some((c) => c.sensoryPreferences?.lowNoise)) {
    if (['nursing_room', 'library', 'quiet'].includes(location.category || '')) {
      score += 20;
      reasoning.push('Low-noise environment suitable');
    } else if (['attraction', 'park'].includes(location.category || '')) {
      score -= 15;
      reasoning.push('May be too loud');
    }
  }

  // Prefer outdoor if family preference
  if (family.preferences.preferOutdoor) {
    if (location.category === 'park') {
      score += 10;
      reasoning.push('Outdoor activity preferred');
    }
  }

  return Math.min(100, score);
}

function calculateTimingScore(
  _location: any,
  family: FamilyProfile,
  reasoning: string[]
): number {
  let score = 75;

  // Check if family prefers avoiding peak hours
  if (family.preferences.timePreferences.avoidPeakHours) {
    reasoning.push(
      'Recommend visiting during off-peak hours (avoid 11am-2pm, 5pm-7pm)'
    );
  }

  // Weekend preference
  if (family.preferences.timePreferences.preferWeekend) {
    reasoning.push('Family prefers weekend visits');
  }

  return score;
}

/**
 * Get family-specific recommendations
 */
export function getFamilyTypeRecommendations(
  familyType: FamilyType
): string[] {
  const recommendations: Record<FamilyType, string[]> = {
    single_child: [
      'Focus on interactive and engaging activities',
      'One-on-one attention from parents',
      'Facilities for single-child care',
    ],
    twins: [
      'Need facilities for multiple children',
      'Prefer locations with activities for 2+ children',
      'Consider family resting areas',
    ],
    close_age_gap: [
      'Look for activities suitable for similar ages',
      'Facilities for multiple young children',
      'Safe spaces for active play',
    ],
    mixed_ages: [
      'Need locations with age-diverse activities',
      'Older children can help watch younger',
      'Multi-level facilities important',
    ],
    special_needs: [
      'Quiet zones and sensory-friendly spaces',
      'Accessible facilities critical',
      'Staff trained in special needs care',
    ],
    extended_family: [
      'Spacious facilities for larger groups',
      'Multiple seating/resting areas',
      'Group-friendly activities',
    ],
  };

  return recommendations[familyType] || [];
}
