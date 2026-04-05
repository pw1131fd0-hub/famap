/**
 * Configuration for map cities and marker styles
 */

import L from 'leaflet';

/**
 * City configuration with coordinates and zoom levels
 */
export type CityKey = 'taipei' | 'new_taipei' | 'keelung' | 'taoyuan';

export interface City {
  key: CityKey;
  name: string;
  description: string;
  center: [number, number];
  defaultZoom: number;
}

export const CITIES: City[] = [
  {
    key: 'taipei',
    name: '台北市',
    description: '首都核心，親子設施最密集',
    center: [25.0330, 121.5654],
    defaultZoom: 13
  },
  {
    key: 'new_taipei',
    name: '新北市',
    description: '大台北生活圈，山水景點多',
    center: [25.0169, 121.4628],
    defaultZoom: 12
  },
  {
    key: 'keelung',
    name: '基隆市',
    description: '北台灣門戶，山海親子景點',
    center: [25.1276, 121.7440],
    defaultZoom: 13
  },
  {
    key: 'taoyuan',
    name: '桃園市',
    description: '機場所在地，親子樂園豐富',
    center: [24.9937, 121.3000],
    defaultZoom: 12
  },
];

/**
 * Day names in Traditional Chinese
 */
export const DAY_NAMES_ZH: Record<string, string> = {
  monday: '一',
  tuesday: '二',
  wednesday: '三',
  thursday: '四',
  friday: '五',
  saturday: '六',
  sunday: '日',
};

/**
 * Marker style configuration by category
 */
export const MARKER_CONFIG: Record<string, { color: string; emoji: string; label: string }> = {
  park: { color: '#22c55e', emoji: '🌳', label: 'Park' },
  nursing_room: { color: '#ec4899', emoji: '👶', label: 'Nursing' },
  restaurant: { color: '#f97316', emoji: '🍽️', label: 'Food' },
  medical: { color: '#ef4444', emoji: '🏥', label: 'Medical' },
  attraction: { color: '#8b5cf6', emoji: '🎪', label: 'Attraction' },
  other: { color: '#6b7280', emoji: '📍', label: 'Location' },
};

/**
 * Crowd level colors for map markers
 * When a venue has typical crowd data, the marker color reflects it
 */
export const CROWD_LEVEL_COLORS: Record<string, { color: string; label: string }> = {
  light: { color: '#22c55e', label: 'Light crowds' },      // Green - usually quiet
  moderate: { color: '#eab308', label: 'Moderate crowds' }, // Yellow - typical
  heavy: { color: '#ef4444', label: 'Heavy crowds' },       // Red - very busy
};

/**
 * Create a glowing marker icon for a given category
 * Optionally shows crowd level via border color indicator
 */
export const createGlowingIcon = (category: string, crowdLevel?: 'light' | 'moderate' | 'heavy') => {
  const config = MARKER_CONFIG[category] || MARKER_CONFIG.other;
  const { color, emoji } = config;

  // If crowd level is provided, use a colored ring indicator
  const hasCrowdIndicator = crowdLevel && CROWD_LEVEL_COLORS[crowdLevel];
  const crowdColor = hasCrowdIndicator ? CROWD_LEVEL_COLORS[crowdLevel].color : null;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid ${crowdColor || 'white'};
      box-shadow: 0 0 12px ${color}, 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      ${crowdColor ? `box-shadow: 0 0 12px ${color}, 0 0 8px ${crowdColor}, 0 2px 8px rgba(0,0,0,0.3);` : ''}
    ">
      <div style="transform: rotate(45deg);">${emoji}</div>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

/**
 * Initialize Leaflet default marker icons for React
 */
export const initializeLeafletIcons = () => {
  // Fix for default marker icons in Leaflet with React
  // @ts-expect-error - Leaflet icon hack
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};
