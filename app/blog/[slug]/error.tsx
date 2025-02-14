'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error in BlogPostPage:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#091E42] mb-4">
          Er is iets misgegaan bij het laden van het blog artikel.
        </h2>
        <p className="text-[#091E42]/70 mb-6">
          Probeer het later opnieuw of neem contact met ons op als het probleem aanhoudt.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#FF8B00] text-white px-6 py-2 rounded hover:bg-[#E67E00] transition-colors"
        >
          Probeer opnieuw
        </button>
      </div>
    </div>
  );
}
