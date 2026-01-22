# Active Context - Sitemap Dynamic Integration

## Current Status
- Fixed `app/sitemap.ts` to use authenticated API calls.
- Integrated `getBlogPosts`, `getNewsArticles`, and `getWhitepapers` from `src/lib/api.ts`.
- Added dynamic fetching for `pages` collection via authenticated direct fetch.
- Added missing static routes `/avg` and `/bio`.
- Implemented robust error handling and logging.
- Switched to `process.env.NEXT_PUBLIC_SITE_URL` for the base URL.

## Next Steps
- Verify sitemap output in production/staging environment.
- Monitor console logs for "Sitemap: X blogposts, Y news articles, Z pages".
