/**
 * EPWORLD Web Vitals React Components
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useWebVitals, WEB_VITALS_THRESHOLDS, type WebVitalMetric, type WebVitalName } from './web-vitals';

const METRIC_NAMES: Record<WebVitalName, string> = {
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift',
  FCP: 'First Contentful Paint',
  TTFB: 'Time to First Byte',
  INP: 'Interaction to Next Paint',
};

const RATING_COLORS = {
  good: 'bg-green-500',
  'needs-improvement': 'bg-yellow-500',
  poor: 'bg-red-500',
};

const RATING_TEXT_COLORS = {
  good: 'text-green-400',
  'needs-improvement': 'text-yellow-400',
  poor: 'text-red-400',
};

interface WebVitalsMonitorProps {
  devOnly?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onMetric?: (metric: WebVitalMetric) => void;
}

export function WebVitalsMonitor({ 
  devOnly = true, 
  position = 'bottom-right',
  onMetric 
}: WebVitalsMonitorProps) {
  const [metrics, setMetrics] = useState<Record<WebVitalName, WebVitalMetric>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(!devOnly || process.env.NODE_ENV === 'development');
  
  const handleMetric = useCallback((metric: WebVitalMetric) => {
    setMetrics(prev => ({ ...prev, [metric.name]: metric }));
    onMetric?.(metric);
  }, [onMetric]);
  
  useWebVitals(handleMetric);
  
  if (!isVisible) return null;
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };
  
  const allMetrics = Object.values(metrics);
  const goodCount = allMetrics.filter(m => m.rating === 'good').length;
  const totalCount = Object.keys(WEB_VITALS_THRESHOLDS).length;
  const score = Math.round((goodCount / totalCount) * 100);
  
  return (
    <div className={`fixed ${positionClasses[position]} z-50 font-mono text-xs`}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg bg-slate-900/95 border border-slate-700 text-white hover:bg-slate-800 transition-colors"
        >
          <span className={score >= 90 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}>●</span>
          <span>Web Vitals: {score}%</span>
        </button>
      ) : (
        <div className="bg-slate-900/95 border border-slate-700 rounded-lg shadow-lg overflow-hidden w-72">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-800/50">
            <span className="font-semibold text-white">Core Web Vitals</span>
            <div className="flex gap-2">
              <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-white">×</button>
              <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-white">−</button>
            </div>
          </div>
          
          <div className="p-2 space-y-1">
            {(Object.keys(WEB_VITALS_THRESHOLDS) as WebVitalName[]).map(name => {
              const metric = metrics[name];
              const threshold = WEB_VITALS_THRESHOLDS[name];
              
              return (
                <div key={name} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${metric ? RATING_COLORS[metric.rating] : 'bg-slate-600'}`} />
                    <span className="text-slate-300">{name}</span>
                  </div>
                  <div className="text-right">
                    {metric ? (
                      <span className={`font-medium ${RATING_TEXT_COLORS[metric.rating]}`}>
                        {metric.value.toFixed(name === 'CLS' ? 3 : 0)}{threshold.unit}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-800/30 text-slate-500 text-center">
            Target: LCP < 2.5s, CLS < 0.1, FID < 100ms
          </div>
        </div>
      )}
    </div>
  );
}

export function PerformanceReport() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);
  
  useWebVitals(useCallback((metric) => {
    setMetrics(prev => [...prev, metric]);
  }, []));
  
  const latestMetrics = metrics.reduce((acc, metric) => {
    acc[metric.name] = metric;
    return acc;
  }, {} as Record<WebVitalName, WebVitalMetric>);
  
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Performance Report</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(Object.keys(WEB_VITALS_THRESHOLDS) as WebVitalName[]).map(name => {
          const metric = latestMetrics[name];
          const threshold = WEB_VITALS_THRESHOLDS[name];
          
          return (
            <div key={name} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{name}</span>
                {metric && (
                  <span className={`text-xs px-2 py-0.5 rounded ${RATING_COLORS[metric.rating]} text-white`}>
                    {metric.rating === 'good' ? 'Good' : metric.rating === 'needs-improvement' ? 'Fair' : 'Poor'}
                  </span>
                )}
              </div>
              
              <div className="text-2xl font-bold text-white">
                {metric ? (
                  <>{metric.value.toFixed(name === 'CLS' ? 3 : 0)}<span className="text-sm text-slate-500 ml-1">{threshold.unit}</span></>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </div>
              
              <div className="text-xs text-slate-500 mt-1">Target: ≤{threshold.good}{threshold.unit}</div>
            </div>
          );
        })}
      </div>
      
      {metrics.length === 0 && (
        <div className="text-center py-8 text-slate-500">Collecting performance data...</div>
      )}
    </div>
  );
}

export default WebVitalsMonitor;
