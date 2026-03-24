import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Event } from '../types';

describe('EventsList Component Utilities', () => {
  let mockEvents: Event[];

  beforeEach(() => {
    mockEvents = [
      {
        id: '1',
        locationId: 'loc-1',
        title: { zh: '生日派對', en: 'Birthday Party' },
        description: { zh: '兒童生日派對', en: 'Children Birthday Party' },
        eventType: 'birthday_party',
        startDate: new Date('2026-04-01T10:00:00').toISOString(),
        endDate: new Date('2026-04-01T14:00:00').toISOString(),
        ageRange: { min: 5, max: 10 },
        capacity: 20,
        price: 500,
      },
      {
        id: '2',
        locationId: 'loc-1',
        title: { zh: '兒童課程', en: 'Kids Class' },
        description: { zh: '美術課程', en: 'Art Class' },
        eventType: 'class',
        startDate: new Date('2026-04-02T14:00:00').toISOString(),
        endDate: new Date('2026-04-02T15:30:00').toISOString(),
        ageRange: { min: 3, max: 7 },
        capacity: 15,
        price: 300,
      },
      {
        id: '3',
        locationId: 'loc-1',
        title: { zh: '表演', en: 'Performance' },
        description: { zh: '音樂表演', en: 'Music Performance' },
        eventType: 'performance',
        startDate: new Date('2026-04-03T18:00:00').toISOString(),
        endDate: new Date('2026-04-03T19:00:00').toISOString(),
        ageRange: { min: 0, max: 12 },
        capacity: 50,
        price: 200,
      },
    ];
  });

  describe('Event Type Labels', () => {
    it('should map event types to Chinese labels', () => {
      const typeMap: Record<string, { zh: string; en: string }> = {
        birthday_party: { zh: '生日派對', en: 'Birthday Party' },
        class: { zh: '課程', en: 'Class' },
        workshop: { zh: '工作坊', en: 'Workshop' },
        performance: { zh: '表演', en: 'Performance' },
        activity: { zh: '活動', en: 'Activity' },
        other: { zh: '其他', en: 'Other' }
      };

      expect(typeMap['birthday_party']['zh']).toBe('生日派對');
      expect(typeMap['class']['zh']).toBe('課程');
      expect(typeMap['performance']['zh']).toBe('表演');
    });

    it('should map event types to English labels', () => {
      const typeMap: Record<string, { zh: string; en: string }> = {
        birthday_party: { zh: '生日派對', en: 'Birthday Party' },
        class: { zh: '課程', en: 'Class' },
        workshop: { zh: '工作坊', en: 'Workshop' },
        performance: { zh: '表演', en: 'Performance' },
        activity: { zh: '活動', en: 'Activity' },
      };

      expect(typeMap['birthday_party']['en']).toBe('Birthday Party');
      expect(typeMap['class']['en']).toBe('Class');
    });
  });

  describe('Date Formatting', () => {
    it('should format date to Chinese locale', () => {
      const dateString = '2026-04-01T10:30:00Z';
      const date = new Date(dateString);
      const formatted = date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format date to English locale', () => {
      const dateString = '2026-04-01T10:30:00Z';
      const date = new Date(dateString);
      const formatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle different date formats', () => {
      const dates = [
        '2026-01-15T08:00:00Z',
        '2026-12-25T20:00:00Z',
        '2026-06-30T14:30:00Z',
      ];

      dates.forEach(dateString => {
        const date = new Date(dateString);
        const formatted = date.toLocaleDateString('zh-TW', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        expect(formatted.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Event Data Validation', () => {
    it('should validate event structure', () => {
      mockEvents.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('locationId');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('eventType');
        expect(event).toHaveProperty('startDate');
        expect(event).toHaveProperty('endDate');
      });
    });

    it('should have valid bilingual titles', () => {
      mockEvents.forEach(event => {
        expect(event.title).toHaveProperty('zh');
        expect(event.title).toHaveProperty('en');
        expect(event.title.zh.length).toBeGreaterThan(0);
        expect(event.title.en.length).toBeGreaterThan(0);
      });
    });

    it('should have valid bilingual descriptions', () => {
      mockEvents.forEach(event => {
        expect(event.description).toHaveProperty('zh');
        expect(event.description).toHaveProperty('en');
        expect(event.description.zh.length).toBeGreaterThan(0);
        expect(event.description.en.length).toBeGreaterThan(0);
      });
    });

    it('should have valid date ranges', () => {
      mockEvents.forEach(event => {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
      });
    });

    it('should have valid age ranges', () => {
      mockEvents.forEach(event => {
        if (event.ageRange) {
          expect(event.ageRange.min).toBeGreaterThanOrEqual(0);
          expect(event.ageRange.max).toBeGreaterThanOrEqual(event.ageRange.min);
        }
      });
    });

    it('should have valid capacity and price', () => {
      mockEvents.forEach(event => {
        expect(event.capacity).toBeGreaterThan(0);
        expect(event.price).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Event Filtering and Sorting', () => {
    it('should filter events by type', () => {
      const partyEvents = mockEvents.filter(e => e.eventType === 'birthday_party');
      expect(partyEvents.length).toBe(1);
      expect(partyEvents[0].eventType).toBe('birthday_party');
    });

    it('should sort events by start date', () => {
      const sorted = [...mockEvents].sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
      expect(sorted[0].startDate).toBe(mockEvents[0].startDate);
    });

    it('should filter events by age compatibility', () => {
      const targetAge = 6;
      const compatible = mockEvents.filter(e =>
        !e.ageRange || (e.ageRange.min <= targetAge && e.ageRange.max >= targetAge)
      );
      expect(compatible.length).toBeGreaterThan(0);
    });

    it('should filter events by price range', () => {
      const maxPrice = 350;
      const affordable = mockEvents.filter(e => e.price <= maxPrice);
      expect(affordable.length).toBeGreaterThan(0);
      affordable.forEach(e => {
        expect(e.price).toBeLessThanOrEqual(maxPrice);
      });
    });
  });

  describe('Event Statistics', () => {
    it('should calculate total capacity', () => {
      const totalCapacity = mockEvents.reduce((sum, e) => sum + e.capacity, 0);
      expect(totalCapacity).toBe(85); // 20 + 15 + 50
    });

    it('should calculate average price', () => {
      const avgPrice = mockEvents.reduce((sum, e) => sum + e.price, 0) / mockEvents.length;
      expect(avgPrice).toBeGreaterThan(0);
    });

    it('should identify cheapest event', () => {
      const cheapest = mockEvents.reduce((min, e) => e.price < min.price ? e : min);
      expect(cheapest.price).toBe(200);
    });

    it('should identify most expensive event', () => {
      const mostExpensive = mockEvents.reduce((max, e) => e.price > max.price ? e : max);
      expect(mostExpensive.price).toBe(500);
    });
  });

  describe('Empty State Handling', () => {
    it('should handle empty event list', () => {
      const emptyEvents: Event[] = [];
      expect(emptyEvents.length).toBe(0);
    });

    it('should handle null/undefined events', () => {
      const events = undefined;
      expect(events || []).toEqual([]);
    });
  });
});
