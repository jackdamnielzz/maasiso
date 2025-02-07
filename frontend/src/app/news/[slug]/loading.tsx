export default function NewsArticleLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-28" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-24" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative h-[400px] w-full mb-8 bg-gray-200 rounded-lg" />

      {/* Content */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}
