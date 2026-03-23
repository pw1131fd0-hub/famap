import { describe, it, expect, beforeEach } from 'vitest';
import analytics from '../utils/analytics';

describe('Analytics System', () => {
  beforeEach(() => {
    // Reset analytics state between tests
    (analytics as any).events = [];
  });

  it('should generate a session ID', () => {
    const sessionId = analytics.getSessionId();
    expect(sessionId).toMatch(/^session_/);
  });

  it('should track page view events', () => {
    analytics.trackPageView('Home', { referrer: 'google' });
    expect(analytics.getEventCount()).toBeGreaterThan(0);
  });

  it('should track location searches', () => {
    analytics.trackLocationSearch('playground', 5);
    expect(analytics.getEventCount()).toBeGreaterThan(0);
  });

  it('should track location views', () => {
    analytics.trackLocationView('loc-123', 'park');
    expect(analytics.getEventCount()).toBeGreaterThan(0);
  });

  it('should track location favorites', () => {
    analytics.trackLocationFavorite('loc-123', true);
    expect(analytics.getEventCount()).toBeGreaterThan(0);
  });

  it('should track route planning', () => {
    analytics.trackRoutePlan(3, 500);
    expect(analytics.getEventCount()).toBeGreaterThan(0);
  });

  it('should track suggestion clicks', () => {
    analytics.trackSuggestionClick('sugg-456', 0);
    expect(analytics.getEventCount()).toBeGreaterThan(0);
  });

  it('should track errors', () => {
    const error = new Error('Test error');
    analytics.trackError(error, 'test-context');
    expect(analytics.getEventCount()).toBeGreaterThan(0);
  });

  it('should track API errors', () => {
    analytics.trackApiError('/api/locations', 500, 'Server error');
    expect(analytics.getEventCount()).toBeGreaterThan(0);
  });

  it('should calculate session duration', () => {
    const duration = analytics.getSessionDuration();
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});
