'use client';

import { useEffect } from 'react';
import { trackBusinessEvent } from '@/lib/analytics';

interface ContentMetadata {
  categories: string[];
  tags?: string[];
  author?: string;
  publishedAt?: string;
  readingTime?: number;
}

interface ContentAnalyticsProps {
  contentType: 'blog' | 'news';
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
    const pageSlug = window.location.pathname.split('/').pop() || contentId;

    // Track page view to both internal system and Google Analytics
    const trackPageView = async () => {
      try {
        // Track to internal analytics API
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

        // Track to Google Analytics
        if (contentType === 'blog') {
          trackBusinessEvent.blogPost('view', pageSlug);
          
          // Send detailed blog analytics to GA
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'blog_post_view', {
              blog_title: title,
              blog_categories: metadata.categories.join(', '),
              blog_author: metadata.author || 'Unknown',
              reading_time_minutes: metadata.readingTime || 0,
              published_date: metadata.publishedAt || '',
              event_category: 'content',
              custom_parameter_content_type: contentType
            });
          }
        }
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    // Track reading time and engagement
    const startTime = Date.now();
    let hasTrackedHalfway = false;
    let hasTrackedCompletion = false;

    const trackReadingTime = (isPageUnload = false) => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
      const estimatedReadTime = (metadata.readingTime || 5) * 60; // Convert to seconds
      
      // Use sendBeacon for more reliable data sending during page unload
      const blob = new Blob([JSON.stringify({
        contentType,
        contentId,
        timeSpent,
        sessionId: getSessionId()
      })], { type: 'application/json' });

      navigator.sendBeacon(`${baseUrl}/api/content-metrics/engagement`, blob);

      // Track reading milestones to Google Analytics
      if (contentType === 'blog' && typeof window !== 'undefined' && (window as any).gtag) {
        const readingProgress = (timeSpent / estimatedReadTime) * 100;
        
        // Track 50% reading milestone
        if (!hasTrackedHalfway && readingProgress >= 50) {
          hasTrackedHalfway = true;
          (window as any).gtag('event', 'blog_reading_milestone', {
            milestone: '50_percent',
            blog_title: title,
            time_spent_seconds: timeSpent,
            event_category: 'engagement'
          });
        }
        
        // Track completion (90% or page unload after significant time)
        if (!hasTrackedCompletion && (readingProgress >= 90 || (isPageUnload && timeSpent >= 30))) {
          hasTrackedCompletion = true;
          trackBusinessEvent.blogPost('read_complete', pageSlug);
          
          (window as any).gtag('event', 'blog_read_complete', {
            blog_title: title,
            time_spent_seconds: timeSpent,
            reading_completion_percent: Math.min(readingProgress, 100),
            event_category: 'engagement'
          });
        }
      }
    };

    // Track scrolling for engagement
    const handleScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      
      // Track 50% scroll milestone
      if (!hasTrackedHalfway && scrollPercent >= 50) {
        hasTrackedHalfway = true;
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'scroll_milestone', {
            milestone: '50_percent',
            blog_title: title,
            event_category: 'engagement'
          });
        }
      }
    };

    trackPageView();

    // Track reading time when user leaves the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackReadingTime(true);
      }
    };

    // Track before page unload
    const handleBeforeUnload = () => {
      trackReadingTime(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
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
