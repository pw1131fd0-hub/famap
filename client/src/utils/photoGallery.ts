/**
 * Photo Gallery Utility
 * Manages venue photo collections for family-friendly location discovery.
 * Helps parents visually evaluate venues before visiting.
 */

export type PhotoCategory =
  | 'entrance'
  | 'facilities'
  | 'play_area'
  | 'food_area'
  | 'nursing_room'
  | 'bathroom'
  | 'parking'
  | 'general';

export interface VenuePhoto {
  id: string;
  url: string;
  caption?: string;
  category: PhotoCategory;
  contributorId?: string;
  contributorName?: string;
  takenAt?: string; // ISO date string
  likes?: number;
  isVerified?: boolean;
}

export interface PhotoGalleryState {
  photos: VenuePhoto[];
  activeIndex: number;
  isLightboxOpen: boolean;
  activeCategory: PhotoCategory | 'all';
}

export interface PhotoStats {
  total: number;
  byCategory: Record<PhotoCategory | 'all', number>;
  mostRecentDate?: string;
  verifiedCount: number;
}

// Category labels in English and Chinese
export const PHOTO_CATEGORY_LABELS: Record<
  PhotoCategory | 'all',
  { zh: string; en: string }
> = {
  all: { zh: '全部', en: 'All' },
  entrance: { zh: '入口', en: 'Entrance' },
  facilities: { zh: '設施', en: 'Facilities' },
  play_area: { zh: '遊樂區', en: 'Play Area' },
  food_area: { zh: '餐飲區', en: 'Food Area' },
  nursing_room: { zh: '哺乳室', en: 'Nursing Room' },
  bathroom: { zh: '廁所', en: 'Bathroom' },
  parking: { zh: '停車場', en: 'Parking' },
  general: { zh: '一般', en: 'General' },
};

// Priority order for categories in the gallery
const CATEGORY_PRIORITY: PhotoCategory[] = [
  'entrance',
  'play_area',
  'nursing_room',
  'facilities',
  'food_area',
  'bathroom',
  'parking',
  'general',
];

/**
 * Filter photos by category.
 * Returns all photos when category is 'all'.
 */
export function filterPhotosByCategory(
  photos: VenuePhoto[],
  category: PhotoCategory | 'all'
): VenuePhoto[] {
  if (category === 'all') return photos;
  return photos.filter((p) => p.category === category);
}

/**
 * Sort photos: verified first, then by date (newest first), then by likes.
 */
export function sortPhotos(photos: VenuePhoto[]): VenuePhoto[] {
  return [...photos].sort((a, b) => {
    // Verified photos first
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;

    // More recent first
    if (a.takenAt && b.takenAt) {
      return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
    }
    if (a.takenAt) return -1;
    if (b.takenAt) return 1;

    // More liked first
    const likesA = a.likes ?? 0;
    const likesB = b.likes ?? 0;
    return likesB - likesA;
  });
}

/**
 * Sort photos by category priority (most useful categories for parents shown first).
 */
export function sortPhotosByCategory(photos: VenuePhoto[]): VenuePhoto[] {
  return [...photos].sort((a, b) => {
    const indexA = CATEGORY_PRIORITY.indexOf(a.category);
    const indexB = CATEGORY_PRIORITY.indexOf(b.category);
    const priorityA = indexA === -1 ? CATEGORY_PRIORITY.length : indexA;
    const priorityB = indexB === -1 ? CATEGORY_PRIORITY.length : indexB;
    return priorityA - priorityB;
  });
}

/**
 * Get unique categories present in a photo collection.
 */
export function getAvailableCategories(photos: VenuePhoto[]): PhotoCategory[] {
  const categories = new Set<PhotoCategory>();
  photos.forEach((p) => categories.add(p.category));
  // Return in priority order
  return CATEGORY_PRIORITY.filter((c) => categories.has(c));
}

/**
 * Compute statistics for a photo collection.
 */
export function computePhotoStats(photos: VenuePhoto[]): PhotoStats {
  const byCategory: Record<PhotoCategory | 'all', number> = {
    all: photos.length,
    entrance: 0,
    facilities: 0,
    play_area: 0,
    food_area: 0,
    nursing_room: 0,
    bathroom: 0,
    parking: 0,
    general: 0,
  };

  let mostRecentDate: string | undefined;
  let verifiedCount = 0;

  photos.forEach((p) => {
    byCategory[p.category]++;
    if (p.isVerified) verifiedCount++;
    if (p.takenAt) {
      if (!mostRecentDate || p.takenAt > mostRecentDate) {
        mostRecentDate = p.takenAt;
      }
    }
  });

  return { total: photos.length, byCategory, mostRecentDate, verifiedCount };
}

/**
 * Navigate to the next photo (wraps around).
 */
export function nextPhotoIndex(current: number, total: number): number {
  if (total === 0) return 0;
  return (current + 1) % total;
}

/**
 * Navigate to the previous photo (wraps around).
 */
export function prevPhotoIndex(current: number, total: number): number {
  if (total === 0) return 0;
  return (current - 1 + total) % total;
}

/**
 * Get a human-readable relative date string (bilingual).
 */
export function getRelativeDateLabel(
  isoDate: string,
  language: 'zh' | 'en'
): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return language === 'zh' ? '今天' : 'Today';
  if (diffDays === 1) return language === 'zh' ? '昨天' : 'Yesterday';
  if (diffDays < 7)
    return language === 'zh' ? `${diffDays} 天前` : `${diffDays} days ago`;
  if (diffDays < 30)
    return language === 'zh'
      ? `${Math.floor(diffDays / 7)} 週前`
      : `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365)
    return language === 'zh'
      ? `${Math.floor(diffDays / 30)} 個月前`
      : `${Math.floor(diffDays / 30)} months ago`;
  return language === 'zh'
    ? `${Math.floor(diffDays / 365)} 年前`
    : `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Check if a URL is a valid image URL (basic validation).
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

/**
 * Generate a placeholder photo set for demo/testing purposes.
 */
export function generateDemoPhotos(locationId: string): VenuePhoto[] {
  return [
    {
      id: `${locationId}-1`,
      url: `https://picsum.photos/seed/${locationId}-entrance/800/600.jpg`,
      caption: 'Main entrance',
      category: 'entrance',
      isVerified: true,
      takenAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 12,
    },
    {
      id: `${locationId}-2`,
      url: `https://picsum.photos/seed/${locationId}-play/800/600.jpg`,
      caption: 'Play area for kids',
      category: 'play_area',
      isVerified: true,
      takenAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 24,
    },
    {
      id: `${locationId}-3`,
      url: `https://picsum.photos/seed/${locationId}-nursing/800/600.jpg`,
      caption: 'Nursing room',
      category: 'nursing_room',
      isVerified: false,
      takenAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 8,
    },
  ];
}

/**
 * Get the cover photo for a venue (best photo to show as thumbnail).
 */
export function getCoverPhoto(photos: VenuePhoto[]): VenuePhoto | null {
  if (photos.length === 0) return null;
  const sorted = sortPhotosByCategory(sortPhotos(photos));
  return sorted[0];
}

/**
 * Group photos by category for display.
 */
export function groupPhotosByCategory(
  photos: VenuePhoto[]
): Record<PhotoCategory, VenuePhoto[]> {
  const groups: Record<PhotoCategory, VenuePhoto[]> = {
    entrance: [],
    facilities: [],
    play_area: [],
    food_area: [],
    nursing_room: [],
    bathroom: [],
    parking: [],
    general: [],
  };

  photos.forEach((p) => {
    groups[p.category].push(p);
  });

  return groups;
}
