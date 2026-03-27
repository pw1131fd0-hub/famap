import { describe, it, expect, beforeEach, vi } from 'vitest';
import errorTracker, {
  initializeSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
} from '../utils/sentryConfig';

describe('sentryConfig - Error Tracking System', () => {
  beforeEach(() => {
    // Clear errors and breadcrumbs before each test
    errorTracker.clearErrors();
    errorTracker.clearBreadcrumbs();
    vi.restoreAllMocks();
  });

  describe('addBreadcrumb', () => {
    it('should add a breadcrumb entry', () => {
      addBreadcrumb('Test message', 'info', 'test');
      const breadcrumbs = errorTracker.getBreadcrumbs();
      expect(breadcrumbs.length).toBeGreaterThan(0);
      expect(breadcrumbs[breadcrumbs.length - 1].message).toBe('Test message');
      expect(breadcrumbs[breadcrumbs.length - 1].level).toBe('info');
      expect(breadcrumbs[breadcrumbs.length - 1].category).toBe('test');
    });

    it('should add breadcrumb with data', () => {
      const data = { key: 'value', count: 42 };
      addBreadcrumb('Message with data', 'warning', 'test', data);
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      expect(lastBreadcrumb.data).toEqual(data);
    });

    it('should maintain breadcrumb max length limit', () => {
      // Add more than max breadcrumbs
      for (let i = 0; i < 60; i++) {
        addBreadcrumb(`Message ${i}`, 'info', 'test');
      }
      const breadcrumbs = errorTracker.getBreadcrumbs();
      expect(breadcrumbs.length).toBeLessThanOrEqual(50);
    });

    it('should set default values for optional parameters', () => {
      addBreadcrumb('Simple message');
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      expect(lastBreadcrumb.level).toBe('info');
      expect(lastBreadcrumb.category).toBe('custom');
      expect(lastBreadcrumb.data).toBeUndefined();
    });

    it('should record timestamp for each breadcrumb', () => {
      const before = Date.now();
      addBreadcrumb('Timestamped message', 'info', 'test');
      const after = Date.now();
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      expect(lastBreadcrumb.timestamp).toBeGreaterThanOrEqual(before);
      expect(lastBreadcrumb.timestamp).toBeLessThanOrEqual(after + 100);
    });
  });

  describe('captureException', () => {
    it('should capture Error object', () => {
      const error = new Error('Test error');
      const errorId = captureException(error);
      expect(errorId).toBeDefined();
      expect(errorId).toMatch(/^error-/);
      const errors = errorTracker.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[errors.length - 1].error).toBe(error);
    });

    it('should capture string as error', () => {
      const errorMessage = 'String error';
      captureException(errorMessage);
      const errors = errorTracker.getErrors();
      expect(errors[errors.length - 1].error).toBe(errorMessage);
    });

    it('should capture error with context', () => {
      const context = { userId: '123', action: 'test' };
      captureException('Test error', context);
      const errors = errorTracker.getErrors();
      expect(errors[errors.length - 1].context).toEqual(context);
    });

    it('should include breadcrumbs with captured exception', () => {
      addBreadcrumb('Before error', 'info', 'test');
      captureException('Error with breadcrumbs');
      const errors = errorTracker.getErrors();
      const lastError = errors[errors.length - 1];
      expect(lastError.breadcrumbs.length).toBeGreaterThan(0);
    });

    it('should limit stored errors', () => {
      for (let i = 0; i < 120; i++) {
        captureException(`Error ${i}`);
      }
      const errors = errorTracker.getErrors();
      expect(errors.length).toBeLessThanOrEqual(100);
    });

    it('should return unique error IDs', () => {
      const id1 = captureException('Error 1');
      const id2 = captureException('Error 2');
      expect(id1).not.toBe(id2);
    });
  });

  describe('captureMessage', () => {
    it('should capture info message', () => {
      captureMessage('Info message', 'info');
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      expect(lastBreadcrumb.message).toBe('Info message');
      expect(lastBreadcrumb.level).toBe('info');
    });

    it('should capture warning message', () => {
      captureMessage('Warning message', 'warning');
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      expect(lastBreadcrumb.level).toBe('warning');
    });

    it('should capture error message', () => {
      captureMessage('Error message', 'error');
      const errors = errorTracker.getErrors();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should use default info level', () => {
      captureMessage('Default level message');
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      expect(lastBreadcrumb.level).toBe('info');
    });
  });

  describe('User Context', () => {
    it('should set user context', () => {
      setUserContext('user-123', 'user@example.com', 'john_doe');
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const userContextBreadcrumb = breadcrumbs.find((b) => b.message.includes('User context set'));
      expect(userContextBreadcrumb).toBeDefined();
      expect(userContextBreadcrumb?.data).toEqual({
        email: 'user@example.com',
        username: 'john_doe',
      });
    });

    it('should clear user context', () => {
      setUserContext('user-123');
      clearUserContext();
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const clearBreadcrumb = breadcrumbs.find((b) => b.message.includes('User context cleared'));
      expect(clearBreadcrumb).toBeDefined();
    });

    it('should set user context without email and username', () => {
      setUserContext('user-456');
      const breadcrumbs = errorTracker.getBreadcrumbs();
      const userContextBreadcrumb = breadcrumbs.find((b) => b.message.includes('user-456'));
      expect(userContextBreadcrumb).toBeDefined();
    });
  });

  describe('Error Storage and Management', () => {
    it('should return all errors', () => {
      captureException('Error 1');
      captureException('Error 2');
      const errors = errorTracker.getErrors();
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should return all breadcrumbs', () => {
      addBreadcrumb('Crumb 1', 'info', 'test');
      addBreadcrumb('Crumb 2', 'warning', 'test');
      const breadcrumbs = errorTracker.getBreadcrumbs();
      expect(breadcrumbs.length).toBeGreaterThanOrEqual(2);
    });

    it('should clear all errors', () => {
      captureException('Error 1');
      captureException('Error 2');
      errorTracker.clearErrors();
      const errors = errorTracker.getErrors();
      expect(errors.length).toBe(0);
    });

    it('should clear all breadcrumbs', () => {
      addBreadcrumb('Crumb 1', 'info', 'test');
      addBreadcrumb('Crumb 2', 'warning', 'test');
      errorTracker.clearBreadcrumbs();
      const breadcrumbs = errorTracker.getBreadcrumbs();
      expect(breadcrumbs.length).toBe(0);
    });
  });

  describe('Initialization', () => {
    it('should initialize sentry', () => {
      // Initialize error tracker
      initializeSentry();
      const breadcrumbs = errorTracker.getBreadcrumbs();
      // Verify initialization was called (breadcrumbs should exist)
      expect(breadcrumbs).toBeDefined();
      expect(Array.isArray(breadcrumbs)).toBe(true);
    });
  });

  describe('Error tracking completeness', () => {
    it('should provide comprehensive error information', () => {
      const testError = new Error('Test error message');
      const context = { action: 'test_action', componentId: '123' };
      const errorId = captureException(testError, context);

      const errors = errorTracker.getErrors();
      const trackedError = errors.find((e) => e.id === errorId);

      expect(trackedError).toBeDefined();
      expect(trackedError?.id).toBe(errorId);
      expect(trackedError?.timestamp).toBeDefined();
      expect(trackedError?.error).toBe(testError);
      expect(trackedError?.context).toEqual(context);
      expect(trackedError?.breadcrumbs).toBeDefined();
      expect(Array.isArray(trackedError?.breadcrumbs)).toBe(true);
    });

    it('should distinguish between different error levels', () => {
      addBreadcrumb('Debug message', 'debug', 'test');
      addBreadcrumb('Info message', 'info', 'test');
      addBreadcrumb('Warning message', 'warning', 'test');
      addBreadcrumb('Error message', 'error', 'test');
      addBreadcrumb('Fatal message', 'fatal', 'test');

      const breadcrumbs = errorTracker.getBreadcrumbs();
      const levels = breadcrumbs.map((b) => b.level);
      expect(levels).toContain('debug');
      expect(levels).toContain('info');
      expect(levels).toContain('warning');
      expect(levels).toContain('error');
      expect(levels).toContain('fatal');
    });
  });

  describe('Breadcrumb categorization', () => {
    it('should support different breadcrumb categories', () => {
      addBreadcrumb('Auth action', 'info', 'auth');
      addBreadcrumb('API call', 'info', 'api');
      addBreadcrumb('UI interaction', 'info', 'ui');
      addBreadcrumb('Custom action', 'info', 'custom');

      const breadcrumbs = errorTracker.getBreadcrumbs();
      const categories = breadcrumbs.map((b) => b.category);
      expect(categories).toContain('auth');
      expect(categories).toContain('api');
      expect(categories).toContain('ui');
      expect(categories).toContain('custom');
    });
  });
});
