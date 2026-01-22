'use client';

import { Suspense } from 'react';

export default function ParallelDefault() {
  return (
    <Suspense fallback={null}>
      <div />
    </Suspense>
  );
}