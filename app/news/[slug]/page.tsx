import type { Metadata } from 'next';
import { getNewsArticleBySlug } from '@/lib/api';
import NewsArticleWrapper from '@/components/features/NewsArticleWrapper';
import { notFound } from 'next/navigation';
import { NewsArticle } from '@/lib/types';
import { getExcerpt } from '@/lib/utils';

// Force dynamic rendering and disable caching for news articles
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type NewsArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchArticle(slug: string): Promise<NewsArticle> {
  try {
    console.log(`[NewsArticlePage] Fetching article: ${slug}`);
    const article = await getNewsArticleBySlug(slug);
    
    if (!article) {
      console.error(`[NewsArticlePage] Article not found: ${slug}`);
      throw new Error('Article not found');
    }

    if (!article.content) {
      console.error(`[NewsArticlePage] Article content missing: ${slug}`);
      throw new Error('Article content is missing');
    }

    return article;
  } catch (error) {
    console.error('[NewsArticlePage] Error fetching article:', {
      slug,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    if (!slug) {
      console.warn('[NewsArticlePage] No slug provided for metadata generation');
      return {
        title: 'News Article Not Found',
        description: 'The requested news article could not be found.'
      };
    }

    const article = await fetchArticle(slug);
    const description = article.summary || getExcerpt(article.content || '', 155);
    const mainCategory = article.categories?.[0]?.name;
    const imageUrl = article.featuredImage?.url;

    const metadata: Metadata = {
      title: `${article.seoTitle || article.title} | MaasISO`,
      description: article.seoDescription || description,
      openGraph: {
        title: article.seoTitle || article.title,
        description: article.seoDescription || description,
        type: 'article',
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt,
        authors: article.author ? [article.author] : undefined,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
        ...(mainCategory && { tags: [mainCategory] })
      }
    };

    console.log('[NewsArticlePage] Generated metadata:', {
      title: metadata.title,
      description: metadata.description
    });

    return metadata;
  } catch (error) {
    console.error('[NewsArticlePage] Error generating metadata:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      title: 'News Article Not Found',
      description: 'The requested news article could not be found.'
    };
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    if (!slug) {
      console.error('[NewsArticlePage] No slug provided');
      notFound();
    }

    console.log(`[NewsArticlePage] Rendering article: ${slug}`);
    const article = await fetchArticle(slug);

    return (
      <div className="min-h-screen bg-white">
        <NewsArticleWrapper article={article} />
      </div>
    );
  } catch (error) {
    console.error('[NewsArticlePage] Error rendering article:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Error && error.message === 'Article not found') {
      notFound();
    }

    throw error; // Let the error boundary handle other errors
  }
}
