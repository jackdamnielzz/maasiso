// Configuration for URLs that have been permanently removed
// Returns 410 Gone to signal permanent deletion to search engines

export interface RemovedUrl {
  path: string;
  reason?: string; // Optional: Why it was removed
  removedAt?: string; // Optional: When it was removed (ISO date)
}

const REMOVED_BLOG_SLUGS: Array<{ slug: string; reason: string }> = [
  { slug: 'iso-9001-interne-audit-tips', reason: 'Content archived/deleted' },
  { slug: 'minimal-test-blog-post', reason: 'Test content removed' },
];

const REMOVED_BLOG_URLS: RemovedUrl[] = REMOVED_BLOG_SLUGS.flatMap(({ slug, reason }) => [
  {
    path: `/blog/${slug}`,
    reason,
    removedAt: '2026-01-25',
  },
  {
    path: `/kennis/blog/${slug}`,
    reason,
    removedAt: '2026-01-25',
  },
]);

export const REMOVED_URLS: RemovedUrl[] = [
  ...REMOVED_BLOG_URLS,
  {
    path: '/test-deploy',
    reason: 'Test page removed',
    removedAt: '2026-01-25'
  }
];

// Export as Set for O(1) lookup performance
export const REMOVED_PATHS = new Set(REMOVED_URLS.map(u => u.path));

// Helper function for middleware
export function isRemovedUrl(pathname: string): boolean {
  return REMOVED_PATHS.has(pathname);
}
