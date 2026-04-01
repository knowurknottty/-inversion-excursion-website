import { useState, useCallback, useRef, useEffect } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

export function useSwipeGesture(config: SwipeConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefault = true,
  } = config;

  const [isSwiping, setIsSwiping] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    currentPos.current = { x: touch.clientX, y: touch.clientY };
    startTime.current = Date.now();
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const touch = e.touches[0];
    currentPos.current = { x: touch.clientX, y: touch.clientY };

    // Prevent default scrolling for horizontal swipes
    if (preventDefault) {
      const diffX = Math.abs(currentPos.current.x - startPos.current.x);
      const diffY = Math.abs(currentPos.current.y - startPos.current.y);
      
      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    }
  }, [isSwiping, preventDefault]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    
    const diffX = currentPos.current.x - startPos.current.x;
    const diffY = currentPos.current.y - startPos.current.y;
    const elapsedTime = Date.now() - startTime.current;
    
    // Check if swipe was fast enough (velocity)
    const velocity = Math.sqrt(diffX * diffX + diffY * diffY) / elapsedTime;
    const isValidSwipe = velocity > 0.5 || Math.abs(diffX) > threshold || Math.abs(diffY) > threshold;
    
    if (!isValidSwipe) return;

    // Determine swipe direction
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (absX > absY) {
      // Horizontal swipe
      if (absX > threshold) {
        if (diffX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (absY > threshold) {
        if (diffY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  }, [isSwiping, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Mouse events for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    currentPos.current = { x: e.clientX, y: e.clientY };
    startTime.current = Date.now();
    setIsSwiping(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSwiping) return;
    currentPos.current = { x: e.clientX, y: e.clientY };
  }, [isSwiping]);

  const handleMouseUp = useCallback(() => {
    handleTouchEnd();
  }, [handleTouchEnd]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    isSwiping,
  };
}

// Hook for pull-to-refresh
export function usePullToRefresh(onRefresh: () => void, threshold = 100) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isAtTop = useRef(true);

  useEffect(() => {
    const checkScrollPosition = () => {
      isAtTop.current = window.scrollY === 0;
    };

    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isAtTop.current) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || !isAtTop.current) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance
    const resistedDistance = Math.sqrt(distance) * 5;
    setPullDistance(Math.min(resistedDistance, threshold * 1.5));

    if (distance > 0) {
      e.preventDefault();
    }
  }, [isPulling, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= threshold) {
      onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    pullDistance,
    isPulling,
  };
}
