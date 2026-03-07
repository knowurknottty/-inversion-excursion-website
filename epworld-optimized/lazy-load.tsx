/**
 * EPWORLD Lazy Loading Utilities
 */

import { 
  lazy, 
  Suspense, 
  useEffect, 
  useRef, 
  useState, 
  useCallback,
  type ComponentType,
  type ReactNode,
  type LazyExoticComponent,
} from 'react';

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: { retryCount?: number; retryDelay?: number } = {}
): LazyExoticComponent<T> {
  const { retryCount = 3, retryDelay = 1000 } = options;
  
  const loadComponent = async (): Promise<{ default: T }> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  };
  
  return lazy(loadComponent);
}

export function useIntersectionObserver(
  options: { rootMargin?: string; threshold?: number; triggerOnce?: boolean; skip?: boolean } = {}
): [(node: HTMLElement | null) => void, boolean] {
  const { rootMargin = '0px', threshold = 0, triggerOnce = false, skip = false } = options;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const hasTriggered = useRef(false);
  
  const setRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);
  
  useEffect(() => {
    if (skip || !elementRef.current) return;
    
    const element = elementRef.current;
    
    const observer = new IntersectionObserver(
      ([observedEntry]) => {
        const intersecting = observedEntry.isIntersecting;
        setIsIntersecting(intersecting);
        
        if (triggerOnce && intersecting) {
          hasTriggered.current = true;
          observer.unobserve(element);
        }
      },
      { rootMargin, threshold }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce, skip]);
  
  return [setRef, isIntersecting];
}

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  skip?: boolean;
}

export function LazyLoad({
  children,
  fallback = null,
  rootMargin = '200px',
  threshold = 0.1,
  skip = false,
}: LazyLoadProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    rootMargin,
    threshold,
    triggerOnce: true,
    skip,
  });
  
  const [hasLoaded, setHasLoaded] = useState(skip);
  
  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      const timer = setTimeout(() => {
        setHasLoaded(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isIntersecting, hasLoaded]);
  
  return (
    <div ref={ref as any} style={{ minHeight: '1px' }}>
      {hasLoaded ? children : fallback}
    </div>
  );
}

export function usePriorityLoad(options: { priority: 'critical' | 'high' | 'normal' | 'low'; delay?: number }): boolean {
  const { priority, delay = 0 } = options;
  const [shouldLoad, setShouldLoad] = useState(priority === 'critical');
  
  useEffect(() => {
    if (priority === 'critical') {
      setShouldLoad(true);
      return;
    }
    
    const delays = { high: 0, normal: 100, low: 300 };
    
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, delay || delays[priority]);
    
    return () => clearTimeout(timer);
  }, [priority, delay]);
  
  return shouldLoad;
}

export function preloadComponent<T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>): void {
  if (typeof window !== 'undefined') {
    const schedule = (window as any).requestIdleCallback || setTimeout;
    schedule(() => {
      importFn();
    });
  }
}

export function preloadData(fetchFn: () => Promise<any>): void {
  if (typeof window !== 'undefined') {
    const schedule = (window as any).requestIdleCallback || setTimeout;
    schedule(() => {
      fetchFn().catch(() => {});
    });
  }
}

export default {
  createLazyComponent,
  useIntersectionObserver,
  LazyLoad,
  usePriorityLoad,
  preloadComponent,
  preloadData,
};
