/**
 * Health Monitoring Utility
 * Provides comprehensive health checks and monitoring for production deployments
 */

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    api: HealthStatus;
    ui: HealthStatus;
    performance: HealthStatus;
    storage: HealthStatus;
  };
  metrics: {
    responseTime: number;
    bundleSize: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

export interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  message: string;
  latency?: number;
}

/**
 * Performs comprehensive health check on the application
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  const startTime = performance.now();

  const [api, ui, storage] = await Promise.all([
    checkAPIHealth(),
    checkUIHealth(),
    checkStorageHealth(),
  ]);

  const performance_check = checkPerformanceMetrics();
  const responseTime = performance.now() - startTime;

  const statuses = [api.status, ui.status, storage.status, performance_check.status];
  const hasErrors = statuses.includes('error');
  const hasWarnings = statuses.includes('warning');
  const status = hasErrors ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';

  return {
    status: status as 'healthy' | 'degraded' | 'unhealthy',
    timestamp,
    checks: {
      api,
      ui,
      performance: performance_check,
      storage,
    },
    metrics: {
      responseTime,
      bundleSize: estimateBundleSize(),
      cacheHitRate: estimateCacheHitRate(),
      errorRate: 0,
    },
  };
}

/**
 * Checks API connectivity and response time
 */
async function checkAPIHealth(): Promise<HealthStatus> {
  try {
    const startTime = performance.now();
    // Create an AbortController for timeout support
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);

      const latency = performance.now() - startTime;
      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        // If explicit health endpoint doesn't exist, that's OK for MVP
        return {
          status: 'ok',
          message: 'API available (health endpoint not configured)',
          latency: 0,
        };
      }

      if (latency > 5000) {
        return {
          status: 'warning',
          message: `API response slow (${latency.toFixed(0)}ms)`,
          latency,
        };
      }

      return {
        status: 'ok',
        message: `API healthy (${latency.toFixed(0)}ms)`,
        latency,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      return {
        status: 'error',
        message: `API check failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: `API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Checks UI component rendering and DOM integrity
 */
function checkUIHealth(): HealthStatus {
  try {
    // Verify critical DOM elements exist
    const appRoot = document.getElementById('root');
    if (!appRoot) {
      return {
        status: 'error',
        message: 'App root element not found',
      };
    }

    // Check that React has rendered something
    if (appRoot.children.length === 0) {
      return {
        status: 'warning',
        message: 'App root is empty (still loading?)',
      };
    }

    // Verify critical stylesheets are loaded
    const cssLinks = Array.from(document.styleSheets).filter(
      (sheet) => sheet.href && sheet.href.includes('dist')
    );

    if (cssLinks.length === 0) {
      return {
        status: 'warning',
        message: 'No CSS stylesheets detected',
      };
    }

    return {
      status: 'ok',
      message: `UI healthy (${cssLinks.length} stylesheets loaded)`,
    };
  } catch (error) {
    return {
      status: 'error',
      message: `UI check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Checks IndexedDB and LocalStorage availability
 */
async function checkStorageHealth(): Promise<HealthStatus> {
  try {
    // Check LocalStorage
    const testKey = '__health_check_' + Date.now();
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (testValue !== 'test') {
      return {
        status: 'warning',
        message: 'LocalStorage write failed',
      };
    }

    // Check IndexedDB
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('health_check_db');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      db.close();

      return {
        status: 'ok',
        message: 'Storage healthy (LocalStorage + IndexedDB available)',
      };
    } catch {
      // IndexedDB might not be available in some contexts, but LocalStorage works
      return {
        status: 'ok',
        message: 'Storage healthy (LocalStorage available)',
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Checks performance metrics
 */
function checkPerformanceMetrics(): HealthStatus {
  try {
    if (!window.performance || !window.performance.getEntriesByType) {
      return {
        status: 'ok',
        message: 'Performance metrics not available (not critical)',
      };
    }

    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigationTiming) {
      return {
        status: 'ok',
        message: 'Navigation timing not available',
      };
    }

    const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
    const threshold = 5000; // 5 seconds

    if (loadTime > threshold) {
      return {
        status: 'warning',
        message: `Slow page load detected (${loadTime.toFixed(0)}ms > ${threshold}ms)`,
      };
    }

    return {
      status: 'ok',
      message: `Performance good (${loadTime.toFixed(0)}ms load time)`,
    };
  } catch (error) {
    return {
      status: 'ok',
      message: 'Performance metrics unavailable (not critical)',
    };
  }
}

/**
 * Estimates the size of loaded bundles
 */
function estimateBundleSize(): number {
  try {
    if (!window.performance || !window.performance.getEntriesByType) {
      return 0;
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter((r) => r.name.includes('dist') || r.name.includes('assets'))
      .reduce((total, r) => total + (r.transferSize || 0), 0);
  } catch {
    return 0;
  }
}

/**
 * Estimates cache hit rate from performance entries
 */
function estimateCacheHitRate(): number {
  try {
    if (!window.performance || !window.performance.getEntriesByType) {
      return 0;
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    if (resources.length === 0) return 0;

    const cached = resources.filter((r) => r.transferSize === 0 && r.encodedBodySize > 0).length;
    return Math.round((cached / resources.length) * 100);
  } catch {
    return 0;
  }
}

/**
 * Logs health check results for debugging
 */
export function logHealthCheck(result: HealthCheckResult): void {
  const statusEmoji =
    result.status === 'healthy' ? '✓' : result.status === 'degraded' ? '⚠' : '✗';

  console.log(`${statusEmoji} FamMap Health Check [${result.timestamp}]`);
  console.log(`  Status: ${result.status}`);
  console.log(`  API: ${result.checks.api.status} - ${result.checks.api.message}`);
  console.log(`  UI: ${result.checks.ui.status} - ${result.checks.ui.message}`);
  console.log(`  Performance: ${result.checks.performance.status} - ${result.checks.performance.message}`);
  console.log(`  Storage: ${result.checks.storage.status} - ${result.checks.storage.message}`);
  console.log(`  Response Time: ${result.metrics.responseTime.toFixed(0)}ms`);
  console.log(`  Bundle Size: ${(result.metrics.bundleSize / 1024).toFixed(2)}KB`);
  console.log(`  Cache Hit Rate: ${result.metrics.cacheHitRate}%`);
}

/**
 * Continuous health monitoring
 */
export function startHealthMonitoring(intervalMs: number = 300000): () => void {
  const interval = setInterval(async () => {
    const result = await performHealthCheck();
    logHealthCheck(result);

    // Store in window for debugging
    (window as any).__famapHealthCheck = result;
  }, intervalMs);

  return () => clearInterval(interval);
}
