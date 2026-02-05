export const PAGE_ROLES = ['hub', 'detail', 'blog', 'conversion'] as const;

export type PageRole = (typeof PAGE_ROLES)[number];

