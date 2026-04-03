/**
 * Enhanced Error Tracking System for FamMap
 * Provides error tracking, breadcrumbs, and analytics without external dependencies
 */

interface BreadcrumbEntry {
  timestamp: number;
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  category: string;
  data?: Record<string, any>;
}

interface ErrorEvent {
  id: string;
  timestamp: number;
  error: Error | string;
  context?: Record<string, any>;
  breadcrumbs: BreadcrumbEntry[];
}

class ErrorTracker {
  private breadcrumbs: BreadcrumbEntry[] = [];
  private maxBreadcrumbs = 50;
  private isDev = import.meta.env.DEV;
  private errors: ErrorEvent[] = [];
  private maxErrors = 100;
  private userId: string | null = null;

  init() {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    // Set up global error handlers
    window.addEventListener('error', (event) => {
      this.captureException(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason, {
        type: 'unhandledRejection',
      });
    });

    this.addBreadcrumb('Error tracker initialized', 'info', 'system');
  }

  addBreadcrumb(
    message: string,
    level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
    category: string = 'custom',
    data?: Record<string, any>
  ) {
    const breadcrumb: BreadcrumbEntry = {
      timestamp: Date.now(),
      message,
      level,
      category,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep breadcrumbs array size in check
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    if (this.isDev) {
      console.log(`[${level.toUpperCase()}] [${category}] ${message}`, data || '');
    }
  }

  captureException(error: Error | string, context?: Record<string, any>) {
    const errorEvent: ErrorEvent = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      error,
      context,
      breadcrumbs: [...this.breadcrumbs],
    };

    this.errors.push(errorEvent);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in dev
    console.error('Error captured:', error, context);

    // Send to backend if available
    this.sendErrorToBackend(errorEvent);

    return errorEvent.id;
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    this.addBreadcrumb(message, level, 'message');

    if (level === 'error') {
      const errorEvent: ErrorEvent = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        error: message,
        breadcrumbs: [...this.breadcrumbs],
      };

      this.errors.push(errorEvent);
      this.sendErrorToBackend(errorEvent);
    }
  }

  setUserContext(userId: string, email?: string, username?: string) {
    this.userId = userId;
    this.addBreadcrumb(`User context set: ${userId}`, 'info', 'auth', {
      email,
      username,
    });
  }

  clearUserContext() {
    this.userId = null;
    this.addBreadcrumb('User context cleared', 'info', 'auth');
  }

  private sendErrorToBackend(errorEvent: ErrorEvent) {
    // Send error data to backend for aggregation and monitoring
    if (navigator.sendBeacon && !this.isDev) {
      const data = JSON.stringify({
        error: errorEvent.error instanceof Error ? errorEvent.error.message : String(errorEvent.error),
        stack: errorEvent.error instanceof Error ? errorEvent.error.stack : undefined,
        context: errorEvent.context,
        userId: this.userId,
        timestamp: errorEvent.timestamp,
      });

      navigator.sendBeacon('/api/errors', data);
    }
  }

  getErrors() {
    return this.errors;
  }

  getBreadcrumbs() {
    return this.breadcrumbs;
  }

  clearErrors() {
    this.errors = [];
  }

  clearBreadcrumbs() {
    this.breadcrumbs = [];
  }
}

const errorTracker = new ErrorTracker();

export const initializeSentry = () => {
  errorTracker.init();
};

export const captureException = (error: Error | string, context?: Record<string, any>) => {
  return errorTracker.captureException(error, context);
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  errorTracker.captureMessage(message, level);
};

export const setUserContext = (userId: string, email?: string, username?: string) => {
  errorTracker.setUserContext(userId, email, username);
};

export const clearUserContext = () => {
  errorTracker.clearUserContext();
};

export const addBreadcrumb = (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  category: string = 'custom',
  data?: Record<string, any>
) => {
  errorTracker.addBreadcrumb(message, level, category, data);
};

export default errorTracker;
