import CategoryFilterWrapper from '../common/CategoryFilterWrapper';
import SearchFiltersWrapper from './SearchFiltersWrapper';
import { Category } from '@/lib/types';

interface TopSearchFiltersProps {
  selectedCategory?: string;
  categories: Category[];
  onHover?: (categorySlug: string) => void;
}

export function TopSearchFilters({
  categories,
  selectedCategory,
  onHover
}: TopSearchFiltersProps) {
  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <CategoryFilterWrapper
            categories={categories}
            selectedCategory={selectedCategory}
            onHover={onHover}
            defaultLabel="Alle categorieën"
          />
        </div>
        <div className="flex-1">
          <SearchFiltersWrapper
            categories={categories}
            onHover={onHover}
          />
        </div>
      </div>
    </div>
  );
}
