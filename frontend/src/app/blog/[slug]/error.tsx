'use client';

import { useEffect } from 'react';

interface ErrorDisplayConfig {
  title: string;
  message: string;
  showRetry: boolean;
  icon: string;
}

function getErrorConfig(error: Error): ErrorDisplayConfig {
  const defaultConfig: ErrorDisplayConfig = {
    title: 'Er is iets misgegaan',
    message: 'Er is een fout opgetreden bij het laden van de blog post.',
    showRetry: true,
    icon: '⚠️'
  };

  switch (error.message) {
    case 'Blog post URL ontbreekt':
      return {
        title: 'Ontbrekende URL',
        message: 'Er is geen blog post URL opgegeven.',
        showRetry: false,
        icon: '🔍'
      };
    case 'Ongeldige blog post URL':
      return {
        title: 'Ongeldige URL',
        message: 'De opgegeven blog post URL is niet geldig.',
        showRetry: false,
        icon: '🔍'
      };
    case 'Blog post niet gevonden':
      return {
        title: 'Blog post niet gevonden',
        message: 'De opgevraagde blog post bestaat niet of is verwijderd.',
        showRetry: false,
        icon: '📭'
      };
    case 'Blog post data is onvolledig':
      return {
        title: 'Onvolledige content',
        message: 'De blog post data is onvolledig. Probeer het later opnieuw.',
        showRetry: true,
        icon: '📝'
      };
    case 'Kan blog post niet laden door een API fout':
      return {
        title: 'API Fout',
        message: 'Er is een probleem met het laden van de blog post. Probeer het later opnieuw.',
        showRetry: true,
        icon: '🌐'
      };
    default:
      return defaultConfig;
  }
}

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Enhanced error logging
    console.group('BlogPostError');
    console.error('Error details:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack
    });
    console.groupEnd();
  }, [error]);

  const errorConfig = getErrorConfig(error);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4" role="img" aria-label="Error icon">
            {errorConfig.icon}
          </div>
          <h1 className="text-2xl font-bold text-[#091E42] mb-4">
            {errorConfig.title}
          </h1>
          <p className="text-[#091E42]/70 mb-6">
            {errorConfig.message}
          </p>
          {errorConfig.showRetry && (
            <button
              onClick={() => {
                console.log('Retrying blog post load...');
                reset();
              }}
              className="px-4 py-2 bg-[#FF8B00] text-white rounded-lg hover:bg-[#E67E00] transition-colors"
            >
              Probeer opnieuw
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
