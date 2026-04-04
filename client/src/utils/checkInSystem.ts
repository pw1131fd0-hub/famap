/**
 * Family Exploration Passport & Check-in System
 * Gamification feature: families check in at venues, earn badges, track exploration history
 */

export interface CheckIn {
  id: string;
  locationId: string;
  locationName: string;
  locationCategory: string;
  timestamp: string; // ISO 8601
  notes?: string;
  childrenPresent?: number;
}

export interface ExplorationBadge {
  id: string;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  icon: string;
  earnedAt?: string; // ISO 8601, set when earned
  condition: (checkIns: CheckIn[]) => boolean;
}

export interface ExplorationStats {
  totalCheckIns: number;
  uniqueLocations: number;
  categoriesVisited: string[];
  earnedBadges: ExplorationBadge[];
  firstCheckIn?: string;
  latestCheckIn?: string;
  weeklyStreak: number;
}

const STORAGE_KEY = 'fammap_checkins';

// --- Badge Definitions ---

export const ALL_BADGES: ExplorationBadge[] = [
  {
    id: 'first_step',
    name_zh: '第一步',
    name_en: 'First Step',
    description_zh: '完成第一次打卡！',
    description_en: 'Completed your first check-in!',
    icon: '👣',
    condition: (c) => c.length >= 1,
  },
  {
    id: 'park_explorer',
    name_zh: '公園探險家',
    name_en: 'Park Explorer',
    description_zh: '造訪了一個公園',
    description_en: 'Visited a park',
    icon: '🌳',
    condition: (c) => c.some((ci) => ci.locationCategory === 'park'),
  },
  {
    id: 'nursing_pioneer',
    name_zh: '哺乳先鋒',
    name_en: 'Nursing Pioneer',
    description_zh: '使用了哺乳室設施',
    description_en: 'Used a nursing room facility',
    icon: '🍼',
    condition: (c) => c.some((ci) => ci.locationCategory === 'nursing_room'),
  },
  {
    id: 'foodie_family',
    name_zh: '美食家庭',
    name_en: 'Foodie Family',
    description_zh: '在親子餐廳用餐',
    description_en: 'Dined at a family restaurant',
    icon: '🍜',
    condition: (c) => c.some((ci) => ci.locationCategory === 'restaurant'),
  },
  {
    id: 'health_guardian',
    name_zh: '健康守護者',
    name_en: 'Health Guardian',
    description_zh: '造訪了醫療設施',
    description_en: 'Visited a medical facility',
    icon: '🏥',
    condition: (c) => c.some((ci) => ci.locationCategory === 'medical'),
  },
  {
    id: 'adventurer_5',
    name_zh: '小小冒險家',
    name_en: 'Little Adventurer',
    description_zh: '完成 5 次打卡！',
    description_en: 'Completed 5 check-ins!',
    icon: '⭐',
    condition: (c) => c.length >= 5,
  },
  {
    id: 'explorer_10',
    name_zh: '城市探索者',
    name_en: 'City Explorer',
    description_zh: '完成 10 次打卡！',
    description_en: 'Completed 10 check-ins!',
    icon: '🗺️',
    condition: (c) => c.length >= 10,
  },
  {
    id: 'veteran_25',
    name_zh: '親子達人',
    name_en: 'Family Veteran',
    description_zh: '完成 25 次打卡！',
    description_en: 'Completed 25 check-ins!',
    icon: '🏆',
    condition: (c) => c.length >= 25,
  },
  {
    id: 'all_categories',
    name_zh: '全方位家長',
    name_en: 'All-Round Parent',
    description_zh: '造訪所有類型的地點',
    description_en: 'Visited all types of locations',
    icon: '🌟',
    condition: (c) => {
      const cats = new Set(c.map((ci) => ci.locationCategory));
      return ['park', 'nursing_room', 'restaurant', 'medical'].every((cat) => cats.has(cat));
    },
  },
  {
    id: 'unique_5',
    name_zh: '多元探索者',
    name_en: 'Diverse Explorer',
    description_zh: '造訪 5 個不同地點',
    description_en: 'Visited 5 different locations',
    icon: '🎯',
    condition: (c) => new Set(c.map((ci) => ci.locationId)).size >= 5,
  },
  {
    id: 'unique_10',
    name_zh: '地圖征服者',
    name_en: 'Map Conqueror',
    description_zh: '造訪 10 個不同地點',
    description_en: 'Visited 10 different locations',
    icon: '🗾',
    condition: (c) => new Set(c.map((ci) => ci.locationId)).size >= 10,
  },
  {
    id: 'weekend_warrior',
    name_zh: '週末勇士',
    name_en: 'Weekend Warrior',
    description_zh: '在週末打卡 3 次',
    description_en: 'Checked in 3 times on weekends',
    icon: '☀️',
    condition: (c) => {
      const weekendCheckIns = c.filter((ci) => {
        const day = new Date(ci.timestamp).getDay();
        return day === 0 || day === 6;
      });
      return weekendCheckIns.length >= 3;
    },
  },
];

// --- Storage Functions ---

export function loadCheckIns(): CheckIn[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CheckIn[];
  } catch {
    return [];
  }
}

export function saveCheckIns(checkIns: CheckIn[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
  } catch {
    // Storage might be full or unavailable
  }
}

export function addCheckIn(
  locationId: string,
  locationName: string,
  locationCategory: string,
  notes?: string,
  childrenPresent?: number
): CheckIn {
  const checkIn: CheckIn = {
    id: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    locationId,
    locationName,
    locationCategory,
    timestamp: new Date().toISOString(),
    notes,
    childrenPresent,
  };
  const existing = loadCheckIns();
  saveCheckIns([...existing, checkIn]);
  return checkIn;
}

export function removeCheckIn(checkInId: string): void {
  const existing = loadCheckIns();
  saveCheckIns(existing.filter((ci) => ci.id !== checkInId));
}

export function getCheckInsForLocation(locationId: string): CheckIn[] {
  return loadCheckIns().filter((ci) => ci.locationId === locationId);
}

export function hasCheckedInToday(locationId: string): boolean {
  const today = new Date().toDateString();
  return getCheckInsForLocation(locationId).some(
    (ci) => new Date(ci.timestamp).toDateString() === today
  );
}

export function clearAllCheckIns(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// --- Badge Functions ---

export function getEarnedBadges(checkIns: CheckIn[]): ExplorationBadge[] {
  return ALL_BADGES.filter((badge) => badge.condition(checkIns)).map((badge) => {
    // Find the first check-in that would have triggered this badge
    const earnedAt = findBadgeEarnTime(badge, checkIns);
    return { ...badge, earnedAt };
  });
}

function findBadgeEarnTime(badge: ExplorationBadge, checkIns: CheckIn[]): string | undefined {
  // Determine at which check-in the badge was first earned
  for (let i = 1; i <= checkIns.length; i++) {
    if (badge.condition(checkIns.slice(0, i))) {
      return checkIns[i - 1].timestamp;
    }
  }
  return undefined;
}

export function getNewlyEarnedBadges(
  previousCheckIns: CheckIn[],
  newCheckIns: CheckIn[]
): ExplorationBadge[] {
  const previousBadgeIds = new Set(getEarnedBadges(previousCheckIns).map((b) => b.id));
  return getEarnedBadges(newCheckIns).filter((b) => !previousBadgeIds.has(b.id));
}

// --- Statistics Functions ---

export function calculateWeeklyStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;

  const checkInWeeks = new Set(
    checkIns.map((ci) => {
      const d = new Date(ci.timestamp);
      // ISO week number approximation
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.floor(
        (d.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      return `${d.getFullYear()}-W${weekNum}`;
    })
  );

  const currentWeek = (() => {
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.floor(
      (d.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    return `${d.getFullYear()}-W${weekNum}`;
  })();

  let streak = 0;
  let week = currentWeek;
  const [yearStr, weekPart] = week.split('-W');
  let year = parseInt(yearStr, 10);
  let weekN = parseInt(weekPart, 10);

  while (checkInWeeks.has(`${year}-W${weekN}`)) {
    streak++;
    weekN--;
    if (weekN < 0) {
      year--;
      weekN = 51;
    }
  }

  return streak;
}

export function getExplorationStats(checkIns: CheckIn[]): ExplorationStats {
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return {
    totalCheckIns: checkIns.length,
    uniqueLocations: new Set(checkIns.map((ci) => ci.locationId)).size,
    categoriesVisited: [...new Set(checkIns.map((ci) => ci.locationCategory))],
    earnedBadges: getEarnedBadges(checkIns),
    firstCheckIn: sorted[0]?.timestamp,
    latestCheckIn: sorted[sorted.length - 1]?.timestamp,
    weeklyStreak: calculateWeeklyStreak(checkIns),
  };
}
