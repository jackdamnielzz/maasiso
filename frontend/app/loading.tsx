export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF8B00] border-r-transparent mb-4" />
        <p className="text-[#091E42]/70">
          Laden...
        </p>
      </div>
    </div>
  );
}
