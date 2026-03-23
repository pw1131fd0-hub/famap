import { describe, it, expect, beforeEach } from 'vitest';
import errorTracker from '../utils/errorTracking';

describe('Error Tracking System', () => {
  beforeEach(() => {
    errorTracker.clearErrorLog();
  });

  it('should initialize without errors', () => {
    expect(errorTracker).toBeDefined();
  });

  it('should capture errors with context', () => {
    const error = new Error('Test error');
    errorTracker.captureError(error, {
      severity: 'high',
      component: 'TestComponent'
    });

    const log = errorTracker.getErrorLog();
    expect(log.length).toBe(1);
    expect(log[0].error.message).toBe('Test error');
    expect(log[0].context?.component).toBe('TestComponent');
  });

  it('should capture string errors', () => {
    errorTracker.captureError('String error message', {
      severity: 'medium'
    });

    const log = errorTracker.getErrorLog();
    expect(log.length).toBe(1);
    expect(log[0].error.message).toBe('String error message');
  });

  it('should capture API errors', () => {
    errorTracker.captureApiError(
      '/api/locations',
      500,
      'Internal Server Error'
    );

    const log = errorTracker.getErrorLog();
    expect(log.length).toBe(1);
    expect(log[0].context?.additionalData?.endpoint).toBe('/api/locations');
    expect(log[0].context?.additionalData?.statusCode).toBe(500);
  });

  it('should capture component errors', () => {
    const error = new Error('Component render failed');
    errorTracker.captureComponentError('MyComponent', error, { prop: 'value' });

    const log = errorTracker.getErrorLog();
    expect(log.length).toBe(1);
    expect(log[0].context?.component).toBe('MyComponent');
  });

  it('should maintain error summary', () => {
    errorTracker.captureError('Low priority', { severity: 'low' });
    errorTracker.captureError('High priority', { severity: 'high' });
    errorTracker.captureError('Critical', { severity: 'critical' });

    const summary = errorTracker.getErrorSummary();
    expect(summary.totalErrors).toBe(3);
    expect(summary.byServerity.low).toBe(1);
    expect(summary.byServerity.high).toBe(1);
    expect(summary.byServerity.critical).toBe(1);
  });

  it('should enforce max log size', () => {
    for (let i = 0; i < 150; i++) {
      errorTracker.captureError(`Error ${i}`);
    }

    const log = errorTracker.getErrorLog();
    expect(log.length).toBeLessThanOrEqual(100);
  });

  it('should clear error log', () => {
    errorTracker.captureError('Test error');
    expect(errorTracker.getErrorLog().length).toBeGreaterThan(0);

    errorTracker.clearErrorLog();
    expect(errorTracker.getErrorLog().length).toBe(0);
  });
});
