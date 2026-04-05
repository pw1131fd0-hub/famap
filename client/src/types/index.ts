export type Category = 'park' | 'nursing_room' | 'restaurant' | 'medical' | 'attraction' | 'other';

export interface OperatingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface AgeRange {
  minAge?: number;
  maxAge?: number;
}

export interface PricingInfo {
  isFree: boolean;
  priceRange?: string;
}

export interface PublicTransitInfo {
  nearestMRT?: {
    line: string;
    station: string;
    distance: number; // in meters
  };
  busLines?: string[];
}

export interface ParkingInfo {
  available: boolean;
  cost?: string;
  hasValidation: boolean;
}

export interface ToiletInfo {
  available: boolean;
  childrenFriendly: boolean;
  hasChangingTable: boolean;
}

export interface AllergenInfo {
  commonAllergens?: string[]; // e.g., ['peanuts', 'shellfish', 'dairy']
}

export interface CrowdingInfo {
  quietHours?: string; // e.g., "weekday mornings 9-11am"
  peakHours?: string; // e.g., "weekends 2-6pm"
  averageCrowding?: 'light' | 'moderate' | 'heavy'; // general crowding level
}

export interface NursingAmenitiesInfo {
  hasDedicatedArea?: boolean;
  hasChangingTable?: boolean;
  hasPowerOutlet?: boolean; // for bottle warmers
  hasRefrigerator?: boolean; // to store breast milk
  hasWarmWater?: boolean; // for formula preparation
}

export interface WeatherCoverageInfo {
  isIndoor: boolean;
  hasRoof?: boolean;
  hasShade?: boolean;
  weatherProtection?: string; // e.g., "mostly outdoor with covered pavilion"
}

export interface NearbyAmenitiesInfo {
  convenientStores?: number; // count nearby (within 200m)
  nearbyRestrooms?: boolean;
  nearbyRestaurants?: boolean;
  nearbyPublicTransit?: string; // e.g., "MRT station 200m away"
}

export interface AccessibilityInfo {
  wheelchairAccessible?: boolean; // more detailed than just stroller
  accessibleToilet?: boolean;
  disabledParking?: boolean;
  hasElevator?: boolean;
  hasRamp?: boolean;
  accessibilityNotes?: string; // e.g., "limited wheelchair access in second floor play area"
}

export interface ActivityInfo {
  activityTypes?: string[]; // e.g., ["sandbox play", "slide", "swing", "rock climbing", "nature trail"]
  equipment?: string[]; // e.g., ["climbing structures", "spring riders", "seesaws"]
  ageAppropriate?: AgeRange; // recommended ages for main activities
  mainActivities?: string; // e.g., "play area for ages 2-8"
}

export interface SafetyInfo {
  playAreaSafety?: 'excellent' | 'good' | 'fair' | 'needs_improvement'; // safety assessment
  firstAidAvailable?: boolean;
  supervisionAvailable?: boolean; // staff supervision
  safetyRating?: number; // 1-5 stars
  safetyNotes?: string; // e.g., "regular safety inspections", "equipment well-maintained"
}

export interface QualityMetricsInfo {
  cleanlinessRating?: number; // 1-5 stars based on recent feedback
  maintenanceStatus?: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  lastMaintenanceDate?: string; // ISO date
  cleanlinessNotes?: string; // e.g., "frequently cleaned", "cleaning schedule posted"
}

export interface BookingInfo {
  requiresPreBooking?: boolean; // Must book in advance
  offersOnlineBooking?: boolean; // Can book online
  bookingMethods?: string[]; // e.g., ["phone", "online", "wechat", "line"]
  bookingNotes?: string; // e.g., "Weekend visits require booking 3 days in advance"
  groupDiscountAvailable?: boolean; // Family/group discounts
  discountNotes?: string; // e.g., "Family packages available for 4+ people"
}

export interface SeasonalInfo {
  bestSeasons?: string[]; // e.g., ["spring", "fall"] - 'spring', 'summer', 'fall', 'winter'
  summerNotes?: string; // e.g., "Very hot (30-35°C), has air conditioning indoors"
  winterNotes?: string; // e.g., "Mild (10-15°C), some outdoor areas may close"
  rainySeasonNotes?: string; // e.g., "Covered areas available, typhoon season (Jul-Sep)"
  seasonalActivities?: string; // e.g., "Summer water activities, winter lighting festivals"
  schoolHolidayCrowding?: 'light' | 'moderate' | 'heavy'; // Expected crowding during school holidays
  seasonalClosures?: string; // e.g., "Closed during typhoon warnings"
}

export interface PaymentInfo {
  acceptsCash?: boolean; // 現金
  acceptsLinePay?: boolean; // LINE Pay (very common in Taiwan)
  acceptsWeChatPay?: boolean; // WeChat Pay (for mainland visitors)
  acceptsAlipay?: boolean; // AliPay (for mainland visitors)
  acceptsApplePay?: boolean; // Apple Pay
  acceptsSamsungPay?: boolean; // Samsung Pay
  acceptsCreditCard?: boolean; // Visa, Mastercard
  acceptsDebitCard?: boolean;
  paymentNotes?: string; // e.g., "Online booking requires credit card, entrance accepts all methods"
}

export interface OutsideFoodPolicy {
  allowsOutsideFood?: boolean; // Can families bring own food/picnic?
  allowsOutsideBeverages?: boolean; // Can bring own drinks?
  hasPicnicAreas?: boolean; // Designated picnic areas available?
  hasRefrigeratedStorage?: boolean; // Can store brought food/drinks?
  foodPolicyNotes?: string; // e.g., "Picnic allowed in designated areas, no hot drinks allowed"
}

export interface StrollerInfo {
  strollerFriendly?: boolean; // General stroller accessibility
  hasStrollerStorage?: boolean; // Dedicated stroller parking/storage area
  hasStrollerRental?: boolean; // Can rent stroller on-site
  strollerStorageNotes?: string; // e.g., "Free stroller storage near entrance, max 4 hours"
  restrictedAreas?: string; // e.g., "Stroller not allowed in play areas, can be stored nearby"
}

export interface ReservedTimesInfo {
  hasReservedTimes?: boolean; // Special hours for specific groups
  parentChildHours?: string; // 親子時段 - common in Taiwan
  toddlerSpecificTimes?: string; // Times for infants/toddlers (0-2 years)
  quietHours?: string; // Low-stimulus hours for sensitive children
  reservedTimesNotes?: string; // e.g., "Wednesday 10-12am parent-child hours, reserve online"
}

export interface NursingRoomDetails {
  hasDedicatedNursingRoom?: boolean; // Is there a dedicated nursing/lactation room? (哺乳室)
  isPrivate?: boolean; // Private room vs shared area
  hasSeating?: boolean; // Comfortable seating
  hasChangingTable?: boolean; // For diaper changes
  hasAirConditioning?: boolean; // Climate control
  hasWifi?: boolean; // For nursing parents
  hasLockableStall?: boolean; // Privacy for nursing
  hasRefrigerator?: boolean; // For breast milk storage
  hasPowerOutlet?: boolean; // For breast pump/bottle warmer
  hasHandWashing?: boolean; // For hygiene
  cleanlinessRating?: number; // 1-5 stars
  roomCount?: number; // Number of nursing rooms available
  nursingRoomNotes?: string; // e.g., "Private rooms with comfortable seating, refrigerator available, very clean. Reserve ahead"
}

export interface PetPolicy {
  petsAllowed?: boolean; // General pet permission
  dogsAllowed?: boolean; // Specifically for dogs
  catsAllowed?: boolean; // Specifically for cats
  serviceAnimalsAllowed?: boolean; // Service animals (always true but explicit)
  smallPetsAllowed?: boolean; // Rabbits, hamsters, etc.
  hasLeashRequirement?: boolean; // Must be on leash
  hasDesignatedPetAreas?: boolean; // Specific areas for pets
  hasOnSiteVeterinary?: boolean; // Veterinary clinic available
  petRestrictionsDetails?: string; // e.g., "Dogs only in designated area, must be on leash, max 2 dogs per person"
  petPolicyNotes?: string; // e.g., "Pet-friendly park, water bowls available, no aggressive breeds"
}

export interface ClimateComfortInfo {
  hasAirConditioning?: boolean; // Indoor air conditioning
  hasHeating?: boolean; // Winter heating
  hasShadedAreas?: boolean; // Outdoor shade structures
  indoorAreaPercentage?: number; // 0-100%
  summerHeatMitigation?: string; // Heat protection measures
  winterColdProtection?: string; // Cold protection measures
  hasWaterStations?: boolean; // Drinking water available
  hasRestAreas?: boolean; // Cool rest areas
  climateNotes?: string; // Detailed climate information
}

export interface SanitationProtocolsInfo {
  cleaningFrequency?: string; // e.g., "Hourly high-touch surface disinfection"
  disinfectionMethods?: string[]; // e.g., ["electrostatic spray", "HEPA filtration"]
  airQualityRating?: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  hasAirFilters?: boolean; // HEPA air filtration
  hasFrequentHandWashingStations?: boolean; // For kids
  toySanitizationFrequency?: string; // e.g., "Hourly"
  highTouchSurfaceDisinfection?: boolean; // Doorknobs, railings, etc.
  lastInspectionDate?: string; // ISO date
  sanitationNotes?: string; // Detailed sanitation information
}

export interface StaffLanguageInfo {
  englishStaffAvailable?: boolean; // At least one English-speaking staff
  languagesSpoken?: string[]; // e.g., ["Mandarin", "English", "Vietnamese"]
  hasTranslationServices?: boolean; // Translation app or services
  multilingualSignage?: boolean; // Signs in multiple languages
  staffTrainingLevel?: 'certified' | 'trained' | 'basic' | 'minimal';
  languageSupportNotes?: string; // Detailed language support info
}

export interface WaterSafetyInfo {
  hasWaterActivities?: boolean;
  lifeguardAvailable?: boolean;
  lifeguardRatio?: string;
  waterQualityTesting?: string;
  maxWaterDepth?: number;
  hasShallowAreas?: boolean;
  poolTemperature?: string;
  hasLifeJacketRental?: boolean;
  swimLessonAvailable?: boolean;
  waterSafetyRulesEnforced?: boolean;
  waterSafetyNotes?: string;
}

export interface HighChairInfo {
  hasHighChairs?: boolean;
  highChairQuantity?: number;
  minimumAgeMonths?: number;
  maximumAgeMonths?: number;
  cleanlinessRating?: number;
  hasBoosterSeats?: boolean;
  hasChangingStations?: boolean;
  hasBottleWarmingFacilities?: boolean;
  babyGearRentalAvailable?: boolean;
  highChairNotes?: string;
}

export interface AgeSpecificBathroomInfo {
  hasToddlerToilets?: boolean;
  hasStepStools?: boolean;
  hasToiletTrainingFacilities?: boolean;
  hasChildHeightHandWashing?: boolean;
  hasPrivacyFamilyBathroom?: boolean;
  hasHandDryersChildSafe?: boolean;
  parentSupervisionVisiblity?: boolean;
  genderSpecificFacilityEducation?: boolean;
  bathroomCleanlinessRating?: number;
  bathroomNotes?: string;
}

export interface LostChildProtocolInfo {
  hasLostChildProtocol?: boolean;
  staffIdentificationSystem?: boolean;
  hasEmergencyPaging?: boolean;
  hasIDWristbandSystem?: boolean;
  meetingPointDesignated?: boolean;
  hasEmergencyPhoneNumbers?: boolean;
  staffTrainingLevel?: 'comprehensive' | 'standard' | 'basic' | 'minimal';
  incidentDocumentation?: boolean;
  lostChildProtocolNotes?: string;
}

export interface ParentRestAreaInfo {
  hasRestAreas?: boolean;
  hasComfortableSeating?: boolean;
  hasShadeOrIndoor?: boolean;
  hasFeedingAreas?: boolean;
  hasRefreshmentAccess?: boolean;
  hasChargingStations?: boolean;
  restAreaQuantity?: number;
  restAreaCleanlinessRating?: number;
  restAreaNotes?: string;
}

export interface EventSpaceInfo {
  hasEventSpaces?: boolean;
  hasIndoorEventSpace?: boolean;
  hasOutdoorEventSpace?: boolean;
  birthdayPartyPackages?: boolean;
  eventSpaceCapacity?: string;
  maxPartyGroupSize?: number;
  requiresAdvanceBooking?: boolean;
  partyPackageIncludes?: string[];
  partyPriceRange?: string;
  eventNotes?: string;
}

export interface SpecialNeedsServicesInfo {
  hasAutismFriendlyHours?: boolean;
  sensoryFriendlyEnvironment?: boolean;
  quietZonesAvailable?: boolean;
  staffTrainedInSpecialNeeds?: boolean;
  wheelchairAccessibilityBeyondBasic?: boolean;
  visuallyImpairedSupport?: boolean;
  hearingImpairedSupport?: boolean;
  developmentalDelayServices?: boolean;
  specialNeedsSchedule?: string;
  specialNeedsNotes?: string;
}

export interface FirstAidAndMedicalInfo {
  hasAED?: boolean;
  aedLocation?: string;
  hasFirstAidKit?: boolean;
  hasStaffFirstAidTraining?: boolean;
  hasMedicalStaff?: boolean;
  nearbyHospital?: string;
  hospitalDistance?: number;
  emergencyContactNumbers?: string[];
  incidentResponseCapability?: 'comprehensive' | 'standard' | 'basic';
  medicalNotes?: string;
}

export interface EntertainmentScheduleInfo {
  hasPerformances?: boolean;
  performanceTypes?: string[];
  performanceSchedule?: string;
  hasWeeklyShows?: boolean;
  showDuration?: string;
  minAgeForShow?: number;
  maxAgeForShow?: number;
  performanceContent?: string;
  requiresAdvanceBooking?: boolean;
  hasInteractiveActivities?: boolean;
  performanceLanguage?: string[];
  performanceLocation?: string;
  seasonalPerformances?: string;
  entertainmentNotes?: string;
}

export interface PhotoVideoPolicy {
  allowsPhotography?: boolean;
  allowsVideoRecording?: boolean;
  photographyRestrictions?: string;
  videoRecordingRestrictions?: string;
  flashPhotographyAllowed?: boolean;
  tripodAllowed?: boolean;
  commercialPhotographyAllowed?: boolean;
  photoVideoNotes?: string;
}

export interface VisitDurationRecommendation {
  recommendedDurationMinutes?: number;
  recommendedDurationText?: string;
  quickVisitMinutes?: number;
  fullExperienceDurationMinutes?: number;
  mustSeeActivityDurationMinutes?: number;
  includesMealTimeRecommendation?: boolean;
  mealTimeSuggestion?: string;
  restTimeRecommendation?: boolean;
  bestTimeToVisit?: string;
  durationNotes?: string;
}

export interface TaiwanSchoolHolidayInfo {
  winterVacationDates?: string;
  summerVacationDates?: string;
  midAutumnFestival?: string;
  lunarNewYearDates?: string;
  dragonBoatFestivalDate?: string;
  doubleNinthFestivalDate?: string;
  weeklyHolidaysInfo?: string;
  winterVacationCrowding?: 'light' | 'moderate' | 'heavy';
  summerVacationCrowding?: 'light' | 'moderate' | 'heavy';
  lunarNewYearCrowding?: 'light' | 'moderate' | 'heavy';
  holidaySpecialEventsOrHours?: string;
  holidayBookingRecommendation?: string;
  holidayNotes?: string;
}

export interface HeightBasedPricingInfo {
  hasHeightBasedPricing?: boolean;
  childHeightThreshold?: number;
  childPrice?: string;
  adultHeight?: number;
  freeHeightThreshold?: number;
  heightMeasurementLocation?: string;
  pricingNotes?: string;
}

export interface DrinkingWaterInfo {
  hasDrinkingWater?: boolean;
  drinkingWaterSources?: string[];
  waterFountainQuantity?: number;
  waterQuality?: 'excellent' | 'good' | 'fair';
  isWaterChilled?: boolean;
  hasRefillableBottleStations?: boolean;
  waterTemperature?: string;
  waterAccessibilityNotes?: string;
}

export interface DiaperChangingFacilitiesInfo {
  hasDiaperChangingTables?: boolean;
  changingTableQuantity?: number;
  changingTableLocations?: string[];
  hasDiaperDisposal?: boolean;
  hasRunningWater?: boolean;
  hasHandSanitizer?: boolean;
  cleanlinessRating?: number;
  isParentSupervisionVisiblity?: boolean;
  hasPrivacyScreen?: boolean;
  hasMaps?: boolean;
  changingFacilitiesNotes?: string;
}

export interface EquipmentRentalInfo {
  hasEquipmentRental?: boolean; // Does venue offer any equipment rentals?
  bikeRental?: boolean; // 腳踏車出租
  scooterRental?: boolean; // 滑板車/踏板車出租
  helmetRental?: boolean; // 安全帽出租
  sunProtectionGearRental?: boolean; // 防曬帽、防曬衣出租
  rainGearRental?: boolean; // 雨具出租
  wheelchairRental?: boolean; // 輪椅出租 (for accessibility)
  strollerRental?: boolean; // Already covered in StrollerInfo, but for reference
  floatationDeviceRental?: boolean; // 浮力衣、浮圈出租 (for water venues)
  coolerBoxRental?: boolean; // 冰箱/保冷箱出租
  lifejacketRental?: boolean; // 救生衣出租 (for water venues)
  rentalAvailabilityNotes?: string; // e.g., "All rentals available at entrance, advance booking recommended for weekends"
  rentalPriceRange?: string; // e.g., "NT$50-200 per item"
  rentalQualityNotes?: string; // e.g., "Equipment well-maintained, cleaned daily"
  equipmentRentalNotes?: string; // Complete equipment rental information
}

export interface MembershipPassInfo {
  hasMembership?: boolean; // Does venue offer membership programs?
  annualPassAvailable?: boolean; // 年卡
  seasonalPassAvailable?: boolean; // 季卡
  discountCardAvailable?: boolean; // 折扣卡/會員卡
  membershipCost?: string; // e.g., "NT$2,000 per year"
  seasonalPassCost?: string; // e.g., "NT$1,500 for 3 months"
  discountCardCost?: string; // e.g., "Free with 10-visit card"
  membershipBenefits?: string[]; // e.g., ["20% discount on entry", "Free parking", "Priority booking"]
  visitsIncludedInPass?: string; // e.g., "Unlimited visits"
  groupMembershipAvailable?: boolean; // Family memberships
  paymentMethods?: string[]; // How to purchase membership
  membershipNotes?: string; // Complete membership information
}

export interface OnSiteDiningInfo {
  hasFoodCourt?: boolean; // 美食廣場
  hasCafe?: boolean; // 咖啡館
  hasRestaurant?: boolean; // 餐廳
  hasSnackBar?: boolean; // 小食亭
  foodQualityRating?: number; // 1-5 stars
  foodPriceRange?: string; // e.g., "NT$50-300"
  vegetarianOptionsAvailable?: boolean; // 素食選項
  veganOptionsAvailable?: boolean; // 純素選項
  glutenFreeOptionsAvailable?: boolean; // 無麩質選項
  halalFoodAvailable?: boolean; // 清真食物
  hasHighchair?: boolean; // If dining area has high chairs (already in HighChairInfo but mentioning here)
  hasWarmingFacilities?: boolean; // 溫奶器 (for baby food/formula)
  diningOptionsDescription?: string; // e.g., "Multiple food stalls with Asian and Western options"
  diningSeatingDescription?: string; // e.g., "Indoor seating area with 50 seats, family-friendly"
  diningHours?: string; // Operating hours if different from venue hours
  diningNotes?: string; // Complete dining information
}

export interface QueueWaitTimeInfo {
  typicalWaitTimeMinutes?: number; // Typical wait time in minutes during normal hours
  peakHourWaitTimeMinutes?: number; // Wait time during peak hours (weekends/holidays)
  offPeakWaitTimeMinutes?: number; // Wait time during quiet periods
  seasonalWaitTimeNote?: string; // e.g., "Winter vacations (Jan-Feb) very busy, summer weekends extremely crowded"
  holidayWaitTimeMinutes?: number; // Expected wait during major holidays (CNY, summer break)
  fastPassAvailable?: boolean; // Skip-the-line pass available?
  fastPassPrice?: string; // Cost of fast pass
  reservationSystemAvailable?: boolean; // Can you book a time slot in advance?
  estimatedWaitNotes?: string; // e.g., "10-20 min typical, 1-2 hours on weekends, fast passes available NT$500"
  peakDaysOfWeek?: string; // e.g., "Saturday/Sunday 2-6pm very busy"
  quietTimesRecommendation?: string; // e.g., "Weekday mornings 9-11am, rainy days"
  queueWaitTimeNotes?: string; // Complete wait time information
}

export interface InfantSpecificInfo {
  suitableForNewborns?: boolean; // 0-3 months old
  hasDarkQuietSpaces?: boolean; // For nursing/sleeping newborns (黑暗安靜空間)
  temperatureControlledNursingAreas?: boolean; // Climate-controlled nursing spaces
  hasChangeTableAvailability?: number; // Number of changing tables dedicated for infants
  minimalLoudNoiseAreas?: boolean; // Quiet zones away from loud activities
  infantCarriageSpaceAvailable?: boolean; // Can carry infant car seats/carriers inside?
  hasInfantSpecificRestRooms?: boolean; // Dedicated quiet rooms for infant rest/sleep
  recommendedVisitDurationForInfants?: string; // e.g., "Maximum 2 hours with infant under 3 months"
  infantCaregiversAvailable?: boolean; // Staff trained in infant care?
  mommyFrienlyEnvironment?: boolean; // Overall infant-friendly atmosphere
  infantSpecificNotes?: string; // e.g., "Quiet nursing area with dimmed lights, changing tables available, minimal crowds before 10am recommended for infants"
}

export interface StorageLockerInfo {
  hasLockers?: boolean; // Lockers or storage available
  lockerQuantity?: number; // Number of lockers
  lockerSize?: string; // e.g., "small", "medium", "large", or specific dimensions
  lockerCost?: string; // Cost per use or rental period (e.g., "Free", "NT$20 for 4 hours")
  coinOrCardRequired?: boolean; // Does locker require coin/card?
  hasLargeStorage?: boolean; // Larger storage for strollers, bags (like coat check)
  storageAttendantAvailable?: boolean; // Staff-attended storage area?
  storageSecurity?: 'excellent' | 'good' | 'fair' | 'basic'; // Security rating for stored items
  storageNotes?: string; // e.g., "Coin lockers (NT$20-50) throughout park, large bag storage at entrance, attended coat check available"
  luggage?: boolean; // Can store suitcases?
  storageHours?: string; // Hours available (may differ from venue hours)
  lockerAccessibility?: boolean; // Accessible locker sizes available?
}

export interface ChildAgeCombinationSuitabilityInfo {
  hasActivitiesForMultipleAges?: boolean;
  bestAgeCombination?: string;
  toddlerActivitiesAvailable?: boolean;
  preschoolActivitiesAvailable?: boolean;
  schoolAgeActivitiesAvailable?: boolean;
  teenActivitiesAvailable?: boolean;
  simultaneousActivityOptions?: boolean;
  ageGroupSeparationNeeded?: string;
  siblingFriendlinessRating?: 'excellent' | 'good' | 'fair' | 'challenging';
  recommendedGroupSizes?: string;
  ageCompatibilityNotes?: string;
}

export interface ComprehensiveVisitCostInfo {
  entryFeePerAdult?: string;
  entryFeePerChild?: string;
  entryFeePerToddler?: string;
  familyPackagePrice?: string;
  familyPackageIncludes?: string;
  estimatedFoodCostPerFamily?: string;
  parkingCostForDay?: string;
  rentalsCostEstimate?: string;
  extraActivitiesCostEstimate?: string;
  totalEstimatedCostPerFamily?: string;
  discountedPackages?: string[];
  paymentFlexibility?: string;
  costSavingTips?: string;
  budgetWarning?: string;
  visitCostNotes?: string;
}

export interface HealthDocumentationRequirementsInfo {
  requiresCOVIDVaccination?: boolean;
  vaccineProofRequired?: string;
  vaccineBoosterRequired?: boolean;
  requiresCovidTestOnArrival?: boolean;
  requiresHealthCertificate?: boolean;
  otherHealthCertificatesRequired?: string[];
  requiresTemperatureCheck?: string;
  healthInsuranceRequired?: boolean;
  childrenSpecificRequirements?: string;
  exemptionCategories?: string;
  enforcementLevel?: 'strict' | 'moderate' | 'flexible' | 'none';
  documentationNotes?: string;
  healthRequirementNotes?: string;
}

export interface PlaygroundEquipmentAndActivityInfo {
  hasPlayground?: boolean;
  playgroundTypes?: string[];
  playgroundEquipment?: string[];
  toddlerPlaygroundAvailable?: boolean;
  preschoolPlayEquipment?: string[];
  schoolAgePlayEquipment?: string[];
  teenActivityOptions?: string[];
  activitiesByAgeGroup?: string;
  seasonalActivityAvailability?: string;
  playgroundSafetyRating?: number;
  equipmentMaintenanceFrequency?: string;
  equipmentAgeAndCondition?: string;
  costForActivities?: string;
  suggestedDurationPerActivityType?: string;
  outdoorVsIndoorActivities?: string;
  playgroundAndActivityNotes?: string;
}

export interface NavigationFromTransitInfo {
  hasPublicTransitAccess?: boolean;
  mrtDirections?: {
    station: string;
    distance: number;
    walkingTimeMinutes?: number;
    directions?: string;
    exitNumber?: string;
    elevatorAvailable?: boolean;
  };
  busDirections?: {
    busLines?: string[];
    stopName?: string;
    walkingTimeMinutes?: number;
    directions?: string;
    frequency?: string;
  };
  cyclingDirections?: {
    bikeAccessible?: boolean;
    bikeStorageAvailable?: boolean;
    directions?: string;
    estimatedCyclingTimeMinutes?: number;
  };
  driversLicenseAccess?: {
    drivingTimeFromCityCenter?: number;
    parkingEntrance?: string;
    gpsCoordinates?: { lat: number; lng: number };
    accessRoadType?: string;
  };
  accessibleTransportOptions?: {
    wheelchairAccessibleMRT?: boolean;
    elevatorAtStation?: boolean;
    accessibleBusAvailable?: boolean;
  };
  entranceLocation?: {
    mainEntranceName?: string;
    alternateEntrances?: string[];
    closestEntranceFromTransit?: string;
    disabledAccessEntrance?: string;
  };
  navigationNotes?: string;
}

export interface PhotographySpotsAndServicesInfo {
  bestPhotoSpots?: {
    spotName: string;
    description: string;
    bestTimeOfDay?: string;
    ageAppropriate?: string;
    photoTip?: string;
  }[];
  photoBooth?: {
    available: boolean;
    locations?: string[];
    price?: string;
    instantPrints?: boolean;
    digitalCopies?: boolean;
  };
  professionalPhotoServices?: {
    available: boolean;
    types?: string[];
    booking?: string;
    pricing?: string;
    turnaroundTime?: string;
  };
  scenicLocations?: string[];
  allowedEquipment?: string[];
  photoStorageSpots?: {
    hasCloud?: boolean;
    hasUSBServices?: boolean;
  };
  photographyNotes?: string;
}

export interface KidsClassesAndWorkshopsInfo {
  hasClasses?: boolean;
  musicClasses?: {
    available: boolean;
    types?: string[];
    ageGroup?: string;
    schedule?: string;
    duration?: string;
    pricing?: string;
    instructorQualifications?: string;
  };
  artClasses?: {
    available: boolean;
    types?: string[];
    ageGroup?: string;
    schedule?: string;
    duration?: string;
    pricing?: string;
    materialsIncluded?: boolean;
  };
  sportClasses?: {
    available: boolean;
    types?: string[];
    ageGroup?: string;
    schedule?: string;
    duration?: string;
    pricing?: string;
    instructorQualifications?: string;
  };
  academicClasses?: {
    available: boolean;
    types?: string[];
    ageGroup?: string;
    schedule?: string;
    duration?: string;
    pricing?: string;
  };
  languageClasses?: {
    available: boolean;
    languages?: string[];
    ageGroup?: string;
    schedule?: string;
    duration?: string;
    pricing?: string;
  };
  parentChildClasses?: {
    available: boolean;
    types?: string[];
    ageGroup?: string;
    schedule?: string;
    duration?: string;
    pricing?: string;
  };
  summitCamps?: {
    available: boolean;
    types?: string[];
    ageGroup?: string;
    seasonalAvailability?: string;
    duration?: string;
    pricing?: string;
    mealIncluded?: boolean;
  };
  workshopsAndEvents?: {
    available: boolean;
    types?: string[];
    schedule?: string;
    ageGroup?: string;
    duration?: string;
    pricing?: string;
    advanceBookingRequired?: boolean;
  };
  specialNeedsClasses?: {
    available: boolean;
    types?: string[];
    ageGroup?: string;
    schedule?: string;
    supportLevel?: string;
  };
  bookingMethod?: string;
  classesWebsite?: string;
  classesPhoneNumber?: string;
  classesNotes?: string;
}

export interface WeatherAndSunSafetyInfo {
  hasOutdoorExposure?: boolean;
  uvRiskLevel?: 'extreme' | 'very high' | 'high' | 'moderate' | 'low';
  peakUVMonth?: string[];
  recommendedSunProtection?: string[];
  sunExposureRisk?: string;
  shadeAvailability?: 'abundant' | 'moderate' | 'limited' | 'minimal';
  umbrellaAllowed?: boolean;
  sunriseToSunsetTiming?: string;
  bestSafeTimeToVisit?: string;
  heatStressRisk?: string;
  mosquitoSeasonInfo?: string;
  sunburnWarning?: boolean;
  photosensitivityRisk?: boolean;
  recommendedClothing?: string[];
  sunscreenRecommendation?: string;
  indoorAlternativesAvailable?: boolean;
  weatherProtectionNotes?: string;
}

export interface WalkingDistanceAndDifficultyInfo {
  totalWalkingDistance?: number;
  mainAttractionsAccessibility?: string;
  strollerWalking?: {
    isStrollerFriendly?: boolean;
    difficultSections?: string;
    flatPathPercentage?: number;
    maxSlopePercentage?: number;
  };
  carryingSmallChildrenDifficulty?: 'easy' | 'moderate' | 'challenging';
  ageGroupPhysicalDemands?: {
    toddlers?: string;
    preschool?: string;
    schoolAge?: string;
  };
  restAreaFrequency?: string;
  benchesToAmenitiesRatio?: string;
  timeToMainAttraction?: number;
  roundTripWalkingTime?: number;
  walkingDifficultyNotes?: string;
}

export interface NoiseAndSensoryEnvironmentInfo {
  overallNoiseLevel?: 'very_quiet' | 'quiet' | 'moderate' | 'loud' | 'very_loud';
  noiseSourcesDescription?: string;
  peakNoiseHours?: string;
  quietestHours?: string;
  soundMitigation?: string[];
  hasSoundproofing?: boolean;
  quietZonesAvailable?: boolean;
  quietZoneDescription?: string;
  sensoryFriendlyHours?: string;
  sensoryAccommodations?: string[];
  vibrationalActivities?: string;
  lightingSituation?: 'very_bright' | 'bright' | 'moderate' | 'dim' | 'mixed';
  hasAdjustableLighting?: boolean;
  scents?: string;
  hasScent_freePolicies?: boolean;
  echoProblems?: boolean;
  staffSensoryAwareness?: 'comprehensive' | 'trained' | 'basic' | 'minimal';
  sensoryEnvironmentNotes?: string;
}

export interface InsectAndAllergenEnvironmentInfo {
  mosquitoRisk?: 'none' | 'low' | 'moderate' | 'high' | 'very_high';
  mosquitoSeasons?: string[];
  peakMosquitoMonths?: string;
  beeAndWaspRisk?: 'none' | 'low' | 'moderate' | 'high';
  beeWaspSeasons?: string;
  spiderPresence?: 'none' | 'minimal' | 'moderate' | 'common';
  otherInsectsInfo?: string;
  pollenLevels?: 'low' | 'moderate' | 'high' | 'very_high';
  allergenicPlants?: string[];
  peakPollenMonths?: string;
  insectRepellentAvailable?: boolean;
  mosquitoNetAvailable?: boolean;
  hasScreensOrBarriers?: boolean;
  indoorVsOutdoorInsectRisk?: string;
  insectPreventionMeasures?: string[];
  staffAlertnessToInsects?: boolean;
  bestTimeToAvoidInsects?: string;
  insectAllergenNotes?: string;
}

export interface RainyDayAlternativesAndIndoorActivitiesInfo {
  isFullyIndoor?: boolean; // Venue entirely indoors
  hasIndoorAlternatives?: boolean; // Alternative indoor activities when outdoor is unavailable
  indoorActivitiesDescription?: string; // What indoor activities are available
  indoorActivityTypes?: string[]; // e.g., ["arcade games", "play equipment", "cinema", "dining"]
  ageAppropriateIndoorActivities?: {
    toddlers?: string[];
    preschool?: string[];
    schoolAge?: string[];
    teens?: string[];
  };
  rainyCoveragePercentage?: number; // 0-100% of venue covered
  weatherProtectionDetails?: string; // e.g., "Mostly covered except main play area, indoor backup available"
  typhoonSeasonClosurePolicy?: string; // Closure during typhoons (July-September risk)
  typhoonClosure?: boolean; // Venue closes during typhoon warnings
  typhoonSafetyPlan?: string; // What happens during typhoons
  indoorClimateControl?: boolean; // AC/heating for comfort
  hasMultipleLevels?: boolean; // Multi-level indoor space
  rainyDayActivitiesNotLimited?: boolean; // Full activities available on rainy days
  wouldNotRecommendRainyDay?: boolean; // Venue not suitable for rainy days
  rainyDayAlternativeVenuesNearby?: string[]; // Similar venues nearby for rainy days
  bestWeatherConditions?: string; // e.g., "Best on sunny days, indoor areas good for rain"
  seasonalWeatherImpact?: string; // How seasons affect visitability
  rainySeasonNotes?: string; // Taiwan rainy season (May-September) specific notes
  rainyDayNotes?: string; // Complete rainy day/weather alternatives information
}

export interface RideAgeHeightRestrictionInfo {
  hasRideRestrictions?: boolean; // Does venue have rides with age/height restrictions?
  ridesRequiringRestrictions?: {
    rideName: string; // e.g., "Roller Coaster", "Water Slide"
    minimumAge?: number; // Minimum age in years
    minimumHeight?: number; // Minimum height in cm
    maximumAge?: number; // Maximum age (rare, but some rides not suitable for very old visitors)
    maxHeight?: number; // Maximum height in cm (rare, for safety)
    accompaniedByAdultRequired?: boolean; // Child must be with adult?
    adultHeightRequired?: number; // Adult must be certain height?
    restrictionReason?: string; // e.g., "Safety reason: child must be tall enough to reach safety bar"
    safetyEquipmentRequired?: string[]; // e.g., ["safety harness", "life jacket"]
  }[];
  allRidesAgeRange?: string; // e.g., "Most rides 100cm-180cm"
  toddlerRideOptions?: string[]; // Rides suitable for toddlers without restrictions
  preschoolRideOptions?: string[]; // Rides for preschool kids
  schoolAgeRideOptions?: string[]; // Rides for school-age kids
  teenAdvancedRideOptions?: string[]; // Advanced/extreme rides for teens
  restrictionMeasurementMethod?: string; // e.g., "Height measured at entrance with shoe off"
  heightStickersProvided?: boolean; // Staff use height stickers to indicate eligible rides?
  hasWristbandSystem?: boolean; // Wristband indicating age/height category?
  heightMeasurementAccuracy?: string; // e.g., "Measured to nearest cm"
  safetyInspectionFrequency?: string; // e.g., "Daily safety checks on all rides"
  safetyStaffTrainingLevel?: string; // e.g., "Certified amusement park safety officers"
  needsToMeasureOnDay?: boolean; // Height changes day-to-day or can use prior measurement?
  exceptionPolicies?: string; // e.g., "Children 2cm below minimum may ride with parent waiver"
  restrictionEnforcementLevel?: 'strict' | 'moderate' | 'flexible'; // How strictly enforced
  rideRestrictionNotes?: string; // Complete age/height restrictions information for families
}

export interface AirQualityAndPollutionInfo {
  affectsOutdoorActivities?: boolean; // Does air quality significantly impact outdoor visits?
  aqiMonitoringAvailable?: boolean; // Is real-time AQI data available at venue?
  typicalAQIRange?: string; // e.g., "20-50 (Good)" or "50-100 (Moderate)"
  poorAQIWarningThreshold?: number; // AQI level when outdoor activities not recommended
  seasonalAQIPatterns?: string; // e.g., "Winter (Nov-Mar) PM2.5 pollution from China, summer relatively clean"
  peakPollutionMonths?: string[]; // e.g., ["November", "December", "January", "February", "March"]
  peakPollutionTimeOfDay?: string; // e.g., "Morning 6-9am and evening 5-9pm typically highest"
  indoorOutdoorAQIDifference?: string; // e.g., "Indoor areas have air filtering; outdoor 40% more polluted in winter"
  airPurificationSystem?: boolean; // Indoor areas have air purification/filtration?
  indoorAirQualityRating?: 'excellent' | 'good' | 'fair' | 'poor'; // Indoor air quality assessment
  respiratorySensitivityWarning?: boolean; // Warning for children with asthma/respiratory issues?
  recommendedVisitTiming?: string; // e.g., "Visit summer/early fall for best air quality; avoid peak pollution hours in winter"
  outdoorActivityRecommendations?: string; // e.g., "Outdoor play limited in winter; recommend indoor alternatives on bad air days"
  childrenWithAsthmaConsiderations?: string; // e.g., "Bring inhalers, avoid peak pollution months, monitor AQI before visiting"
  maskRecommendationMonths?: string[]; // Months when masks recommended for outdoor activities
  aqiDataSource?: string; // e.g., "Taiwan EPA AQI Real-time Data" or "Indoor monitors"
  pollutantInformation?: {
    pm25Risk?: 'none' | 'low' | 'moderate' | 'high' | 'very_high'; // PM2.5 (fine particulate matter)
    o3Risk?: 'none' | 'low' | 'moderate' | 'high'; // Ozone risk
    noRisk?: 'none' | 'low' | 'moderate' | 'high'; // Nitrogen oxide
  };
  airQualityAccessibility?: string; // e.g., "AQI display at entrance, published daily online, text alerts available"
  airQualityNotes?: string; // Complete air quality and pollution information for Taiwan families
}

export interface Location {
  id: string;
  name: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  category: Category;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: {
    zh: string;
    en: string;
  };
  facilities: string[];
  averageRating: number;
  photoUrl?: string;
  operatingHours?: OperatingHours;
  ageRange?: AgeRange;
  pricing?: PricingInfo;
  phoneNumber?: string;
  publicTransit?: PublicTransitInfo;
  parking?: ParkingInfo;
  toilet?: ToiletInfo;
  hasWiFi?: boolean;
  allergens?: AllergenInfo;
  crowding?: CrowdingInfo;
  nursingAmenities?: NursingAmenitiesInfo;
  weatherCoverage?: WeatherCoverageInfo;
  nearbyAmenities?: NearbyAmenitiesInfo;
  accessibility?: AccessibilityInfo;
  activity?: ActivityInfo;
  safety?: SafetyInfo;
  qualityMetrics?: QualityMetricsInfo;
  booking?: BookingInfo;
  seasonal?: SeasonalInfo;
  payment?: PaymentInfo;
  outsideFood?: OutsideFoodPolicy;
  stroller?: StrollerInfo;
  reservedTimes?: ReservedTimesInfo;
  nursingRoom?: NursingRoomDetails;
  petPolicy?: PetPolicy;
  climateComfort?: ClimateComfortInfo;
  sanitationProtocols?: SanitationProtocolsInfo;
  staffLanguage?: StaffLanguageInfo;
  waterSafety?: WaterSafetyInfo;
  highChair?: HighChairInfo;
  ageSpecificBathroom?: AgeSpecificBathroomInfo;
  lostChildProtocol?: LostChildProtocolInfo;
  parentRestArea?: ParentRestAreaInfo;
  eventSpace?: EventSpaceInfo;
  specialNeeds?: SpecialNeedsServicesInfo;
  medicalServices?: FirstAidAndMedicalInfo;
  entertainmentSchedule?: EntertainmentScheduleInfo;
  photoVideo?: PhotoVideoPolicy;
  visitDuration?: VisitDurationRecommendation;
  schoolHolidays?: TaiwanSchoolHolidayInfo;
  heightBasedPricing?: HeightBasedPricingInfo;
  drinkingWater?: DrinkingWaterInfo;
  diaperChanging?: DiaperChangingFacilitiesInfo;
  equipmentRental?: EquipmentRentalInfo;
  membership?: MembershipPassInfo;
  onSiteDining?: OnSiteDiningInfo;
  queueWaitTime?: QueueWaitTimeInfo;
  infantSpecific?: InfantSpecificInfo;
  storageLocker?: StorageLockerInfo;
  childAgeCompatibility?: ChildAgeCombinationSuitabilityInfo;
  visitCost?: ComprehensiveVisitCostInfo;
  healthDocumentation?: HealthDocumentationRequirementsInfo;
  playgroundAndActivity?: PlaygroundEquipmentAndActivityInfo;
  navigationFromTransit?: NavigationFromTransitInfo;
  photographySpotsAndServices?: PhotographySpotsAndServicesInfo;
  kidsClassesAndWorkshops?: KidsClassesAndWorkshopsInfo;
  weatherAndSunSafety?: WeatherAndSunSafetyInfo;
  walkingDistanceAndDifficulty?: WalkingDistanceAndDifficultyInfo;
  noiseAndSensoryEnvironment?: NoiseAndSensoryEnvironmentInfo;
  insectAndAllergenEnvironment?: InsectAndAllergenEnvironmentInfo;
  rainyDayAlternatives?: RainyDayAlternativesAndIndoorActivitiesInfo;
  rideRestrictions?: RideAgeHeightRestrictionInfo;
  airQuality?: AirQualityAndPollutionInfo;
  events?: Event[];
}

export interface Review {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewCreateDTO {
  rating: number;
  comment: string;
  userName?: string;
}

export interface CrowdednessReport {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  crowdingLevel: 'light' | 'moderate' | 'heavy'; // current real-time crowding
  comment?: string;
  createdAt: string;
}

export interface CrowdednessReportCreateDTO {
  crowdingLevel: 'light' | 'moderate' | 'heavy';
  comment?: string;
  userName?: string;
}

export interface SearchParams {
  lat: number;
  lng: number;
  radius: number;
  category?: Category;
  stroller_accessible?: boolean;
  limit?: number;
}

export interface LocationCreateDTO {
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  category: Category;
  coordinates: { lat: number; lng: number };
  address: { zh: string; en: string };
  facilities: string[];
  operatingHours?: OperatingHours;
  ageRange?: AgeRange;
  pricing?: PricingInfo;
  phoneNumber?: string;
  publicTransit?: PublicTransitInfo;
  parking?: ParkingInfo;
  toilet?: ToiletInfo;
  hasWiFi?: boolean;
  allergens?: AllergenInfo;
  crowding?: CrowdingInfo;
  nursingAmenities?: NursingAmenitiesInfo;
  weatherCoverage?: WeatherCoverageInfo;
  nearbyAmenities?: NearbyAmenitiesInfo;
  accessibility?: AccessibilityInfo;
  activity?: ActivityInfo;
  safety?: SafetyInfo;
  qualityMetrics?: QualityMetricsInfo;
  booking?: BookingInfo;
  seasonal?: SeasonalInfo;
  payment?: PaymentInfo;
  outsideFood?: OutsideFoodPolicy;
  stroller?: StrollerInfo;
  reservedTimes?: ReservedTimesInfo;
  nursingRoom?: NursingRoomDetails;
  petPolicy?: PetPolicy;
  climateComfort?: ClimateComfortInfo;
  sanitationProtocols?: SanitationProtocolsInfo;
  staffLanguage?: StaffLanguageInfo;
  waterSafety?: WaterSafetyInfo;
  highChair?: HighChairInfo;
  ageSpecificBathroom?: AgeSpecificBathroomInfo;
  lostChildProtocol?: LostChildProtocolInfo;
  parentRestArea?: ParentRestAreaInfo;
  eventSpace?: EventSpaceInfo;
  specialNeeds?: SpecialNeedsServicesInfo;
  medicalServices?: FirstAidAndMedicalInfo;
  entertainmentSchedule?: EntertainmentScheduleInfo;
  photoVideo?: PhotoVideoPolicy;
  visitDuration?: VisitDurationRecommendation;
  schoolHolidays?: TaiwanSchoolHolidayInfo;
  heightBasedPricing?: HeightBasedPricingInfo;
  drinkingWater?: DrinkingWaterInfo;
  diaperChanging?: DiaperChangingFacilitiesInfo;
  equipmentRental?: EquipmentRentalInfo;
  membership?: MembershipPassInfo;
  onSiteDining?: OnSiteDiningInfo;
  queueWaitTime?: QueueWaitTimeInfo;
  infantSpecific?: InfantSpecificInfo;
  storageLocker?: StorageLockerInfo;
  childAgeCompatibility?: ChildAgeCombinationSuitabilityInfo;
  visitCost?: ComprehensiveVisitCostInfo;
  healthDocumentation?: HealthDocumentationRequirementsInfo;
  playgroundAndActivity?: PlaygroundEquipmentAndActivityInfo;
  navigationFromTransit?: NavigationFromTransitInfo;
  photographySpotsAndServices?: PhotographySpotsAndServicesInfo;
  kidsClassesAndWorkshops?: KidsClassesAndWorkshopsInfo;
  weatherAndSunSafety?: WeatherAndSunSafetyInfo;
  walkingDistanceAndDifficulty?: WalkingDistanceAndDifficultyInfo;
  noiseAndSensoryEnvironment?: NoiseAndSensoryEnvironmentInfo;
  insectAndAllergenEnvironment?: InsectAndAllergenEnvironmentInfo;
  rainyDayAlternatives?: RainyDayAlternativesAndIndoorActivitiesInfo;
  rideRestrictions?: RideAgeHeightRestrictionInfo;
  airQuality?: AirQualityAndPollutionInfo;
}

export type EventType = 'birthday_party' | 'class' | 'workshop' | 'performance' | 'activity' | 'other';

export interface Event {
  id: string;
  locationId: string;
  title: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  eventType: EventType;
  startDate: string; // ISO format
  endDate: string;   // ISO format
  ageRange?: AgeRange;
  capacity?: number;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreateDTO {
  title: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  eventType: EventType;
  startDate: string;
  endDate: string;
  ageRange?: AgeRange;
  capacity?: number;
  price?: number;
}

export interface Favorite {
  id: string;
  userId: string;
  locationId: string;
  createdAt: string;
}

export interface ActivityHistoryEntry {
  id: string;
  userId: string;
  locationId: string;
  location?: Location;
  category: string;
  visitDate: string; // ISO format
  duration: number; // in minutes
  cost: number;
  familySize: number;
  childAge?: number; // primary child's age
  crowdingLevel?: number; // 1-5 scale
  satisfactionRating: number; // 1-5 scale
  notes?: string;
  photos?: string[];
  childrenBehavior?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySuggestion {
  dayOfWeek: string;
  suggestedLocation: Location;
  recommendedTimeOfDay: 'morning' | 'afternoon' | 'evening';
  confidence: number; // 0-1
  score: number; // 0-100
}

export type Language = 'zh' | 'en';

/**
 * Family Community & Discovery System Types
 */

export interface FamilyProfile {
  id: string;
  userId?: string;
  familyName?: string;
  displayName?: string;
  childrenAges: number[];
  childrenCount: number;
  interests: string[];
  visitFrequency: 'weekly' | 'biweekly' | 'monthly' | 'occasional';
  budget: 'budget_conscious' | 'moderate' | 'flexible';
  monthlyBudget?: number;
  specialNeeds?: string[];
  preferredLocations?: string[];
  groupSize: 'solo' | 'couple' | 'extended_family';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyCompatibilityScore {
  familyProfileId: string;
  otherFamilyProfileId: string;
  compatibilityScore: number;
  matchReasons: string[];
  commonInterests: string[];
  sharedLocations: string[];
  potentialGroupActivities: string[];
}

export interface FamilyCommunityExperience {
  id: string;
  familyId: string;
  locationId: string;
  title: string;
  description: string;
  rating: number;
  childAgesAtVisit: number[];
  visitDate: string;
  photos?: string[];
  likes: number;
  comments: FamilyCommunityComment[];
  visibility: 'public' | 'friends_only' | 'anonymous';
  createdAt: string;
  updatedAt: string;
}

export interface FamilyCommunityComment {
  id: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: string;
}

export interface GroupOutingProposal {
  id: string;
  creatorFamilyId: string;
  locationId: string;
  proposedDate: string;
  proposedTime: string;
  maxFamilies: number;
  currentMembers: string[];
  interests: string[];
  ageRangeTarget: AgeRange;
  description: string;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface FamilyDiscoveryRecommendation {
  recommendationType: 'compatible_families' | 'group_outing' | 'similar_interests' | 'trending_location';
  targetFamilyId?: string;
  targetLocationId?: string;
  targetGroupOutingId?: string;
  reason: string;
  confidence: number;
  action?: string;
}


export interface PaginatedLocationsResponse {
  items: Location[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}
