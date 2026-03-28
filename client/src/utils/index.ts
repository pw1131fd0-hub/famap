/**
 * FamMap Utilities Index
 * Centralizes all utility exports for easier importing
 */

// Analytics and tracking
export { default as analyticsEngine } from './analyticsEngine';
export { default as healthMonitoring } from './healthMonitoring';
export { default as performanceMonitoring } from './performanceMonitoring';
export { default as userBehaviorTracking } from './userBehaviorTracking';

// Location and search utilities
export { searchLocations, filterByCategory, calculateDistance, sortByDistance, getLocationBounds } from './searchUtils';
export { getLocationImage, validateLocation, formatLocationAddress, getLocationDetails } from './locationUtils';
export { default as locationComparison } from './locationComparison';

// Recommendation systems
export { default as familyRecommender } from './familyRecommender';
export { default as venueInsights } from './venueInsights';
export { default as locationInsights } from './locationInsights';
export { default as weatherAwareRecommender } from './weatherAwareRecommender';
export { default as bestTimeVisitPredictor } from './bestTimeVisitPredictor';

// Activity and event planning
export { default as activityPlanner } from './activityPlanner';
export { default as outingPlanner } from './outingPlanner';
export { default as smartTripSuggester } from './smartTripSuggester';
export { default as weeklyOutingPlanner } from './weeklyOutingPlanner';

// Cost and budget
export { default as tripCostCalculator } from './tripCostCalculator';

// Multi-venue optimization
export { default as multiVenueOptimizer } from './multiVenueOptimizer';
export { default as familyVenueConsensus } from './familyVenueConsensus';

// Network and caching
export { default as networkState } from './networkState';
export { default as cacheWarmingStrategy } from './cacheWarmingStrategy';

// User preferences and context
export { default as userPreferences } from './userPreferences';
export { default as familyContext } from './familyContext';
export { default as childDevelopmentStages } from './childDevelopmentStages';

// Notifications and alerts
export { default as smartNotificationEngine } from './smartNotificationEngine';
export { default as alertSystem } from './alertSystem';

// Community features
export * from './familyCommunity';

// Saved searches
export * from './savedSearches';

// Trip export and management
export * from './tripExport';

// Accessibility
export * from './accessibilityHelpers';

// Error handling
export * from './enhancedErrorHandling';
export * from './errorTracking';
export { default as sentryConfig, captureException, addBreadcrumb } from './sentryConfig';

// Responsive design
export * from './responsiveDesignHelpers';

// SEO and meta tags
export * from './metaTagManager';

// Environment configuration
export { loadEnvConfig, validateEnvVariables, getEnv, isDevelopment, isProduction } from './envConfig';

// Development utilities
export {
  assert,
  devAssert,
  log,
  PerformanceHelper,
  perfHelper,
  is,
  safeJSON,
  safeStorage,
  debounce,
  throttle,
  retry,
  ifDev,
  getEnvironment,
} from './devUtils';

/**
 * Re-export type definitions
 */
export type {
  PerformanceMetric,
  NetworkStateChangeEvent,
  Connection,
  UserPreferences,
  FamilyContext,
  Location,
  Review,
  LocationInsight,
} from '../types';

/**
 * Utility bundles for common operations
 */
export const utilities = {
  analytics: {
    trackEvent: analyticsEngine.trackEvent,
    trackPageView: analyticsEngine.trackPageView,
  },
  location: {
    search: searchLocations,
    filterByCategory,
    calculateDistance,
    sortByDistance,
  },
  recommendations: {
    family: familyRecommender,
    venue: venueInsights,
    insights: locationInsights,
    weather: weatherAwareRecommender,
    visitTime: bestTimeVisitPredictor,
  },
  network: {
    isOnline: () => networkState.isOnline(),
    isSlowConnection: () => networkState.isSlowConnection(),
    waitForOnline: (timeout?: number) => networkState.waitForOnline(timeout),
  },
};

export default utilities;
