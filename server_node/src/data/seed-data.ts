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
    operatingHours: {
      monday: '05:00 - 23:00',
      tuesday: '05:00 - 23:00',
      wednesday: '05:00 - 23:00',
      thursday: '05:00 - 23:00',
      friday: '05:00 - 23:00',
      saturday: '05:00 - 23:00',
      sunday: '05:00 - 23:00',
    },
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
    },
    booking: {
      requiresPreBooking: false,
      offersOnlineBooking: false,
      groupDiscountAvailable: true,
      discountNotes: '大型團體（10人以上）可享優惠，請電話洽詢'
    },
    seasonal: {
      bestSeasons: ['spring', 'fall'],
      summerNotes: '夏季炎熱（30-35°C），建議早上或傍晚造訪，公園內樹蔭充足',
      winterNotes: '冬季溫和（10-15°C），適合散步和騎自行車',
      rainySeasonNotes: '林區步道可能泥濘，建議穿防水鞋。五月至九月為台灣颱風季',
      seasonalActivities: '春季賞花，秋季野餐和登山散步',
      schoolHolidayCrowding: 'heavy',
      seasonalClosures: '颱風警報期間可能短期關閉某些設施'
    },
    payment: {
      acceptsCash: true,
      acceptsLinePay: false,
      acceptsCreditCard: false,
      paymentNotes: '公園免費開放，無需付款'
    },
    outsideFood: {
      allowsOutsideFood: true,
      allowsOutsideBeverages: true,
      hasPicnicAreas: true,
      hasRefrigeratedStorage: false,
      foodPolicyNotes: '公園內有多個野餐區，歡迎自備食物和飲料'
    },
    stroller: {
      strollerFriendly: true,
      hasStrollerStorage: false,
      hasStrollerRental: false,
      strollerStorageNotes: '主要步道皆可推嬰兒車，但某些林區小路可能不便',
      restrictedAreas: '部分登山路徑不適合嬰兒車'
    },
    reservedTimes: {
      hasReservedTimes: false
    },
    nursingRoom: {
      hasDedicatedNursingRoom: false,
      nursingRoomNotes: '公園內無專門哺乳室，建議使用育嬰室或家庭廁所'
    },
    petPolicy: {
      petsAllowed: true,
      dogsAllowed: true,
      catsAllowed: true,
      serviceAnimalsAllowed: true,
      hasLeashRequirement: true,
      hasDesignatedPetAreas: false,
      petPolicyNotes: '寵物須繫牽繩，不得進入兒童遊戲場。歡迎在公園散步區遛狗'
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
    operatingHours: {
      monday: '09:00 - 18:00',
      tuesday: '09:00 - 18:00',
      wednesday: '09:00 - 18:00',
      thursday: '09:00 - 18:00',
      friday: '09:00 - 20:00',
      saturday: '09:00 - 21:00',
      sunday: '09:00 - 20:00',
    },
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
    },
    booking: {
      requiresPreBooking: false,
      offersOnlineBooking: true,
      bookingMethods: ['phone', 'online', 'wechat'],
      bookingNotes: '主日及假日建議事先線上購票，可享購票優惠',
      groupDiscountAvailable: true,
      discountNotes: '10人以上團體購票享95折，20人以上享9折'
    },
    seasonal: {
      bestSeasons: ['spring', 'fall'],
      summerNotes: '夏季炎熱（30-35°C），但有許多遮蔭區域和水上遊戲設施，建議早上或傍晚遊玩',
      winterNotes: '冬季涼爽（10-15°C），遊客較少，遊玩時間較短',
      rainySeasonNotes: '部分戶外設施在雨季可能關閉。五月至九月為颱風季',
      seasonalActivities: '春季親子踏青，夏季水上樂園活動，冬季特別燈飾',
      schoolHolidayCrowding: 'heavy',
      seasonalClosures: '颱風警報期間整園關閉，暴雨期間部分設施停止運作'
    },
    payment: {
      acceptsCash: true,
      acceptsLinePay: true,
      acceptsWeChatPay: true,
      acceptsApplePay: true,
      acceptsCreditCard: true,
      paymentNotes: '售票處接受現金、信用卡、LINE Pay、WeChat Pay、Apple Pay等多種支付方式'
    },
    outsideFood: {
      allowsOutsideFood: false,
      allowsOutsideBeverages: true,
      hasPicnicAreas: false,
      hasRefrigeratedStorage: false,
      foodPolicyNotes: '園內不允許自帶食物，但有多家餐飲設施。可自帶飲水瓶'
    },
    stroller: {
      strollerFriendly: true,
      hasStrollerStorage: true,
      hasStrollerRental: true,
      strollerStorageNotes: '免費嬰兒車停放區位於入口旁，可租賃嬰兒車（100 NTD/日）',
      restrictedAreas: '部分遊樂設施區域不可推嬰兒車進入'
    },
    reservedTimes: {
      hasReservedTimes: true,
      parentChildHours: '每週三下午 2:00-4:00 為親子時段，5折優惠',
      toddlerSpecificTimes: '每月第一個週日 10:00-12:00 為幼兒專屬時間',
      reservedTimesNotes: '親子時段人數較少，特別適合1-3歲幼兒。需提前線上預約'
    },
    nursingRoom: {
      hasDedicatedNursingRoom: true,
      isPrivate: true,
      hasSeating: true,
      hasChangingTable: true,
      hasAirConditioning: true,
      hasWifi: true,
      hasRefrigerator: true,
      hasPowerOutlet: true,
      hasHandWashing: true,
      cleanlinessRating: 4.8,
      roomCount: 2,
      nursingRoomNotes: '二樓和三樓各有一間專門哺乳室，設備完善，非常乾淨。可預約獲得優先使用權'
    },
    petPolicy: {
      petsAllowed: false,
      petPolicyNotes: '遊樂園內禁止寵物進入（導盲犬除外）'
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
    operatingHours: {
      monday: '休館',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 18:00',
      saturday: '10:00 - 18:00',
      sunday: '10:00 - 18:00',
    },
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
    },
    booking: {
      requiresPreBooking: false,
      offersOnlineBooking: false,
      bookingMethods: ['phone'],
      bookingNotes: '團體導覽需提前2週預約，散客可直接購票入場',
      groupDiscountAvailable: true,
      discountNotes: '20人以上團體購票享5折優惠'
    },
    seasonal: {
      bestSeasons: ['spring', 'summer', 'fall', 'winter'],
      summerNotes: '夏季炎熱時的完美去處，博物館內空調舒適，全年溫度恆定',
      winterNotes: '冬季雨季時，室內博物館是理想活動選擇',
      rainySeasonNotes: '下雨天完全不受影響，適合全天室內參觀',
      seasonalActivities: '全年有特展，夏假期間有兒童工作坊，冬季有節慶展覽',
      schoolHolidayCrowding: 'moderate',
      seasonalClosures: '週一休館，特殊假期可能調整開放時間'
    },
    payment: {
      acceptsCash: true,
      acceptsLinePay: true,
      acceptsCreditCard: true,
      paymentNotes: '票價可現金或信用卡購買，入口處接受 LINE Pay'
    },
    outsideFood: {
      allowsOutsideFood: false,
      allowsOutsideBeverages: false,
      hasPicnicAreas: false,
      foodPolicyNotes: '館內不允許自帶食物和飲料，但有飲水機可用'
    },
    stroller: {
      strollerFriendly: true,
      hasStrollerStorage: true,
      hasStrollerRental: false,
      strollerStorageNotes: '入口有免費嬰兒車停放區，可將嬰兒車暫放'
    },
    reservedTimes: {
      hasReservedTimes: false,
      quietHours: '週二至週四上午 10:00-12:00 遊客較少'
    },
    nursingRoom: {
      hasDedicatedNursingRoom: true,
      isPrivate: true,
      hasSeating: true,
      hasChangingTable: true,
      hasAirConditioning: true,
      hasRefrigerator: true,
      hasPowerOutlet: true,
      hasHandWashing: true,
      cleanlinessRating: 4.7,
      roomCount: 1,
      nursingRoomNotes: '一樓設有哺乳室，空調舒適，設備齊全，每日清潔'
    },
    petPolicy: {
      petsAllowed: false,
      serviceAnimalsAllowed: true,
      petPolicyNotes: '導盲犬等服務犬允許進入，其他寵物禁止'
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
    operatingHours: {
      monday: '11:00 - 22:00',
      tuesday: '11:00 - 22:00',
      wednesday: '11:00 - 22:00',
      thursday: '11:00 - 22:00',
      friday: '11:00 - 23:00',
      saturday: '10:30 - 23:00',
      sunday: '10:30 - 22:00',
    },
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
    },
    booking: {
      requiresPreBooking: false,
      offersOnlineBooking: true,
      bookingMethods: ['phone', 'online', 'line'],
      bookingNotes: '假日建議事先預約，現場候位時間可能較長',
      groupDiscountAvailable: true,
      discountNotes: '6人以上預約享生日蛋糕9折優惠'
    },
    seasonal: {
      bestSeasons: ['spring', 'summer', 'fall', 'winter'],
      summerNotes: '夏季炎熱，但餐廳室內冷氣充足，適合躲避高溫',
      winterNotes: '冬季室內溫暖舒適，親子用餐最佳去處',
      rainySeasonNotes: '完全室內設施，雨天無影響，全年舒適用餐',
      seasonalActivities: '全年提供兒童遊戲室，假期有主題派對活動',
      schoolHolidayCrowding: 'heavy',
      seasonalClosures: '無季節性關閉，全年營業'
    },
    payment: {
      acceptsCash: true,
      acceptsLinePay: true,
      acceptsWeChatPay: true,
      acceptsCreditCard: true,
      paymentNotes: '餐飲接受現金、信用卡、LINE Pay、WeChat Pay 等多種支付'
    },
    outsideFood: {
      allowsOutsideFood: false,
      allowsOutsideBeverages: false,
      foodPolicyNotes: '餐廳內不允許自帶食物和飲料，請享用餐廳提供的兒童友善餐點'
    },
    stroller: {
      strollerFriendly: true,
      hasStrollerStorage: true,
      hasStrollerRental: false,
      strollerStorageNotes: '入口有專用嬰兒車停放區，餐廳內寬敞可直接推嬰兒車進入'
    },
    reservedTimes: {
      hasReservedTimes: true,
      parentChildHours: '每週一上午 11:00-13:00 為親子寧靜時段，音樂會降低音量',
      toddlerSpecificTimes: '每週六下午 3:00-5:00 限嬰幼兒時段（0-3歲），特別安全',
      reservedTimesNotes: '需提前電話或線上預約。親子時段享有10%餐點折扣'
    },
    nursingRoom: {
      hasDedicatedNursingRoom: true,
      isPrivate: true,
      hasSeating: true,
      hasChangingTable: true,
      hasAirConditioning: true,
      hasWifi: true,
      hasRefrigerator: true,
      hasPowerOutlet: true,
      hasHandWashing: true,
      cleanlinessRating: 4.9,
      roomCount: 2,
      nursingRoomNotes: '兩間寬敞的哺乳室，設施高級，提供舒適的哺乳環境。冰箱儲存母乳，插座可充電'
    },
    petPolicy: {
      petsAllowed: false,
      petPolicyNotes: '餐廳內不允許寵物進入'
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
    operatingHours: {
      monday: '09:00 - 21:00',
      tuesday: '09:00 - 21:00',
      wednesday: '09:00 - 21:00',
      thursday: '09:00 - 21:00',
      friday: '09:00 - 21:00',
      saturday: '08:00 - 21:00',
      sunday: '08:00 - 21:00',
    },
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
    },
    booking: {
      requiresPreBooking: false,
      offersOnlineBooking: false,
      groupDiscountAvailable: false,
      bookingNotes: '免費入場，無需預約，隨時可訪'
    },
    seasonal: {
      bestSeasons: ['spring', 'summer', 'fall', 'winter'],
      summerNotes: '夏季炎熱時的最佳避暑勝地，四季恆溫空調環境',
      winterNotes: '冬季完全舒適，避免戶外寒風，親子活動首選',
      rainySeasonNotes: '颱風或暴雨時完全不受影響的完美選擇',
      seasonalActivities: '全年無休閒活動，新穎設施四季皆宜',
      schoolHolidayCrowding: 'moderate',
      seasonalClosures: '無季節性關閉，全年開放'
    },
    payment: {
      acceptsCash: true,
      acceptsCreditCard: true,
      acceptsLinePay: true,
      paymentNotes: '中心接受現金、信用卡、LINE Pay 支付。區民享優惠價格'
    },
    outsideFood: {
      allowsOutsideFood: false,
      allowsOutsideBeverages: true,
      hasPicnicAreas: false,
      hasRefrigeratedStorage: false,
      foodPolicyNotes: '中心內不允許自帶食物，備有飲水機。可自帶飲水瓶'
    },
    stroller: {
      strollerFriendly: true,
      hasStrollerStorage: true,
      hasStrollerRental: false,
      strollerStorageNotes: '更衣室外有免費嬰兒車停放區'
    },
    reservedTimes: {
      hasReservedTimes: true,
      parentChildHours: '每週六日上午 10:00-11:00 為親子游泳課程時間',
      toddlerSpecificTimes: '每週三下午 3:00-4:00 嬰幼兒專屬暖水池時間',
      reservedTimesNotes: '需提前報名。親子課程專業教練指導，費用另計'
    },
    nursingRoom: {
      hasDedicatedNursingRoom: true,
      isPrivate: true,
      hasSeating: true,
      hasChangingTable: true,
      hasAirConditioning: true,
      hasPowerOutlet: true,
      hasRefrigerator: true,
      hasHandWashing: true,
      cleanlinessRating: 4.6,
      roomCount: 1,
      nursingRoomNotes: '嬰兒室備有舒適的哺乳環境、冰箱存放母乳，提供更衣表'
    },
    petPolicy: {
      petsAllowed: false,
      petPolicyNotes: '運動中心禁止寵物進入'
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
    operatingHours: {
      monday: '06:00 - 22:00',
      tuesday: '06:00 - 22:00',
      wednesday: '06:00 - 22:00',
      thursday: '06:00 - 22:00',
      friday: '06:00 - 23:00',
      saturday: '07:00 - 23:00',
      sunday: '07:00 - 22:00',
    },
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
    },
    booking: {
      requiresPreBooking: true,
      offersOnlineBooking: true,
      bookingMethods: ['phone', 'online'],
      bookingNotes: '兒童游泳課程需提前預約，一般泳客散客亦可直接購票',
      groupDiscountAvailable: true,
      discountNotes: '10人以上團體購票享8折優惠'
    },
    seasonal: {
      bestSeasons: ['spring', 'fall'],
      summerNotes: '夏季熱水池適合游泳，室內恆溫舒適，戶外池可能較熱',
      winterNotes: '冬季暖水池是冬季游泳的絕佳選擇，溫度舒適恆定',
      rainySeasonNotes: '室內游泳池不受天氣影響，下雨天依然可照常營業',
      seasonalActivities: '春秋適合戶外水上活動，冬季有溫水課程，夏季有兒童游泳營',
      schoolHolidayCrowding: 'heavy',
      seasonalClosures: '暑期課程眾多，需提前預約；冬季部分時段可能進行維護'
    },
    payment: {
      acceptsCash: true,
      acceptsCreditCard: true,
      acceptsLinePay: true,
      paymentNotes: '運動中心接受現金、信用卡、LINE Pay。憑身分證件可享優惠'
    },
    outsideFood: {
      allowsOutsideFood: false,
      allowsOutsideBeverages: true,
      foodPolicyNotes: '設施內不允許自帶食物，有便利商店和餐飲區。自帶飲水瓶可用'
    },
    stroller: {
      strollerFriendly: true,
      hasStrollerStorage: true,
      strollerStorageNotes: '更衣室區域有嬰兒車停放區。遊泳時可妥善安置'
    },
    reservedTimes: {
      hasReservedTimes: true,
      parentChildHours: '每週五上午 9:00-10:00 親子游泳時段',
      toddlerSpecificTimes: '每週一、三下午 2:00-3:00 為嬰幼兒溫水池時間',
      reservedTimesNotes: '親子課程人數較少，適合1-3歲幼兒。費用另計'
    },
    nursingRoom: {
      hasDedicatedNursingRoom: true,
      isPrivate: false,
      hasSeating: true,
      hasChangingTable: true,
      hasAirConditioning: true,
      hasRefrigerator: false,
      hasHandWashing: true,
      cleanlinessRating: 4.5,
      roomCount: 1,
      nursingRoomNotes: '更衣室內設有哺乳坐席，環境乾淨。不適合長期停留'
    },
    petPolicy: {
      petsAllowed: false,
      petPolicyNotes: '運動中心禁止寵物進入'
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
    operatingHours: {
      monday: '09:00 - 18:00',
      tuesday: '09:00 - 18:00',
      wednesday: '09:00 - 18:00',
      thursday: '09:00 - 18:00',
      friday: '09:00 - 20:00',
      saturday: '08:00 - 20:00',
      sunday: '08:00 - 20:00',
    },
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
    },
    booking: {
      requiresPreBooking: false,
      offersOnlineBooking: true,
      bookingMethods: ['phone', 'online'],
      bookingNotes: '夏季假日建議事先購票，可線上預約以節省排隊時間',
      groupDiscountAvailable: true,
      discountNotes: '15人以上團體購票享85折，並免費贈送小禮物'
    },
    seasonal: {
      bestSeasons: ['summer'],
      summerNotes: '夏季（6月中-8月底）是水上樂園的營運季節，溫度25-30°C最舒適',
      winterNotes: '冬季關閉，不建議前往',
      rainySeasonNotes: '雨季期間可能短期關閉，颱風時整園停業，建議提前確認',
      seasonalActivities: '夏季限定，有波浪池、滑水道、懶人河等水上活動，特別受暑假小孩歡迎',
      schoolHolidayCrowding: 'heavy',
      seasonalClosures: '11月至5月關閉，6月至9月營業。颱風警報期間立即關閉，暴雨時暫停營業'
    },
    payment: {
      acceptsCash: true,
      acceptsLinePay: true,
      acceptsCreditCard: true,
      paymentNotes: '售票處接受現金、信用卡、LINE Pay 等方式。提前線上購票可享優惠'
    },
    outsideFood: {
      allowsOutsideFood: false,
      allowsOutsideBeverages: false,
      hasPicnicAreas: false,
      foodPolicyNotes: '園內不允許自帶食物和飲料。園內有飲食區和便利商店'
    },
    stroller: {
      strollerFriendly: false,
      hasStrollerStorage: true,
      hasStrollerRental: false,
      strollerStorageNotes: '入口有免費嬰兒車停放區，但園內水上設施不建議推嬰兒車',
      restrictedAreas: '水上樂園內各區域皆不適合推嬰兒車，建議停放在入口'
    },
    reservedTimes: {
      hasReservedTimes: false,
      quietHours: '開園初期（上午 10:00-12:00）遊客相對較少'
    },
    nursingRoom: {
      hasDedicatedNursingRoom: false,
      hasSeating: true,
      hasChangingTable: true,
      hasAirConditioning: true,
      cleanlinessRating: 4.3,
      nursingRoomNotes: '無專門哺乳室，但更衣室內有舒適的親子更衣間可用於哺乳。環境較潮濕'
    },
    petPolicy: {
      petsAllowed: false,
      petPolicyNotes: '水上樂園禁止寵物進入'
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
