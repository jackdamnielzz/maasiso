import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { monitoringService } from '@/lib/monitoring/service';

interface UseProgressiveContentOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  priority?: boolean;
  monitoringKey?: string;
}

export const useProgressiveContent = <T>(
  loadContent: () => Promise<T>,
  options: UseProgressiveContentOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    priority = false,
    monitoringKey
  } = options;

  const [content, setContent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadStartTime = useRef<number>(0);

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
    skip: priority // Skip intersection observer if priority is true
  });

  const loadContentWithMetrics = async () => {
    try {
      loadStartTime.current = performance.now();
      setLoading(true);
      const result = await loadContent();
      setContent(result);
      setError(null);

      if (monitoringKey) {
        const loadTime = performance.now() - loadStartTime.current;
        monitoringService.trackPerformanceMetric({
          name: `content_load_${monitoringKey}`,
          value: loadTime,
          timestamp: Date.now(),
          context: {
            priority,
            inView
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load immediately if priority is true, otherwise wait for inView
    if (priority || inView) {
      loadContentWithMetrics();
    }
  }, [priority, inView]);

  return {
    ref,
    content,
    loading,
    error,
    inView,
    reload: loadContentWithMetrics
  };
};
