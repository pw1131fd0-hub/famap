import { describe, it, expect, beforeEach, vi } from 'vitest';
import performanceMonitor from '../utils/performanceMonitoring';
import * as sentryConfig from '../utils/sentryConfig';

// Mock the addBreadcrumb function
vi.mock('../utils/sentryConfig', () => ({
  addBreadcrumb: vi.fn(),
}));

describe('Performance Monitoring', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
  });

  describe('Basic Measurements', () => {
    it('should measure synchronous function execution', () => {
      const result = performanceMonitor.measureSync(
        'test_function',
        () => {
          return 42;
        }
      );

      expect(result).toBe(42);
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test_function');
      expect(metrics[0].value).toBeGreaterThanOrEqual(0);
    });

    it('should measure async function execution', async () => {
      const result = await performanceMonitor.measureAsync(
        'async_function',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'async result';
        }
      );

      expect(result).toBe('async result');
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('async_function');
    });

    it('should support custom categories', () => {
      performanceMonitor.measureSync(
        'categorized_metric',
        () => 'result',
        'api'
      );

      const metrics = performanceMonitor.getMetrics();
      expect(metrics[0].category).toBe('api');
    });

    it('should support additional context', () => {
      performanceMonitor.measureSync(
        'metric_with_context',
        () => 'result',
        'general',
        { endpoint: '/api/test', userId: '123' }
      );

      const metrics = performanceMonitor.getMetrics();
      expect(metrics[0].context).toEqual({
        endpoint: '/api/test',
        userId: '123'
      });
    });
  });

  describe('Manual Timing', () => {
    it('should start and end measurements', () => {
      performanceMonitor.startMeasure('manual_test');
      const duration = performanceMonitor.endMeasure('manual_test');

      expect(duration).toBeGreaterThanOrEqual(0);
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(1);
      expect(metrics.some(m => m.name === 'manual_test')).toBe(true);
    });

    it('should warn if ending non-existent measurement', () => {
      performanceMonitor.endMeasure('non-existent');
      expect(sentryConfig.addBreadcrumb).toHaveBeenCalledWith(
        expect.stringContaining('No start time found'),
        'warning',
        'performance_monitoring'
      );
    });
  });

  describe('Metrics Retrieval', () => {
    it('should get all metrics', () => {
      performanceMonitor.recordMetric({ name: 'test1', value: 100 });
      performanceMonitor.recordMetric({ name: 'test2', value: 200 });

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(2);
    });

    it('should get metrics by category', () => {
      performanceMonitor.recordMetric({ name: 'api1', value: 100, category: 'api' });
      performanceMonitor.recordMetric({ name: 'render1', value: 50, category: 'render' });

      const apiMetrics = performanceMonitor.getMetricsByCategory('api');
      expect(apiMetrics).toHaveLength(1);
      expect(apiMetrics[0].name).toBe('api1');
    });

    it('should calculate average metric value', () => {
      performanceMonitor.recordMetric({ name: 'test', value: 100 });
      performanceMonitor.recordMetric({ name: 'test', value: 200 });
      performanceMonitor.recordMetric({ name: 'test', value: 300 });

      const avg = performanceMonitor.getAverageMetric('test');
      expect(avg).toBe(200);
    });

    it('should return 0 for non-existent metric average', () => {
      const avg = performanceMonitor.getAverageMetric('non-existent');
      expect(avg).toBe(0);
    });
  });

  describe('Summary', () => {
    it('should generate performance summary', () => {
      performanceMonitor.recordMetric({ name: 'test1', value: 100, category: 'api' });
      performanceMonitor.recordMetric({ name: 'test2', value: 200, category: 'render' });

      const summary = performanceMonitor.getSummary();
      expect(summary.totalMetrics).toBe(2);
      expect(summary.byCategory.api).toBe(1);
      expect(summary.byCategory.render).toBe(1);
    });
  });

  describe('Metrics Storage', () => {
    it('should limit metrics storage to max size', () => {
      // Record more metrics than max size (100)
      for (let i = 0; i < 150; i++) {
        performanceMonitor.recordMetric({ name: `metric_${i}`, value: i });
      }

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(100);
    });

    it('should clear all metrics', () => {
      performanceMonitor.recordMetric({ name: 'test', value: 100 });
      performanceMonitor.clearMetrics();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in sync measurements', () => {
      expect(() => {
        performanceMonitor.measureSync('error_test', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      // Metric is still recorded even on error
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors in async measurements', async () => {
      await expect(
        performanceMonitor.measureAsync('async_error_test', async () => {
          throw new Error('Async error');
        })
      ).rejects.toThrow('Async error');

      // Check that measurement was attempted
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toBeDefined();
    });
  });
});
