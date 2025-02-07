"use client";

import React, { useState, useEffect } from 'react';
import { CookieConsent, CookieCategory } from '@/lib/cookies/types';
import { cookieStorage } from '@/lib/cookies/cookieStorage';
import { cookieManager } from '@/lib/cookies/cookieManager';
import CookieBanner from './CookieBanner';
import CookiePreferences from './CookiePreferences';

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(cookieStorage.getConsent());
  const [mounted, setMounted] = useState(false);

  // Only show banner/preferences after component is mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    const hasConsent = cookieStorage.isConsentGiven();
    setShowBanner(!hasConsent);

    // Listen for custom event to open preferences
    const handleOpenPreferences = () => {
      setShowPreferences(true);
    };

    window.addEventListener('openCookiePreferences', handleOpenPreferences);

    return () => {
      window.removeEventListener('openCookiePreferences', handleOpenPreferences);
    };
  }, []);

  // Apply consent preferences whenever they change
  useEffect(() => {
    if (!mounted) return;

    const categories = {
      [CookieCategory.FUNCTIONAL]: true, // Always true
      [CookieCategory.ANALYTICAL]: consent.analytical,
      [CookieCategory.MARKETING]: consent.marketing,
      [CookieCategory.THIRD_PARTY]: consent.thirdParty
    };

    cookieManager.applyConsent(categories);
  }, [consent, mounted]);

  const handleAcceptAll = () => {
    const newConsent: CookieConsent = {
      ...consent,
      functional: true,
      analytical: true,
      marketing: true,
      thirdParty: true,
      timestamp: new Date().toISOString(),
      version: consent.version
    };

    cookieStorage.setConsent(newConsent);
    setConsent(newConsent);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const newConsent: CookieConsent = {
      ...consent,
      functional: true,
      analytical: false,
      marketing: false,
      thirdParty: false,
      timestamp: new Date().toISOString(),
      version: consent.version
    };

    cookieStorage.setConsent(newConsent);
    setConsent(newConsent);
    setShowBanner(false);
  };

  const handleSavePreferences = (preferences: CookieConsent) => {
    cookieStorage.setConsent(preferences);
    setConsent(preferences);
    setShowPreferences(false);
    setShowBanner(false);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Cookie Banner */}
      {showBanner && (
        <CookieBanner
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onOpenSettings={() => setShowPreferences(true)}
        />
      )}

      {/* Cookie Preferences Modal */}
      <CookiePreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handleSavePreferences}
        initialPreferences={consent}
      />
    </>
  );
};

export default CookieConsentProvider;