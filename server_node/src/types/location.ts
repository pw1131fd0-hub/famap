export type Category = 'park' | 'nursing_room' | 'restaurant' | 'medical';

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
}

export interface SearchParams {
  lat: number;
  lng: number;
  radius: number; // in meters
  category?: Category | undefined;
  stroller_accessible?: boolean | undefined;
}
