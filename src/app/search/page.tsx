import { Metadata } from "next";
import { search, getCategories } from "@/lib/api";
import { SearchResults } from "@/components/features/SearchResults";
import SearchAnalytics from "@/components/features/SearchAnalytics";
import { SearchParams } from "@/lib/types";
import { validateSearchQuery, validateUrlParam } from "@/lib/validation";

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: string;
  };
}

export const metadata: Metadata = {
  title: "Zoekresultaten | MaasISO",
  description: "Doorzoek alle content van MaasISO",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  try {
    // Validate search query
    const queryValidation = validateSearchQuery(searchParams.q || '');
    if (!queryValidation.isValid) {
      throw new Error(queryValidation.error || 'Invalid search query');
    }
    const query = queryValidation.sanitized;

    // Validate category
    if (searchParams.category) {
      const categoryValidation = validateUrlParam(searchParams.category);
      if (!categoryValidation.isValid) {
        throw new Error('Invalid category parameter');
      }
      searchParams.category = categoryValidation.sanitized;
    }

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

    // Fetch categories for filters
    const categories = await getCategories();

    // Convert validated search params to API params with proper type checking
    const contentType = searchParams.type as 'blog' | 'news' | undefined;
    const sortField = searchParams.sort as 'date' | 'relevance' | 'title' | undefined;

    const apiParams: SearchParams = {
      query,
      filters: {
        categories: searchParams.category ? [searchParams.category] : undefined,
        contentType: contentType ? [contentType] : undefined,
        dateFrom: searchParams.dateFrom,
        dateTo: searchParams.dateTo,
      },
      sort: sortField ? {
        field: sortField,
        direction: 'desc'
      } : undefined,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      pageSize: 10
    };

    // Validate the structure of the API params
    const { filters, sort, page, pageSize } = apiParams;
    if (
      (filters?.contentType && !filters.contentType.every(type => type === 'blog' || type === 'news')) ||
      (sort?.field && !['date', 'relevance', 'title'].includes(sort.field)) ||
      (page && (isNaN(page) || page < 1)) ||
      (pageSize && (isNaN(pageSize) || pageSize < 1))
    ) {
      throw new Error('Invalid API parameters structure');
    }

    const results = await search(apiParams);
    const hasBlogResults = results.blogPosts.data.length > 0;
    const hasNewsResults = results.newsArticles.data.length > 0;
    const hasResults = hasBlogResults || hasNewsResults;
    const totalResults = results.blogPosts.meta.pagination.total + results.newsArticles.meta.pagination.total;

    return (
      <main className="container mx-auto px-4 py-8 mt-[72px]">
        <SearchAnalytics 
          query={query}
          totalResults={totalResults}
          filters={{
            category: searchParams.category,
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
            categories={categories}
            blogPosts={results.blogPosts.data}
            newsArticles={results.newsArticles.data}
            blogTotal={results.blogPosts.meta.pagination.total}
            newsTotal={results.newsArticles.meta.pagination.total}
            selectedCategory={searchParams.category}
            onCategoryHover={(categorySlug) => {
              // Prefetch results for this category
              const prefetchParams: SearchParams = {
                ...apiParams,
                filters: {
                  ...apiParams.filters,
                  categories: [categorySlug],
                },
              };
              search(prefetchParams);
            }}
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
