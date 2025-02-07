export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero section skeleton */}
      <div className="relative h-[400px] w-full bg-gray-200">
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 px-4">
          <div className="h-8 w-2/3 max-w-2xl rounded bg-gray-300" />
          <div className="h-4 w-1/2 max-w-xl rounded bg-gray-300" />
          <div className="mt-4 h-10 w-32 rounded bg-gray-300" />
        </div>
      </div>

      {/* Content section skeletons */}
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Text block skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
        </div>

        {/* Feature grid skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg bg-gray-100 p-6">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-200" />
              <div className="mb-2 h-6 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
