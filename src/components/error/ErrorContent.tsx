'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorContentProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorContent({ error, reset }: ErrorContentProps) {
  useEffect(() => {
    // Log detailed error information
    console.error('[ErrorContent] Detailed error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      cause: error.cause
    });
  }, [error]);

  // Extract error details
  const errorMessage = error.message || 'Er is een onverwachte fout opgetreden.';
  const isServerError = errorMessage.includes('Server Components render');
  const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                        errorMessage.toLowerCase().includes('fetch');

  // Determine user-friendly message
  let userMessage = 'Er is een onverwachte fout opgetreden.';
  let actionMessage = 'Probeer de pagina opnieuw te laden of ga terug naar de homepage.';

  if (isServerError) {
    userMessage = 'Er is een fout opgetreden bij het laden van de pagina.';
    actionMessage = 'Probeer het over enkele minuten opnieuw.';
  } else if (isNetworkError) {
    userMessage = 'Er kon geen verbinding worden gemaakt met de server.';
    actionMessage = 'Controleer uw internetverbinding en probeer het opnieuw.';
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#091E42] mb-4">
          {userMessage}
        </h1>
        <p className="text-[#091E42]/70 mb-4 max-w-md mx-auto">
          {actionMessage}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-left text-sm bg-gray-100 p-4 rounded-lg mb-8 overflow-auto max-h-48">
            <code className="text-red-600">
              {error.stack || error.message}
            </code>
          </pre>
        )}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              console.log('[ErrorContent] Attempting reset...');
              reset();
            }}
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