'use client';

import { useEffect } from 'react';
import { trackGoogleAds } from '@/lib/analytics';

interface PageViewConversionProps {
  pageName: string;
  conversionValue?: number;
}

export default function PageViewConversion({ pageName, conversionValue = 1.0 }: PageViewConversionProps) {
  useEffect(() => {
    // Track page view conversion for important pages
    trackGoogleAds.conversions.pageView(conversionValue);
    
    console.log(`[Google Ads] Page view conversion tracked for: ${pageName} (value: ${conversionValue})`);
  }, [pageName, conversionValue]);

  return null;
} 