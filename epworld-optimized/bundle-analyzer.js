/**
 * EPWORLD Bundle Analyzer Script
 * Generates detailed bundle analysis report
 */

const fs = require('fs');
const path = require('path');

// Bundle analysis configuration
const BUNDLE_THRESHOLDS = {
  // Size thresholds in KB
  initial: 200,      // Total initial bundle
  vendor: 150,       // Vendor chunks
  components: 50,    // Component chunks
  image: 100,        // Image assets
};

const TARGET_METRICS = {
  lcp: { target: 2500, max: 4000, unit: 'ms' },
  fid: { target: 100, max: 300, unit: 'ms' },
  cls: { target: 0.1, max: 0.25, unit: '' },
  bundle: { target: 200, max: 500, unit: 'KB' },
};

/**
 * Generate bundle analysis report
 */
async function generateBundleReport() {
  console.log('📦 EPWORLD Bundle Analysis Report');
  console.log('=====================================\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    targets: TARGET_METRICS,
    findings: [],
    recommendations: [],
  };
  
  // Check for bundle stats
  const statsPath = path.join(process.cwd(), '.next', 'analyze', 'bundle-stats.json');
  
  if (fs.existsSync(statsPath)) {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    analyzeWebpackStats(stats, report);
  } else {
    console.log('⚠️  No bundle stats found. Run: ANALYZE=true npm run build\n');
    report.findings.push({
      type: 'warning',
      message: 'Bundle stats not generated yet',
    });
  }
  
  // Check build output
  checkBuildOutput(report);
  
  // Generate recommendations
  generateRecommendations(report);
  
  // Print summary
  printSummary(report);
  
  // Write report to file
  const reportPath = path.join(process.cwd(), 'bundle-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to: ${reportPath}`);
  
  return report;
}

/**
 * Analyze webpack stats
 */
function analyzeWebpackStats(stats, report) {
  const assets = stats.assets || [];
  const chunks = stats.chunks || [];
  
  console.log('📊 Bundle Statistics');
  console.log('---------------------\n');
  
  // Calculate total sizes
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  
  assets.forEach(asset => {
    const sizeKB = asset.size / 1024;
    totalSize += sizeKB;
    
    if (asset.name.endsWith('.js')) {
      jsSize += sizeKB;
    } else if (asset.name.endsWith('.css')) {
      cssSize += sizeKB;
    }
    
    // Check for oversized chunks
    if (sizeKB > 100) {
      report.findings.push({
        type: 'warning',
        category: 'bundle-size',
        message: `Large asset: ${asset.name} (${sizeKB.toFixed(2)} KB)`,
      });
    }
  });
  
  console.log(`Total Bundle Size: ${totalSize.toFixed(2)} KB`);
  console.log(`JavaScript: ${jsSize.toFixed(2)} KB`);
  console.log(`CSS: ${cssSize.toFixed(2)} KB\n`);
  
  // Analyze chunks
  console.log('📦 Chunk Analysis');
  console.log('-----------------');
  
  chunks.forEach(chunk => {
    const chunkSize = chunk.size / 1024;
    console.log(`${chunk.names.join(', ')}: ${chunkSize.toFixed(2)} KB`);
    
    // Check chunk size against thresholds
    if (chunk.names.some(n => n.includes('vendor')) && chunkSize > BUNDLE_THRESHOLDS.vendor) {
      report.findings.push({
        type: 'error',
        category: 'vendor-size',
        message: `Vendor chunk too large: ${chunkSize.toFixed(2)} KB (target: ${BUNDLE_THRESHOLDS.vendor} KB)`,
      });
    }
  });
  
  // Check against target
  if (totalSize > BUNDLE_THRESHOLDS.initial) {
    report.findings.push({
      type: 'error',
      category: 'total-size',
      message: `Total bundle exceeds target: ${totalSize.toFixed(2)} KB > ${BUNDLE_THRESHOLDS.initial} KB`,
    });
  }
}

/**
 * Check build output
 */
function checkBuildOutput(report) {
  console.log('\n🔍 Build Output Check');
  console.log('---------------------');
  
  const distPath = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(distPath)) {
    report.findings.push({
      type: 'error',
      message: 'Build output not found. Run npm run build first.',
    });
    return;
  }
  
  // Check for optimization markers
  const staticPath = path.join(distPath, 'static');
  if (fs.existsSync(staticPath)) {
    console.log('✅ Static assets generated');
  }
  
  // Check for source maps in production
  const hasSourceMaps = fs.existsSync(path.join(distPath, 'static')) && 
    fs.readdirSync(path.join(distPath, 'static'), { recursive: true })
      .some(f => f.endsWith('.map'));
  
  if (hasSourceMaps) {
    report.recommendations.push({
      priority: 'low',
      message: 'Source maps present in build. Remove for production if not needed.',
    });
  }
  
  console.log('✅ Build output verified\n');
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(report) {
  console.log('💡 Optimization Recommendations');
  console.log('-------------------------------\n');
  
  const recommendations = [
    {
      condition: () => report.findings.some(f => f.category === 'bundle-size'),
      message: 'Consider code splitting for large chunks. Use dynamic imports for non-critical components.',
      priority: 'high',
    },
    {
      condition: () => report.findings.some(f => f.category === 'vendor-size'),
      message: 'Vendor bundle too large. Consider tree-shaking or replacing heavy dependencies.',
      priority: 'high',
    },
    {
      condition: () => true,
      message: 'Enable compression (gzip/brotli) on your server for better transfer sizes.',
      priority: 'medium',
    },
    {
      condition: () => true,
      message: 'Use resource hints (preconnect, prefetch) for external domains.',
      priority: 'medium',
    },
    {
      condition: () => true,
      message: 'Implement service worker for caching and offline support.',
      priority: 'low',
    },
    {
      condition: () => true,
      message: 'Monitor Web Vitals in production with Real User Monitoring (RUM).',
      priority: 'high',
    },
  ];
  
  recommendations.forEach((rec, i) => {
    if (rec.condition()) {
      const icon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`${icon} ${rec.message}`);
      report.recommendations.push(rec);
    }
  });
}

/**
 * Print summary
 */
function printSummary(report) {
  console.log('\n📋 Summary');
  console.log('----------');
  
  const errors = report.findings.filter(f => f.type === 'error').length;
  const warnings = report.findings.filter(f => f.type === 'warning').length;
  
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);
  console.log(`Recommendations: ${report.recommendations.length}`);
  
  if (errors === 0 && warnings === 0) {
    console.log('\n✅ All performance targets met!');
  } else {
    console.log(`\n⚠️  ${errors + warnings} issues found. Review recommendations above.`);
  }
}

// Run analysis
if (require.main === module) {
  generateBundleReport().catch(console.error);
}

module.exports = { generateBundleReport, TARGET_METRICS };
