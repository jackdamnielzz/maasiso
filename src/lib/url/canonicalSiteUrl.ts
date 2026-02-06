const DEFAULT_CANONICAL_SITE_URL = 'https://www.maasiso.nl';

export function getCanonicalSiteUrl(rawUrl?: string): string {
  try {
    const candidate = String(rawUrl || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_CANONICAL_SITE_URL).trim();
    const parsed = new URL(candidate);

    parsed.protocol = 'https:';
    parsed.hostname = parsed.hostname.replace(/\.$/, '').toLowerCase();
    if (parsed.hostname === 'maasiso.nl') {
      parsed.hostname = 'www.maasiso.nl';
    }

    parsed.pathname = '';
    parsed.search = '';
    parsed.hash = '';

    return parsed.toString().replace(/\/+$/g, '');
  } catch {
    return DEFAULT_CANONICAL_SITE_URL;
  }
}
