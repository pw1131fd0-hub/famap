/**
 * Smart Family Packing Checklist Generator
 * Generates context-aware packing lists based on venue type, child age, and season
 */

import type { Category } from '../types';

export interface ChecklistItem {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  category: 'essential' | 'recommended' | 'optional';
  ageMin?: number; // minimum child age in months
  ageMax?: number; // maximum child age in months
  venueTypes?: Category[];
  seasons?: ('spring' | 'summer' | 'autumn' | 'winter')[];
  isChecked?: boolean;
}

export interface PackingList {
  essential: ChecklistItem[];
  recommended: ChecklistItem[];
  optional: ChecklistItem[];
}

// Universal items - always needed
const UNIVERSAL_ITEMS: ChecklistItem[] = [
  { id: 'water', nameZh: '飲用水', nameEn: 'Drinking Water', emoji: '💧', category: 'essential' },
  { id: 'snacks', nameZh: '小點心', nameEn: 'Snacks', emoji: '🍪', category: 'essential' },
  { id: 'wet_wipes', nameZh: '濕紙巾', nameEn: 'Wet Wipes', emoji: '🧻', category: 'essential' },
  { id: 'first_aid', nameZh: '簡易急救包', nameEn: 'Basic First Aid Kit', emoji: '🩹', category: 'recommended' },
  { id: 'phone_charger', nameZh: '行動電源', nameEn: 'Power Bank', emoji: '🔋', category: 'recommended' },
];

// Baby items (0-18 months)
const BABY_ITEMS: ChecklistItem[] = [
  { id: 'diapers', nameZh: '尿布（多帶幾片）', nameEn: 'Extra Diapers', emoji: '👶', category: 'essential', ageMax: 36 },
  { id: 'diaper_bag', nameZh: '尿布包', nameEn: 'Diaper Bag', emoji: '👜', category: 'essential', ageMax: 36 },
  { id: 'wipes_baby', nameZh: '嬰兒濕紙巾', nameEn: 'Baby Wipes', emoji: '🧴', category: 'essential', ageMax: 36 },
  { id: 'formula', nameZh: '奶粉或母乳袋', nameEn: 'Formula or Breast Milk', emoji: '🍼', category: 'essential', ageMax: 18 },
  { id: 'bottle', nameZh: '奶瓶', nameEn: 'Baby Bottle', emoji: '🍼', category: 'essential', ageMax: 24 },
  { id: 'changing_pad', nameZh: '摺疊換尿布墊', nameEn: 'Portable Changing Pad', emoji: '🟦', category: 'essential', ageMax: 36 },
  { id: 'baby_carrier', nameZh: '背巾或揹帶', nameEn: 'Baby Carrier or Sling', emoji: '👪', category: 'recommended', ageMax: 36 },
  { id: 'pacifier', nameZh: '安撫奶嘴', nameEn: 'Pacifier', emoji: '😌', category: 'recommended', ageMax: 24 },
  { id: 'teether', nameZh: '固齒器', nameEn: 'Teether', emoji: '🦷', category: 'optional', ageMin: 4, ageMax: 18 },
  { id: 'baby_food', nameZh: '副食品或泥狀食物', nameEn: 'Baby Food or Puree', emoji: '🥣', category: 'essential', ageMin: 6, ageMax: 18 },
];

// Toddler items (18 months - 5 years)
const TODDLER_ITEMS: ChecklistItem[] = [
  { id: 'spare_clothes', nameZh: '備用衣物', nameEn: 'Spare Clothes', emoji: '👕', category: 'essential', ageMin: 6, ageMax: 72 },
  { id: 'sippy_cup', nameZh: '學習杯', nameEn: 'Sippy Cup', emoji: '🥤', category: 'recommended', ageMin: 12, ageMax: 48 },
  { id: 'small_toy', nameZh: '小玩具（候位等待用）', nameEn: 'Small Toy (for waiting)', emoji: '🧸', category: 'recommended', ageMin: 12, ageMax: 72 },
  { id: 'sunhat', nameZh: '寬邊遮陽帽', nameEn: 'Wide-Brim Sun Hat', emoji: '👒', category: 'essential', ageMin: 6 },
];

// Kid items (5+ years)
const KID_ITEMS: ChecklistItem[] = [
  { id: 'kids_sunscreen', nameZh: '兒童防曬乳', nameEn: 'Kids Sunscreen', emoji: '🧴', category: 'essential', ageMin: 6 },
  { id: 'backpack', nameZh: '小背包', nameEn: 'Small Backpack', emoji: '🎒', category: 'recommended', ageMin: 36 },
  { id: 'book_or_game', nameZh: '書或小遊戲', nameEn: 'Book or Small Game', emoji: '📚', category: 'optional', ageMin: 36 },
];

// Venue-specific items
const PARK_ITEMS: ChecklistItem[] = [
  { id: 'sunscreen', nameZh: '防曬乳', nameEn: 'Sunscreen', emoji: '🧴', category: 'essential', venueTypes: ['park'] },
  { id: 'insect_repellent', nameZh: '防蚊液', nameEn: 'Insect Repellent', emoji: '🦟', category: 'recommended', venueTypes: ['park'] },
  { id: 'play_mat', nameZh: '野餐墊', nameEn: 'Picnic Mat', emoji: '🧺', category: 'recommended', venueTypes: ['park'] },
  { id: 'umbrella', nameZh: '晴雨傘', nameEn: 'Umbrella (sun or rain)', emoji: '☂️', category: 'recommended', venueTypes: ['park'] },
  { id: 'sand_toys', nameZh: '沙灘玩具（有沙坑）', nameEn: 'Sand Toys (if sandbox)', emoji: '🏖️', category: 'optional', venueTypes: ['park'] },
  { id: 'extra_socks', nameZh: '備用襪子', nameEn: 'Extra Socks', emoji: '🧦', category: 'recommended', venueTypes: ['park'] },
];

const RESTAURANT_ITEMS: ChecklistItem[] = [
  { id: 'bib', nameZh: '圍兜', nameEn: 'Bib', emoji: '🧷', category: 'essential', venueTypes: ['restaurant'], ageMax: 48 },
  { id: 'portable_highchair', nameZh: '攜帶式餐椅或增高墊', nameEn: 'Portable High Chair or Booster', emoji: '🪑', category: 'optional', venueTypes: ['restaurant'], ageMax: 48 },
  { id: 'kids_cutlery', nameZh: '兒童餐具組', nameEn: 'Kids Utensil Set', emoji: '🥄', category: 'recommended', venueTypes: ['restaurant'], ageMax: 60 },
  { id: 'activity_book', nameZh: '塗色書（等候用）', nameEn: 'Coloring Book (for waiting)', emoji: '🖍️', category: 'optional', venueTypes: ['restaurant'], ageMin: 24 },
];

const NURSING_ROOM_ITEMS: ChecklistItem[] = [
  { id: 'breast_pump', nameZh: '擠奶器', nameEn: 'Breast Pump', emoji: '🤱', category: 'recommended', venueTypes: ['nursing_room'], ageMax: 18 },
  { id: 'nursing_cover', nameZh: '哺乳巾', nameEn: 'Nursing Cover', emoji: '🧣', category: 'recommended', venueTypes: ['nursing_room'], ageMax: 18 },
  { id: 'milk_storage_bags', nameZh: '母乳袋', nameEn: 'Milk Storage Bags', emoji: '🗃️', category: 'optional', venueTypes: ['nursing_room'], ageMax: 12 },
  { id: 'insulated_bag', nameZh: '保溫袋（存放母乳）', nameEn: 'Insulated Bag (for breast milk)', emoji: '🧊', category: 'recommended', venueTypes: ['nursing_room'], ageMax: 12 },
];

const MEDICAL_ITEMS: ChecklistItem[] = [
  { id: 'health_card', nameZh: '健保卡', nameEn: 'Health Insurance Card', emoji: '💳', category: 'essential', venueTypes: ['medical'] },
  { id: 'vaccination_record', nameZh: '疫苗接種手冊', nameEn: 'Vaccination Record', emoji: '📋', category: 'recommended', venueTypes: ['medical'] },
  { id: 'medical_history', nameZh: '過敏史記錄', nameEn: 'Allergy/Medical History Notes', emoji: '📝', category: 'recommended', venueTypes: ['medical'] },
];

// Season-specific items
const SUMMER_ITEMS: ChecklistItem[] = [
  { id: 'cooling_towel', nameZh: '冰涼毛巾', nameEn: 'Cooling Towel', emoji: '🌊', category: 'recommended', seasons: ['summer'] },
  { id: 'fan', nameZh: '小電扇或手持扇', nameEn: 'Handheld Fan', emoji: '🌀', category: 'recommended', seasons: ['summer'] },
  { id: 'swim_gear', nameZh: '泳衣泳具（戲水區）', nameEn: 'Swim Gear (for water areas)', emoji: '🩱', category: 'optional', seasons: ['summer'] },
  { id: 'extra_water', nameZh: '多帶水（防中暑）', nameEn: 'Extra Water (heat stroke prevention)', emoji: '💧', category: 'essential', seasons: ['summer'] },
];

const WINTER_ITEMS: ChecklistItem[] = [
  { id: 'warm_jacket', nameZh: '保暖外套', nameEn: 'Warm Jacket', emoji: '🧥', category: 'essential', seasons: ['winter'] },
  { id: 'hand_warmers', nameZh: '暖暖包', nameEn: 'Hand Warmers', emoji: '🔥', category: 'recommended', seasons: ['winter'] },
  { id: 'gloves', nameZh: '手套', nameEn: 'Gloves', emoji: '🧤', category: 'recommended', seasons: ['winter'] },
  { id: 'thermos', nameZh: '熱水保溫瓶', nameEn: 'Thermos with Hot Water', emoji: '♨️', category: 'recommended', seasons: ['winter'] },
];

const RAINY_ITEMS: ChecklistItem[] = [
  { id: 'rain_jacket', nameZh: '輕便雨衣', nameEn: 'Light Rain Jacket', emoji: '🌧️', category: 'essential', seasons: ['spring'] },
  { id: 'rain_boots', nameZh: '雨鞋或防水鞋', nameEn: 'Rain Boots or Waterproof Shoes', emoji: '👢', category: 'recommended', seasons: ['spring'] },
  { id: 'plastic_bags', nameZh: '防水袋（裝濕衣物）', nameEn: 'Plastic Bags (for wet clothes)', emoji: '🛍️', category: 'recommended', seasons: ['spring'] },
];

function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

/**
 * Generate a smart packing list based on context
 */
export function generatePackingList(
  venueCategory: Category,
  childAgeMonths?: number,
  customSeason?: 'spring' | 'summer' | 'autumn' | 'winter'
): PackingList {
  const season = customSeason ?? getCurrentSeason();
  const allItems: ChecklistItem[] = [];

  // Add universal items
  allItems.push(...UNIVERSAL_ITEMS);

  // Add age-specific items
  if (childAgeMonths !== undefined) {
    const ageItems = [...BABY_ITEMS, ...TODDLER_ITEMS, ...KID_ITEMS].filter(item => {
      const minOk = item.ageMin === undefined || childAgeMonths >= item.ageMin;
      const maxOk = item.ageMax === undefined || childAgeMonths <= item.ageMax;
      return minOk && maxOk;
    });
    allItems.push(...ageItems);
  } else {
    // No age specified - include general child items
    allItems.push(...TODDLER_ITEMS.filter(i => !i.ageMax || i.ageMax > 24));
    allItems.push(...KID_ITEMS.filter(i => !i.ageMax || i.ageMax > 36));
  }

  // Add venue-specific items
  if (venueCategory === 'park') {
    allItems.push(...PARK_ITEMS);
  } else if (venueCategory === 'restaurant') {
    allItems.push(...RESTAURANT_ITEMS.filter(item => {
      if (childAgeMonths === undefined) return true;
      const minOk = item.ageMin === undefined || childAgeMonths >= item.ageMin;
      const maxOk = item.ageMax === undefined || childAgeMonths <= item.ageMax;
      return minOk && maxOk;
    }));
  } else if (venueCategory === 'nursing_room') {
    allItems.push(...NURSING_ROOM_ITEMS.filter(item => {
      if (childAgeMonths === undefined) return true;
      const minOk = item.ageMin === undefined || childAgeMonths >= item.ageMin;
      const maxOk = item.ageMax === undefined || childAgeMonths <= item.ageMax;
      return minOk && maxOk;
    }));
  } else if (venueCategory === 'medical') {
    allItems.push(...MEDICAL_ITEMS);
  }

  // Add season-specific items
  if (season === 'summer') {
    allItems.push(...SUMMER_ITEMS);
  } else if (season === 'winter') {
    allItems.push(...WINTER_ITEMS);
  } else if (season === 'spring') {
    allItems.push(...RAINY_ITEMS);
  }

  // Deduplicate by ID
  const seen = new Set<string>();
  const deduped = allItems.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // Sort and categorize
  const essential = deduped.filter(i => i.category === 'essential').map(i => ({ ...i, isChecked: false }));
  const recommended = deduped.filter(i => i.category === 'recommended').map(i => ({ ...i, isChecked: false }));
  const optional = deduped.filter(i => i.category === 'optional').map(i => ({ ...i, isChecked: false }));

  return { essential, recommended, optional };
}

/**
 * Save/load checklist state from localStorage
 */
const CHECKLIST_STORAGE_KEY = 'fammap_packing_checklist';

export function saveChecklistState(locationId: string, checkedIds: Set<string>): void {
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || '{}');
    stored[locationId] = Array.from(checkedIds);
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore storage errors
  }
}

export function loadChecklistState(locationId: string): Set<string> {
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || '{}');
    return new Set<string>(stored[locationId] || []);
  } catch {
    return new Set<string>();
  }
}

export function clearChecklistState(locationId: string): void {
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || '{}');
    delete stored[locationId];
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore
  }
}
