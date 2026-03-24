import React, { type ReactNode } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { captureException } from '../utils/sentryConfig';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update error count for monitoring repeated errors
    this.setState(prev => ({
      errorCount: prev.errorCount + 1
    }));

    // Log to error tracking service
    captureException(error, {
      react: {
        componentStack: errorInfo.componentStack,
        errorCount: this.state.errorCount + 1,
      },
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = import.meta.env.DEV;
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      const stackTrace = isDevelopment ? this.state.error?.stack : null;

      return (
        <div style={{
          padding: '24px',
          backgroundColor: isDevelopment ? '#fee5e5' : '#fff8f8',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          margin: '16px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <AlertCircle
            color="#ff6b6b"
            size={24}
            style={{ flexShrink: 0, marginTop: '4px' }}
            aria-hidden="true"
          />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '1.1em', color: '#c92a2a' }}>
              Something went wrong
            </strong>
            <p style={{
              fontSize: '0.9em',
              color: '#7c3d2f',
              margin: '8px 0 0 0',
              lineHeight: '1.5'
            }}>
              {errorMessage}
            </p>
            {isDevelopment && stackTrace && (
              <pre style={{
                fontSize: '0.75em',
                color: '#555',
                backgroundColor: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                marginTop: '8px',
                maxHeight: '200px'
              }}>
                {stackTrace}
              </pre>
            )}
            <button
              onClick={this.resetError}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff5252')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b6b')}
              aria-label="Try again"
            >
              <RotateCw size={16} />
              Try again
            </button>
            {this.state.errorCount > 3 && (
              <p style={{
                fontSize: '0.85em',
                color: '#ff6b6b',
                marginTop: '12px',
                fontStyle: 'italic'
              }}>
                Multiple errors detected. Please reload the page if this persists.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
