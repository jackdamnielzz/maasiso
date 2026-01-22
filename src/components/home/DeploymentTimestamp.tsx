'use client';

import React from 'react';

export function DeploymentTimestamp() {
  const buildNumber = process.env.NEXT_PUBLIC_BUILD_NUMBER;

  if (!buildNumber) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono">
        Build: {buildNumber}
      </div>
    </div>
  );
}