/**
 * Utility functions for location-related calculations and formatting
 */

import type { OperatingHours, Location } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display in km or meters
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Check if a location is currently open
 */
export const isLocationOpen = (operatingHours?: OperatingHours): { isOpen: boolean; message: string } => {
  if (!operatingHours) {
    return { isOpen: true, message: '營業時間未知' };
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[dayOfWeek];
  const todayHours = operatingHours[todayName as keyof typeof operatingHours];

  if (!todayHours || todayHours === '休息' || todayHours === 'Closed') {
    return { isOpen: false, message: '今日休息' };
  }

  // Simple check if hours contain typical time patterns
  if (todayHours.includes('24小時') || todayHours.includes('24 hours')) {
    return { isOpen: true, message: '24小時' };
  }

  return { isOpen: true, message: '營業中' };
};

/**
 * Calculate family-friendliness score based on facilities
 */
export const getLocationFamilyScore = (location: Location): number => {
  let score = 0;
  const keyFacilities = [
    'nursing_room',
    'public_toilet',
    'stroller_accessible',
    'changing_table',
    'high_chair',
    'kids_menu',
    'air_conditioned',
    'parking',
    'drinking_water',
  ];

  keyFacilities.forEach(facility => {
    if (location.facilities.includes(facility)) {
      score += 1;
    }
  });

  return score;
};
