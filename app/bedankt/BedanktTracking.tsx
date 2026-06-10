'use client';

import { useEffect, useRef } from 'react';

type BedanktTrackingProps = {
  source?: string;
  norm?: string;
};

// Direct via gtag/dataLayer, niet via trackEvent: die heeft een isInitialized-guard
// die bij een externe redirect (Calendly) nog niet gezet is, waardoor de conversie
// verloren ging.
function fireEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', name, params);
  } else if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...params });
  }
}

export default function BedanktTracking({ source, norm }: BedanktTrackingProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    if (source === 'calendly' && norm === 'iso9001') {
      fireEvent('calendly_booking_conversion_iso9001', { source, norm });
      fireEvent('generate_lead', { source, norm, value: 1, currency: 'EUR' });
    }

    hasTrackedRef.current = true;
  }, [norm, source]);

  return null;
}
