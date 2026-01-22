import { Suspense } from 'react';

export default function Default() {
  return (
    <Suspense fallback={null}>
      <div />
    </Suspense>
  );
}