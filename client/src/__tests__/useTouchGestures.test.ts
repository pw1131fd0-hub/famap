import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSwipe, usePullToRefresh } from '../hooks/useTouchGestures';

// Mock document methods
const mockScrollTo = vi.fn();
window.scrollTo = mockScrollTo;

describe('useSwipe', () => {
  let onSwipeLeft: ReturnType<typeof vi.fn>;
  let onSwipeRight: ReturnType<typeof vi.fn>;
  let onSwipeUp: ReturnType<typeof vi.fn>;
  let onSwipeDown: ReturnType<typeof vi.fn>;
  let handlers: ReturnType<typeof useSwipe>;

  beforeEach(() => {
    vi.clearAllMocks();
    onSwipeLeft = vi.fn();
    onSwipeRight = vi.fn();
    onSwipeUp = vi.fn();
    onSwipeDown = vi.fn();
  });

  it('returns touch handlers with onTouchStart and onTouchEnd', () => {
    const { onTouchStart, onTouchEnd } = useSwipe({
      onSwipeLeft,
      onSwipeRight,
    });

    expect(onTouchStart).toBeDefined();
    expect(onTouchEnd).toBeDefined();
    expect(typeof onTouchStart).toBe('function');
    expect(typeof onTouchEnd).toBe('function');
  });

  it('calls onSwipeLeft when swiping left', () => {
    const hook = useSwipe({ onSwipeLeft, threshold: 50 });

    // Simulate touch start at x=100
    hook.onTouchStart({ touches: [{ clientX: 100, clientY: 100 }] } as any);

    // Simulate touch end at x=30 (swipe left)
    hook.onTouchEnd({ changedTouches: [{ clientX: 30, clientY: 100 }] } as any);

    expect(onSwipeLeft).toHaveBeenCalled();
  });

  it('calls onSwipeRight when swiping right', () => {
    const hook = useSwipe({ onSwipeRight, threshold: 50 });

    hook.onTouchStart({ touches: [{ clientX: 30, clientY: 100 }] } as any);
    hook.onTouchEnd({ changedTouches: [{ clientX: 100, clientY: 100 }] } as any);

    expect(onSwipeRight).toHaveBeenCalled();
  });

  it('does not trigger for small movements below threshold', () => {
    const hook = useSwipe({ onSwipeLeft, threshold: 50 });

    hook.onTouchStart({ touches: [{ clientX: 100, clientY: 100 }] } as any);
    hook.onTouchEnd({ changedTouches: [{ clientX: 80, clientY: 100 }] } as any);

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('calculates velocity correctly', () => {
    const hook = useSwipe({ onSwipeLeft, threshold: 10 });

    hook.onTouchStart({ touches: [{ clientX: 100, clientY: 100 }] } as any);

    // Fast swipe (higher velocity)
    hook.onTouchEnd({
      changedTouches: [{ clientX: 20, clientY: 100 }],
      timeStamp: 100,
    } as any);

    expect(onSwipeLeft).toHaveBeenCalledWith(expect.any(Number));
  });
});

describe('usePullToRefresh', () => {
  let onRefresh: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onRefresh = vi.fn().mockResolvedValue(undefined);
    window.scrollY = 0;
  });

  it('returns handlers when not disabled', () => {
    const hook = usePullToRefresh({
      onRefresh,
    });

    expect(hook.handlers.onTouchStart).toBeDefined();
    expect(hook.handlers.onTouchMove).toBeDefined();
    expect(hook.handlers.onTouchEnd).toBeDefined();
  });

  it('returns empty handlers when disabled', () => {
    const hook = usePullToRefresh({
      onRefresh,
      disabled: true,
    });

    expect(Object.keys(hook.handlers)).toHaveLength(0);
  });

  it('calculates pull progress correctly', () => {
    const hook = usePullToRefresh({
      onRefresh,
      threshold: 80,
    });

    // Simulate pull
    hook.handlers.onTouchStart?.({ touches: [{ clientY: 0 }] } as any);
    hook.handlers.onTouchMove?.({
      touches: [{ clientY: 40 }],
      preventDefault: vi.fn(),
    } as any);

    // Progress should be 40/80 = 0.5
    expect(hook.pullProgress).toBe(0.5);
  });
});
