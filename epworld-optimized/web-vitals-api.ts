/**
 * EPWORLD Web Vitals API Endpoint
 * Collects and stores performance metrics from client
 */

import { NextRequest, NextResponse } from 'next/server';

interface WebVitalsPayload {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

// In-memory storage for development (use Redis/DB in production)
const metricsStore: WebVitalsPayload[] = [];
const MAX_STORED_METRICS = 10000;

/**
 * POST /api/analytics/web-vitals
 * Receives Web Vitals metrics from client
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload: WebVitalsPayload = await request.json();
    
    // Validate payload
    if (!isValidPayload(payload)) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }
    
    // Enrich with server-side data
    const enrichedPayload = {
      ...payload,
      timestamp: Date.now(),
      url: request.headers.get('referer') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };
    
    // Store metric
    storeMetric(enrichedPayload);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logMetric(enrichedPayload);
    }
    
    // Check for poor metrics and alert if needed
    if (payload.rating === 'poor') {
      await alertPoorMetric(enrichedPayload);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to process Web Vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/web-vitals
 * Returns aggregated performance metrics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Only allow in development or with auth in production
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ANALYTICS_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('range') || '1h'; // 1h, 24h, 7d
  
  const aggregated = aggregateMetrics(timeRange);
  
  return NextResponse.json(aggregated);
}

/**
 * Validate incoming payload
 */
function isValidPayload(payload: any): payload is WebVitalsPayload {
  const validNames = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'];
  const validRatings = ['good', 'needs-improvement', 'poor'];
  
  return (
    payload &&
    typeof payload === 'object' &&
    validNames.includes(payload.name) &&
    typeof payload.value === 'number' &&
    validRatings.includes(payload.rating) &&
    typeof payload.id === 'string'
  );
}

/**
 * Store metric in memory
 */
function storeMetric(metric: WebVitalsPayload): void {
  metricsStore.push(metric);
  
  // Keep only recent metrics
  if (metricsStore.length > MAX_STORED_METRICS) {
    metricsStore.shift();
  }
}

/**
 * Log metric to console
 */
function logMetric(metric: WebVitalsPayload): void {
  const colors = {
    good: '\x1b[32m',
    'needs-improvement': '\x1b[33m',
    poor: '\x1b[31m',
    reset: '\x1b[0m',
  };
  
  const unit = metric.name === 'CLS' ? '' : 'ms';
  const color = colors[metric.rating];
  
  console.log(
    `[Web Vitals] ${color}${metric.rating.toUpperCase()}${colors.reset} ` +
    `${metric.name}: ${metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}${unit}`
  );
}

/**
 * Alert on poor metrics
 */
async function alertPoorMetric(metric: WebVitalsPayload): Promise<void> {
  // In production, send to Slack/PagerDuty/etc
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service
    // await sendAlert({
    //   metric: metric.name,
    //   value: metric.value,
    //   url: metric.url,
    // });
  }
}

/**
 * Aggregate metrics for reporting
 */
function aggregateMetrics(timeRange: string) {
  const now = Date.now();
  const ranges: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
  };
  
  const cutoff = now - (ranges[timeRange] || ranges['1h']);
  const recentMetrics = metricsStore.filter(m => m.timestamp > cutoff);
  
  // Group by metric name
  const grouped = recentMetrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = [];
    }
    acc[metric.name].push(metric);
    return acc;
  }, {} as Record<string, WebVitalsPayload[]>);
  
  // Calculate statistics
  const stats = Object.entries(grouped).map(([name, metrics]) => {
    const values = metrics.map(m => m.value);
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      name,
      count: metrics.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      good: metrics.filter(m => m.rating === 'good').length,
      needsImprovement: metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: metrics.filter(m => m.rating === 'poor').length,
    };
  });
  
  return {
    timeRange,
    totalMetrics: recentMetrics.length,
    metrics: stats,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get performance score (0-100)
 */
export function getPerformanceScore(): number {
  const recent = metricsStore.slice(-100);
  if (recent.length === 0) return 100;
  
  const goodCount = recent.filter(m => m.rating === 'good').length;
  return Math.round((goodCount / recent.length) * 100);
}

export default {
  POST,
  GET,
  getPerformanceScore,
};
