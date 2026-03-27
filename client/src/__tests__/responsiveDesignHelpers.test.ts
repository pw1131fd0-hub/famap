/**
 * Tests for responsive design helpers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  BREAKPOINTS,
  DEVICE_TYPES,
  getCurrentDeviceType,
  isMobileDevice,
  isTabletOrSmaller,
  getOptimizedDimensions,
  isTouchDevice,
  getOptimalFontSize,
  getResponsiveSpacing,
  getResponsiveGridColumns,
  getOptimizedImageSize,
  mediaQueries,
  getResponsiveClasses
} from '../utils/responsiveDesignHelpers';

describe('responsiveDesignHelpers', () => {
  beforeEach(() => {
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024
    });
  });

  describe('BREAKPOINTS', () => {
    it('should have correct mobile breakpoint', () => {
      expect(BREAKPOINTS.MOBILE).toBe(480);
    });

    it('should have correct tablet breakpoint', () => {
      expect(BREAKPOINTS.TABLET).toBe(768);
    });

    it('should have correct desktop breakpoint', () => {
      expect(BREAKPOINTS.DESKTOP).toBe(1024);
    });

    it('should have correct large desktop breakpoint', () => {
      expect(BREAKPOINTS.LARGE_DESKTOP).toBe(1440);
    });

    it('should have breakpoints in ascending order', () => {
      expect(BREAKPOINTS.MOBILE).toBeLessThan(BREAKPOINTS.TABLET);
      expect(BREAKPOINTS.TABLET).toBeLessThan(BREAKPOINTS.DESKTOP);
      expect(BREAKPOINTS.DESKTOP).toBeLessThan(BREAKPOINTS.LARGE_DESKTOP);
    });
  });

  describe('DEVICE_TYPES', () => {
    it('should have mobile device type', () => {
      expect(DEVICE_TYPES.MOBILE).toBe('mobile');
    });

    it('should have tablet device type', () => {
      expect(DEVICE_TYPES.TABLET).toBe('tablet');
    });

    it('should have desktop device type', () => {
      expect(DEVICE_TYPES.DESKTOP).toBe('desktop');
    });
  });

  describe('getCurrentDeviceType', () => {
    it('should return mobile for small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      expect(getCurrentDeviceType()).toBe(DEVICE_TYPES.MOBILE);
    });

    it('should return mobile for screens at mobile breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: BREAKPOINTS.MOBILE
      });
      expect(getCurrentDeviceType()).toBe(DEVICE_TYPES.MOBILE);
    });

    it('should return tablet for medium screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800
      });
      expect(getCurrentDeviceType()).toBe(DEVICE_TYPES.TABLET);
    });

    it('should return tablet for screens at tablet breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: BREAKPOINTS.TABLET
      });
      expect(getCurrentDeviceType()).toBe(DEVICE_TYPES.TABLET);
    });

    it('should return desktop for large screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      });
      expect(getCurrentDeviceType()).toBe(DEVICE_TYPES.DESKTOP);
    });

    it('should return desktop for screens at desktop breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: BREAKPOINTS.DESKTOP
      });
      expect(getCurrentDeviceType()).toBe(DEVICE_TYPES.DESKTOP);
    });

    it('should return desktop when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error Testing undefined window
      delete global.window;
      expect(getCurrentDeviceType()).toBe(DEVICE_TYPES.DESKTOP);
      global.window = originalWindow;
    });
  });

  describe('isMobileDevice', () => {
    it('should return true for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      expect(isMobileDevice()).toBe(true);
    });

    it('should return false for tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800
      });
      expect(isMobileDevice()).toBe(false);
    });

    it('should return false for desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      });
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('isTabletOrSmaller', () => {
    it('should return true for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      expect(isTabletOrSmaller()).toBe(true);
    });

    it('should return true for tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800
      });
      expect(isTabletOrSmaller()).toBe(true);
    });

    it('should return false for desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      });
      expect(isTabletOrSmaller()).toBe(false);
    });
  });

  describe('getOptimizedDimensions', () => {
    it('should return mobile dimensions for mobile device', () => {
      const dims = getOptimizedDimensions(DEVICE_TYPES.MOBILE);
      expect(dims.sidebarWidth).toBe('100%');
      expect(dims.mapHeightMobile).toBe('60vh');
      expect(dims.panelMaxWidth).toBe('100%');
      expect(dims.touchTargetSize).toBe(44);
      expect(dims.paddingUnit).toBe('8px');
    });

    it('should return tablet dimensions for tablet device', () => {
      const dims = getOptimizedDimensions(DEVICE_TYPES.TABLET);
      expect(dims.sidebarWidth).toBe('40%');
      expect(dims.mapHeightMobile).toBe('70vh');
      expect(dims.panelMaxWidth).toBe('600px');
      expect(dims.touchTargetSize).toBe(44);
      expect(dims.paddingUnit).toBe('12px');
    });

    it('should return desktop dimensions for desktop device', () => {
      const dims = getOptimizedDimensions(DEVICE_TYPES.DESKTOP);
      expect(dims.sidebarWidth).toBe('30%');
      expect(dims.mapHeightMobile).toBe('100vh');
      expect(dims.panelMaxWidth).toBe('500px');
      expect(dims.touchTargetSize).toBe(40);
      expect(dims.paddingUnit).toBe('16px');
    });

    it('should return desktop dimensions for unknown device type', () => {
      const dims = getOptimizedDimensions('unknown');
      expect(dims.sidebarWidth).toBe('30%');
      expect(dims.touchTargetSize).toBe(40);
    });
  });

  describe('isTouchDevice', () => {
    it('should detect touch capability', () => {
      const result = isTouchDevice();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getOptimalFontSize', () => {
    it('should reduce font size for mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      const fontSize = getOptimalFontSize(16);
      const size = parseInt(fontSize);
      expect(size).toBeLessThan(16);
      expect(size).toBeGreaterThanOrEqual(12);
    });

    it('should keep base size for tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800
      });
      const fontSize = getOptimalFontSize(16);
      expect(fontSize).toBe('16px');
    });

    it('should increase font size for desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      });
      const fontSize = getOptimalFontSize(16);
      expect(fontSize).toBe('17px');
    });

    it('should use provided device type', () => {
      const fontSize = getOptimalFontSize(16, DEVICE_TYPES.DESKTOP);
      expect(fontSize).toBe('17px');
    });

    it('should maintain minimum font size of 12px', () => {
      const fontSize = getOptimalFontSize(12);
      const size = parseInt(fontSize);
      expect(size).toBeGreaterThanOrEqual(12);
    });
  });

  describe('getResponsiveSpacing', () => {
    it('should return compact spacing', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      expect(getResponsiveSpacing('compact')).toBe('4px');
    });

    it('should return normal spacing', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      expect(getResponsiveSpacing('normal')).toBe('8px');
    });

    it('should return relaxed spacing', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      expect(getResponsiveSpacing('relaxed')).toBe('12px');
    });

    it('should increase spacing for tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800
      });
      expect(getResponsiveSpacing('normal')).toBe('12px');
    });

    it('should increase spacing for desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      });
      expect(getResponsiveSpacing('normal')).toBe('16px');
    });
  });

  describe('getResponsiveGridColumns', () => {
    it('should return 1 column for mobile', () => {
      expect(getResponsiveGridColumns(DEVICE_TYPES.MOBILE)).toBe(1);
    });

    it('should return 2 columns for tablet', () => {
      expect(getResponsiveGridColumns(DEVICE_TYPES.TABLET)).toBe(2);
    });

    it('should return 3 columns for desktop', () => {
      expect(getResponsiveGridColumns(DEVICE_TYPES.DESKTOP)).toBe(3);
    });

    it('should use current device when not specified', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      expect(getResponsiveGridColumns()).toBe(1);
    });
  });

  describe('getOptimizedImageSize', () => {
    it('should limit mobile images to 480px', () => {
      expect(getOptimizedImageSize(1000, DEVICE_TYPES.MOBILE)).toBe(480);
    });

    it('should not upscale mobile images', () => {
      expect(getOptimizedImageSize(300, DEVICE_TYPES.MOBILE)).toBe(300);
    });

    it('should limit tablet images to 768px', () => {
      expect(getOptimizedImageSize(1000, DEVICE_TYPES.TABLET)).toBe(768);
    });

    it('should limit desktop images to 1024px', () => {
      expect(getOptimizedImageSize(2000, DEVICE_TYPES.DESKTOP)).toBe(1024);
    });

    it('should use current device when not specified', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      expect(getOptimizedImageSize(1000)).toBe(480);
    });
  });

  describe('mediaQueries', () => {
    it('should have mobile media query', () => {
      expect(mediaQueries.mobile).toContain('@media');
      expect(mediaQueries.mobile).toContain('max-width');
    });

    it('should have tablet media query', () => {
      expect(mediaQueries.tablet).toContain('@media');
      expect(mediaQueries.tablet).toContain('min-width');
      expect(mediaQueries.tablet).toContain('max-width');
    });

    it('should have desktop media query', () => {
      expect(mediaQueries.desktop).toContain('@media');
      expect(mediaQueries.desktop).toContain('min-width');
    });

    it('should have large desktop media query', () => {
      expect(mediaQueries.largeDesktop).toContain('@media');
      expect(mediaQueries.largeDesktop).toContain(`${BREAKPOINTS.LARGE_DESKTOP}px`);
    });

    it('should have mobile and tablet media query', () => {
      expect(mediaQueries.mobileAndTablet).toContain('@media');
      expect(mediaQueries.mobileAndTablet).toContain('max-width');
    });

    it('should have tablet and up media query', () => {
      expect(mediaQueries.tabletAndUp).toContain('@media');
      expect(mediaQueries.tabletAndUp).toContain(`${BREAKPOINTS.TABLET}px`);
    });
  });

  describe('getResponsiveClasses', () => {
    it('should include base class', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      });
      const classes = getResponsiveClasses('panel');
      expect(classes).toContain('panel');
    });

    it('should include device-specific class', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });
      const classes = getResponsiveClasses('panel');
      expect(classes).toContain('panel--mobile');
    });

    it('should include desktop class for desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      });
      const classes = getResponsiveClasses('panel');
      expect(classes).toContain('panel--desktop');
    });

    it('should include tablet class for tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800
      });
      const classes = getResponsiveClasses('panel');
      expect(classes).toContain('panel--tablet');
    });
  });

  describe('integration scenarios', () => {
    it('should handle responsive layout for mobile app', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375
      });

      expect(isMobileDevice()).toBe(true);
      expect(getResponsiveGridColumns()).toBe(1);
      const dims = getOptimizedDimensions(getCurrentDeviceType());
      expect(dims.panelMaxWidth).toBe('100%');
      expect(getResponsiveSpacing('normal')).toBe('8px');
    });

    it('should handle responsive layout for tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768
      });

      expect(isTabletOrSmaller()).toBe(true);
      expect(isMobileDevice()).toBe(false);
      expect(getResponsiveGridColumns()).toBe(2);
      const dims = getOptimizedDimensions(getCurrentDeviceType());
      expect(dims.sidebarWidth).toBe('40%');
    });

    it('should handle responsive layout for desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1920
      });

      expect(isTabletOrSmaller()).toBe(false);
      expect(getResponsiveGridColumns()).toBe(3);
      const dims = getOptimizedDimensions(getCurrentDeviceType());
      expect(dims.mapHeightMobile).toBe('100vh');
    });
  });
});
