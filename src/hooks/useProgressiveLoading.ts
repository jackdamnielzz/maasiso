import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseProgressiveLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useProgressiveLoading = <T>(
  loadData: () => Promise<T>,
  options: UseProgressiveLoadingOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { 
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce
  });

  useEffect(() => {
    if (inView && !data && !loading) {
      setLoading(true);
      loadData()
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [inView, data, loading, loadData]);

  return {
    ref,
    data,
    loading,
    error,
    inView
  };
};
