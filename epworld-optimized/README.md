# EPWORLD Performance Optimization Package

Performance-optimized components and configurations for the EPWORLD React frontend.

## 🎯 Target Metrics

| Metric | Target | Status |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | ✅ Optimized |
| CLS (Cumulative Layout Shift) | < 0.1 | ✅ Optimized |
| FID (First Input Delay) | < 100ms | ✅ Optimized |
| Bundle Size (Initial) | < 200KB | ✅ Optimized |

## 📦 Package Contents

### Configuration Files
- `next.config.js` - Optimized Next.js configuration with code splitting
- `next.config.analyze.js` - Bundle analysis configuration

### Performance Utilities
- `web-vitals.ts` - Core Web Vitals monitoring utility
- `web-vitals-components.tsx` - React components for Web Vitals display
- `lazy-load.tsx` - Lazy loading utilities with intersection observer
- `image-optimization.tsx` - Optimized image components
- `bundle-analyzer.js` - Bundle analysis script

### Optimized Components
- `layout.tsx` - Performance-optimized root layout
- `providers.tsx` - Lazy-loaded provider stack
- `page.tsx` - Code-split homepage with lazy loading
- `components.tsx` - Lightweight UI components
- `globals.css` - Optimized styles with critical CSS

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd apps/web
npm install --save-dev @next/bundle-analyzer
```

### 2. Replace Configuration

Copy the optimized configuration files:

```bash
# Backup original
cp next.config.js next.config.js.bak

# Copy optimized config
cp ../../../epworld-optimized/next.config.js .
```

### 3. Update Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "build:analyze": "ANALYZE=true next build",
    "analyze": "node ../../../epworld-optimized/bundle-analyzer.js",
    "performance:audit": "npm run build:analyze && npm run analyze"
  }
}
```

### 4. Apply Optimized Components

Replace the following files:

```bash
# Layout
cp ../../../epworld-optimized/layout.tsx src/app/layout.tsx

# Providers
cp ../../../epworld-optimized/providers.tsx src/app/providers.tsx

# Global styles
cp ../../../epworld-optimized/globals.css src/app/globals.css

# Homepage
cp ../../../epworld-optimized/page.tsx src/app/page.tsx

# Copy utility files
mkdir -p src/lib/performance
cp ../../../epworld-optimized/web-vitals.ts src/lib/performance/
cp ../../../epworld-optimized/lazy-load.tsx src/lib/performance/
cp ../../../epworld-optimized/image-optimization.tsx src/lib/performance/
```

## 📊 Bundle Analysis

### Run Bundle Analysis

```bash
# Build with analysis
npm run build:analyze

# Generate report
npm run analyze

# Or both in one command
npm run performance:audit
```

### Understanding the Report

The bundle analyzer generates:
- `bundle-report.html` - Visual bundle tree map
- `bundle-stats.json` - Raw statistics
- `bundle-analysis-report.json` - Summary with recommendations

## 🎨 Component Usage

### Lazy Loading Components

```tsx
import { LazyLoad, createLazyComponent } from '@/lib/performance/lazy-load';

// Lazy load a component
const ViralDashboard = createLazyComponent(() => 
  import('@/farcaster/components/ViralDashboard')
);

// Use with LazyLoad wrapper
<LazyLoad fallback={<Skeleton />}>
  <ViralDashboard />
</LazyLoad>
```

### Optimized Images

```tsx
import { OptimizedImage, Avatar } from '@/lib/performance/image-optimization';

// Optimized image with blur placeholder
<OptimizedImage
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
  priority
/>

// Optimized avatar
<Avatar
  src={user.pfpUrl}
  alt={user.username}
  size={40}
  fallback={user.username[0]}
/>
```

### Web Vitals Monitoring

```tsx
import { WebVitalsMonitor } from '@/lib/performance/web-vitals-components';

// Add to layout for development monitoring
<WebVitalsMonitor devOnly position="bottom-right" />
```

## 🔧 Optimization Features

### 1. Bundle Size Optimization
- ✅ Aggressive code splitting
- ✅ Vendor chunk separation
- ✅ Tree shaking enabled
- ✅ Dynamic imports for non-critical components

### 2. Code Splitting
- ✅ Route-based splitting
- ✅ Component-level splitting
- ✅ Vendor chunk optimization
- ✅ Shared chunk extraction

### 3. Image Optimization
- ✅ Lazy loading with Intersection Observer
- ✅ Blur placeholders
- ✅ Responsive images with srcset
- ✅ AVIF/WebP format support
- ✅ Priority loading for above-fold images

### 4. Lazy Loading
- ✅ Intersection Observer based
- ✅ Skeleton placeholders
- ✅ Priority-based loading
- ✅ Error boundaries for failed loads

### 5. Web Vitals
- ✅ LCP (Largest Contentful Paint) tracking
- ✅ CLS (Cumulative Layout Shift) tracking
- ✅ FID (First Input Delay) tracking
- ✅ FCP, TTFB, INP tracking
- ✅ Real-time monitoring overlay

## 📈 Performance Checklist

- [ ] Enable gzip/brotli compression on server
- [ ] Configure CDN for static assets
- [ ] Implement service worker
- [ ] Add resource hints (preconnect, prefetch)
- [ ] Enable HTTP/2 server push for critical assets
- [ ] Monitor Web Vitals in production
- [ ] Set up performance budgets in CI

## 🔍 Debugging Performance

### View Bundle Stats
```bash
npm run build:analyze
# Open .next/analyze/bundle-report.html
```

### Check Web Vitals
```bash
# In development, the monitor overlay shows real-time metrics
npm run dev
```

### Lighthouse Audit
```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --output html --output-path report.html
```

## 📚 Best Practices

### 1. Component Structure
```tsx
// ✅ Good: Lazy load below-fold content
<LazyLoad>
  <ViralDashboard />
</LazyLoad>

// ✅ Good: Use skeleton for loading states
<Suspense fallback={<DashboardSkeleton />}>
  <ViralDashboard />
</Suspense>
```

### 2. Image Optimization
```tsx
// ✅ Good: Provide blur placeholder
<OptimizedImage
  src="/large-image.jpg"
  blurDataURL="/small-preview.jpg"
  width={1200}
  height={600}
/>

// ✅ Good: Use priority for above-fold images
<OptimizedImage src="/hero.jpg" priority />
```

### 3. Code Splitting
```tsx
// ✅ Good: Dynamic import for heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));

// ✅ Good: Preload on user interaction
const { preload } = useImagePreloader();
<button onMouseEnter={() => preload('/next-page.jpg')}>
  Next Page
</button>
```

## 🛠️ Troubleshooting

### Bundle Too Large
1. Run `npm run build:analyze`
2. Check for duplicate dependencies
3. Review large imports
4. Consider replacing heavy libraries

### High CLS
1. Add explicit width/height to images
2. Use skeleton placeholders
3. Reserve space for dynamic content
4. Avoid inserting content above existing content

### Slow LCP
1. Optimize hero images
2. Use `priority` loading for LCP images
3. Preload critical resources
4. Inline critical CSS

## 📄 License

MIT - EPWORLD Team
