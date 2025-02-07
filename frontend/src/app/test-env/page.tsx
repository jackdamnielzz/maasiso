import { env } from '@/lib/env';

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Configuration Test</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(
          {
            apiUrl: env.apiUrl,
            siteUrl: env.siteUrl,
            graphqlUrl: env.graphqlUrl,
            // Exclude sensitive values
            hasAuthSecret: !!env.authSecret,
            hasStrapiToken: !!env.strapiToken,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}

// Mark as a static page that doesn't use dynamic data
export const dynamic = 'force-static';
