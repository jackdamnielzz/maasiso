"use client";

import React, { useEffect, useState } from 'react';

export default function CookiePreferencesButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenPreferences = () => {
    if (!mounted) return;
    
    const event = new CustomEvent('openCookiePreferences');
    window.dispatchEvent(event);
  };

  if (!mounted) {
    return null;
  }

  return (
    <button 
      onClick={handleOpenPreferences}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Cookie-instellingen aanpassen
    </button>
  );
}