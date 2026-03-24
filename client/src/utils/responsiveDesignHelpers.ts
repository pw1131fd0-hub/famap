/**
 * Responsive Design Helpers
 * Utilities for mobile-first responsive design optimization
 */

export const BREAKPOINTS = {
  MOBILE: 480,     // Small phones
  TABLET: 768,     // Tablets
  DESKTOP: 1024,   // Desktops
  LARGE_DESKTOP: 1440  // Large screens
};

export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

/**
 * Get current device type based on window width
 */
export function getCurrentDeviceType(): string {
  if (typeof window === 'undefined') return DEVICE_TYPES.DESKTOP;

  const width = window.innerWidth;
  if (width < BREAKPOINTS.TABLET) return DEVICE_TYPES.MOBILE;
  if (width < BREAKPOINTS.DESKTOP) return DEVICE_TYPES.TABLET;
  return DEVICE_TYPES.DESKTOP;
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return getCurrentDeviceType() === DEVICE_TYPES.MOBILE;
}

/**
 * Check if device is tablet or smaller
 */
export function isTabletOrSmaller(): boolean {
  return getCurrentDeviceType() !== DEVICE_TYPES.DESKTOP;
}

/**
 * Get optimized component dimensions for current device
 */
export function getOptimizedDimensions(deviceType: string): {
  sidebarWidth: string;
  mapHeightMobile: string;
  panelMaxWidth: string;
  touchTargetSize: number;
  paddingUnit: string;
} {
  switch (deviceType) {
    case DEVICE_TYPES.MOBILE:
      return {
        sidebarWidth: '100%',
        mapHeightMobile: '60vh',
        panelMaxWidth: '100%',
        touchTargetSize: 44, // Minimum touch target size
        paddingUnit: '8px'
      };
    case DEVICE_TYPES.TABLET:
      return {
        sidebarWidth: '40%',
        mapHeightMobile: '70vh',
        panelMaxWidth: '600px',
        touchTargetSize: 44,
        paddingUnit: '12px'
      };
    default: // DESKTOP
      return {
        sidebarWidth: '30%',
        mapHeightMobile: '100vh',
        panelMaxWidth: '500px',
        touchTargetSize: 40,
        paddingUnit: '16px'
      };
  }
}

/**
 * Check if using touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    (navigator as any).maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get optimal font size for current device
 */
export function getOptimalFontSize(baseSize: number, deviceType?: string): string {
  const device = deviceType || getCurrentDeviceType();

  switch (device) {
    case DEVICE_TYPES.MOBILE:
      // Reduce font size slightly for mobile to fit more content
      return `${Math.max(baseSize - 2, 12)}px`;
    case DEVICE_TYPES.TABLET:
      return `${baseSize}px`;
    default: // DESKTOP
      // Slightly larger on desktop for better readability
      return `${baseSize + 1}px`;
  }
}

/**
 * Responsive padding/spacing helper
 */
export function getResponsiveSpacing(type: 'compact' | 'normal' | 'relaxed'): string {
  const device = getCurrentDeviceType();
  const spacings = {
    compact: { mobile: '4px', tablet: '8px', desktop: '12px' },
    normal: { mobile: '8px', tablet: '12px', desktop: '16px' },
    relaxed: { mobile: '12px', tablet: '16px', desktop: '24px' }
  };

  const map = spacings[type];
  switch (device) {
    case DEVICE_TYPES.MOBILE:
      return map.mobile;
    case DEVICE_TYPES.TABLET:
      return map.tablet;
    default:
      return map.desktop;
  }
}

/**
 * Get optimized grid columns for responsive layout
 */
export function getResponsiveGridColumns(deviceType?: string): number {
  const device = deviceType || getCurrentDeviceType();

  switch (device) {
    case DEVICE_TYPES.MOBILE:
      return 1;
    case DEVICE_TYPES.TABLET:
      return 2;
    default:
      return 3;
  }
}

/**
 * Optimize image for device (returns appropriate image size)
 */
export function getOptimizedImageSize(originalWidth: number, deviceType?: string): number {
  const device = deviceType || getCurrentDeviceType();

  // Avoid serving unnecessarily large images
  switch (device) {
    case DEVICE_TYPES.MOBILE:
      return Math.min(originalWidth, 480);
    case DEVICE_TYPES.TABLET:
      return Math.min(originalWidth, 768);
    default:
      return Math.min(originalWidth, 1024);
  }
}

/**
 * CSS media query strings for common breakpoints
 */
export const mediaQueries = {
  mobile: `@media (max-width: ${BREAKPOINTS.TABLET - 1}px)`,
  tablet: `@media (min-width: ${BREAKPOINTS.TABLET}px) and (max-width: ${BREAKPOINTS.DESKTOP - 1}px)`,
  desktop: `@media (min-width: ${BREAKPOINTS.DESKTOP}px)`,
  largeDesktop: `@media (min-width: ${BREAKPOINTS.LARGE_DESKTOP}px)`,
  mobileAndTablet: `@media (max-width: ${BREAKPOINTS.DESKTOP - 1}px)`,
  tabletAndUp: `@media (min-width: ${BREAKPOINTS.TABLET}px)`,
};

/**
 * Get responsive CSS class names
 */
export function getResponsiveClasses(baseClass: string): string {
  const device = getCurrentDeviceType();
  return `${baseClass} ${baseClass}--${device}`;
}

/**
 * Safe area (for devices with notches, etc.)
 */
export const SAFE_AREA_CSS = `
  .safe-area-inset {
    padding-top: max(16px, env(safe-area-inset-top));
    padding-right: max(16px, env(safe-area-inset-right));
    padding-bottom: max(16px, env(safe-area-inset-bottom));
    padding-left: max(16px, env(safe-area-inset-left));
  }
`;
