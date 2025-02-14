/**
 * Performance monitoring type definitions
 */

// Chrome-specific memory info
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

// Extend Performance interface for Chrome
declare global {
  interface Performance {
    memory?: MemoryInfo;
  }
}

export interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export interface LargestContentfulPaintEntry extends PerformanceEntry {
  element: Element;
  size: number;
  startTime: number;
}

export interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  duration: number;
}

export interface ResourceEntry extends PerformanceResourceTiming {
  initiatorType: string;
  transferSize: number;
}

export function isLayoutShiftEntry(entry: PerformanceEntry): entry is LayoutShiftEntry {
  return entry.entryType === 'layout-shift';
}

export function isLargestContentfulPaintEntry(entry: PerformanceEntry): entry is LargestContentfulPaintEntry {
  return entry.entryType === 'largest-contentful-paint';
}

export function isFirstInputEntry(entry: PerformanceEntry): entry is FirstInputEntry {
  return entry.entryType === 'first-input';
}

export function isResourceEntry(entry: PerformanceEntry): entry is ResourceEntry {
  return entry.entryType === 'resource';
}

export interface PerformanceMetricsData {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  loadComplete: number;
  memoryUsage?: number;
  cacheHitRate: number;
  cacheErrorRate: number;
}
