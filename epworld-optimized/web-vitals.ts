/**
 * EPWORLD Web Vitals Monitor
 * Tracks Core Web Vitals and performance metrics
 */

import { useEffect, useCallback, useRef } from 'react';

export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  FID: { good: 100, poor: 300, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: '' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
  INP: { good: 200, poor: 500, unit: 'ms' },
};

export type WebVitalName = keyof typeof WEB_VITALS_THRESHOLDS;

export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
}

export type WebVitalsCallback = (metric: WebVitalMetric) => void;

export function getRating(name: WebVitalName, value: number): WebVitalMetric['rating'] {
  const threshold = WEB_VITALS_THRESHOLDS[name];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function generateMetricId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function reportToAnalytics(metric: WebVitalMetric): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    const color = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(`[Web Vitals] ${color} ${metric.name}: ${metric.value.toFixed(2)}${WEB_VITALS_THRESHOLDS[metric.name].unit}`);
  }
  
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(metric)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/web-vitals', blob);
    }
  } catch (e) {
    // Silent fail
  }
}

function measureLCP(onReport: WebVitalsCallback): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }
  
  let lcpValue = 0;
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    lcpValue = entries[entries.length - 1].startTime;
  });
  
  observer.observe({ entryTypes: ['largest-contentful-paint'] as any });
  
  const reportLCP = () => {
    if (lcpValue > 0) {
      onReport({
        name: 'LCP',
        value: lcpValue,
        rating: getRating('LCP', lcpValue),
        id: generateMetricId(),
      });
    }
  };
  
  document.addEventListener('visibilitychange', reportLCP);
  
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', reportLCP);
  };
}

function measureCLS(onReport: WebVitalsCallback): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }
  
  let clsValue = 0;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
  });
  
  observer.observe({ entryTypes: ['layout-shift'] as any });
  
  const reportCLS = () => {
    onReport({
      name: 'CLS',
      value: clsValue,
      rating: getRating('CLS', clsValue),
      id: generateMetricId(),
    });
  };
  
  document.addEventListener('visibilitychange', reportCLS);
  
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', reportCLS);
  };
}

function measureFID(onReport: WebVitalsCallback): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const delay = (entry as any).processingStart - entry.startTime;
      onReport({
        name: 'FID',
        value: delay,
        rating: getRating('FID', delay),
        id: generateMetricId(),
      });
      observer.disconnect();
      break;
    }
  });
  
  observer.observe({ entryTypes: ['first-input'] as any });
  return () => observer.disconnect();
}

function measureFCP(onReport: WebVitalsCallback): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if ((entry as any).name === 'first-contentful-paint') {
        onReport({
          name: 'FCP',
          value: entry.startTime,
          rating: getRating('FCP', entry.startTime),
          id: generateMetricId(),
        });
        observer.disconnect();
        break;
      }
    }
  });
  
  observer.observe({ entryTypes: ['paint'] as any });
  return () => observer.disconnect();
}

function measureTTFB(onReport: WebVitalsCallback): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    const ttfb = navigation.responseStart - navigation.startTime;
    onReport({
      name: 'TTFB',
      value: ttfb,
      rating: getRating('TTFB', ttfb),
      id: generateMetricId(),
    });
  }
  
  return () => {};
}

export function useWebVitals(onReport?: WebVitalsCallback) {
  const handleMetric = useCallback((metric: WebVitalMetric) => {
    reportToAnalytics(metric);
    onReport?.(metric);
  }, [onReport]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const cleanupFns = [
      measureLCP(handleMetric),
      measureCLS(handleMetric),
      measureFID(handleMetric),
      measureFCP(handleMetric),
      measureTTFB(handleMetric),
    ];
    
    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [handleMetric]);
}

export default useWebVitals;
