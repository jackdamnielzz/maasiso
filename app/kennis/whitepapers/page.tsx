import type { Metadata } from 'next';
import WhitepaperClientWrapper from '@/components/features/WhitepaperClientWrapper';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

export const metadata: Metadata = {
  title: 'Whitepapers | MaasISO',
  description:
    'Diepgaande whitepapers over ISO-certificering, informatiebeveiliging en compliance.',
  alternates: {
    canonical: '/kennis/whitepapers',
  },
};

export default function WhitepapersOverviewPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <CoreBreadcrumbBar
        showVisual={false}
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
          { label: 'Whitepapers', href: '/kennis/whitepapers' },
        ]}
      />
      <WhitepaperClientWrapper />
    </main>
  );
}
