/**
 * FamMap Utilities Index
 * Centralizes all utility exports for easier importing
 */

// Analytics and tracking
export * from './analyticsEngine';
export * from './healthMonitoring';
export * from './performanceMonitoring';
export * from './userBehaviorTracking';

// Location and search utilities
export { searchLocations, calculateDistance } from './searchUtils';
export * from './locationUtils';
export * from './locationComparison';

// Recommendation systems
export * from './familyRecommender';
export * from './venueInsights';
export * from './locationInsights';
export * from './weatherAwareRecommender';
export * from './bestTimeVisitPredictor';
export * from './venueQualityAssessment';

// Activity and event planning
export * from './activityPlanner';
export * from './outingPlanner';
export * from './smartTripSuggester';
export * from './weeklyOutingPlanner';

// Cost and budget
export * from './tripCostCalculator';

// Multi-venue optimization
export * from './multiVenueOptimizer';
export * from './familyVenueConsensus';

// Family group management
export * from './familyGroupOptimizer';

// Network and caching
export * from './networkState';
export { cacheWarmingManager } from './cacheWarmingStrategy';
export type { CacheWarmingConfig, CacheStrategy } from './cacheWarmingStrategy';

// User preferences and context
export * from './userPreferences';
export type { ChildProfile, FamilyProfile, FamilyType } from './familyContext';
export * from './childDevelopmentStages';

// Notifications and alerts
export * from './smartNotificationEngine';
export * from './alertSystem';

// Community features
export * from './familyCommunity';

// Saved searches
export * from './savedSearches';

// Trip export and management
export * from './tripExport';

// Monthly travel planning
export * from './monthlyTravelPlanner';

// Milestone and celebration planning
export * from './milestonePlanner';

// Emergency and last-minute venue finding
export * from './emergencyVenueFinder';

// Accessibility
export * from './accessibilityAssistant';
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
export * from './envConfig';

// Development utilities
export * from './devUtils';

/**
 * Re-export type definitions
 */
export type {
  Location,
  Review,
  Event,
  ActivityHistoryEntry,
  WeeklySuggestion,
} from '../types';

export default {};
