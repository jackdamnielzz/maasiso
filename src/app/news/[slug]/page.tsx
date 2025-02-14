import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsArticleContent from '@/components/features/NewsArticleContent';
import { getNewsArticleBySlug } from '@/lib/api';

interface NewsArticlePageProps {
  params: {
    slug: string;
  };
}

async function getNewsArticle(slug: string) {
  const { newsArticle } = await getNewsArticleBySlug(slug);
  return newsArticle;
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const article = await getNewsArticle(params.slug);

  if (!article) {
    return {
      title: 'News Article Not Found',
      description: 'The requested news article could not be found.'
    };
  }

  return {
    title: article.title,
    description: article.summary || article.content.slice(0, 155),
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary || article.content.slice(0, 155),
      type: 'article',
      ...(article.featuredImage && {
        images: [
          {
            url: article.featuredImage.url,
            width: article.featuredImage.width,
            height: article.featuredImage.height,
            alt: article.featuredImage.alternativeText || article.title
          }
        ]
      })
    }
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const article = await getNewsArticle(params.slug);

  if (!article) {
    notFound();
  }

  return <NewsArticleContent article={article} />;
}
