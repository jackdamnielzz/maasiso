'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/components/providers/NavigationProvider';
import { getWhitepapers } from '@/lib/api';
import { Whitepaper } from '@/lib/types';
import WhitepaperCard from './WhitepaperCard';
import PrefetchingPagination from '@/components/common/PrefetchingPagination';

interface WhitepaperData {
  whitepapers: Whitepaper[];
  pagination: {
    page: number;
    pageCount: number;
  };
}

export default function WhitepaperClientWrapper() {
  const { searchParams } = useNavigation();
  const [data, setData] = useState<WhitepaperData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const pageParam = searchParams?.get('page');
        const currentPage = pageParam && !isNaN(parseInt(pageParam))
          ? parseInt(pageParam)
          : 1;

        const response = await getWhitepapers(currentPage, 6);

        if (!response) {
          throw new Error('Geen data ontvangen van de server.');
        }

        setData({
          whitepapers: response.whitepapers.data.map(item => ({
            ...item.attributes,
            id: String(item.id)
          })),
          pagination: {
            page: response.whitepapers.meta.pagination?.page ?? 1,
            pageCount: response.whitepapers.meta.pagination?.pageCount ?? 1
          }
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching whitepapers');
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <main className="flex-1">
        <section className="hero-section">
          <div className="container-custom">
            <div className="text-center animate-pulse">
              <div className="h-12 bg-gray-700 rounded w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </section>
        <section className="bg-gray-50 py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
      <main className="flex-1">
      <section className="hero-section">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
              Kennis & leadgeneratie
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Whitepapers van <span className="text-[#FF8B00]">MaasISO</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Download praktische whitepapers met directe toepasbare inzichten voor ISO-certificering,
              informatiebeveiliging en compliance in de MKB-wereld.
            </p>
            <p className="text-sm uppercase tracking-wide text-white/80">
              Binnenkort komen er meer actuele whitepapers online
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <article className="mb-10 rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-[#091E42]">Waarom deze whitepapers?</h2>
            <p className="mt-3 text-[#243f66]">
              Onze whitepapers staan op dezelfde lijn als onze kernarchitectuur: duidelijke, praktische
              uitwerking zonder wollige theorie. U krijgt direct bruikbare handvatten voor interne audits,
              beheer, risico's en voorbereiding op compliance.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#091E42]">Direct bruikbaar</p>
                <p className="mt-2 text-sm text-[#3e5374]">
                  Praktische stappen, checklists en voorbeelden voor het werkveld.
                </p>
              </div>
              <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#091E42]">Naar behoefte</p>
                <p className="mt-2 text-sm text-[#3e5374]">
                  Voor ISO 9001, ISO 27001, BIO en AVG-opstellingen.
                </p>
              </div>
              <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#091E42]">Download klaar</p>
                <p className="mt-2 text-sm text-[#3e5374]">
                  Klaar om direct met uw team te bespreken in intake of projectkickoff.
                </p>
              </div>
            </div>
          </article>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <p className="text-lg">{error}</p>
            </div>
          ) : !data || !data.whitepapers.length ? (
            <div className="rounded-2xl border border-[#dce5f1] bg-white p-8 text-center shadow-sm">
              <p className="text-[#091E42]/80 text-lg">
                Er zijn momenteel nog geen whitepapers gepubliceerd.
              </p>
              <p className="mt-2 text-[#2f4b75]">
                Binnenkort voegen we nieuwe whitepapers toe over praktische onderwerpen zoals ISO 27001,
                BIO, AVG en implementatie in de MKB.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.whitepapers.map((whitepaper) => (
                  <div key={whitepaper.id}>
                    <WhitepaperCard whitepaper={whitepaper} />
                  </div>
                ))}
              </div>

              {data.pagination.pageCount > 1 && (
                <PrefetchingPagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.pageCount}
                />
              )}
            </>
          )}

          <article className="mt-10 rounded-2xl border border-[#dce5f1] bg-[#091E42] p-6 text-white md:p-8">
            <h2 className="text-2xl font-bold">Binnenkort meer whitepapers</h2>
            <p className="mt-3 max-w-2xl text-white/85">
              We werken nu aan extra publicaties met concrete cases en implementatie-kaders. Houd deze pagina
              in de gaten — hier verschijnen binnenkort aanvullende whitepapers per sector en compliance-risico.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
                ISO 27001 voor MKB met beperkte middelen
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
                AVG-proof datalekbeleid in 5 stappen
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
                BIO voor publieke ketenpartners
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
                Voorbereiden op NIS2 in praktijk
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
