'use client';

import { Suspense } from 'react';
import HomeContent from './HomeContent';

export default function HomeContentWrapper() {
  return (
    <Suspense fallback={
      <div className="flex-1 animate-pulse">
        <section className="hero-section">
          <div className="container-custom">
            <div className="text-center">
              <div className="h-12 bg-gray-700 rounded w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
              <div className="h-12 bg-gray-700 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container-custom">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-16"></div>
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="service-card">
                  <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}