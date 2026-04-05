// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSwipe, usePullToRefresh } from '../hooks/useTouchGestures';

// Mock document methods
const mockScrollTo = vi.fn();
window.scrollTo = mockScrollTo;

describe('useSwipe', () => {
  let onSwipeLeft: ReturnType<typeof vi.fn>;
  let onSwipeRight: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onSwipeLeft = vi.fn();
    onSwipeRight = vi.fn();
  });

  it('returns touch handlers with onTouchStart and onTouchEnd', () => {
    const { result } = renderHook(() => useSwipe({
      onSwipeLeft,
      onSwipeRight,
    }));

    expect(result.current.onTouchStart).toBeDefined();
    expect(result.current.onTouchEnd).toBeDefined();
    expect(typeof result.current.onTouchStart).toBe('function');
    expect(typeof result.current.onTouchEnd).toBe('function');
  });

  it('calls onSwipeLeft when swiping left', () => {
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, threshold: 50 }));

    // Simulate touch start at x=100
    act(() => {
      result.current.onTouchStart({ touches: [{ clientX: 100, clientY: 100 }] } as any);
    });

    // Simulate touch end at x=30 (swipe left)
    act(() => {
      result.current.onTouchEnd({ changedTouches: [{ clientX: 30, clientY: 100 }] } as any);
    });

    expect(onSwipeLeft).toHaveBeenCalled();
  });

  it('calls onSwipeRight when swiping right', () => {
    const { result } = renderHook(() => useSwipe({ onSwipeRight, threshold: 50 }));

    act(() => {
      result.current.onTouchStart({ touches: [{ clientX: 30, clientY: 100 }] } as any);
    });
    act(() => {
      result.current.onTouchEnd({ changedTouches: [{ clientX: 100, clientY: 100 }] } as any);
    });

    expect(onSwipeRight).toHaveBeenCalled();
  });

  it('does not trigger for small movements below threshold', () => {
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, threshold: 50 }));

    act(() => {
      result.current.onTouchStart({ touches: [{ clientX: 100, clientY: 100 }] } as any);
    });
    act(() => {
      result.current.onTouchEnd({ changedTouches: [{ clientX: 80, clientY: 100 }] } as any);
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('calculates velocity correctly', () => {
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, threshold: 10 }));

    act(() => {
      result.current.onTouchStart({ touches: [{ clientX: 100, clientY: 100 }] } as any);
    });

    // Fast swipe (higher velocity)
    act(() => {
      result.current.onTouchEnd({
        changedTouches: [{ clientX: 20, clientY: 100 }],
        timeStamp: 100,
      } as any);
    });

    expect(onSwipeLeft).toHaveBeenCalledWith(expect.any(Number));
  });
});

describe('usePullToRefresh', () => {
  let onRefresh: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onRefresh = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  it('returns handlers when not disabled', () => {
    const { result } = renderHook(() => usePullToRefresh({
      onRefresh,
    }));

    expect(result.current.handlers.onTouchStart).toBeDefined();
    expect(result.current.handlers.onTouchMove).toBeDefined();
    expect(result.current.handlers.onTouchEnd).toBeDefined();
  });

  it('returns empty handlers when disabled', () => {
    const { result } = renderHook(() => usePullToRefresh({
      onRefresh,
      disabled: true,
    }));

    expect(Object.keys(result.current.handlers)).toHaveLength(0);
  });

  it('calculates pull progress correctly', () => {
    const { result } = renderHook(() => usePullToRefresh({
      onRefresh,
      threshold: 80,
    }));

    // Simulate pull
    act(() => {
      result.current.handlers.onTouchStart?.({ touches: [{ clientY: 0 }] } as any);
    });
    act(() => {
      result.current.handlers.onTouchMove?.({
        touches: [{ clientY: 40 }],
        preventDefault: vi.fn(),
      } as any);
    });

    // Progress should be 40/80 = 0.5
    expect(result.current.pullProgress).toBe(0.5);
  });
});
