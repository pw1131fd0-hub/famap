/**
 * Accessibility utilities for enhancing keyboard navigation and screen reader support
 */

/**
 * Get accessible label for location category
 */
export function getCategoryA11yLabel(category: string, language: string): string {
  const labels: Record<string, Record<string, string>> = {
    zh: {
      park: '公園',
      nursing_room: '哺乳室',
      restaurant: '餐廳',
      medical: '醫療設施',
    },
    en: {
      park: 'Park',
      nursing_room: 'Nursing Room',
      restaurant: 'Restaurant',
      medical: 'Medical Facility',
    },
  };

  return labels[language]?.[category] || category;
}

/**
 * Get accessible label for facility
 */
export function getFacilityA11yLabel(facility: string, language: string): string {
  const labels: Record<string, Record<string, string>> = {
    zh: {
      changing_table: '換尿布台',
      high_chair: '高腳椅',
      stroller_accessible: '推車友善',
      public_toilet: '公共廁所',
      nursing_room: '哺乳室',
      drinking_water: '飲用水',
      wheelchair_accessible: '輪椅友善',
      air_conditioned: '有冷氣',
      swimming_pool: '游泳池',
      kids_menu: '兒童菜單',
      playground: '遊樂場',
      medical: '醫療設施',
    },
    en: {
      changing_table: 'Changing Table',
      high_chair: 'High Chair',
      stroller_accessible: 'Stroller Accessible',
      public_toilet: 'Public Toilet',
      nursing_room: 'Nursing Room',
      drinking_water: 'Drinking Water',
      wheelchair_accessible: 'Wheelchair Accessible',
      air_conditioned: 'Air Conditioned',
      swimming_pool: 'Swimming Pool',
      kids_menu: "Kids Menu",
      playground: 'Playground',
      medical: 'Medical Facility',
    },
  };

  return labels[language]?.[facility] || facility;
}

/**
 * Create a screen reader announcement for dynamic content updates
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  // Remove existing announcer if any
  const existingAnnouncer = document.getElementById('sr-announcer');
  if (existingAnnouncer) {
    existingAnnouncer.remove();
  }

  const announcer = document.createElement('div');
  announcer.id = 'sr-announcer';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;

  document.body.appendChild(announcer);

  // Remove after announcement
  setTimeout(() => announcer.remove(), 1000);
}

/**
 * Handle keyboard navigation for modals/panels
 */
export function handlePanelKeydown(
  event: React.KeyboardEvent,
  onClose: () => void,
  onAction?: () => void
) {
  // Escape key closes panel
  if (event.key === 'Escape') {
    event.preventDefault();
    onClose();
  }

  // Enter/Space on action buttons
  if ((event.key === 'Enter' || event.key === ' ') && onAction) {
    event.preventDefault();
    onAction();
  }
}

/**
 * Get distance announcement in user's language
 */
export function getDistanceAnnouncement(distance: number, language: string): string {
  if (language === 'zh') {
    if (distance < 1) {
      return `距離少於1公里`;
    } else if (distance < 10) {
      return `距離約${distance.toFixed(1)}公里`;
    } else {
      return `距離約${Math.round(distance)}公里`;
    }
  } else {
    if (distance < 1) {
      return `Less than 1 km away`;
    } else if (distance < 10) {
      return `About ${distance.toFixed(1)} km away`;
    } else {
      return `About ${Math.round(distance)} km away`;
    }
  }
}
