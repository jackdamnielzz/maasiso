import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Analytics from "@/components/common/Analytics";
import { ExperimentProvider } from "@/components/providers/ExperimentProvider";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentProvider";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="nl">
      <body className={`${inter.variable} font-sans antialiased`}>
        <NavigationProvider>
          <CookieConsentProvider>
            <ExperimentProvider>
              <Layout>{children}</Layout>
              <Suspense fallback={null}>
                <Analytics />
              </Suspense>
            </ExperimentProvider>
          </CookieConsentProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
