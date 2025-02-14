import React from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/lib/types';
import LazyImage from '../common/LazyImage';
import { clientEnv } from '@/lib/config/client-env';

const getCategoryColor = (categoryName: string): string => {
  const colors: { [key: string]: string } = {
    'ISO Normen': 'bg-blue-500',
    'Informatiebeveiliging': 'bg-green-500',
    'Privacy': 'bg-purple-500',
    'Certificering': 'bg-orange-500',
    'Compliance': 'bg-red-500',
    'Best Practices': 'bg-teal-500'
  };
  
  return colors[categoryName] || 'bg-gray-500'; // Default color if category not found
};

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const {
    title,
    articledescription,
    slug,
    featuredImage,
    author,
    publishedAt,
    categories
  } = article;

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-gray-200">
      <Link href={`/news/${slug}`} className="block flex-grow">
        <div className="relative h-56 w-full">
          {featuredImage ? (
            <LazyImage
              src={featuredImage.url.startsWith('http') ? featuredImage.url : `${clientEnv.apiUrl}${featuredImage.url}`}
              alt={featuredImage.alternativeText || title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={true}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Geen afbeelding beschikbaar</span>
            </div>
          )}
        </div>
        <div className="p-8 flex flex-col flex-grow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#091E42] mb-4 line-clamp-2 leading-tight">
              {title}
            </h2>
            {articledescription && (
              <p className="text-[#091E42]/70 text-lg leading-relaxed line-clamp-3">
                {articledescription}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center text-base text-[#091E42]/60 mt-auto space-x-6">
            {author && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                {author}
              </span>
            )}
            {formattedDate && (
              <span className="text-[#091E42]/60">
                {formattedDate}
              </span>
            )}
            {categories && categories.length > 0 && (
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getCategoryColor(categories[0].name)}`}>
                {categories[0].name}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default NewsCard;
