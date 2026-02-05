'use client';

import { NewsArticle } from '@/lib/types';
import Link from 'next/link';
import { validateSlug } from '@/lib/utils/slugUtils';
import { getImageUrl } from '@/lib/utils/imageUtils';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/core/Card';
import { OptimizedImage } from '@/components/core/OptimizedImage';
import { Typography } from '@/components/core/Typography';

// Memoize date formatter instance
const dateFormatter = new Intl.DateTimeFormat('nl-NL', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Move excerpt function outside component to prevent recreation
function getExcerpt(content: string): string {
  try {
    // Remove Markdown syntax and get first non-empty paragraph
    return content
      .replace(/[#*`]/g, '') // Remove Markdown syntax
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)[0] || '';
  } catch (error) {
    console.error('Error generating excerpt:', error);
    return '';
  }
}

interface NewsCardProps {
  article: NewsArticle;
  className?: string;
}

export default function NewsCard({ article, className }: NewsCardProps) {
  // Memoize image source calculation
  const imageSource = useMemo(() => {
    if (!article.featuredImage) return null;
    return getImageUrl(article.featuredImage, 'small');
  }, [article.featuredImage]);

  // Memoize excerpt - use summary if available, otherwise generate from content
  const excerpt = useMemo(() => article.summary || getExcerpt(article.content), [article.summary, article.content]);

  // Memoize validated slug
  const validatedSlug = useMemo(() => validateSlug(article.slug), [article.slug]);

  // Memoize image section
  const imageSection = useMemo(() => {
    if (!imageSource) {
      return (
        <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-gray-500">
          <Typography variant="muted">Geen afbeelding beschikbaar</Typography>
        </div>
      );
    }

    return (
      <div className="relative h-48 w-full">
        <OptimizedImage
          src={imageSource}
          alt={article.featuredImage?.alternativeText || article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          quality={75}
          priority
        />
      </div>
    );
  }, [imageSource, article.featuredImage?.alternativeText, article.title]);

  return (
    <Card className={className} hover="default">
      {imageSection}
      
      <CardHeader>
        <CardDescription>
          {article.publishedAt && dateFormatter.format(new Date(article.publishedAt))}
        </CardDescription>
        <Link href={`/blog/${validatedSlug}`}>
          <CardTitle className="hover:text-[#FF8B00] transition-colors">
            {article.title}
          </CardTitle>
        </Link>
      </CardHeader>
      
      <CardContent>
        <Typography
          variant="muted"
          className="line-clamp-3 whitespace-pre-wrap"
        >
          {excerpt}
        </Typography>
      </CardContent>
      
      <CardFooter>
        <Link 
          href={`/blog/${validatedSlug}`}
          className="text-[#FF8B00] hover:text-[#E67E00] font-medium transition-colors"
        >
          Lees meer
        </Link>
      </CardFooter>
    </Card>
  );
}
