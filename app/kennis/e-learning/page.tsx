import type { Metadata } from 'next';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

export const metadata: Metadata = {
  title: 'E-learning | MaasISO',
  description: 'Online trainingen en cursussen over ISO-certificering en compliance.',
  alternates: {
    canonical: '/kennis/e-learning',
  },
};

export default function ELearningPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
          { label: 'E-learning', href: '/kennis/e-learning' },
        ]}
      />
      <section className="py-16 md:py-24">
        <div className="container-custom px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#091E42] mb-4">
            E-learning
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Binnenkort beschikbaar. We werken aan online trainingen en cursussen die u helpen
            ISO‑normen en compliance praktisch toe te passen.
          </p>
        </div>
      </section>
    </main>
  );
}
