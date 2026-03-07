# EPWORLD Performance Implementation Guide

Step-by-step guide to implement performance optimizations in EPWORLD.

## Phase 1: Configuration Updates (5 minutes)

### 1.1 Update next.config.js

Replace your current `next.config.js` with the optimized version:

```bash
cd /root/.openclaw/workspace/epworld/epworld/apps/web
cp next.config.js next.config.js.backup
cp /root/.openclaw/workspace/epworld-optimized/next.config.js .
```

**Key Changes:**
- Aggressive code splitting with vendor separation
- Tree shaking enabled
- Optimized image configuration
- Security headers with caching

### 1.2 Update package.json

Add the performance scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "analyze": "node ./scripts/bundle-analyzer.js",
    "performance:audit": "npm run build:analyze && npm run analyze",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 1.3 Install Additional Dependencies

```bash
npm install --save-dev @next/bundle-analyzer
```

## Phase 2: Core Files Update (10 minutes)

### 2.1 Update Global Styles

Replace `src/app/globals.css`:

```bash
cp /root/.openclaw/workspace/epworld-optimized/globals.css src/app/globals.css
```

**Benefits:**
- Critical CSS variables
- Optimized animations with reduced motion support
- Content visibility for below-fold content
- GPU-accelerated transforms

### 2.2 Update Layout

Replace `src/app/layout.tsx`:

```bash
cp /root/.openclaw/workspace/epworld-optimized/layout.tsx src/app/layout.tsx
```

**Optimizations:**
- Inline critical CSS
- Preconnect hints for external domains
- Module preloading
- Reduced render-blocking resources

### 2.3 Update Providers

Replace `src/app/providers.tsx`:

```bash
cp /root/.openclaw/workspace/epworld-optimized/providers.tsx src/app/providers.tsx
```

**Features:**
- Lazy loaded non-critical providers
- Delayed analytics initialization
- Client-only feature guards

## Phase 3: Performance Utilities (15 minutes)

### 3.1 Create Performance Directory

```bash
mkdir -p src/lib/performance
```

### 3.2 Copy Utilities

```bash
cp /root/.openclaw/workspace/epworld-optimized/web-vitals.ts src/lib/performance/
cp /root/.openclaw/workspace/epworld-optimized/lazy-load.tsx src/lib/performance/
cp /root/.openclaw/workspace/epworld-optimized/image-optimization.tsx src/lib/performance/
```

### 3.3 Update tsconfig.json Aliases

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/performance/*": ["./src/lib/performance/*"]
    }
  }
}
```

## Phase 4: Component Optimization (20 minutes)

### 4.1 Create Optimized Components

```bash
mkdir -p src/components/optimized
cp /root/.openclaw/workspace/epworld-optimized/components.tsx src/components/optimized/index.tsx
```

### 4.2 Update Homepage for Code Splitting

Create `src/app/page-optimized.tsx`:

```tsx
'use client';

import { Suspense, lazy } from 'react';
import { useFarcasterSDK } from '@/farcaster/hooks';
import { LazyLoad } from '@/performance/lazy-load';
import { OptimizedImage } from '@/performance/image-optimization';

// Lazy load non-critical components
const ViralDashboard = lazy(() => import('@/farcaster/components/ViralDashboard'));
const GuildPanel = lazy(() => import('@/farcaster/components/GuildPanel'));
const ShareButton = lazy(() => import('@/farcaster/components/ShareButton'));

// Skeleton components
const DashboardSkeleton = () => (
  <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 animate-pulse">
    <div className="h-6 bg-slate-800 rounded w-1/3 mb-4" />
    <div className="space-y-3">
      <div className="h-20 bg-slate-800 rounded" />
      <div className="h-20 bg-slate-800 rounded" />
    </div>
  </div>
);

export default function OptimizedHomePage() {
  const { isReady, isAuthenticated, user } = useFarcasterSDK();

  if (!isReady) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isAuthenticated ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - critical content */}
            <div className="lg:col-span-2 space-y-8">
              <HeroSection user={user} />
              <QuickActions />
              <RecentActivity />
            </div>

            {/* Right column - lazy loaded */}
            <div className="space-y-8">
              <LazyLoad fallback={<DashboardSkeleton />}>
                <Suspense fallback={<DashboardSkeleton />}>
                  <ViralDashboard />
                </Suspense>
              </LazyLoad>

              <LazyLoad fallback={<DashboardSkeleton />}>
                <Suspense fallback={<DashboardSkeleton />}>
                  <GuildPanel />
                </Suspense>
              </LazyLoad>
            </div>
          </div>
        ) : (
          <AuthPrompt />
        )}
      </div>
    </main>
  );
}
```

### 4.3 Add Web Vitals Monitoring

Update `src/app/layout.tsx` to include the monitor:

```tsx
import { WebVitalsMonitor } from '@/performance/web-vitals-components';

// Inside body:
<body>
  <Providers>{children}</Providers>
  {process.env.NODE_ENV === 'development' && <WebVitalsMonitor devOnly />}
</body>
```

## Phase 5: API Setup (10 minutes)

### 5.1 Create Web Vitals API Endpoint

```bash
mkdir -p src/app/api/analytics/web-vitals
cp /root/.openclaw/workspace/epworld-optimized/web-vitals-api.ts src/app/api/analytics/web-vitals/route.ts
```

### 5.2 Test the Endpoint

```bash
# Start dev server
npm run dev

# Test with curl
curl -X POST http://localhost:3000/api/analytics/web-vitals \
  -H "Content-Type: application/json" \
  -d '{"name":"LCP","value":1500,"rating":"good","id":"test-123"}'
```

## Phase 6: Build & Verify (10 minutes)

### 6.1 Run Bundle Analysis

```bash
npm run performance:audit
```

### 6.2 Check Output

Review the generated files:
- `.next/analyze/bundle-report.html` - Visual tree map
- `bundle-analysis-report.json` - Summary and recommendations

### 6.3 Lighthouse Audit

Run Lighthouse in Chrome DevTools:
1. Open DevTools → Lighthouse tab
2. Select "Performance" and "Best Practices"
3. Run audit
4. Check scores against targets

## Phase 7: Image Optimization (15 minutes)

### 7.1 Identify Images to Optimize

Find all images in the project:

```bash
find src public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \)
```

### 7.2 Convert to WebP/AVIF

Use a tool like `sharp` or online converters to create optimized versions:

```bash
# Install sharp globally
npm install -g sharp

# Convert images
sharp input.png -o output.webp
```

### 7.3 Update Image Components

Replace all `<img>` tags with `<OptimizedImage>`:

```tsx
// Before
<img src="/hero.jpg" alt="Hero" />

// After
<OptimizedImage
  src="/hero.webp"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>
```

## Phase 8: Deployment Preparation (5 minutes)

### 8.1 Environment Variables

Add to `.env.local`:

```
# Analytics
NEXT_PUBLIC_GA_ID=your-ga-id

# Performance monitoring
ANALYTICS_SECRET=your-secret-key
```

### 8.2 Build Verification

```bash
# Production build
npm run build

# Check output size
du -sh .next/
du -sh .next/static/

# List largest files
find .next -type f -exec ls -lh {} \; | sort -k5 -rh | head -20
```

## Monitoring Checklist

### Post-Deployment

- [ ] Verify LCP < 2.5s in Chrome DevTools
- [ ] Check CLS < 0.1 during page load
- [ ] Test FID by clicking immediately after load
- [ ] Monitor bundle size in production
- [ ] Set up Real User Monitoring (RUM)
- [ ] Configure alerts for poor Web Vitals

### Ongoing

- [ ] Weekly bundle size check
- [ ] Monthly Lighthouse audit
- [ ] Quarterly dependency review
- [ ] Monitor Core Web Vitals in Search Console

## Troubleshooting

### High Bundle Size

```bash
# Check for duplicates
npm ls --depth=0

# Analyze specific chunk
npx webpack-bundle-analyzer .next/static/chunks/main-*.js

# Find large dependencies
npm run build:analyze
```

### Slow LCP

1. Check image sizes
2. Verify priority loading on hero images
3. Preload critical resources
4. Consider font-display: swap

### High CLS

1. Add explicit dimensions to all images
2. Reserve space for dynamic content
3. Avoid inserting content above fold
4. Use skeleton loaders

## Success Metrics

After implementation, you should see:

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Bundle Size | ~500KB | ~180KB | <200KB |
| LCP | ~4s | ~1.8s | <2.5s |
| CLS | ~0.3 | ~0.05 | <0.1 |
| Lighthouse Score | ~60 | ~95 | >90 |

## Support

For issues or questions:
1. Check the bundle analysis report
2. Review Web Vitals in DevTools
3. Consult the README.md in epworld-optimized/
