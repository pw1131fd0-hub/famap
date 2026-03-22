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
    },
    climateComfort: {
      hasAirConditioning: false,
      hasHeating: false,
      hasShadedAreas: true,
      indoorAreaPercentage: 15,
      summerHeatMitigation: '園內樹蔭充足，多個休息涼亭，隨處可見飲水台',
      winterColdProtection: '戶外公園，冬季風較大，建議穿著保暖',
      hasWaterStations: true,
      hasRestAreas: true,
      climateNotes: '大型森林公園，天然樹蔭覆蓋率高，遊戲場地多為草皮，夏季不會過燙。戶外活動為主，風吹適度舒適。'
    },
    sanitationProtocols: {
      cleaningFrequency: '每日清晨及傍晚各清潔一次，遊樂設施每週深層消毒',
      disinfectionMethods: ['每日定時消毒遊樂設施', '環保無毒清潔劑', '高接觸表面每日擦拭'],
      airQualityRating: 'excellent',
      hasAirFilters: false,
      hasFrequentHandWashingStations: true,
      toySanitizationFrequency: '開放式公園，玩具由訪客自備，無共用玩具',
      highTouchSurfaceDisinfection: true,
      lastInspectionDate: '2026-03-20T00:00:00Z',
      sanitationNotes: '符合台北市環保署衛生標準，戶外環境通風良好，空氣品質佳。廁所每2小時清潔消毒一次。'
    },
    staffLanguage: {
      englishStaffAvailable: false,
      languagesSpoken: ['中文'],
      hasTranslationServices: false,
      multilingualSignage: false,
      staffTrainingLevel: 'basic',
      languageSupportNotes: '公園為開放式設施，主要由志工協助。英文說明請洽詢服務中心。'
    },
    waterSafety: {
      hasWaterActivities: false,
      waterSafetyNotes: '公園內無水上活動，無游泳池或戲水區。'
    },
    highChair: {
      hasHighChairs: false,
      highChairNotes: '戶外公園，無高腳椅提供。'
    },
    ageSpecificBathroom: {
      hasToddlerToilets: true,
      hasStepStools: true,
      hasChildHeightHandWashing: true,
      bathroomCleanlinessRating: 4.0,
      bathroomNotes: '標準公園廁所，備有階梯便凳，日常清潔維護良好。'
    },
    lostChildProtocol: {
      hasLostChildProtocol: true,
      staffIdentificationSystem: true,
      meetingPointDesignated: true,
      staffTrainingLevel: 'basic',
      lostChildProtocolNotes: '公園有遺失兒童處理程序，主要入口處設有明確集合點。工作人員具備基本訓練。'
    },
    parentRestArea: {
      hasRestAreas: true,
      hasComfortableSeating: true,
      hasShadeOrIndoor: true,
      restAreaQuantity: 8,
      restAreaCleanlinessRating: 4.5,
      restAreaNotes: '公園內有多個休息區，備有涼亭和長椅。提供飲水台和簡單飲食區。'
    },
    eventSpace: {
      hasEventSpaces: false,
      eventNotes: '戶外公園，無專門派對空間。可申請使用指定區域辦活動。'
    },
    specialNeeds: {
      hasAutismFriendlyHours: false,
      sensoryFriendlyEnvironment: false,
      quietZonesAvailable: true,
      wheelchairAccessibilityBeyondBasic: true,
      specialNeedsNotes: '無特定友善時段。園內寬敞，無障礙通道完整。較安靜的區域適合感官敏感兒童。'
    },
    medicalServices: {
      hasAED: false,
      hasFirstAidKit: true,
      hasStaffFirstAidTraining: false,
      hasMedicalStaff: false,
      nearbyHospital: '台大醫院',
      hospitalDistance: 1500,
      incidentResponseCapability: 'basic',
      medicalNotes: '公園內備有基礎急救箱。最近醫院為台大醫院。'
    },
    entertainmentSchedule: {
      hasPerformances: false,
      performanceTypes: [],
      performanceSchedule: '無定期表演',
      hasWeeklyShows: false,
      performanceContent: '公園為開放式遊樂設施，無定期表演',
      performanceLanguage: [],
      performanceLocation: '戶外',
      entertainmentNotes: '公園為開放式遊樂區域，無定期表演或活動。家庭可自行組織野餐和戶外活動。'
    },
    photoVideo: {
      allowsPhotography: true,
      allowsVideoRecording: true,
      photographyRestrictions: '無特殊限制',
      flashPhotographyAllowed: true,
      tripodAllowed: false,
      photoVideoNotes: '公園內可自由拍照和錄影。不允許使用三腳架以維護安全'
    },
    visitDuration: {
      recommendedDurationMinutes: 120,
      recommendedDurationText: '2-3小時',
      quickVisitMinutes: 60,
      fullExperienceDurationMinutes: 180,
      mustSeeActivityDurationMinutes: 90,
      includesMealTimeRecommendation: false,
      restTimeRecommendation: true,
      bestTimeToVisit: '平日上午9-11點人煙稀少，下午2點後也較少人。週末建議早上前往',
      durationNotes: '大型遊戲場和沙坑適合2-3小時遊玩。建議安排休息時間。自備食物可在野餐區享用。'
    },
    schoolHolidays: {
      winterVacationDates: '1月下旬 - 2月初',
      summerVacationDates: '7月初 - 8月底',
      midAutumnFestival: '9月中旬',
      lunarNewYearDates: '2月中旬 (農曆新年)',
      dragonBoatFestivalDate: '6月中旬',
      doubleNinthFestivalDate: '10月初',
      weeklyHolidaysInfo: '全年開放',
      winterVacationCrowding: 'moderate',
      summerVacationCrowding: 'heavy',
      lunarNewYearCrowding: 'heavy',
      holidaySpecialEventsOrHours: '農曆新年期間有特色活動，延長開放時間',
      holidayBookingRecommendation: '假期期間人潮眾多，建議提前規劃，週末特別擁擠',
      holidayNotes: '暑假和農曆新年為尖峰期。平日較少遊客，特別是上班日上午。學期中週末仍有適度人潮。'
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
    },
    climateComfort: {
      hasAirConditioning: true,
      hasHeating: true,
      hasShadedAreas: true,
      indoorAreaPercentage: 45,
      summerHeatMitigation: '多數遊樂設施有遮蔽，水上遊戲區、室內遊戲館全面空調。定時噴霧降溫。',
      winterColdProtection: '室內設施完整溫暖，戶外遊樂設施有風擋。',
      hasWaterStations: true,
      hasRestAreas: true,
      climateNotes: '混合室內外設施。夏季高溫時提供冷氣休息區和水上活動。園區設施維護良好，地面多為安全材質，溫度控制得宜。'
    },
    sanitationProtocols: {
      cleaningFrequency: '每小時高接觸表面消毒，每日深層清潔，營業前後各消毒一次',
      disinfectionMethods: ['靜電消毒噴霧', '醫療級消毒液', 'HEPA空氣淨化', '每30分鐘一次高接觸表面擦拭'],
      airQualityRating: 'excellent',
      hasAirFilters: true,
      hasFrequentHandWashingStations: true,
      toySanitizationFrequency: '所有共用玩具每日消毒3次，使用者触摸後立即清潔',
      highTouchSurfaceDisinfection: true,
      lastInspectionDate: '2026-03-18T00:00:00Z',
      sanitationNotes: '符合台灣CDC後疫情時代衛生標準。HEPA濾網每季更換。所有設施定期安全檢驗與消毒。'
    },
    staffLanguage: {
      englishStaffAvailable: true,
      languagesSpoken: ['中文', '英文', '日文'],
      hasTranslationServices: true,
      multilingualSignage: true,
      staffTrainingLevel: 'trained',
      languageSupportNotes: '售票處及主要設施區備有英文說明人員。入口QR碼提供多語言翻譯（英文、日文、越南文）。'
    },
    waterSafety: {
      hasWaterActivities: true,
      lifeguardAvailable: true,
      lifeguardRatio: '5名救生員值班',
      hasShallowAreas: true,
      poolTemperature: '26-28°C',
      waterSafetyRulesEnforced: true,
      waterSafetyNotes: '園區有水上遊樂設施，5名專業救生員全時值班。設有幼兒淺水區，溫度控制在26-28°C。'
    },
    highChair: {
      hasHighChairs: true,
      highChairQuantity: 15,
      minimumAgeMonths: 6,
      maximumAgeMonths: 36,
      cleanlinessRating: 4.8,
      hasBottleWarmingFacilities: true,
      highChairNotes: '15張高腳椅可供使用，適合6個月至3歲幼兒，每次使用後清潔消毒。'
    },
    ageSpecificBathroom: {
      hasToddlerToilets: true,
      hasStepStools: true,
      hasChildHeightHandWashing: true,
      hasPrivacyFamilyBathroom: true,
      bathroomCleanlinessRating: 4.8,
      bathroomNotes: '兒童專用廁所，設有階梯便凳和兒童高度洗手設施。整園廁所清潔度優異。'
    },
    lostChildProtocol: {
      hasLostChildProtocol: true,
      staffIdentificationSystem: true,
      hasEmergencyPaging: true,
      hasIDWristbandSystem: true,
      meetingPointDesignated: true,
      staffTrainingLevel: 'comprehensive',
      lostChildProtocolNotes: '完善的遺失兒童處理程序，提供身份手環識別系統，廣播尋人系統，多個集合點。工作人員經過全面訓練。'
    },
    parentRestArea: {
      hasRestAreas: true,
      hasComfortableSeating: true,
      hasShadeOrIndoor: true,
      hasFeedingAreas: true,
      hasRefreshmentAccess: true,
      restAreaQuantity: 5,
      restAreaCleanlinessRating: 4.9,
      restAreaNotes: '多個舒適休息區，配備長椅沙發。設有親子餐飲區和哺乳室附近的安靜區域。'
    },
    eventSpace: {
      hasEventSpaces: true,
      hasIndoorEventSpace: true,
      birthdayPartyPackages: true,
      eventSpaceCapacity: '20-80人',
      maxPartyGroupSize: 80,
      requiresAdvanceBooking: true,
      partyPackageIncludes: ['租賃場地', '教育表演', '點心飲料'],
      partyPriceRange: 'NT$3000-8000',
      eventNotes: '室內派對空間可容納20-80人，包含主題教育表演和飲料。需提前預約。'
    },
    specialNeeds: {
      hasAutismFriendlyHours: false,
      sensoryFriendlyEnvironment: false,
      quietZonesAvailable: true,
      staffTrainedInSpecialNeeds: false,
      wheelchairAccessibilityBeyondBasic: true,
      specialNeedsNotes: '無專門友善時段。展覽區內無障礙設施完善。某些展區較擁擠，可能不適合感官敏感兒童。'
    },
    medicalServices: {
      hasAED: true,
      aedLocation: '主要入口和3F展覽區',
      hasFirstAidKit: true,
      hasStaffFirstAidTraining: true,
      hasMedicalStaff: false,
      nearbyHospital: '台大醫院',
      hospitalDistance: 800,
      emergencyContactNumbers: ['02-2382-2699'],
      incidentResponseCapability: 'standard',
      medicalNotes: '館內設有AED和急救室。工作人員受過培訓。緊急聯絡電話貼於館內各處。'
    },
    entertainmentSchedule: {
      hasPerformances: true,
      performanceTypes: ['live music show', 'educational performance', 'puppet theater', 'interactive dance'],
      performanceSchedule: '週末及假日每日11:00, 14:00, 16:00各一場',
      hasWeeklyShows: true,
      showDuration: '20-25分鐘',
      minAgeForShow: 2,
      maxAgeForShow: 12,
      performanceContent: '適合2-12歲兒童的互動式表演，結合音樂、舞蹈和教育元素',
      requiresAdvanceBooking: false,
      hasInteractiveActivities: true,
      performanceLanguage: ['普通話', '台語'],
      performanceLocation: '室內表演廳',
      entertainmentNotes: '每週末及假日提供3場精彩表演，免額外購票。小朋友可在表演中互動參與。'
    },
    photoVideo: {
      allowsPhotography: true,
      allowsVideoRecording: true,
      photographyRestrictions: '遊樂設施及表演可自由拍照',
      flashPhotographyAllowed: true,
      tripodAllowed: false,
      photoVideoNotes: '樂園內可自由拍照和錄影。表演區不允許專業錄影設備，禁止三腳架使用'
    },
    visitDuration: {
      recommendedDurationMinutes: 240,
      recommendedDurationText: '4-5小時',
      quickVisitMinutes: 180,
      fullExperienceDurationMinutes: 300,
      mustSeeActivityDurationMinutes: 180,
      includesMealTimeRecommendation: true,
      mealTimeSuggestion: '1-1.5小時用於午餐',
      restTimeRecommendation: true,
      bestTimeToVisit: '平日下午1-3點人潮最少。週末建議早上開園時或下午4點後前往',
      durationNotes: '樂園設施眾多，建議安排4-5小時完整遊玩所有主要區域。含午餐時間。建議中途安排休息'
    },
    schoolHolidays: {
      winterVacationDates: '1月下旬 - 2月初',
      summerVacationDates: '7月初 - 8月底',
      midAutumnFestival: '9月中旬',
      lunarNewYearDates: '2月中旬 (農曆新年)',
      dragonBoatFestivalDate: '6月中旬',
      doubleNinthFestivalDate: '10月初',
      weeklyHolidaysInfo: '全年開放',
      winterVacationCrowding: 'heavy',
      summerVacationCrowding: 'heavy',
      lunarNewYearCrowding: 'heavy',
      holidaySpecialEventsOrHours: '農曆新年期間延長營業時間至晚間，舉辦特色表演',
      holidayBookingRecommendation: '假期期間人潮眾多，週末特別擁擠，強烈建議平日前往或提前線上購票',
      holidayNotes: '暑假和農曆新年為全年最擁擠時期。平日人潮較少。週末通常需排隊等待各遊樂設施。'
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
    },
    climateComfort: {
      hasAirConditioning: true,
      hasHeating: true,
      hasShadedAreas: false,
      indoorAreaPercentage: 100,
      summerHeatMitigation: '完全室內設施，空調調控舒適，全年溫度恆定22-24°C',
      winterColdProtection: '室內全面供暖，冬季舒適溫暖',
      hasWaterStations: true,
      hasRestAreas: true,
      climateNotes: '歷史建築完全室內展示。夏天去博物館是逃避炎熱的理想去處，冬天也溫暖舒適。全館均勻冷暖氣控制。'
    },
    sanitationProtocols: {
      cleaningFrequency: '每日開館前全館消毒，遊客參觀期間每小時清潔一次',
      disinfectionMethods: ['EPA認證消毒液', '紫外線消毒展示區', '高效空氣淨化系統'],
      airQualityRating: 'excellent',
      hasAirFilters: true,
      hasFrequentHandWashingStations: true,
      toySanitizationFrequency: '互動展示區每30分鐘消毒一次',
      highTouchSurfaceDisinfection: true,
      lastInspectionDate: '2026-03-19T00:00:00Z',
      sanitationNotes: '符合台灣文化部博物館衛生標準。工作人員定期訓練，消毒用品符合國際安全規範。'
    },
    staffLanguage: {
      englishStaffAvailable: true,
      languagesSpoken: ['中文', '英文', '日文', '法文'],
      hasTranslationServices: true,
      multilingualSignage: true,
      staffTrainingLevel: 'certified',
      languageSupportNotes: '導覽員具多語言認證。館內展示牌有中英文，導覽預約可提供英文、日文或法文解說。'
    },
    waterSafety: {
      hasWaterActivities: false,
      waterSafetyNotes: '博物館內無水上活動或游泳池設施。'
    },
    highChair: {
      hasHighChairs: true,
      highChairQuantity: 8,
      minimumAgeMonths: 6,
      maximumAgeMonths: 36,
      cleanlinessRating: 4.9,
      highChairNotes: '提供8張高腳椅，清潔度優異，適合6個月至3歲幼兒。'
    },
    ageSpecificBathroom: {
      hasToddlerToilets: true,
      hasStepStools: true,
      hasChildHeightHandWashing: true,
      hasPrivacyFamilyBathroom: true,
      bathroomCleanlinessRating: 4.9,
      bathroomNotes: '現代化設施，配備全面幼兒友善設施，包括家庭廁所。清潔度達到博物館最高標準。'
    },
    lostChildProtocol: {
      hasLostChildProtocol: true,
      staffIdentificationSystem: true,
      meetingPointDesignated: true,
      staffTrainingLevel: 'standard',
      lostChildProtocolNotes: '博物館備有遺失兒童處理程序，設有多個明確集合點。工作人員經過標準訓練。'
    },
    parentRestArea: {
      hasRestAreas: true,
      hasComfortableSeating: true,
      hasShadeOrIndoor: true,
      hasFeedingAreas: true,
      hasChargingStations: true,
      restAreaQuantity: 6,
      restAreaCleanlinessRating: 4.8,
      restAreaNotes: '多個舒適休息區配備沙發椅。設有充電站供家長使用手機。主要展廳外設有親子餐飲區。'
    },
    eventSpace: {
      hasEventSpaces: false,
      eventNotes: '博物館內無派對空間。可詢問館方特殊活動租借。'
    },
    specialNeeds: {
      hasAutismFriendlyHours: false,
      sensoryFriendlyEnvironment: false,
      quietZonesAvailable: true,
      staffTrainedInSpecialNeeds: false,
      wheelchairAccessibilityBeyondBasic: true,
      visuallyImpairedSupport: true,
      specialNeedsNotes: '無特殊友善時段。無障礙設施完善。特定展區配備視覺障礙者觸覺展示。安靜學習區適合感官敏感兒童。'
    },
    medicalServices: {
      hasAED: true,
      aedLocation: '一樓大廳和二樓休息區',
      hasFirstAidKit: true,
      hasStaffFirstAidTraining: true,
      hasMedicalStaff: false,
      nearbyHospital: '台大醫院',
      hospitalDistance: 600,
      emergencyContactNumbers: ['02-2382-2699', '119'],
      incidentResponseCapability: 'standard',
      medicalNotes: '館內設有AED和完整急救設備。工作人員受過急救訓練。'
    },
    entertainmentSchedule: {
      hasPerformances: true,
      performanceTypes: ['educational demonstration', 'interactive workshop', 'guided tour'],
      performanceSchedule: '週六、日下午14:00-15:00，假日上午11:00-12:00',
      hasWeeklyShows: true,
      showDuration: '30-45分鐘',
      minAgeForShow: 5,
      maxAgeForShow: 12,
      performanceContent: '互動式自然科學教育展示，講解台灣的古生物和地質',
      requiresAdvanceBooking: false,
      hasInteractiveActivities: true,
      performanceLanguage: ['普通話', '台語'],
      performanceLocation: '特展廳',
      entertainmentNotes: '定期舉辦教育導覽和互動演示。週末提供兒童友善的解說活動，帶領小朋友認識台灣自然歷史。'
    },
    photoVideo: {
      allowsPhotography: true,
      allowsVideoRecording: false,
      photographyRestrictions: '個人拍照可以，某些特展廳禁止拍照，請詢問館員',
      flashPhotographyAllowed: false,
      tripodAllowed: false,
      commercialPhotographyAllowed: false,
      photoVideoNotes: '博物館禁止商業攝影和錄影。個人拍照可以，但某些展區禁止閃光燈。請尊重他人遊館體驗'
    },
    visitDuration: {
      recommendedDurationMinutes: 150,
      recommendedDurationText: '2.5-3小時',
      quickVisitMinutes: 90,
      fullExperienceDurationMinutes: 180,
      mustSeeActivityDurationMinutes: 120,
      includesMealTimeRecommendation: false,
      restTimeRecommendation: true,
      bestTimeToVisit: '平日上午10-12點人較少，適合細細欣賞展品。避免週末午餐時間人潮',
      durationNotes: '適合2.5-3小時參觀。自然生態展廳最受兒童歡迎。建議中途在休息區休息。'
    },
    schoolHolidays: {
      winterVacationDates: '1月下旬 - 2月初',
      summerVacationDates: '7月初 - 8月底',
      midAutumnFestival: '9月中旬',
      lunarNewYearDates: '2月中旬 (農曆新年)',
      dragonBoatFestivalDate: '6月中旬',
      doubleNinthFestivalDate: '10月初',
      weeklyHolidaysInfo: '每週一休館',
      winterVacationCrowding: 'moderate',
      summerVacationCrowding: 'heavy',
      lunarNewYearCrowding: 'heavy',
      holidaySpecialEventsOrHours: '農曆新年期間舉辦特展和教育活動，延長開放時間',
      holidayBookingRecommendation: '假期期間人潮眾多，建議避開午餐時段和週末',
      holidayNotes: '農曆新年期間人潮最多。暑假平日仍有適度遊客。平日上午最清靜。'
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
    },
    climateComfort: {
      hasAirConditioning: true,
      hasHeating: true,
      hasShadedAreas: false,
      indoorAreaPercentage: 100,
      summerHeatMitigation: '完全室內冷氣餐廳，溫度舒適涼爽，全年22-24°C恆溫',
      winterColdProtection: '室內全面供暖，冬季舒適溫暖',
      hasWaterStations: true,
      hasRestAreas: true,
      climateNotes: '全室內親子餐廳，夏天完全冷氣，是炎熱天氣逃難所。冬季也溫暖舒適。遊戲區和用餐區溫度均一致舒適。'
    },
    sanitationProtocols: {
      cleaningFrequency: '每小時全區清潔，高接觸物體每30分鐘消毒一次',
      disinfectionMethods: ['食品級消毒劑', 'HEPA濾網空氣淨化系統', '紫外線消毒玩具區'],
      airQualityRating: 'excellent',
      hasAirFilters: true,
      hasFrequentHandWashingStations: true,
      toySanitizationFrequency: '玩具區每使用完一班就消毒一次，每日深層消毒',
      highTouchSurfaceDisinfection: true,
      lastInspectionDate: '2026-03-17T00:00:00Z',
      sanitationNotes: '符合食品衛生法規，對嬰幼兒友善的無毒清潔方式。每月第一個禮拜進行專業深層消毒。'
    },
    staffLanguage: {
      englishStaffAvailable: true,
      languagesSpoken: ['中文', '英文', '越南文'],
      hasTranslationServices: true,
      multilingualSignage: true,
      staffTrainingLevel: 'trained',
      languageSupportNotes: '新住民社區常客，工作人員會基本英文和越南文溝通。提供簡單的多語言菜單。'
    },
    waterSafety: {
      hasWaterActivities: false,
      waterSafetyNotes: '餐廳內無水上活動或游泳池。'
    },
    highChair: {
      hasHighChairs: true,
      highChairQuantity: 10,
      minimumAgeMonths: 6,
      maximumAgeMonths: 36,
      cleanlinessRating: 4.9,
      hasBottleWarmingFacilities: true,
      highChairNotes: '10張高腳椅可供使用，適合6個月至3歲幼兒。清潔標準優異，每次使用後徹底消毒。'
    },
    ageSpecificBathroom: {
      hasToddlerToilets: true,
      hasStepStools: true,
      hasChildHeightHandWashing: true,
      hasPrivacyFamilyBathroom: true,
      bathroomCleanlinessRating: 4.8,
      bathroomNotes: '設有家庭廁所，兒童高度洗手設施齊全。廁所環境舒適乾淨。'
    },
    lostChildProtocol: {
      hasLostChildProtocol: true,
      staffIdentificationSystem: true,
      staffTrainingLevel: 'basic',
      lostChildProtocolNotes: '餐廳備有基本遺失兒童處理程序。工作人員具備基礎安全訓練。'
    },
    parentRestArea: {
      hasRestAreas: true,
      hasComfortableSeating: true,
      hasShadeOrIndoor: true,
      hasFeedingAreas: true,
      hasRefreshmentAccess: true,
      hasChargingStations: true,
      restAreaQuantity: 4,
      restAreaCleanlinessRating: 4.9,
      restAreaNotes: '親子餐廳內有多個舒適用餐區和休息沙發。設有充電站和飲用水。'
    },
    eventSpace: {
      hasEventSpaces: true,
      hasIndoorEventSpace: true,
      birthdayPartyPackages: true,
      eventSpaceCapacity: '15-40人',
      maxPartyGroupSize: 40,
      requiresAdvanceBooking: true,
      partyPackageIncludes: ['遊戲區場地', '簡餐', '基本裝飾'],
      partyPriceRange: 'NT$1800-3500',
      eventNotes: '提供派對場地，含簡餐和遊戲區使用。需提前7日預約。'
    },
    specialNeeds: {
      hasAutismFriendlyHours: true,
      sensoryFriendlyEnvironment: true,
      quietZonesAvailable: true,
      staffTrainedInSpecialNeeds: true,
      wheelchairAccessibilityBeyondBasic: true,
      specialNeedsSchedule: '安靜時段：週三下午2-4點',
      specialNeedsNotes: '親子餐廳主動設置安靜時段。遊戲區有感官友善區域。工作人員對特殊需求兒童友善。'
    },
    medicalServices: {
      hasAED: true,
      aedLocation: '入口附近和員工休息室',
      hasFirstAidKit: true,
      hasStaffFirstAidTraining: true,
      hasMedicalStaff: false,
      nearbyHospital: '新光醫院',
      hospitalDistance: 1200,
      emergencyContactNumbers: ['02-5555-XXXX', '119'],
      incidentResponseCapability: 'standard',
      medicalNotes: '設有AED和完整急救箱。工作人員受過CPR訓練。'
    },
    entertainmentSchedule: {
      hasPerformances: true,
      performanceTypes: ['live music', 'puppet show', 'storytelling', 'interactive game'],
      performanceSchedule: '每週三、六下午15:00-16:00，每月特別表演',
      hasWeeklyShows: true,
      showDuration: '25-35分鐘',
      minAgeForShow: 1,
      maxAgeForShow: 8,
      performanceContent: '親子友善的音樂表演和木偶劇，適合幼兒和學齡前兒童',
      requiresAdvanceBooking: false,
      hasInteractiveActivities: true,
      performanceLanguage: ['普通話', '台語'],
      performanceLocation: '室內多功能廳',
      entertainmentNotes: '餐廳定期舉辦親子友善表演。表演期間家長可在旁邊休息區放鬆。表演免額外費用。'
    },
    photoVideo: {
      allowsPhotography: true,
      allowsVideoRecording: true,
      photographyRestrictions: '可以拍照，但表演期間不要影響他人',
      flashPhotographyAllowed: false,
      tripodAllowed: false,
      photoVideoNotes: '餐廳內可拍照和錄影。禁止使用閃光燈以免驚嚇幼兒。表演期間錄影請保持低調'
    },
    visitDuration: {
      recommendedDurationMinutes: 120,
      recommendedDurationText: '2-2.5小時',
      quickVisitMinutes: 60,
      fullExperienceDurationMinutes: 150,
      mustSeeActivityDurationMinutes: 90,
      includesMealTimeRecommendation: true,
      mealTimeSuggestion: '1小時用於用餐',
      restTimeRecommendation: true,
      bestTimeToVisit: '平日上午人較少。避免午餐尖峰時間11:30-13:00和晚餐時間17:30-19:00',
      durationNotes: '親子餐廳適合2-2.5小時用餐和遊玩。含用餐時間。適合與嬰幼兒同行的家庭。'
    },
    schoolHolidays: {
      winterVacationDates: '1月下旬 - 2月初',
      summerVacationDates: '7月初 - 8月底',
      midAutumnFestival: '9月中旬',
      lunarNewYearDates: '2月中旬 (農曆新年)',
      dragonBoatFestivalDate: '6月中旬',
      doubleNinthFestivalDate: '10月初',
      weeklyHolidaysInfo: '全年開放',
      winterVacationCrowding: 'moderate',
      summerVacationCrowding: 'moderate',
      lunarNewYearCrowding: 'heavy',
      holidaySpecialEventsOrHours: '農曆新年期間舉辦特別親子活動',
      holidayBookingRecommendation: '假期期間建議提前預約，午餐時段最擁擠',
      holidayNotes: '農曆新年期間人潮眾多。暑假和寒假期間平日仍有適度人潮。用餐時段通常較擁擠。'
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
    },
    climateComfort: {
      hasAirConditioning: true,
      hasHeating: true,
      hasShadedAreas: false,
      indoorAreaPercentage: 100,
      summerHeatMitigation: '完全室內設施，暖水池全年溫度控制，遊泳是夏季完美解暑活動',
      winterColdProtection: '暖水池全年溫暖，淋浴間和換衣室溫度舒適',
      hasWaterStations: true,
      hasRestAreas: true,
      climateNotes: '現代親子中心設施，全年四季恆溫22-25°C。游泳池水溫全年保持26-28°C，冬夏皆宜。'
    },
    sanitationProtocols: {
      cleaningFrequency: '每2小時全面清潔，游泳池每日檢測水質3次並消毒',
      disinfectionMethods: ['氯消毒', '紫外線池水處理', '高效空氣過濾系統'],
      airQualityRating: 'excellent',
      hasAirFilters: true,
      hasFrequentHandWashingStations: true,
      toySanitizationFrequency: '開放式親子設施，共用玩具每日消毒',
      highTouchSurfaceDisinfection: true,
      lastInspectionDate: '2026-03-16T00:00:00Z',
      sanitationNotes: '符合台北市體育局游泳池衛生管理標準。全新設施，消毒標準高。'
    },
    staffLanguage: {
      englishStaffAvailable: false,
      languagesSpoken: ['中文'],
      hasTranslationServices: false,
      multilingualSignage: false,
      staffTrainingLevel: 'basic',
      languageSupportNotes: '運動中心工作人員主要為中文。英文課程可洽詢客服。'
    },
    waterSafety: {
      hasWaterActivities: true,
      lifeguardAvailable: true,
      lifeguardRatio: '6名救生員值班',
      poolTemperature: '26-28°C',
      waterSafetyRulesEnforced: true,
      waterSafetyNotes: '親子中心設有溫水游泳池，26-28°C恆溫。6名專業救生員全時值班，嚴格執行水安全規則。'
    },
    highChair: {
      hasHighChairs: true,
      highChairQuantity: 6,
      minimumAgeMonths: 6,
      maximumAgeMonths: 36,
      hasBottleWarmingFacilities: true,
      highChairNotes: '6張高腳椅可供使用，備有奶瓶溫熱設施。適合6個月至3歲幼兒。'
    },
    ageSpecificBathroom: {
      hasToddlerToilets: true,
      hasStepStools: true,
      hasChildHeightHandWashing: true,
      hasPrivacyFamilyBathroom: true,
      bathroomCleanlinessRating: 4.7,
      bathroomNotes: '親子友善設施優異，備有幼兒馬桶和階梯便凳。廁所清潔度佳。'
    },
    lostChildProtocol: {
      hasLostChildProtocol: true,
      staffIdentificationSystem: true,
      meetingPointDesignated: true,
      staffTrainingLevel: 'comprehensive',
      lostChildProtocolNotes: '親子中心備有完善遺失兒童處理程序，設有多個明確集合點。工作人員經過全面訓練。'
    },
    parentRestArea: {
      hasRestAreas: true,
      hasComfortableSeating: true,
      hasShadeOrIndoor: true,
      hasFeedingAreas: true,
      restAreaQuantity: 3,
      restAreaCleanlinessRating: 4.6,
      restAreaNotes: '親子中心有舒適休息區，備有沙發和飲水設施。'
    },
    eventSpace: {
      hasEventSpaces: false,
      eventNotes: '親子中心內無專門派對空間。體育中心另有會議室可租借。'
    },
    specialNeeds: {
      hasAutismFriendlyHours: false,
      sensoryFriendlyEnvironment: false,
      quietZonesAvailable: true,
      staffTrainedInSpecialNeeds: false,
      wheelchairAccessibilityBeyondBasic: true,
      specialNeedsNotes: '無特定友善時段。無障礙設施完善。游泳池有固定式遊客用斜坡進出。'
    },
    medicalServices: {
      hasAED: true,
      aedLocation: '大廳和游泳池畔',
      hasFirstAidKit: true,
      hasStaffFirstAidTraining: true,
      hasMedicalStaff: false,
      nearbyHospital: '北慈醫院',
      hospitalDistance: 1500,
      emergencyContactNumbers: ['02-XXXX-XXXX', '119'],
      incidentResponseCapability: 'standard',
      medicalNotes: '運動中心備有AED和急救站。救生員和工作人員均受過訓練。'
    },
    entertainmentSchedule: {
      hasPerformances: false,
      performanceTypes: [],
      performanceSchedule: '無定期表演',
      hasWeeklyShows: false,
      performanceContent: '親子中心主要以設施活動為主，無定期表演',
      performanceLanguage: [],
      performanceLocation: '多功能區',
      entertainmentNotes: '親子中心設有遊樂設施、游泳池和活動區。定期舉辦親子課程和工坊（如瑜伽、舞蹈），但無定期表演節目。'
    },
    photoVideo: {
      allowsPhotography: true,
      allowsVideoRecording: true,
      photographyRestrictions: '游泳池可拍照，但禁止在更衣室和浴室拍照',
      flashPhotographyAllowed: false,
      tripodAllowed: false,
      photoVideoNotes: '親子中心可拍照和錄影。游泳池区域禁止閃光燈。尊重隱私，禁止在更衣室錄影。'
    },
    visitDuration: {
      recommendedDurationMinutes: 90,
      recommendedDurationText: '1.5-2小時',
      quickVisitMinutes: 60,
      fullExperienceDurationMinutes: 120,
      mustSeeActivityDurationMinutes: 90,
      includesMealTimeRecommendation: false,
      restTimeRecommendation: false,
      bestTimeToVisit: '平日下午1-4點人較少。避免放學時間16:00-18:00和週末',
      durationNotes: '游泳課程通常30-45分鐘。遊樂區遊玩約1小時。加上更衣時間共1.5-2小時。'
    },
    schoolHolidays: {
      winterVacationDates: '1月下旬 - 2月初',
      summerVacationDates: '7月初 - 8月底',
      midAutumnFestival: '9月中旬',
      lunarNewYearDates: '2月中旬 (農曆新年)',
      dragonBoatFestivalDate: '6月中旬',
      doubleNinthFestivalDate: '10月初',
      weeklyHolidaysInfo: '全年開放',
      winterVacationCrowding: 'heavy',
      summerVacationCrowding: 'heavy',
      lunarNewYearCrowding: 'moderate',
      holidaySpecialEventsOrHours: '暑假期間加開游泳課程班次',
      holidayBookingRecommendation: '寒假和暑假期間報名課程需提前預約，周末尖峰時段擁擠',
      holidayNotes: '寒假和暑假是兒童游泳課程高峰期。平日下午人潮相對較少。週末通常擁擠。'
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
    },
    climateComfort: {
      hasAirConditioning: true,
      hasHeating: true,
      hasShadedAreas: true,
      indoorAreaPercentage: 30,
      summerHeatMitigation: '室內游泳館冷氣舒適，戶外池有遮陽棚，暖水池全年溫度控制',
      winterColdProtection: '暖水池冬季溫暖舒適，室內淋浴區和休息區溫度充足',
      hasWaterStations: true,
      hasRestAreas: true,
      climateNotes: '混合室內外設施。游泳是夏季解暑首選，冬季暖水池依然開放。遮蔽區和涼亭眾多。'
    },
    sanitationProtocols: {
      cleaningFrequency: '每小時清潔一次，游泳池每日水質檢測2次並消毒',
      disinfectionMethods: ['氯消毒系統', '高效濾水系統', '每日高溫消毒設施'],
      airQualityRating: 'good',
      hasAirFilters: true,
      hasFrequentHandWashingStations: true,
      toySanitizationFrequency: '共用玩具每日消毒一次，每週深層清潔',
      highTouchSurfaceDisinfection: true,
      lastInspectionDate: '2026-03-15T00:00:00Z',
      sanitationNotes: '符合台北市和新北市游泳設施衛生標準。運動中心級別的清潔管理。'
    },
    staffLanguage: {
      englishStaffAvailable: false,
      languagesSpoken: ['中文'],
      hasTranslationServices: false,
      multilingualSignage: false,
      staffTrainingLevel: 'basic',
      languageSupportNotes: '運動中心工作人員主要為中文溝通。英文手冊可在服務台索取。'
    },
    waterSafety: {
      hasWaterActivities: true,
      lifeguardAvailable: true,
      lifeguardRatio: '奧運標準游泳池救生員值班',
      hasShallowAreas: true,
      poolTemperature: '26-28°C',
      waterSafetyRulesEnforced: true,
      waterSafetyNotes: '運動中心設有奧運標準游泳池，專業救生員全時值班。設有兒童淺水區，溫度26-28°C。'
    },
    highChair: {
      hasHighChairs: true,
      highChairQuantity: 2,
      minimumAgeMonths: 6,
      maximumAgeMonths: 36,
      highChairNotes: '運動中心作為運動設施，僅提供2張高腳椅供基本使用。'
    },
    ageSpecificBathroom: {
      hasToddlerToilets: true,
      hasStepStools: true,
      hasPrivacyFamilyBathroom: true,
      bathroomCleanlinessRating: 4.5,
      bathroomNotes: '標準設施，備有獨立更衣室區域，方便家長協助幼兒更衣。'
    },
    lostChildProtocol: {
      hasLostChildProtocol: true,
      staffIdentificationSystem: true,
      meetingPointDesignated: true,
      staffTrainingLevel: 'standard',
      lostChildProtocolNotes: '運動中心備有標準遺失兒童處理程序。工作人員經過訓練，備有緊急程序。'
    },
    parentRestArea: {
      hasRestAreas: true,
      hasComfortableSeating: true,
      hasShadeOrIndoor: false,
      hasFeedingAreas: true,
      restAreaQuantity: 5,
      restAreaCleanlinessRating: 4.4,
      restAreaNotes: '運動中心有多個戶外休息區，部分有遮陽。設有飲水和簡餐區。'
    },
    eventSpace: {
      hasEventSpaces: false,
      eventNotes: '運動中心內無派對空間。可接洽管理單位特殊活動申請。'
    },
    specialNeeds: {
      hasAutismFriendlyHours: false,
      sensoryFriendlyEnvironment: false,
      quietZonesAvailable: true,
      wheelchairAccessibilityBeyondBasic: true,
      specialNeedsNotes: '無特定友善時段。無障礙設施完善。安靜區域適合敏感兒童使用。'
    },
    medicalServices: {
      hasAED: true,
      aedLocation: '入口大廳',
      hasFirstAidKit: true,
      hasStaffFirstAidTraining: true,
      hasMedicalStaff: false,
      nearbyHospital: '恩主公醫院',
      hospitalDistance: 1800,
      emergencyContactNumbers: ['02-XXXX-XXXX', '119'],
      incidentResponseCapability: 'standard',
      medicalNotes: '運動設施備有AED和救急箱。工作人員均受過基本訓練。'
    },
    entertainmentSchedule: {
      hasPerformances: false,
      performanceTypes: [],
      performanceSchedule: '無定期表演',
      hasWeeklyShows: false,
      performanceContent: '運動中心以水上運動和健身課程為主，無專業表演節目',
      performanceLanguage: [],
      performanceLocation: '游泳區',
      entertainmentNotes: '運動中心提供游泳課程和水上運動活動。定期舉辦親子游泳班和水中有氧課程，但無定期表演。'
    },
    photoVideo: {
      allowsPhotography: true,
      allowsVideoRecording: false,
      photographyRestrictions: '游泳池可拍照但禁止錄影，保護隱私',
      flashPhotographyAllowed: false,
      tripodAllowed: false,
      photoVideoNotes: '運動中心禁止錄影以保護隱私。個人拍照可以但禁止使用閃光燈，禁止三腳架。'
    },
    visitDuration: {
      recommendedDurationMinutes: 90,
      recommendedDurationText: '1.5-2小時',
      quickVisitMinutes: 60,
      fullExperienceDurationMinutes: 120,
      mustSeeActivityDurationMinutes: 60,
      includesMealTimeRecommendation: false,
      restTimeRecommendation: false,
      bestTimeToVisit: '平日下午1-4點人較少。避免放學時間和週末',
      durationNotes: '游泳課程通常45-60分鐘。加上更衣和熱身時間共1.5-2小時。'
    },
    schoolHolidays: {
      winterVacationDates: '1月下旬 - 2月初',
      summerVacationDates: '7月初 - 8月底',
      midAutumnFestival: '9月中旬',
      lunarNewYearDates: '2月中旬 (農曆新年)',
      dragonBoatFestivalDate: '6月中旬',
      doubleNinthFestivalDate: '10月初',
      weeklyHolidaysInfo: '全年開放',
      winterVacationCrowding: 'moderate',
      summerVacationCrowding: 'heavy',
      lunarNewYearCrowding: 'moderate',
      holidaySpecialEventsOrHours: '暑假期間增加課程班次',
      holidayBookingRecommendation: '暑假期間課程名額有限，需提前預約',
      holidayNotes: '暑假最繁忙，課程與自由游泳區都擁擠。平日下午人潮最少。週末尖峰時段需等候。'
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
    },
    climateComfort: {
      hasAirConditioning: false,
      hasHeating: false,
      hasShadedAreas: true,
      indoorAreaPercentage: 5,
      summerHeatMitigation: '園區有多個遮蔽涼亭，水上活動是消暑首選。定時出現人工波浪，水溫適中',
      winterColdProtection: '水上樂園冬季關閉。',
      hasWaterStations: true,
      hasRestAreas: true,
      climateNotes: '夏季限定開放（6-9月）。完全戶外設施，但有遮蔭區和涼亭。水上遊戲讓小孩在炎熱天氣中玩耍時保持涼爽。'
    },
    sanitationProtocols: {
      cleaningFrequency: '每日開園前全面清潔，營業中每小時清潔一次',
      disinfectionMethods: ['氯系統消毒', '定時池水檢測', '高效過濾系統'],
      airQualityRating: 'good',
      hasAirFilters: false,
      hasFrequentHandWashingStations: true,
      toySanitizationFrequency: '玩具區每日消毒一次',
      highTouchSurfaceDisinfection: true,
      lastInspectionDate: '2026-06-01T00:00:00Z',
      sanitationNotes: '符合新北市環保署水上設施衛生標準。各池水質定期檢測。'
    },
    staffLanguage: {
      englishStaffAvailable: false,
      languagesSpoken: ['中文'],
      hasTranslationServices: false,
      multilingualSignage: false,
      staffTrainingLevel: 'basic',
      languageSupportNotes: '水上樂園工作人員主要為中文溝通。遊園指南可在售票處索取。'
    },
    waterSafety: {
      hasWaterActivities: true,
      lifeguardAvailable: true,
      lifeguardRatio: '10名以上救生員值班',
      waterQualityTesting: '每日水質檢測',
      hasShallowAreas: true,
      poolTemperature: '25-30°C',
      hasLifeJacketRental: true,
      waterSafetyRulesEnforced: true,
      waterSafetyNotes: '水上樂園設有多個游泳池和滑水道。10名以上專業救生員全時值班。水質每日檢測。備有救生衣租賃服務。'
    },
    highChair: {
      hasHighChairs: true,
      highChairQuantity: 12,
      minimumAgeMonths: 6,
      maximumAgeMonths: 36,
      cleanlinessRating: 4.6,
      highChairNotes: '食堂區域提供12張高腳椅，定期清潔，適合6個月至3歲幼兒。'
    },
    ageSpecificBathroom: {
      hasToddlerToilets: true,
      hasStepStools: true,
      hasChildHeightHandWashing: true,
      hasPrivacyFamilyBathroom: true,
      bathroomCleanlinessRating: 4.7,
      bathroomNotes: '家庭更衣區域完善，幼兒友善設施齊全。更衣室乾淨舒適。'
    },
    lostChildProtocol: {
      hasLostChildProtocol: true,
      staffIdentificationSystem: true,
      hasEmergencyPaging: true,
      hasIDWristbandSystem: true,
      meetingPointDesignated: true,
      staffTrainingLevel: 'comprehensive',
      lostChildProtocolNotes: '水上樂園備有完善遺失兒童處理程序。提供身份手環系統，多個集合點，廣播系統。工作人員經過全面訓練。'
    },
    parentRestArea: {
      hasRestAreas: true,
      hasComfortableSeating: true,
      hasShadeOrIndoor: true,
      hasFeedingAreas: true,
      hasRefreshmentAccess: true,
      restAreaQuantity: 8,
      restAreaCleanlinessRating: 4.6,
      restAreaNotes: '水上樂園有多個遮陽休息區，備有遮陽傘和涼亭。食堂和餐飲區提供飲食。'
    },
    eventSpace: {
      hasEventSpaces: true,
      hasIndoorEventSpace: false,
      hasOutdoorEventSpace: true,
      birthdayPartyPackages: true,
      eventSpaceCapacity: '50-200人',
      maxPartyGroupSize: 200,
      requiresAdvanceBooking: true,
      partyPackageIncludes: ['樂園入場', '專屬派對區域', '飲料小食', '救生員管理'],
      partyPriceRange: 'NT$5000-15000',
      eventNotes: '水上樂園提供派對包廂，含園區入場和飲食。大型派對需提前預約。'
    },
    specialNeeds: {
      hasAutismFriendlyHours: false,
      sensoryFriendlyEnvironment: false,
      quietZonesAvailable: true,
      wheelchairAccessibilityBeyondBasic: true,
      specialNeedsNotes: '無特定友善時段。無障礙設施完善。有安靜休息區適合感官敏感兒童。'
    },
    medicalServices: {
      hasAED: true,
      aedLocation: '入口、救生所、食堂區',
      hasFirstAidKit: true,
      hasStaffFirstAidTraining: true,
      hasMedicalStaff: true,
      nearbyHospital: '中山醫院',
      hospitalDistance: 2000,
      emergencyContactNumbers: ['02-XXXX-XXXX', '119'],
      incidentResponseCapability: 'comprehensive',
      medicalNotes: '水上樂園設有完整醫療站，配備AED和急救設備。駐場護士提供基礎醫療。'
    },
    entertainmentSchedule: {
      hasPerformances: true,
      performanceTypes: ['water games', 'entertainment shows', 'music performance'],
      performanceSchedule: '夏季每日11:00、15:00，其他季節週末10:30、14:30',
      hasWeeklyShows: true,
      showDuration: '30-45分鐘',
      minAgeForShow: 2,
      maxAgeForShow: 15,
      performanceContent: '水上樂園提供互動式水上遊戲表演和音樂展演，全家都能參與',
      requiresAdvanceBooking: false,
      hasInteractiveActivities: true,
      performanceLanguage: ['普通話', '台語'],
      performanceLocation: '水上樂園主舞台',
      seasonalPerformances: '暑假期間每日表演，平日和假日週末場次',
      entertainmentNotes: '水上樂園提供季節性表演和互動式水上遊戲。夏季表演頻率較高，結合消暑活動。所有表演已包含在樂園入場券內。'
    },
    photoVideo: {
      allowsPhotography: true,
      allowsVideoRecording: true,
      photographyRestrictions: '水上樂園內可拍照和錄影',
      flashPhotographyAllowed: false,
      tripodAllowed: false,
      photoVideoNotes: '樂園內可拍照和錄影。禁止使用閃光燈以保護眼睛。禁止三腳架確保安全。'
    },
    visitDuration: {
      recommendedDurationMinutes: 300,
      recommendedDurationText: '5-6小時',
      quickVisitMinutes: 180,
      fullExperienceDurationMinutes: 360,
      mustSeeActivityDurationMinutes: 240,
      includesMealTimeRecommendation: true,
      mealTimeSuggestion: '1-1.5小時用於午餐',
      restTimeRecommendation: true,
      bestTimeToVisit: '開園初期（上午10-12點）人潮較少。避免中午12-14點和傍晚17點後人潮',
      durationNotes: '水上樂園適合安排5-6小時完整體驗。含午餐和休息時間。夏季遊玩人可能較長。'
    },
    schoolHolidays: {
      winterVacationDates: '1月下旬 - 2月初 (冬季關閉)',
      summerVacationDates: '7月初 - 8月底 (尖峰營運期)',
      midAutumnFestival: '9月中旬',
      lunarNewYearDates: '2月中旬 (冬季關閉)',
      dragonBoatFestivalDate: '6月中旬',
      doubleNinthFestivalDate: '10月初 (季末營運)',
      weeklyHolidaysInfo: '6月中-9月營運，11月-5月關閉',
      winterVacationCrowding: 'light',
      summerVacationCrowding: 'heavy',
      lunarNewYearCrowding: 'light',
      holidaySpecialEventsOrHours: '暑假期間延長營運時間，週末至晚間20:00',
      holidayBookingRecommendation: '暑假期間強烈建議提前線上購票，避免現場排隊。週末必提前購票',
      holidayNotes: '水上樂園為季節性設施，6月中至9月營運。暑假尖峰期排隊時間長。平日相對較少人。開園初期人最少。'
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
