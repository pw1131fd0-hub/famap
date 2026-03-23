/**
 * Error Tracking & Monitoring
 * Integrates with error monitoring service for production reliability
 */

export interface ErrorContext {
  userAction?: string;
  component?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  additionalData?: Record<string, any>;
}

class ErrorTracker {
  private isDev = import.meta.env.DEV;
  private errorLog: Array<{
    timestamp: number;
    error: Error;
    context?: ErrorContext;
  }> = [];
  private maxLogSize = 100;

  /**
   * Initialize error tracking
   */
  initialize(): void {
    // Setup global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        severity: 'high',
        userAction: 'Runtime error'
      });
    });

    // Setup unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(String(event.reason)), {
        severity: 'high',
        userAction: 'Unhandled promise rejection'
      });
    });
  }

  /**
   * Capture an error with context
   */
  captureError(error: Error | string, context?: ErrorContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const errorEntry = {
      timestamp: Date.now(),
      error: errorObj,
      context
    };

    this.errorLog.push(errorEntry);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    if (!this.isDev) {
      // Send to error tracking service (Sentry, etc.)
      this.sendToTracking(errorObj, context);
    } else {
      // In dev, log to console
      console.error('[Error Tracking]', {
        error: errorObj.message,
        stack: errorObj.stack,
        context
      });
    }
  }

  /**
   * Capture an API error
   */
  captureApiError(
    endpoint: string,
    statusCode: number,
    errorMessage: string,
    context?: Omit<ErrorContext, 'severity'>
  ): void {
    const severity = statusCode >= 500 ? 'high' : 'medium';
    this.captureError(new Error(`API Error: ${statusCode} ${errorMessage}`), {
      ...context,
      severity,
      userAction: `API call to ${endpoint}`,
      additionalData: {
        endpoint,
        statusCode,
        errorMessage
      }
    });
  }

  /**
   * Capture a component error
   */
  captureComponentError(
    componentName: string,
    error: Error,
    props?: Record<string, any>
  ): void {
    this.captureError(error, {
      component: componentName,
      severity: 'high',
      additionalData: { props }
    });
  }

  /**
   * Send error to tracking service
   */
  private sendToTracking(error: Error, context?: ErrorContext): void {
    // Implement your error tracking endpoint
    // const payload = {
    //   message: error.message,
    //   stack: error.stack,
    //   timestamp: new Date().toISOString(),
    //   context,
    //   userAgent: navigator.userAgent,
    //   location: window.location.href,
    //   environment: import.meta.env.VITE_ENVIRONMENT || 'production'
    // };
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    //   keepalive: true
    // }).catch(console.error);

    // For now, just ensure error and context parameters are used to avoid warnings
    void error;
    void context;
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return this.errorLog;
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error summary
   */
  getErrorSummary() {
    const severityCount = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    this.errorLog.forEach((entry) => {
      const severity = entry.context?.severity || 'medium';
      severityCount[severity]++;
    });

    return {
      totalErrors: this.errorLog.length,
      byServerity: severityCount,
      lastError: this.errorLog[this.errorLog.length - 1]?.error?.message
    };
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

// Initialize on module load
if (typeof window !== 'undefined') {
  errorTracker.initialize();
}

export default errorTracker;
