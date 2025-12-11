import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Nieuwsartikel | MaasISO',
    description: 'Dit nieuwsartikel is tijdelijk niet beschikbaar. De nieuwspagina wordt binnenkort vernieuwd.'
  };
}

export default function NewsArticlePage(props: any) {
  const { params } = props;
  const title = 'Artikel binnenkort beschikbaar';
  const message =
    'Het volledige nieuwsartikel wordt binnenkort beschikbaar. Neem contact met ons op voor het laatste nieuws over MaasISO.';

  return (
    <main className="flex-1 bg-white py-20">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-gray-700 mb-6">{message}</p>
          <div className="mt-6">
            <Link href="/news" className="inline-block px-5 py-3 bg-[#FF8B00] text-white rounded-md shadow hover:bg-[#e67a00] transition-colors">
              Terug naar Nieuws
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
