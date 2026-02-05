'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function NewsArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('News article error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Unable to Load News Article
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        We encountered an error while trying to load this news article. Please try again later.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/blog"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Back to Blog
        </Link>
      </div>
    </div>
  );
}
