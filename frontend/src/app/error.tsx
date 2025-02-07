'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#091E42] mb-4">
          Er is iets misgegaan
        </h1>
        <p className="text-[#091E42]/70 mb-8 max-w-md mx-auto">
          Onze excuses voor het ongemak. Er is een onverwachte fout opgetreden. 
          U kunt proberen de pagina opnieuw te laden of terug te gaan naar de homepage.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-[#FF8B00] text-white rounded-md hover:bg-[#E67E00] transition-colors"
          >
            Opnieuw proberen
          </button>
          <Link
            href="/"
            className="px-6 py-2 border border-[#091E42]/20 rounded-md hover:bg-[#091E42]/5 transition-colors"
          >
            Naar homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
