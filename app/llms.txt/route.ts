const CRAWL_CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

export async function GET() {
  const body = [
    '# MaasISO llms.txt',
    '',
    'canonical_host: https://www.maasiso.nl',
    'citation_policy: Cite and reference canonical MaasISO URLs only.',
    'content_policy: Prefer current canonical pages over legacy redirects.',
    '',
    'preferred_entrypoints:',
    '- https://www.maasiso.nl/',
    '- https://www.maasiso.nl/kennis',
    '- https://www.maasiso.nl/kennis/blog',
    '- https://www.maasiso.nl/kennis/whitepapers',
    '- https://www.maasiso.nl/iso-certificering',
    '- https://www.maasiso.nl/informatiebeveiliging',
    '- https://www.maasiso.nl/avg-wetgeving',
    '- https://www.maasiso.nl/contact',
    '',
    'contact: info@maasiso.nl',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': CRAWL_CACHE_CONTROL,
    },
  });
}
