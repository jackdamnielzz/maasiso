"use client";

import React, { useState, useEffect } from 'react';
import { CookieConsent, CookieCategory } from '@/lib/cookies/types';

interface CookiePreferencesProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: CookieConsent) => void;
  initialPreferences: CookieConsent;
}

export default function CookiePreferences({
  isOpen,
  onClose,
  onSave,
  initialPreferences,
}: CookiePreferencesProps) {
  const [preferences, setPreferences] = useState<CookieConsent>(initialPreferences);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handleToggle = (category: keyof CookieConsent) => {
    if (category === 'functional') return; // Functional cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    const updatedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    onSave(updatedPreferences);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cookie-instellingen</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Sluiten</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Functional Cookies */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Functionele cookies</h3>
                <p className="text-gray-600">Noodzakelijk voor de basisfunctionaliteit van de website</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-blue-600 rounded-full peer"></div>
              </div>
            </div>

            {/* Analytical Cookies */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytische cookies</h3>
                <p className="text-gray-600">Helpen ons te begrijpen hoe bezoekers onze website gebruiken</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences.analytical}
                  onChange={() => handleToggle('analytical')}
                  className="sr-only peer"
                />
                <div 
                  className={`w-11 h-6 rounded-full peer cursor-pointer
                    ${preferences.analytical ? 'bg-blue-600' : 'bg-gray-200'}
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300`}
                  onClick={() => handleToggle('analytical')}
                >
                  <div 
                    className={`absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform
                      ${preferences.analytical ? 'translate-x-full' : 'translate-x-0'}`}
                  />
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Marketing cookies</h3>
                <p className="text-gray-600">Worden gebruikt voor gepersonaliseerde advertenties</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => handleToggle('marketing')}
                  className="sr-only peer"
                />
                <div 
                  className={`w-11 h-6 rounded-full peer cursor-pointer
                    ${preferences.marketing ? 'bg-blue-600' : 'bg-gray-200'}
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300`}
                  onClick={() => handleToggle('marketing')}
                >
                  <div 
                    className={`absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform
                      ${preferences.marketing ? 'translate-x-full' : 'translate-x-0'}`}
                  />
                </div>
              </div>
            </div>

            {/* Third Party Cookies */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cookies van derden</h3>
                <p className="text-gray-600">Maken integratie met externe diensten mogelijk</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences.thirdParty}
                  onChange={() => handleToggle('thirdParty')}
                  className="sr-only peer"
                />
                <div 
                  className={`w-11 h-6 rounded-full peer cursor-pointer
                    ${preferences.thirdParty ? 'bg-blue-600' : 'bg-gray-200'}
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300`}
                  onClick={() => handleToggle('thirdParty')}
                >
                  <div 
                    className={`absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform
                      ${preferences.thirdParty ? 'translate-x-full' : 'translate-x-0'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Voorkeuren opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}