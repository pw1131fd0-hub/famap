// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update value before delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });
    // Not yet elapsed
    expect(result.current).toBe('initial');
  });

  it('updates value after delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('updated');
  });

  it('resets timer on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: 'c', delay: 300 });
    act(() => { vi.advanceTimersByTime(100); });

    // Still showing original value because timer keeps resetting
    expect(result.current).toBe('a');

    // Now advance full delay
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('c');
  });

  it('works with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'start', delay: 500 } }
    );

    rerender({ value: 'end', delay: 500 });
    act(() => { vi.advanceTimersByTime(499); });
    expect(result.current).toBe('start');

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('end');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 200 } }
    );

    rerender({ value: 42, delay: 200 });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe(42);
  });

  it('works with undefined values (age filter)', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce<number | undefined>(value, delay),
      { initialProps: { value: 5 as number | undefined, delay: 300 } }
    );

    rerender({ value: undefined, delay: 300 });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBeUndefined();
  });
});
