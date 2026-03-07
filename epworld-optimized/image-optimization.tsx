/**
 * EPWORLD Image Optimization
 * Optimized image components with lazy loading and blur placeholders
 */

'use client';

import { 
  useState, 
  useEffect, 
  useRef, 
  useCallback,
  forwardRef,
  type ImgHTMLAttributes,
  type CSSProperties,
} from 'react';
import { useIntersectionObserver } from './lazy-load';

// ============================================
// TYPES
// ============================================

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** Image source URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Aspect ratio to maintain */
  aspectRatio?: string;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Blur hash for placeholder (optional) */
  blurHash?: string;
  /** Blur placeholder URL (low-res version) */
  blurDataURL?: string;
  /** Whether to lazy load */
  lazy?: boolean;
  /** Root margin for lazy loading */
  rootMargin?: string;
  /** Priority loading (eager) */
  priority?: boolean;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Srcset for responsive images */
  srcSet?: string;
  /** Loading state callback */
  onLoadStart?: () => void;
  /** Loaded callback */
  onLoadComplete?: () => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Container className */
  containerClassName?: string;
  /** Container styles */
  containerStyle?: CSSProperties;
}

// ============================================
// OPTIMIZED IMAGE COMPONENT
// ============================================

/**
 * Optimized Image Component
 * Features:
 * - Lazy loading with intersection observer
 * - Blur placeholder while loading
 * - Aspect ratio preservation
 * - Responsive images support
 * - Error handling
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage({
    src,
    alt,
    width,
    height,
    aspectRatio,
    objectFit = 'cover',
    blurHash,
    blurDataURL,
    lazy = true,
    rootMargin = '200px',
    priority = false,
    sizes,
    srcSet,
    onLoadStart,
    onLoadComplete,
    onError,
    containerClassName = '',
    containerStyle = {},
    style = {},
    className = '',
    ...imgProps
  }, forwardedRef) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(priority || !lazy);
    const imgRef = useRef<HTMLImageElement>(null);
    
    // Use intersection observer for lazy loading
    const [setIntersectionRef, isIntersecting] = useIntersectionObserver({
      rootMargin,
      threshold: 0,
      triggerOnce: true,
      skip: priority || !lazy,
    });
    
    // Trigger load when intersecting
    useEffect(() => {
      if (isIntersecting && !shouldLoad) {
        setShouldLoad(true);
      }
    }, [isIntersecting, shouldLoad]);
    
    // Handle image load
    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      onLoadComplete?.();
    }, [onLoadComplete]);
    
    // Handle image error
    const handleError = useCallback(() => {
      setHasError(true);
      onError?.(new Error(`Failed to load image: ${src}`));
    }, [onError, src]);
    
    // Set up image event listeners
    useEffect(() => {
      if (!shouldLoad) return;
      
      const img = imgRef.current;
      if (!img) return;
      
      if (img.complete) {
        handleLoad();
      } else {
        onLoadStart?.();
        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
      }
      
      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    }, [shouldLoad, handleLoad, handleError, onLoadStart]);
    
    // Combine refs
    const setRefs = useCallback(
      (node: HTMLImageElement | null) => {
        imgRef.current = node;
        setIntersectionRef(node);
        
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, setIntersectionRef]
    );
    
    // Calculate aspect ratio padding
    const paddingBottom = aspectRatio 
      ? undefined 
      : height && width 
        ? `${(height / width) * 100}%`
        : '56.25%'; // Default 16:9
    
    const containerStyles: CSSProperties = {
      position: 'relative',
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : 'auto',
      aspectRatio: aspectRatio || undefined,
      overflow: 'hidden',
      backgroundColor: '#1e293b',
      ...containerStyle,
    };
    
    const imageStyles: CSSProperties = {
      ...style,
      objectFit,
      opacity: isLoaded ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
    };
    
    const placeholderStyles: CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(20px)',
      transform: 'scale(1.1)',
      opacity: isLoaded ? 0 : 1,
      transition: 'opacity 0.3s ease-in-out',
    };
    
    return (
      <div 
        className={`optimized-image-container ${containerClassName}`}
        style={containerStyles}
      >
        {/* Blur placeholder */}
        {(blurDataURL || blurHash) && !isLoaded && (
          <div style={placeholderStyles} aria-hidden="true" />
        )}
        
        {/* Main image */}
        {shouldLoad && !hasError && (
          <img
            ref={setRefs}
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            srcSet={srcSet}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            style={imageStyles}
            className={`optimized-image ${className}`}
            {...imgProps}
          />
        )}
        
        {/* Error state */}
        {hasError && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-slate-800"
            style={{ opacity: isLoaded ? 0 : 1 }}
          >
            <span className="text-slate-500 text-sm">Failed to load</span>
          </div>
        )}
      </div>
    );
  }
);

// ============================================
// RESPONSIVE IMAGE COMPONENT
// ============================================

export interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'srcSet' | 'sizes'> {
  /** Available image widths */
  widths?: number[];
  /** Quality setting (1-100) */
  quality?: number;
  /** Base URL pattern with {width} placeholder */
  srcPattern?: string;
}

/**
 * Responsive Image with automatic srcSet generation
 */
export function ResponsiveImage({
  src,
  widths = [640, 750, 828, 1080, 1200, 1920],
  quality = 80,
  srcPattern,
  ...props
}: ResponsiveImageProps) {
  // Generate srcSet
  const srcSet = widths
    .map(w => {
      const url = srcPattern 
        ? srcPattern.replace('{width}', w.toString())
        : src;
      return `${url} ${w}w`;
    })
    .join(', ');
  
  // Generate sizes attribute
  const sizes = widths
    .map((w, i) => {
      if (i === widths.length - 1) return `${w}px`;
      return `(max-width: ${w}px) ${w}px`;
    })
    .join(', ');
  
  return (
    <OptimizedImage
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      {...props}
    />
  );
}

// ============================================
// BACKGROUND IMAGE COMPONENT
// ============================================

export interface BackgroundImageProps {
  /** Image source */
  src: string;
  /** Children to render over background */
  children: React.ReactNode;
  /** Container className */
  className?: string;
  /** Background position */
  position?: CSSProperties['backgroundPosition'];
  /** Background size */
  size?: CSSProperties['backgroundSize'];
  /** Lazy load background */
  lazy?: boolean;
  /** Overlay color */
  overlay?: string;
  /** Minimum height */
  minHeight?: string;
}

/**
 * Lazy-loaded background image container
 */
export function BackgroundImage({
  src,
  children,
  className = '',
  position = 'center',
  size = 'cover',
  lazy = true,
  overlay,
  minHeight = '300px',
}: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [setRef, isIntersecting] = useIntersectionObserver({
    rootMargin: '200px',
    triggerOnce: true,
    skip: !lazy,
  });
  
  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad]);
  
  useEffect(() => {
    if (!shouldLoad) return;
    
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [shouldLoad, src]);
  
  const containerStyle: CSSProperties = {
    position: 'relative',
    backgroundImage: shouldLoad ? `url(${src})` : undefined,
    backgroundPosition: position,
    backgroundSize: size,
    backgroundRepeat: 'no-repeat',
    minHeight,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out',
  };
  
  return (
    <div
      ref={setRef as any}
      className={`background-image ${className}`}
      style={containerStyle}
    >
      {overlay && (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: overlay }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================
// AVATAR COMPONENT
// ============================================

export interface AvatarProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  /** Avatar size in pixels */
  size?: number;
  /** Fallback initials when image fails */
  fallback?: string;
  /** Border radius */
  rounded?: boolean;
}

/**
 * Optimized Avatar component
 */
export function Avatar({
  src,
  alt,
  size = 40,
  fallback,
  rounded = true,
  className = '',
  onError,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.(new Error(`Failed to load avatar: ${src}`));
  }, [onError, src]);
  
  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: rounded ? '50%' : '8px',
    overflow: 'hidden',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
  
  if (hasError || !src) {
    const initials = fallback || alt.slice(0, 2).toUpperCase();
    
    return (
      <div 
        className={`avatar avatar-fallback ${className}`}
        style={containerStyle}
        title={alt}
      >
        <span 
          className="text-white font-medium"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      </div>
    );
  }
  
  return (
    <div className={`avatar ${className}`} style={containerStyle}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        objectFit="cover"
        lazy={false} // Avatars are typically above fold
        onError={handleError}
        {...props}
      />
    </div>
  );
}

// ============================================
// IMAGE PRELOAD UTILITIES
// ============================================

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]): void {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Preload image on hover intent
 */
export function useImagePreloader() {
  const preloaded = useRef<Set<string>>(new Set());
  
  const preload = useCallback((url: string) => {
    if (preloaded.current.has(url)) return;
    
    const img = new Image();
    img.src = url;
    preloaded.current.add(url);
  }, []);
  
  return { preload };
}

// ============================================
// EXPORTS
// ============================================

export default {
  OptimizedImage,
  ResponsiveImage,
  BackgroundImage,
  Avatar,
  preloadImages,
  useImagePreloader,
};
