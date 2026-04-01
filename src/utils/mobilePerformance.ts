/**
 * Mobile Performance Utilities
 * Optimizations for 60fps on mid-range phones
 */

// Detect device capabilities
export const getDeviceCapabilities = () => {
  const memory = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const connection = (navigator as any).connection;
  
  return {
    memory,
    cores,
    saveData: connection?.saveData || false,
    effectiveType: connection?.effectiveType || '4g',
    isLowEnd: memory < 4 || cores < 4,
  };
};

// Throttle function for scroll/resize handlers
export const throttle = <T extends (...args: any[]) => void>(
  fn: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn(...args);
    }
  };
};

// Debounce function for search/input handlers
export const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

// Lazy load images
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img.lazy').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

// Request idle callback polyfill
export const requestIdle = <T extends () => void>(callback: T, timeout = 2000) => {
  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback, { timeout });
  }
  return setTimeout(callback, 1);
};

// Monitor FPS
export const createFPSMonitor = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 60;

  const update = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);

  return {
    getFPS: () => fps,
    isPerformant: () => fps >= 45,
  };
};

// Preload critical resources
export const preloadResource = (href: string, as: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};
