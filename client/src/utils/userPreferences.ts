/**
 * User Preference Learning System
 * Tracks user interactions and learns preferences to provide personalized recommendations
 */

import { captureException, addBreadcrumb } from './sentryConfig';

export interface UserPreference {
  locationId: string;
  viewCount: number;
  saveCount: number;
  reviewCount: number;
  interactionScore: number;
  lastViewedAt: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
}

export interface UserPreferences {
  preferredCategories: { category: string; score: number }[];
  preferredFacilities: { facility: string; score: number }[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  preferredDaysOfWeek: string[];
  childAgeRange: [number, number] | null;
  searchHistory: Array<{ query: string; timestamp: string; resultCount: number }>;
  viewedLocations: UserPreference[];
  savedLocations: Set<string>;
  averageRating: number;
  interactionCount: number;
  lastUpdatedAt: string;
}

const STORAGE_KEY = 'famap_user_preferences';
const MAX_SEARCH_HISTORY = 20;
const MAX_VIEWED_LOCATIONS = 100;

/**
 * Initialize empty user preferences
 */
export function initializePreferences(): UserPreferences {
  return {
    preferredCategories: [],
    preferredFacilities: [],
    preferredTimeOfDay: null,
    preferredDaysOfWeek: [],
    childAgeRange: null,
    searchHistory: [],
    viewedLocations: [],
    savedLocations: new Set(),
    averageRating: 0,
    interactionCount: 0,
    lastUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        savedLocations: new Set(parsed.savedLocations || []),
      };
    }
  } catch (err) {
    captureException(err instanceof Error ? err : new Error(String(err)), {
      context: 'loadPreferences',
    });
    addBreadcrumb('Failed to load preferences, using defaults', 'warning', 'storage');
  }
  return initializePreferences();
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(prefs: UserPreferences): void {
  try {
    const toStore = {
      ...prefs,
      savedLocations: Array.from(prefs.savedLocations),
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (err) {
    captureException(err instanceof Error ? err : new Error(String(err)), {
      context: 'savePreferences',
    });
    addBreadcrumb('Failed to save preferences to storage', 'warning', 'storage');
  }
}

/**
 * Record location view/interaction
 */
export function recordLocationView(
  prefs: UserPreferences,
  locationId: string,
  location: {
    category: string;
    facilities?: string[];
    averageRating?: number;
  }
): UserPreferences {
  const updated = { ...prefs };

  // Find or create view record
  let viewRecord = updated.viewedLocations.find((v) => v.locationId === locationId);
  if (!viewRecord) {
    viewRecord = {
      locationId,
      viewCount: 0,
      saveCount: 0,
      reviewCount: 0,
      interactionScore: 0,
      lastViewedAt: new Date().toISOString(),
      timeOfDay: getTimeOfDay(),
      dayOfWeek: getDayOfWeek(),
    };
    updated.viewedLocations.push(viewRecord);
  }

  viewRecord.viewCount += 1;
  viewRecord.lastViewedAt = new Date().toISOString();
  viewRecord.interactionScore = calculateInteractionScore(viewRecord);

  // Update category preferences
  const categoryIdx = updated.preferredCategories.findIndex((c) => c.category === location.category);
  if (categoryIdx >= 0) {
    updated.preferredCategories[categoryIdx].score += 5;
  } else {
    updated.preferredCategories.push({ category: location.category, score: 5 });
  }

  // Update facility preferences
  if (location.facilities) {
    location.facilities.forEach((facility) => {
      const facIdx = updated.preferredFacilities.findIndex((f) => f.facility === facility);
      if (facIdx >= 0) {
        updated.preferredFacilities[facIdx].score += 2;
      } else {
        updated.preferredFacilities.push({ facility, score: 2 });
      }
    });
  }

  // Track time of day preference
  const timeOfDay = getTimeOfDay();
  if (!updated.preferredTimeOfDay) {
    updated.preferredTimeOfDay = timeOfDay;
  }

  // Track day of week preference
  const dayOfWeek = getDayOfWeek();
  if (!updated.preferredDaysOfWeek.includes(dayOfWeek)) {
    updated.preferredDaysOfWeek.push(dayOfWeek);
  }

  updated.interactionCount += 1;

  // Keep history manageable
  if (updated.viewedLocations.length > MAX_VIEWED_LOCATIONS) {
    updated.viewedLocations = updated.viewedLocations.slice(-MAX_VIEWED_LOCATIONS);
  }

  // Sort preferences by score
  updated.preferredCategories.sort((a, b) => b.score - a.score);
  updated.preferredFacilities.sort((a, b) => b.score - a.score);

  return updated;
}

/**
 * Record search interaction
 */
export function recordSearch(
  prefs: UserPreferences,
  query: string,
  resultCount: number
): UserPreferences {
  const updated = { ...prefs };

  updated.searchHistory.push({
    query,
    timestamp: new Date().toISOString(),
    resultCount,
  });

  if (updated.searchHistory.length > MAX_SEARCH_HISTORY) {
    updated.searchHistory = updated.searchHistory.slice(-MAX_SEARCH_HISTORY);
  }

  return updated;
}

/**
 * Record location save/favorite
 */
export function recordLocationSave(
  prefs: UserPreferences,
  locationId: string
): UserPreferences {
  const updated = { ...prefs };

  if (!updated.savedLocations.has(locationId)) {
    updated.savedLocations.add(locationId);

    // Update view record if it exists
    const viewRecord = updated.viewedLocations.find((v) => v.locationId === locationId);
    if (viewRecord) {
      viewRecord.saveCount += 1;
      viewRecord.interactionScore = calculateInteractionScore(viewRecord);
    }
  }

  return updated;
}

/**
 * Record location unsave
 */
export function recordLocationUnsave(
  prefs: UserPreferences,
  locationId: string
): UserPreferences {
  const updated = { ...prefs };
  updated.savedLocations.delete(locationId);
  return updated;
}

/**
 * Set child age range
 */
export function setChildAgeRange(
  prefs: UserPreferences,
  minAge: number,
  maxAge: number
): UserPreferences {
  return {
    ...prefs,
    childAgeRange: [minAge, maxAge],
  };
}

/**
 * Calculate interaction score based on view, save, and review counts
 */
function calculateInteractionScore(viewRecord: UserPreference): number {
  return viewRecord.viewCount * 1 + viewRecord.saveCount * 3 + viewRecord.reviewCount * 5;
}

/**
 * Get current time of day
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get current day of week
 */
function getDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

/**
 * Calculate user preference score for a location
 * Higher score = better match for user's preferences
 */
export function calculateLocationPreferenceScore(
  location: {
    category: string;
    facilities?: string[];
    averageRating?: number;
  },
  prefs: UserPreferences
): number {
  let score = 0;

  // Category match
  const categoryPref = prefs.preferredCategories.find((c) => c.category === location.category);
  if (categoryPref) {
    score += Math.min(categoryPref.score / 5, 20);
  }

  // Facility matches
  if (location.facilities && prefs.preferredFacilities.length > 0) {
    location.facilities.forEach((facility) => {
      const facPref = prefs.preferredFacilities.find((f) => f.facility === facility);
      if (facPref) {
        score += Math.min(facPref.score / 3, 5);
      }
    });
  }

  // Rating boost
  if (location.averageRating && location.averageRating >= 4) {
    score += 10;
  }

  return Math.round(score);
}

/**
 * Get personalized recommendations based on user preferences
 */
export function getPersonalizedRecommendations(
  locations: Array<{
    id: string;
    category: string;
    facilities?: string[];
    averageRating?: number;
  }>,
  prefs: UserPreferences,
  limit: number = 5
): string[] {
  const scored = locations.map((loc) => ({
    id: loc.id,
    score: calculateLocationPreferenceScore(loc, prefs),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.id);
}

/**
 * Get preference summary for display
 */
export function getPreferenceSummary(prefs: UserPreferences): {
  topCategories: string[];
  topFacilities: string[];
  totalInteractions: number;
  lastInteractionTime: string;
  childAgeRange: string;
} {
  return {
    topCategories: prefs.preferredCategories.slice(0, 3).map((c) => c.category),
    topFacilities: prefs.preferredFacilities.slice(0, 3).map((f) => f.facility),
    totalInteractions: prefs.interactionCount,
    lastInteractionTime: prefs.lastUpdatedAt,
    childAgeRange: prefs.childAgeRange
      ? `${prefs.childAgeRange[0]}-${prefs.childAgeRange[1]} years`
      : 'Not specified',
  };
}

/**
 * Clear all user preferences
 */
export function clearPreferences(): void {
  localStorage.removeItem(STORAGE_KEY);
}
