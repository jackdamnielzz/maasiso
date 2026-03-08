import type { Metadata } from 'next';
import { Suspense } from 'react';
import ThankYouClient from './ThankYouClient';

export const metadata: Metadata = {
  title: 'Bedankt voor uw aankoop | MaasISO',
  description: 'Uw TRA-rapport wordt gedownload.',
  robots: { index: false, follow: false },
};

export default function BedanktPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-16">
        <Suspense fallback={
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FF8B00]/10 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-[#FF8B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#091E42] mb-2">Even geduld...</h1>
          </div>
        }>
          <ThankYouClient />
        </Suspense>
      </div>
    </main>
  );
}
