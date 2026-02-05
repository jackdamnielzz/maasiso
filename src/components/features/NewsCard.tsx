import React from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/lib/types';
import LazyImage from '../common/LazyImage';
import { clientEnv } from '@/lib/config/client-env';
import { validateSlug } from '@/lib/utils/slugUtils';

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const {
    title,
    summary,
    slug,
    featuredImage,
    author,
    publishedAt,
  } = article;

  // Validate the slug
  const validatedSlug = validateSlug(slug);

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-gray-200">
      <Link href={`/blog/${validatedSlug}`} className="block flex-grow">
        <div className="relative h-56 w-full">
          {featuredImage ? (
            <LazyImage
              src={`/api/proxy/assets/uploads/${featuredImage.url.split('/uploads/').pop()}`}
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
            {summary && (
              <p className="text-[#091E42]/70 text-lg leading-relaxed line-clamp-3">
                {summary}
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
          </div>
        </div>
      </Link>
    </article>
  );
};

export default NewsCard;
