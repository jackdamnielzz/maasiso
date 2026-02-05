import { CORE_PAGE_PATH_SET } from '@/lib/governance/coreRoutes';

function normalizePathname(pathname: string): string {
  if (!pathname) return '';
  const withoutHash = pathname.split('#')[0] || '';
  const withoutQuery = withoutHash.split('?')[0] || '';
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery;
}

function extractCandidateUrls(content: string): string[] {
  const urls: string[] = [];

  // Markdown inline links: [text](url)
  for (const match of content.matchAll(/\[[^\]]+]\(([^)]+)\)/g)) {
    const raw = (match[1] || '').trim();
    if (raw) urls.push(raw);
  }

  // HTML anchors: <a href="...">
  for (const match of content.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)) {
    const raw = (match[1] || '').trim();
    if (raw) urls.push(raw);
  }

  return urls;
}

function urlToPathname(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('#')) return '';
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return '';
    }
  }
  return '';
}

export function hasInternalLinkToCorePage(content: string): boolean {
  if (!content) return false;

  const candidates = extractCandidateUrls(content);
  for (const url of candidates) {
    const pathname = normalizePathname(urlToPathname(url));
    if (!pathname) continue;
    if (CORE_PAGE_PATH_SET.has(pathname)) return true;
  }
  return false;
}

