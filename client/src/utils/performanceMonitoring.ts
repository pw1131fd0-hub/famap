/**
 * Performance Monitoring & Optimization
 * Tracks and reports performance metrics to backend
 */

import { addBreadcrumb } from './sentryConfig';

export interface PerformanceMetric {
  name: string;
  value: number; // in milliseconds
  category?: string;
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private isDev = import.meta.env.DEV || import.meta.env.MODE === 'test';
  private metrics: PerformanceMetric[] = [];
  private maxMetricsSize = 100;
  private timers: Map<string, number> = new Map();

  /**
   * Start measuring a metric
   */
  startMeasure(label: string): void {
    this.timers.set(label, performance.now());
  }

  /**
   * End measuring a metric and record it
   */
  endMeasure(label: string, category?: string, context?: Record<string, any>): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      addBreadcrumb(`No start time found for label: ${label}`, 'warning', 'performance_monitoring');
      return 0;
    }

    const duration = performance.now() - startTime;
    this.recordMetric({
      name: label,
      value: duration,
      category: category || 'general',
      context
    });

    this.timers.delete(label);
    return duration;
  }

  /**
   * Measure a function execution
   */
  async measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
    category?: string,
    context?: Record<string, any>
  ): Promise<T> {
    this.startMeasure(label);
    try {
      const result = await fn();
      this.endMeasure(label, category, context);
      return result;
    } catch (error) {
      this.endMeasure(label, category, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution
   */
  measureSync<T>(
    label: string,
    fn: () => T,
    category?: string,
    context?: Record<string, any>
  ): T {
    this.startMeasure(label);
    try {
      const result = fn();
      this.endMeasure(label, category, context);
      return result;
    } catch (error) {
      this.endMeasure(label, category, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep metrics size manageable
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics.shift();
    }

    // Log in dev mode
    if (this.isDev) {
      addBreadcrumb(
        `${metric.name}: ${metric.value.toFixed(2)}ms`,
        'debug',
        metric.category || 'performance',
        { value: metric.value }
      );
    }

    // Send to backend in production
    if (!this.isDev) {
      this.sendMetricToBackend(metric).catch(err => {
        addBreadcrumb(
          'Performance metric send failed',
          'error',
          'performance_monitoring',
          { metric: metric.name, error: String(err) }
        );
      });
    }
  }

  /**
   * Send metric to backend
   */
  private async sendMetricToBackend(metric: PerformanceMetric): Promise<void> {
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true
      });
    } catch (error) {
      // Log through proper error tracking (silently fail to avoid affecting application)
      addBreadcrumb(
        'Failed to send performance metric to backend',
        'debug',
        'performance_monitoring',
        { metric: metric.name, error: String(error) }
      );
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Get average metric value by name
   */
  getAverageMetric(name: string): number {
    const matching = this.metrics.filter(m => m.name === name);
    if (matching.length === 0) return 0;
    const sum = matching.reduce((acc, m) => acc + m.value, 0);
    return sum / matching.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, any> {
    const summary: Record<string, any> = {
      totalMetrics: this.metrics.length,
      byCategory: {} as Record<string, number>
    };

    // Group by category
    this.metrics.forEach(m => {
      const cat = m.category || 'general';
      if (!summary.byCategory[cat]) {
        summary.byCategory[cat] = 0;
      }
      summary.byCategory[cat]++;
    });

    // Calculate average for common operations
    const commonOps = ['api_call', 'render', 'parse'];
    commonOps.forEach(op => {
      const avg = this.getAverageMetric(op);
      if (avg > 0) {
        summary[`avg_${op}`] = `${avg.toFixed(2)}ms`;
      }
    });

    return summary;
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Observe Core Web Vitals (LCP, FID, CLS)
   */
  observeWebVitals(): void {
    if (!('PerformanceObserver' in window)) {
      addBreadcrumb(
        'PerformanceObserver not supported in this browser',
        'warning',
        'web_vitals'
      );
      return;
    }

    // Observe Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          category: 'web_vitals'
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      addBreadcrumb(
        'LCP observation failed',
        'warning',
        'web_vitals',
        { error: String(error) }
      );
    }

    // Observe Cumulative Layout Shift (CLS)
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        entryList.getEntries().forEach((entry) => {
          if ((entry as any).hadRecentInput) return; // Ignore shifts caused by user input
          clsValue += (entry as any).value;
        });
        if (clsValue > 0) {
          this.recordMetric({
            name: 'CLS',
            value: clsValue * 1000, // Convert to milliseconds for consistency
            category: 'web_vitals'
          });
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      addBreadcrumb(
        'CLS observation failed',
        'warning',
        'web_vitals',
        { error: String(error) }
      );
    }

    // Observe First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          this.recordMetric({
            name: 'FID',
            value: (entry as any).processingDuration,
            category: 'web_vitals'
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      addBreadcrumb(
        'FID observation failed',
        'warning',
        'web_vitals',
        { error: String(error) }
      );
    }
  }

  /**
   * Measure page load time
   */
  measurePageLoad(): void {
    if (document.readyState === 'loading') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.recordMetric({
          name: 'page_load',
          value: loadTime,
          category: 'page'
        });
      });
    } else {
      const loadTime = performance.now();
      this.recordMetric({
        name: 'page_load',
        value: loadTime,
        category: 'page'
      });
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Initialize on module load
if (typeof window !== 'undefined') {
  performanceMonitor.measurePageLoad();
  performanceMonitor.observeWebVitals();
}

export default performanceMonitor;
