import { useEffect, useState, useCallback, useRef } from 'react';

export interface ScrollState {
  progress: number;
  velocity: number;
  direction: 'up' | 'down' | 'none';
  isAtTop: boolean;
  isAtBottom: boolean;
}

export function useScrollProgress() {
  const [scrollState, setScrollState] = useState<ScrollState>({
    progress: 0,
    velocity: 0,
    direction: 'none',
    isAtTop: true,
    isAtBottom: false
  });
  
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const rafId = useRef<number | undefined>(undefined);

  const calculateScrollState = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    const now = Date.now();
    const timeDelta = now - lastTime.current;
    const scrollDelta = scrollY - lastScrollY.current;
    const velocity = timeDelta > 0 ? Math.abs(scrollDelta / timeDelta) * 100 : 0;
    
    setScrollState({
      progress: Math.min(100, Math.max(0, progress)),
      velocity: Math.min(100, velocity),
      direction: scrollDelta > 0.5 ? 'down' : scrollDelta < -0.5 ? 'up' : 'none',
      isAtTop: scrollY < 10,
      isAtBottom: scrollY >= docHeight - 10
    });
    
    lastScrollY.current = scrollY;
    lastTime.current = now;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(calculateScrollState);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateScrollState();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [calculateScrollState]);

  return scrollState;
}

export function useInView(threshold = 0.2) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;
      const rect = elementRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const relativeScroll = scrolled - elementTop + window.innerHeight;
      setOffset(relativeScroll * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref: elementRef, offset };
}
