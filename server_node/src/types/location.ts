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
  hasAirConditioning?: boolean; // Indoor air conditioning (冷氣)
  hasHeating?: boolean; // Winter heating
  hasShadedAreas?: boolean; // Outdoor shade structures or trees
  indoorAreaPercentage?: number; // 0-100% of venue that is indoors
  summerHeatMitigation?: string; // e.g., "Water misting stations, frequent water breaks, shaded play zones"
  winterColdProtection?: string; // e.g., "Heated indoor areas, shelter from wind"
  hasWaterStations?: boolean; // Drinking water available
  hasRestAreas?: boolean; // Cool rest areas for tired families
  climateNotes?: string; // e.g., "Outdoor playground surfaces: natural grass and shade trees, ground stays cool; indoor area fully AC'd"
}

export interface SanitationProtocolsInfo {
  cleaningFrequency?: string; // e.g., "Hourly high-touch surface disinfection, daily deep clean"
  disinfectionMethods?: string[]; // e.g., ["electrostatic spray", "EPA-approved disinfectant", "HEPA air filtration"]
  airQualityRating?: 'excellent' | 'good' | 'fair' | 'needs_improvement'; // Ventilation & air quality assessment
  hasAirFilters?: boolean; // HEPA or similar air filtration system
  hasFrequentHandWashingStations?: boolean; // Accessible hand-washing for kids
  toySanitizationFrequency?: string; // e.g., "Toys sanitized after each use, daily deep clean"
  highTouchSurfaceDisinfection?: boolean; // Doorknobs, railings, etc.
  lastInspectionDate?: string; // ISO date of last health/sanitation inspection
  sanitationNotes?: string; // e.g., "Meet Taiwan CDC hygiene standards, HEPA filters changed quarterly"
}

export interface StaffLanguageInfo {
  englishStaffAvailable?: boolean; // At least one English-speaking staff member
  languagesSpoken?: string[]; // e.g., ["Mandarin", "English", "Vietnamese"]
  hasTranslationServices?: boolean; // Translation app or services available
  multilingualSignage?: boolean; // Signs in multiple languages
  staffTrainingLevel?: 'certified' | 'trained' | 'basic' | 'minimal'; // Language proficiency certification
  languageSupportNotes?: string; // e.g., "English-speaking staff available daily 10am-6pm, WeChat translation available 24/7"
}

export interface WaterSafetyInfo {
  hasWaterActivities?: boolean; // Pools, water park, beach, etc.
  lifeguardAvailable?: boolean; // Lifeguard supervision
  lifeguardRatio?: string; // e.g., "1 lifeguard per 100 swimmers"
  waterQualityTesting?: string; // e.g., "Daily water quality testing, meets Taiwan Water Department standards"
  maxWaterDepth?: number; // Maximum depth in meters
  hasShallowAreas?: boolean; // Dedicated shallow/toddler areas
  poolTemperature?: string; // e.g., "Heated pool 28-30°C"
  hasLifeJacketRental?: boolean; // Floatation device availability
  swimLessonAvailable?: boolean; // Swimming lessons for children
  waterSafetyRulesEnforced?: boolean; // Safety rules compliance
  waterSafetyNotes?: string; // e.g., "Shallow pool 0.5m for toddlers, certified lifeguards on duty, life jackets available for rent"
}

export interface HighChairInfo {
  hasHighChairs?: boolean; // High-chair availability
  highChairQuantity?: number; // Number of high-chairs
  minimumAgeMonths?: number; // Minimum age recommendation
  maximumAgeMonths?: number; // Maximum age recommendation
  cleanlinessRating?: number; // 1-5 stars for cleanliness
  hasBoosterSeats?: boolean; // Booster seats for toddlers
  hasChangingStations?: boolean; // Dedicated changing stations (beyond standard toilets)
  hasBottleWarmingFacilities?: boolean; // Bottle warming capability
  babyGearRentalAvailable?: boolean; // Can rent car seats, play pens, etc.
  highChairNotes?: string; // e.g., "8 high-chairs available, cleaned between uses, seats for 6mo-3yo"
}

export interface AgeSpecificBathroomInfo {
  hasToddlerToilets?: boolean; // Child-sized toilet seats
  hasStepStools?: boolean; // Step stools for toilet access
  hasToiletTrainingFacilities?: boolean; // Support for toilet-training children
  hasChildHeightHandWashing?: boolean; // Hand-washing stations at child height
  hasPrivacyFamilyBathroom?: boolean; // Family bathrooms for privacy
  hasHandDryersChildSafe?: boolean; // Non-startling hand dryers for children
  parentSupervisionVisiblity?: boolean; // Can parent see child washing hands
  genderSpecificFacilityEducation?: boolean; // Staff support for privacy education
  bathroomCleanlinessRating?: number; // 1-5 stars
  bathroomNotes?: string; // e.g., "Child-sized toilets in all bathrooms, step stools provided, family restrooms available"
}

export interface LostChildProtocolInfo {
  hasLostChildProtocol?: boolean; // Documented lost child procedures
  staffIdentificationSystem?: boolean; // Easy-to-spot staff (uniforms, badges)
  hasEmergencyPaging?: boolean; // PA system for announcements
  hasIDWristbandSystem?: boolean; // Wristband identification program
  meetingPointDesignated?: boolean; // Pre-established meeting points
  hasEmergencyPhoneNumbers?: boolean; // Posted emergency contact numbers
  staffTrainingLevel?: 'comprehensive' | 'standard' | 'basic' | 'minimal'; // Staff training in lost child procedures
  incidentDocumentation?: boolean; // Formal incident recording capability
  lostChildProtocolNotes?: string; // e.g., "Clear lost child protocol, staff trained, ID wristbands available, emergency PA system, meeting point near entrance"
}

export interface ParentRestAreaInfo {
  hasRestAreas?: boolean; // Dedicated seating and rest areas for parents
  hasComfortableSeating?: boolean; // Chairs, benches, couches for sitting
  hasShadeOrIndoor?: boolean; // Protected rest areas
  hasFeedingAreas?: boolean; // Designated nursing/feeding zones
  hasRefreshmentAccess?: boolean; // Nearby water, refreshments
  hasChargingStations?: boolean; // Phone/device charging available
  restAreaQuantity?: number; // Number of rest areas
  restAreaCleanlinessRating?: number; // 1-5 stars
  restAreaNotes?: string; // e.g., "Multiple rest areas with comfortable seating, charging stations, water access, very clean"
}

export interface EventSpaceInfo {
  hasEventSpaces?: boolean; // Party/event venues available
  hasIndoorEventSpace?: boolean; // Indoor party areas
  hasOutdoorEventSpace?: boolean; // Outdoor party areas
  birthdayPartyPackages?: boolean; // Special birthday party offerings
  eventSpaceCapacity?: string; // e.g., "30-100 people"
  maxPartyGroupSize?: number; // Maximum group size for events
  requiresAdvanceBooking?: boolean; // Booking required for events
  partyPackageIncludes?: string[]; // e.g., ["catering", "decorations", "entertainment", "cleaning"]
  partyPriceRange?: string; // e.g., "NT$2000-5000"
  eventNotes?: string; // e.g., "Birthday packages include cake table, decorations, and staff support; min 20 people required"
}

export interface SpecialNeedsServicesInfo {
  hasAutismFriendlyHours?: boolean; // Special quiet hours for autistic children
  sensoryFriendlyEnvironment?: boolean; // Designed with sensory sensitivities in mind
  quietZonesAvailable?: boolean; // Low-stimulus areas for overwhelmed children
  staffTrainedInSpecialNeeds?: boolean; // Staff trained for special needs support
  wheelchairAccessibilityBeyondBasic?: boolean; // Full venue wheelchair accessibility
  visuallyImpairedSupport?: boolean; // Audio descriptions, high-contrast signage
  hearingImpairedSupport?: boolean; // Visual alerts, sign language staff available
  developmentalDelayServices?: boolean; // Support for children with developmental delays
  specialNeedsSchedule?: string; // e.g., "Autism-friendly hours: Saturdays 9-11am, Wednesdays 6-7pm"
  specialNeedsNotes?: string; // e.g., "Quiet sensory rooms available, trained staff, low-stimulus areas, visual schedules posted"
}

export interface FirstAidAndMedicalInfo {
  hasAED?: boolean; // Automated External Defibrillator available
  aedLocation?: string; // Where AED is located
  hasFirstAidKit?: boolean; // Basic first aid supplies available
  hasStaffFirstAidTraining?: boolean; // Staff trained in first aid
  hasMedicalStaff?: boolean; // Doctor or nurse on-site or available
  nearbyHospital?: string; // Nearest hospital name and distance
  hospitalDistance?: number; // In meters or km
  emergencyContactNumbers?: string[]; // Posted emergency numbers
  incidentResponseCapability?: 'comprehensive' | 'standard' | 'basic'; // How well equipped for emergencies
  medicalNotes?: string; // e.g., "AED on entrance wall, first aid trained staff, Taipei Veterans General Hospital 2km away, emergency call system on-site"
}

export interface EntertainmentScheduleInfo {
  hasPerformances?: boolean; // Live shows, performances, or demonstrations available
  performanceTypes?: string[]; // e.g., ["live music", "magic show", "puppet theater", "dance performance", "educational demo"]
  performanceSchedule?: string; // e.g., "Daily shows at 11am, 2pm, 4pm"
  hasWeeklyShows?: boolean; // Regular weekly schedule
  showDuration?: string; // e.g., "20-30 minutes"
  minAgeForShow?: number; // Minimum age recommendation
  maxAgeForShow?: number; // Maximum age recommendation
  performanceContent?: string; // e.g., "Interactive music performance for ages 2-8"
  requiresAdvanceBooking?: boolean; // Need to book seats for shows
  hasInteractiveActivities?: boolean; // Kids can participate in performance
  performanceLanguage?: string[]; // e.g., ["Mandarin", "English", "non-verbal"]
  performanceLocation?: string; // e.g., "Indoor theater" or "Outdoor stage"
  seasonalPerformances?: string; // e.g., "Special holiday shows Dec-Jan"
  entertainmentNotes?: string; // e.g., "Daily puppet shows suitable for ages 2-10, no reservation needed, approximately 25 minutes each performance"
}

export interface PhotoVideoPolicy {
  allowsPhotography?: boolean; // Can families take photos?
  allowsVideoRecording?: boolean; // Can families record videos?
  photographyRestrictions?: string; // e.g., "Photos allowed except in exhibition areas", "Professional photography prohibited"
  videoRecordingRestrictions?: string; // e.g., "Videos for personal use only", "Commercial recording prohibited"
  flashPhotographyAllowed?: boolean; // Some venues don't allow flash
  tripodAllowed?: boolean; // Can use tripod/selfie stick?
  commercialPhotographyAllowed?: boolean; // For social media content creators
  photoVideoNotes?: string; // e.g., "Personal photography allowed, no flash in museum exhibits, video recording requires permission for commercial use"
}

export interface VisitDurationRecommendation {
  recommendedDurationMinutes?: number; // Recommended minimum hours for a full experience (in minutes)
  recommendedDurationText?: string; // e.g., "2-3 hours", "Half day" , "Full day"
  quickVisitMinutes?: number; // Quick visit timeframe (in minutes)
  fullExperienceDurationMinutes?: number; // Full experience timeframe (in minutes)
  mustSeeActivityDurationMinutes?: number; // Must-see activities duration
  includesMealTimeRecommendation?: boolean; // Should families budget time for eating?
  mealTimeSuggestion?: string; // e.g., "1-1.5 hours recommended for lunch"
  restTimeRecommendation?: boolean; // Should families plan rest breaks?
  bestTimeToVisit?: string; // e.g., "Morning visits less crowded, afternoon quieter after 4pm"
  durationNotes?: string; // e.g., "Recommend 3-4 hours including meal time; children ages 2-8 usually spend 3-4 hours for core activities"
}

export interface TaiwanSchoolHolidayInfo {
  winterVacationDates?: string; // e.g., "Late Jan - Early Feb" (寒假)
  summerVacationDates?: string; // e.g., "Early Jul - Late Aug" (暑假)
  midAutumnFestival?: string; // e.g., "Sep 10-12" (中秋節)
  lunarNewYearDates?: string; // e.g., "Feb 17-24, 2026" (農曆新年)
  dragonBoatFestivalDate?: string; // e.g., "Jun 10" (端午節)
  doubleNinthFestivalDate?: string; // e.g., "Oct 10" (重陽節)
  weeklyHolidaysInfo?: string; // e.g., "Closed Mondays except holidays"
  winterVacationCrowding?: 'light' | 'moderate' | 'heavy'; // Crowding during winter break
  summerVacationCrowding?: 'light' | 'moderate' | 'heavy'; // Crowding during summer break
  lunarNewYearCrowding?: 'light' | 'moderate' | 'heavy'; // Peak crowding during Chinese New Year
  holidaySpecialEventsOrHours?: string; // e.g., "Special CNY performances Feb 17-24, extended hours during summer vacation"
  holidayBookingRecommendation?: string; // e.g., "Pre-book required during winter/summer vacations, especially on weekends"
  holidayNotes?: string; // e.g., "Very crowded during Lunar New Year and summer vacation; quiet during weekdays in regular school term. Recommend visiting on weekday mornings or off-season."
}

export interface HeightBasedPricingInfo {
  hasHeightBasedPricing?: boolean; // Many Taiwan attractions charge by height not age
  childHeightThreshold?: number; // Child pricing height threshold in cm (e.g., 100cm)
  childPrice?: string; // Price for children under threshold
  adultHeight?: number; // Height above which full price applies (cm)
  freeHeightThreshold?: number; // Free entry height in cm (very young children)
  heightMeasurementLocation?: string; // Where height is measured (entrance)
  pricingNotes?: string; // e.g., "Under 100cm free, 100-150cm NT$200, over 150cm NT$500. Height measured at entrance."
}

export interface DrinkingWaterInfo {
  hasDrinkingWater?: boolean; // Drinking water stations available
  drinkingWaterSources?: string[]; // e.g., ["water fountains", "refill stations", "indoor fountains"]
  waterFountainQuantity?: number; // Number of water fountains
  waterQuality?: 'excellent' | 'good' | 'fair'; // Water quality rating
  isWaterChilled?: boolean; // Is water chilled/cooled (important in Taiwan heat)
  hasRefillableBottleStations?: boolean; // Can refill water bottles
  waterTemperature?: string; // e.g., "Room temperature" or "Chilled 5-10°C"
  waterAccessibilityNotes?: string; // e.g., "Water fountains throughout park, chilled water in main pavilion"
}

export interface DiaperChangingFacilitiesInfo {
  hasDiaperChangingTables?: boolean; // Dedicated diaper changing tables (beyond just toilets)
  changingTableQuantity?: number; // Number of changing tables
  changingTableLocations?: string[]; // e.g., ["main restroom", "family restroom", "nursing room"]
  hasDiaperDisposal?: boolean; // Proper disposal for used diapers
  hasRunningWater?: boolean; // Sink at changing table for hand washing
  hasHandSanitizer?: boolean; // Hand sanitizer available
  cleanlinessRating?: number; // 1-5 stars for cleanliness
  isParentSupervisionVisiblity?: boolean; // Parent can supervise other children while changing
  hasPrivacyScreen?: boolean; // Privacy provided at changing tables
  hasMaps?: boolean; // Diaper changing supply map available
  changingFacilitiesNotes?: string; // e.g., "4 dedicated changing tables in main and family restrooms, very clean, disposal bins available, running water, hand soap provided"
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
  hasActivitiesForMultipleAges?: boolean; // Are there activities suitable for children of different ages simultaneously?
  bestAgeCombination?: string; // e.g., "Works well for siblings ages 2-12 together"
  toddlerActivitiesAvailable?: boolean; // Activities for young kids (1-3 years)
  preschoolActivitiesAvailable?: boolean; // Activities for preschool (3-5 years)
  schoolAgeActivitiesAvailable?: boolean; // Activities for school-age (6-12 years)
  teenActivitiesAvailable?: boolean; // Activities for teens (13+ years)
  simultaneousActivityOptions?: boolean; // Can older and younger kids do activities at same time/place?
  ageGroupSeparationNeeded?: string; // e.g., "Sometimes required for toddler safety"
  siblingFriendlinessRating?: 'excellent' | 'good' | 'fair' | 'challenging'; // How well families with multiple ages are accommodated
  recommendedGroupSizes?: string; // e.g., "Works best for 2-4 children with parent supervision"
  ageCompatibilityNotes?: string; // e.g., "Great mix of activities for ages 2-10; playground for older kids, sensory play for toddlers in same area"
}

export interface ComprehensiveVisitCostInfo {
  entryFeePerAdult?: string; // e.g., "NT$500"
  entryFeePerChild?: string; // e.g., "NT$250" (usually lower than adult)
  entryFeePerToddler?: string; // e.g., "Free under 3 years"
  familyPackagePrice?: string; // e.g., "NT$1200 for family of 4"
  familyPackageIncludes?: string; // e.g., "2 adults + 2 children + 2 beverage vouchers"
  estimatedFoodCostPerFamily?: string; // e.g., "NT$200-400 per person for lunch"
  parkingCostForDay?: string; // e.g., "Free" or "NT$50"
  rentalsCostEstimate?: string; // e.g., "NT$100-200 for stroller rental"
  extraActivitiesCostEstimate?: string; // e.g., "Rides NT$100-300 each, photo packages NT$200"
  totalEstimatedCostPerFamily?: string; // e.g., "NT$2000-3000 for family of 4 with lunch and rentals"
  discountedPackages?: string[]; // e.g., ["2-visit pass NT$800", "10-visit membership NT$3000"]
  paymentFlexibility?: string; // e.g., "Can pay separately per person or as bundled family package"
  costSavingTips?: string; // e.g., "Visit on weekdays for no entry fee, free parking"
  budgetWarning?: string; // e.g., "Rides and rental costs add up significantly; budget NT$3000+ for full family experience"
  visitCostNotes?: string; // Complete cost breakdown information
}

export interface HealthDocumentationRequirementsInfo {
  requiresCOVIDVaccination?: boolean; // COVID vaccination needed
  vaccineProofRequired?: string; // e.g., "Full vaccination" or "Booster within 3 months"
  vaccineBoosterRequired?: boolean; // Booster shot required
  requiresCovidTestOnArrival?: boolean; // Rapid test or PCR test required
  requiresHealthCertificate?: boolean; // General health certificate
  otherHealthCertificatesRequired?: string[]; // e.g., ["tuberculosis screening", "physical examination"]
  requiresTemperatureCheck?: string; // e.g., "At entrance, must be below 37.5°C"
  healthInsuranceRequired?: boolean; // Travel or local health insurance
  childrenSpecificRequirements?: string; // e.g., "Children under 12 must be vaccinated"
  exemptionCategories?: string; // e.g., "Infants under 6 months, immunocompromised with waiver"
  enforcementLevel?: 'strict' | 'moderate' | 'flexible' | 'none'; // How strictly enforced
  documentationNotes?: string; // e.g., "Proof accepted: digital cert, physical card, official letter from doctor"
  healthRequirementNotes?: string; // Complete health requirement information
}

export interface PlaygroundEquipmentAndActivityInfo {
  hasPlayground?: boolean; // Is there a playground available?
  playgroundTypes?: string[]; // e.g., ["traditional playground", "water playground", "adventure park", "sensory playground"]
  playgroundEquipment?: string[]; // e.g., ["slides", "swings", "monkey bars", "climbing wall", "sandbox", "seesaw", "spring riders", "balance beams", "rope bridges"]
  toddlerPlaygroundAvailable?: boolean; // Dedicated toddler play areas
  preschoolPlayEquipment?: string[]; // Equipment suitable for 3-5 years
  schoolAgePlayEquipment?: string[]; // Equipment suitable for 6-12 years
  teenActivityOptions?: string[]; // Equipment/activities for 13+ years
  activitiesByAgeGroup?: string; // e.g., "Ages 1-3: sandbox, swings, soft play; Ages 4-8: slides, climbing, monkey bars; Ages 9-12: challenge courses, zip lines"
  seasonalActivityAvailability?: string; // e.g., "Water playground open May-September only"
  activityDurationRecommendations?: string; // e.g., "Typical playground visit 1-3 hours depending on age and interest"
  playgroundSafetyRating?: number; // 1-5 stars based on equipment condition
  equipmentMaintenanceFrequency?: string; // e.g., "Daily inspection and weekly deep clean"
  equipmentAgeAndCondition?: string; // e.g., "Equipment renewed 2025, all structures certified safe"
  costForActivities?: string; // e.g., "Playground free; water play NT$50 extra; adventure courses NT$100-300"
  suggestedDurationPerActivityType?: string; // e.g., "Slide: 10-15 mins, sandbox: 30-60 mins, swings: 15-30 mins"
  outdoorVsIndoorActivities?: string; // e.g., "50% outdoor, 50% indoor; indoor areas heated/AC'd"
  playgroundAndActivityNotes?: string; // Complete playground and activity information
}

export interface NavigationFromTransitInfo {
  hasPublicTransitAccess?: boolean; // Is the venue accessible by public transit?
  mrtDirections?: {
    station: string; // e.g., "科技大樓站 (Nanjing Fuxing Station, Brown Line)"
    distance: number; // in meters
    walkingTimeMinutes?: number; // Estimated walking time
    directions?: string; // Step-by-step directions from station to entrance
    exitNumber?: string; // Exit number to use
    elevatorAvailable?: boolean; // Is there an elevator at the station?
  };
  busDirections?: {
    busLines?: string[]; // e.g., ["15", "32", "38"]
    stopName?: string; // Bus stop name
    walkingTimeMinutes?: number; // Walking time from bus stop to entrance
    directions?: string; // Step-by-step directions from bus stop
    frequency?: string; // How often buses run (e.g., "every 5-10 minutes during peak hours")
  };
  cyclingDirections?: {
    bikeAccessible?: boolean; // Can you cycle there?
    bikeStorageAvailable?: boolean; // Bike parking available?
    directions?: string; // Cycling route directions
    estimatedCyclingTimeMinutes?: number; // Time to cycle from transit hub
  };
  driversLicenseAccess?: {
    drivingTimeFromCityCenter?: number; // in minutes
    parkingEntrance?: string; // Directions to parking entrance
    gpsCoordinates?: { lat: number; lng: number }; // GPS for venue or parking
    accessRoadType?: string; // e.g., "main road", "residential area", "highway"
  };
  accessibleTransportOptions?: {
    wheelchairAccessibleMRT?: boolean; // Wheelchair accessible station/exit?
    elevatorAtStation?: boolean; // Elevator availability for strollers
    accessibleBusAvailable?: boolean; // Low-floor accessible buses available?
  };
  entranceLocation?: {
    mainEntranceName?: string; // Name of main entrance
    alternateEntrances?: string[]; // Other entrance options
    closestEntranceFromTransit?: string; // Which entrance is closest to transit?
    disabledAccessEntrance?: string; // Entrance for wheelchair users
  };
  navigationNotes?: string; // Complete navigation information (e.g., "From MRT: Exit 2, turn left, walk 350m to main gate. Watch for traffic at intersection. Total walk 8 mins. From bus stop: walk 200m along Xinsheng Rd to south entrance")
}

export interface PhotographySpotsAndServicesInfo {
  bestPhotoSpots?: {
    spotName: string; // e.g., "Main Entrance with Fountain"
    description: string; // Description of the spot
    bestTimeOfDay?: string; // e.g., "Golden hour (4-6pm)"
    ageAppropriate?: string; // e.g., "All ages, especially kids 3-8"
    photoTip?: string; // Photography suggestion
  }[];
  photoBooth?: {
    available: boolean;
    locations?: string[]; // Where photo booths are located
    price?: string; // Cost per photo
    instantPrints?: boolean; // Can you get prints immediately?
    digitalCopies?: boolean; // Digital copies available?
  };
  professionalPhotoServices?: {
    available: boolean;
    types?: string[]; // e.g., ["family portraits", "kids action shots"]
    booking?: string; // How to book
    pricing?: string; // Price range
    turnaroundTime?: string; // When photos are ready
  };
  scenicLocations?: string[]; // Best scenic locations for photos
  allowedEquipment?: string[]; // e.g., ["tripod", "drone", "professional camera"]
  photoStorageSpots?: {
    hasCloud?: boolean; // WiFi to upload to cloud?
    hasUSBServices?: boolean; // USB backup services?
  };
  photographyNotes?: string; // General photography tips and guidelines
}

export interface KidsClassesAndWorkshopsInfo {
  hasClasses?: boolean; // Are there classes/workshops offered?
  musicClasses?: {
    available: boolean;
    types?: string[]; // e.g., ["piano", "guitar", "singing", "music appreciation"]
    ageGroup?: string; // e.g., "3-8 years"
    schedule?: string; // e.g., "Weekends 10-11am, 2-3pm"
    duration?: string; // Class duration e.g., "30 minutes per session"
    pricing?: string; // Cost per class
    instructorQualifications?: string; // e.g., "certified music teachers"
  };
  artClasses?: {
    available: boolean;
    types?: string[]; // e.g., ["painting", "clay", "crafts", "drawing"]
    ageGroup?: string; // e.g., "2-10 years"
    schedule?: string; // When classes are offered
    duration?: string; // Class duration
    pricing?: string; // Cost per class
    materialsIncluded?: boolean; // Are art materials provided?
  };
  sportClasses?: {
    available: boolean;
    types?: string[]; // e.g., ["swimming", "martial arts", "dance", "yoga", "gymnastics"]
    ageGroup?: string; // e.g., "4-12 years"
    schedule?: string; // When classes are offered
    duration?: string; // Class duration
    pricing?: string; // Cost per class
    instructorQualifications?: string; // Safety certifications
  };
  academicClasses?: {
    available: boolean;
    types?: string[]; // e.g., ["English lessons", "math tutoring", "science workshops", "coding"]
    ageGroup?: string; // e.g., "5-12 years"
    schedule?: string; // When offered
    duration?: string; // Class duration
    pricing?: string; // Cost per class
  };
  languageClasses?: {
    available: boolean;
    languages?: string[]; // e.g., ["English", "Japanese", "French"]
    ageGroup?: string; // Age range
    schedule?: string; // When offered
    duration?: string; // Class duration
    pricing?: string; // Cost
  };
  parentChildClasses?: {
    available: boolean; // Parent-child bonding classes
    types?: string[]; // e.g., ["mommy and me", "parent-child yoga", "parent-child cooking"]
    ageGroup?: string; // e.g., "0-3 years with parent"
    schedule?: string; // When offered
    duration?: string; // Class duration
    pricing?: string; // Cost
  };
  summitCamps?: {
    available: boolean; // Holiday/summer camps
    types?: string[]; // e.g., ["art camp", "sports camp", "adventure camp", "STEM camp"]
    ageGroup?: string; // Age range
    seasonalAvailability?: string; // e.g., "Summer Jul-Aug, Winter Jan-Feb"
    duration?: string; // e.g., "Full day 9am-5pm"
    pricing?: string; // Cost for camp
    mealIncluded?: boolean; // Are meals provided?
  };
  workshopsAndEvents?: {
    available: boolean; // One-time workshops or special events
    types?: string[]; // e.g., ["science demonstration", "cooking workshop", "DIY craft session"]
    schedule?: string; // Regular schedule or special dates
    ageGroup?: string; // Who it's suitable for
    duration?: string; // How long each workshop lasts
    pricing?: string; // Cost per workshop
    advanceBookingRequired?: boolean; // Do you need to book ahead?
  };
  specialNeedsClasses?: {
    available: boolean; // Classes for children with special needs
    types?: string[]; // e.g., ["autism-friendly classes", "sensory-friendly arts", "adaptive sports"]
    ageGroup?: string; // Age range
    schedule?: string; // When offered
    supportLevel?: string; // e.g., "1-on-1 assistant available"
  };
  bookingMethod?: string; // e.g., "Online registration at website, phone booking, walk-in first-come-first-served"
  classesWebsite?: string; // URL to class information
  classesPhoneNumber?: string; // Phone to inquire about classes
  classesNotes?: string; // e.g., "Diverse class offerings suitable for ages 2-12. Registration open 2 weeks in advance. Sibling discounts available. Equipment provided for most classes except sports (bring comfortable clothing)."
}

export interface WeatherAndSunSafetyInfo {
  hasOutdoorExposure?: boolean; // Does the venue have significant outdoor areas?
  uvRiskLevel?: 'extreme' | 'very high' | 'high' | 'moderate' | 'low'; // Year-round UV risk rating
  peakUVMonth?: string[]; // e.g., ["May", "June", "July", "August", "September"]
  recommendedSunProtection?: string[]; // e.g., ["SPF50+ sunscreen", "UV-blocking clothing", "hat/cap", "sunglasses"]
  sunExposureRisk?: string; // e.g., "High during summer 10am-4pm; outdoor playground directly exposed; limited shade available"
  shadeAvailability?: 'abundant' | 'moderate' | 'limited' | 'minimal'; // How much shade is available
  umbrellaAllowed?: boolean; // Can families bring umbrellas for sun protection?
  sunriseToSunsetTiming?: string; // e.g., "Sunrise ~5:30am, Sunset ~6:30pm in summer"
  bestSafeTimeToVisit?: string; // e.g., "Early morning before 10am or after 4pm for minimal sun exposure"
  heatStressRisk?: string; // e.g., "Very high July-August (30-35°C); brings water frequently, watch for heat exhaustion"
  mosquitoSeasonInfo?: string; // e.g., "High mosquito activity May-October, especially dusk; recommend repellent and protective clothing"
  sunburnWarning?: boolean; // Is sunburn a significant risk?
  photosensitivityRisk?: boolean; // High glare/reflection areas (water, sand, concrete)?
  recommendedClothing?: string[]; // e.g., ["light-colored long sleeves", "moisture-wicking fabrics", "UV-blocking hat"]
  sunscreenRecommendation?: string; // e.g., "SPF50+ reapplied every 2 hours, especially after water activities"
  indoorAlternativesAvailable?: boolean; // Are there indoor activities if sun is too intense?
  weatherProtectionNotes?: string; // e.g., "Outdoor park has limited shade; recommend early morning visits in summer. Bring sunscreen SPF50+, hat, and extra water. Indoor museum section available as alternative on extremely hot days."
}

export interface WalkingDistanceAndDifficultyInfo {
  totalWalkingDistance?: number; // Total walking distance in meters for full tour/experience
  mainAttractionsAccessibility?: string; // e.g., "Main attractions within 500m of entrance"
  strollerWalking?: {
    isStrollerFriendly?: boolean; // Are paths suitable for strollers?
    difficultSections?: string; // e.g., "Stairs on west path, gravel surface near playground"
    flatPathPercentage?: number; // 0-100% of paths are flat/smooth
    maxSlopePercentage?: number; // Steepest slope grade
  };
  carryingSmallChildrenDifficulty?: 'easy' | 'moderate' | 'challenging'; // Difficulty of carrying toddlers
  ageGroupPhysicalDemands?: {
    toddlers?: string; // e.g., "Minimal walking, short visits 1-2 hours recommended"
    preschool?: string; // e.g., "Moderate walking, can do 2-3km, needs rest breaks"
    schoolAge?: string; // e.g., "Can handle 5km+ with interest, minimal rest needs"
  };
  restAreaFrequency?: string; // e.g., "Rest areas every 200-300m"
  benchesToAmenitiesRatio?: string; // e.g., "Plenty of seating throughout"
  timeToMainAttraction?: number; // Minutes from entrance to main area
  roundTripWalkingTime?: number; // Total walking time for full experience (minutes)
  walkingDifficultyNotes?: string; // e.g., "Mostly flat paths with good stroller access. Main attractions within 200m of entrance. Plenty of benches for rest. Well-suited for families with toddlers. Estimated 1-2 hours walking for full experience."
}

export interface NoiseAndSensoryEnvironmentInfo {
  overallNoiseLevel?: 'very_quiet' | 'quiet' | 'moderate' | 'loud' | 'very_loud'; // General noise assessment
  noiseSourcesDescription?: string; // e.g., "Primarily outdoor venue noise from other visitors and playground equipment; echoing sounds in indoor play areas"
  peakNoiseHours?: string; // e.g., "Weekends 11am-4pm during peak attendance; highest noise Saturdays-Sundays"
  quietestHours?: string; // e.g., "Weekday mornings 9-11am and late afternoons 4-6pm; very quiet before 9am"
  soundMitigation?: string[]; // e.g., ["soundproofing in main hall", "noise-reducing playground surface", "designated quiet zones"]
  hasSoundproofing?: boolean; // Are any areas soundproofed?
  quietZonesAvailable?: boolean; // Dedicated quiet areas?
  quietZoneDescription?: string; // e.g., "Quiet reading area, sensory room with soft lighting and low music"
  sensoryFriendlyHours?: string; // e.g., "Autism-friendly sensory-reduced hours: Tuesday mornings 9-11am, reduced lighting, lower volume entertainment"
  sensoryAccommodations?: string[]; // e.g., ["adjustable lighting", "low-volume audio options", "scent-free policies"]
  vibrationalActivities?: string; // e.g., "Rides and performances have vibration; separate quiet entertainment options available"
  lightingSituation?: 'very_bright' | 'bright' | 'moderate' | 'dim' | 'mixed'; // Lighting assessment
  hasAdjustableLighting?: boolean; // Can lighting be adjusted?
  scents?: string; // e.g., "Food court aromas; playground rubber mulch; no strong chemical odors"
  hasScent_freePolicies?: boolean; // Fragrance-free areas?
  echoProblems?: boolean; // Do certain areas have echo/reverb issues?
  staffSensoryAwareness?: 'comprehensive' | 'trained' | 'basic' | 'minimal'; // Staff training level on sensory needs
  sensoryEnvironmentNotes?: string; // e.g., "Best for sensory-sensitive families during quiet hours (weekday mornings). Main playground is loud; quieter activities available indoors. Autism-friendly hours available with reduced stimulation."
}

export interface InsectAndAllergenEnvironmentInfo {
  mosquitoRisk?: 'none' | 'low' | 'moderate' | 'high' | 'very_high'; // Overall mosquito prevalence
  mosquitoSeasons?: string[]; // e.g., ["May-October", "year-round in some areas"]
  peakMosquitoMonths?: string; // e.g., "July-September, especially dusk hours"
  beeAndWaspRisk?: 'none' | 'low' | 'moderate' | 'high'; // Risk of bee/wasp encounters
  beeWaspSeasons?: string; // e.g., "Spring-fall, especially near flowers"
  spiderPresence?: 'none' | 'minimal' | 'moderate' | 'common'; // Spider frequency
  otherInsectsInfo?: string; // e.g., "Dragonflies near water areas, grasshoppers in summer, no fire ants"
  pollenLevels?: 'low' | 'moderate' | 'high' | 'very_high'; // Pollen concentration risk
  allergenicPlants?: string[]; // e.g., ["acacia", "mango tree pollen", "grass pollen in summer"]
  peakPollenMonths?: string; // e.g., "March-May for mango pollen"
  insectRepellentAvailable?: boolean; // Can you buy or are provided mosquito repellent?
  mosquitoNetAvailable?: boolean; // Mosquito nets provided or available for rent?
  hasScreensOrBarriers?: boolean; // Screened areas for mosquito protection?
  indoorVsOutdoorInsectRisk?: string; // e.g., "Outdoor areas high risk May-October; indoor areas minimal risk"
  insectPreventionMeasures?: string[]; // e.g., ["mosquito spraying program", "standing water management", "sealed ventilation windows"]
  staffAlertnessToInsects?: boolean; // Do staff respond to insect issues?
  bestTimeToAvoidInsects?: string; // e.g., "Visit during dry season (Nov-Apr) or morning hours (8-11am) to avoid peak mosquito activity"
  insectAllergenNotes?: string; // e.g., "High mosquito activity May-October, especially at dusk. Indoor areas and main pavilion have screens. Insect repellent recommended. Alternative: visit early morning or dry season months."
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
}

export interface SearchParams {
  lat: number;
  lng: number;
  radius: number; // in meters
  category?: Category | undefined;
  stroller_accessible?: boolean | undefined;
}
