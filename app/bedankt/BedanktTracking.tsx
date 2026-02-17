'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

type BedanktTrackingProps = {
  source?: string;
  norm?: string;
};

export default function BedanktTracking({ source, norm }: BedanktTrackingProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    if (source === 'calendly' && norm === 'iso9001') {
      trackEvent({
        name: 'calendly_booking_conversion_iso9001',
        params: {
          source,
          norm,
        },
      });

      trackEvent({
        name: 'generate_lead',
        params: {
          source,
          norm,
          value: 1,
        },
      });
    }

    hasTrackedRef.current = true;
  }, [norm, source]);

  return null;
}
