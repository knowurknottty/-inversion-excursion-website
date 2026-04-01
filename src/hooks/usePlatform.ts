/**
 * Platform Detection Hook
 * Detects mobile, tablet, or desktop platform based on screen size and user agent
 */

import { useState, useEffect, useCallback } from 'react';

export type Platform = 'mobile' | 'tablet' | 'desktop';

// Breakpoints for device detection
const MOILE_MAX_WIDTH = 768;
const TABLET_MAX_WIDTH = 1024;

/**
 * Check if device is touch-capable
 */
function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check user agent for mobile indicators
 */
function checkUserAgent(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  
  // Mobile keywords
  const mobileKeywords = [
    'android',
    'iphone',
    'ipad',
    'ipod',
    'windows phone',
    'blackberry',
    'mobile',
    'tablet'
  ];
  
  const isMobileUA = mobileKeywords.some(keyword => ua.includes(keyword));
  const isTabletUA = ua.includes('ipad') || 
                     (ua.includes('android') && !ua.includes('mobile')) ||
                     (ua.includes('tablet'));
  
  if (isTabletUA) return 'tablet';
  if (isMobileUA) return 'mobile';
  return 'desktop';
}

/**
 * Detect platform using multiple signals
 */
function detectPlatform(): Platform {
  // Priority: screen width > user agent > touch capability
  const width = window.innerWidth;
  const uaPlatform = checkUserAgent();
  const touchCapable = isTouchDevice();
  
  // If screen is clearly mobile-sized, trust that
  if (width <= MOILE_MAX_WIDTH) return 'mobile';
  
  // If screen is tablet-sized, check user agent
  if (width <= TABLET_MAX_WIDTH) {
    // If user agent says mobile or tablet, trust it
    if (uaPlatform === 'mobile' || uaPlatform === 'tablet') return uaPlatform;
    // If touch-capable large screen, likely tablet
    if (touchCapable) return 'tablet';
    return 'desktop';
  }
  
  // Large screen - if user agent says mobile, could be large phone or tablet
  if (uaPlatform === 'mobile') return 'mobile';
  if (uaPlatform === 'tablet') return 'tablet';
  
  return 'desktop';
}

/**
 * Hook to detect and track platform
 * @returns current platform ('mobile', 'tablet', or 'desktop')
 */
export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>(() => {
    // Initial detection during SSR/hydration
    if (typeof window === 'undefined') return 'desktop';
    return detectPlatform();
  });
  
  const updatePlatform = useCallback(() => {
    const newPlatform = detectPlatform();
    setPlatform(prev => {
      if (prev !== newPlatform) {
        console.log(`[Platform] Changed from ${prev} to ${newPlatform}`);
        return newPlatform;
      }
      return prev;
    });
  }, []);
  
  useEffect(() => {
    // Update on mount (for SSR compatibility)
    updatePlatform();
    
    // Listen for resize events
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updatePlatform, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updatePlatform);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updatePlatform);
      clearTimeout(resizeTimer);
    };
  }, [updatePlatform]);
  
  return platform;
}

/**
 * Check if platform is mobile (includes tablet for most use cases)
 */
export function useIsMobile(): boolean {
  const platform = usePlatform();
  return platform === 'mobile' || platform === 'tablet';
}

export default usePlatform;
