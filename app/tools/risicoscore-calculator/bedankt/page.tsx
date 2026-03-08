import type { Metadata } from 'next';
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
        <ThankYouClient />
      </div>
    </main>
  );
}
