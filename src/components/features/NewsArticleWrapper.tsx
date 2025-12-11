"use client";

import React from 'react';
import { NewsArticle } from '@/lib/types';
import NewsArticleContent from './NewsArticleContent';
import ContentAnalytics from '@/components/features/ContentAnalytics';

interface NewsArticleWrapperProps {
  article: NewsArticle;
}

const NewsArticleWrapper: React.FC<NewsArticleWrapperProps> = ({ article }) => {
  const readingTime = Math.ceil((article.content || '').split(/\s+/).length / 200);

  return (
    <div className="bg-white pb-16 relative z-0">
      <div className="container-custom">
        <ContentAnalytics
          contentType="news"
          contentId={article.id}
          title={article.title}
          metadata={{
            categories: article.categories?.map((cat: { name: string }) => cat.name) || [],
            author: article.author,
            publishedAt: article.publishedAt,
            readingTime
          }}
        />
        <NewsArticleContent article={article} />
      </div>
    </div>
  );
};

export default NewsArticleWrapper;