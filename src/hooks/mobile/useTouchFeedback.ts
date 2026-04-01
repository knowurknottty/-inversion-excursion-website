import { useCallback, useRef } from 'react';

export function useTouchFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    // Try native vibration first
    switch (type) {
      case 'light':
        vibrate(10);
        break;
      case 'medium':
        vibrate(20);
        break;
      case 'heavy':
        vibrate([30, 50, 30]);
        break;
      case 'success':
        vibrate([10, 100, 20]);
        break;
      case 'error':
        vibrate([50, 100, 50]);
        break;
    }

    // Try Haptic Feedback API if available
    // @ts-ignore
    if (window.navigator?.hapticFeedback) {
      // @ts-ignore
      window.navigator.hapticFeedback[type === 'light' ? 'light' : 'heavy']?.();
    }
  }, [vibrate]);

  const useLongPress = useCallback((
    onLongPress: () => void,
    onPress: () => void,
    duration = 500
  ) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);

    const startPress = () => {
      isLongPress.current = false;
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
      }, duration);
    };

    const endPress = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (!isLongPress.current) {
        onPress();
      }
    };

    const cancelPress = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    return {
      onTouchStart: startPress,
      onTouchEnd: endPress,
      onTouchMove: cancelPress,
      onMouseDown: startPress,
      onMouseUp: endPress,
      onMouseLeave: cancelPress,
    };
  }, []);

  return {
    vibrate,
    triggerHaptic,
    useLongPress,
  };
}
