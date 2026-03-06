# Performance Budget Recommendations

## Inversion Excursion Website - Performance Budget

**Version:** 1.0  
**Last Updated:** 2024  
**Target:** Core Web Vitals "Good" thresholds

---

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor | Our Target |
|--------|------|-------------------|------|------------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s | **≤ 1.8s** |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms - 500ms | > 500ms | **≤ 150ms** |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | **≤ 0.05** |
| **TTFB** (Time to First Byte) | ≤ 800ms | 800ms - 1.8s | > 1.8s | **≤ 600ms** |
| **FCP** (First Contentful Paint) | ≤ 1.8s | 1.8s - 3.0s | > 3.0s | **≤ 1.2s** |
| **TBT** (Total Blocking Time) | ≤ 200ms | 200ms - 600ms | > 600ms | **≤ 100ms** |

---

## Resource Size Budgets

### Total Page Weight Budget

| Device Type | Budget | Current | Status |
|-------------|--------|---------|--------|
| **Mobile** (3G) | < 500KB | ~50KB | ✅ Excellent |
| **Desktop** | < 1MB | ~50KB | ✅ Excellent |

### Asset-Specific Budgets

| Asset Type | Budget (Max) | Current | Target Compression |
|------------|--------------|---------|-------------------|
| HTML | 50KB | ~15KB | ✅ Minified |
| CSS (Critical) | 15KB | ~5KB | ✅ Inlined |
| CSS (Non-critical) | 50KB | ~6KB | ✅ Deferred |
| JavaScript | 100KB | ~2KB | ✅ Deferred |
| Images (total) | 500KB | 0KB | N/A |
| Fonts | 100KB | ~80KB | Preload key fonts |
| **Total** | **~800KB** | **~50KB** | **✅ Well under budget** |

### Third-Party Script Budget

| Source | Budget | Current | Notes |
|--------|--------|---------|-------|
| Google Fonts | 100KB | ~80KB | Consider self-hosting |
| Analytics | 50KB | 0KB | Add if needed |
| Other scripts | 50KB | 0KB | Monitor carefully |

---

## Network Request Budgets

| Metric | Budget | Current | Notes |
|--------|--------|---------|-------|
| Total Requests | < 20 | ~5 | Excellent |
| Critical Requests | < 5 | ~3 | HTML + Critical CSS + Font |
| DNS Lookups | < 4 | 2 | fonts.googleapis.com, fonts.gstatic.com |

---

## Performance Budget by Phase

### Phase 1: Initial Load (0-1s)

| Metric | Budget |
|--------|--------|
| TTFB | < 200ms |
| First Byte to FCP | < 800ms |
| Critical CSS render | < 1.0s |
| First paint | < 1.2s |

### Phase 2: Interactive (1-3s)

| Metric | Budget |
|--------|--------|
| DOM Ready | < 1.5s |
| Deferred CSS loaded | < 2.0s |
| JavaScript executed | < 2.5s |
| TTI (Time to Interactive) | < 3.0s |

### Phase 3: Fully Loaded (3-5s)

| Metric | Budget |
|--------|--------|
| All resources loaded | < 4.0s |
| LCP element visible | < 2.0s |
| Page weight complete | < 500KB |

---

## Mobile-Specific Budgets

| Metric | Budget | Rationale |
|--------|--------|-----------|
| Page Weight | < 350KB | Slower mobile connections |
| Time to Interactive | < 4.0s | Lower-end device capability |
| JavaScript Execution | < 50KB | CPU-constrained devices |
| Image Bytes | < 200KB | Data plan considerations |

---

## Monitoring Thresholds

### Alert Thresholds (CI/CD)

| Metric | Warning | Error |
|--------|---------|-------|
| Lighthouse Score | < 90 | < 75 |
| LCP | > 2.0s | > 2.5s |
| Total Page Weight | > 400KB | > 600KB |
| JS Bundle Size | > 50KB | > 100KB |
| Unused CSS % | > 30% | > 50% |

### Lighthouse Score Targets

| Category | Target | Minimum |
|----------|--------|---------|
| Performance | 95+ | 90 |
| Accessibility | 100 | 95 |
| Best Practices | 100 | 95 |
| SEO | 100 | 95 |

---

## Implementation Checklist

### Build Process
- [ ] Implement performance budget checks in CI/CD
- [ ] Fail builds that exceed budget
- [ ] Generate bundle size reports
- [ ] Track performance trends over time

### Monitoring Tools
- [ ] Lighthouse CI for automated testing
- [ ] WebPageTest for detailed analysis
- [ ] Chrome User Experience Report (CrUX) for field data
- [ ] Real User Monitoring (RUM) for actual user metrics

### Regular Audits
- [ ] Weekly: Lighthouse scores
- [ ] Monthly: Full performance audit
- [ ] Quarterly: Budget review and adjustment

---

## Budget Enforcement Script Example

```javascript
// perf-budget.js - Run in CI/CD pipeline
const budgets = {
  'main.css': 15000,        // 15KB
  'main.js': 50000,         // 50KB
  'total': 500000,          // 500KB
  'lighthouse': 90          // Score
};

// Check file sizes
const fs = require('fs');
const glob = require('glob');

let totalSize = 0;
let failed = false;

glob.sync('dist/**/*.{js,css,html}').forEach(file => {
  const stats = fs.statSync(file);
  const size = stats.size;
  totalSize += size;
  
  const filename = file.replace('dist/', '');
  if (budgets[filename] && size > budgets[filename]) {
    console.error(`❌ ${filename}: ${size}B > ${budgets[filename]}B budget`);
    failed = true;
  }
});

if (totalSize > budgets.total) {
  console.error(`❌ Total size: ${totalSize}B > ${budgets.total}B budget`);
  failed = true;
}

process.exit(failed ? 1 : 0);
```

---

## Recommended Tools for Budget Monitoring

| Tool | Purpose | Integration |
|------|---------|-------------|
| **Lighthouse CI** | Automated Lighthouse testing | GitHub Actions, CI/CD |
| **bundlesize** | File size tracking | npm, CI/CD |
| **performance-budget** | Custom budget checks | Node.js script |
| **SpeedCurve** | RUM and trend monitoring | SaaS dashboard |
| **Calibre** | Performance monitoring | SaaS with CI integration |

---

## Escalation Policy

| Violation | Action | Owner |
|-----------|--------|-------|
| Warning threshold | Flag in PR | Developer |
| Error threshold | Block merge | Tech Lead |
| Production regression | P1 incident | Engineering Manager |
| Core Web Vitals "Poor" | Immediate fix required | Full team |

---

## Notes

1. **Current state is excellent** - The site is well under all performance budgets
2. **Headroom for features** - Can add up to 450KB more content while staying within budget
3. **Monitor third-party scripts** - Any additions must stay within the 100KB third-party budget
4. **Regular reviews** - Reassess budgets quarterly as content grows

---

*Generated for Inversion Excursion Website Technical Audit*
