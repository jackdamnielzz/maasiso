export default function BlogLoading() {
  return (
    <div className="bg-white py-24">
      <div className="container-custom">
        {/* Skeleton for title */}
        <div className="h-12 w-32 bg-[#091E42]/10 rounded-lg mb-8 animate-pulse" />
        
        {/* Skeleton for description */}
        <div className="h-6 w-2/3 max-w-2xl bg-[#091E42]/10 rounded mb-4 animate-pulse" />
        <div className="h-6 w-1/2 max-w-2xl bg-[#091E42]/10 rounded mb-12 animate-pulse" />
        
        {/* Skeleton grid for blog cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex flex-col">
              {/* Skeleton for image */}
              <div className="h-48 bg-[#091E42]/10 rounded-lg mb-4 animate-pulse" />
              
              {/* Skeleton for category */}
              <div className="h-5 w-24 bg-[#091E42]/10 rounded mb-2 animate-pulse" />
              
              {/* Skeleton for title */}
              <div className="h-6 w-full bg-[#091E42]/10 rounded mb-2 animate-pulse" />
              <div className="h-6 w-3/4 bg-[#091E42]/10 rounded mb-4 animate-pulse" />
              
              {/* Skeleton for excerpt */}
              <div className="h-4 w-full bg-[#091E42]/10 rounded mb-1 animate-pulse" />
              <div className="h-4 w-full bg-[#091E42]/10 rounded mb-1 animate-pulse" />
              <div className="h-4 w-2/3 bg-[#091E42]/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Skeleton for pagination */}
        <div className="flex justify-center items-center space-x-2 my-8">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-10 w-10 bg-[#091E42]/10 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
