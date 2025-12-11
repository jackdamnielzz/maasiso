'use client';

import { useState, useEffect } from 'react';
import { 
  debugGoogleAnalytics, 
  trackBusinessEvent, 
  trackFileDownload,
  trackExternalLinkClick,
  trackSiteSearch,
  trackUserEngagement,
  trackEcommerce,
  trackConversion,
  trackGoogleAds
} from '@/lib/analytics';

export default function GoogleTagManagerTestPage() {
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [gtmStatus, setGtmStatus] = useState<boolean | null>(null);
  const [gtagStatus, setGtagStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Check GTM status on page load
    const timer = setTimeout(() => {
      const status = debugGoogleAnalytics();
      setGtmStatus(status);
      addDebugResult(`🔍 Google Tag Manager Status: ${status ? '✅ Working' : '❌ Not Working'}`);
      
      // Check Google Ads gtag status
      const gtagAvailable = typeof window !== 'undefined' && typeof window.gtag === 'function';
      setGtagStatus(gtagAvailable);
      addDebugResult(`🔍 Google Ads gtag Status: ${gtagAvailable ? '✅ Working' : '❌ Not Working'}`);
      
      if (gtagAvailable) {
        addDebugResult(`🎯 Google Ads ID AW-640419421 is configured`);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const addDebugResult = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGTMEvent = (eventName: string, eventFunction: () => void) => {
    try {
      eventFunction();
      addDebugResult(`✅ ${eventName} - Event sent successfully`);
    } catch (error) {
      addDebugResult(`❌ ${eventName} - Error: ${error}`);
    }
  };

  const testGoogleAdsEvent = () => {
    try {
      // Test Google Ads page view conversion
      trackGoogleAds.conversions.pageView(1.0);
      addDebugResult(`✅ Google Ads Page View Conversion - Sent to AW-640419421/HvHSCK3yqMgaEN2MsLgEC`);
      
      // Test contact form conversion
      trackGoogleAds.conversions.contactForm(2.0);
      addDebugResult(`✅ Google Ads Contact Form Conversion - Sent to AW-640419421/HvHSCK3yqMgaEN2MsLgEC`);
      
      // Test service engagement conversion
      trackGoogleAds.conversions.serviceEngagement('Test Service', 1.5);
      addDebugResult(`✅ Google Ads Service Engagement Conversion - Sent to AW-640419421/HvHSCK3yqMgaEN2MsLgEC`);
      
      // Also test page view tracking
      trackGoogleAds.pageView('/test-deploy');
      addDebugResult(`✅ Google Ads Page View - Sent to AW-640419421`);
    } catch (error) {
      addDebugResult(`❌ Google Ads Test Event - Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Google Tag Manager Test Suite
        </h1>
        
        {/* Status indicator */}
        <div className="mb-8 p-4 rounded-lg border-2" style={{
          backgroundColor: gtmStatus === true ? '#d4edda' : gtmStatus === false ? '#f8d7da' : '#fff3cd',
          borderColor: gtmStatus === true ? '#28a745' : gtmStatus === false ? '#dc3545' : '#ffc107'
        }}>
          <h2 className="text-xl font-semibold mb-2">
            GTM Status: {gtmStatus === null ? '⏳ Checking...' : gtmStatus ? '✅ Active' : '❌ Not Working'}
          </h2>
          <p className="text-sm text-gray-600">
            {gtmStatus === true && 'Google Tag Manager is loaded and responding correctly.'}
            {gtmStatus === false && 'Google Tag Manager is not working. Check console for details.'}
            {gtmStatus === null && 'Checking Google Tag Manager status...'}
          </p>
        </div>

        {/* Test Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          
          {/* Basic Events */}
          <button
            onClick={() => testGTMEvent('Contact Form Submit', () => 
              trackBusinessEvent.contactForm('submit', 'ISO 9001 Consultation')
            )}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔵 Contact Form Test
          </button>

          <button
            onClick={() => testGTMEvent('Service Page View', () => 
              trackBusinessEvent.servicePage('ISO 9001', 'view')
            )}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            🟢 Service View Test
          </button>

          <button
            onClick={() => testGTMEvent('Blog Post Read', () => 
              trackBusinessEvent.blogPost('read_complete', 'iso-certification-guide')
            )}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            🟣 Blog Read Test
          </button>

          {/* Engagement Events */}
          <button
            onClick={() => testGTMEvent('File Download', () => 
              trackFileDownload('ISO-9001-checklist.pdf', 'pdf', 1024000)
            )}
            className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            🟠 File Download Test
          </button>

          <button
            onClick={() => testGTMEvent('External Link Click', () => 
              trackExternalLinkClick('https://www.iso.org', 'ISO Official Website')
            )}
            className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            🔴 External Link Test
          </button>

          <button
            onClick={() => testGTMEvent('Site Search', () => 
              trackSiteSearch('ISO 9001 certification', 25, 'blog')
            )}
            className="p-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            🟦 Search Test
          </button>

          {/* User Engagement */}
          <button
            onClick={() => testGTMEvent('Button Click', () => 
              trackUserEngagement.buttonClick('Test Button', 'GTM Test Page', 'click')
            )}
            className="p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            🟪 Button Click Test
          </button>

          <button
            onClick={() => testGTMEvent('Form Interaction', () => 
              trackUserEngagement.formInteraction('contact_form', 'email_field', 'focus')
            )}
            className="p-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            🟡 Form Focus Test
          </button>

          <button
            onClick={() => testGTMEvent('Time on Section', () => 
              trackUserEngagement.timeOnSection('hero_section', 45)
            )}
            className="p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            🟨 Time Tracking Test
          </button>

          {/* E-commerce Events */}
          <button
            onClick={() => testGTMEvent('View Item', () => 
              trackEcommerce.viewItem('iso-9001-consultation', 'ISO 9001 Consultation', 'services', 1500)
            )}
            className="p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ⚫ View Item Test
          </button>

          <button
            onClick={() => testGTMEvent('Begin Checkout', () => 
              trackEcommerce.beginCheckout(1500, [{
                item_id: 'iso-9001-consultation',
                item_name: 'ISO 9001 Consultation',
                item_category: 'services',
                quantity: 1,
                price: 1500
              }])
            )}
            className="p-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            💚 Begin Checkout Test
          </button>

          <button
            onClick={() => testGTMEvent('Conversion', () => 
              trackConversion('consultation_request', 1500, 'EUR')
            )}
            className="p-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            🌹 Conversion Test
          </button>

          {/* Google Ads Test */}
          <button
            onClick={testGoogleAdsEvent}
            className="p-4 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
          >
            🎯 Google Ads Conversions Test (AW-640419421)
          </button>
        </div>

        {/* Debug Output */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">🔍 Debug Output</h3>
          <div className="bg-gray-100 rounded p-4 max-h-96 overflow-y-auto">
            {debugResults.length === 0 ? (
              <p className="text-gray-500 italic">No events tested yet. Click buttons above to test GTM events.</p>
            ) : (
              debugResults.map((result, index) => (
                <div key={index} className="mb-2 text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
          
          <button
            onClick={() => setDebugResults([])}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Debug Log
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Testing Instructions</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Open browser developer tools (F12)</li>
            <li>• Go to Console tab to see detailed GTM logging</li>
            <li>• Click test buttons above to trigger events</li>
            <li>• Check GTM Preview mode or Real-time reports in Google Analytics</li>
            <li>• Verify events appear in dataLayer (console.log output)</li>
          </ul>
        </div>

        {/* Analytics Configuration Info */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🏷️ Analytics Configuration</h3>
          <div className="text-green-800 space-y-1">
            <p><strong>GTM Container ID:</strong> GTM-556J8S8K</p>
            <p><strong>GA4 Property ID:</strong> G-QHY9D9XR7G</p>
            <p><strong>Google Ads ID:</strong> AW-640419421</p>
            <p><strong>Conversion Label:</strong> HvHSCK3yqMgaEN2MsLgEC</p>
            <p><strong>Events:</strong> GTM events sent to dataLayer, Google Ads events sent via gtag</p>
            <p><strong>Conversions:</strong> Page views, contact forms, and service engagement tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}