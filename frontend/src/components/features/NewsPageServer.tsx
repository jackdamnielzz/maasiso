'use client';

import NewsCard from '@/components/features/NewsCard';
import CategoryFilterWrapper from '@/components/common/CategoryFilterWrapper';
import { NewsArticle, Category, Page } from '@/lib/types';

interface NewsPageContentProps {
  currentPage: number;
  selectedCategory?: string;
  page: Page;
  categories: Category[];
  articles: NewsArticle[];
}

export default function NewsPageContent({ 
  currentPage, 
  selectedCategory,
  page,
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
      {/* Hero Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {page?.layout?.[0]?.__component === 'page-blocks.hero' 
            ? page.layout[0].title 
            : 'Nieuws'}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {page?.layout?.[0]?.__component === 'page-blocks.hero' 
            ? page.layout[0].subtitle 
            : 'Blijf op de hoogte van onze laatste updates en ontwikkelingen'}
        </p>
      </header>

      {/* Description */}
      {page?.layout?.[1]?.__component === 'page-blocks.text-block' && (
        <div className="text-center mb-12">
          <p className="text-gray-600 max-w-3xl mx-auto">
            {page.layout[1].content}
          </p>
        </div>
      )}

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
