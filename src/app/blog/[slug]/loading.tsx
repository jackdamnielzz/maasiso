'use client';

export default function BlogPostLoading() {
  return (
    <div className="bg-white py-24" data-testid="blog-post-loading">
      <div className="container-custom">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Featured Image Skeleton */}
        <div className="relative w-full h-[400px] mb-8 bg-gray-200 rounded-lg animate-pulse" />

        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-4/5 bg-gray-200 rounded" />
        </div>

        {/* Related Posts Skeleton */}
        <div className="mt-16">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
