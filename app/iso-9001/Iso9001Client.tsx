'use client';

import { useEffect } from 'react';
import ServiceAnalytics from '@/components/common/ServiceAnalytics';

interface Iso9001ClientProps {
  children: React.ReactNode;
}

export default function Iso9001Client({ children }: Iso9001ClientProps) {
  return (
    <>
      <ServiceAnalytics serviceName="ISO 9001" />
      {children}
    </>
  );
} 