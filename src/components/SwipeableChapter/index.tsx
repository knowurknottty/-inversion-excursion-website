import { useRef, useState, useCallback } from 'react';
import { useTouchFeedback } from '@hooks/mobile/useTouchFeedback';
import './SwipeableChapter.css';

interface SwipeableChapterProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onLongPress: () => void;
  chapter: {
    id: number;
    title: string;
  };
}

export function SwipeableChapter({
  children,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
}: SwipeableChapterProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const { triggerHaptic } = useTouchFeedback();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setIsDragging(true);
    isLongPress.current = false;
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      triggerHaptic('medium');
      onLongPress();
    }, 600);
  }, [onLongPress, triggerHaptic]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Cancel long press if moving significantly
    if (Math.abs(diff) > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Apply resistance
    setSwipeOffset(diff * 0.5);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    const diff = currentX.current - startX.current;
    const threshold = 80;
    
    if (diff > threshold) {
      // Swiped right - go previous
      triggerHaptic('light');
      onSwipeRight();
    } else if (diff < -threshold) {
      // Swiped left - go next
      triggerHaptic('light');
      onSwipeLeft();
    }
    
    setSwipeOffset(0);
  }, [onSwipeLeft, onSwipeRight, triggerHaptic]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress();
  }, [onLongPress]);

  return (
    <div 
      className={`swipeable-chapter ${isDragging ? 'dragging' : ''}`}
      style={{ 
        transform: `translateX(${swipeOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      {/* Swipe indicators */}
      <div className={`swipe-indicator swipe-left-indicator ${swipeOffset < -30 ? 'visible' : ''}`}>
        <span className="swipe-arrow">←</span>
        <span className="swipe-text">Previous</span>
      </div>
      
      <div className={`swipe-indicator swipe-right-indicator ${swipeOffset > 30 ? 'visible' : ''}`}>
        <span className="swipe-text">Next</span>
        <span className="swipe-arrow">→</span>
      </div>
      
      {children}
    </div>
  );
}
