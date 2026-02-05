import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import { getWhitepaperBySlug } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function toAbsoluteDownloadUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.STRAPI_URL || '';
  if (!backendBaseUrl) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  return `${backendBaseUrl.replace(/\/+$/g, '')}/${path.replace(/^\/+/g, '')}`;
}

function toNlDate(dateInput?: string): string | null {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'long' }).format(date);
}

export async function generateMetadata(
  { params }: PageProps,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const { whitepaper } = await getWhitepaperBySlug(decodeURIComponent(resolvedParams.slug));

  if (!whitepaper) {
    return {
      title: 'Whitepaper niet gevonden | MaasISO',
      description: 'De opgevraagde whitepaper kon niet worden gevonden.',
      robots: { index: false, follow: false },
    };
  }

  const description =
    whitepaper.description?.slice(0, 160) ||
    `Lees de whitepaper ${whitepaper.title} van MaasISO.`;
  const canonicalSlug = whitepaper.slug || resolvedParams.slug;

  return {
    title: `${whitepaper.title} | Whitepaper | MaasISO`,
    description,
    alternates: {
      canonical: `/kennis/whitepapers/${canonicalSlug}`,
    },
    openGraph: {
      title: `${whitepaper.title} | Whitepaper | MaasISO`,
      description,
      type: 'article',
      url: `/kennis/whitepapers/${canonicalSlug}`,
    },
  };
}

export default async function WhitepaperDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { whitepaper } = await getWhitepaperBySlug(decodeURIComponent(resolvedParams.slug));

  if (!whitepaper) {
    notFound();
  }

  const canonicalSlug = whitepaper.slug || resolvedParams.slug;
  const canonicalPath = `/kennis/whitepapers/${canonicalSlug}`;
  const downloadUrl = toAbsoluteDownloadUrl(whitepaper.downloadLink);
  const publicationDate = toNlDate(
    whitepaper.publishedAt || whitepaper.updatedAt || whitepaper.createdAt
  );

  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
          { label: 'Whitepapers', href: '/kennis/whitepapers' },
          { label: whitepaper.title, href: canonicalPath },
        ]}
      />

      <section className="py-16 md:py-20">
        <div className="container-custom max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0057B8]">
            Whitepaper
          </p>
          <h1 className="mt-3 text-4xl font-bold text-[#091E42] md:text-5xl">
            {whitepaper.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#091E42]/80">
            {whitepaper.description || 'Diepgaand kennisdocument van MaasISO.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-[#091E42]/70">
            <span>Versie: {whitepaper.version || '1.0'}</span>
            {whitepaper.author && <span>Auteur: {whitepaper.author}</span>}
            {publicationDate && <span>Publicatiedatum: {publicationDate}</span>}
          </div>

          {downloadUrl ? (
            <div className="mt-10">
              <Link
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-[#FF8B00] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#FF9B20]"
              >
                Download PDF
              </Link>
            </div>
          ) : (
            <p className="mt-10 rounded-lg border border-dashed border-[#091E42]/20 bg-white p-4 text-[#091E42]/70">
              Downloadlink is momenteel nog niet beschikbaar.
            </p>
          )}
        </div>
      </section>

      <section className="pb-16 md:pb-20">
        <div className="container-custom max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#091E42]">Wat staat er in?</h2>
          <p className="mt-4 text-[#091E42]/80">
            Dit document geeft verdieping op het onderwerp, inclusief praktische context en
            toepasbare inzichten voor organisaties die hun ISO- en compliance-aanpak willen
            versterken.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/kennis/whitepapers"
              className="inline-flex items-center rounded-md border border-[#091E42]/20 px-4 py-2 font-medium text-[#091E42] hover:bg-[#091E42]/5"
            >
              Terug naar alle whitepapers
            </Link>
            <Link
              href="/kennis"
              className="inline-flex items-center rounded-md border border-[#091E42]/20 px-4 py-2 font-medium text-[#091E42] hover:bg-[#091E42]/5"
            >
              Naar kennishub
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
