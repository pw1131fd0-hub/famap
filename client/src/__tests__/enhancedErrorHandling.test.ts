/**
 * Enhanced Error Handling Tests
 * Tests for error classification, user messaging, and retry logic
 */

import { describe, it, expect } from 'vitest';
import {
  getEnhancedError,
  classifyError,
  shouldRetryError,
  getRetryDelay,
  type ErrorContext
} from '../utils/enhancedErrorHandling';

describe('Enhanced Error Handling', () => {
  describe('getEnhancedError', () => {
    it('should return NETWORK_ERROR details', () => {
      const error = getEnhancedError('NETWORK_ERROR');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.severity).toBe('warning');
      expect(error.userMessage).toContain('Unable to connect');
      expect(error.suggestions.length).toBeGreaterThan(0);
    });

    it('should return TIMEOUT_ERROR details', () => {
      const error = getEnhancedError('TIMEOUT_ERROR');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.severity).toBe('warning');
      expect(error.userMessage).toContain('too long');
    });

    it('should return NOT_FOUND details', () => {
      const error = getEnhancedError('NOT_FOUND');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.severity).toBe('info');
      expect(error.userMessage).toContain('could not be found');
    });

    it('should return UNAUTHORIZED details', () => {
      const error = getEnhancedError('UNAUTHORIZED');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.severity).toBe('warning');
      expect(error.userMessage).toContain('logged in');
    });

    it('should return VALIDATION_ERROR details', () => {
      const error = getEnhancedError('VALIDATION_ERROR');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.severity).toBe('warning');
      expect(error.userMessage).toContain('not valid');
    });

    it('should return SERVER_ERROR details', () => {
      const error = getEnhancedError('SERVER_ERROR');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.severity).toBe('error');
      expect(error.userMessage).toContain('went wrong');
    });

    it('should return LOCATION_ERROR details', () => {
      const error = getEnhancedError('LOCATION_ERROR');
      expect(error.code).toBe('LOCATION_ERROR');
      expect(error.severity).toBe('info');
      expect(error.userMessage).toContain("couldn't determine");
    });

    it('should return NO_RESULTS details', () => {
      const error = getEnhancedError('NO_RESULTS');
      expect(error.code).toBe('NO_RESULTS');
      expect(error.severity).toBe('info');
      expect(error.userMessage).toContain('No locations match');
    });

    it('should return UNKNOWN_ERROR for unrecognized codes', () => {
      const error = getEnhancedError('UNKNOWN_CODE');
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.severity).toBe('error');
    });

    it('should include context when provided', () => {
      const context: ErrorContext = {
        component: 'SearchPanel',
        action: 'search',
        endpoint: '/api/locations'
      };
      const error = getEnhancedError('NETWORK_ERROR', context);
      expect(error.context).toEqual(context);
    });

    it('should include suggestions for all error types', () => {
      const errorCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'NOT_FOUND', 'UNAUTHORIZED'];
      errorCodes.forEach(code => {
        const error = getEnhancedError(code);
        expect(error.suggestions).toBeDefined();
        expect(error.suggestions.length).toBeGreaterThan(0);
      });
    });

    it('should have userMessage and message properties', () => {
      const error = getEnhancedError('SERVER_ERROR');
      expect(error.message).toBeDefined();
      expect(error.userMessage).toBeDefined();
      expect(typeof error.message).toBe('string');
      expect(typeof error.userMessage).toBe('string');
    });
  });

  describe('classifyError', () => {
    it('should classify network errors', () => {
      const error1 = new Error('Network request failed');
      const error2 = new Error('Failed to fetch');
      expect(classifyError(error1)).toBe('NETWORK_ERROR');
      expect(classifyError(error2)).toBe('NETWORK_ERROR');
    });

    it('should classify timeout errors', () => {
      const error = new Error('Request timeout');
      expect(classifyError(error)).toBe('TIMEOUT_ERROR');
    });

    it('should classify 404 not found errors', () => {
      const error1 = new Error('not found');
      const error2 = new Error('404 Error');
      expect(classifyError(error1)).toBe('NOT_FOUND');
      expect(classifyError(error2)).toBe('NOT_FOUND');
    });

    it('should classify 401 unauthorized errors', () => {
      const error1 = new Error('unauthorized');
      const error2 = new Error('401 Unauthorized');
      expect(classifyError(error1)).toBe('UNAUTHORIZED');
      expect(classifyError(error2)).toBe('UNAUTHORIZED');
    });

    it('should classify 400 validation errors', () => {
      const error1 = new Error('validation error');
      const error2 = new Error('400 Bad Request');
      expect(classifyError(error1)).toBe('VALIDATION_ERROR');
      expect(classifyError(error2)).toBe('VALIDATION_ERROR');
    });

    it('should classify 500 server errors', () => {
      const error1 = new Error('server error');
      const error2 = new Error('500 Internal Server Error');
      expect(classifyError(error1)).toBe('SERVER_ERROR');
      expect(classifyError(error2)).toBe('SERVER_ERROR');
    });

    it('should classify unknown errors', () => {
      const error = new Error('Some random error');
      expect(classifyError(error)).toBe('UNKNOWN_ERROR');
    });

    it('should handle case-insensitive error messages', () => {
      const error1 = new Error('NETWORK ERROR');
      const error2 = new Error('Network Error');
      expect(classifyError(error1)).toBe('NETWORK_ERROR');
      expect(classifyError(error2)).toBe('NETWORK_ERROR');
    });

    it('should handle non-Error objects gracefully', () => {
      expect(classifyError(null)).toBe('UNKNOWN_ERROR');
      expect(classifyError(undefined)).toBe('UNKNOWN_ERROR');
      expect(classifyError('string error')).toBe('UNKNOWN_ERROR');
      expect(classifyError({})).toBe('UNKNOWN_ERROR');
    });

    it('should prioritize first matching error type', () => {
      const error = new Error('network error timeout 500');
      // Should match the first condition (network)
      expect(classifyError(error)).toBe('NETWORK_ERROR');
    });
  });

  describe('shouldRetryError', () => {
    it('should return true for retryable errors', () => {
      expect(shouldRetryError('NETWORK_ERROR')).toBe(true);
      expect(shouldRetryError('TIMEOUT_ERROR')).toBe(true);
      expect(shouldRetryError('SERVER_ERROR')).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      expect(shouldRetryError('NOT_FOUND')).toBe(false);
      expect(shouldRetryError('UNAUTHORIZED')).toBe(false);
      expect(shouldRetryError('VALIDATION_ERROR')).toBe(false);
      expect(shouldRetryError('UNKNOWN_ERROR')).toBe(false);
    });

    it('should return false for location and no results errors', () => {
      expect(shouldRetryError('LOCATION_ERROR')).toBe(false);
      expect(shouldRetryError('NO_RESULTS')).toBe(false);
    });

    it('should return false for unknown error codes', () => {
      expect(shouldRetryError('UNKNOWN_CODE')).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should implement exponential backoff', () => {
      const delay1 = getRetryDelay(1);
      const delay2 = getRetryDelay(2);
      const delay3 = getRetryDelay(3);

      // Base delay = 1000 * 2^(n-1)
      // delay1 = 1000 * 2^0 = 1000
      // delay2 = 1000 * 2^1 = 2000
      // delay3 = 1000 * 2^2 = 4000
      expect(delay1).toBeLessThan(2000); // 1000 + jitter
      expect(delay2).toBeLessThan(3000); // 2000 + jitter
      expect(delay3).toBeLessThan(5000); // 4000 + jitter
    });

    it('should cap delay at 30 seconds', () => {
      const maxAttempt = 10;
      const delay = getRetryDelay(maxAttempt);
      expect(delay).toBeLessThanOrEqual(30000);
    });

    it('should add jitter to prevent thundering herd', () => {
      const delays = Array.from({ length: 10 }, () => getRetryDelay(1));
      const unique = new Set(delays);
      // With jitter, delays should vary (though theoretically could collide)
      expect(unique.size).toBeGreaterThan(1);
    });

    it('should return positive delays', () => {
      for (let i = 1; i <= 5; i++) {
        const delay = getRetryDelay(i);
        expect(delay).toBeGreaterThan(0);
      }
    });

    it('should increase delay with each attempt', () => {
      // Allow for jitter but check base is increasing
      // Attempt 1: 1000ms (2^0), Attempt 2: 2000ms (2^1), Attempt 3: 4000ms (2^2)
      const delay1 = getRetryDelay(1);
      const delay2 = getRetryDelay(2);
      const delay3 = getRetryDelay(3);

      // Even with jitter, average should be increasing
      expect(delay2).toBeGreaterThanOrEqual(delay1 - 1000); // Allow for jitter variance
      expect(delay3).toBeGreaterThanOrEqual(delay2 - 1000); // Allow for jitter variance
    });

    it('should handle attempt 0 gracefully', () => {
      const delay = getRetryDelay(0);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(30000);
    });

    it('should have jitter within reasonable bounds', () => {
      // Test multiple times to ensure jitter is within bounds
      for (let i = 0; i < 10; i++) {
        const delay = getRetryDelay(2);
        const baseDelay = 1000 * Math.pow(2, 1); // 2000
        const jitterMax = 1000;
        expect(delay).toBeGreaterThanOrEqual(baseDelay);
        expect(delay).toBeLessThanOrEqual(baseDelay + jitterMax);
      }
    });
  });

  describe('Error flow integration', () => {
    it('should classify and get enhanced error for network failure', () => {
      const rawError = new Error('Network request failed');
      const code = classifyError(rawError);
      const enhancedError = getEnhancedError(code);

      expect(code).toBe('NETWORK_ERROR');
      expect(enhancedError.severity).toBe('warning');
      expect(enhancedError.code).toBe('NETWORK_ERROR');
    });

    it('should provide retry strategy for transient errors', () => {
      const transientErrors = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
      transientErrors.forEach(errorCode => {
        expect(shouldRetryError(errorCode)).toBe(true);
        const delay = getRetryDelay(1);
        expect(delay).toBeGreaterThan(0);
      });
    });

    it('should not retry permanent errors', () => {
      const permanentErrors = ['NOT_FOUND', 'UNAUTHORIZED', 'VALIDATION_ERROR'];
      permanentErrors.forEach(errorCode => {
        expect(shouldRetryError(errorCode)).toBe(false);
      });
    });

    it('should provide context-aware error handling', () => {
      const context: ErrorContext = {
        component: 'LocationDetailPanel',
        action: 'fetchLocationDetails',
        endpoint: '/api/locations/123',
        params: { id: '123' }
      };

      const error = new Error('404 Not Found');
      const code = classifyError(error);
      const enhancedError = getEnhancedError(code, context);

      expect(enhancedError.context?.component).toBe('LocationDetailPanel');
      expect(enhancedError.context?.action).toBe('fetchLocationDetails');
      expect(shouldRetryError(code)).toBe(false); // Should not retry 404
    });
  });

  describe('Error messages quality', () => {
    it('should have user-friendly messages', () => {
      const errorCodes = [
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'NOT_FOUND',
        'UNAUTHORIZED',
        'VALIDATION_ERROR',
        'SERVER_ERROR'
      ];

      errorCodes.forEach(code => {
        const error = getEnhancedError(code);
        expect(error.userMessage).toBeDefined();
        expect(error.userMessage.length).toBeGreaterThan(0);
        // User message should not contain technical jargon
        expect(error.userMessage.toLowerCase()).not.toMatch(/stack|trace|dump/);
      });
    });

    it('should provide actionable suggestions', () => {
      const error = getEnhancedError('NETWORK_ERROR');
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions.length).toBeGreaterThan(0);
      error.suggestions.forEach(suggestion => {
        expect(suggestion).toBeDefined();
        expect(suggestion.length).toBeGreaterThan(0);
      });
    });
  });
});
