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
}

export interface SearchParams {
  lat: number;
  lng: number;
  radius: number; // in meters
  category?: Category | undefined;
  stroller_accessible?: boolean | undefined;
}
