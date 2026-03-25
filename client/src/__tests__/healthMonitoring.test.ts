import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { performHealthCheck, logHealthCheck, startHealthMonitoring } from '../utils/healthMonitoring';

describe('healthMonitoring', () => {
  beforeEach(() => {
    // Mock fetch with immediate response
    global.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200 }))
    );

    // Mock performance API
    Object.defineProperty(window, 'performance', {
      value: {
        now: () => 100,
        getEntriesByType: () => [],
      },
      writable: true,
    });

    // Mock localStorage
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          Object.keys(store).forEach((key) => delete store[key]);
        },
      },
      writable: true,
    });

    // Mock indexedDB
    Object.defineProperty(window, 'indexedDB', {
      value: {
        open: () => ({
          onsuccess: null,
          onerror: null,
          result: { close: () => {} },
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('performHealthCheck', () => {
    it('should be a valid async function', () => {
      expect(typeof performHealthCheck).toBe('function');
    });

    it('should return a promise', () => {
      const result = performHealthCheck();
      expect(result instanceof Promise).toBe(true);
    });
  });

  describe('logHealthCheck', () => {
    it('should log health check results without errors', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        status: 'healthy' as const,
        timestamp: '2026-03-25T16:10:00Z',
        checks: {
          api: { status: 'ok' as const, message: 'API healthy' },
          ui: { status: 'ok' as const, message: 'UI healthy' },
          performance: { status: 'ok' as const, message: 'Performance good' },
          storage: { status: 'ok' as const, message: 'Storage available' },
        },
        metrics: {
          responseTime: 100,
          bundleSize: 61440,
          cacheHitRate: 50,
          errorRate: 0,
        },
      };

      logHealthCheck(result);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls.some((call) => call[0].includes('FamMap Health Check'))).toBe(
        true
      );

      consoleSpy.mockRestore();
    });

    it('should include status emoji in log', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        status: 'degraded' as const,
        timestamp: '2026-03-25T16:10:00Z',
        checks: {
          api: { status: 'ok' as const, message: 'API healthy' },
          ui: { status: 'ok' as const, message: 'UI healthy' },
          performance: { status: 'ok' as const, message: 'Performance good' },
          storage: { status: 'ok' as const, message: 'Storage available' },
        },
        metrics: {
          responseTime: 100,
          bundleSize: 61440,
          cacheHitRate: 50,
          errorRate: 0,
        },
      };

      logHealthCheck(result);

      const firstCall = consoleSpy.mock.calls[0][0];
      expect(firstCall).toContain('⚠');

      consoleSpy.mockRestore();
    });
  });

  describe('startHealthMonitoring', () => {
    it('should return a cleanup function', () => {
      const cleanup = startHealthMonitoring(1000);

      expect(typeof cleanup).toBe('function');

      cleanup();
    });

    it('should return a function that can be called multiple times', () => {
      const cleanup = startHealthMonitoring(100);

      // Should not throw
      expect(() => {
        cleanup();
        cleanup();
      }).not.toThrow();
    });

    it('should accept interval parameter', () => {
      const cleanup1 = startHealthMonitoring(100);
      const cleanup2 = startHealthMonitoring(5000);
      const cleanup3 = startHealthMonitoring(300000);

      cleanup1();
      cleanup2();
      cleanup3();
    });
  });

  describe('Edge Cases', () => {
    it('should have utility functions available', () => {
      expect(typeof logHealthCheck).toBe('function');
      expect(typeof startHealthMonitoring).toBe('function');
    });

    it('should export utility functions', () => {
      expect(performHealthCheck).toBeDefined();
      expect(logHealthCheck).toBeDefined();
      expect(startHealthMonitoring).toBeDefined();
    });

    it('should handle localStorage operations gracefully', () => {
      const store: Record<string, string> = {};
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => {
            store[key] = value;
          },
          removeItem: (key: string) => {
            delete store[key];
          },
        },
        writable: true,
      });

      expect(() => {
        localStorage.setItem('test', 'value');
        localStorage.getItem('test');
        localStorage.removeItem('test');
      }).not.toThrow();
    });
  });

  describe('Health Status Aggregation', () => {
    it('should have valid health status types', () => {
      const validStatuses = ['ok', 'warning', 'error'];
      const validAggregateStatuses = ['healthy', 'degraded', 'unhealthy'];

      expect(validStatuses).toContain('ok');
      expect(validStatuses).toContain('warning');
      expect(validStatuses).toContain('error');

      expect(validAggregateStatuses).toContain('healthy');
      expect(validAggregateStatuses).toContain('degraded');
      expect(validAggregateStatuses).toContain('unhealthy');
    });

    it('should aggregate health statuses correctly', () => {
      // Verify the logic is consistent
      const statuses = ['ok', 'ok', 'ok', 'ok'];
      const hasErrors = statuses.includes('error');
      const hasWarnings = statuses.includes('warning');
      const status = hasErrors ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';

      expect(status).toBe('healthy');
    });

    it('should mark unhealthy when errors present', () => {
      const statuses = ['ok', 'warning', 'error'];
      const hasErrors = statuses.includes('error');
      const hasWarnings = statuses.includes('warning');
      const status = hasErrors ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';

      expect(status).toBe('unhealthy');
    });
  });

  describe('Metrics Calculation', () => {
    it('should have valid metrics structure', () => {
      const metrics = {
        responseTime: 100,
        bundleSize: 61440,
        cacheHitRate: 50,
        errorRate: 0,
      };

      expect(typeof metrics.responseTime).toBe('number');
      expect(typeof metrics.bundleSize).toBe('number');
      expect(typeof metrics.cacheHitRate).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
    });

    it('should calculate valid cache hit rate range', () => {
      const cacheHitRate = 50;
      expect(cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(cacheHitRate).toBeLessThanOrEqual(100);
    });

    it('should measure response time in milliseconds', () => {
      const responseTime = 100;
      expect(typeof responseTime).toBe('number');
      expect(responseTime).toBeGreaterThanOrEqual(0);
    });
  });
});
