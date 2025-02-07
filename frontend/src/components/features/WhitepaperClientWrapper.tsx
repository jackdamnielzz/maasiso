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
          whitepapers: response.whitepapers.data,
          pagination: {
            page: response.whitepapers.meta.pagination.page,
            pageCount: response.whitepapers.meta.pagination.pageCount
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
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Whitepapers van <span className="text-[#FF8B00]">MaasISO</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Download onze whitepapers voor diepgaande kennis over ISO-certificering,
              informatiebeveiliging en compliance.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : !data || !data.whitepapers.length ? (
            <div className="text-center py-12">
              <p className="text-[#091E42]/70 text-lg">
                Er zijn momenteel geen whitepapers beschikbaar.
              </p>
              <p className="text-[#091E42]/70 mt-2">
                Kom binnenkort terug voor nieuwe whitepapers over ISO-certificering en informatiebeveiliging.
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
        </div>
      </section>
    </main>
  );
}