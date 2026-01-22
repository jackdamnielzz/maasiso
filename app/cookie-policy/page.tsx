import { Suspense } from 'react';
import CookiePolicyContent from '@/components/cookies/CookiePolicyContent';
import { metadata } from './metadata';

export { metadata };

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Suspense fallback={
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        }>
          <CookiePolicyContent />
        </Suspense>
      </div>
    </div>
  );
}