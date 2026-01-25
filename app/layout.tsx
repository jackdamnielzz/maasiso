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
              "@type": "Organization",
              "@id": "https://maasiso.nl/#organization",
              "name": "MaasISO",
              "url": "https://maasiso.nl",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Street Address 123",
                "addressLocality": "Your City",
                "postalCode": "1234 AB",
                "addressCountry": "NL"
              },
              "telephone": "+31-123-456-7890"
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased text-[#091E42]">
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
