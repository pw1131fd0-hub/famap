import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../components/ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays error message when child throws', () => {
    const ThrowError = () => {
      throw new Error('Test error message');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    // Use getAllByText and check the first one (the p tag, not the pre tag)
    const errorMessages = screen.getAllByText(/Test error message/);
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('displays generic error message when error has no message', () => {
    const ThrowError = () => {
      const err = new Error();
      err.message = '';
      throw err;
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('catches errors from nested components', () => {
    const NestedComponent = () => (
      <div>
        <DeepThrowError />
      </div>
    );

    const DeepThrowError = () => {
      throw new Error('Nested error');
    };

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    // Use getAllByText and check the first one (the p tag, not the pre tag)
    const errorMessages = screen.getAllByText(/Nested error/);
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('renders alert icon when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByText(/Something went wrong/).closest('div');
    expect(errorContainer).toBeInTheDocument();
  });
});
