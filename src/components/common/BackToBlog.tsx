'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BackToBlog() {
  const router = useRouter();

  const navigateToBlog = () => {
    router.push('/kennis/blog');
  };

  return (
        <button
          onClick={navigateToBlog}
          className="fixed bottom-12 right-28 bg-[#0052CC] text-white p-4 rounded-full shadow-lg hover:bg-[#0065FF] transition-all duration-200 z-40 hover:scale-110"
          aria-label="Terug naar blog"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
  );
}
