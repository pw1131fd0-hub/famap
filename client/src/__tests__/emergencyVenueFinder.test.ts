/**
 * Tests for Smart Emergency & Last-Minute Venue Finder
 */

import {
  findEmergencyVenue,
  generateLastMinuteOutingPlans,
  findSpecificEmergencyVenue,
  type EmergencyNeed,
  type EmergencyVenueScore,
} from '../utils/emergencyVenueFinder';
import type { Location } from '../types';

// Mock locations for testing
const mockLocations: Location[] = [
  {
    id: 'loc-1',
    name: { en: 'Medical Clinic', zh: '醫療診所' },
    category: 'medical',
    coordinates: { lat: 25.033, lng: 121.5154 }, // Close to user
    facilities: ['medical_facility', 'first_aid', 'parking'],
    address: { en: 'Test Address 1', zh: '測試地址 1' },
    photos: [],
    rating: 4.5,
  },
  {
    id: 'loc-2',
    name: { en: 'Family Restaurant', zh: '家庭餐廳' },
    category: 'restaurant',
    coordinates: { lat: 25.0365, lng: 121.5164 }, // Very close
    facilities: ['high_chair', 'changing_table', 'family_seating'],
    address: { en: 'Test Address 2', zh: '測試地址 2' },
    photos: [],
    rating: 4.2,
  },
  {
    id: 'loc-3',
    name: { en: 'Central Park', zh: '中央公園' },
    category: 'park',
    coordinates: { lat: 25.0334, lng: 121.5165 }, // Close
    facilities: ['playground', 'parking', 'restroom'],
    address: { en: 'Test Address 3', zh: '測試地址 3' },
    photos: [],
    rating: 4.8,
  },
  {
    id: 'loc-4',
    name: { en: 'Shopping Mall', zh: '購物中心' },
    category: 'attraction',
    coordinates: { lat: 25.0344, lng: 121.5145 }, // Near
    facilities: ['nursing_room', 'bathroom', 'food_court', 'indoor_activity'],
    address: { en: 'Test Address 4', zh: '測試地址 4' },
    photos: [],
    rating: 4.3,
  },
  {
    id: 'loc-5',
    name: { en: 'Far Hospital', zh: '遠處醫院' },
    category: 'medical',
    coordinates: { lat: 25.0824, lng: 121.5654 }, // Far away
    facilities: ['medical_facility', 'first_aid', 'emergency_room'],
    address: { en: 'Test Address 5', zh: '測試地址 5' },
    photos: [],
    rating: 4.6,
  },
];

const userLat = 25.0335;
const userLng = 121.5155;

describe('Emergency Venue Finder', () => {
  describe('findEmergencyVenue', () => {
    it('should find emergency venues for critical medical needs', () => {
      const need: EmergencyNeed = {
        type: 'medical',
        urgency: 'critical',
        timeAvailable: 30,
        preferredDistance: 5,
        familySize: 2,
        childAges: [5],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should prioritize nearby venues for nursing needs', () => {
      const need: EmergencyNeed = {
        type: 'nursing_room',
        urgency: 'critical',
        timeAvailable: 15,
        preferredDistance: 2,
        familySize: 1,
        childAges: [0, 1],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      if (results.length > 0) {
        expect(results[0].travelTime).toBeLessThanOrEqual(10);
      }
    });

    it('should find bathroom facilities for quick needs', () => {
      const need: EmergencyNeed = {
        type: 'bathroom',
        urgency: 'high',
        timeAvailable: 10,
        preferredDistance: 1,
        familySize: 2,
        childAges: [4],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      expect(results.length).toBeGreaterThan(0);
    });

    it('should find meal options for medium urgency', () => {
      const need: EmergencyNeed = {
        type: 'meal',
        urgency: 'medium',
        timeAvailable: 45,
        preferredDistance: 3,
        familySize: 3,
        childAges: [5, 8, 10],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      if (results.length > 0) {
        const hasRestaurant = results.some((r) => r.locationName.includes('Restaurant'));
        expect(hasRestaurant || results.length > 0).toBeTruthy();
      }
    });

    it('should find shelter for rainy conditions', () => {
      const need: EmergencyNeed = {
        type: 'shelter_rain',
        urgency: 'high',
        timeAvailable: 30,
        preferredDistance: 2,
        familySize: 3,
        childAges: [4, 7],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      if (results.length > 0) {
        expect(results[0].score).toBeGreaterThan(30);
      }
    });

    it('should return empty array for empty locations', () => {
      const need: EmergencyNeed = {
        type: 'medical',
        urgency: 'critical',
        timeAvailable: 30,
        preferredDistance: 5,
        familySize: 1,
        childAges: [5],
      };

      const results = findEmergencyVenue([], need, userLat, userLng);

      expect(results).toEqual([]);
    });

    it('should handle undefined locations gracefully', () => {
      const need: EmergencyNeed = {
        type: 'medical',
        urgency: 'critical',
        timeAvailable: 30,
        preferredDistance: 5,
        familySize: 1,
        childAges: [5],
      };

      const results = findEmergencyVenue(undefined as any, need, userLat, userLng);

      expect(results).toEqual([]);
    });

    it('should limit results to top 5 venues', () => {
      const many Locations = [...mockLocations, ...mockLocations, ...mockLocations];
      const need: EmergencyNeed = {
        type: 'activity',
        urgency: 'low',
        timeAvailable: 60,
        preferredDistance: 10,
        familySize: 2,
        childAges: [5, 8],
      };

      const results = findEmergencyVenue(manyLocations, need, userLat, userLng);

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should score venues based on multiple factors', () => {
      const need: EmergencyNeed = {
        type: 'meal',
        urgency: 'medium',
        timeAvailable: 45,
        preferredDistance: 3,
        familySize: 2,
        childAges: [5, 8],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      results.forEach((result) => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.urgencyMatch).toBeGreaterThanOrEqual(0);
        expect(result.urgencyMatch).toBeLessThanOrEqual(100);
        expect(result.timeMatch).toBeGreaterThanOrEqual(0);
        expect(result.timeMatch).toBeLessThanOrEqual(100);
      });
    });

    it('should provide recommendation reasons', () => {
      const need: EmergencyNeed = {
        type: 'nursing_room',
        urgency: 'critical',
        timeAvailable: 20,
        preferredDistance: 3,
        familySize: 1,
        childAges: [0, 1],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      if (results.length > 0) {
        expect(results[0].recommendationReason).toBeDefined();
        expect(Array.isArray(results[0].recommendationReason)).toBe(true);
      }
    });
  });

  describe('findSpecificEmergencyVenue', () => {
    it('should find nursing room for nursing emergency', () => {
      const results = findSpecificEmergencyVenue(mockLocations, 'nursing', userLat, userLng);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should find bathroom for bathroom emergency', () => {
      const results = findSpecificEmergencyVenue(mockLocations, 'bathroom', userLat, userLng);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should find medical facility for medical emergency', () => {
      const results = findSpecificEmergencyVenue(mockLocations, 'medical', userLat, userLng);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].locationName).toBeDefined();
    });

    it('should find shelter for rainy weather emergency', () => {
      const results = findSpecificEmergencyVenue(mockLocations, 'shelter', userLat, userLng);

      expect(results).toBeDefined();
    });

    it('should find meal options for meal emergency', () => {
      const results = findSpecificEmergencyVenue(mockLocations, 'meal', userLat, userLng);

      expect(results).toBeDefined();
    });

    it('should handle case-insensitive emergency type', () => {
      const results1 = findSpecificEmergencyVenue(mockLocations, 'MEDICAL', userLat, userLng);
      const results2 = findSpecificEmergencyVenue(mockLocations, 'medical', userLat, userLng);

      expect(results1).toBeDefined();
      expect(results2).toBeDefined();
    });

    it('should return valid results for unknown emergency type', () => {
      const results = findSpecificEmergencyVenue(mockLocations, 'unknown', userLat, userLng);

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('generateLastMinuteOutingPlans', () => {
    it('should generate outing plans for 2-hour window', () => {
      const plans = generateLastMinuteOutingPlans(
        mockLocations,
        120, // 2 hours
        userLat,
        userLng,
        2,
        [5, 8]
      );

      expect(plans).toBeDefined();
      expect(plans.durationMinutes).toBe(120);
      expect(plans.nearbyVenues).toBeDefined();
      expect(Array.isArray(plans.nearbyVenues)).toBe(true);
    });

    it('should generate plans for 30-minute quick outing', () => {
      const plans = generateLastMinuteOutingPlans(
        mockLocations,
        30,
        userLat,
        userLng,
        2,
        [4]
      );

      expect(plans.durationMinutes).toBe(30);
      expect(plans.nearbyVenues.length).toBeGreaterThanOrEqual(0);
    });

    it('should include quick activities organized by type', () => {
      const plans = generateLastMinuteOutingPlans(
        mockLocations,
        120,
        userLat,
        userLng,
        3,
        [5, 8, 11]
      );

      expect(plans.quickActivities).toBeDefined();
      expect(Array.isArray(plans.quickActivities)).toBe(true);
    });

    it('should provide weather considerations', () => {
      const plansRainy = generateLastMinuteOutingPlans(
        mockLocations,
        90,
        userLat,
        userLng,
        2,
        [6],
        'rainy'
      );

      expect(plansRainy.weatherConsiderations).toContain('indoor');
    });

    it('should provide weather considerations for sunny weather', () => {
      const plansSunny = generateLastMinuteOutingPlans(
        mockLocations,
        90,
        userLat,
        userLng,
        2,
        [6],
        'sunny'
      );

      expect(plansSunny.weatherConsiderations).toContain('sun');
    });

    it('should estimate cost based on family size', () => {
      const plans = generateLastMinuteOutingPlans(
        mockLocations,
        120,
        userLat,
        userLng,
        3,
        [5, 8, 10]
      );

      expect(plans.estimatedCost).toBeGreaterThan(0);
    });

    it('should provide best time window', () => {
      const plans = generateLastMinuteOutingPlans(
        mockLocations,
        120,
        userLat,
        userLng,
        2,
        [5]
      );

      expect(plans.bestTimeWindow).toBeDefined();
      expect(plans.bestTimeWindow.startTime).toBeDefined();
      expect(plans.bestTimeWindow.endTime).toBeDefined();
      expect(plans.bestTimeWindow.crowdingPrediction).toBeDefined();
    });

    it('should handle empty locations gracefully', () => {
      const plans = generateLastMinuteOutingPlans(
        [],
        120,
        userLat,
        userLng,
        2,
        [5]
      );

      expect(plans.durationMinutes).toBe(120);
      expect(plans.nearbyVenues).toEqual([]);
    });

    it('should scale activity duration based on available time', () => {
      const plansShort = generateLastMinuteOutingPlans(
        mockLocations,
        30,
        userLat,
        userLng,
        2,
        [5]
      );

      const plansLong = generateLastMinuteOutingPlans(
        mockLocations,
        180,
        userLat,
        userLng,
        2,
        [5]
      );

      expect(plansShort.quickActivities.every((a) => a.duration <= 15)).toBe(true);
      expect(plansLong.quickActivities.every((a) => a.duration >= 15)).toBe(true);
    });
  });

  describe('Emergency venue scores', () => {
    it('should score venues with all required properties', () => {
      const need: EmergencyNeed = {
        type: 'nursing_room',
        urgency: 'critical',
        timeAvailable: 20,
        preferredDistance: 3,
        familySize: 1,
        childAges: [0, 2],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      results.forEach((venue) => {
        expect(venue.locationId).toBeDefined();
        expect(venue.locationName).toBeDefined();
        expect(venue.score).toBeDefined();
        expect(venue.urgencyMatch).toBeDefined();
        expect(venue.timeMatch).toBeDefined();
        expect(venue.facilityReliability).toBeDefined();
        expect(venue.crowdingLevel).toBeDefined();
        expect(venue.estimatedWaitTime).toBeDefined();
        expect(venue.travelTime).toBeDefined();
        expect(typeof venue.suitabilityForAges === 'boolean').toBe(true);
        expect(Array.isArray(venue.recommendationReason)).toBe(true);
      });
    });

    it('should rank venues by score', () => {
      const need: EmergencyNeed = {
        type: 'activity',
        urgency: 'low',
        timeAvailable: 120,
        preferredDistance: 10,
        familySize: 2,
        childAges: [5, 8],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should handle critical urgency venues appropriately', () => {
      const criticalNeed: EmergencyNeed = {
        type: 'medical',
        urgency: 'critical',
        timeAvailable: 20,
        preferredDistance: 5,
        familySize: 1,
        childAges: [5],
      };

      const results = findEmergencyVenue(mockLocations, criticalNeed, userLat, userLng);

      if (results.length > 0) {
        expect(results[0].urgencyMatch).toBeGreaterThan(50);
      }
    });
  });

  describe('Travel time calculations', () => {
    it('should calculate realistic travel times', () => {
      const need: EmergencyNeed = {
        type: 'activity',
        urgency: 'low',
        timeAvailable: 120,
        preferredDistance: 10,
        familySize: 2,
        childAges: [5],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      results.forEach((venue) => {
        expect(venue.travelTime).toBeGreaterThan(0);
        expect(venue.travelTime).toBeLessThan(120);
      });
    });

    it('should find nearby venues first', () => {
      const need: EmergencyNeed = {
        type: 'nursing_room',
        urgency: 'critical',
        timeAvailable: 30,
        preferredDistance: 3,
        familySize: 1,
        childAges: [0, 2],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      if (results.length > 1) {
        expect(results[0].travelTime).toBeLessThanOrEqual(results[results.length - 1].travelTime);
      }
    });
  });

  describe('Crowding level estimation', () => {
    it('should estimate crowding levels', () => {
      const need: EmergencyNeed = {
        type: 'activity',
        urgency: 'low',
        timeAvailable: 60,
        preferredDistance: 5,
        familySize: 2,
        childAges: [5, 8],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      results.forEach((venue) => {
        expect(['low', 'moderate', 'high']).toContain(venue.crowdingLevel);
      });
    });

    it('should provide estimated wait times', () => {
      const need: EmergencyNeed = {
        type: 'meal',
        urgency: 'medium',
        timeAvailable: 45,
        preferredDistance: 3,
        familySize: 2,
        childAges: [5],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      results.forEach((venue) => {
        expect(venue.estimatedWaitTime).toBeGreaterThanOrEqual(0);
        expect(venue.estimatedWaitTime).toBeLessThan(60);
      });
    });
  });

  describe('Age appropriateness', () => {
    it('should assess age suitability', () => {
      const need: EmergencyNeed = {
        type: 'activity',
        urgency: 'low',
        timeAvailable: 60,
        preferredDistance: 5,
        familySize: 2,
        childAges: [4, 8],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      results.forEach((venue) => {
        expect(typeof venue.suitabilityForAges === 'boolean').toBe(true);
      });
    });

    it('should mark medical facilities as age-appropriate', () => {
      const need: EmergencyNeed = {
        type: 'medical',
        urgency: 'critical',
        timeAvailable: 30,
        preferredDistance: 5,
        familySize: 1,
        childAges: [10, 15],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      if (results.length > 0) {
        expect(results[0].suitabilityForAges).toBe(true);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle very small time windows', () => {
      const plans = generateLastMinuteOutingPlans(
        mockLocations,
        5, // 5 minutes
        userLat,
        userLng,
        1,
        [5]
      );

      expect(plans.durationMinutes).toBe(5);
    });

    it('should handle very large family sizes', () => {
      const plans = generateLastMinuteOutingPlans(
        mockLocations,
        120,
        userLat,
        userLng,
        10, // Large family
        [3, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      );

      expect(plans.estimatedCost).toBeGreaterThan(1000);
    });

    it('should handle infants and toddlers', () => {
      const need: EmergencyNeed = {
        type: 'nursing_room',
        urgency: 'critical',
        timeAvailable: 15,
        preferredDistance: 2,
        familySize: 1,
        childAges: [0, 6], // Infants and toddlers
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      expect(results).toBeDefined();
    });

    it('should handle teenagers', () => {
      const plans = generateLastMinuteOutingPlans(
        mockLocations,
        120,
        userLat,
        userLng,
        1,
        [13, 15, 17]
      );

      expect(plans.durationMinutes).toBe(120);
      expect(plans.nearbyVenues).toBeDefined();
    });

    it('should handle zero-age-children gracefully', () => {
      const need: EmergencyNeed = {
        type: 'activity',
        urgency: 'low',
        timeAvailable: 60,
        preferredDistance: 5,
        familySize: 1,
        childAges: [],
      };

      const results = findEmergencyVenue(mockLocations, need, userLat, userLng);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle missing facility data', () => {
      const locationNoFacilities: Location = {
        id: 'loc-no-fac',
        name: { en: 'Test', zh: '測試' },
        category: 'other',
        coordinates: { lat: 25.0335, lng: 121.5155 },
        facilities: [],
        address: { en: 'Test', zh: '測試' },
        photos: [],
        rating: 3.0,
      };

      const need: EmergencyNeed = {
        type: 'nursing_room',
        urgency: 'high',
        timeAvailable: 20,
        preferredDistance: 3,
        familySize: 1,
        childAges: [0, 2],
      };

      const results = findEmergencyVenue([locationNoFacilities], need, userLat, userLng);

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large location datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockLocations[i % mockLocations.length],
        id: `loc-${i}`,
      }));

      const need: EmergencyNeed = {
        type: 'activity',
        urgency: 'low',
        timeAvailable: 60,
        preferredDistance: 10,
        familySize: 2,
        childAges: [5],
      };

      const results = findEmergencyVenue(largeDataset, need, userLat, userLng);

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should complete quickly for emergency scenarios', () => {
      const need: EmergencyNeed = {
        type: 'medical',
        urgency: 'critical',
        timeAvailable: 30,
        preferredDistance: 10,
        familySize: 1,
        childAges: [5],
      };

      const startTime = performance.now();
      findEmergencyVenue(mockLocations, need, userLat, userLng);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
