import type { Location } from '../types/location.js';
import type { Review } from '../types/review.js';
import type { Favorite } from '../types/favorite.js';
import type { User } from '../types/user.js';

export let mockUsers: User[] = [
  {
    id: 'u1',
    email: 'mom@example.com',
    passwordHash: 'hashed_password_1', // In a real app, use bcrypt
    displayName: '小明媽',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export let mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '大安森林公園', en: 'Daan Forest Park' },
    description: { zh: '台北市中心最大的森林公園，有大型兒童遊戲場和沙坑。', en: 'The largest forest park in Taipei with a large playground and sandbox.' },
    category: 'park',
    coordinates: { lat: 25.0312, lng: 121.5361 },
    address: { zh: '台北市大安區新生南路二段1號', en: 'No. 1, Sec. 2, Xinsheng S. Rd., Daan Dist., Taipei' },
    facilities: ['stroller_accessible', 'nursing_room', 'public_toilet'],
    averageRating: 4.8,
    ageRange: { minAge: 1, maxAge: 12 },
    pricing: { isFree: true },
    phoneNumber: '02-2700-8600',
    publicTransit: {
      nearestMRT: { line: '棕線 (Brown Line)', station: '科技大樓站', distance: 450 },
      busLines: ['15', '32', '38', '72'],
    },
    parking: { available: true, cost: '免費停車', hasValidation: false },
    toilet: { available: true, childrenFriendly: true, hasChangingTable: true },
    hasWiFi: false,
    accessibility: {
      wheelchairAccessible: true,
      accessibleToilet: true,
      disabledParking: true,
      hasRamp: true,
      accessibilityNotes: '主要遊戲區有無障礙通道，但某些林區路徑較崎嶇'
    },
    activity: {
      activityTypes: ['sandbox play', 'slide', 'swing', 'climbing', 'nature trail', 'picnic'],
      equipment: ['large playground', 'sandbox', 'swing set', 'climbing structures', 'open field'],
      ageAppropriate: { minAge: 1, maxAge: 12 },
      mainActivities: '大型遊戲場適合1-12歲，沙坑特別適合2-5歲'
    },
    safety: {
      playAreaSafety: 'excellent',
      firstAidAvailable: true,
      supervisionAvailable: false,
      safetyRating: 4.8,
      safetyNotes: '定期安全檢查，遊戲設施維護良好'
    },
    qualityMetrics: {
      cleanlinessRating: 4.7,
      maintenanceStatus: 'excellent',
      lastMaintenanceDate: '2026-03-15T00:00:00Z',
      cleanlinessNotes: '每日清潔，廁所設施維護良好'
    }
  },
  {
    id: '2',
    name: { zh: '台北市兒童新樂園', en: 'Taipei Children\'s Amusement Park' },
    description: { zh: '專為兒童設計的主題樂園，設施豐富。', en: 'A theme park designed specifically for children with many attractions.' },
    category: 'park',
    coordinates: { lat: 25.0970, lng: 121.5147 },
    address: { zh: '台北市士林區承德路五段55號', en: 'No. 55, Sec. 5, Chengde Rd., Shilin Dist., Taipei' },
    facilities: ['stroller_accessible', 'nursing_room', 'high_chair'],
    averageRating: 4.7,
    ageRange: { minAge: 2, maxAge: 15 },
    pricing: { isFree: false, priceRange: '200-500 NTD' },
    phoneNumber: '02-2833-6666',
    publicTransit: {
      nearestMRT: { line: '紅線 (Red Line)', station: '士林站', distance: 1200 },
      busLines: ['11', '26', '27', '32', '55'],
    },
    parking: { available: true, cost: '200 NTD/時', hasValidation: true },
    toilet: { available: true, childrenFriendly: true, hasChangingTable: true },
    hasWiFi: true,
    accessibility: {
      wheelchairAccessible: true,
      accessibleToilet: true,
      disabledParking: true,
      hasElevator: true,
      hasRamp: true,
      accessibilityNotes: '園區完全無障礙，具備無障礙停車位和電梯'
    },
    activity: {
      activityTypes: ['amusement rides', 'roller coaster', 'water ride', 'shooting game', 'carousel'],
      equipment: ['rides', 'arcade', 'water fountains', 'shaded areas'],
      ageAppropriate: { minAge: 2, maxAge: 15 },
      mainActivities: '適合2-15歲，遊樂設施豐富'
    },
    safety: {
      playAreaSafety: 'excellent',
      firstAidAvailable: true,
      supervisionAvailable: true,
      safetyRating: 4.9,
      safetyNotes: '定期安全檢驗，工作人員訓練充分'
    },
    qualityMetrics: {
      cleanlinessRating: 4.8,
      maintenanceStatus: 'excellent',
      lastMaintenanceDate: '2026-03-10T00:00:00Z',
      cleanlinessNotes: '設施新穎，每日清潔管理'
    }
  },
  {
    id: '3',
    name: { zh: '國立臺灣博物館', en: 'National Taiwan Museum' },
    description: { zh: '日治時期建築，有適合兒童的自然生態展示區。', en: 'Japanese colonial era building with natural ecology exhibits for children.' },
    category: 'attraction',
    coordinates: { lat: 25.0428, lng: 121.5148 },
    address: { zh: '台北市中正區襄陽路2號', en: 'No. 2, Xiangyang Rd., Zhongzheng Dist., Taipei' },
    facilities: ['stroller_accessible', 'nursing_room'],
    averageRating: 4.5,
    ageRange: { minAge: 3, maxAge: 14 },
    pricing: { isFree: false, priceRange: '30-100 NTD' },
    phoneNumber: '02-2382-2566',
    publicTransit: {
      nearestMRT: { line: '綠線 (Green Line)', station: '國父紀念館站', distance: 350 },
      busLines: ['1', '15', '33', '38'],
    },
    parking: { available: true, cost: '1小時 80 NTD', hasValidation: true },
    toilet: { available: true, childrenFriendly: true, hasChangingTable: true },
    hasWiFi: true,
    accessibility: {
      wheelchairAccessible: true,
      accessibleToilet: true,
      disabledParking: true,
      hasElevator: true,
      hasRamp: true,
      accessibilityNotes: '建築物完全無障礙改建，設置電梯和無障礙停車位'
    },
    activity: {
      activityTypes: ['museum exhibition', 'interactive display', 'nature education', 'children workshop'],
      equipment: ['exhibition halls', 'interactive stations', 'learning materials'],
      ageAppropriate: { minAge: 3, maxAge: 14 },
      mainActivities: '互動式自然生態展示，適合3-14歲學習'
    },
    safety: {
      playAreaSafety: 'good',
      firstAidAvailable: true,
      supervisionAvailable: true,
      safetyRating: 4.6,
      safetyNotes: '館內工作人員隨時可提供協助'
    },
    qualityMetrics: {
      cleanlinessRating: 4.6,
      maintenanceStatus: 'good',
      lastMaintenanceDate: '2026-03-01T00:00:00Z',
      cleanlinessNotes: '歷史建築，定期維護清潔'
    }
  },
  {
    id: '4',
    name: { zh: '親子餐廳範例', en: 'Kids Friendly Restaurant' },
    description: { zh: '提供室內遊戲室和兒童餐。', en: 'Offers indoor playground and kids menu.' },
    category: 'restaurant',
    coordinates: { lat: 25.0330, lng: 121.5654 },
    address: { zh: '台北市信義區', en: 'Xinyi Dist., Taipei' },
    facilities: ['high_chair', 'nursing_room', 'air_conditioned', 'kids_menu', 'indoor_play'],
    averageRating: 4.2,
    ageRange: { minAge: 0, maxAge: 8 },
    pricing: { isFree: false, priceRange: '400-800 NTD' },
    phoneNumber: '02-8101-0888',
    publicTransit: {
      nearestMRT: { line: '紅線 (Red Line)', station: '信義安和站', distance: 280 },
      busLines: ['33', '37', '41', '52'],
    },
    parking: { available: true, cost: '樓下停車場', hasValidation: true },
    toilet: { available: true, childrenFriendly: true, hasChangingTable: true },
    hasWiFi: true,
    allergens: { commonAllergens: ['milk', 'eggs', 'peanuts'] },
    accessibility: {
      wheelchairAccessible: true,
      accessibleToilet: true,
      disabledParking: true,
      hasElevator: true,
      accessibilityNotes: '室內遊戲室完全無障礙，備有無障礙停車位'
    },
    activity: {
      activityTypes: ['indoor play', 'dining', 'arcade games', 'ball pit'],
      equipment: ['indoor play structures', 'arcade', 'ball pit', 'dining area'],
      ageAppropriate: { minAge: 0, maxAge: 8 },
      mainActivities: '室內遊戲室，特別適合0-8歲幼兒'
    },
    safety: {
      playAreaSafety: 'good',
      firstAidAvailable: true,
      supervisionAvailable: true,
      safetyRating: 4.4,
      safetyNotes: '工作人員監督遊戲區'
    },
    qualityMetrics: {
      cleanlinessRating: 4.5,
      maintenanceStatus: 'good',
      lastMaintenanceDate: '2026-03-12T00:00:00Z',
      cleanlinessNotes: '每日清潔消毒遊戲設施'
    }
  },
  {
    id: '5',
    name: { zh: '南港軟體園區親子中心', en: 'Nangang Software Park Family Center' },
    description: { zh: '全新室內親子設施，四季恆溫冷氣。', en: 'Modern indoor family facility with year-round air conditioning.' },
    category: 'park',
    coordinates: { lat: 25.0556, lng: 121.6089 },
    address: { zh: '台北市南港區經貿二路191號', en: 'No. 191, Jingmao 2nd Rd., Nangang Dist., Taipei' },
    facilities: ['air_conditioned', 'nursing_room', 'kids_menu', 'parking', 'mrt_nearby', 'indoor_play'],
    averageRating: 4.6,
    ageRange: { minAge: 0, maxAge: 10 },
    pricing: { isFree: true },
    phoneNumber: '02-2655-0988',
    publicTransit: {
      nearestMRT: { line: '棕線 (Brown Line)', station: '南港軟體園區站', distance: 100 },
      busLines: ['270', '275', '605'],
    },
    parking: { available: true, cost: '免費停車', hasValidation: false },
    toilet: { available: true, childrenFriendly: true, hasChangingTable: true },
    hasWiFi: true,
    accessibility: {
      wheelchairAccessible: true,
      accessibleToilet: true,
      disabledParking: true,
      hasElevator: true,
      hasRamp: true,
      accessibilityNotes: '全新設施完全無障礙，備有輪椅專用停車位和電梯'
    },
    activity: {
      activityTypes: ['indoor play', 'soft play', 'climbing', 'slides', 'interactive games'],
      equipment: ['soft play structures', 'slides', 'climbing wall', 'game stations'],
      ageAppropriate: { minAge: 0, maxAge: 10 },
      mainActivities: '現代室內親子設施，四季恆溫'
    },
    safety: {
      playAreaSafety: 'excellent',
      firstAidAvailable: true,
      supervisionAvailable: true,
      safetyRating: 4.7,
      safetyNotes: '現代化設施，安全標準最新'
    },
    qualityMetrics: {
      cleanlinessRating: 4.7,
      maintenanceStatus: 'excellent',
      lastMaintenanceDate: '2026-03-18T00:00:00Z',
      cleanlinessNotes: '全新設施，清潔度一流'
    }
  },
  {
    id: '6',
    name: { zh: '內湖運動中心游泳池', en: 'Neihu Sports Center Swimming Pool' },
    description: { zh: '專業兒童游泳課程和暖水池。', en: 'Professional kids swimming lessons and heated pools.' },
    category: 'park',
    coordinates: { lat: 25.0830, lng: 121.5917 },
    address: { zh: '台北市內湖區湖興路300號', en: 'No. 300, Huxing Rd., Neihu Dist., Taipei' },
    facilities: ['swimming_pool', 'water_play', 'nursing_room', 'air_conditioned', 'drinking_water', 'public_toilet'],
    averageRating: 4.5,
    ageRange: { minAge: 3, maxAge: 16 },
    pricing: { isFree: false, priceRange: '100-200 NTD' },
    phoneNumber: '02-8751-5000',
    publicTransit: {
      nearestMRT: { line: '棕線 (Brown Line)', station: '南港軟體園區站', distance: 2000 },
      busLines: ['201', '202', '267'],
    },
    parking: { available: true, cost: '免費停車', hasValidation: false },
    toilet: { available: true, childrenFriendly: true, hasChangingTable: true },
    hasWiFi: false,
    accessibility: {
      wheelchairAccessible: true,
      accessibleToilet: true,
      disabledParking: true,
      hasRamp: true,
      accessibilityNotes: '運動中心設施無障礙，游泳池區域備有輪椅進出通道'
    },
    activity: {
      activityTypes: ['swimming', 'water play', 'swimming lessons', 'diving', 'water aerobics'],
      equipment: ['heated pools', 'children pools', 'diving board', 'water slides'],
      ageAppropriate: { minAge: 3, maxAge: 16 },
      mainActivities: '專業兒童游泳課程和暖水池，適合3-16歲'
    },
    safety: {
      playAreaSafety: 'excellent',
      firstAidAvailable: true,
      supervisionAvailable: true,
      safetyRating: 4.6,
      safetyNotes: '救生員全時值班，定期安全檢查'
    },
    qualityMetrics: {
      cleanlinessRating: 4.5,
      maintenanceStatus: 'good',
      lastMaintenanceDate: '2026-03-08T00:00:00Z',
      cleanlinessNotes: '池水定期檢測，衛生標準達標'
    }
  },
  {
    id: '7',
    name: { zh: '新北新店陽光休閒園區', en: 'Xindian Sunshine Leisure Park' },
    description: { zh: '水上樂園和泳池，夏日消暑好去處。', en: 'Water park and swimming area, perfect for summer fun.' },
    category: 'park',
    coordinates: { lat: 24.9806, lng: 121.5433 },
    address: { zh: '新北市新店區中興路1號', en: 'No. 1, Zhongxing Rd., Xindian Dist., New Taipei' },
    facilities: ['swimming_pool', 'water_play', 'shaded_area', 'nursing_room', 'mrt_nearby', 'outdoor_seating'],
    averageRating: 4.4,
    ageRange: { minAge: 2, maxAge: 14 },
    pricing: { isFree: false, priceRange: '300-600 NTD' },
    phoneNumber: '02-2918-9077',
    publicTransit: {
      nearestMRT: { line: '綠線 (Green Line)', station: '新店站', distance: 800 },
      busLines: ['648', '649', '671'],
    },
    parking: { available: true, cost: '免費停車', hasValidation: false },
    toilet: { available: true, childrenFriendly: true, hasChangingTable: true },
    hasWiFi: true,
    accessibility: {
      wheelchairAccessible: true,
      accessibleToilet: true,
      disabledParking: true,
      hasRamp: true,
      accessibilityNotes: '水上樂園部分設施無障礙，備有無障礙停車位和專用通道'
    },
    activity: {
      activityTypes: ['water slide', 'wave pool', 'swimming', 'lazy river', 'water play'],
      equipment: ['water slides', 'wave machine', 'swimming pools', 'lazy river'],
      ageAppropriate: { minAge: 2, maxAge: 14 },
      mainActivities: '水上樂園，夏日消暑好去處，適合2-14歲'
    },
    safety: {
      playAreaSafety: 'good',
      firstAidAvailable: true,
      supervisionAvailable: true,
      safetyRating: 4.5,
      safetyNotes: '救生員配置充足，定期安全巡檢'
    },
    qualityMetrics: {
      cleanlinessRating: 4.4,
      maintenanceStatus: 'good',
      lastMaintenanceDate: '2026-03-05T00:00:00Z',
      cleanlinessNotes: '季節性開放，開放期間每日清潔'
    }
  },
];

export let mockReviews: Review[] = [
  {
    id: '101',
    locationId: '1',
    userId: 'u1',
    userName: '小明媽',
    rating: 5,
    comment: '空間很大，非常適合小孩跑跳！',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: '102',
    locationId: '1',
    userId: 'u2',
    userName: 'Mike',
    rating: 4,
    comment: 'Nice place but can be crowded on weekends.',
    createdAt: '2026-03-05T14:30:00Z',
  },
  {
    id: '103',
    locationId: '2',
    userId: 'u3',
    userName: '小美爸',
    rating: 5,
    comment: '設施很多，小朋友玩得很開心。',
    createdAt: '2026-03-10T09:15:00Z',
  },
];

export let mockFavorites: Favorite[] = [];

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load automatically collected OSM data if available
const osmDataPath = path.join(__dirname, '../../../server/data/osm_locations.json');
if (fs.existsSync(osmDataPath)) {
  try {
    const fileContent = fs.readFileSync(osmDataPath, 'utf-8');
    const osmLocations = JSON.parse(fileContent);
    mockLocations.push(...osmLocations);
    console.log(`Loaded ${osmLocations.length} locations from OSM data.`);
  } catch (error) {
    console.error('Failed to load osm_locations.json:', error);
  }
}
