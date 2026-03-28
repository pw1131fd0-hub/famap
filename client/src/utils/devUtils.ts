/**
 * Development Utilities
 * Helpful utilities for developers during development and debugging
 */

/**
 * Assert that a condition is true, throw error if not
 * Useful for validating assumptions in development
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    const error = new Error(`Assertion failed: ${message}`);
    if (import.meta.env.DEV) {
      console.error(error);
    }
    throw error;
  }
}

/**
 * Lazy assertion - only throws in development
 */
export function devAssert(condition: boolean, message: string): void {
  if (import.meta.env.DEV && !condition) {
    console.warn(`Dev Assertion failed: ${message}`);
  }
}

/**
 * Log with severity levels
 */
export const log = {
  debug: (label: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${label}`, data);
    }
  },
  info: (label: string, data?: unknown) => {
    console.log(`[INFO] ${label}`, data);
  },
  warn: (label: string, data?: unknown) => {
    console.warn(`[WARN] ${label}`, data);
  },
  error: (label: string, error?: unknown) => {
    console.error(`[ERROR] ${label}`, error);
  },
};

/**
 * Performance measurement helper
 */
export class PerformanceHelper {
  private marks: Map<string, number> = new Map();

  mark(label: string): void {
    this.marks.set(label, performance.now());
  }

  measure(label: string, markLabel: string): number {
    const startTime = this.marks.get(markLabel);
    if (!startTime) {
      log.warn(`No mark found for: ${markLabel}`);
      return 0;
    }
    const duration = performance.now() - startTime;
    if (import.meta.env.DEV) {
      log.debug(`${label}: ${duration.toFixed(2)}ms`);
    }
    this.marks.delete(markLabel);
    return duration;
  }

  clearAll(): void {
    this.marks.clear();
  }
}

/**
 * Create a perf helper instance
 */
export const perfHelper = new PerformanceHelper();

/**
 * Type guard helpers
 */
export const is = {
  string: (value: unknown): value is string => typeof value === 'string',
  number: (value: unknown): value is number => typeof value === 'number',
  boolean: (value: unknown): value is boolean => typeof value === 'boolean',
  object: (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null,
  array: (value: unknown): value is unknown[] => Array.isArray(value),
  function: (value: unknown): value is (...args: unknown[]) => unknown => typeof value === 'function',
  defined: (value: unknown): value is NonNullable<unknown> => value !== null && value !== undefined,
};

/**
 * Safe JSON operations
 */
export const safeJSON = {
  parse: <T = unknown>(json: string, fallback?: T): T => {
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      if (import.meta.env.DEV) {
        log.warn('Failed to parse JSON', error);
      }
      return fallback as T;
    }
  },
  stringify: (obj: unknown, fallback = ''): string => {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      if (import.meta.env.DEV) {
        log.warn('Failed to stringify JSON', error);
      }
      return fallback;
    }
  },
};

/**
 * Local storage with safe fallback
 */
export const safeStorage = {
  get: (key: string, fallback?: string): string | undefined => {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Debounce helper
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle helper
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Retry helper for async operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delayMs?: number; backoff?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoff = 2 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      const delay = delayMs * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry failed');
}

/**
 * Development-only check
 */
export function ifDev<T>(value: T): T | undefined {
  return import.meta.env.DEV ? value : undefined;
}

/**
 * Get current environment
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
  if (import.meta.env.DEV) return 'development';
  if (import.meta.env.PROD) return 'production';
  return 'test';
}
