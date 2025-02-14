'use client';

import { useEffect, useRef, useCallback } from 'react';
import { analytics } from '@/lib/analytics/core';
import { buildContentEvent } from '@/lib/analytics/events';
import type { ContentType } from '@/lib/analytics/types';

interface ContentMetadata {
  categories?: string[];
  author?: string;
  publishedAt?: string;
  readingTime?: number;
  wordCount?: number;
  tags?: string[];
}

interface ContentAnalyticsProps {
  contentType: ContentType;
  contentId: string;
  title: string;
  metadata?: ContentMetadata;
}

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

export default function ContentAnalytics({ 
  contentType,
  contentId,
  title,
  metadata
}: ContentAnalyticsProps) {
  const scrollThresholds = useRef(new Set(SCROLL_THRESHOLDS));
  const startTime = useRef(Date.now());
  const interactions = useRef(0);

  // Track scroll depth
  const handleScroll = useCallback(() => {
    if (scrollThresholds.current.size === 0) return;

    const scrollPercent = Math.round(
      (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
    );

    scrollThresholds.current.forEach(threshold => {
      if (scrollPercent >= threshold) {
        analytics.track(buildContentEvent(
          'scroll_content',
          contentType,
          contentId,
          title,
          metadata,
          {
            timeSpent: Math.round((Date.now() - startTime.current) / 1000),
            scrollDepth: threshold,
            interactions: interactions.current,
            completion: threshold === 100
          }
        ));
        scrollThresholds.current.delete(threshold);
      }
    });
  }, [contentType, contentId, title, metadata]);

  // Track user interactions
  useEffect(() => {
    const handleInteraction = () => {
      interactions.current += 1;
    };

    // Track clicks and key presses
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Store cleanup function in a ref to avoid dependency issues
  const cleanupRef = useRef(() => {});

  // Track initial view and setup scroll tracking
  useEffect(() => {
    // Track initial view with enhanced metadata
    const viewMetadata = {
      ...metadata,
      publishDate: metadata?.publishedAt, // Map to correct property name
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      viewport: typeof window !== 'undefined' 
        ? `${window.innerWidth}x${window.innerHeight}`
        : undefined
    };

    analytics.track(buildContentEvent(
      'view_content',
      contentType,
      contentId,
      title,
      viewMetadata
    ));

    // Set up scroll tracking
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
    }

    // Update cleanup function
    cleanupRef.current = () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }

      // Track engagement metrics
      const scrollDepth = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      );

      analytics.track(buildContentEvent(
        'content_engagement',
        contentType,
        contentId,
        title,
        metadata,
        {
          timeSpent: Math.round((Date.now() - startTime.current) / 1000),
          scrollDepth,
          interactions: interactions.current,
          completion: scrollThresholds.current.size === 0
        }
      ));
    };

    // Return cleanup function
    return () => cleanupRef.current();
  }, [contentType, contentId, title, metadata, handleScroll]);

  // Add a wrapper div with test attributes while maintaining invisible analytics
  return (
    <div 
      data-testid="content-analytics"
      data-content-type={contentType}
      data-content-id={contentId}
      data-reading-time={metadata?.readingTime}
      className="hidden"
      aria-hidden="true"
    />
  );
}
