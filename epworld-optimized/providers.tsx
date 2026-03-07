/**
 * EPWORLD Optimized Providers
 * Performance-optimized provider setup with lazy loading
 */

'use client';

import { ReactNode, Suspense, lazy, useEffect, useState } from 'react';
import { FarcasterProvider } from '@/farcaster';
import { WebVitalsMonitor } from '../web-vitals-components';

// Lazy load non-critical providers
const AnalyticsProvider = lazy(() => import('./analytics-provider'));
const PerformanceProvider = lazy(() => import('./performance-provider'));

interface ProvidersProps {
  children: ReactNode;
}

// Simple loading fallback to prevent hydration mismatch
function ProvidersFallback() {
  return null;
}

/**
 * Optimized Provider Stack
 * 
 * Order matters:
 * 1. Critical providers (Farcaster) - load immediately
 * 2. Non-critical providers (Analytics, Performance) - lazy loaded
 */
export function Providers({ children }: ProvidersProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Prevent hydration mismatch for client-only features
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <>
      {/* Critical providers - always loaded */}
      <FarcasterProvider>
        {children}
      </FarcasterProvider>
      
      {/* Web Vitals Monitor - development only, client only */}
      {isMounted && process.env.NODE_ENV === 'development' && (
        <WebVitalsMonitor devOnly position="bottom-right" />
      )}
      
      {/* Non-critical providers - lazy loaded */}
      {isMounted && (
        <>
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>
          
          <Suspense fallback={null}>
            <PerformanceProvider />
          </Suspense>
        </>
      )}
    </>
  );
}

/**
 * Analytics Provider (Lazy Loaded)
 * Handles Google Analytics, Fathom, etc.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    // Initialize analytics only after user interaction or delay
    const initAnalytics = () => {
      // Analytics initialization
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
        // Load GA script dynamically
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
        script.async = true;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          send_page_view: false, // We'll handle this manually
        });
      }
    };
    
    // Delay analytics load
    const timer = setTimeout(initAnalytics, 3000);
    
    // Or load on first user interaction
    const handleInteraction = () => {
      clearTimeout(timer);
      initAnalytics();
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
    
    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('click', handleInteraction, { once: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, []);
  
  return null;
}

/**
 * Performance Provider (Lazy Loaded)
 * Monitors and reports performance metrics
 */
export function PerformanceProvider() {
  useEffect(() => {
    // Report performance metrics to analytics
    const reportPerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          connect: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.startTime,
          download: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventEnd - navigation.startTime,
          load: navigation.loadEventEnd - navigation.startTime,
        };
        
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'performance_metrics', metrics);
        }
      }
    };
    
    // Report after page load
    if (document.readyState === 'complete') {
      reportPerformance();
    } else {
      window.addEventListener('load', reportPerformance);
      return () => window.removeEventListener('load', reportPerformance);
    }
  }, []);
  
  return null;
}

// Type declarations for global window
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default Providers;
