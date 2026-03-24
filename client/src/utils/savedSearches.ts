/**
 * Saved Searches utility for managing user's custom search profiles
 */

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  category?: string;
  filters: SearchFilters;
  createdAt: number;
  lastUsed?: number;
  usageCount: number;
}

export interface SearchFilters {
  categories: string[];
  facilities: string[];
  minRating?: number;
  maxDistance?: number;
  hasNursingRoom?: boolean;
  strollerAccessible?: boolean;
}

const STORAGE_KEY = 'fammap_saved_searches';
const MAX_SAVED_SEARCHES = 20;

export function getSavedSearches(): SavedSearch[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSavedSearch(search: Omit<SavedSearch, 'id' | 'createdAt'>): SavedSearch {
  const searches = getSavedSearches();

  if (searches.length >= MAX_SAVED_SEARCHES) {
    throw new Error(`Maximum ${MAX_SAVED_SEARCHES} saved searches allowed`);
  }

  const newSearch: SavedSearch = {
    ...search,
    id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now()
  };

  searches.push(newSearch);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  return newSearch;
}

export function updateSavedSearch(id: string, updates: Partial<SavedSearch>): SavedSearch | null {
  const searches = getSavedSearches();
  const index = searches.findIndex(s => s.id === id);

  if (index === -1) return null;

  searches[index] = { ...searches[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  return searches[index];
}

export function deleteSavedSearch(id: string): boolean {
  const searches = getSavedSearches();
  const filtered = searches.filter(s => s.id !== id);

  if (filtered.length === searches.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function recordSearchUsage(id: string): SavedSearch | null {
  const search = getSavedSearches().find(s => s.id === id);
  if (!search) return null;

  return updateSavedSearch(id, {
    lastUsed: Date.now(),
    usageCount: (search.usageCount || 0) + 1
  });
}

export function getSortedSearches(sortBy: 'recent' | 'frequency' | 'created' = 'recent'): SavedSearch[] {
  const searches = getSavedSearches();

  switch (sortBy) {
    case 'frequency':
      return [...searches].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    case 'created':
      return [...searches].sort((a, b) => b.createdAt - a.createdAt);
    case 'recent':
    default:
      return [...searches].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
  }
}

export function duplicateSavedSearch(id: string, newName: string): SavedSearch | null {
  const search = getSavedSearches().find(s => s.id === id);
  if (!search) return null;

  return saveSavedSearch({
    name: newName,
    query: search.query,
    category: search.category,
    filters: search.filters,
    usageCount: 0
  });
}

export function clearAllSavedSearches(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function exportSearches(): string {
  const searches = getSavedSearches();
  return JSON.stringify(searches, null, 2);
}

export function importSearches(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const searches = JSON.parse(jsonString);

    if (!Array.isArray(searches)) {
      return { success: false, count: 0, error: 'Invalid format: expected array' };
    }

    const existing = getSavedSearches();
    const imported = searches.filter(s => {
      if (!s.name || !s.query) return false;
      return !existing.some(e => e.name === s.name && e.query === s.query);
    });

    const allSearches = [...existing, ...imported].slice(0, MAX_SAVED_SEARCHES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));

    return { success: true, count: imported.length };
  } catch (error) {
    return { success: false, count: 0, error: String(error) };
  }
}
