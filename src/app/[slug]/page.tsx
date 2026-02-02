import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComponentRegistry } from '@/components/features/ComponentRegistry';
import { getPage } from '@/lib/api';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;
  
  try {
    const page = await getPage(slug);
    
    if (!page) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.',
      };
    }

    const metadata: Metadata = {
      title: page.seoMetadata?.metaTitle || page.title,
      description: page.seoMetadata?.metaDescription,
      keywords: page.seoMetadata?.keywords,
    };

    // Only add OpenGraph image if it exists
    if (page.seoMetadata?.ogImage?.url) {
      metadata.openGraph = {
        images: [{ url: page.seoMetadata.ogImage.url }],
      };
    }

    return metadata;
  } catch (error: unknown) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }
}

export default async function DynamicPage(
  { params }: PageProps
) {
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;
  
  try {
    const page = await getPage(slug);

    if (!page) {
      notFound();
    }

    return (
      <main className="min-h-screen">
        {page.layout?.length ? (
          page.layout.map((component, index) => (
            <ComponentRegistry
              key={`${component.__component ?? 'component'}-${component.id ?? 'x'}-${index}`}
              component={component}
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
      console.log(`Page ${slug} not found`);
      return (
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-lg text-gray-600">The page "{slug}" could not be found.</p>
          </div>
        </main>
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to load page ${slug}:`, errorMessage);
    throw error;
  }
}

export function generateStaticParams() {
  // This is a placeholder for future static page generation
  // We'll implement this when we have a way to get all page slugs
  return [];
}
