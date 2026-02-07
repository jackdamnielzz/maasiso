import { Metadata } from "next";
import { searchV2 } from "@/lib/api";
import { SearchResults } from "@/components/features/SearchResults";
import SearchAnalytics from "@/components/features/SearchAnalytics";
import type { SearchParamsV2, SearchScope } from "@/lib/types";
import { validateSearchQuery, validateUrlParam } from "@/lib/validation";

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    scope?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: string;
  };
}

export const metadata: Metadata = {
  title: "Zoekresultaten | MaasISO",
  description: "Doorzoek alle content van MaasISO",
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  try {
    // Validate search query
    const queryValidation = validateSearchQuery(searchParams.q || '');
    if (!queryValidation.isValid) {
      throw new Error(queryValidation.error || 'Invalid search query');
    }
    const query = queryValidation.sanitized;

    // Validate content type
    if (searchParams.type) {
      const typeValidation = validateUrlParam(searchParams.type);
      if (!typeValidation.isValid || !['blog', 'news'].includes(typeValidation.sanitized)) {
        throw new Error('Invalid content type parameter');
      }
      searchParams.type = typeValidation.sanitized as 'blog' | 'news';
    }

    // Validate dates
    if (searchParams.dateFrom) {
      const dateValidation = validateUrlParam(searchParams.dateFrom);
      if (!dateValidation.isValid || isNaN(Date.parse(dateValidation.sanitized))) {
        throw new Error('Invalid dateFrom parameter');
      }
      searchParams.dateFrom = dateValidation.sanitized;
    }

    if (searchParams.dateTo) {
      const dateValidation = validateUrlParam(searchParams.dateTo);
      if (!dateValidation.isValid || isNaN(Date.parse(dateValidation.sanitized))) {
        throw new Error('Invalid dateTo parameter');
      }
      searchParams.dateTo = dateValidation.sanitized;
    }

    // Validate sort parameter
    if (searchParams.sort) {
      const sortValidation = validateUrlParam(searchParams.sort);
      if (!sortValidation.isValid || !['date', 'relevance', 'title'].includes(sortValidation.sanitized)) {
        throw new Error('Invalid sort parameter');
      }
      searchParams.sort = sortValidation.sanitized as 'date' | 'relevance' | 'title';
    }

    // Validate page number
    if (searchParams.page) {
      const pageValidation = validateUrlParam(searchParams.page);
      if (!pageValidation.isValid || isNaN(parseInt(pageValidation.sanitized))) {
        throw new Error('Invalid page parameter');
      }
      const pageNumber = parseInt(pageValidation.sanitized);
      if (pageNumber < 1) {
        throw new Error('Page number must be greater than 0');
      }
      searchParams.page = pageValidation.sanitized;
    }

    const scope = searchParams.scope as SearchScope | null;
    const validScope: SearchScope = ['all', 'title', 'title-summary', 'content'].includes(scope || '')
      ? (scope as SearchScope)
      : 'all';

    // Convert validated search params to API params with proper type checking
    const contentType = searchParams.type as 'blog' | 'news' | undefined;
    const sortField = searchParams.sort as 'date' | 'relevance' | 'title' | undefined;

    const apiParams: SearchParamsV2 = {
      query,
      scope: validScope,
      contentType: contentType || 'all',
      dateFrom: searchParams.dateFrom,
      dateTo: searchParams.dateTo,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      sort: sortField ? {
        field: sortField,
        direction: 'desc'
      } : undefined,
      pageSize: 10
    };

    const results = await searchV2(apiParams);
    const hasBlogResults = results.blog.length > 0;
    const hasNewsResults = results.news.length > 0;
    const hasResults = hasBlogResults || hasNewsResults;
    const totalResults = results.meta.totalResults;

    return (
      <main className="container mx-auto px-4 py-8 mt-[72px]">
        <SearchAnalytics
          query={query}
          totalResults={totalResults}
          filters={{
            contentType: searchParams.type as 'blog' | 'news' | undefined,
            dateFrom: searchParams.dateFrom,
            dateTo: searchParams.dateTo,
            sort: searchParams.sort as 'date' | 'relevance' | 'title' | undefined
          }}
        />
        <h1 className="text-3xl font-bold text-[#091E42] mb-4">
          Zoekresultaten voor &quot;{query}&quot;
        </h1>

        {/* No Results Message */}
        {!hasResults && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-[#091E42]/70">
              Geen resultaten gevonden voor &quot;{query}&quot;. Probeer andere zoektermen of controleer de spelling.
            </p>
          </div>
        )}

        {hasResults && (
          <SearchResults
            query={query}
            blog={results.blog}
            news={results.news}
          />
        )}
      </main>
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Er is een fout opgetreden bij het zoeken: ${error.message}`);
    }
    throw new Error('Er is een onverwachte fout opgetreden bij het zoeken.');
  }
}
