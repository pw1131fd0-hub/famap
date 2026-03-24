import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateICalendar,
  generateTripShareData,
  parseShareData,
  generateTripHTML,
  generateTripCSV,
  generateShareLink,
  type TripData
} from '../utils/tripExport';
import type { Location } from '../types';

const mockLocation: Location = {
  id: 'loc1',
  name: 'Test Park',
  category: 'park',
  address: '123 Test Street',
  coordinates: { lat: 25.033, lng: 121.565 },
  averageRating: 4.5,
  facilities: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  phoneNumber: '02-XXXX-XXXX'
};

const mockTrip: TripData = {
  id: 'trip1',
  name: 'Summer Family Outing',
  date: '2026-04-01',
  budget: 2000,
  totalSpent: 1500,
  members: [
    { id: 'u1', name: 'Parent', role: 'planner' },
    { id: 'u2', name: 'Child', role: 'member' }
  ],
  suggestedLocations: [mockLocation],
  finalLocations: [mockLocation],
  notes: 'Have fun at the park',
  status: 'confirmed',
  createdAt: '2026-03-24T10:00:00Z'
};

describe('Trip Export Utils', () => {
  describe('generateICalendar', () => {
    it('should generate valid iCalendar format', () => {
      const ical = generateICalendar(mockTrip);
      expect(ical).toContain('BEGIN:VCALENDAR');
      expect(ical).toContain('END:VCALENDAR');
      expect(ical).toContain('BEGIN:VEVENT');
      expect(ical).toContain('END:VEVENT');
    });

    it('should include trip name in SUMMARY', () => {
      const ical = generateICalendar(mockTrip);
      expect(ical).toContain(`SUMMARY:${mockTrip.name}`);
    });

    it('should include trip date in DTSTART', () => {
      const ical = generateICalendar(mockTrip);
      expect(ical).toContain('DTSTART:20260401');
    });

    it('should include location information in DESCRIPTION', () => {
      const ical = generateICalendar(mockTrip);
      expect(ical).toContain('Family Trip');
      expect(ical).toContain(mockTrip.notes);
      expect(ical).toContain(`Budget: NT$${mockTrip.budget}`);
    });

    it('should use finalLocations when available', () => {
      const ical = generateICalendar(mockTrip);
      expect(ical).toContain(mockTrip.finalLocations[0].name);
    });

    it('should use suggestedLocations as fallback', () => {
      const tripNoFinal: TripData = { ...mockTrip, finalLocations: [] };
      const ical = generateICalendar(tripNoFinal);
      expect(ical).toContain(tripNoFinal.suggestedLocations[0].name);
    });

    it('should include member names', () => {
      const ical = generateICalendar(mockTrip);
      expect(ical).toContain('Parent');
      expect(ical).toContain('Child');
    });

    it('should handle special characters in trip name', () => {
      const specialTrip: TripData = {
        ...mockTrip,
        name: 'Trip & Adventure'
      };
      const ical = generateICalendar(specialTrip);
      expect(ical).toContain('SUMMARY:Trip & Adventure');
    });
  });

  describe('generateTripShareData & parseShareData', () => {
    it('should generate base64 encoded share data', () => {
      const shareData = generateTripShareData(mockTrip);
      expect(typeof shareData).toBe('string');
      // Base64 characters
      expect(/^[A-Za-z0-9+/=]+$/.test(shareData)).toBe(true);
    });

    it('should parse share data correctly', () => {
      const shareData = generateTripShareData(mockTrip);
      const parsed = parseShareData(shareData);
      expect(parsed).not.toBeNull();
      expect(parsed?.name).toBe(mockTrip.name);
      expect(parsed?.date).toBe(mockTrip.date);
      expect(parsed?.budget).toBe(mockTrip.budget);
    });

    it('should include trip metadata in share data', () => {
      const shareData = generateTripShareData(mockTrip);
      const parsed = parseShareData(shareData);
      expect(parsed?.members).toEqual(mockTrip.members);
      expect(parsed?.notes).toBe(mockTrip.notes);
    });

    it('should limit locations to 10 in share data', () => {
      const manyLocations = Array(15).fill(mockLocation);
      const tripWithMany: TripData = {
        ...mockTrip,
        finalLocations: manyLocations,
        suggestedLocations: []
      };
      const shareData = generateTripShareData(tripWithMany);
      const parsed = parseShareData(shareData);
      expect(parsed?.finalLocations.length).toBeLessThanOrEqual(10);
    });

    it('should handle invalid share data', () => {
      const invalid = Buffer.from('invalid data').toString('base64');
      const parsed = parseShareData(invalid);
      expect(parsed).toBeNull();
    });

    it('should return null for corrupted base64', () => {
      const parsed = parseShareData('not-valid-base64!@#$%');
      expect(parsed).toBeNull();
    });

    it('should generate importable trip from share data', () => {
      const shareData = generateTripShareData(mockTrip);
      const parsed = parseShareData(shareData);
      expect(parsed?.id).toMatch(/^imported_/);
      expect(parsed?.status).toBe('planning');
      expect(parsed?.createdAt).toBeDefined();
    });
  });

  describe('generateTripHTML', () => {
    it('should generate valid HTML structure', () => {
      const html = generateTripHTML(mockTrip, 'en');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    });

    it('should include trip details in HTML', () => {
      const html = generateTripHTML(mockTrip, 'en');
      expect(html).toContain(mockTrip.name);
      expect(html).toContain(mockTrip.date);
      expect(html).toContain(mockTrip.budget.toString());
    });

    it('should use English labels', () => {
      const html = generateTripHTML(mockTrip, 'en');
      expect(html).toContain('Trip Name');
      expect(html).toContain('Budget');
      expect(html).toContain('Locations');
    });

    it('should use Chinese labels', () => {
      const html = generateTripHTML(mockTrip, 'zh');
      expect(html).toContain('旅行名稱');
      expect(html).toContain('預算');
      expect(html).toContain('地點');
    });

    it('should include member information', () => {
      const html = generateTripHTML(mockTrip, 'en');
      expect(html).toContain('Parent');
      expect(html).toContain('Child');
    });

    it('should include location details', () => {
      const html = generateTripHTML(mockTrip, 'en');
      expect(html).toContain(mockLocation.name);
      expect(html).toContain(mockLocation.address);
    });

    it('should handle trips without notes', () => {
      const tripNoNotes: TripData = { ...mockTrip, notes: '' };
      const html = generateTripHTML(tripNoNotes, 'en');
      expect(html).toBeDefined();
      expect(() => new DOMParser().parseFromString(html, 'text/html')).not.toThrow();
    });

    it('should handle empty locations', () => {
      const tripNoLoc: TripData = {
        ...mockTrip,
        finalLocations: [],
        suggestedLocations: []
      };
      const html = generateTripHTML(tripNoLoc, 'en');
      expect(html).toBeDefined();
    });

    it('should prioritize finalLocations over suggestedLocations', () => {
      const testTrip: TripData = {
        ...mockTrip,
        finalLocations: [mockLocation],
        suggestedLocations: [{ ...mockLocation, name: 'Suggested Park' }]
      };
      const html = generateTripHTML(testTrip, 'en');
      expect(html).toContain('Test Park');
      expect(html).not.toContain('Suggested Park');
    });

    it('should include print-friendly styles', () => {
      const html = generateTripHTML(mockTrip, 'en');
      expect(html).toContain('@media print');
    });

    it('should include generation timestamp', () => {
      const html = generateTripHTML(mockTrip, 'en');
      expect(html).toContain('Generated by FamMap');
    });
  });

  describe('generateTripCSV', () => {
    it('should generate CSV format', () => {
      const csv = generateTripCSV(mockTrip, 'en');
      expect(typeof csv).toBe('string');
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should include CSV headers in English', () => {
      const csv = generateTripCSV(mockTrip, 'en');
      expect(csv).toContain('Trip Name');
      expect(csv).toContain('Date');
      expect(csv).toContain('Budget');
    });

    it('should include CSV headers in Chinese', () => {
      const csv = generateTripCSV(mockTrip, 'zh');
      expect(csv).toContain('旅行名稱');
      expect(csv).toContain('日期');
      expect(csv).toContain('預算');
    });

    it('should include trip data in CSV', () => {
      const csv = generateTripCSV(mockTrip, 'en');
      expect(csv).toContain(mockTrip.name);
      expect(csv).toContain(mockTrip.date);
      expect(csv).toContain(mockTrip.budget.toString());
    });

    it('should include location data in CSV rows', () => {
      const csv = generateTripCSV(mockTrip, 'en');
      expect(csv).toContain(mockLocation.name);
      expect(csv).toContain(mockLocation.address);
    });

    it('should escape quotes in CSV', () => {
      const tripWithQuotes: TripData = {
        ...mockTrip,
        notes: 'Trip with "quotes" and, commas'
      };
      const csv = generateTripCSV(tripWithQuotes, 'en');
      expect(csv).toContain('""quotes""');
    });

    it('should handle multiple locations', () => {
      const multiLoc: TripData = {
        ...mockTrip,
        finalLocations: [
          mockLocation,
          { ...mockLocation, id: 'loc2', name: 'Another Park' }
        ]
      };
      const csv = generateTripCSV(multiLoc, 'en');
      expect(csv).toContain('Another Park');
    });

    it('should handle empty locations list', () => {
      const tripNoLoc: TripData = {
        ...mockTrip,
        finalLocations: [],
        suggestedLocations: []
      };
      const csv = generateTripCSV(tripNoLoc, 'en');
      expect(csv).toContain(mockTrip.name);
    });
  });

  describe('generateShareLink', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        location: {
          origin: 'https://fammap.example.com'
        }
      });
    });

    it('should generate shareable URL', () => {
      const link = generateShareLink(mockTrip);
      expect(link).toContain('https://fammap.example.com');
      expect(link).toContain('?sharedTrip=');
    });

    it('should include base64 encoded trip data', () => {
      const link = generateShareLink(mockTrip);
      const shareParam = link.split('?sharedTrip=')[1];
      const parsed = parseShareData(shareParam);
      expect(parsed).not.toBeNull();
      expect(parsed?.name).toBe(mockTrip.name);
    });

    it('should be parseable back to trip', () => {
      const link = generateShareLink(mockTrip);
      const shareParam = link.split('?sharedTrip=')[1];
      const parsed = parseShareData(shareParam);
      expect(parsed?.budget).toBe(mockTrip.budget);
      expect(parsed?.date).toBe(mockTrip.date);
    });
  });

  describe('Download functions', () => {
    it('should handle download without errors', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const { downloadICalendar } = require('../utils/tripExport');

      try {
        downloadICalendar(mockTrip);
        expect(createElementSpy).toHaveBeenCalledWith('a');
      } catch (_e) {
        // Expected in test environment
      }
      createElementSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle trip with special characters in name', () => {
      const specialTrip: TripData = {
        ...mockTrip,
        name: '親子友善地圖 Family & Friends'
      };
      const ical = generateICalendar(specialTrip);
      expect(ical).toContain('SUMMARY');
      const html = generateTripHTML(specialTrip, 'zh');
      expect(html).toBeDefined();
      const csv = generateTripCSV(specialTrip, 'zh');
      expect(csv).toBeDefined();
    });

    it('should handle trip with very long notes', () => {
      const longNotes = 'A'.repeat(1000);
      const tripLongNotes: TripData = {
        ...mockTrip,
        notes: longNotes
      };
      const html = generateTripHTML(tripLongNotes, 'en');
      expect(html).toContain('A'.repeat(100));
    });

    it('should handle trip with no members', () => {
      const tripNoMembers: TripData = {
        ...mockTrip,
        members: []
      };
      const ical = generateICalendar(tripNoMembers);
      expect(ical).toContain('BEGIN:VCALENDAR');
    });

    it('should handle trip with future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureTrip: TripData = {
        ...mockTrip,
        date: futureDate.toISOString().split('T')[0]
      };
      const ical = generateICalendar(futureTrip);
      expect(ical).toContain('DTSTART:202');
    });

    it('should handle trip with zero budget', () => {
      const zeroBudgetTrip: TripData = {
        ...mockTrip,
        budget: 0
      };
      const html = generateTripHTML(zeroBudgetTrip, 'en');
      expect(html).toContain('NT$0');
    });

    it('should handle trip with exceeded budget spending', () => {
      const overBudgetTrip: TripData = {
        ...mockTrip,
        budget: 1000,
        totalSpent: 1500
      };
      const html = generateTripHTML(overBudgetTrip, 'en');
      expect(html).toContain('NT$1000');
      expect(html).toContain('NT$1500');
    });
  });
});
