import { getPage } from '@/lib/api';
import { ComponentRegistry } from '@/components/features/ComponentRegistry';

export default async function TestPage() {
  try {
    // The slug should match exactly what's in the CMS
    const page = await getPage('test-page');
    console.log('[Debug] Attempting to fetch page with slug:', 'test-page');
    
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
          
          {page.layout?.length ? (
            <div className="space-y-8">
              {page.layout.map((component) => (
                <ComponentRegistry
                  key={component.id}
                  component={component}
                  className="mb-8 last:mb-0"
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="text-lg text-gray-600">This page has no content yet.</p>
            </div>
          )}

          {/* Debug section */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-16 p-4 bg-gray-100 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(page, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading test page:', error);
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Page</h1>
          <p className="text-lg text-gray-600">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      </main>
    );
  }
}
