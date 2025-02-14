import type { Metadata } from 'next';
import { getNewsArticleBySlug, getNewsArticles } from '@/lib/api';
import NewsArticleContent from '@/components/features/NewsArticleContent';
import ContentAnalytics from '@/components/features/ContentAnalytics';
import { notFound } from 'next/navigation';
import { NewsArticle } from '@/lib/types';
import { isPromise } from '@/lib/utils';
import { getExcerpt } from '@/lib/utils';

type PageParams = {
  slug: string;
};

type Props = {
  params: Promise<PageParams>;
};

export async function generateStaticParams() {
  try {
    const response = await getNewsArticles();
    return response.newsArticles.data.map((article: NewsArticle) => ({
      slug: article.slug,
    }));
  } catch (error) {
    // If we can't get the articles, return an empty array
    // This prevents build failure but logs the error
    if (error instanceof Error) {
      console.error('Error generating static params:', error.message);
    }
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    
    if (!resolvedParams.slug) {
      return {
        title: 'News Article Not Found',
        description: 'The requested news article could not be found.'
      };
    }

    const { newsArticle } = await getNewsArticleBySlug(resolvedParams.slug);
    if (!newsArticle) {
      return {
        title: 'News Article Not Found',
        description: 'The requested news article could not be found.'
      };
    }

    const description = newsArticle.summary || getExcerpt(newsArticle.content || '', 155);
    const mainCategory = newsArticle.categories?.[0]?.name;
    const imageUrl = newsArticle.featuredImage?.url;

    return {
      title: `${newsArticle.seoTitle || newsArticle.title} | MaasISO`,
      description: newsArticle.seoDescription || description,
      openGraph: {
        title: newsArticle.seoTitle || newsArticle.title,
        description: newsArticle.seoDescription || description,
        type: 'article',
        publishedTime: newsArticle.publishedAt,
        modifiedTime: newsArticle.updatedAt,
        authors: newsArticle.author ? [newsArticle.author] : undefined,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
        ...(mainCategory && { tags: [mainCategory] })
      }
    } as Metadata;
  } catch (error) {
    // On error, return default metadata
    if (error instanceof Error) {
      console.error('Error generating metadata:', error.message);
    }
    return {
      title: 'Error Loading News Article',
      description: 'There was an error loading the news article.'
    };
  }
}

export default async function NewsArticlePage({ params }: Props) {
  try {
    const resolvedParams = await params;

    if (!resolvedParams.slug) {
      notFound();
    }

    const { newsArticle } = await getNewsArticleBySlug(resolvedParams.slug);
    
    if (!newsArticle || !newsArticle.content) {
      notFound();
    }

    const readingTime = Math.ceil((newsArticle.content || '').split(/\s+/).length / 200);

    return (
      <div className="bg-white py-24">
        <div className="container-custom">
          <ContentAnalytics
            contentType="news"
            contentId={newsArticle.id}
            title={newsArticle.title}
            metadata={{
              categories: newsArticle.categories?.map(cat => cat.name),
              author: newsArticle.author,
              publishedAt: newsArticle.publishedAt,
              readingTime
            }}
          />
          <NewsArticleContent article={newsArticle} />
        </div>
      </div>
    );
  } catch (error) {
    // Let the error boundary handle the error display
    if (error instanceof Error) {
      throw new Error(`Er is een fout opgetreden bij het laden van het nieuwsartikel: ${error.message}`);
    }
    throw new Error('Er is een onverwachte fout opgetreden bij het laden van het nieuwsartikel.');
  }
}
