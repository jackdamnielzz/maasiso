'use client';

import NewsCard from '@/components/features/NewsCard';
import { NewsArticle, Page } from '@/lib/types';

interface NewsPageContentProps {
  page: Page;
  articles: NewsArticle[];
}

export default function NewsPageContent({
  page,
  articles,
}: NewsPageContentProps) {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* News Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {articles.map((article: NewsArticle) => (
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
    </div>
  );
}
