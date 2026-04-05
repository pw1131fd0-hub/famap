/**
 * Advanced Analytics System
 * Tracks user interactions and provides insights for improving FamMap
 */

export const EventType = {
  // Navigation events
  PAGE_VIEW: 'page_view',
  NAVIGATION: 'navigation',

  // Location interactions
  LOCATION_SEARCH: 'location_search',
  LOCATION_VIEW: 'location_view',
  LOCATION_FAVORITE: 'location_favorite',
  LOCATION_FILTER: 'location_filter',

  // Route planning
  ROUTE_PLAN: 'route_plan',
  ROUTE_OPTIMIZE: 'route_optimize',
  ROUTE_VIEW: 'route_view',

  // Suggestions and recommendations
  SUGGESTION_VIEW: 'suggestion_view',
  SUGGESTION_CLICK: 'suggestion_click',
  RECOMMENDATION_CLICK: 'recommendation_click',

  // Reviews and ratings
  REVIEW_SUBMIT: 'review_submit',
  RATING_SUBMIT: 'rating_submit',

  // Search
  SEARCH: 'search',
  FILTER: 'filter',

  // Errors and issues
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  NETWORK_ERROR: 'network_error'
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

export interface AnalyticsEvent {
  eventType: EventType;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
  userAgent?: string;
  location?: {
    lat: number;
    lng: number;
  };
  sessionId?: string;
}

class Analytics {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private startTime = Date.now();
  private isDev = import.meta.env.DEV;
  private batchSize = 50;
  private batchTimeout = 30000; // 30 seconds
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPeriodicFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an analytics event
   */
  trackEvent(
    eventType: EventType,
    metadata?: Record<string, any>,
    duration?: number
  ): void {
    const event: AnalyticsEvent = {
      eventType,
      timestamp: Date.now(),
      duration,
      metadata,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId
    };

    // Try to get current user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          event.location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.addEvent(event);
        },
        () => {
          this.addEvent(event);
        }
      );
    } else {
      this.addEvent(event);
    }
  }

  private addEvent(event: AnalyticsEvent): void {
    this.events.push(event);

    if (!this.isDev) {
      // Auto-flush when batch size reached
      if (this.events.length >= this.batchSize) {
        this.flushEvents();
      }
    } else {
      // In dev mode, log to console for debugging
      console.log('[Analytics]', event.eventType, event.metadata);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, metadata?: Record<string, any>): void {
    this.trackEvent(EventType.PAGE_VIEW, {
      page: pageName,
      ...metadata
    });
  }

  /**
   * Track location search
   */
  trackLocationSearch(query: string, resultsCount: number): void {
    this.trackEvent(EventType.LOCATION_SEARCH, {
      query,
      resultsCount
    });
  }

  /**
   * Track location view
   */
  trackLocationView(locationId: string, category: string): void {
    this.trackEvent(EventType.LOCATION_VIEW, {
      locationId,
      category
    });
  }

  /**
   * Track location favorite
   */
  trackLocationFavorite(locationId: string, isFavorite: boolean): void {
    this.trackEvent(EventType.LOCATION_FAVORITE, {
      locationId,
      action: isFavorite ? 'added' : 'removed'
    });
  }

  /**
   * Track route planning
   */
  trackRoutePlan(locationCount: number, duration: number): void {
    this.trackEvent(EventType.ROUTE_PLAN, {
      locationCount
    }, duration);
  }

  /**
   * Track smart suggestions interaction
   */
  trackSuggestionClick(suggestionId: string, index: number): void {
    this.trackEvent(EventType.SUGGESTION_CLICK, {
      suggestionId,
      position: index
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: string): void {
    this.trackEvent(EventType.ERROR_OCCURRED, {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  /**
   * Track API errors
   */
  trackApiError(endpoint: string, statusCode: number, errorMessage?: string): void {
    this.trackEvent(EventType.API_ERROR, {
      endpoint,
      statusCode,
      errorMessage
    });
  }

  /**
   * Flush events to server
   */
  private flushEvents(): void {
    if (this.events.length === 0) return;

    if (!this.isDev) {
      // Send to analytics backend
      const batch = {
        sessionId: this.sessionId,
        events: this.events,
        timestamp: Date.now()
      };
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
        keepalive: true // Continue sending even if page unloads
      }).catch(() => {
        // Silently fail - analytics should never break the app
      });
    }

    // Clear events after flushing
    this.events = [];
  }

  /**
   * Setup periodic flush
   */
  private setupPeriodicFlush(): void {
    this.batchTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flushEvents();
      }
    }, this.batchTimeout) as unknown as NodeJS.Timeout;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get session duration in seconds
   */
  getSessionDuration(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Get event count
   */
  getEventCount(): number {
    return this.events.length;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.flushEvents();
  }
}

// Create singleton instance
const analyticsInstance = new Analytics();

export default analyticsInstance;
