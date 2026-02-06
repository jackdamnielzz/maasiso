import type { Metadata } from 'next';
import Link from 'next/link';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function toReadableTitle(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = toReadableTitle(slug);

  return {
    title: `${title} | E-learning | MaasISO`,
    description: `E-learning module \"${title}\" van MaasISO. Deze cursuspagina is in voorbereiding.`,
    alternates: {
      canonical: `/kennis/e-learning/${slug}`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ELearningDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const title = toReadableTitle(slug);
  const canonicalPath = `/kennis/e-learning/${slug}`;

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
          { label: 'E-learning', href: '/kennis/e-learning' },
          { label: title, href: canonicalPath },
        ]}
      />

      <section className="py-16 md:py-20">
        <div className="container-custom max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0057B8]">E-learning</p>
          <h1 className="mt-3 text-4xl font-bold text-[#091E42] md:text-5xl">{title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-[#091E42]/80">
            Deze cursuspagina staat klaar in de architectuur en wordt binnenkort gevuld met
            programmadoelen, inhoudsopzet en praktische leeronderdelen.
          </p>

          <div className="mt-10 rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#091E42]">Wat kunt u verwachten?</h2>
            <ul className="mt-4 space-y-2 text-[#091E42]/80">
              <li>Een duidelijke opbouw per module met praktische voorbeelden.</li>
              <li>Concrete vertaling naar ISO-, informatiebeveiligings- en compliance-context.</li>
              <li>Directe koppeling met relevante kernpagina&apos;s en vervolgstappen.</li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/kennis/e-learning"
                className="inline-flex items-center rounded-md border border-[#091E42]/20 px-4 py-2 font-medium text-[#091E42] hover:bg-[#091E42]/5"
              >
                Terug naar e-learning overzicht
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-md bg-[#FF8B00] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#FF9B20]"
              >
                Neem contact op
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}