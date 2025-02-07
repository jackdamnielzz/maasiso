import { Suspense } from 'react';
import CookiePolicyContent from '@/components/cookies/CookiePolicyContent';

export default function CookiePolicyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="bg-[#0B1C35] text-white">
          <div className="max-w-7xl mx-auto px-4 py-24">
            <div className="h-12 bg-gray-700 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-12">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CookiePolicyContent />
    </Suspense>
  );
}