import type { BlogPost, SearchScope } from '@/lib/types';

export interface ScoreBreakdown {
  titleScore: number;
  summaryScore: number;
  contentScore: number;
}

/**
 * Calculate relevance score for search results
 * Weights: title=10, summary/articledescription=5, content=1
 */
export function calculateRelevanceScore(
  query: string,
  item: BlogPost,
  scope: SearchScope
): { score: number; breakdown: ScoreBreakdown } {
  const tokens = tokenizeQuery(query);

  // Eligible fields depend on scope
  const canScoreTitle = scope === 'all' || scope === 'title' || scope === 'title-summary';
  const canScoreSummary = scope === 'all' || scope === 'title-summary';
  const canScoreContent = scope === 'all' || scope === 'content';

  const titleText = item.title;

  const summaryText = item.summary || '';

  const contentText = item.content;

  const titleScore = canScoreTitle ? scoreField(tokens, titleText, 10) : 0;
  const summaryScore = canScoreSummary ? scoreField(tokens, summaryText, 5) : 0;
  const contentScore = canScoreContent ? scoreField(tokens, contentText, 1) : 0;

  const score = titleScore + summaryScore + contentScore;

  return {
    score,
    breakdown: {
      titleScore,
      summaryScore,
      contentScore
    }
  };
}

/**
 * Tokenize search query (lowercase, split on whitespace)
 */
function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);
}

/**
 * Count token occurrences in text (case-insensitive)
 * Returns log-scaled score: baseWeight * (1 + log2(1 + occurrences))
 */
function scoreField(tokens: string[], text: string | undefined, baseWeight: number): number {
  if (!text) return 0;
  if (!tokens.length) return 0;

  const haystack = text.toLowerCase();

  let total = 0;
  for (const token of tokens) {
    if (!token) continue;

    const occurrences = countOccurrences(haystack, token);
    if (occurrences <= 0) continue;

    // baseWeight × (1 + log2(1 + occurrences))
    total += baseWeight * (1 + Math.log2(1 + occurrences));
  }

  return total;
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;

  let count = 0;
  let idx = 0;
  while (true) {
    const found = haystack.indexOf(needle, idx);
    if (found === -1) break;
    count += 1;
    idx = found + needle.length;
  }

  return count;
}

