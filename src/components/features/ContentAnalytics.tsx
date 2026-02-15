'use client';

import { useEffect } from 'react';

interface ContentMetadata {
  categories: string[];
  tags?: string[];
  author?: string;
  publishedAt?: string;
  readingTime?: number;
}

interface ContentAnalyticsProps {
  contentType: 'blog';
  contentId: string;
  title: string;
  metadata: ContentMetadata;
}

export default function ContentAnalytics({ 
  contentType, 
  contentId, 
  title, 
  metadata 
}: ContentAnalyticsProps) {
  useEffect(() => {
    const baseUrl = window.location.origin;

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch(`${baseUrl}/api/content-metrics/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentType,
            contentId,
            title,
            metadata,
            timestamp: new Date().toISOString(),
            sessionId: getSessionId()
          }),
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    // Track reading time
    const startTime = Date.now();
    const trackReadingTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
      
      // Use sendBeacon instead of fetch for more reliable data sending during page unload
      const blob = new Blob([JSON.stringify({
        contentType,
        contentId,
        timeSpent,
        sessionId: getSessionId()
      })], { type: 'application/json' });

      navigator.sendBeacon(`${baseUrl}/api/content-metrics/engagement`, blob);
    };

    trackPageView();

    // Track reading time when user leaves the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackReadingTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Don't track reading time on component unmount as it might interfere with navigation
    };
  }, [contentType, contentId, title, metadata]);

  return null; // This is an analytics component, so it doesn't render anything
}

// Helper function to get or create a session ID
function getSessionId(): string {
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}
