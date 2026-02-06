import { MetadataRoute } from 'next'

export async function GET() {
  const robots: MetadataRoute.Robots = {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/_admin/'],
    },
    sitemap: 'https://www.maasiso.nl/sitemap.xml',
  }

  return new Response(
    `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_admin/

Sitemap: https://www.maasiso.nl/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
}
