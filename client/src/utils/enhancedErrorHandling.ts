/**
 * Enhanced Error Handling & User Guidance
 * Provides contextual error messages and actionable suggestions
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  endpoint?: string;
  params?: Record<string, unknown>;
}

export interface EnhancedError {
  message: string;
  userMessage: string;
  suggestions: string[];
  severity: 'info' | 'warning' | 'error' | 'critical';
  code: string;
  context?: ErrorContext;
}

const errorMessages: Record<string, EnhancedError> = {
  'NETWORK_ERROR': {
    message: 'Network request failed',
    userMessage: 'Unable to connect to the service. Please check your internet connection.',
    suggestions: [
      'Check if you have an active internet connection',
      'Try disabling VPN if you\'re using one',
      'Refresh the page and try again',
      'Your offline data is still available'
    ],
    severity: 'warning',
    code: 'NETWORK_ERROR'
  },
  'TIMEOUT_ERROR': {
    message: 'Request timeout',
    userMessage: 'The request took too long. Please try again.',
    suggestions: [
      'Check your internet speed',
      'Try searching in a smaller area',
      'Retry the action in a moment',
      'Use offline saved data if available'
    ],
    severity: 'warning',
    code: 'TIMEOUT_ERROR'
  },
  'NOT_FOUND': {
    message: 'Resource not found',
    userMessage: 'The location or information you\'re looking for could not be found.',
    suggestions: [
      'Check if the location has been removed',
      'Try searching with different keywords',
      'Browse nearby locations instead',
      'Add the location if it\'s missing'
    ],
    severity: 'info',
    code: 'NOT_FOUND'
  },
  'UNAUTHORIZED': {
    message: 'Not authorized',
    userMessage: 'You need to be logged in to perform this action.',
    suggestions: [
      'Log in to your account',
      'Check if your session has expired',
      'Try refreshing the page'
    ],
    severity: 'warning',
    code: 'UNAUTHORIZED'
  },
  'VALIDATION_ERROR': {
    message: 'Validation failed',
    userMessage: 'The information provided is not valid.',
    suggestions: [
      'Check that all required fields are filled',
      'Verify the format of your input',
      'Try again with different information'
    ],
    severity: 'warning',
    code: 'VALIDATION_ERROR'
  },
  'SERVER_ERROR': {
    message: 'Server error',
    userMessage: 'Something went wrong on the server. Please try again later.',
    suggestions: [
      'Wait a moment and try again',
      'Refresh the page',
      'Use offline saved data if available',
      'Contact support if the problem persists'
    ],
    severity: 'error',
    code: 'SERVER_ERROR'
  },
  'LOCATION_ERROR': {
    message: 'Unable to get your location',
    userMessage: 'FamMap couldn\'t determine your location.',
    suggestions: [
      'Enable location services in your browser settings',
      'Grant location permission when prompted',
      'Ensure GPS or network location is enabled',
      'Manually select a city from the dropdown'
    ],
    severity: 'info',
    code: 'LOCATION_ERROR'
  },
  'NO_RESULTS': {
    message: 'No results found',
    userMessage: 'No locations match your search criteria.',
    suggestions: [
      'Try expanding your search radius',
      'Remove some filters and try again',
      'Search in different categories',
      'Browse the map to discover nearby places'
    ],
    severity: 'info',
    code: 'NO_RESULTS'
  }
};

export function getEnhancedError(errorCode: string, context?: ErrorContext): EnhancedError {
  const error = errorMessages[errorCode] || {
    message: 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    suggestions: ['Refresh the page', 'Try again in a moment'],
    severity: 'error' as const,
    code: 'UNKNOWN_ERROR'
  };

  return {
    ...error,
    context
  };
}

export function classifyError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('failed to fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'NOT_FOUND';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'UNAUTHORIZED';
    }
    if (message.includes('validation') || message.includes('400')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'SERVER_ERROR';
    }
  }

  return 'UNKNOWN_ERROR';
}

export function shouldRetryError(errorCode: string): boolean {
  return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'].includes(errorCode);
}

export function getRetryDelay(attemptNumber: number): number {
  // Exponential backoff with jitter
  const baseDelay = 1000 * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 1000;
  return Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
}
