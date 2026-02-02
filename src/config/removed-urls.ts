// Configuration for URLs that have been permanently removed
// Returns 410 Gone to signal permanent deletion to search engines

export interface RemovedUrl {
  path: string;
  reason?: string; // Optional: Why it was removed
  removedAt?: string; // Optional: When it was removed (ISO date)
}

export const REMOVED_URLS: RemovedUrl[] = [
  {
    path: '/blog/iso-9001-interne-audit-tips',
    reason: 'Content archived/deleted',
    removedAt: '2026-01-25'
  },
  {
    path: '/blog/minimal-test-blog-post',
    reason: 'Test content removed',
    removedAt: '2026-01-25'
  },
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
