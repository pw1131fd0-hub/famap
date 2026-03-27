/**
 * Tests for location utility functions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateDistance, formatDistance, isLocationOpen, getLocationFamilyScore } from '../utils/locationUtils';
import type { Location, OperatingHours } from '../types';

describe('locationUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between same coordinates as 0', () => {
      const distance = calculateDistance(25.0330, 121.5654, 25.0330, 121.5654);
      expect(distance).toBeLessThan(0.001); // Should be nearly 0
    });

    it('should calculate distance between different coordinates correctly', () => {
      // Taipei to Kaohsiung (approximately 297km)
      const distance = calculateDistance(25.0330, 121.5654, 22.6273, 120.3014);
      expect(distance).toBeGreaterThan(290);
      expect(distance).toBeLessThan(305);
    });

    it('should calculate distance between nearby locations', () => {
      // Short distance test (about 1km)
      const distance = calculateDistance(25.0330, 121.5654, 25.0340, 121.5664);
      expect(distance).toBeGreaterThan(0.01);
      expect(distance).toBeLessThan(0.2);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-33.8688, 151.2093, -33.8795, 151.2155);
      expect(distance).toBeGreaterThan(0);
    });

    it('should be symmetric (distance A to B equals B to A)', () => {
      const dist1 = calculateDistance(25.0330, 121.5654, 22.6273, 120.3014);
      const dist2 = calculateDistance(22.6273, 120.3014, 25.0330, 121.5654);
      expect(Math.abs(dist1 - dist2)).toBeLessThan(0.01);
    });
  });

  describe('formatDistance', () => {
    it('should format small distances in meters', () => {
      expect(formatDistance(0.5)).toBe('500m');
    });

    it('should format zero distance correctly', () => {
      expect(formatDistance(0)).toBe('0m');
    });

    it('should format large distances in kilometers with 1 decimal', () => {
      expect(formatDistance(1.5)).toBe('1.5km');
    });

    it('should handle very large distances', () => {
      expect(formatDistance(100.5)).toBe('100.5km');
    });

    it('should round appropriately for meter distances', () => {
      expect(formatDistance(0.123)).toBe('123m');
      expect(formatDistance(0.001)).toBe('1m');
    });

    it('should format distances >= 1km with fixed 1 decimal', () => {
      expect(formatDistance(1.0)).toBe('1.0km');
      expect(formatDistance(1.25)).toBe('1.3km');
      expect(formatDistance(1.26)).toBe('1.3km');
    });
  });

  describe('isLocationOpen', () => {
    let mockDate: Date;

    beforeEach(() => {
      mockDate = new Date('2026-03-27T14:00:00'); // Friday at 2 PM
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return open status when no operating hours provided', () => {
      const result = isLocationOpen(undefined);
      expect(result.isOpen).toBe(true);
      expect(result.message).toBe('營業時間未知');
    });

    it('should return closed status when location is closed today', () => {
      const hours: OperatingHours = {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '休息', // Closed on Friday
        saturday: '09:00-18:00',
        sunday: '09:00-18:00'
      };
      const result = isLocationOpen(hours);
      expect(result.isOpen).toBe(false);
      expect(result.message).toBe('今日休息');
    });

    it('should return open status for 24-hour locations', () => {
      const hours: OperatingHours = {
        monday: '24小時',
        tuesday: '24小時',
        wednesday: '24小時',
        thursday: '24小時',
        friday: '24小時',
        saturday: '24小時',
        sunday: '24小時'
      };
      const result = isLocationOpen(hours);
      expect(result.isOpen).toBe(true);
      expect(result.message).toBe('24小時');
    });

    it('should handle English "Closed" string', () => {
      const hours: OperatingHours = {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: 'Closed',
        saturday: '09:00-18:00',
        sunday: '09:00-18:00'
      };
      const result = isLocationOpen(hours);
      expect(result.isOpen).toBe(false);
      expect(result.message).toBe('今日休息');
    });

    it('should return open for standard operating hours', () => {
      const hours: OperatingHours = {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '09:00-20:00',
        saturday: '10:00-18:00',
        sunday: '10:00-18:00'
      };
      const result = isLocationOpen(hours);
      expect(result.isOpen).toBe(true);
      expect(result.message).toBe('營業中');
    });

    it('should handle "24 hours" in English', () => {
      const hours: OperatingHours = {
        monday: '24 hours',
        tuesday: '24 hours',
        wednesday: '24 hours',
        thursday: '24 hours',
        friday: '24 hours',
        saturday: '24 hours',
        sunday: '24 hours'
      };
      const result = isLocationOpen(hours);
      expect(result.isOpen).toBe(true);
      expect(result.message).toBe('24小時');
    });
  });

  describe('getLocationFamilyScore', () => {
    let mockLocation: Location;

    beforeEach(() => {
      mockLocation = {
        id: 'test-location',
        name: { zh: '測試地點', en: 'Test Location' },
        description: { zh: '描述', en: 'Description' },
        category: 'park',
        coordinates: { lat: 25.0330, lng: 121.5654 },
        address: { zh: '台北市', en: 'Taipei' },
        facilities: [],
        averageRating: 4.5
      };
    });

    it('should return 0 for location with no family facilities', () => {
      const score = getLocationFamilyScore(mockLocation);
      expect(score).toBe(0);
    });

    it('should count each family facility correctly', () => {
      mockLocation.facilities = ['nursing_room', 'public_toilet'];
      const score = getLocationFamilyScore(mockLocation);
      expect(score).toBe(2);
    });

    it('should count all key family facilities', () => {
      mockLocation.facilities = [
        'nursing_room',
        'public_toilet',
        'stroller_accessible',
        'changing_table',
        'high_chair',
        'kids_menu',
        'air_conditioned',
        'parking',
        'drinking_water'
      ];
      const score = getLocationFamilyScore(mockLocation);
      expect(score).toBe(9);
    });

    it('should not count non-family facilities', () => {
      mockLocation.facilities = ['pets_allowed', 'wifi'];
      const score = getLocationFamilyScore(mockLocation);
      expect(score).toBe(0);
    });

    it('should handle mixed family and non-family facilities', () => {
      mockLocation.facilities = [
        'nursing_room',
        'wifi',
        'public_toilet',
        'pets_allowed',
        'stroller_accessible'
      ];
      const score = getLocationFamilyScore(mockLocation);
      expect(score).toBe(3); // nursing_room, public_toilet, stroller_accessible
    });

    it('should score restaurant with kids amenities highly', () => {
      const restaurant: Location = {
        ...mockLocation,
        category: 'restaurant',
        facilities: [
          'high_chair',
          'kids_menu',
          'public_toilet',
          'air_conditioned',
          'parking'
        ]
      };
      const score = getLocationFamilyScore(restaurant);
      expect(score).toBe(5);
    });

    it('should score park with accessibility features', () => {
      const park: Location = {
        ...mockLocation,
        category: 'park',
        facilities: [
          'stroller_accessible',
          'public_toilet',
          'drinking_water',
          'parking'
        ]
      };
      const score = getLocationFamilyScore(park);
      expect(score).toBe(4);
    });

    it('should score nursing room highly', () => {
      const nursingRoom: Location = {
        ...mockLocation,
        category: 'nursing_room',
        facilities: [
          'nursing_room',
          'changing_table',
          'public_toilet',
          'air_conditioned'
        ]
      };
      const score = getLocationFamilyScore(nursingRoom);
      expect(score).toBe(4);
    });

    it('should not double-count duplicate facilities', () => {
      mockLocation.facilities = ['nursing_room', 'nursing_room'];
      const score = getLocationFamilyScore(mockLocation);
      // Even though nursing_room appears twice, it should only be counted once because
      // the implementation uses .includes() which returns true/false, not count occurrences
      expect(score).toBe(1);
    });
  });
});
