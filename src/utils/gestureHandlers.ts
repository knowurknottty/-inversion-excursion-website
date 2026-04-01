import React from 'react';

// Detect swipe direction from velocity
export const detectSwipeDirection = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold = 50
): 'left' | 'right' | 'up' | 'down' | null => {
  const diffX = endX - startX;
  const diffY = endY - startY;
  const absX = Math.abs(diffX);
  const absY = Math.abs(diffY);

  if (absX < threshold && absY < threshold) return null;

  if (absX > absY) {
    return diffX > 0 ? 'right' : 'left';
  } else {
    return diffY > 0 ? 'down' : 'up';
  }
};

// Calculate swipe velocity
export const calculateVelocity = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number
): number => {
  const distance = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  return distance / duration;
};

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDuration?: number;
}

interface GestureProps {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

// Higher order component for gesture handling
export function withGestures<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  gestureConfig: GestureConfig
): React.ComponentType<Omit<P, keyof GestureProps>> {
  return function GestureComponent(props: Omit<P, keyof GestureProps>) {
    const startPos = React.useRef({ x: 0, y: 0, time: 0 });
    const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = React.useRef(false);

    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startPos.current = { 
        x: touch.clientX, 
        y: touch.clientY, 
        time: Date.now() 
      };
      isLongPress.current = false;

      if (gestureConfig.onLongPress) {
        longPressTimer.current = setTimeout(() => {
          isLongPress.current = true;
          gestureConfig.onLongPress?.();
        }, gestureConfig.longPressDuration || 500);
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (longPressTimer.current) {
        const touch = e.touches[0];
        const diffX = Math.abs(touch.clientX - startPos.current.x);
        const diffY = Math.abs(touch.clientY - startPos.current.y);

        if (diffX > 10 || diffY > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (isLongPress.current) return;

      const touch = e.changedTouches[0];
      const duration = Date.now() - startPos.current.time;
      const direction = detectSwipeDirection(
        startPos.current.x,
        startPos.current.y,
        touch.clientX,
        touch.clientY,
        gestureConfig.threshold
      );

      const velocity = calculateVelocity(
        startPos.current.x,
        startPos.current.y,
        touch.clientX,
        touch.clientY,
        duration
      );

      // Only trigger if swipe was fast enough
      if (velocity > 0.3) {
        switch (direction) {
          case 'left':
            gestureConfig.onSwipeLeft?.();
            break;
          case 'right':
            gestureConfig.onSwipeRight?.();
            break;
          case 'up':
            gestureConfig.onSwipeUp?.();
            break;
          case 'down':
            gestureConfig.onSwipeDown?.();
            break;
        }
      }
    };

    return React.createElement(WrappedComponent, {
      ...(props as P),
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    });
  };
}