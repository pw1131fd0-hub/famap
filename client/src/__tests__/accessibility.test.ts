import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCategoryA11yLabel,
  getFacilityA11yLabel,
  announceToScreenReader,
  getDistanceAnnouncement,
} from '../utils/accessibility';

describe('Accessibility Utilities', () => {
  describe('getCategoryA11yLabel', () => {
    it('returns Chinese label for park category', () => {
      const label = getCategoryA11yLabel('park', 'zh');
      expect(label).toBe('公園');
    });

    it('returns English label for park category', () => {
      const label = getCategoryA11yLabel('park', 'en');
      expect(label).toBe('Park');
    });

    it('returns category name for unknown category', () => {
      const label = getCategoryA11yLabel('unknown', 'zh');
      expect(label).toBe('unknown');
    });

    it('returns Chinese label for nursing room', () => {
      const label = getCategoryA11yLabel('nursing_room', 'zh');
      expect(label).toBe('哺乳室');
    });
  });

  describe('getFacilityA11yLabel', () => {
    it('returns Chinese label for changing table', () => {
      const label = getFacilityA11yLabel('changing_table', 'zh');
      expect(label).toBe('換尿布台');
    });

    it('returns English label for stroller accessible', () => {
      const label = getFacilityA11yLabel('stroller_accessible', 'en');
      expect(label).toBe('Stroller Accessible');
    });

    it('returns facility name for unknown facility', () => {
      const label = getFacilityA11yLabel('unknown_facility', 'zh');
      expect(label).toBe('unknown_facility');
    });
  });

  describe('getDistanceAnnouncement', () => {
    it('returns Chinese announcement for distance less than 1km', () => {
      const announcement = getDistanceAnnouncement(0.5, 'zh');
      expect(announcement).toBe('距離少於1公里');
    });

    it('returns Chinese announcement for distance between 1-10km', () => {
      const announcement = getDistanceAnnouncement(5.5, 'zh');
      expect(announcement).toContain('5.5');
      expect(announcement).toContain('公里');
    });

    it('returns Chinese announcement for distance over 10km', () => {
      const announcement = getDistanceAnnouncement(15.7, 'zh');
      expect(announcement).toContain('16'); // rounded
      expect(announcement).toContain('公里');
    });

    it('returns English announcement for distance less than 1km', () => {
      const announcement = getDistanceAnnouncement(0.5, 'en');
      expect(announcement).toBe('Less than 1 km away');
    });

    it('returns English announcement for distance between 1-10km', () => {
      const announcement = getDistanceAnnouncement(5.5, 'en');
      expect(announcement).toContain('5.5');
      expect(announcement).toContain('km');
    });
  });

  describe('announceToScreenReader', () => {
    beforeEach(() => {
      // Clean up any existing announcer
      const existing = document.getElementById('sr-announcer');
      if (existing) {
        existing.remove();
      }
    });

    it('creates a screen reader announcement element', () => {
      announceToScreenReader('Test announcement');
      const announcer = document.getElementById('sr-announcer');
      expect(announcer).toBeTruthy();
      expect(announcer?.textContent).toBe('Test announcement');
    });

    it('sets correct ARIA attributes', () => {
      announceToScreenReader('Test', 'assertive');
      const announcer = document.getElementById('sr-announcer');
      expect(announcer?.getAttribute('role')).toBe('status');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
      expect(announcer?.getAttribute('aria-atomic')).toBe('true');
    });

    it('uses polite priority by default', () => {
      announceToScreenReader('Test');
      const announcer = document.getElementById('sr-announcer');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });
  });
});
