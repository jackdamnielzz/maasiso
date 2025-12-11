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
import fs from 'fs';
import path from 'path';
import "./globals.css";

// Read critical CSS
const criticalCSS = fs.readFileSync(
  path.join(process.cwd(), 'app/critical.css'),
  'utf-8'
);

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
                console.log('[GTM] Event pushed:', event, data);
              };
              
              // Helper function for page views
              window.trackPageView = function(pagePath, pageTitle) {
                window.dataLayer.push({
                  event: 'page_view',
                  page_path: pagePath,
                  page_title: pageTitle || document.title,
                  page_location: window.location.href
                });
                console.log('[GTM] Page view tracked:', pagePath);
              };
              
              // Helper function for custom events
              window.trackEvent = function(eventName, parameters) {
                window.dataLayer.push({
                  event: eventName,
                  ...parameters
                });
                console.log('[GTM] Custom event tracked:', eventName, parameters);
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
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Street Address 123",
                "addressLocality": "Your City",
                "postalCode": "1234 AB",
                "addressCountry": "NL"
              },
              "telephone": "+31-123-456-7890",
              "openingHours": "Mo-Fr 09:00-17:00",
              "url": "https://www.maasiso.nl"
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
