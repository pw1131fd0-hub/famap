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
}

export interface Favorite {
  id: string;
  userId: string;
  locationId: string;
  createdAt: string;
}

export type Language = 'zh' | 'en';
