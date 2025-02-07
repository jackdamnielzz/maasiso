'use client';

import ErrorContentWrapper from '@/components/error/ErrorContentWrapper';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContentWrapper error={error} reset={reset} />;
}
