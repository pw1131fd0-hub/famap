export type Category = 'park' | 'nursing_room' | 'restaurant' | 'medical' | 'attraction' | 'other';

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
}

export interface LocationCreateDTO {
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  category: Category;
  coordinates: { lat: number; lng: number };
  address: { zh: string; en: string };
  facilities: string[];
}

export interface Favorite {
  id: string;
  userId: string;
  locationId: string;
  createdAt: string;
}

export type Language = 'zh' | 'en';
