import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComponentRegistry } from '../../src/components/features/ComponentRegistry';
import { getPage } from '../../src/lib/api';
import { Page as PageType } from '../../src/lib/types';

type PageParams = { slug: string };

type PageProps = {
  params: Promise<PageParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const page = await getPage(resolvedParams.slug);
    
    return {
      title: page.seoMetadata?.metaTitle || page.title,
      description: page.seoMetadata?.metaDescription,
      keywords: page.seoMetadata?.keywords,
      openGraph: page.seoMetadata?.ogImage ? {
        images: [{ url: page.seoMetadata.ogImage.url }],
      } : undefined,
    };
  } catch (error: unknown) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  try {
    const page = await getPage(resolvedParams.slug);
    return (
      <main className="min-h-screen">
        {page.layout?.length ? (
          page.layout.map((component) => (
            <ComponentRegistry
              key={component.id}
              component={component as any}
              className="mb-8 last:mb-0"
            />
          ))
        ) : (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-lg text-gray-600">This page has no content yet.</p>
          </div>
        )}
      </main>
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      console.log(`Page ${resolvedParams.slug} not found`);
      return (
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-lg text-gray-600">The page "{resolvedParams.slug}" could not be found.</p>
          </div>
        </main>
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to load page ${resolvedParams.slug}:`, errorMessage);
    throw error;
  }
}

export function generateStaticParams() {
  // This is a placeholder for future static page generation
  // We'll implement this when we have a way to get all page slugs
  return [];
}
