import type { Metadata } from 'next';
import BlogPage from '../../blog/page';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Blog | MaasISO',
  description:
    'Artikelen en inzichten over ISO-certificering, informatiebeveiliging en privacy.',
  alternates: {
    canonical: '/kennis/blog',
  },
};

export default function KennisBlogPage(props: Parameters<typeof BlogPage>[0]) {
  return (
    <main className="flex-1 bg-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
          { label: 'Blog', href: '/kennis/blog' },
        ]}
      />
      <BlogPage {...props} />
    </main>
  );
}
