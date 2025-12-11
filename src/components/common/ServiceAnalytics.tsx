'use client';

import { useEffect } from 'react';
import { trackBusinessEvent, trackGoogleAds } from '@/lib/analytics';

interface ServiceAnalyticsProps {
  serviceName: string;
}

export default function ServiceAnalytics({ serviceName }: ServiceAnalyticsProps) {
  useEffect(() => {
    // Track service page view via GTM
    trackBusinessEvent.servicePage(serviceName, 'view');
    
    // Track service page view for Google Ads
    trackGoogleAds.pageView(window.location.pathname);
    
    // Track page view conversion for key service pages
    trackGoogleAds.conversions.pageView(1.0);
    
    // Track service engagement conversion (valuable page view)
    trackGoogleAds.conversions.serviceEngagement(serviceName, 1.0);
    
    // Track specific custom event for service views
    trackGoogleAds.customEvent('service_page_view', {
      service_name: serviceName,
      page_category: 'services',
      event_category: 'service_engagement'
    });
  }, [serviceName]);

  return null;
} 