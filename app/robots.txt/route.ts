import { MetadataRoute } from 'next'

export async function GET() {
  const robots: MetadataRoute.Robots = {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://maasiso.nl/sitemap.xml',
  }

  return new Response(
    `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://maasiso.nl/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
}