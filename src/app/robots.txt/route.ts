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
        'Content-Type': 'text/plain',
      },
    }
  );
}