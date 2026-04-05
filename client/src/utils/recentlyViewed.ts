/**
 * Recently Viewed Locations
 * Persists up to MAX_RECENT location IDs in localStorage with timestamps.
 */

const STORAGE_KEY = 'fammap_recently_viewed';
const MAX_RECENT = 10;

export interface RecentlyViewedEntry {
  locationId: string;
  viewedAt: number; // epoch ms
}

function loadEntries(): RecentlyViewedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentlyViewedEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: RecentlyViewedEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded)
  }
}

/** Record a location view. Deduplicates and moves existing to front. */
export function recordView(locationId: string): void {
  const entries = loadEntries().filter(e => e.locationId !== locationId);
  entries.unshift({ locationId, viewedAt: Date.now() });
  saveEntries(entries.slice(0, MAX_RECENT));
}

/** Return recently viewed location IDs, most recent first. */
export function getRecentlyViewedIds(limit = MAX_RECENT): string[] {
  return loadEntries()
    .slice(0, limit)
    .map(e => e.locationId);
}

/** Clear all recently viewed entries. */
export function clearRecentlyViewed(): void {
  saveEntries([]);
}
