import type { Metadata, ResolvingMetadata } from 'next';
import BlogPostPage, { generateMetadata as baseGenerateMetadata } from '../../../blog/[slug]/page';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import { getBlogPostBySlug } from '@/lib/api';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const base = await baseGenerateMetadata({ params, searchParams } as any, parent);
  return {
    ...base,
    alternates: {
      canonical: `/kennis/blog/${(await params).slug}`,
    },
  };
}

export default async function KennisBlogPostPage(props: PageProps) {
  const resolvedParams = await props.params;
  const blogPost = await getBlogPostBySlug(decodeURIComponent(resolvedParams.slug));

  const title = blogPost?.blogPost?.title || 'Artikel';
  const canonicalUrl = `https://maasiso.nl/kennis/blog/${resolvedParams.slug}`;

  return (
    <main className="flex-1 bg-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
          { label: 'Blog', href: '/kennis/blog' },
          { label: title, href: canonicalUrl },
        ]}
      />
      <BlogPostPage {...props} />
    </main>
  );
}
