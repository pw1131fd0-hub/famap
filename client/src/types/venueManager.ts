/**
 * Venue Manager Types
 * Defines the data structures for the Venue Manager Portal
 */

export interface VenueManager {
  id: string;
  venueId: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'owner' | 'manager' | 'staff';
  permissions: VenuePermission[];
  claimedAt: number;
  verifiedAt?: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export type VenuePermission =
  | 'view_analytics'
  | 'edit_basic_info'
  | 'edit_amenities'
  | 'manage_photos'
  | 'respond_to_reviews'
  | 'manage_events'
  | 'manage_staff';

export interface VenueAnalytics {
  venueId: string;
  period: 'day' | 'week' | 'month';
  views: number;
  searches: number;
  clicks: number;
  favorites: number;
  reviews: number;
  avgRating: number;
  topSearchQueries: string[];
  trafficByHour?: Record<number, number>;
  trafficByDay?: Record<string, number>;
}

export interface VenuePhoto {
  id: string;
  venueId: string;
  url: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: number;
  isApproved: boolean;
  category: 'exterior' | 'interior' | 'amenity' | 'activity' | 'other';
  order?: number;
}

export interface VenueReviewResponse {
  id: string;
  reviewId: string;
  venueId: string;
  responseText: string;
  respondedBy: string;
  respondedAt: number;
  isPublished: boolean;
}

export interface VenueSpecialOffer {
  id: string;
  venueId: string;
  title: string;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  code?: string;
  validFrom: number;
  validUntil: number;
  maxUses?: number;
  usedCount: number;
  conditions?: string;
}

export interface VenueManagerDashboardData {
  manager: VenueManager;
  venue: {
    id: string;
    name: string;
    category: string;
    address: string;
    rating: number;
    reviewCount: number;
  };
  analytics: VenueAnalytics;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    author: string;
    createdAt: number;
    hasResponse: boolean;
  }>;
  photos: VenuePhoto[];
  offers: VenueSpecialOffer[];
  unreadMessages: number;
}
