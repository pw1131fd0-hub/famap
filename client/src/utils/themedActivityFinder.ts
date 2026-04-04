/**
 * Themed Activity Finder Utility
 * Helps Taiwan families discover venues by theme, occasion, and age group.
 * Addresses PRD's "Fragmented Data" pain point by offering curated discovery
 * beyond standard map browsing.
 */

import type { Location } from '../types';

// ─── Theme Definitions ────────────────────────────────────────────────────────

export type ActivityTheme =
  | 'outdoor_adventure'
  | 'creative_arts'
  | 'educational'
  | 'sensory_play'
  | 'water_play'
  | 'sports_fitness'
  | 'nature_exploration'
  | 'cultural_heritage';

export type OccasionType =
  | 'birthday_celebration'
  | 'rainy_day_indoor'
  | 'summer_heat_escape'
  | 'first_outing'
  | 'budget_friendly'
  | 'weekend_adventure'
  | 'school_holiday'
  | 'grandparent_visit';

export type AgeGroup =
  | 'infant'        // 0–1 year
  | 'toddler'       // 1–3 years
  | 'preschool'     // 3–5 years
  | 'early_school'  // 6–8 years
  | 'tween'         // 9–12 years
  | 'mixed';        // All ages

export interface ThemeDefinition {
  id: ActivityTheme;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  icon: string;
  keywords: string[];       // facility/category keywords that match
  categoryBonus: string[];  // location categories that get a score bonus
}

export interface OccasionDefinition {
  id: OccasionType;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  icon: string;
  requiredFeatures: string[];    // must-have facilities
  preferredFeatures: string[];   // nice-to-have facilities
  avoidFeatures: string[];       // disqualifying facilities
  weatherPreference: 'indoor' | 'outdoor' | 'any';
  budgetSensitive: boolean;
}

export interface AgeGroupDefinition {
  id: AgeGroup;
  label: { zh: string; en: string };
  minAge: number;
  maxAge: number;
  icon: string;
  requiredFacilities: string[];   // must-have for safety/usability
  weightedFacilities: string[];   // nice-to-have, increase score
}

export interface ThemedVenueResult {
  location: Location;
  themeScore: number;         // 0–100
  occasionScore: number;      // 0–100
  ageScore: number;           // 0–100
  totalScore: number;         // weighted composite
  matchReasons: { zh: string; en: string }[];
  warnings: { zh: string; en: string }[];
  highlights: string[];       // facility highlights
}

export interface ThemedSearchParams {
  theme?: ActivityTheme;
  occasion?: OccasionType;
  ageGroup?: AgeGroup;
  maxResults?: number;
}

export interface ThemedSearchResult {
  params: ThemedSearchParams;
  results: ThemedVenueResult[];
  totalMatched: number;
  appliedFilters: string[];
}

// ─── Static Definitions ───────────────────────────────────────────────────────

export const ACTIVITY_THEMES: ThemeDefinition[] = [
  {
    id: 'outdoor_adventure',
    label: { zh: '戶外冒險', en: 'Outdoor Adventure' },
    description: { zh: '跑跳攀爬，親近自然的戶外活動', en: 'Running, climbing, and exploring in the fresh air' },
    icon: '🏕️',
    keywords: ['playground', 'park', 'trail', 'climbing', 'sandbox', 'outdoor', 'slide', 'swing'],
    categoryBonus: ['park'],
  },
  {
    id: 'creative_arts',
    label: { zh: '創意藝術', en: 'Creative Arts' },
    description: { zh: '繪畫、手工藝、音樂與創意表達', en: 'Drawing, crafts, music, and creative expression' },
    icon: '🎨',
    keywords: ['art', 'craft', 'music', 'workshop', 'pottery', 'creative', 'painting', 'drawing'],
    categoryBonus: ['attraction'],
  },
  {
    id: 'educational',
    label: { zh: '寓教於樂', en: 'Educational Fun' },
    description: { zh: '邊玩邊學的知識探索體驗', en: 'Learning through play and exploration' },
    icon: '🔬',
    keywords: ['museum', 'science', 'discovery', 'nature', 'library', 'exhibit', 'educational', 'zoo'],
    categoryBonus: ['attraction', 'medical'],
  },
  {
    id: 'sensory_play',
    label: { zh: '感官遊戲', en: 'Sensory Play' },
    description: { zh: '刺激感官發展的多元體驗活動', en: 'Activities that stimulate all the senses' },
    icon: '🌈',
    keywords: ['sensory', 'sand', 'water', 'texture', 'soft_play', 'ball_pit', 'foam', 'trampoline'],
    categoryBonus: ['park', 'attraction'],
  },
  {
    id: 'water_play',
    label: { zh: '玩水趣', en: 'Water Play' },
    description: { zh: '游泳池、水上樂園和戲水區', en: 'Pools, water parks, and splash zones' },
    icon: '💧',
    keywords: ['pool', 'water', 'splash', 'swim', 'spray', 'water_park', 'paddling'],
    categoryBonus: ['park', 'attraction'],
  },
  {
    id: 'sports_fitness',
    label: { zh: '運動健身', en: 'Sports & Fitness' },
    description: { zh: '培養運動習慣的體育活動', en: 'Sports and physical activities to build healthy habits' },
    icon: '⚽',
    keywords: ['sports', 'gym', 'court', 'field', 'bike', 'skating', 'running', 'ball'],
    categoryBonus: ['park'],
  },
  {
    id: 'nature_exploration',
    label: { zh: '自然探索', en: 'Nature Exploration' },
    description: { zh: '認識台灣生態、植物與動物', en: "Discovering Taiwan's ecology, plants, and animals" },
    icon: '🌿',
    keywords: ['forest', 'garden', 'farm', 'animals', 'ecology', 'butterfly', 'river', 'mountain'],
    categoryBonus: ['park', 'attraction'],
  },
  {
    id: 'cultural_heritage',
    label: { zh: '文化古蹟', en: 'Cultural Heritage' },
    description: { zh: '認識台灣歷史、文化與傳統', en: "Exploring Taiwan's history, culture, and traditions" },
    icon: '🏯',
    keywords: ['temple', 'heritage', 'historic', 'traditional', 'culture', 'museum', 'art', 'history'],
    categoryBonus: ['attraction'],
  },
];

export const OCCASIONS: OccasionDefinition[] = [
  {
    id: 'birthday_celebration',
    label: { zh: '生日慶祝', en: 'Birthday Celebration' },
    description: { zh: '適合生日派對的場地', en: 'Venues suitable for birthday parties' },
    icon: '🎂',
    requiredFeatures: [],
    preferredFeatures: ['party_room', 'restaurant', 'indoor', 'booking'],
    avoidFeatures: [],
    weatherPreference: 'any',
    budgetSensitive: false,
  },
  {
    id: 'rainy_day_indoor',
    label: { zh: '下雨天室內', en: 'Rainy Day Indoor' },
    description: { zh: '颱風天、雨天的室內替代方案', en: 'Indoor alternatives for rainy or typhoon days' },
    icon: '🌧️',
    requiredFeatures: ['indoor'],
    preferredFeatures: ['air_conditioning', 'wifi', 'restaurant'],
    avoidFeatures: [],
    weatherPreference: 'indoor',
    budgetSensitive: false,
  },
  {
    id: 'summer_heat_escape',
    label: { zh: '夏日消暑', en: 'Summer Heat Escape' },
    description: { zh: '台灣炎夏的涼爽去處', en: "Cool refuges from Taiwan's scorching summer" },
    icon: '🌊',
    requiredFeatures: [],
    preferredFeatures: ['air_conditioning', 'pool', 'water_play', 'shade', 'indoor'],
    avoidFeatures: [],
    weatherPreference: 'any',
    budgetSensitive: false,
  },
  {
    id: 'first_outing',
    label: { zh: '寶寶初體驗', en: "Baby's First Outing" },
    description: { zh: '帶嬰幼兒外出的安心首選', en: 'Safe and comfortable venues for very young babies' },
    icon: '👶',
    requiredFeatures: ['changing_table', 'nursing_room'],
    preferredFeatures: ['stroller_accessible', 'high_chair', 'quiet', 'parking'],
    avoidFeatures: [],
    weatherPreference: 'indoor',
    budgetSensitive: false,
  },
  {
    id: 'budget_friendly',
    label: { zh: '省錢出遊', en: 'Budget-Friendly Outing' },
    description: { zh: '免費或低費用的親子景點', en: 'Free or low-cost family venues' },
    icon: '💰',
    requiredFeatures: [],
    preferredFeatures: ['free_entry', 'public_park', 'parking'],
    avoidFeatures: [],
    weatherPreference: 'any',
    budgetSensitive: true,
  },
  {
    id: 'weekend_adventure',
    label: { zh: '週末冒險', en: 'Weekend Adventure' },
    description: { zh: '充實週末時光的精彩活動', en: 'Exciting activities to fill a full weekend day' },
    icon: '🗺️',
    requiredFeatures: [],
    preferredFeatures: ['parking', 'restaurant', 'toilet', 'multiple_activities'],
    avoidFeatures: [],
    weatherPreference: 'any',
    budgetSensitive: false,
  },
  {
    id: 'school_holiday',
    label: { zh: '學校假期', en: 'School Holiday' },
    description: { zh: '寒暑假、連假的熱門選擇', en: 'Popular spots for school breaks and long weekends' },
    icon: '🎒',
    requiredFeatures: [],
    preferredFeatures: ['booking', 'restaurant', 'parking', 'indoor', 'outdoor'],
    avoidFeatures: [],
    weatherPreference: 'any',
    budgetSensitive: false,
  },
  {
    id: 'grandparent_visit',
    label: { zh: '阿公阿嬤同遊', en: 'Grandparent Visit' },
    description: { zh: '老少咸宜、無障礙的溫馨親子景點', en: 'Accessible venues for three-generation family outings' },
    icon: '👴',
    requiredFeatures: [],
    preferredFeatures: ['wheelchair_accessible', 'stroller_accessible', 'restaurant', 'shade', 'seating'],
    avoidFeatures: [],
    weatherPreference: 'any',
    budgetSensitive: false,
  },
];

export const AGE_GROUPS: AgeGroupDefinition[] = [
  {
    id: 'infant',
    label: { zh: '嬰兒 (0–1歲)', en: 'Infant (0–1 yr)' },
    minAge: 0,
    maxAge: 1,
    icon: '🍼',
    requiredFacilities: ['changing_table'],
    weightedFacilities: ['nursing_room', 'stroller_accessible', 'quiet', 'parking'],
  },
  {
    id: 'toddler',
    label: { zh: '學步兒 (1–3歲)', en: 'Toddler (1–3 yrs)' },
    minAge: 1,
    maxAge: 3,
    icon: '🐥',
    requiredFacilities: ['changing_table'],
    weightedFacilities: ['stroller_accessible', 'high_chair', 'soft_play', 'nursing_room', 'fenced_area'],
  },
  {
    id: 'preschool',
    label: { zh: '幼兒 (3–5歲)', en: 'Preschool (3–5 yrs)' },
    minAge: 3,
    maxAge: 5,
    icon: '🧸',
    requiredFacilities: [],
    weightedFacilities: ['playground', 'high_chair', 'changing_table', 'soft_play', 'shallow_pool'],
  },
  {
    id: 'early_school',
    label: { zh: '小學低年級 (6–8歲)', en: 'Early School (6–8 yrs)' },
    minAge: 6,
    maxAge: 8,
    icon: '🎒',
    requiredFacilities: [],
    weightedFacilities: ['playground', 'sports_area', 'bike_path', 'climbing'],
  },
  {
    id: 'tween',
    label: { zh: '高年級 (9–12歲)', en: 'Tween (9–12 yrs)' },
    minAge: 9,
    maxAge: 12,
    icon: '🧩',
    requiredFacilities: [],
    weightedFacilities: ['sports_area', 'bike_path', 'swimming', 'adventure_park', 'escape_room'],
  },
  {
    id: 'mixed',
    label: { zh: '混齡皆宜', en: 'All Ages Welcome' },
    minAge: 0,
    maxAge: 99,
    icon: '👨‍👩‍👧‍👦',
    requiredFacilities: [],
    weightedFacilities: ['playground', 'restaurant', 'toilet', 'parking', 'stroller_accessible'],
  },
];

// ─── Scoring Functions ────────────────────────────────────────────────────────

/**
 * Calculates how well a location matches a given activity theme.
 */
export function scoreByTheme(location: Location, theme: ThemeDefinition): number {
  let score = 0;
  const facilitySet = new Set(location.facilities.map(f => f.toLowerCase()));
  const categoryMatch = theme.categoryBonus.includes(location.category);

  // Category bonus
  if (categoryMatch) score += 25;

  // Keyword matching against facilities and activity types
  const activityKeywords = [
    ...(location.activity?.activityTypes ?? []),
    ...(location.activity?.equipment ?? []),
    ...location.facilities,
    location.category,
  ].map(k => k.toLowerCase());

  let keywordMatches = 0;
  for (const keyword of theme.keywords) {
    const kw = keyword.toLowerCase();
    if (activityKeywords.some(ak => ak.includes(kw) || kw.includes(ak))) {
      keywordMatches++;
    }
    if (facilitySet.has(kw)) keywordMatches++;
  }

  score += Math.min(60, keywordMatches * 10);

  // Rating bonus
  if (location.averageRating >= 4.5) score += 15;
  else if (location.averageRating >= 4.0) score += 10;
  else if (location.averageRating >= 3.5) score += 5;

  return Math.min(100, score);
}

/**
 * Calculates how well a location matches a given occasion.
 */
export function scoreByOccasion(location: Location, occasion: OccasionDefinition): number {
  let score = 50; // Base score
  const facilitySet = new Set(location.facilities.map(f => f.toLowerCase()));

  // Required features check — hard disqualifier
  for (const required of occasion.requiredFeatures) {
    if (required === 'indoor' && !location.weatherCoverage?.isIndoor) {
      return 0; // Disqualified
    }
    if (required === 'changing_table' && !facilitySet.has('changing_table')) {
      return 0; // Disqualified
    }
    if (required === 'nursing_room' && !facilitySet.has('nursing_room')) {
      return 0; // Disqualified
    }
  }

  // Preferred features scoring
  let preferredMatches = 0;
  for (const preferred of occasion.preferredFeatures) {
    if (facilitySet.has(preferred.toLowerCase())) {
      preferredMatches++;
    }
    // Check specific fields
    if (preferred === 'indoor' && location.weatherCoverage?.isIndoor) preferredMatches++;
    if (preferred === 'air_conditioning' && location.climateComfort?.hasAirConditioning) preferredMatches++;
    if (preferred === 'stroller_accessible' && location.accessibility?.wheelchairAccessible) preferredMatches++;
    if (preferred === 'quiet' && location.crowding?.averageCrowding === 'light') preferredMatches++;
    if (preferred === 'parking' && location.parking?.available) preferredMatches++;
  }

  const maxPreferred = Math.max(occasion.preferredFeatures.length, 1);
  score += Math.round((preferredMatches / maxPreferred) * 40);

  // Avoid features check — moderate penalty
  for (const avoid of occasion.avoidFeatures) {
    if (facilitySet.has(avoid.toLowerCase())) {
      score -= 20;
    }
  }

  // Budget-friendly bonus
  if (occasion.budgetSensitive && location.pricing?.isFree) {
    score += 10;
  }

  // Weather preference
  if (occasion.weatherPreference === 'indoor' && location.weatherCoverage?.isIndoor) {
    score += 10;
  } else if (occasion.weatherPreference === 'outdoor' && !location.weatherCoverage?.isIndoor) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates how well a location matches a given age group.
 */
export function scoreByAgeGroup(location: Location, ageGroup: AgeGroupDefinition): number {
  let score = 50; // Base score
  const facilitySet = new Set(location.facilities.map(f => f.toLowerCase()));

  // Check location age range compatibility
  if (location.ageRange) {
    const locMin = location.ageRange.minAge ?? 0;
    const locMax = location.ageRange.maxAge ?? 99;
    const overlap =
      Math.min(ageGroup.maxAge, locMax) - Math.max(ageGroup.minAge, locMin);
    if (overlap < 0) return 10; // Poor match but not zero
    if (overlap > 0) score += 20;
  }

  // Required facilities — hard disqualifier
  for (const required of ageGroup.requiredFacilities) {
    if (!facilitySet.has(required.toLowerCase())) {
      return 20; // Low but not zero — still somewhat possible
    }
  }

  // Weighted facilities scoring
  let weightedMatches = 0;
  for (const weighted of ageGroup.weightedFacilities) {
    if (facilitySet.has(weighted.toLowerCase())) {
      weightedMatches++;
    }
  }

  const maxWeighted = Math.max(ageGroup.weightedFacilities.length, 1);
  score += Math.round((weightedMatches / maxWeighted) * 30);

  return Math.max(0, Math.min(100, score));
}

/**
 * Generates human-readable match reasons for a venue result.
 */
export function generateMatchReasons(
  location: Location,
  theme: ThemeDefinition | null,
  occasion: OccasionDefinition | null,
  ageGroup: AgeGroupDefinition | null,
): { zh: string; en: string }[] {
  const reasons: { zh: string; en: string }[] = [];

  if (theme && location.category === 'park') {
    reasons.push({ zh: '公園類型完美匹配', en: 'Park category is a perfect match' });
  }

  if (theme && location.activity?.activityTypes && location.activity.activityTypes.length > 0) {
    reasons.push({
      zh: `提供活動：${location.activity.activityTypes.slice(0, 2).join('、')}`,
      en: `Activities available: ${location.activity.activityTypes.slice(0, 2).join(', ')}`,
    });
  }

  if (occasion?.weatherPreference === 'indoor' && location.weatherCoverage?.isIndoor) {
    reasons.push({ zh: '室內場地，不受天氣影響', en: 'Indoor venue, weather-proof' });
  }

  if (ageGroup && location.facilities.includes('changing_table')) {
    reasons.push({ zh: '設有尿布台，嬰幼兒友善', en: 'Has changing table, baby-friendly' });
  }

  if (location.averageRating >= 4.5) {
    reasons.push({ zh: `高評分 ${location.averageRating}/5`, en: `Highly rated ${location.averageRating}/5` });
  }

  if (location.pricing?.isFree) {
    reasons.push({ zh: '免費入場', en: 'Free admission' });
  }

  if (location.parking?.available) {
    reasons.push({ zh: '提供停車場', en: 'Parking available' });
  }

  return reasons.slice(0, 3); // Max 3 reasons
}

/**
 * Generates warnings for a venue result.
 */
export function generateWarnings(
  location: Location,
  ageGroup: AgeGroupDefinition | null,
): { zh: string; en: string }[] {
  const warnings: { zh: string; en: string }[] = [];

  if (ageGroup?.id === 'infant' && !location.facilities.includes('nursing_room')) {
    warnings.push({ zh: '無哺乳室', en: 'No nursing room' });
  }

  if (location.crowding?.averageCrowding === 'heavy') {
    warnings.push({ zh: '通常較為擁擠', en: 'Usually crowded' });
  }

  if (!location.parking?.available && location.category !== 'nursing_room') {
    warnings.push({ zh: '無停車場，建議搭乘大眾運輸', en: 'No parking, consider public transit' });
  }

  return warnings;
}

// ─── Main Search Function ─────────────────────────────────────────────────────

/**
 * Performs themed activity search across a list of locations.
 */
export function searchByTheme(
  locations: Location[],
  params: ThemedSearchParams,
): ThemedSearchResult {
  const { theme: themeId, occasion: occasionId, ageGroup: ageGroupId, maxResults = 10 } = params;

  const theme = themeId ? ACTIVITY_THEMES.find(t => t.id === themeId) ?? null : null;
  const occasion = occasionId ? OCCASIONS.find(o => o.id === occasionId) ?? null : null;
  const ageGroup = ageGroupId ? AGE_GROUPS.find(a => a.id === ageGroupId) ?? null : null;

  const appliedFilters: string[] = [];
  if (theme) appliedFilters.push(theme.label.en);
  if (occasion) appliedFilters.push(occasion.label.en);
  if (ageGroup) appliedFilters.push(ageGroup.label.en);

  const results: ThemedVenueResult[] = locations.map(location => {
    const themeScore = theme ? scoreByTheme(location, theme) : 50;
    const occasionScore = occasion ? scoreByOccasion(location, occasion) : 50;
    const ageScore = ageGroup ? scoreByAgeGroup(location, ageGroup) : 50;

    // Weighted composite score
    let totalScore: number;
    if (theme && occasion && ageGroup) {
      totalScore = themeScore * 0.4 + occasionScore * 0.35 + ageScore * 0.25;
    } else if (theme && ageGroup) {
      totalScore = themeScore * 0.6 + ageScore * 0.4;
    } else if (occasion && ageGroup) {
      totalScore = occasionScore * 0.6 + ageScore * 0.4;
    } else if (theme && occasion) {
      totalScore = themeScore * 0.55 + occasionScore * 0.45;
    } else if (theme) {
      totalScore = themeScore;
    } else if (occasion) {
      totalScore = occasionScore;
    } else if (ageGroup) {
      totalScore = ageScore;
    } else {
      totalScore = location.averageRating * 20; // Fallback to rating
    }

    const highlights = location.facilities.slice(0, 4);
    const matchReasons = generateMatchReasons(location, theme, occasion, ageGroup);
    const warnings = generateWarnings(location, ageGroup);

    return {
      location,
      themeScore,
      occasionScore,
      ageScore,
      totalScore: Math.round(totalScore),
      matchReasons,
      warnings,
      highlights,
    };
  });

  // Sort by total score descending, filter out very poor matches
  const filtered = results
    .filter(r => r.totalScore > 15)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, maxResults);

  return {
    params,
    results: filtered,
    totalMatched: filtered.length,
    appliedFilters,
  };
}

/**
 * Returns the top recommended theme for a given location.
 */
export function getTopThemeForLocation(location: Location): ThemeDefinition | null {
  let bestTheme: ThemeDefinition | null = null;
  let bestScore = 0;

  for (const theme of ACTIVITY_THEMES) {
    const score = scoreByTheme(location, theme);
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }

  return bestScore > 30 ? bestTheme : null;
}

/**
 * Returns a list of occasions a location is suitable for.
 */
export function getSuitableOccasions(location: Location): OccasionDefinition[] {
  return OCCASIONS.filter(occasion => {
    const score = scoreByOccasion(location, occasion);
    return score >= 50;
  });
}

/**
 * Returns the recommended age groups for a location.
 */
export function getRecommendedAgeGroups(location: Location): AgeGroupDefinition[] {
  return AGE_GROUPS.filter(ageGroup => {
    const score = scoreByAgeGroup(location, ageGroup);
    return score >= 60;
  });
}

/**
 * Returns featured theme collections (curated selections).
 */
export function getFeaturedCollections(): {
  id: string;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  icon: string;
  searchParams: ThemedSearchParams;
}[] {
  return [
    {
      id: 'baby_safe',
      label: { zh: '寶寶安心遊', en: 'Safe for Babies' },
      description: { zh: '最適合0-2歲嬰幼兒的安心場所', en: 'Best venues for infants and toddlers' },
      icon: '👶',
      searchParams: { ageGroup: 'infant', occasion: 'first_outing' },
    },
    {
      id: 'rainy_day',
      label: { zh: '雨天救星', en: 'Rainy Day Rescue' },
      description: { zh: '下雨天也能玩得開心的室內景點', en: 'Indoor venues for rainy days in Taiwan' },
      icon: '🌧️',
      searchParams: { occasion: 'rainy_day_indoor' },
    },
    {
      id: 'summer_cool',
      label: { zh: '夏日消暑', en: 'Beat the Heat' },
      description: { zh: '台灣夏天最涼爽的親子去處', en: 'Cool spots for Taiwan summer days' },
      icon: '❄️',
      searchParams: { occasion: 'summer_heat_escape' },
    },
    {
      id: 'free_outing',
      label: { zh: '免費好去處', en: 'Free Outings' },
      description: { zh: '不花錢也能玩得精彩', en: 'Great venues that cost nothing to enter' },
      icon: '🆓',
      searchParams: { occasion: 'budget_friendly', theme: 'outdoor_adventure' },
    },
    {
      id: 'nature_kids',
      label: { zh: '自然小探索家', en: 'Little Nature Explorers' },
      description: { zh: '在大自然中學習成長', en: 'Learn and grow in Taiwan nature' },
      icon: '🌿',
      searchParams: { theme: 'nature_exploration', ageGroup: 'preschool' },
    },
    {
      id: 'grandparents',
      label: { zh: '三代同堂出遊', en: 'Three-Generation Trip' },
      description: { zh: '老少咸宜、無障礙的溫馨親子景點', en: 'Accessible venues for whole family' },
      icon: '👨‍👩‍👧‍👦',
      searchParams: { occasion: 'grandparent_visit' },
    },
  ];
}
