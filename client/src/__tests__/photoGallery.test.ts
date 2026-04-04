import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VenuePhoto } from '../utils/photoGallery';
import {
  filterPhotosByCategory,
  sortPhotos,
  sortPhotosByCategory,
  getAvailableCategories,
  computePhotoStats,
  nextPhotoIndex,
  prevPhotoIndex,
  getRelativeDateLabel,
  isValidImageUrl,
  generateDemoPhotos,
  getCoverPhoto,
  groupPhotosByCategory,
  PHOTO_CATEGORY_LABELS,
} from '../utils/photoGallery';

// Fixed date for deterministic tests
const NOW = new Date('2026-04-04T12:00:00Z').getTime();
vi.useFakeTimers();
vi.setSystemTime(NOW);

const makePhoto = (overrides: Partial<VenuePhoto> = {}): VenuePhoto => ({
  id: 'photo-1',
  url: 'https://example.com/photo.jpg',
  category: 'general',
  ...overrides,
});

const samplePhotos: VenuePhoto[] = [
  makePhoto({ id: 'p1', category: 'entrance', isVerified: true, takenAt: '2026-04-01T00:00:00Z', likes: 10 }),
  makePhoto({ id: 'p2', category: 'play_area', isVerified: false, takenAt: '2026-03-20T00:00:00Z', likes: 5 }),
  makePhoto({ id: 'p3', category: 'nursing_room', isVerified: true, takenAt: '2026-04-03T00:00:00Z', likes: 8 }),
  makePhoto({ id: 'p4', category: 'bathroom', isVerified: false, takenAt: undefined, likes: 2 }),
  makePhoto({ id: 'p5', category: 'entrance', isVerified: false, takenAt: '2026-03-15T00:00:00Z', likes: 1 }),
];

describe('filterPhotosByCategory', () => {
  it('returns all photos when category is "all"', () => {
    expect(filterPhotosByCategory(samplePhotos, 'all')).toHaveLength(5);
  });

  it('filters by specific category', () => {
    const entrancePhotos = filterPhotosByCategory(samplePhotos, 'entrance');
    expect(entrancePhotos).toHaveLength(2);
    expect(entrancePhotos.every((p) => p.category === 'entrance')).toBe(true);
  });

  it('returns empty array when no photos match', () => {
    expect(filterPhotosByCategory(samplePhotos, 'food_area')).toHaveLength(0);
  });

  it('does not mutate original array', () => {
    const original = [...samplePhotos];
    filterPhotosByCategory(samplePhotos, 'entrance');
    expect(samplePhotos).toEqual(original);
  });

  it('filters nursing_room correctly', () => {
    const result = filterPhotosByCategory(samplePhotos, 'nursing_room');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p3');
  });
});

describe('sortPhotos', () => {
  it('puts verified photos first', () => {
    const photos = [
      makePhoto({ id: 'unverified', isVerified: false, takenAt: '2026-04-04T00:00:00Z' }),
      makePhoto({ id: 'verified', isVerified: true, takenAt: '2026-01-01T00:00:00Z' }),
    ];
    const sorted = sortPhotos(photos);
    expect(sorted[0].id).toBe('verified');
  });

  it('sorts by date descending (newest first) among same verification level', () => {
    const photos = [
      makePhoto({ id: 'older', isVerified: true, takenAt: '2026-01-01T00:00:00Z' }),
      makePhoto({ id: 'newer', isVerified: true, takenAt: '2026-04-01T00:00:00Z' }),
    ];
    const sorted = sortPhotos(photos);
    expect(sorted[0].id).toBe('newer');
  });

  it('sorts by likes descending when no dates', () => {
    const photos = [
      makePhoto({ id: 'few-likes', isVerified: false, takenAt: undefined, likes: 1 }),
      makePhoto({ id: 'many-likes', isVerified: false, takenAt: undefined, likes: 20 }),
    ];
    const sorted = sortPhotos(photos);
    expect(sorted[0].id).toBe('many-likes');
  });

  it('does not mutate original array', () => {
    const photos = [...samplePhotos];
    sortPhotos(photos);
    expect(photos).toEqual(samplePhotos);
  });

  it('handles empty array', () => {
    expect(sortPhotos([])).toEqual([]);
  });

  it('puts dated photos before undated photos (same verification)', () => {
    const photos = [
      makePhoto({ id: 'no-date', isVerified: false, takenAt: undefined }),
      makePhoto({ id: 'with-date', isVerified: false, takenAt: '2026-01-01T00:00:00Z' }),
    ];
    const sorted = sortPhotos(photos);
    expect(sorted[0].id).toBe('with-date');
  });
});

describe('sortPhotosByCategory', () => {
  it('sorts entrance before general', () => {
    const photos = [
      makePhoto({ id: 'general', category: 'general' }),
      makePhoto({ id: 'entrance', category: 'entrance' }),
    ];
    const sorted = sortPhotosByCategory(photos);
    expect(sorted[0].id).toBe('entrance');
  });

  it('sorts play_area before bathroom', () => {
    const photos = [
      makePhoto({ id: 'bathroom', category: 'bathroom' }),
      makePhoto({ id: 'play', category: 'play_area' }),
    ];
    const sorted = sortPhotosByCategory(photos);
    expect(sorted[0].id).toBe('play');
  });

  it('does not mutate original array', () => {
    const original = [...samplePhotos];
    sortPhotosByCategory(samplePhotos);
    expect(samplePhotos).toEqual(original);
  });
});

describe('getAvailableCategories', () => {
  it('returns unique categories in priority order', () => {
    const categories = getAvailableCategories(samplePhotos);
    // Should include entrance (first priority), play_area, nursing_room, bathroom
    expect(categories).toContain('entrance');
    expect(categories).toContain('play_area');
    expect(categories).toContain('nursing_room');
    expect(categories).toContain('bathroom');
    // entrance should come before bathroom
    expect(categories.indexOf('entrance')).toBeLessThan(categories.indexOf('bathroom'));
  });

  it('returns empty array for empty photos', () => {
    expect(getAvailableCategories([])).toEqual([]);
  });

  it('does not return duplicate categories', () => {
    const categories = getAvailableCategories(samplePhotos);
    const unique = new Set(categories);
    expect(categories.length).toBe(unique.size);
  });
});

describe('computePhotoStats', () => {
  it('counts total photos correctly', () => {
    const stats = computePhotoStats(samplePhotos);
    expect(stats.total).toBe(5);
    expect(stats.byCategory.all).toBe(5);
  });

  it('counts by category', () => {
    const stats = computePhotoStats(samplePhotos);
    expect(stats.byCategory.entrance).toBe(2);
    expect(stats.byCategory.play_area).toBe(1);
    expect(stats.byCategory.nursing_room).toBe(1);
    expect(stats.byCategory.bathroom).toBe(1);
    expect(stats.byCategory.general).toBe(0);
  });

  it('counts verified photos', () => {
    const stats = computePhotoStats(samplePhotos);
    expect(stats.verifiedCount).toBe(2);
  });

  it('finds most recent date', () => {
    const stats = computePhotoStats(samplePhotos);
    expect(stats.mostRecentDate).toBe('2026-04-03T00:00:00Z');
  });

  it('returns undefined mostRecentDate when no dates', () => {
    const photos = [makePhoto({ takenAt: undefined })];
    const stats = computePhotoStats(photos);
    expect(stats.mostRecentDate).toBeUndefined();
  });

  it('handles empty photo array', () => {
    const stats = computePhotoStats([]);
    expect(stats.total).toBe(0);
    expect(stats.verifiedCount).toBe(0);
  });
});

describe('nextPhotoIndex', () => {
  it('returns next index', () => {
    expect(nextPhotoIndex(0, 5)).toBe(1);
    expect(nextPhotoIndex(2, 5)).toBe(3);
  });

  it('wraps around at end', () => {
    expect(nextPhotoIndex(4, 5)).toBe(0);
  });

  it('returns 0 for empty gallery', () => {
    expect(nextPhotoIndex(0, 0)).toBe(0);
  });
});

describe('prevPhotoIndex', () => {
  it('returns previous index', () => {
    expect(prevPhotoIndex(3, 5)).toBe(2);
    expect(prevPhotoIndex(1, 5)).toBe(0);
  });

  it('wraps around at start', () => {
    expect(prevPhotoIndex(0, 5)).toBe(4);
  });

  it('returns 0 for empty gallery', () => {
    expect(prevPhotoIndex(0, 0)).toBe(0);
  });
});

describe('getRelativeDateLabel', () => {
  it('returns "Today" for today in English', () => {
    const todayIso = new Date(NOW).toISOString();
    expect(getRelativeDateLabel(todayIso, 'en')).toBe('Today');
  });

  it('returns "今天" for today in Chinese', () => {
    const todayIso = new Date(NOW).toISOString();
    expect(getRelativeDateLabel(todayIso, 'zh')).toBe('今天');
  });

  it('returns "Yesterday" for yesterday in English', () => {
    const yesterday = new Date(NOW - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeDateLabel(yesterday, 'en')).toBe('Yesterday');
  });

  it('returns "昨天" for yesterday in Chinese', () => {
    const yesterday = new Date(NOW - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeDateLabel(yesterday, 'zh')).toBe('昨天');
  });

  it('returns days ago for recent dates', () => {
    const threeDaysAgo = new Date(NOW - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeDateLabel(threeDaysAgo, 'en')).toBe('3 days ago');
    expect(getRelativeDateLabel(threeDaysAgo, 'zh')).toBe('3 天前');
  });

  it('returns weeks ago for older dates', () => {
    const twoWeeksAgo = new Date(NOW - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeDateLabel(twoWeeksAgo, 'en')).toBe('2 weeks ago');
    expect(getRelativeDateLabel(twoWeeksAgo, 'zh')).toBe('2 週前');
  });

  it('returns months ago for much older dates', () => {
    const twoMonthsAgo = new Date(NOW - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeDateLabel(twoMonthsAgo, 'en')).toBe('2 months ago');
    expect(getRelativeDateLabel(twoMonthsAgo, 'zh')).toBe('2 個月前');
  });

  it('returns years ago for very old dates', () => {
    const twoYearsAgo = new Date(NOW - 730 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeDateLabel(twoYearsAgo, 'en')).toBe('2 years ago');
    expect(getRelativeDateLabel(twoYearsAgo, 'zh')).toBe('2 年前');
  });
});

describe('isValidImageUrl', () => {
  it('accepts valid HTTPS jpg URL', () => {
    expect(isValidImageUrl('https://example.com/photo.jpg')).toBe(true);
  });

  it('accepts valid HTTPS png URL', () => {
    expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
  });

  it('accepts webp URLs', () => {
    expect(isValidImageUrl('https://example.com/photo.webp')).toBe(true);
  });

  it('accepts URLs with query params', () => {
    expect(isValidImageUrl('https://example.com/photo.jpg?width=800')).toBe(true);
  });

  it('rejects non-image URLs', () => {
    expect(isValidImageUrl('https://example.com/page.html')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidImageUrl('')).toBe(false);
  });

  it('rejects non-URL strings', () => {
    expect(isValidImageUrl('not-a-url')).toBe(false);
  });

  it('rejects HTTP (non-HTTPS) by allowing HTTP too since it checks http: or https:', () => {
    // HTTP is allowed by the implementation
    expect(isValidImageUrl('http://example.com/photo.jpg')).toBe(true);
  });
});

describe('generateDemoPhotos', () => {
  it('generates demo photos for a location', () => {
    const photos = generateDemoPhotos('venue-123');
    expect(photos.length).toBeGreaterThan(0);
  });

  it('all photos have required fields', () => {
    const photos = generateDemoPhotos('venue-xyz');
    photos.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.url).toBeTruthy();
      expect(p.category).toBeTruthy();
    });
  });

  it('generates photos with location-specific IDs', () => {
    const photos = generateDemoPhotos('my-loc');
    expect(photos.every((p) => p.id.startsWith('my-loc'))).toBe(true);
  });

  it('includes nursing_room category', () => {
    const photos = generateDemoPhotos('test-loc');
    const categories = photos.map((p) => p.category);
    expect(categories).toContain('nursing_room');
  });
});

describe('getCoverPhoto', () => {
  it('returns null for empty array', () => {
    expect(getCoverPhoto([])).toBeNull();
  });

  it('returns a photo for non-empty array', () => {
    expect(getCoverPhoto(samplePhotos)).not.toBeNull();
  });

  it('prefers entrance photos (high priority)', () => {
    const cover = getCoverPhoto(samplePhotos);
    // entrance is highest priority
    expect(cover?.category).toBe('entrance');
  });
});

describe('groupPhotosByCategory', () => {
  it('groups photos by their category', () => {
    const groups = groupPhotosByCategory(samplePhotos);
    expect(groups.entrance).toHaveLength(2);
    expect(groups.play_area).toHaveLength(1);
    expect(groups.nursing_room).toHaveLength(1);
    expect(groups.bathroom).toHaveLength(1);
  });

  it('returns empty arrays for categories with no photos', () => {
    const groups = groupPhotosByCategory(samplePhotos);
    expect(groups.general).toHaveLength(0);
    expect(groups.food_area).toHaveLength(0);
  });

  it('handles empty photo array', () => {
    const groups = groupPhotosByCategory([]);
    Object.values(groups).forEach((arr) => {
      expect(arr).toHaveLength(0);
    });
  });
});

describe('PHOTO_CATEGORY_LABELS', () => {
  it('has bilingual labels for all categories', () => {
    const categories = ['all', 'entrance', 'facilities', 'play_area', 'food_area', 'nursing_room', 'bathroom', 'parking', 'general'] as const;
    categories.forEach((cat) => {
      expect(PHOTO_CATEGORY_LABELS[cat].en).toBeTruthy();
      expect(PHOTO_CATEGORY_LABELS[cat].zh).toBeTruthy();
    });
  });

  it('has correct Chinese label for nursing_room', () => {
    expect(PHOTO_CATEGORY_LABELS.nursing_room.zh).toBe('哺乳室');
  });

  it('has correct English label for play_area', () => {
    expect(PHOTO_CATEGORY_LABELS.play_area.en).toBe('Play Area');
  });
});
