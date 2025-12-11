import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nieuws | MaasISO',
  description: 'De nieuwspagina van MaasISO wordt binnenkort beschikbaar. Neem contact op voor het laatste nieuws.',
  keywords: 'nieuws, MaasISO, updates'
};

export default function NewsPage() {
  return (
    <main className="flex-1">
      <section className="bg-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Nieuws</h1>
            <p className="text-lg text-gray-700 mb-6">
              De nieuwspagina wordt binnenkort beschikbaar. Neem contact met ons op voor het laatste nieuws over MaasISO.
            </p>
            <div className="mt-6">
              <Link href="/" className="inline-block px-6 py-3 bg-[#FF8B00] text-white rounded-md shadow hover:bg-[#e67a00] transition-colors">
                Terug naar home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
