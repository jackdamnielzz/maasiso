"use client";

import React from 'react';

interface CookieBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onOpenSettings: () => void;
}

export default function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onOpenSettings,
}: CookieBannerProps) {
  return (
    <div
      id="cookie-banner"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Wij respecteren uw privacy</h2>
            <p className="text-gray-600">
              Wij gebruiken cookies om uw ervaring op onze website te verbeteren, voor analyse van websitegebruik en voor
              gepersonaliseerde marketing. U kunt kiezen welke cookies u wilt accepteren. Functionele cookies zijn altijd ingeschakeld omdat deze
              noodzakelijk zijn voor de werking van de website.
            </p>
            <a
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
            >
              Lees meer over ons cookiebeleid
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
            <button
              onClick={onRejectAll}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Alles weigeren
            </button>
            <button
              onClick={onOpenSettings}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Voorkeuren
            </button>
            <button
              onClick={onAcceptAll}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Alles accepteren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
