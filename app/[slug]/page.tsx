import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComponentRegistry } from '../../src/components/features/ComponentRegistry';
import { getPage } from '../../src/lib/api';
import { Page as PageType } from '../../src/lib/types';

type PageParams = { slug: string };

type PageProps = {
  params: Promise<PageParams>;
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    console.log(`[Metadata] Fetching page data for slug: ${resolvedParams.slug}`);
    const page = await getPage(resolvedParams.slug);
    
    if (!page) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.',
      };
    }

    return {
      title: page.seoMetadata?.metaTitle || page.title || 'Untitled Page',
      description: page.seoMetadata?.metaDescription || undefined,
      keywords: page.seoMetadata?.keywords || undefined,
      openGraph: page.seoMetadata?.ogImage?.url ? {
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
    console.log(`[DynamicPage] Fetching page data for slug: ${resolvedParams.slug} directly from Strapi`);
    const page = await getPage(resolvedParams.slug);
    
    if (!page) {
      return notFound();
    }

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
      console.log(`[DynamicPage] Page ${resolvedParams.slug} not found`);
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
    console.error(`[DynamicPage] Failed to load page ${resolvedParams.slug}:`, errorMessage);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error(`[DynamicPage] Error details: ${error.message}`);
      if ('status' in error) {
        const status = (error as any).status;
        console.error(`[DynamicPage] Error status: ${status}`);
      }
    }
    
    throw error;
  }
}

export function generateStaticParams() {
  // This is a placeholder for future static page generation
  // We'll implement this when we have a way to get all page slugs
  return [];
}
