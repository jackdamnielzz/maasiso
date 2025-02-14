'use client';

import React, { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="p-4 text-center">
      <h2>Something went wrong!</h2>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Try again
      </button>
    </div>
  );
}