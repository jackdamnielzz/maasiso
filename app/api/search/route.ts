import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/api';
import { calculateRelevanceScore } from '@/lib/utils/searchScoring';
import type {
  SearchParamsV2,
  SearchResultsV2,
  ScoredSearchResult,
  SearchScope,
  BlogPost
} from '@/lib/types';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const MAX_CANDIDATES_PER_TYPE = 100;

function isSearchScope(value: string): value is SearchScope {
  return value === 'all' || value === 'title' || value === 'title-summary' || value === 'content';
}

function isContentType(value: string): value is NonNullable<SearchParamsV2['contentType']> {
  return value === 'all' || value === 'blog';
}

function parseDateMs(value: string | null): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function getItemDateMs(item: BlogPost): number {
  const candidate = item.publishedAt || item.publicationDate || item.createdAt;
  const ms = new Date(candidate).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function buildSearchableText(item: BlogPost, scope: SearchScope): string {
  const title = item.title || '';

  const summary = item.summary || '';
  const content = item.content || '';

  switch (scope) {
    case 'title':
      return title;
    case 'title-summary':
      return [title, summary].join(' ');
    case 'content':
      return content;
    case 'all':
    default:
      return [title, summary, content].join(' ');
  }
}

function matchesQueryTokens(item: BlogPost, tokens: string[], scope: SearchScope): boolean {
  const searchableText = buildSearchableText(item, scope).toLowerCase();
  return tokens.some(token => searchableText.includes(token));
}

export async function GET(request: NextRequest) {
  try {
    // 1) Parse & validate search params from URL
    const searchParams = request.nextUrl.searchParams;

    const query = (searchParams.get('q') || '').trim();
    const scopeRaw = searchParams.get('scope') || 'all';
    const typeRaw = searchParams.get('type') || 'all';

    const scope: SearchScope = isSearchScope(scopeRaw) ? scopeRaw : 'all';
    const contentType: NonNullable<SearchParamsV2['contentType']> =
      // Backward compatibility: treat legacy `type=news` as `all` (blog only now).
      isContentType(typeRaw) ? typeRaw : 'all';

    const dateFromMs = parseDateMs(searchParams.get('dateFrom'));
    const dateToMs = parseDateMs(searchParams.get('dateTo'));

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
    );

    // 2) Validate query
    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // 3) Fetch candidates from Strapi (using existing API functions)
    const blogResult = await getBlogPosts(1, MAX_CANDIDATES_PER_TYPE);
    const blogPosts = contentType === 'all' || contentType === 'blog' ? blogResult.posts : [];

    // 4) Filter on basic token presence (case-insensitive) within scoped fields
    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .map(t => t.trim())
      .filter(Boolean);

    const matchingBlog = blogPosts.filter(post => matchesQueryTokens(post, tokens, scope));

    // 5) Score each result
    const scoredBlog: ScoredSearchResult[] = matchingBlog.map(post => {
      const { score, breakdown } = calculateRelevanceScore(query, post, scope);
      return {
        type: 'blog' as const,
        item: post,
        relevanceScore: score,
        scoreBreakdown: breakdown
      };
    });

    // 6) Sort by relevance score (desc), then by date (desc)
    const sortByRelevance = (a: ScoredSearchResult, b: ScoredSearchResult) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return getItemDateMs(b.item) - getItemDateMs(a.item);
    };

    scoredBlog.sort(sortByRelevance);

    // 7) Apply date filtering if provided
    const withinDateRange = (item: BlogPost): boolean => {
      if (dateFromMs === null && dateToMs === null) return true;
      const ms = getItemDateMs(item);
      if (dateFromMs !== null && ms < dateFromMs) return false;
      if (dateToMs !== null && ms > dateToMs) return false;
      return true;
    };

    const datedBlog = scoredBlog.filter(r => withinDateRange(r.item));

    // 8) Paginate (per section to maintain split UI)
    const startIdx = (page - 1) * pageSize;
    const paginatedBlog = datedBlog.slice(startIdx, startIdx + pageSize);

    // 9) Return response
    const response: SearchResultsV2 = {
      blog: paginatedBlog,
      meta: {
        totalResults: datedBlog.length,
        query,
        scope
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/search] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

