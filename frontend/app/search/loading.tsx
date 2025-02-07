export default function SearchLoading() {
  return (
    <main className="container mx-auto px-4 py-8 mt-[72px]">
      {/* Title skeleton */}
      <div className="h-8 w-96 bg-gray-200 rounded animate-pulse mb-8" />

      <div className="space-y-8">
        {/* Blog section skeleton */}
        <section>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={`blog-${i}`} className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* News section skeleton */}
        <section>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={`news-${i}`} className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Events section skeleton */}
        <section>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={`event-${i}`} className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
