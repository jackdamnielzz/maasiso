export default function NewsLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section Loading */}
      <header className="text-center mb-12 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
        <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto" />
      </header>

      {/* Description Loading */}
      <div className="text-center mb-12 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
      </div>

      {/* News Articles Grid Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200 w-full" />
            
            {/* Content placeholders */}
            <div className="p-6">
              {/* Title placeholder */}
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              
              {/* Summary placeholder */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
              
              {/* Metadata placeholders */}
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
