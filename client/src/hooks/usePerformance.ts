import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  lastRenderTime: number;
  renderCount: number;
}

/**
 * Hook to monitor component performance
 * Logs render time and count to help identify performance bottlenecks
 */
export function usePerformance(componentName: string, enabled = import.meta.env.DEV) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    lastRenderTime: Date.now(),
    renderCount: 0,
  });

  const renderStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const now = Date.now();
    const renderTime = now - renderStartRef.current;
    metricsRef.current.renderTime = renderTime;
    metricsRef.current.lastRenderTime = now;
    metricsRef.current.renderCount++;

    if (renderTime > 16) { // Slower than 60fps frame time
      console.warn(
        `[Performance] ${componentName} render took ${renderTime}ms (render #${metricsRef.current.renderCount})`
      );
    }
  });

  renderStartRef.current = Date.now();

  return metricsRef.current;
}

/**
 * Hook to measure async operation performance
 */
export function useAsyncPerformance(operationName: string) {
  return (asyncFn: () => Promise<any>) => {
    return async () => {
      const start = performance.now();
      try {
        const result = await asyncFn();
        const duration = performance.now() - start;
        if (duration > 1000) {
          console.warn(`[Performance] ${operationName} took ${duration.toFixed(2)}ms`);
        }
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`[Performance] ${operationName} failed after ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
  };
}
