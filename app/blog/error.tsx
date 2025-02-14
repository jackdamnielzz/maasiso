'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '../../src/components/common/ErrorFallback';

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Blog Error Boundary caught error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="bg-white min-h-screen py-24">
      <div className="container-custom">
        <ErrorFallback
          error={error}
          resetError={reset}
          message="We konden de blog artikelen niet laden. Dit kan komen door een tijdelijk probleem met de verbinding of de server."
          actionLabel="Probeer opnieuw"
        />
      </div>
    </div>
  );
}
