'use client';

import NewsCard from '@/components/features/NewsCard';
import CategoryFilterWrapper from '@/components/common/CategoryFilterWrapper';
import { NewsArticle, Category } from '@/lib/types';

interface NewsPageContentProps {
  selectedCategory?: string;
  categories: Category[];
  articles: NewsArticle[];
}

export default function NewsPageContent({
  selectedCategory,
  categories,
  articles
}: NewsPageContentProps) {
  // Filter articles by category if selected
  const filteredArticles = selectedCategory
    ? articles.filter(article => 
        article.categories?.some(cat => cat.slug === selectedCategory)
      )
    : articles;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* Category Filter */}
      <CategoryFilterWrapper 
        categories={categories} 
        selectedCategory={selectedCategory} 
      />

      {/* News Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article: NewsArticle) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            Er zijn momenteel geen nieuwsberichten beschikbaar.
          </p>
        </div>
      )}
    </main>
  );
}
