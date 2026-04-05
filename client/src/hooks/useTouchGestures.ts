import { useRef, useCallback, useState } from 'react';

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
}

interface UseSwipeOptions {
  onSwipeLeft?: (velocity: number) => void;
  onSwipeRight?: (velocity: number) => void;
  onSwipeUp?: (velocity: number) => void;
  onSwipeDown?: (velocity: number) => void;
  threshold?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
}

export function useSwipe(options: UseSwipeOptions) {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50, direction = 'both' } = options;
  const swipeState = useRef<SwipeState | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    swipeState.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startTime: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!swipeState.current) return;

    const deltaX = e.changedTouches[0].clientX - swipeState.current.startX;
    const deltaY = e.changedTouches[0].clientY - swipeState.current.startY;
    const velocity = Math.abs(deltaX) / (Date.now() - swipeState.current.startTime);

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (direction === 'vertical') return;
      if (deltaX > threshold) {
        onSwipeRight?.(velocity);
      } else if (deltaX < -threshold) {
        onSwipeLeft?.(velocity);
      }
    } else {
      // Vertical swipe
      if (direction === 'horizontal') return;
      if (deltaY > threshold) {
        onSwipeDown?.(velocity);
      } else if (deltaY < -threshold) {
        onSwipeUp?.(velocity);
      }
    }

    swipeState.current = null;
  }, [direction, onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeUp, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

// Pull to refresh hook
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
}

export function usePullToRefresh({ onRefresh, threshold = 80, disabled = false }: UsePullToRefreshOptions) {
  const pullState = useRef({ startY: 0, pulling: false });
  const containerRef = useRef<HTMLElement | null>(null);
  const [pullProgress, setPullProgress] = useState(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    if (window.scrollY === 0) {
      pullState.current = { startY: e.touches[0].clientY, pulling: true };
      setPullProgress(0);
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pullState.current.pulling) return;
    const delta = e.touches[0].clientY - pullState.current.startY;
    if (delta > 0) {
      e.preventDefault();
      setPullProgress(Math.min(delta / threshold, 1));
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pullState.current.pulling) return;
    const progress = pullProgress;
    if (progress >= 1) {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      }
    }
    pullState.current = { startY: 0, pulling: false };
    setPullProgress(0);
  }, [onRefresh, pullProgress]);

  return {
    containerRef,
    pullProgress,
    handlers: disabled ? {} : {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
