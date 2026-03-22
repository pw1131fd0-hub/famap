export type Category = 'park' | 'nursing_room' | 'restaurant' | 'medical' | 'attraction' | 'other';

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
  ageRange?: AgeRange;
  pricing?: PricingInfo;
  phoneNumber?: string;
  publicTransit?: PublicTransitInfo;
  parking?: ParkingInfo;
  toilet?: ToiletInfo;
  hasWiFi?: boolean;
  allergens?: AllergenInfo;
}

export interface SearchParams {
  lat: number;
  lng: number;
  radius: number; // in meters
  category?: Category | undefined;
  stroller_accessible?: boolean | undefined;
}
