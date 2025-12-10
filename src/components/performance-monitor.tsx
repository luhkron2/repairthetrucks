'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: Partial<PerformanceMetrics>) => void;
  enableLogging?: boolean;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export function PerformanceMonitor({ onMetrics, enableLogging = false }: PerformanceMonitorProps) {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const logMetric = (name: string, value: number) => {
      if (enableLogging) {
        console.log(`Performance metric - ${name}: ${value}ms`);
      }
      
      metricsRef.current = { ...metricsRef.current, [name]: value };
      onMetrics?.(metricsRef.current);
    };

    // Observe Core Web Vitals
    const observeWebVitals = () => {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            logMetric('fcp', entry.startTime);
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logMetric('lcp', entry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          if (fidEntry.processingStart) {
            logMetric('fid', fidEntry.processingStart - fidEntry.startTime);
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          const layoutEntry = entry as LayoutShiftEntry;
          if (!layoutEntry.hadRecentInput) {
            clsValue += layoutEntry.value;
          }
        }
        logMetric('cls', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Navigation timing
    const observeNavigation = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        logMetric('ttfb', navigation.responseStart - navigation.requestStart);
      }
    };

    // Resource timing
    const observeResources = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (enableLogging && slowResources.length > 0) {
        console.warn('Slow resources detected:', slowResources.map(resource => ({
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize ?? 0
        })));
      }
    };

    // Memory usage (if available)
    const observeMemory = () => {
      const perfWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };

      if (perfWithMemory.memory && enableLogging) {
        console.log('Memory usage:', {
          used: Math.round(perfWithMemory.memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(perfWithMemory.memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(perfWithMemory.memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    };

    // Initialize observers
    try {
      observeWebVitals();
      observeNavigation();
      observeResources();
      observeMemory();
    } catch (error) {
      console.warn('Performance monitoring failed:', error);
    }

    // Report metrics on page unload
    const reportMetrics = () => {
      if (Object.keys(metricsRef.current).length > 0) {
        // In a real app, you'd send this to your analytics service
        if (enableLogging) {
          console.log('Final performance metrics:', metricsRef.current);
        }
      }
    };

    window.addEventListener('beforeunload', reportMetrics);

    return () => {
      window.removeEventListener('beforeunload', reportMetrics);
    };
  }, [onMetrics, enableLogging]);

  // This component doesn't render anything
  return null;
}

// Hook for manual performance tracking
export function usePerformanceTracker() {
  const startTime = useRef<number | undefined>(undefined);

  const startTracking = (label: string) => {
    startTime.current = performance.now();
    performance.mark(`${label}-start`);
  };

  const endTracking = (label: string) => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      return duration;
    }
    return 0;
  };

  return { startTracking, endTracking };
}
