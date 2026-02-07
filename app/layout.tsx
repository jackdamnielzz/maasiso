import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Analytics from "@/components/common/Analytics";
import { ExperimentProvider } from "@/components/providers/ExperimentProvider";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentProvider";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { MonitoringProvider } from "@/providers/MonitoringProvider";
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
  metadataBase: new URL('https://www.maasiso.nl/'),
  title: "MaasISO | ISO Certificering en Informatiebeveiliging",
  description: "Professionele begeleiding bij ISO certificering en informatiebeveiliging. Specialisten in ISO 9001, ISO 27001 en AVG/GDPR compliance.",
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={inter.variable} data-scroll-behavior="smooth">
      <head>
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
        {/* Google Consent Mode v2 - Default to denied */}
        <Script
          id="google-consent-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'wait_for_update': 500
              });
              gtag('set', 'ads_data_redaction', true);
            `,
          }}
        />
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-556J8S8K');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://www.maasiso.nl/#organization",
              "name": "MaasISO",
              "url": "https://www.maasiso.nl",
              "logo": "https://www.maasiso.nl/apple-touch-icon.png",
              "image": "https://www.maasiso.nl/apple-touch-icon.png",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+31623578344",
                  "email": "info@maasiso.nl",
                  "contactType": "customer support",
                  "areaServed": ["NL", "BE"],
                  "availableLanguage": ["nl", "en"]
                }
              ]
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased text-[#091E42]">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-556J8S8K"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <NavigationProvider>
          <MonitoringProvider>
            <QueryProvider>
              <CookieConsentProvider>
                <ExperimentProvider>
                  <Layout>{children}</Layout>
                  <Suspense fallback={null}>
                    <Analytics />
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
