'use client';

import { BlogPost } from '@/lib/types';
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

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export default function BlogCard({ post, className }: BlogCardProps) {
  // Memoize image source calculation
  const imageSource = useMemo(() => {
    if (!post.featuredImage) return null;
    return getImageUrl(post.featuredImage, 'small');
  }, [post.featuredImage]);

  // Memoize excerpt - use summary if available, otherwise generate from content
  const excerpt = useMemo(() => post.summary || getExcerpt(post.content), [post.summary, post.content]);

  // Memoize validated slug
  const validatedSlug = useMemo(() => validateSlug(post.slug), [post.slug]);

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
          alt={post.featuredImage?.alternativeText || post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          quality={75}
          priority
        />
      </div>
    );
  }, [imageSource, post.featuredImage?.alternativeText, post.title]);

  return (
    <Card className={className} hover="default">
      {imageSection}
      
      <CardHeader>
        <CardDescription>
          {post.publishedAt && dateFormatter.format(new Date(post.publishedAt))}
        </CardDescription>
        <Link href={`/blog/${validatedSlug}`}>
          <CardTitle className="hover:text-[#FF8B00] transition-colors">
            {post.title}
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