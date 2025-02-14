import SearchResultItem, { SearchResultItemProps } from './SearchResultItem';

type SearchResultWithId = SearchResultItemProps;

interface SearchResultsGridProps {
  results: SearchResultWithId[];
}

export function SearchResultsGrid({ results }: SearchResultsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result) => (
        <div key={result.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <SearchResultItem {...result} />
        </div>
      ))}
    </div>
  );
}
