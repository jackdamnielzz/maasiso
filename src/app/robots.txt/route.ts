export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(
    `User-agent: *
Allow: /
Allow: /_next/static/
Disallow: /_next/
Disallow: /api/
Disallow: /admin/

Sitemap: https://maasiso.nl/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        // Ensure Vercel Edge/CDN and browsers don't cache a stale robots.txt.
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}