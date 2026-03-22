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
    },
    heightBasedPricing: {
      hasHeightBasedPricing: false,
      pricingNotes: '公園免費開放，無身高或年齡限制'
    },
    drinkingWater: {
      hasDrinkingWater: true,
      drinkingWaterSources: ['water fountains', 'refill stations'],
      waterFountainQuantity: 12,
      waterQuality: 'excellent',
      isWaterChilled: false,
      hasRefillableBottleStations: true,
      waterTemperature: '常溫',
      waterAccessibilityNotes: '園區各處均有飲水機，涼亭附近特別集中。可自帶水瓶自助裝水。'
    },
    diaperChanging: {
      hasDiaperChangingTables: true,
      changingTableQuantity: 4,
      changingTableLocations: ['main restroom', 'family restroom'],
      hasDiaperDisposal: true,
      hasRunningWater: true,
      hasHandSanitizer: true,
      cleanlinessRating: 4.2,
      isParentSupervisionVisiblity: true,
      hasPrivacyScreen: true,
      changingFacilitiesNotes: '主廁所與家庭廁所各設2個尿布台，保持清潔，備有濕紙巾和尿布丟棄桶。'
    },
    equipmentRental: {
      hasEquipmentRental: true,
      bikeRental: true,
      scooterRental: false,
      helmetRental: true,
      sunProtectionGearRental: true,
      rainGearRental: false,
      wheelchairRental: false,
      rentalPriceRange: 'NT$100-300',
      rentalAvailabilityNotes: '自行車租賃在公園入口提供，供應充足',
      equipmentRentalNotes: '可租賃腳踏車和安全帽，夏季備有防曬帽出租'
    },
    membership: {
      hasMembership: false,
      annualPassAvailable: false,
      membershipNotes: '公園免費開放，無需年卡或會員卡'
    },
    onSiteDining: {
      hasFoodCourt: false,
      hasCafe: false,
      hasRestaurant: false,
      hasSnackBar: true,
      foodPriceRange: 'NT$30-80',
      diningOptionsDescription: '有小食亭販售飲料和簡餐',
      diningNotes: '公園內僅有小食亭，建議自帶便當和飲水'
    },
    queueWaitTime: {
      typicalWaitTimeMinutes: 0,
      peakHourWaitTimeMinutes: 0,
      offPeakWaitTimeMinutes: 0,
      seasonalWaitTimeNote: '公園免費開放，無排隊問題',
      estimatedWaitNotes: '無排隊，隨時可入場'
    },
    infantSpecific: {
      suitableForNewborns: true,
      hasDarkQuietSpaces: false,
      temperatureControlledNursingAreas: false,
      hasChangeTableAvailability: 5,
      minimalLoudNoiseAreas: true,
      infantCarriageSpaceAvailable: true,
      hasInfantSpecificRestRooms: false,
      recommendedVisitDurationForInfants: '2-3 小時',
      infantCaregiversAvailable: false,
      mommyFrienlyEnvironment: true,
      infantSpecificNotes: '大樹遮蔭很適合新生兒，早上9-11點人少很安靜。有多個廁所有尿布台'
    },
    storageLocker: {
      hasLockers: false,
      hasLargeStorage: false,
      storageNotes: '公園無置物櫃，建議自行攜帶或使用推車存放'
    },
    childAgeCompatibility: {
      hasActivitiesForMultipleAges: true,
      bestAgeCombination: '1-12 歲兒童一起遊玩非常適合',
      toddlerActivitiesAvailable: true,
      preschoolActivitiesAvailable: true,
      schoolAgeActivitiesAvailable: true,
      teenActivitiesAvailable: false,
      simultaneousActivityOptions: true,
      ageGroupSeparationNeeded: '無特殊年齡限制',
      siblingFriendlinessRating: 'excellent',
      recommendedGroupSizes: '2-4 個小孩加家長最佳，可同時進行多種活動',
      ageCompatibilityNotes: '大型遊戲場適合各年齡段，沙坑適合 2-5 歲，登山步道適合 6 歲以上。兄弟姐妹可在同一地點進行不同活動。'
    },
    visitCost: {
      entryFeePerAdult: '免費',
      entryFeePerChild: '免費',
      familyPackagePrice: '免費',
      estimatedFoodCostPerFamily: 'NT$0-200 自帶食物',
      parkingCostForDay: '免費',
      rentalsCostEstimate: 'NT$100-300 自行車租賃',
      extraActivitiesCostEstimate: '無額外費用',
      totalEstimatedCostPerFamily: 'NT$0-500 取決於是否租自行車',
      costSavingTips: '完全免費入園，自帶食物和飲料，可省錢。自行車租賃費用可略過。',
      budgetWarning: '無隱藏費用，全家可免費遊玩整天',
      visitCostNotes: '最經濟實惠的台北親子景點，完全免費開放，僅自行車租賃需付費。'
    },
    healthDocumentation: {
      requiresCOVIDVaccination: false,
      vaccineProofRequired: '不需要',
      requiresCovidTestOnArrival: false,
      requiresHealthCertificate: false,
      enforcementLevel: 'none',
      documentationNotes: '戶外開放式公園，無任何健康證明要求',
      healthRequirementNotes: '公園為戶外設施，無疫苗或健康文件要求。全家可放心遊玩。'
    },
    playgroundAndActivity: {
      hasPlayground: true,
      playgroundTypes: ['traditional playground', 'sandbox play area', 'nature trail'],
      playgroundEquipment: ['slides', 'swings', 'climbing structures', 'sandbox', 'spring riders', 'balance beams'],
      toddlerPlaygroundAvailable: true,
      preschoolPlayEquipment: ['swings', 'sandbox', 'climbing wall', 'spring riders'],
      schoolAgePlayEquipment: ['slides', 'climbing structures', 'rope bridges', 'balance beams'],
      teenActivityOptions: ['nature trails', 'climbing rocks', 'badminton courts'],
      activitiesByAgeGroup: '1-3歲：沙坑、搖搖馬、小滑梯；4-8歲：攀爬網、標準滑梯、秋千；9-12歲：挑戰型攀爬、繩橋、登山步道',
      seasonalActivityAvailability: '全年開放，夏季多水上活動機會，冬季適合登山',
      playgroundSafetyRating: 4.8,
      equipmentMaintenanceFrequency: '每日檢查，每週深層清潔，季度安全檢驗',
      equipmentAgeAndCondition: '設施於2024年全面更新，符合台灣安全標準，木製設施定期防腐處理',
      costForActivities: '全部免費',
      suggestedDurationPerActivityType: '沙坑：45分鐘、秋千：30分鐘、滑梯：20分鐘、登山：60-120分鐘',
      outdoorVsIndoorActivities: '95%戶外，5%涼亭和廁所室內',
      playgroundAndActivityNotes: '台北最大親子公園，遊樂設施齊全，適合各年齡層。沙坑特別受歡迎，建議上午9-11點或下午4點後到訪避免人潮。'
    },
    navigationFromTransit: {
      hasPublicTransitAccess: true,
      mrtDirections: {
        station: '科技大樓站 (Brown Line)',
        distance: 450,
        walkingTimeMinutes: 8,
        directions: 'MRT出站後右轉沿著新生南路二段直走，過十字路口即可看到公園南入口。沿著圍牆走約5分鐘可抵達主入口',
        exitNumber: '1號出口',
        elevatorAvailable: true
      },
      busDirections: {
        busLines: ['15', '32', '38', '72'],
        stopName: '新生南路公園站',
        walkingTimeMinutes: 2,
        directions: '下車後即為公園南邊，直接進入即可',
        frequency: '尖峰時段每5-10分鐘一班，離峰時段每10-15分鐘一班'
      },
      cyclingDirections: {
        bikeAccessible: true,
        bikeStorageAvailable: true,
        directions: '沿著自行車專用道可直達公園各入口，公園內無自行車禁區',
        estimatedCyclingTimeMinutes: 5
      },
      driversLicenseAccess: {
        drivingTimeFromCityCenter: 15,
        parkingEntrance: '新生南路二段或南京東路方向停車場入口',
        gpsCoordinates: { lat: 25.0312, lng: 121.5361 },
        accessRoadType: '台北市中心，鄰近新生南路幹道'
      },
      accessibleTransportOptions: {
        wheelchairAccessibleMRT: true,
        elevatorAtStation: true,
        accessibleBusAvailable: true
      },
      entranceLocation: {
        mainEntranceName: '新生南路一段主入口（南邊）',
        alternateEntrances: ['新生南路二段東入口', '南京東路北入口', '忠孝東路西側小徑'],
        closestEntranceFromTransit: '從MRT科技大樓站：新生南路南入口（最近，步行5分鐘）；從公車站：新生南路南站即為公園邊界',
        disabledAccessEntrance: '新生南路二段設有無障礙通道和停車場'
      },
      navigationNotes: '大安森林公園為台北市中心開放式公園，交通便利。MRT科技大樓站1號出口步行8分鐘可到，或搭公車至新生南路公園站（15、32、38、72號），下車即到。開車可停至周邊停車場或公園北側地下停車場。自行車友善，可直達各入口。進入公園後沿著標示牌可找到各遊樂區和停車位置。'
    },
    photographySpotsAndServices: {
      bestPhotoSpots: [
        {
          spotName: '音樂台噴水池',
          description: '公園最知名的噴水池，背景為綠樹和天空，適合家庭合照',
          bestTimeOfDay: '下午4-6點夕陽時刻，水彩效果最佳',
          ageAppropriate: '所有年齡，特別是3-10歲孩童',
          photoTip: '在噴水池邊角度可拍到多層次的噴泉效果'
        },
        {
          spotName: '觀日平台',
          description: '公園最高點，可俯瞰整個公園和遠處台北101的景致',
          bestTimeOfDay: '日出時刻（6-7點）或日落時刻（5-6點）',
          ageAppropriate: '適合所有年齡的全家福照片',
          photoTip: '帶著小朋友在平台背景拍攝，整個台北城市盡在眼底'
        },
        {
          spotName: '林蔭步道',
          description: '綠樹成蔭的步道，陽光透過樹葉灑落，營造溫暖氛圍',
          bestTimeOfDay: '上午10點-11點半，側光效果最佳',
          ageAppropriate: '所有年齡',
          photoTip: '利用樹葉與陽光的對比，拍出溫馨的親子互動照'
        }
      ],
      photoBooth: {
        available: false,
        locations: []
      },
      professionalPhotoServices: {
        available: false
      },
      scenicLocations: ['音樂台區域', '觀日平台', '林蔭步道', '中央草坪'],
      allowedEquipment: ['相機', '手機', '腳架（在非人流密集區使用）'],
      photoStorageSpots: {
        hasCloud: true,
        hasUSBServices: false
      },
      photographyNotes: '大安森林公園四季景色各異，春天櫻花、夏天綠蔭、秋天楓葉、冬天也有其特色。遊客眾多，建議早晨或傍晚拍照。尊重他人，不影響遊樂設施的正常使用。'
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
    },
    heightBasedPricing: {
      hasHeightBasedPricing: true,
      childHeightThreshold: 100,
      childPrice: 'NT$200',
      adultHeight: 140,
      freeHeightThreshold: 80,
      heightMeasurementLocation: '售票處',
      pricingNotes: '身高未滿80公分免費，80-100公分NT$200，100-140公分NT$350，超過140公分NT$400。家長可於售票處驗證身高。'
    },
    drinkingWater: {
      hasDrinkingWater: true,
      drinkingWaterSources: ['water fountains', 'refill stations'],
      waterFountainQuantity: 8,
      waterQuality: 'good',
      isWaterChilled: true,
      hasRefillableBottleStations: true,
      waterTemperature: '冷飲水 (約5-10°C)',
      waterAccessibilityNotes: '園區各區都有飲水機，提供冰冷飲水。可自帶水瓶裝水。遊樂設施附近特別設置飲水站。'
    },
    diaperChanging: {
      hasDiaperChangingTables: true,
      changingTableQuantity: 6,
      changingTableLocations: ['main restroom', 'family restroom', 'nursing room area'],
      hasDiaperDisposal: true,
      hasRunningWater: true,
      hasHandSanitizer: true,
      cleanlinessRating: 4.6,
      isParentSupervisionVisiblity: true,
      hasPrivacyScreen: true,
      changingFacilitiesNotes: '樂園各主要區域設置尿布台，共6個。備有一次性尿布、濕紙巾和尿布丟棄桶。維持衛生高標準。'
    },
    equipmentRental: {
      hasEquipmentRental: true,
      bikeRental: false,
      scooterRental: false,
      helmetRental: false,
      sunProtectionGearRental: true,
      rainGearRental: true,
      wheelchairRental: true,
      rentalPriceRange: 'NT$50-200',
      rentalAvailabilityNotes: '防曬帽、雨傘和輪椅在入口和遊樂區各點租賃',
      equipmentRentalNotes: '樂園提供防曬帽(NT$100)、雨傘(NT$80)、輪椅(NT$150)等租賃服務，夏季炎熱建議租賃防曬帽'
    },
    membership: {
      hasMembership: true,
      annualPassAvailable: true,
      seasonalPassAvailable: true,
      discountCardAvailable: true,
      membershipCost: 'NT$3,000/年',
      seasonalPassCost: 'NT$1,800/季',
      membershipBenefits: ['無限次入園', '20%購物優惠', '優先預約表演票'],
      visitsIncludedInPass: '無限制入園',
      groupMembershipAvailable: true,
      paymentMethods: ['cash', 'credit card', 'LINE Pay'],
      membershipNotes: '年卡超值，平均每月造訪2次即可回本。季卡適合短期訪客。'
    },
    onSiteDining: {
      hasFoodCourt: true,
      hasCafe: true,
      hasRestaurant: true,
      hasSnackBar: true,
      foodQualityRating: 4.1,
      foodPriceRange: 'NT$150-500',
      vegetarianOptionsAvailable: true,
      halalFoodAvailable: false,
      hasHighchair: true,
      hasWarmingFacilities: true,
      diningOptionsDescription: '美食廣場提供亞洲和西方食物選項，有素食便當和兒童套餐',
      diningSeatingDescription: '室內餐飲區可容納200人，提供高椅供嬰幼兒使用',
      diningHours: '09:00 - 20:00',
      diningNotes: '美食廣場價格中等，停留時間長建議於園內購餐。有溫奶器供訪客使用。'
    },
    queueWaitTime: {
      typicalWaitTimeMinutes: 15,
      peakHourWaitTimeMinutes: 45,
      offPeakWaitTimeMinutes: 5,
      seasonalWaitTimeNote: '寒假暑假尖峰時段排隊1-2小時，平日上午10-11點較空',
      holidayWaitTimeMinutes: 120,
      fastPassAvailable: true,
      fastPassPrice: 'NT$600-800',
      estimatedWaitNotes: '平日10-15分鐘，週末45分鐘，假期1-2小時。快速通關票可加快入場',
      peakDaysOfWeek: '週末和假期下午人最多',
      quietTimesRecommendation: '平日上午10-11點最空，下午3-4點人稍少'
    },
    infantSpecific: {
      suitableForNewborns: false,
      hasDarkQuietSpaces: true,
      temperatureControlledNursingAreas: true,
      hasChangeTableAvailability: 8,
      minimalLoudNoiseAreas: true,
      infantCarriageSpaceAvailable: true,
      hasInfantSpecificRestRooms: true,
      recommendedVisitDurationForInfants: '1-2 小時',
      infantCaregiversAvailable: true,
      mommyFrienlyEnvironment: true,
      infantSpecificNotes: '有專門的哺乳室和安靜休息區很適合小寶寶，但建議避免尖峰時段以減少刺激'
    },
    storageLocker: {
      hasLockers: true,
      lockerQuantity: 100,
      lockerSize: 'small, medium, large',
      lockerCost: 'NT$20-50',
      coinOrCardRequired: true,
      hasLargeStorage: true,
      storageAttendantAvailable: true,
      storageSecurity: 'excellent',
      storageNotes: '園區各處有投幣置物櫃（NT$20-50），大型行李可至服務台寄放，有專人看管'
    },
    childAgeCompatibility: {
      hasActivitiesForMultipleAges: true,
      bestAgeCombination: '2-15 歲兒童可同遊，各年齡層都有適合的設施',
      toddlerActivitiesAvailable: true,
      preschoolActivitiesAvailable: true,
      schoolAgeActivitiesAvailable: true,
      teenActivitiesAvailable: true,
      simultaneousActivityOptions: true,
      ageGroupSeparationNeeded: '某些刺激設施可能需要年長兒童單獨遊玩',
      siblingFriendlinessRating: 'excellent',
      recommendedGroupSizes: '2-6 個兒童加家長，可分組遊玩或一起遊歷',
      ageCompatibilityNotes: '樂園設施分年齡設計，幼稚園、小學、國中生都有專屬區域。兄弟姐妹可在樂園尋找各自喜愛的遊樂設施。'
    },
    visitCost: {
      entryFeePerAdult: 'NT$400-500',
      entryFeePerChild: 'NT$200-350',
      entryFeePerToddler: '免費 (身高 80cm 以下)',
      familyPackagePrice: 'NT$1,200-1,500',
      familyPackageIncludes: '2 成人 + 2 兒童一日票',
      estimatedFoodCostPerFamily: 'NT$400-800 園內餐飲',
      parkingCostForDay: 'NT$100',
      rentalsCostEstimate: 'NT$100-200 防曬帽或雨傘',
      extraActivitiesCostEstimate: 'NT$200-1,000 額外遊樂設施、演出票',
      totalEstimatedCostPerFamily: 'NT$2,500-4,500 含午餐和小額外費',
      discountedPackages: ['年卡 NT$3,000/無限入園', '季卡 NT$1,800/3月', '10 次票 NT$3,000'],
      paymentFlexibility: '可單人購票或購買家庭套票，在線購票有優惠',
      costSavingTips: '平日票價較低，提前線上購買可省 10-20%。年卡適合頻繁訪客。',
      budgetWarning: '園內飲食和租賃費用較高，建議預算足夠應對兒童臨時需求',
      visitCostNotes: '票價適中，但園內消費較高。建議自帶零食和飲水省錢。'
    },
    healthDocumentation: {
      requiresCOVIDVaccination: false,
      vaccineProofRequired: '不需要',
      requiresCovidTestOnArrival: false,
      requiresHealthCertificate: false,
      enforcementLevel: 'none',
      documentationNotes: '樂園遵守台灣防疫指引，但不強制要求疫苗證明',
      healthRequirementNotes: '目前無特定疫苗或健康文件要求。建議在患病期間避免訪園。'
    },
    playgroundAndActivity: {
      hasPlayground: true,
      playgroundTypes: ['amusement park', 'water play area', 'arcade games', 'interactive exhibits'],
      playgroundEquipment: ['roller coaster', 'log flume', 'carousel', 'spinning rides', 'arcade games', 'water splash zone'],
      toddlerPlaygroundAvailable: true,
      preschoolPlayEquipment: ['carousel', 'water spray area', 'soft play rides', 'mini roller coaster'],
      schoolAgePlayEquipment: ['water rides', 'spinning rides', 'roller coaster', 'arcade games', 'challenge courses'],
      teenActivityOptions: ['extreme rides', 'shooting games', 'VR experiences', 'arcade competitions'],
      activitiesByAgeGroup: '2-4歲：旋轉木馬、水上樂園、軟墊遊樂設施；5-8歲：摩天輪、小型雲霄飛車、水上遊樂設施；9-12歲：大型遊樂設施、遊戲機、挑戰課程；13+：極限遊樂設施、VR體驗',
      seasonalActivityAvailability: '全年開放，冬季水上設施部分關閉，夏季水上樂園全開放',
      playgroundSafetyRating: 4.9,
      equipmentMaintenanceFrequency: '每日營業前檢查，每週深層維護，每月第三周進行重點檢修',
      equipmentAgeAndCondition: '設施於2023年起逐年更新，全符合國際安全標準ISO17842，定期檢驗證書公開於入口處',
      costForActivities: '遊樂設施包含在入園票內，遊戲機額外付費（NT$20-50/次），水上樂園全包',
      suggestedDurationPerActivityType: '旋轉木馬：5分鐘、大遊樂設施：3-5分鐘排隊加遊玩、水上區：60分鐘、遊戲機區：30-45分鐘',
      outdoorVsIndoorActivities: '60%戶外（遊樂設施、水上區），40%室內（遊戲機館、表演廳、餐飲區）',
      playgroundAndActivityNotes: '兒童樂園有30+項遊樂設施，適合各年齡層。高峰時段（周末下午2-6pm）排隊時間可達30-60分鐘。建議平日上午或親子時段造訪以避免人潮。水上遊樂設施夏季非常受歡迎。'
    },
    navigationFromTransit: {
      hasPublicTransitAccess: true,
      mrtDirections: {
        station: '士林站 (Red Line)',
        distance: 1200,
        walkingTimeMinutes: 15,
        directions: 'MRT士林站2號出口，沿著承德路五段直走，約15分鐘可到樂園。經過馬術場後樂園即在右手邊',
        exitNumber: '2號出口',
        elevatorAvailable: true
      },
      busDirections: {
        busLines: ['11', '26', '27', '32', '55'],
        stopName: '兒童新樂園站',
        walkingTimeMinutes: 5,
        directions: '下車後沿著巴士站標示直走，可看到樂園大門',
        frequency: '尖峰時段每3-8分鐘一班，離峰時段每10-15分鐘一班'
      },
      cyclingDirections: {
        bikeAccessible: true,
        bikeStorageAvailable: true,
        directions: '沿著承德路自行車道可直達樂園停車場',
        estimatedCyclingTimeMinutes: 8
      },
      driversLicenseAccess: {
        drivingTimeFromCityCenter: 20,
        parkingEntrance: '承德路五段兒童新樂園地下停車場',
        gpsCoordinates: { lat: 25.0970, lng: 121.5147 },
        accessRoadType: '士林區主要幹道，鄰近外雙溪'
      },
      accessibleTransportOptions: {
        wheelchairAccessibleMRT: true,
        elevatorAtStation: true,
        accessibleBusAvailable: true
      },
      entranceLocation: {
        mainEntranceName: '承德路五段主入口',
        alternateEntrances: ['親子停車場入口', '遠足停車場入口'],
        closestEntranceFromTransit: '從MRT士林站：承德路五段主入口（步行15分鐘）；從巴士站：兒童新樂園站（最近，下車即到）',
        disabledAccessEntrance: '地下停車場內有無障礙電梯和專用通道'
      },
      navigationNotes: '兒童新樂園位於台北市士林區，交通便利。MRT士林站紅線2號出口步行15分鐘，或搭巴士11、26、27、32、55號至兒童新樂園站（最方便，下車即到）。開車前往設有地下停車場（200元/時，樂園購票憑證可折抵停車費）。停車場內設有無障礙電梯和專用通道。'
    },
    photographySpotsAndServices: {
      bestPhotoSpots: [
        {
          spotName: '樂園入口標誌',
          description: '樂園大門前的彩色標誌牆，是最受歡迎的打卡景點',
          bestTimeOfDay: '上午10-11點，光線最柔和，背景清晰',
          ageAppropriate: '所有年齡',
          photoTip: '可以拍小朋友站在標誌前開心微笑的全身照'
        },
        {
          spotName: '旋轉木馬',
          description: '經典的旋轉木馬設施，色彩繽紛，適合拍攝兒童歡樂的瞬間',
          bestTimeOfDay: '下午1-3點，避免逆光',
          ageAppropriate: '2-10歲兒童',
          photoTip: '在旋轉木馬運行時拍攝，可以捕捉孩童臉上的歡樂笑容'
        },
        {
          spotName: '水上遊樂區',
          description: '夏季水上樂園，孩童嬉水的開心時刻',
          bestTimeOfDay: '下午2-4點，逆光會有水花閃爍效果',
          ageAppropriate: '3-12歲',
          photoTip: '防水手機或相機，拍攝孩子在水中玩樂的自然表情'
        }
      ],
      photoBooth: {
        available: true,
        locations: ['遊樂園內商店區', '出口禮品店'],
        price: '150-300 NTD/4張照片',
        instantPrints: true,
        digitalCopies: true
      },
      professionalPhotoServices: {
        available: true,
        types: ['家庭合照', '兒童寫真', '生日派對攝影'],
        booking: '需提前預約，請在入園時至客服中心詢問',
        pricing: '家庭合照 1,500-2,000 NTD，5-10張精修照片',
        turnaroundTime: '3-5個工作天'
      },
      scenicLocations: ['樂園入口', '旋轉木馬', '水上遊樂區', '摩天輪'],
      allowedEquipment: ['相機', '手機', '腳架（限於指定區域）'],
      photoStorageSpots: {
        hasCloud: true,
        hasUSBServices: false
      },
      photographyNotes: '樂園內各設施都是很好的拍照背景。建議穿著色彩鮮豔的衣服以與背景形成對比。高峰期人潮眾多，早晨或黃昏人較少，更適合拍照。園區禁止使用自拍棒和無人機。'
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
    },
    heightBasedPricing: {
      hasHeightBasedPricing: false,
      pricingNotes: '成人NT$50-100，學生和兒童優惠票。無身高限制。'
    },
    drinkingWater: {
      hasDrinkingWater: true,
      drinkingWaterSources: ['water fountains'],
      waterFountainQuantity: 4,
      waterQuality: 'good',
      isWaterChilled: false,
      hasRefillableBottleStations: true,
      waterTemperature: '常溫',
      waterAccessibilityNotes: '博物館大廳和每層樓都有飲水機。一樓服務台附近有冷水飲用器。'
    },
    diaperChanging: {
      hasDiaperChangingTables: true,
      changingTableQuantity: 3,
      changingTableLocations: ['family restroom'],
      hasDiaperDisposal: true,
      hasRunningWater: true,
      hasHandSanitizer: true,
      cleanlinessRating: 4.3,
      isParentSupervisionVisiblity: true,
      hasPrivacyScreen: true,
      changingFacilitiesNotes: '博物館設有親子廁所，備有尿布台、濕紙巾和尿布垃圾桶。定期清潔維護。'
    },
    equipmentRental: {
      hasEquipmentRental: false,
      equipmentRentalNotes: '博物館無提供設備租賃服務'
    },
    membership: {
      hasMembership: true,
      annualPassAvailable: true,
      discountCardAvailable: false,
      membershipCost: 'NT$500/年',
      membershipBenefits: ['無限參觀', '特展優先入場', '國家博物館聯誼會折扣'],
      visitsIncludedInPass: '無限制入館',
      paymentMethods: ['cash', 'credit card'],
      membershipNotes: '國立博物館年卡划算，參訪2次即可回本'
    },
    onSiteDining: {
      hasFoodCourt: false,
      hasCafe: true,
      hasRestaurant: false,
      hasSnackBar: false,
      foodQualityRating: 3.8,
      foodPriceRange: 'NT$100-250',
      vegetarianOptionsAvailable: true,
      diningOptionsDescription: '咖啡廳提供飲料、咖啡和輕食',
      diningSeatingDescription: '咖啡廳座位約30個，適合簡單用餐或歇息',
      diningHours: '09:00 - 17:00 (時間與博物館開放時間一致)',
      diningNotes: '咖啡廳飲食選擇有限，不建議作為主要用餐地點。建議自帶便食或到附近用餐。'
    },
    queueWaitTime: {
      typicalWaitTimeMinutes: 10,
      peakHourWaitTimeMinutes: 30,
      offPeakWaitTimeMinutes: 3,
      seasonalWaitTimeNote: '假期人較多，平日上午人少',
      estimatedWaitNotes: '通常排隊10分鐘，假期週末30分鐘，平日上午3-5分鐘'
    },
    infantSpecific: {
      suitableForNewborns: false,
      hasDarkQuietSpaces: true,
      temperatureControlledNursingAreas: true,
      hasChangeTableAvailability: 4,
      minimalLoudNoiseAreas: true,
      infantCarriageSpaceAvailable: true,
      hasInfantSpecificRestRooms: false,
      recommendedVisitDurationForInfants: '1-1.5 小時',
      infantCaregiversAvailable: false,
      mommyFrienlyEnvironment: true,
      infantSpecificNotes: '室內環境溫度恆定很適合小寶寶，但展示品較多，寶寶推車容易碰到展品，建議早上參訪人較少'
    },
    storageLocker: {
      hasLockers: false,
      hasLargeStorage: true,
      storageAttendantAvailable: true,
      storageSecurity: 'excellent',
      storageNotes: '大型行李和推車可於入口寄放，有專人管理，免費'
    },
    childAgeCompatibility: {
      hasActivitiesForMultipleAges: true,
      bestAgeCombination: '3-14 歲兒童都能學到新知識',
      toddlerActivitiesAvailable: false,
      preschoolActivitiesAvailable: true,
      schoolAgeActivitiesAvailable: true,
      teenActivitiesAvailable: true,
      simultaneousActivityOptions: false,
      ageGroupSeparationNeeded: '不同展區難度不同，較小兒童需協助理解',
      siblingFriendlinessRating: 'good',
      recommendedGroupSizes: '2-4 個兒童加家長，過多兒童易失控',
      ageCompatibilityNotes: '博物館展示適合 3 歲以上，但年紀差距大的兒童可能對同一展區的興趣不同。建議家長分開照顧或輪流講解。'
    },
    visitCost: {
      entryFeePerAdult: 'NT$100',
      entryFeePerChild: 'NT$50',
      entryFeePerToddler: '免費 (3 歲以下)',
      familyPackagePrice: 'NT$300',
      familyPackageIncludes: '2 成人 + 2 兒童票',
      estimatedFoodCostPerFamily: 'NT$200-400 咖啡廳',
      parkingCostForDay: 'NT$80/小時',
      rentalsCostEstimate: '無租賃服務',
      extraActivitiesCostEstimate: 'NT$0 展覽已含入場費',
      totalEstimatedCostPerFamily: 'NT$500-1,200 含停車和咖啡',
      costSavingTips: '購買家庭票可省 50 元。停車時間短建議在附近停車。',
      budgetWarning: '停車費用較高，考慮搭乘 MRT。咖啡廳價格中等。',
      visitCostNotes: '票價低廉，家庭票更划算。停車費是主要開支。'
    },
    healthDocumentation: {
      requiresCOVIDVaccination: false,
      vaccineProofRequired: '不需要',
      requiresCovidTestOnArrival: false,
      requiresHealthCertificate: false,
      enforcementLevel: 'none',
      documentationNotes: '室內文化場所，遵守基本防疫措施但無強制疫苗要求',
      healthRequirementNotes: '無特定疫苗或健康文件要求。提供手部消毒設施。'
    },
    playgroundAndActivity: {
      hasPlayground: false,
      playgroundTypes: ['indoor exhibits', 'interactive learning stations'],
      playgroundEquipment: ['interactive display screens', 'hands-on fossil models', 'virtual reality stations', 'touch screens', 'microscopes'],
      toddlerPlaygroundAvailable: false,
      preschoolPlayEquipment: ['large illustrated panels', 'touch-sensitive exhibits'],
      schoolAgePlayEquipment: ['fossil exploration station', 'geology interactive display', 'VR paleontology experience', 'microscope station'],
      teenActivityOptions: ['advanced paleontology exhibits', 'geological research station', 'cultural heritage digital archives'],
      activitiesByAgeGroup: '3-5歲：彩色插圖展板、大型模型觀賞；6-8歲：化石互動展示、觸控螢幕學習、望遠鏡體驗；9-12歲：地質學習區、VR古生物體驗、實驗室模擬；13+：進階古生物研究、文物保護教育',
      seasonalActivityAvailability: '全年開放，特定月份有特展',
      playgroundSafetyRating: 4.7,
      equipmentMaintenanceFrequency: '每日清潔消毒，互動設備每周檢修',
      equipmentAgeAndCondition: '設備於2024年全面升級為最新互動式展示，遵守文物保護標準',
      costForActivities: '全部包含在入場票內，無額外付費',
      suggestedDurationPerActivityType: '化石區：30-40分鐘、VR體驗：15-20分鐘（需排隊）、地質展區：20-30分鐘',
      outdoorVsIndoorActivities: '100%室內，完全空調控制',
      playgroundAndActivityNotes: '博物館為教育性室內景點，無傳統遊樂場。適合對古生物和地質有興趣的兒童。互動展示很受歡迎，高峰時段（假日下午）互動設備需排隊20-30分鐘。2-3歲幼兒可能難以享受，建議3歲以上兒童。'
    },
    navigationFromTransit: {
      hasPublicTransitAccess: true,
      mrtDirections: {
        station: '台大醫院站 (Blue/Red Line)',
        distance: 600,
        walkingTimeMinutes: 8,
        directions: 'MRT台大醫院站南港線/紅線轉乘點，1號出口沿著中山南路直走，過二二八和平公園，中山南路2號館入口',
        exitNumber: '1號出口',
        elevatorAvailable: true
      },
      busDirections: {
        busLines: ['1', '2', '3', '5', '15', '22', '25'],
        stopName: '國立臺灣博物館站',
        walkingTimeMinutes: 2,
        directions: '多條公車直達博物館門口，下車即到',
        frequency: '尖峰時段每3-5分鐘一班，離峰時段每8-12分鐘一班'
      },
      cyclingDirections: {
        bikeAccessible: true,
        bikeStorageAvailable: true,
        directions: '沿著中山南路自行車道可直達博物館，博物館外有停自行車處',
        estimatedCyclingTimeMinutes: 10
      },
      driversLicenseAccess: {
        drivingTimeFromCityCenter: 10,
        parkingEntrance: '二二八和平公園地下停車場或中山南路路邊停車格',
        gpsCoordinates: { lat: 25.0311, lng: 121.5142 },
        accessRoadType: '台北市中正區中山南路，鄰近總統府和公園'
      },
      accessibleTransportOptions: {
        wheelchairAccessibleMRT: true,
        elevatorAtStation: true,
        accessibleBusAvailable: true
      },
      entranceLocation: {
        mainEntranceName: '中山南路2號館主入口',
        alternateEntrances: ['100號館側邊入口'],
        closestEntranceFromTransit: '從MRT台大醫院站：中山南路2號館主入口（步行8分鐘）；從公車站：直達館前（最近，下車即到）',
        disabledAccessEntrance: '中山南路主入口設有無障礙坡道和停車位'
      },
      navigationNotes: '國立臺灣博物館位於台北市中正區，交通便利。MRT台大醫院站1號出口步行8分鐘，或搭多條公車（1、2、3、5、15、22、25等）直達博物館門口（最方便）。開車可停至二二八和平公園地下停車場或中山南路路邊停車格。館內位於中山南路，鄰近總統府和和平公園，景點眾多。'
    },
    photographySpotsAndServices: {
      bestPhotoSpots: [
        {
          spotName: '博物館建築外觀',
          description: '日治時期的白色新古典建築，莊重典雅，是台北重要地標',
          bestTimeOfDay: '上午9-10點，側光打在建築上很漂亮',
          ageAppropriate: '全年齡',
          photoTip: '可在博物館前廣場拍攝全景，或在樓梯上拍攝仰角'
        },
        {
          spotName: '館內自然標本展示區',
          description: '恐龍骨骼和台灣動物標本，小朋友最喜歡的拍照區域',
          bestTimeOfDay: '上午10-11點，自然採光最佳',
          ageAppropriate: '3-12歲兒童',
          photoTip: '拍攝孩子在展示品前驚訝的表情'
        },
        {
          spotName: '二二八和平公園',
          description: '博物館鄰近的綠色公園，有水池和古樹',
          bestTimeOfDay: '下午3-4點，樹蔭光線柔和',
          ageAppropriate: '全年齡',
          photoTip: '在公園水池邊拍攝，倒影效果很美'
        }
      ],
      photoBooth: {
        available: false
      },
      professionalPhotoServices: {
        available: false
      },
      scenicLocations: ['博物館前廣場', '建築外觀', '自然標本展示區', '二二八公園'],
      allowedEquipment: ['相機', '手機', '腳架（需詢問館方）'],
      photoStorageSpots: {
        hasCloud: true,
        hasUSBServices: false
      },
      photographyNotes: '博物館內部光線較暗，建議使用高感光度相機或手機夜拍功能。展示區內許多玻璃櫃可能反光，需調整角度。館內禁止使用閃光燈以保護文物。鄰近的二二八公園也是很好的戶外拍照地點。'
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
    },
    heightBasedPricing: {
      hasHeightBasedPricing: false,
      pricingNotes: '成人NT$200-400，兒童NT$150-300。2歲以下免費。無身高限制。'
    },
    drinkingWater: {
      hasDrinkingWater: true,
      drinkingWaterSources: ['water fountains', 'refill stations'],
      waterFountainQuantity: 3,
      waterQuality: 'good',
      isWaterChilled: true,
      hasRefillableBottleStations: true,
      waterTemperature: '冷飲水',
      waterAccessibilityNotes: '餐廳入口、用餐區和遊戲室均有飲水機。提供冰冷飲用水和溫水。可自帶水瓶。'
    },
    diaperChanging: {
      hasDiaperChangingTables: true,
      changingTableQuantity: 4,
      changingTableLocations: ['restroom', 'family restroom', 'nursing room'],
      hasDiaperDisposal: true,
      hasRunningWater: true,
      hasHandSanitizer: true,
      cleanlinessRating: 4.7,
      isParentSupervisionVisiblity: true,
      hasPrivacyScreen: true,
      changingFacilitiesNotes: '餐廳多個廁所和親子廁所設有尿布台。全新設施，清潔度極高。備有免費尿布、濕紙巾和垃圾桶。'
    },
    equipmentRental: {
      hasEquipmentRental: false,
      equipmentRentalNotes: '親子餐廳無提供設備租賃'
    },
    membership: {
      hasMembership: true,
      annualPassAvailable: false,
      discountCardAvailable: true,
      discountCardCost: '免費，集點卡',
      membershipBenefits: ['消費集點', '集滿10點享用餐折扣50元'],
      visitsIncludedInPass: '消費集點折抵',
      paymentMethods: ['cash', 'credit card', 'LINE Pay'],
      membershipNotes: '集點卡免費申請，常客可累積點數享受折扣'
    },
    onSiteDining: {
      hasFoodCourt: false,
      hasCafe: false,
      hasRestaurant: true,
      hasSnackBar: false,
      foodQualityRating: 4.5,
      foodPriceRange: 'NT$200-500',
      vegetarianOptionsAvailable: true,
      veganOptionsAvailable: false,
      glutenFreeOptionsAvailable: true,
      hasHighchair: true,
      hasWarmingFacilities: true,
      diningOptionsDescription: '專業兒童菜單、素食餐點、無麩質餐點選項豐富',
      diningSeatingDescription: '寬敞用餐區可容納100人，高椅多張，適合家庭用餐',
      diningHours: '11:00 - 22:00',
      diningNotes: '餐點品質優良，特別適合家庭用餐。提供溫奶器和食物溫加服務。'
    },
    queueWaitTime: {
      typicalWaitTimeMinutes: 20,
      peakHourWaitTimeMinutes: 60,
      offPeakWaitTimeMinutes: 5,
      seasonalWaitTimeNote: '周末午餐和晚餐時段排隊1小時，平日下午2-4點較空',
      estimatedWaitNotes: '平日午餐20分鐘，週末60分鐘，平日下午2-4點最快5分鐘',
      peakDaysOfWeek: '週末12-1點和6-7點人最多',
      quietTimesRecommendation: '平日下午2-4點，週末上午10-11點'
    },
    infantSpecific: {
      suitableForNewborns: false,
      hasDarkQuietSpaces: false,
      temperatureControlledNursingAreas: true,
      hasChangeTableAvailability: 3,
      minimalLoudNoiseAreas: false,
      infantCarriageSpaceAvailable: true,
      hasInfantSpecificRestRooms: true,
      recommendedVisitDurationForInfants: '1-1.5 小時',
      infantCaregiversAvailable: true,
      mommyFrienlyEnvironment: true,
      infantSpecificNotes: '有哺乳室和高椅，室內隔音還可以，適合帶小寶寶用餐'
    },
    storageLocker: {
      hasLockers: false,
      hasLargeStorage: false,
      storageNotes: '餐廳內無置物櫃，推車可靠牆放置'
    },
    childAgeCompatibility: {
      hasActivitiesForMultipleAges: true,
      bestAgeCombination: '1-6 歲幼兒最佳，較大兒童可能不夠滿足',
      toddlerActivitiesAvailable: true,
      preschoolActivitiesAvailable: true,
      schoolAgeActivitiesAvailable: false,
      teenActivitiesAvailable: false,
      simultaneousActivityOptions: false,
      ageGroupSeparationNeeded: '設施針對幼兒設計，大兒童可能不感興趣',
      siblingFriendlinessRating: 'fair',
      recommendedGroupSizes: '1-2 個幼兒加家長或照顧者',
      ageCompatibilityNotes: '主要針對幼兒 1-6 歲設計。年長的哥哥姐姐可能覺得無聊。建議純幼兒家庭或有多名幼兒的家庭。'
    },
    visitCost: {
      entryFeePerAdult: 'NT$150-200',
      entryFeePerChild: 'NT$100-150',
      entryFeePerToddler: '免費 (1 歲以下)',
      familyPackagePrice: 'NT$400-500',
      familyPackageIncludes: '2 成人 + 2 兒童',
      estimatedFoodCostPerFamily: 'NT$200-300 簡單餐點',
      parkingCostForDay: '免費停車',
      rentalsCostEstimate: '無租賃服務',
      extraActivitiesCostEstimate: 'NT$100-200 額外課程或活動',
      totalEstimatedCostPerFamily: 'NT$700-1,200 含停車',
      costSavingTips: '平日折扣優惠。自帶便當可省飲食費。',
      budgetWarning: '提供簡餐但非餐廳，費用經濟實惠',
      visitCostNotes: '票價合理，停車免費是優點。小型親子中心，消費親民。'
    },
    healthDocumentation: {
      requiresCOVIDVaccination: false,
      vaccineProofRequired: '不需要',
      requiresCovidTestOnArrival: false,
      requiresHealthCertificate: false,
      enforcementLevel: 'none',
      documentationNotes: '室內親子設施維持基本防疫，無強制疫苗要求',
      healthRequirementNotes: '無特定疫苗或健康文件要求。提供手部消毒設施和玩具清潔。'
    },
    playgroundAndActivity: {
      hasPlayground: true,
      playgroundTypes: ['indoor soft play', 'activity play zone', 'sensory play area'],
      playgroundEquipment: ['soft climbing structures', 'ball pit', 'slides', 'tunnels', 'sensory toys', 'play kitchen', 'blocks'],
      toddlerPlaygroundAvailable: true,
      preschoolPlayEquipment: ['soft slides', 'ball pit', 'climbing blocks', 'sensory play', 'play kitchen', 'ride-on toys'],
      schoolAgePlayEquipment: ['challenging climbing', 'obstacle course', 'interactive games', 'age-appropriate puzzles'],
      teenActivityOptions: ['limited - designed for younger children'],
      activitiesByAgeGroup: '1-2歲：軟墊安全區、感官玩具、學步訓練；3-5歲：軟墊攀爬、球池、幻想遊戲區、廚房扮家家；6-8歲：挑戰性攀爬、解謎遊戲、運動活動',
      seasonalActivityAvailability: '全年開放，室內恆溫冷氣',
      playgroundSafetyRating: 4.9,
      equipmentMaintenanceFrequency: '營業前日常檢查，每週深層清潔消毒，月度安全檢驗',
      equipmentAgeAndCondition: '設施全新（2024年開業），符合國際安全標準，所有材料無毒環保',
      costForActivities: '全部包含入場費，無額外付費',
      suggestedDurationPerActivityType: '軟墊區：20-30分鐘、球池：15-20分鐘、扮家家：20-30分鐘、整體遊玩：1.5-2小時',
      outdoorVsIndoorActivities: '100%室內，完全空調',
      playgroundAndActivityNotes: '專為1-6歲設計的安全室內遊樂設施。冬季和雨天的完美選擇，空調舒適。設施清潔衛生，玩具定期消毒。特別適合幼齡兒童和新生兒。高峰時段（周末下午）人滿為患，建議平日或上午到訪。'
    },
    navigationFromTransit: {
      hasPublicTransitAccess: true,
      mrtDirections: {
        station: '信義安和站 (Blue Line)',
        distance: 400,
        walkingTimeMinutes: 6,
        directions: 'MRT信義安和站4號出口，沿著信義路直走，見信義路五段時右轉，餐廳在轉角處',
        exitNumber: '4號出口',
        elevatorAvailable: true
      },
      busDirections: {
        busLines: ['20', '33', '37', '38', '39'],
        stopName: '信義路五段站',
        walkingTimeMinutes: 3,
        directions: '下車後在對面可看到餐廳，過馬路即到',
        frequency: '尖峰時段每5-8分鐘一班，離峰時段每10-15分鐘一班'
      },
      cyclingDirections: {
        bikeAccessible: true,
        bikeStorageAvailable: true,
        directions: '沿著信義路自行車道可直達，餐廳外有停放自行車位置',
        estimatedCyclingTimeMinutes: 5
      },
      driversLicenseAccess: {
        drivingTimeFromCityCenter: 15,
        parkingEntrance: '信義路五段地下停車場或周邊停車格',
        gpsCoordinates: { lat: 25.0330, lng: 121.5654 },
        accessRoadType: '台北市信義區主要幹道'
      },
      accessibleTransportOptions: {
        wheelchairAccessibleMRT: true,
        elevatorAtStation: true,
        accessibleBusAvailable: true
      },
      entranceLocation: {
        mainEntranceName: '信義路五段餐廳主入口',
        alternateEntrances: ['側邊停車場入口'],
        closestEntranceFromTransit: '從MRT信義安和站：信義路主入口（步行6分鐘）；從公車站：信義路五段站（最近，對面即到）',
        disabledAccessEntrance: '主入口設有無障礙坡道'
      },
      navigationNotes: '親子餐廳位於台北市信義區信義路五段，交通便利。MRT信義安和站藍線4號出口步行6分鐘，或搭公車20、33、37、38、39號至信義路五段站（最方便，下車對面即到）。設有停車場，自行車停放位方便。餐廳內為室內遊樂設施，全年空調舒適。'
    },
    photographySpotsAndServices: {
      bestPhotoSpots: [
        {
          spotName: '餐廳的彩色主題區',
          description: '親子餐廳內彩色裝潢的用餐區，色彩繽紛適合拍照',
          bestTimeOfDay: '中午11-12點和傍晚5-6點，自然採光最佳',
          ageAppropriate: '所有年齡',
          photoTip: '小朋友在彩色背景前很上鏡，拍攝用餐時的自然互動'
        },
        {
          spotName: '室內遊樂區',
          description: '兒童遊樂設施和軟墊區，孩子開心玩耍的時刻',
          bestTimeOfDay: '全天可拍，但上午人較少，光線較好',
          ageAppropriate: '1-8歲幼兒',
          photoTip: '拍攝孩子專注遊玩的表情，充滿生活感'
        }
      ],
      photoBooth: {
        available: false
      },
      professionalPhotoServices: {
        available: true,
        types: ['家庭聚餐拍照', '慶生活動拍攝'],
        booking: '可於預訂時告知，額外收費',
        pricing: '通常與慶生套餐一起計算，或單點 800-1200 NTD',
        turnaroundTime: '拍攝當天可領取電子檔'
      },
      scenicLocations: ['主餐飲區', '室內遊樂區', '門口裝飾'],
      allowedEquipment: ['相機', '手機'],
      photoStorageSpots: {
        hasCloud: true,
        hasUSBServices: false
      },
      photographyNotes: '親子餐廳內部環境整潔舒適，光線充足。拍照時請注意不影響其他用餐顧客。餐廳經常有人潮，建議在非用餐尖峰時段拍照。室內遊樂設施是很好的兒童活動背景。'
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
    },
    heightBasedPricing: {
      hasHeightBasedPricing: false,
      pricingNotes: '單次入場NT$100-150，課程包費用另計。無身高限制。'
    },
    drinkingWater: {
      hasDrinkingWater: true,
      drinkingWaterSources: ['water fountains', 'refill stations'],
      waterFountainQuantity: 6,
      waterQuality: 'excellent',
      isWaterChilled: true,
      hasRefillableBottleStations: true,
      waterTemperature: '冷飲水',
      waterAccessibilityNotes: '親子中心各樓層都有飲水機。提供冷熱飲用水。游泳結束後特別需要飲水。'
    },
    diaperChanging: {
      hasDiaperChangingTables: true,
      changingTableQuantity: 5,
      changingTableLocations: ['main restroom', 'family restroom', 'nursing room'],
      hasDiaperDisposal: true,
      hasRunningWater: true,
      hasHandSanitizer: true,
      cleanlinessRating: 4.5,
      isParentSupervisionVisiblity: true,
      hasPrivacyScreen: true,
      changingFacilitiesNotes: '運動中心設有多個尿布台，分布於各廁所。備有清潔用品和垃圾桶。運動後可直接使用。'
    },
    equipmentRental: {
      hasEquipmentRental: true,
      bikeRental: false,
      floatationDeviceRental: true,
      lifejacketRental: true,
      helmetRental: false,
      rentalPriceRange: 'NT$100-200',
      rentalAvailabilityNotes: '浮力衣和救生衣在池邊租賃，兒童優先配備',
      equipmentRentalNotes: '游泳課程提供免費浮力衣。想額外租賃救生衣可在服務台申請。'
    },
    membership: {
      hasMembership: true,
      annualPassAvailable: true,
      seasonalPassAvailable: true,
      discountCardAvailable: false,
      membershipCost: 'NT$4,500/年',
      seasonalPassCost: 'NT$1,200/季',
      membershipBenefits: ['無限入場', '游泳課程9折', '停車免費'],
      visitsIncludedInPass: '無限制入場',
      groupMembershipAvailable: true,
      paymentMethods: ['cash', 'credit card', 'EasyCard'],
      membershipNotes: '年卡超划算，尤其適合需要游泳課程的家庭'
    },
    onSiteDining: {
      hasFoodCourt: false,
      hasCafe: true,
      hasRestaurant: false,
      hasSnackBar: true,
      foodQualityRating: 3.5,
      foodPriceRange: 'NT$80-200',
      vegetarianOptionsAvailable: true,
      diningOptionsDescription: '咖啡廳和小食亭提供飲料、便當和簡食',
      diningSeatingDescription: '咖啡廳座位區可容納50人，提供冷暖飲區',
      diningHours: '07:00 - 21:00',
      diningNotes: '設施簡單，建議自帶便當。課程結束後運動飲品選擇豐富。'
    },
    queueWaitTime: {
      typicalWaitTimeMinutes: 5,
      peakHourWaitTimeMinutes: 15,
      offPeakWaitTimeMinutes: 0,
      seasonalWaitTimeNote: '會員優先入場，非會員在尖峰時段等待15分鐘',
      estimatedWaitNotes: '會員無需排隊，非會員平日5分鐘，週末15分鐘'
    },
    infantSpecific: {
      suitableForNewborns: true,
      hasDarkQuietSpaces: true,
      temperatureControlledNursingAreas: true,
      hasChangeTableAvailability: 6,
      minimalLoudNoiseAreas: true,
      infantCarriageSpaceAvailable: true,
      hasInfantSpecificRestRooms: true,
      recommendedVisitDurationForInfants: '2-3 小時',
      infantCaregiversAvailable: true,
      mommyFrienlyEnvironment: true,
      infantSpecificNotes: '專為親子家庭設計，環境非常適合新生兒，有多個安靜休息區和哺乳室'
    },
    storageLocker: {
      hasLockers: true,
      lockerQuantity: 50,
      lockerSize: 'medium, large',
      lockerCost: '免費',
      hasLargeStorage: true,
      storageAttendantAvailable: false,
      storageSecurity: 'good',
      storageNotes: '免費置物櫃和行李寄放區'
    },
    childAgeCompatibility: {
      hasActivitiesForMultipleAges: true,
      bestAgeCombination: '0-8 歲幼兒和學齡兒童都有適合活動',
      toddlerActivitiesAvailable: true,
      preschoolActivitiesAvailable: true,
      schoolAgeActivitiesAvailable: true,
      teenActivitiesAvailable: false,
      simultaneousActivityOptions: true,
      ageGroupSeparationNeeded: '不同年齡有不同游泳課程區域',
      siblingFriendlinessRating: 'excellent',
      recommendedGroupSizes: '1-4 個幼兒加家長',
      ageCompatibilityNotes: '中心為家庭設計，提供嬰幼兒溫水池和兒童游泳課程。兄弟姐妹可各自參加適齡課程，家長可輪流照顧。'
    },
    visitCost: {
      entryFeePerAdult: 'NT$100-150',
      entryFeePerChild: 'NT$80-120',
      entryFeePerToddler: '免費 (3 歲以下)',
      familyPackagePrice: 'NT$400-500',
      familyPackageIncludes: '2 成人 + 2 兒童',
      estimatedFoodCostPerFamily: 'NT$150-300 簡易食堂',
      parkingCostForDay: '免費停車',
      rentalsCostEstimate: 'NT$100-200 浮力衣和救生衣',
      extraActivitiesCostEstimate: 'NT$200-500 游泳課程 (若報名)',
      totalEstimatedCostPerFamily: 'NT$750-1,700 含停車和基本租賃',
      discountedPackages: ['10 次票 NT$1,200', '季卡 NT$1,200/3月', '年卡 NT$4,500'],
      paymentFlexibility: '單次票或購買時間票，年卡超值',
      costSavingTips: '年卡適合常客。游泳課程可包含在季卡內。停車免費省成本。',
      budgetWarning: '游泳課程額外費用。租賃浮力衣需付費。',
      visitCostNotes: '票價經濟，年卡最划算。游泳課程可提升技能，值得投資。'
    },
    healthDocumentation: {
      requiresCOVIDVaccination: false,
      vaccineProofRequired: '不需要',
      requiresCovidTestOnArrival: false,
      requiresHealthCertificate: false,
      enforcementLevel: 'none',
      documentationNotes: '公設運動中心，遵守防疫但無強制疫苗要求',
      healthRequirementNotes: '無特定疫苗或健康文件要求。建議患有眼睛或皮膚問題的兒童帶備防護用品。'
    },
    playgroundAndActivity: {
      hasPlayground: true,
      playgroundTypes: ['swimming pools', 'water play area', 'aquatic training', 'recreational pool', 'children splash pool'],
      playgroundEquipment: ['heated infant pool', 'shallow children pool', 'main Olympic pool', 'diving area', 'water slides', 'splash pad'],
      toddlerPlaygroundAvailable: true,
      preschoolPlayEquipment: ['shallow splash pool (0.6m)', 'water toys', 'beginner swim lanes'],
      schoolAgePlayEquipment: ['children training pool (1m)', 'intermediate swim lanes', 'water polo areas', 'diving board (shallow)'],
      teenActivityOptions: ['Olympic diving board', 'competitive swim lanes', 'water polo', 'synchronized swimming classes'],
      activitiesByAgeGroup: '3-12個月：嬰兒溫水池26-30°C、親子水上遊戲；1-3歲：淺水池(0.6m)、水上安全課、水上遊戲；4-8歲：兒童訓練池(1m)、游泳課程、跳水課；9-12歲：標準游泳課、進階水上技能、水上運動；13+：競技游泳、跳水訓練',
      seasonalActivityAvailability: '全年開放，冬季室內加溫，夏季戶外泳池全開',
      playgroundSafetyRating: 4.8,
      equipmentMaintenanceFrequency: '每日水質檢測及設施檢查，周度深層清潔，月度技術檢修',
      equipmentAgeAndCondition: '設施完善，多個泳池設備定期維護，2024年進行現代化升級',
      costForActivities: '游泳票包含池費，游泳課程額外付費（NT$200-500/堂）',
      suggestedDurationPerActivityType: '嬰兒池：20-30分鐘、兒童淺水池：45-60分鐘、游泳課：60分鐘、整體遊玩：1.5-2小時',
      outdoorVsIndoorActivities: '70%室內（加溫池），30%戶外（夏季開放）',
      playgroundAndActivityNotes: '南港軟體園區親子中心特別適合1-8歲的水上活動和游泳學習。嬰兒溫水池很溫暖安全，兒童淺水池人氣旺盛。周末假日人多排隊，建議平日上午到訪。專業游泳教練提供各年齡段課程。高峰時段淺水池可能擁擠。'
    },
    navigationFromTransit: {
      hasPublicTransitAccess: true,
      mrtDirections: {
        station: '南港軟體園區站 (Brown Line)',
        distance: 100,
        walkingTimeMinutes: 2,
        directions: 'MRT南港軟體園區站1號出口直達親子中心，出站即到，無需轉彎',
        exitNumber: '1號出口',
        elevatorAvailable: true
      },
      busDirections: {
        busLines: ['270', '275', '605'],
        stopName: '南港軟體園區站',
        walkingTimeMinutes: 3,
        directions: '下車後沿著園區指標直走，親子中心在園區中央',
        frequency: '尖峰時段每8-10分鐘一班，離峰時段每12-15分鐘一班'
      },
      cyclingDirections: {
        bikeAccessible: true,
        bikeStorageAvailable: true,
        directions: '軟體園區內有完整自行車道，親子中心外有自行車停放區',
        estimatedCyclingTimeMinutes: 8
      },
      driversLicenseAccess: {
        drivingTimeFromCityCenter: 20,
        parkingEntrance: '南港軟體園區停車場（經貿二路入口）',
        gpsCoordinates: { lat: 25.0556, lng: 121.6089 },
        accessRoadType: '南港區園區內部道路'
      },
      accessibleTransportOptions: {
        wheelchairAccessibleMRT: true,
        elevatorAtStation: true,
        accessibleBusAvailable: true
      },
      entranceLocation: {
        mainEntranceName: '經貿二路191號主入口',
        alternateEntrances: ['園區內側入口'],
        closestEntranceFromTransit: '從MRT南港軟體園區站：1號出口直達（最近，步行2分鐘）',
        disabledAccessEntrance: '主入口設有無障礙電梯和停車位'
      },
      navigationNotes: '南港軟體園區親子中心位於南港區軟體園區內，交通非常便利。MRT棕線南港軟體園區站1號出口步行2分鐘直達（最方便），或搭公車270、275、605號至園區站（下車後步行3分鐘）。園區內有停車場，自行車設施完善。中心位於園區中央，標示清楚易找。'
    },
    photographySpotsAndServices: {
      bestPhotoSpots: [
        {
          spotName: '親子中心入口',
          description: '現代化親子中心的玻璃幕牆入口，背景簡潔現代',
          bestTimeOfDay: '上午10-11點，自然光最好',
          ageAppropriate: '全年齡',
          photoTip: '在入口拍攝全家福，背景建築和諧簡潔'
        },
        {
          spotName: '室內遊樂設施區',
          description: '寬敞明亮的遊樂區，設施多樣',
          bestTimeOfDay: '上午，人較少光線好',
          ageAppropriate: '1-8歲',
          photoTip: '拍攝孩子在各種設施上遊玩的活動照'
        },
        {
          spotName: '軟體園區外部景觀',
          description: '園區內綠樹和建築景觀',
          bestTimeOfDay: '下午2-3點',
          ageAppropriate: '全年齡',
          photoTip: '園區環境舒適，適合全家戶外合照'
        }
      ],
      photoBooth: {
        available: false
      },
      professionalPhotoServices: {
        available: false
      },
      scenicLocations: ['親子中心入口', '遊樂設施區', '園區綠地'],
      allowedEquipment: ['相機', '手機'],
      photoStorageSpots: {
        hasCloud: true,
        hasUSBServices: false
      },
      photographyNotes: '親子中心環境新穎整潔，採光充足。室內設施現代化，適合拍攝兒童活動。園區周邊也有不少戶外拍照點。建議預約參訪時間以獲得最佳拍照環境。'
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
    },
    heightBasedPricing: {
      hasHeightBasedPricing: false,
      pricingNotes: '單次入場NT$100，課程包另計。無身高限制。'
    },
    drinkingWater: {
      hasDrinkingWater: true,
      drinkingWaterSources: ['water fountains', 'refill stations'],
      waterFountainQuantity: 5,
      waterQuality: 'excellent',
      isWaterChilled: true,
      hasRefillableBottleStations: true,
      waterTemperature: '冷飲水',
      waterAccessibilityNotes: '運動中心各處都有飲水機。提供冷水和溫水。游泳後務必補充水分。'
    },
    diaperChanging: {
      hasDiaperChangingTables: true,
      changingTableQuantity: 4,
      changingTableLocations: ['main restroom', 'family restroom', 'changing room'],
      hasDiaperDisposal: true,
      hasRunningWater: true,
      hasHandSanitizer: true,
      cleanlinessRating: 4.4,
      isParentSupervisionVisiblity: true,
      hasPrivacyScreen: true,
      changingFacilitiesNotes: '游泳中心多個廁所設有尿布台。潔淨度良好，備有清潔用品和垃圾桶。游泳前後可使用。'
    },
    equipmentRental: {
      hasEquipmentRental: true,
      floatationDeviceRental: true,
      lifejacketRental: true,
      rentalPriceRange: 'NT$80-150',
      rentalAvailabilityNotes: '浮力衣、救生衣和泳鏡在售票處租賃',
      equipmentRentalNotes: '游泳課程免費提供浮力衣。欲加購其他防護設備可租賃。'
    },
    membership: {
      hasMembership: true,
      annualPassAvailable: true,
      seasonalPassAvailable: false,
      discountCardAvailable: true,
      membershipCost: 'NT$3,600/年',
      discountCardCost: '集點卡，消費集點',
      membershipBenefits: ['無限入場', '課程優惠', '免費停車'],
      visitsIncludedInPass: '無限制',
      paymentMethods: ['cash', 'credit card', 'EasyCard'],
      membershipNotes: '年卡划算，適合暑期兒童游泳課程家庭'
    },
    onSiteDining: {
      hasFoodCourt: false,
      hasCafe: false,
      hasRestaurant: false,
      hasSnackBar: true,
      foodQualityRating: 3.2,
      foodPriceRange: 'NT$60-150',
      vegetarianOptionsAvailable: true,
      diningOptionsDescription: '小食亭提供飲料和簡食',
      diningSeatingDescription: '簡單戶外座位區',
      diningHours: '06:00 - 21:00',
      diningNotes: '食物選擇有限。強烈建議自帶便當或到附近便利商店購買。'
    },
    queueWaitTime: {
      typicalWaitTimeMinutes: 10,
      peakHourWaitTimeMinutes: 40,
      offPeakWaitTimeMinutes: 2,
      seasonalWaitTimeNote: '夏季特別擁擠，下午時段尤其人多。平日早上開放後人最少',
      holidayWaitTimeMinutes: 90,
      estimatedWaitNotes: '平日早上2-5分鐘，下午40分鐘，夏天尖峰1-1.5小時'
    },
    infantSpecific: {
      suitableForNewborns: false,
      hasDarkQuietSpaces: false,
      temperatureControlledNursingAreas: false,
      hasChangeTableAvailability: 5,
      minimalLoudNoiseAreas: false,
      infantCarriageSpaceAvailable: true,
      hasInfantSpecificRestRooms: false,
      recommendedVisitDurationForInfants: '不建議新生兒',
      infantCaregiversAvailable: false,
      mommyFrienlyEnvironment: false,
      infantSpecificNotes: '運動中心的游泳池太深不適合新生兒，建議1歲以上幼童方可入水'
    },
    storageLocker: {
      hasLockers: true,
      lockerQuantity: 200,
      lockerSize: 'small',
      lockerCost: 'NT$20',
      coinOrCardRequired: true,
      hasLargeStorage: true,
      storageAttendantAvailable: true,
      storageSecurity: 'excellent',
      storageNotes: '投幣置物櫃NT$20，大型行李可於服務台寄放'
    },
    childAgeCompatibility: {
      hasActivitiesForMultipleAges: true,
      bestAgeCombination: '4-12 歲兒童最適合，較小幼兒有嬰幼兒池',
      toddlerActivitiesAvailable: true,
      preschoolActivitiesAvailable: true,
      schoolAgeActivitiesAvailable: true,
      teenActivitiesAvailable: true,
      simultaneousActivityOptions: true,
      ageGroupSeparationNeeded: '深水區和淺水區分開，確保安全',
      siblingFriendlinessRating: 'excellent',
      recommendedGroupSizes: '2-6 個兒童加家長，可分組使用不同池區',
      ageCompatibilityNotes: '運動中心有嬰幼兒池、兒童池、成人池，各年齡段都有適合區域。兄弟姐妹可各自享受游泳樂趣。'
    },
    visitCost: {
      entryFeePerAdult: 'NT$150',
      entryFeePerChild: 'NT$100',
      entryFeePerToddler: '免費 (3 歲以下)',
      familyPackagePrice: 'NT$500-600',
      familyPackageIncludes: '2 成人 + 2 兒童',
      estimatedFoodCostPerFamily: 'NT$200-400 簡易食堂',
      parkingCostForDay: '免費停車',
      rentalsCostEstimate: 'NT$100-200 浮力衣和毛巾租賃',
      extraActivitiesCostEstimate: 'NT$100-300 水上設施或課程',
      totalEstimatedCostPerFamily: 'NT$1,050-1,700 含停車和基本租賃',
      discountedPackages: ['10 次票 NT$1,300', '季卡 NT$1,500/3月'],
      paymentFlexibility: '單次票或購買時間票',
      costSavingTips: '季卡適合夏季常客。停車免費。自帶零食省錢。',
      budgetWarning: '停留時間長會增加食堂消費。租賃毛巾有額外費用。',
      visitCostNotes: '票價合理，夏季遊玩最划算。季卡超值。'
    },
    healthDocumentation: {
      requiresCOVIDVaccination: false,
      vaccineProofRequired: '不需要',
      requiresCovidTestOnArrival: false,
      requiresHealthCertificate: false,
      enforcementLevel: 'none',
      documentationNotes: '公設運動中心，遵守防疫標準但無強制疫苗要求',
      healthRequirementNotes: '無特定疫苗或健康文件要求。水上活動建議檢查天氣和水質狀況。'
    },
    playgroundAndActivity: {
      hasPlayground: true,
      playgroundTypes: ['swimming pools', 'water training facilities', 'recreational pool', 'children splash pool', 'competitive swimming area'],
      playgroundEquipment: ['heated children pool', 'shallow training pool', 'Olympic main pool', 'diving board', 'water slide (summer)', 'hydro-jet facilities'],
      toddlerPlaygroundAvailable: false,
      preschoolPlayEquipment: ['shallow pool (0.8m)', 'water toys', 'beginner swim lane'],
      schoolAgePlayEquipment: ['children training pool (1.2m)', 'intermediate swim lanes', 'diving platforms'],
      teenActivityOptions: ['Olympic diving board', 'competitive swimming', 'water polo training', 'diving certifications'],
      activitiesByAgeGroup: '4-7歲：淺水訓練池(0.8m)、游泳課程、水上遊戲；8-12歲：標準訓練池(1.2m)、進階游泳課、跳水課；13+：競技游泳、跳水訓練、水上運動',
      seasonalActivityAvailability: '全年室內池開放，夏季（6-9月）戶外設施全開，水滑梯開放',
      playgroundSafetyRating: 4.7,
      equipmentMaintenanceFrequency: '每日水質檢測，营業前後設施檢查，周度清潔，月度安全檢修',
      equipmentAgeAndCondition: '設施完善，2023年進行維修升級，所有設備符合國際標準',
      costForActivities: '入池票包含所有池設施，游泳課程額外付費（NT$100-400/堂）',
      suggestedDurationPerActivityType: '淺水池：30-45分鐘、遊泳課程：60分鐘、自由遊玩：1-2小時',
      outdoorVsIndoorActivities: '冬季100%室內，夏季70%室內+30%戶外',
      playgroundAndActivityNotes: '內湖運動中心為公設游泳設施，主要用於競技和訓練，不若兒童新樂園般有娛樂設施。適合4歲以上想學習游泳的兒童。淺水池適合初學者，但高峰時段（周末下午和晚間）常排隊。夏季水滑梯超人氣，等待時間長。建議預約游泳課程以保證時間。'
    },
    navigationFromTransit: {
      hasPublicTransitAccess: true,
      mrtDirections: {
        station: '文湖線內湖站（規劃中）',
        distance: 800,
        walkingTimeMinutes: 12,
        directions: '目前無直達MRT，可搭民權路相關公車或自行開車',
        exitNumber: '待建',
        elevatorAvailable: false
      },
      busDirections: {
        busLines: ['205', '212', '247', '256'],
        stopName: '內湖運動中心站',
        walkingTimeMinutes: 5,
        directions: '下車後沿著民權路直走，運動中心在右側',
        frequency: '尖峰時段每8-12分鐘一班，離峰時段每15-20分鐘一班'
      },
      cyclingDirections: {
        bikeAccessible: true,
        bikeStorageAvailable: true,
        directions: '沿著民權路自行車道可直達，運動中心外有自行車停放區',
        estimatedCyclingTimeMinutes: 12
      },
      driversLicenseAccess: {
        drivingTimeFromCityCenter: 25,
        parkingEntrance: '民權路運動中心地下停車場',
        gpsCoordinates: { lat: 25.0832, lng: 121.5876 },
        accessRoadType: '台北市內湖區民權路幹道'
      },
      accessibleTransportOptions: {
        wheelchairAccessibleMRT: false,
        elevatorAtStation: false,
        accessibleBusAvailable: true
      },
      entranceLocation: {
        mainEntranceName: '民權路運動中心主入口',
        alternateEntrances: ['停車場出入口'],
        closestEntranceFromTransit: '從公車站：民權路內湖運動中心站（下車步行5分鐘即到）',
        disabledAccessEntrance: '主入口設有無障礙坡道和停車位'
      },
      navigationNotes: '內湖運動中心位於台北市內湖區民權路，目前無直達MRT（文湖線內湖站規劃中）。搭公車205、212、247、256號至內湖運動中心站（下車步行5分鐘），或開車至民權路地下停車場（方便快速）。自行車沿著民權路專用道可直達。停車場設有無障礙設施。'
    },
    photographySpotsAndServices: {
      bestPhotoSpots: [
        {
          spotName: '游泳池畔',
          description: '運動中心的游泳池，孩童戲水的開心時刻',
          bestTimeOfDay: '下午2-4點，逆光會有水花閃爍效果',
          ageAppropriate: '3-12歲',
          photoTip: '拍攝孩子在水中活動，需要防水相機或手機'
        },
        {
          spotName: '體育館外觀',
          description: '現代化的運動中心建築',
          bestTimeOfDay: '上午10-11點，側光效果好',
          ageAppropriate: '全年齡',
          photoTip: '可在建築前拍全家福或兒童肖像'
        }
      ],
      photoBooth: {
        available: false
      },
      professionalPhotoServices: {
        available: false
      },
      scenicLocations: ['游泳池', '運動中心外觀'],
      allowedEquipment: ['相機', '防水手機殼'],
      photoStorageSpots: {
        hasCloud: true,
        hasUSBServices: false
      },
      photographyNotes: '運動中心環境整潔，但室內光線可能較暗。游泳池畔拍照時需注意安全。建議帶防水相機或手機殼保護設備。戶外拍照點主要為建築外觀，景觀簡潔。'
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
    },
    heightBasedPricing: {
      hasHeightBasedPricing: true,
      childHeightThreshold: 110,
      childPrice: 'NT$400',
      adultHeight: 150,
      freeHeightThreshold: 100,
      heightMeasurementLocation: '售票處',
      pricingNotes: '身高未滿100公分免費，100-110公分NT$400，110-150公分NT$600，超過150公分NT$800。於售票處驗證身高。'
    },
    drinkingWater: {
      hasDrinkingWater: true,
      drinkingWaterSources: ['water fountains', 'refill stations'],
      waterFountainQuantity: 10,
      waterQuality: 'good',
      isWaterChilled: true,
      hasRefillableBottleStations: true,
      waterTemperature: '冷飲水 (約10°C)',
      waterAccessibilityNotes: '水上樂園各區都有飲水機，提供冷飲水。在台灣炎熱夏季必不可少。可自帶水瓶。'
    },
    diaperChanging: {
      hasDiaperChangingTables: true,
      changingTableQuantity: 6,
      changingTableLocations: ['main restroom', 'family restroom', 'changing area'],
      hasDiaperDisposal: true,
      hasRunningWater: true,
      hasHandSanitizer: true,
      cleanlinessRating: 4.3,
      isParentSupervisionVisiblity: true,
      hasPrivacyScreen: true,
      changingFacilitiesNotes: '水上樂園各區設置尿布台，共6個。備有免費尿布、濕紙巾和垃圾桶。因為是水上樂園，維持中等清潔度。'
    },
    equipmentRental: {
      hasEquipmentRental: true,
      floatationDeviceRental: true,
      lifejacketRental: true,
      sunProtectionGearRental: true,
      rainGearRental: false,
      rentalPriceRange: 'NT$100-250',
      rentalAvailabilityNotes: '浮圈、救生衣、防曬帽在各區租賃點提供',
      equipmentRentalNotes: '水上樂園必備浮力裝備。防曬帽強烈建議租賃，暑期台灣紫外線指數高。'
    },
    membership: {
      hasMembership: true,
      annualPassAvailable: true,
      seasonalPassAvailable: false,
      discountCardAvailable: false,
      membershipCost: 'NT$2,500/季',
      membershipBenefits: ['無限入場', '20%餐飲折扣', '設施優先使用權'],
      visitsIncludedInPass: '無限制入園（6月-9月營運期間）',
      groupMembershipAvailable: true,
      paymentMethods: ['cash', 'credit card', 'LINE Pay'],
      membershipNotes: '季卡划算，暑期常訪家庭首選。平均每月3次即可回本。'
    },
    onSiteDining: {
      hasFoodCourt: true,
      hasCafe: true,
      hasRestaurant: true,
      hasSnackBar: true,
      foodQualityRating: 3.8,
      foodPriceRange: 'NT$80-400',
      vegetarianOptionsAvailable: true,
      halalFoodAvailable: false,
      diningOptionsDescription: '美食廣場、咖啡廳、餐廳和小食亭提供多樣選擇',
      diningSeatingDescription: '戶外用餐區遮陰良好，可容納500人',
      diningHours: '09:00 - 18:00 (跟隨樂園營運時間)',
      diningNotes: '水上樂園餐飲選擇豐富但價格偏高。建議自帶便當和飲水，另外購買冷飲補充電解質。'
    },
    queueWaitTime: {
      typicalWaitTimeMinutes: 20,
      peakHourWaitTimeMinutes: 90,
      offPeakWaitTimeMinutes: 5,
      seasonalWaitTimeNote: '夏季週末人爆滿，排隊1-2小時。非尖峰日期（雨天、平日）人很少',
      holidayWaitTimeMinutes: 120,
      fastPassAvailable: true,
      fastPassPrice: 'NT$800-1000',
      estimatedWaitNotes: '夏季週末排隊1-2小時，非假期平日5-10分鐘，快速通關票可跳過排隊'
    },
    infantSpecific: {
      suitableForNewborns: false,
      hasDarkQuietSpaces: false,
      temperatureControlledNursingAreas: false,
      hasChangeTableAvailability: 8,
      minimalLoudNoiseAreas: false,
      infantCarriageSpaceAvailable: true,
      hasInfantSpecificRestRooms: true,
      recommendedVisitDurationForInfants: '不建議新生兒',
      infantCaregiversAvailable: false,
      mommyFrienlyEnvironment: false,
      infantSpecificNotes: '水樂園非常擁擠吵雜不適合新生兒。建議6個月以上且有游泳經驗的寶寶方可參加'
    },
    storageLocker: {
      hasLockers: true,
      lockerQuantity: 300,
      lockerSize: 'small, medium',
      lockerCost: 'NT$30-50',
      coinOrCardRequired: true,
      hasLargeStorage: false,
      storageAttendantAvailable: false,
      storageSecurity: 'good',
      storageNotes: '投幣置物櫃分佈在各區，容量有限，尖峰時段可能不夠'
    },
    childAgeCompatibility: {
      hasActivitiesForMultipleAges: true,
      bestAgeCombination: '4-15 歲兒童最適合，學齡兒童和青少年都有樂趣',
      toddlerActivitiesAvailable: false,
      preschoolActivitiesAvailable: false,
      schoolAgeActivitiesAvailable: true,
      teenActivitiesAvailable: true,
      simultaneousActivityOptions: true,
      ageGroupSeparationNeeded: '兒童區和成人區分開，不同身高限制',
      siblingFriendlinessRating: 'good',
      recommendedGroupSizes: '2-4 個學齡兒童加家長',
      ageCompatibilityNotes: '水樂園適合年長兒童和青少年。年幼兒童（4 歲以下）不建議。兄弟姐妹若年齡相近可同樂，否則家長需分開照顧。'
    },
    visitCost: {
      entryFeePerAdult: 'NT$600',
      entryFeePerChild: 'NT$400',
      entryFeePerToddler: '免費 (未滿 110cm)',
      familyPackagePrice: 'NT$2,000-2,500',
      familyPackageIncludes: '2 成人 + 2 兒童',
      estimatedFoodCostPerFamily: 'NT$400-800 園內餐飲 (較貴)',
      parkingCostForDay: 'NT$100',
      rentalsCostEstimate: 'NT$200-400 浮力衣、毛巾、防曬用品',
      extraActivitiesCostEstimate: 'NT$100-300 額外水上設施',
      totalEstimatedCostPerFamily: 'NT$3,200-5,200 含停車和租賃',
      discountedPackages: ['季卡 NT$1,800/3月', '平日票 NT$400-500 (折扣)'],
      paymentFlexibility: '可購買單次票或季卡，提前購票有優惠',
      costSavingTips: '季卡適合暑假常客，平均每次 NT$200。自帶便當省錢（禁止玻璃容器）。',
      budgetWarning: '票價最高，停車費和租賃費用加起來顯著。園內飲食價格偏高。',
      visitCostNotes: '最昂貴景點，須預算充足。季卡和平日優惠可降低成本。暑期遊樂首選。'
    },
    healthDocumentation: {
      requiresCOVIDVaccination: false,
      vaccineProofRequired: '不需要',
      requiresCovidTestOnArrival: false,
      requiresHealthCertificate: false,
      enforcementLevel: 'none',
      documentationNotes: '水上樂園遵守標準防疫，無強制疫苗要求',
      healthRequirementNotes: '無特定疫苗或健康文件要求。建議檢查天氣預報。皮膚敏感兒童帶備防曬和防刺激產品。'
    },
    playgroundAndActivity: {
      hasPlayground: true,
      playgroundTypes: ['water park', 'water slides', 'wave pool', 'water play zone', 'lazy river'],
      playgroundEquipment: ['water slides (family/extreme)', 'wave pool (adjustable)', 'shallow children splash area', 'lazy river floats', 'water spray playground', 'interactive water features'],
      toddlerPlaygroundAvailable: false,
      preschoolPlayEquipment: [],
      schoolAgePlayEquipment: ['children water slides', 'shallow splash area', 'wave pool (shallow section)', 'water spray toys'],
      teenActivityOptions: ['extreme water slides', 'wave pool surfing', 'deep diving area', 'water sports activities'],
      activitiesByAgeGroup: '4-7歲：兒童水滑梯、淺水戲水區、水上噴泉；8-12歲：中級水滑梯、波浪池、懶人漂流河、水上遊戲；13+：極限水滑梯、深水區、衝浪板體驗',
      seasonalActivityAvailability: '季節性開放，5月中至9月中開放（夏季營運期），冬季關閉',
      playgroundSafetyRating: 4.6,
      equipmentMaintenanceFrequency: '營業期間每日檢查，周度深層維護，营業前後安全檢驗',
      equipmentAgeAndCondition: '設施定期維護，2024年進行部分設備更新，所有滑道符合安全標準',
      costForActivities: '所有水上設施包含在入園票內',
      suggestedDurationPerActivityType: '水滑梯排隊+遊玩：15-30分鐘、波浪池：30-45分鐘、懶人漂流河：20分鐘、整體遊玩時間：4-6小時',
      outdoorVsIndoorActivities: '100%戶外，無室內設施',
      playgroundAndActivityNotes: '新店水上樂園是台北地區最大的水上樂園，適合4歲以上學齡兒童和青少年。擁有30多項水上設施和遊樂。高峰期（周末和暑假）人非常多，排隊時間長達30-60分鐘。建議早上8-10點到達或參加夜間活動。4歲以下兒童不建議，因無特別設施。務必做好防曬和補充水分。'
    },
    navigationFromTransit: {
      hasPublicTransitAccess: true,
      mrtDirections: {
        station: '新店站 (Green Line)',
        distance: 2000,
        walkingTimeMinutes: 25,
        directions: 'MRT新店站2號出口，沿著中興路直走，過新店溪橋後即為園區',
        exitNumber: '2號出口',
        elevatorAvailable: true
      },
      busDirections: {
        busLines: ['58', '59', '208', '248', '915'],
        stopName: '新店水上樂園站',
        walkingTimeMinutes: 5,
        directions: '下車後沿著指標直走，園區入口明顯',
        frequency: '尖峰時段每8-15分鐘一班，離峰時段每15-20分鐘一班'
      },
      cyclingDirections: {
        bikeAccessible: true,
        bikeStorageAvailable: true,
        directions: '沿著新店溪自行車道可直達，園區外有停自行車區',
        estimatedCyclingTimeMinutes: 20
      },
      driversLicenseAccess: {
        drivingTimeFromCityCenter: 30,
        parkingEntrance: '中興路新店水上樂園停車場',
        gpsCoordinates: { lat: 24.9806, lng: 121.5433 },
        accessRoadType: '新北市新店區主要道路'
      },
      accessibleTransportOptions: {
        wheelchairAccessibleMRT: true,
        elevatorAtStation: true,
        accessibleBusAvailable: true
      },
      entranceLocation: {
        mainEntranceName: '中興路1號主入口',
        alternateEntrances: ['停車場入口', '新店溪河濱公園入口'],
        closestEntranceFromTransit: '從MRT新店站：中興路主入口（步行25分鐘較遠，建議搭計程車或公車）；從公車站：新店水上樂園站（最近，步行5分鐘）',
        disabledAccessEntrance: '主入口設有無障礙停車位和坡道'
      },
      navigationNotes: '新店水上樂園位於新北市新店區中興路，交通相對不如市區方便。MRT新店站綠線2號出口步行25分鐘較遠，建議搭公車58、59、208、248或915號至新店水上樂園站（下車步行5分鐘，最方便）。或自行開車至中興路停車場（推薦）。位於新店溪河濱公園附近，風景優美。'
    },
    photographySpotsAndServices: {
      bestPhotoSpots: [
        {
          spotName: '水上樂園入口',
          description: '樂園大門和標誌，夏日的經典拍照地點',
          bestTimeOfDay: '上午9-10點，背光前的角度最佳',
          ageAppropriate: '全年齡',
          photoTip: '在入口牌子前拍全家福，表現出來水樂園的歡樂氛圍'
        },
        {
          spotName: '水上設施區',
          description: '各種水上滑梯和遊樂設施，孩童戲水嬉笑聲',
          bestTimeOfDay: '下午1-3點，逆光時水花最閃爍',
          ageAppropriate: '3-14歲',
          photoTip: '拍攝孩童在水中開心遊樂的自然表情，逆光會有水珠閃爍效果'
        },
        {
          spotName: '新店溪河濱風景',
          description: '樂園鄰近河邊，有優美的河岸景觀',
          bestTimeOfDay: '下午4-5點，河面反光美麗',
          ageAppropriate: '全年齡',
          photoTip: '在河邊拍攝全景照，背景是新店溪和遠方山脈'
        }
      ],
      photoBooth: {
        available: false
      },
      professionalPhotoServices: {
        available: false
      },
      scenicLocations: ['樂園入口', '水上滑梯區', '新店溪河邊', '園區景觀'],
      allowedEquipment: ['防水相機', '防水手機殼', '水下攝像機'],
      photoStorageSpots: {
        hasCloud: true,
        hasUSBServices: false
      },
      photographyNotes: '水上樂園夏季是最佳拍照季節，但人潮眾多。建議早晨開園時段拍照。水上拍照必須使用防水設備。園區周邊河岸景觀優美，可拍風景照。禁止使用無人機。'
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
