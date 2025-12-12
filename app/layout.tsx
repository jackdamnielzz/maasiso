import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Analytics from "@/components/common/Analytics";
import { ExperimentProvider } from "@/components/providers/ExperimentProvider";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentProvider";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { MonitoringProvider } from "@/providers/MonitoringProvider";
import WebVitalsReporter from "@/components/common/WebVitalsReporter";
import "./globals.css";

// Critical CSS inlined at build time (fixes Vercel serverless function bundling issue)
const criticalCSS = `/* Critical CSS for above-the-fold content */
:root {
  --primary-color: #091E42;
  --secondary-color: #00875A;
  --accent-color: #FF8B00;
  --text-color: #172B4D;
}

/* Container */
.container-custom {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header Styles */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: #071631;
  transition: background-color 0.3s ease;
  border-bottom: 3px solid var(--accent-color);
}

.site-header .container-custom {
  height: 80px;
}

/* Main Content Padding for Fixed Header (single source of truth; do not add extra padding in layout wrapper) */
main {
  padding-top: 80px;
}

/* Hero Section */
.hero-section {
  background-color: var(--primary-color);
  color: white;
  padding: 3rem 0;
  min-height: 400px;
  display: flex;
  align-items: center;
  margin-top: -80px;
}

.primary-button {
  display: inline-block;
  background-color: var(--accent-color);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: background-color 0.2s;
}

/* Service Cards */
.service-card {
  background-color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  border: 1px solid #E5E7EB;
  transition: all 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  gap: 1.5rem;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}`;

// Configure Inter font with display swap and proper preloading
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  weight: ['400', '500', '600', '700'],
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif'
  ]
});

export const metadata: Metadata = {
  title: "MaasISO | ISO Certificering en Informatiebeveiliging",
  description: "Professionele begeleiding bij ISO certificering en informatiebeveiliging. Specialisten in ISO 9001, ISO 27001 en AVG/GDPR compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={inter.variable}>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-556J8S8K');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Google tag (gtag.js) for Google Ads */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-640419421"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-640419421');
            `,
          }}
        />
        {/* End Google Ads tag */}

        {/* Initialize dataLayer for custom events */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              
              // Helper function to push events to GTM
              window.pushToDataLayer = function(event, data) {
                window.dataLayer.push({
                  event: event,
                  ...data
                });
              };
              
              // Helper function for page views
              window.trackPageView = function(pagePath, pageTitle) {
                window.dataLayer.push({
                  event: 'page_view',
                  page_path: pagePath,
                  page_title: pageTitle || document.title,
                  page_location: window.location.href
                });
              };
              
              // Helper function for custom events
              window.trackEvent = function(eventName, parameters) {
                window.dataLayer.push({
                  event: eventName,
                  ...parameters
                });
              };
            `,
          }}
        />
        
        <style id="critical-css" dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "MaasISO",
              "url": "https://maasiso.nl",
              "telephone": "+31 (0)6 2357 8344",
              "email": "info@maasiso.nl",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Jol 11-41",
                "postalCode": "8243EE",
                "addressLocality": "Lelystad",
                "addressCountry": "NL"
              },
              "openingHours": "Mo-Fr 09:00-17:00"
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased text-[#091E42]">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-556J8S8K"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <NavigationProvider>
          <MonitoringProvider>
            <QueryProvider>
              <CookieConsentProvider>
                <ExperimentProvider>
                  <Layout>{children}</Layout>
                  <Suspense fallback={null}>
                    <Analytics />
                    <WebVitalsReporter />
                  </Suspense>
                </ExperimentProvider>
              </CookieConsentProvider>
            </QueryProvider>
          </MonitoringProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
