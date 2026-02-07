const SITEMAP_URL = 'https://www.maasiso.nl/sitemap.xml';
const CRAWL_CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

const DISALLOW_PATHS = ['/api/', '/admin/', '/_admin/'];
const USER_AGENTS = [
  '*',
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'PerplexityBot',
];

function buildAgentBlock(userAgent: string): string {
  return [
    `User-agent: ${userAgent}`,
    'Allow: /',
    ...DISALLOW_PATHS.map((path) => `Disallow: ${path}`),
  ].join('\n');
}

export async function GET() {
  const body = `${USER_AGENTS.map(buildAgentBlock).join('\n\n')}\n\nSitemap: ${SITEMAP_URL}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': CRAWL_CACHE_CONTROL,
    },
  });
}
