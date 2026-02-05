'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/lib/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
}

export default function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  console.log('CategoryFilter - categories:', categories);
  console.log('CategoryFilter - selectedCategory:', selectedCategory);

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset to first page on category change
    router.replace(`/blog?${params.toString()}`);
  };

  return (
    <div className="mb-8">
      <select
        className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={selectedCategory || ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">Alle categorieën</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
