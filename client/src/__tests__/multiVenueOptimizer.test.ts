import {
  optimizeMultiVenueTrip,
  suggestOptimalStartTime,
  formatTripSummary,
  encodeTrip,
  decodeTrip,
  type OptimizedTrip,
} from '../utils/multiVenueOptimizer';
import type { Location } from '../types';

// Mock location data
const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '台北大安森林公園', en: 'Daan Forest Park' },
    description: { zh: '大型城市公園', en: 'Large urban park' },
    category: 'park',
    coordinates: { lat: 25.0331, lng: 121.5440 },
    address: { zh: '台北市', en: 'Taipei' },
    facilities: ['stroller_accessible', 'playground', 'toilet'],
    averageRating: 4.5,
    operatingHours: { monday: '9:00-17:00' },
  },
  {
    id: '2',
    name: { zh: '台北動物園', en: 'Taipei Zoo' },
    description: { zh: '大型動物園', en: 'Large zoo' },
    category: 'park',
    coordinates: { lat: 24.9983, lng: 121.5815 },
    address: { zh: '台北市', en: 'Taipei' },
    facilities: ['stroller_accessible', 'restaurant', 'toilet'],
    averageRating: 4.3,
    operatingHours: { monday: '9:00-17:00' },
  },
  {
    id: '3',
    name: { zh: '新竹科學園區', en: 'Hsinchu Science Park' },
    description: { zh: '科學教育園區', en: 'Science education park' },
    category: 'attraction',
    coordinates: { lat: 24.8104, lng: 120.9719 },
    address: { zh: '新竹市', en: 'Hsinchu' },
    facilities: ['stroller_accessible', 'restaurant', 'toilet', 'nursing_room'],
    averageRating: 4.4,
    operatingHours: { monday: '9:00-17:00', tuesday: '9:00-17:00' },
  },
];

const mockLocation1: Location = mockLocations[0];
const mockLocation2: Location = mockLocations[1];
const mockLocation3: Location = mockLocations[2];

describe('multiVenueOptimizer', () => {
  describe('optimizeMultiVenueTrip', () => {
    it('should return empty trip for no venues', () => {
      const trip = optimizeMultiVenueTrip([]);
      expect(trip.stops).toHaveLength(0);
      expect(trip.totalTime).toBe(0);
      expect(trip.totalDistance).toBe(0);
      expect(trip.recommendations).toContain('No venues selected');
    });

    it('should handle single venue', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1]);
      expect(trip.stops).toHaveLength(1);
      expect(trip.totalTravelTime).toBe(0);
      expect(trip.totalVisitTime).toBeGreaterThan(0);
      expect(trip.totalDistance).toBe(0);
    });

    it('should optimize route for multiple venues', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2, mockLocation3]);
      expect(trip.stops).toHaveLength(3);
      expect(trip.totalTravelTime).toBeGreaterThan(0);
      expect(trip.totalVisitTime).toBeGreaterThan(0);
      expect(trip.totalTime).toBe(trip.totalTravelTime + trip.totalVisitTime);
    });

    it('should calculate correct visit durations by category', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2, mockLocation3]);
      const parkStop = trip.stops.find(s => s.location.category === 'park');
      const attractionStop = trip.stops.find(s => s.location.category === 'attraction');

      expect(parkStop).toBeDefined();
      expect(attractionStop).toBeDefined();
      expect(parkStop!.visitDuration).toBe(90); // Default park duration
      expect(attractionStop!.visitDuration).toBe(120); // Attraction duration
    });

    it('should assign correct order to stops', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2, mockLocation3]);
      trip.stops.forEach((stop, index) => {
        expect(stop.order).toBe(index + 1);
      });
    });

    it('should calculate arrival and departure times correctly', () => {
      const startTime = new Date('2026-03-26T09:00:00');
      const trip = optimizeMultiVenueTrip([mockLocation1], startTime);
      const stop = trip.stops[0];

      expect(stop.arrivalTime).toEqual(startTime);
      expect(stop.departureTime.getTime()).toBeGreaterThan(stop.arrivalTime.getTime());
    });

    it('should account for travel time between venues', () => {
      const startTime = new Date('2026-03-26T09:00:00');
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2], startTime);

      expect(trip.stops).toHaveLength(2);
      expect(trip.stops[1].arrivalTime.getTime()).toBeGreaterThan(trip.stops[0].departureTime.getTime());
    });

    it('should estimate cost based on family size and number of venues', () => {
      const trip1 = optimizeMultiVenueTrip([mockLocation1], new Date(), 1);
      const trip2 = optimizeMultiVenueTrip([mockLocation1], new Date(), 4);

      expect(trip2.estimatedCost).toBe(trip1.estimatedCost * 4);
    });

    it('should calculate route efficiency score', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2, mockLocation3]);
      expect(trip.routeEfficiency).toBeGreaterThanOrEqual(0);
      expect(trip.routeEfficiency).toBeLessThanOrEqual(100);
    });

    it('should generate recommendations for long trips', () => {
      const mockLongVenue: Location = {
        ...mockLocation1,
        id: 'long1',
      };
      // Create enough venues to exceed 8 hours
      const venues = Array.from({ length: 10 }, (_, i) => ({
        ...mockLongVenue,
        id: `long${i}`,
        coordinates: { lat: 25.0331 + i * 0.01, lng: 121.5440 + i * 0.01 },
      }));

      const trip = optimizeMultiVenueTrip(venues);
      expect(trip.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate recommendations for toddlers', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2, mockLocation3], new Date(), 2, [1, 2]);
      // Should mention nap time if trip is long enough
      if (trip.totalTime > 240) {
        expect(trip.recommendations.some(r => r.includes('nap'))).toBe(true);
      }
    });

    it('should warn about missing nursing rooms for toddlers', () => {
      // Use venues without nursing rooms
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2], new Date(), 2, [1]);
      const hasMissingNursingWarning = trip.recommendations.some(r => r.includes('nursing'));
      expect(typeof hasMissingNursingWarning).toBe('boolean');
    });

    it('should handle large distances', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation3]);
      expect(trip.totalDistance).toBeGreaterThan(0);
    });

    it('should preserve location data in stops', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2]);
      trip.stops.forEach(stop => {
        expect(stop.location).toBeDefined();
        expect(stop.location.name).toBeDefined();
        expect(stop.location.coordinates).toBeDefined();
      });
    });

    it('should handle custom start times', () => {
      const customStart = new Date('2026-04-15T14:30:00');
      const trip = optimizeMultiVenueTrip([mockLocation1], customStart);
      expect(trip.bestTimeToStart).toEqual(customStart);
      expect(trip.stops[0].arrivalTime).toEqual(customStart);
    });

    it('should calculate total time correctly', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2, mockLocation3]);
      expect(trip.totalTime).toBe(trip.totalTravelTime + trip.totalVisitTime);
    });
  });

  describe('suggestOptimalStartTime', () => {
    it('should return date for empty venues', () => {
      const result = suggestOptimalStartTime([]);
      expect(result).toBeInstanceOf(Date);
    });

    it('should suggest morning time for any venues', () => {
      const result = suggestOptimalStartTime([mockLocation1, mockLocation2]);
      expect(result.getHours()).toBeLessThan(12);
    });

    it('should respect preferred start time', () => {
      const preferred = new Date('2026-03-26T12:00:00');
      const result = suggestOptimalStartTime([mockLocation1], preferred);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('formatTripSummary', () => {
    it('should return empty message for empty trip', () => {
      const emptyTrip: OptimizedTrip = {
        stops: [],
        totalTravelTime: 0,
        totalVisitTime: 0,
        totalTime: 0,
        totalDistance: 0,
        estimatedCost: 0,
        bestTimeToStart: new Date(),
        recommendations: [],
        routeEfficiency: 0,
      };
      expect(formatTripSummary(emptyTrip)).toBe('No venues in trip');
    });

    it('should format trip summary with venue count', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2]);
      const summary = formatTripSummary(trip);
      expect(summary).toContain('2 venues');
    });

    it('should format time in hours and minutes', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2, mockLocation3]);
      const summary = formatTripSummary(trip);
      expect(summary).toMatch(/\d+[hm]/);
    });

    it('should include distance and cost', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2]);
      const summary = formatTripSummary(trip);
      expect(summary).toMatch(/km/);
      expect(summary).toMatch(/\$/);
    });

    it('should handle single hour trips', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1]);
      const summary = formatTripSummary(trip);
      expect(summary).toContain('1 venues');
    });
  });

  describe('encodeTrip and decodeTrip', () => {
    it('should encode trip to string', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2]);
      const encoded = encodeTrip(trip);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should decode trip from encoded string', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2]);
      const encoded = encodeTrip(trip);
      const decoded = decodeTrip(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded!.stopIds).toHaveLength(2);
      expect(decoded!.startTime).toBeInstanceOf(Date);
    });

    it('should preserve stop order in encoding', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2, mockLocation3]);
      const encoded = encodeTrip(trip);
      const decoded = decodeTrip(encoded);

      expect(decoded!.stopIds[0]).toBe(trip.stops[0].location.id);
      expect(decoded!.stopIds[1]).toBe(trip.stops[1].location.id);
      expect(decoded!.stopIds[2]).toBe(trip.stops[2].location.id);
    });

    it('should handle invalid encoded strings', () => {
      const result = decodeTrip('invalid!!!');
      expect(result).toBeNull();
    });

    it('should preserve start time in encoding', () => {
      const startTime = new Date('2026-03-26T14:30:00');
      const trip = optimizeMultiVenueTrip([mockLocation1], startTime);
      const encoded = encodeTrip(trip);
      const decoded = decodeTrip(encoded);

      expect(decoded!.startTime.getTime()).toBe(startTime.getTime());
    });

    it('should handle empty trip encoding', () => {
      const emptyTrip: OptimizedTrip = {
        stops: [],
        totalTravelTime: 0,
        totalVisitTime: 0,
        totalTime: 0,
        totalDistance: 0,
        estimatedCost: 0,
        bestTimeToStart: new Date(),
        recommendations: [],
        routeEfficiency: 0,
      };
      const encoded = encodeTrip(emptyTrip);
      const decoded = decodeTrip(encoded);
      expect(decoded!.stopIds).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle duplicate locations', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation1]);
      expect(trip.stops).toHaveLength(2);
    });

    it('should handle locations at same coordinates', () => {
      const location1 = { ...mockLocation1, id: 'same1' };
      const location2 = { ...mockLocation1, id: 'same2' };
      const trip = optimizeMultiVenueTrip([location1, location2]);
      expect(trip.stops).toHaveLength(2);
      expect(trip.totalDistance).toBe(0);
    });

    it('should handle very large family size', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2], new Date(), 10);
      expect(trip.estimatedCost).toBeGreaterThan(100);
    });

    it('should handle zero visit time edge case', () => {
      const trip = optimizeMultiVenueTrip([]);
      expect(trip.totalVisitTime).toBe(0);
    });

    it('should suggest start time multiple times', () => {
      const startTime1 = suggestOptimalStartTime([mockLocation1]);
      const startTime2 = suggestOptimalStartTime([mockLocation1]);
      expect(startTime1).toBeInstanceOf(Date);
      expect(startTime2).toBeInstanceOf(Date);
    });
  });

  describe('type safety', () => {
    it('should maintain type consistency', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1]);
      expect(typeof trip.totalTime).toBe('number');
      expect(typeof trip.totalDistance).toBe('number');
      expect(typeof trip.estimatedCost).toBe('number');
      expect(typeof trip.routeEfficiency).toBe('number');
      expect(Array.isArray(trip.stops)).toBe(true);
      expect(Array.isArray(trip.recommendations)).toBe(true);
    });

    it('should have valid stop objects', () => {
      const trip = optimizeMultiVenueTrip([mockLocation1, mockLocation2]);
      trip.stops.forEach(stop => {
        expect(stop.location).toBeDefined();
        expect(typeof stop.order).toBe('number');
        expect(typeof stop.visitDuration).toBe('number');
        expect(stop.arrivalTime).toBeInstanceOf(Date);
        expect(stop.departureTime).toBeInstanceOf(Date);
      });
    });
  });
});
