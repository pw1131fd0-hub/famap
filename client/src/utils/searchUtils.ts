import type { Location } from '../types';

export interface SearchResult {
  location: Location;
  relevanceScore: number;
  matchReason: string;
}

export interface SearchHistory {
  query: string;
  timestamp: number;
  resultCount: number;
}

/**
 * Calculate relevance score for a location based on search query
 * Factors: name match, category match, description match, rating
 */
export function calculateRelevanceScore(
  location: Location,
  query: string,
  userLocation?: { lat: number; lng: number }
): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // Name match (highest priority) - 40 points
  const nameMatch = location.name.zh.toLowerCase().includes(lowerQuery) ||
                    location.name.en.toLowerCase().includes(lowerQuery);
  if (nameMatch) {
    const exactMatch = location.name.zh.toLowerCase() === lowerQuery ||
                       location.name.en.toLowerCase() === lowerQuery;
    score += exactMatch ? 40 : 30;
  }

  // Category match - 15 points
  if (location.category && location.category.includes(lowerQuery)) {
    score += 15;
  }

  // Description match - 10 points
  const descMatch = location.description?.zh?.toLowerCase().includes(lowerQuery) ||
                    location.description?.en?.toLowerCase().includes(lowerQuery);
  if (descMatch) {
    score += 10;
  }

  // Rating boost - 5 points for highly rated
  if (location.averageRating && location.averageRating >= 4.5) {
    score += 5;
  }

  // Proximity boost - up to 10 points if user location known
  if (userLocation) {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      location.coordinates.lat,
      location.coordinates.lng
    );
    // Closer is better: max 10 points for locations within 1km
    const proximityScore = Math.max(0, 10 * (1 - distance / 1000));
    score += proximityScore;
  }

  return score;
}

/**
 * Haversine distance calculation in meters
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate human-readable match reason
 */
export function generateMatchReason(
  location: Location,
  query: string,
  language: 'zh' | 'en'
): string {
  const lowerQuery = query.toLowerCase();

  // Check name match
  if (location.name.zh.toLowerCase().includes(lowerQuery) ||
      location.name.en.toLowerCase().includes(lowerQuery)) {
    return language === 'zh' ? '名稱相符' : 'Name match';
  }

  // Check category match
  if (location.category && location.category.includes(lowerQuery)) {
    return language === 'zh' ? '類別相符' : 'Category match';
  }

  // Check description match
  if (location.description?.zh?.toLowerCase().includes(lowerQuery) ||
      location.description?.en?.toLowerCase().includes(lowerQuery)) {
    return language === 'zh' ? '描述相符' : 'Description match';
  }

  // Check high rating
  if (location.averageRating && location.averageRating >= 4.5) {
    return language === 'zh' ? '高評分' : 'Highly rated';
  }

  return language === 'zh' ? '相關結果' : 'Relevant result';
}

/**
 * Search locations with relevance ranking
 */
export function searchLocations(
  locations: Location[],
  query: string,
  userLocation?: { lat: number; lng: number },
  limit?: number
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = locations
    .map(location => ({
      location,
      relevanceScore: calculateRelevanceScore(location, query, userLocation),
      matchReason: generateMatchReason(location, query, 'en')
    }))
    .filter(result => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  if (limit) {
    return results.slice(0, limit);
  }

  return results;
}

// Search History Management
const SEARCH_HISTORY_KEY = 'famap_search_history';
const MAX_SEARCH_HISTORY = 10;

export function getSearchHistory(): SearchHistory[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveSearchToHistory(
  query: string,
  resultCount: number
): void {
  try {
    const history = getSearchHistory();

    // Remove duplicate if exists
    const filtered = history.filter(h => h.query !== query);

    // Add new search at the beginning
    const updated = [
      { query, timestamp: Date.now(), resultCount },
      ...filtered
    ].slice(0, MAX_SEARCH_HISTORY);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

/**
 * Generate search suggestions based on popular terms and recent searches
 */
export function generateSearchSuggestions(
  locations: Location[],
  language: 'zh' | 'en'
): string[] {
  const suggestions = new Set<string>();

  // Add categories
  const categories = ['park', 'restaurant', 'nursing_room', 'medical', 'attraction'];
  categories.forEach(cat => {
    if (language === 'zh') {
      const categoryZh: Record<string, string> = {
        park: '公園',
        restaurant: '餐廳',
        nursing_room: '哺乳室',
        medical: '醫療',
        attraction: '景點'
      };
      suggestions.add(categoryZh[cat] || cat);
    } else {
      suggestions.add(cat);
    }
  });

  // Add popular location names (top rated)
  locations
    .filter(loc => loc.averageRating && loc.averageRating >= 4.0)
    .slice(0, 5)
    .forEach(loc => {
      suggestions.add(language === 'zh' ? loc.name.zh : loc.name.en);
    });

  return Array.from(suggestions).slice(0, 5);
}
