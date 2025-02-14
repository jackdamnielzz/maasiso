import { useEffect } from 'react';

export function MetricsDisabler() {
  useEffect(() => {
    // Remove any existing metrics elements
    const removeMetrics = () => {
      const metricsElements = document.querySelectorAll('[data-next-metrics]');
      metricsElements.forEach(element => element.remove());
    };

    // Initial removal
    removeMetrics();

    // Set up observer to remove any new metrics elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        removeMetrics();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return null;
}