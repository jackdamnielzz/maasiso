'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorContentProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorContent({ error, reset }: ErrorContentProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#091E42] mb-4">
          Er is iets misgegaan
        </h1>
        <p className="text-[#091E42]/70 mb-8 max-w-md mx-auto">
          {error.message || 'Er is een onverwachte fout opgetreden.'}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2 bg-[#FF8B00] text-white rounded-md hover:bg-[#E67E00] transition-colors"
          >
            Probeer opnieuw
          </button>
          <Link
            href="/"
            className="px-6 py-2 border border-[#FF8B00] text-[#FF8B00] rounded-md hover:bg-[#FF8B00] hover:text-white transition-colors"
          >
            Naar homepage
          </Link>
        </div>
      </div>
    </div>
  );
}