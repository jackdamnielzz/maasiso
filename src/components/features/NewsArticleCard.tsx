import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/types';

interface NewsArticleCardProps {
  article: NewsArticle;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const ReadingTimeIndicator: React.FC<{ minutes: number }> = ({ minutes }) => (
  <span className="flex items-center text-gray-500 text-sm">
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {minutes} minuten leestijd
  </span>
);

const getImageUrl = (url: string) => {
  console.debug('[NewsArticleCard] Constructing image URL:', {
    originalUrl: url,
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
  });

  if (!url) {
    console.warn('[NewsArticleCard] Empty URL provided');
    return '';
  }
  
  if (url.startsWith('http')) {
    console.debug('[NewsArticleCard] Using absolute URL:', url);
    return url;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://peaceful-insight-production.up.railway.app';
  const fullUrl = `${baseUrl}${url}`;
  console.debug('[NewsArticleCard] Constructed URL:', {
    baseUrl,
    relativePath: url,
    fullUrl
  });
  
  return fullUrl;
};

export const NewsArticleCard: React.FC<NewsArticleCardProps> = ({ article }) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const handleImageLoad = () => {
    console.log('[NewsArticleCard] Image loaded successfully:', {
      articleId: article.id,
      imageUrl: article.featuredImage?.url
    });
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.error('[NewsArticleCard] Image load error:', {
      articleId: article.id,
      title: article.title,
      originalImageUrl: article.featuredImage?.url,
      constructedUrl: target.src,
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      currentSrc: target.currentSrc,
      errorEvent: e,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      nextConfig: {
        domains: process.env.NEXT_PUBLIC_IMAGE_DOMAINS,
        remotePatterns: process.env.NEXT_PUBLIC_IMAGE_REMOTE_PATTERNS
      }
    });
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <Link href={`/news/${article.slug}`}>
      <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div className="h-56 w-full bg-gray-100 overflow-hidden">
          {article.featuredImage && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="w-full h-full">
                <Image
                  src={getImageUrl(article.featuredImage.url)}
                  width={800}
                  height={450}
                  alt={article.featuredImage.alternativeText || article.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  priority={true}
                  quality={85}
                  loading="eager"
                />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">Afbeelding niet beschikbaar</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <time className="text-gray-500" dateTime={article.publishedAt}>
              {article.publishedAt ? formatDate(article.publishedAt) : 'No date'}
            </time>
            <ReadingTimeIndicator
              minutes={Math.ceil((article.content?.split(/\s+/).length || 0) / 200)}
            />
          </div>
        </div>
      </article>
    </Link>
  );
};