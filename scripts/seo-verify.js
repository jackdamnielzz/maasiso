/* eslint-disable no-console */
// SEO/GEO Verification Script
// Usage: node scripts/seo-verify.js [options]
// Options:
//   --json             Output results as JSON
//   --fail-fast        Stop on first failure
//   --output <file>    Save JSON report to file
//   --max-retries <n>  Maximum retries for failed requests (default: 2)

const SITE_URL = 'https://www.maasiso.nl';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const ROBOTS_URL = `${SITE_URL}/robots.txt`;
const SEARCH_URL = `${SITE_URL}/search?q=iso`;
const ISO9001_TRAILING_SLASH_URL = `${SITE_URL}/iso-certificering/iso-9001/`;

const LEGACY_REDIRECTS = [
  ['/diensten/iso-9001-consultancy', '/iso-certificering/iso-9001/'],
  ['/diensten/gdpr-avg', '/avg-wetgeving/avg'],
  ['/diensten/bio', '/informatiebeveiliging/bio'],
  ['/diensten/iso-27001', '/informatiebeveiliging/iso-27001'],
  ['/diensten/iso-45001', '/iso-certificering/iso-45001'],
  ['/diensten/iso-9001', '/iso-certificering/iso-9001/'],
  ['/diensten/iso-14001', '/iso-certificering/iso-14001'],
];

const SOFT_404_EXPECTATIONS = [
  { path: '/index.html', expected: 'redirect', target: '/' },
  { path: '/algemene-voorwaarden', expected: 'redirect', target: '/terms-and-conditions' },
  { path: '/$', expected: 'status', status: [404, 410] },
];

const REMOVED_URL_CHECKS = [
  '/kennis/blog/iso-9001-interne-audit-tips',
  '/kennis/blog/minimal-test-blog-post',
  '/test-deploy',
];

const HOST_CHECKS = [
  'http://maasiso.nl/',
  'http://www.maasiso.nl/',
  'https://www.maasiso.nl/',
];

const REQUIRED_ROBOTS_DIRECTIVES = [
  'Allow: /',
  'Disallow: /api/',
  'Disallow: /admin/',
  'Disallow: /_admin/',
  `Sitemap: ${SITEMAP_URL}`,
];

const REQUIRED_ROBOTS_USER_AGENTS = [
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

const USER_AGENT = 'MaasISO-SEO-Audit/2.0';
const REQUEST_TIMEOUT = 20000;
const CONCURRENCY = 6;
const DEFAULT_MAX_RETRIES = 2;

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  json: args.includes('--json'),
  failFast: args.includes('--fail-fast'),
  outputFile: null,
  maxRetries: DEFAULT_MAX_RETRIES,
};

const outputIndex = args.indexOf('--output');
if (outputIndex !== -1 && args[outputIndex + 1]) {
  options.outputFile = args[outputIndex + 1];
}

const retriesIndex = args.indexOf('--max-retries');
if (retriesIndex !== -1 && args[retriesIndex + 1]) {
  options.maxRetries = parseInt(args[retriesIndex + 1], 10) || DEFAULT_MAX_RETRIES;
}

class FailFastError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FailFastError';
  }
}

function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timeout after ${ms}ms${label ? ` (${label})` : ''}`));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

function normalizePath(pathname) {
  if (!pathname.startsWith('/')) return `/${pathname}`;
  return pathname;
}

function normalizeUrl(url) {
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname}`;
}

function toAbsoluteNormalized(url, baseUrl) {
  if (!url) return null;
  try {
    return normalizeUrl(new URL(url, baseUrl).toString());
  } catch {
    return null;
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isCanonicalUrl(url) {
  return url === SITE_URL || url.startsWith(`${SITE_URL}/`);
}

function hasWhitespace(value) {
  return value.trim() !== value || /\s/.test(value);
}

function isAllowedTrailingSlash(url) {
  return url === `${SITE_URL}/` || url === ISO9001_TRAILING_SLASH_URL;
}

async function fetchWithRedirects(url, fetchOptions = {}) {
  const maxRetries = options.maxRetries;
  let lastError = null;

  for (let retry = 0; retry <= maxRetries; retry += 1) {
    try {
      const chain = [];
      let currentUrl = url;
      let response = null;

      for (let i = 0; i < 10; i += 1) {
        response = await withTimeout(fetch(currentUrl, {
          redirect: 'manual',
          headers: {
            'User-Agent': USER_AGENT,
          },
          ...fetchOptions,
        }), REQUEST_TIMEOUT, currentUrl);

        const status = response.status;
        const location = response.headers.get('location');
        chain.push({ url: currentUrl, status, location: location || null });

        if (status >= 300 && status < 400 && location) {
          currentUrl = new URL(location, currentUrl).toString();
          continue;
        }

        return { response, finalUrl: currentUrl, chain, retries: retry };
      }

      throw new Error(`Too many redirects for ${url}`);
    } catch (error) {
      lastError = error;
      if (retry < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retry) * 1000));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
}

function extractCanonical(html) {
  const matches = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/gi);
  if (!matches || matches.length === 0) return null;
  const last = matches[matches.length - 1];
  const hrefMatch = last.match(/href=["']([^"']+)["']/i);
  return hrefMatch ? hrefMatch[1] : null;
}

function extractLocs(xml) {
  const locs = [];
  const regex = /<loc>([^<]+)<\/loc>/gi;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    locs.push(match[1]);
  }
  return locs;
}

function extractMetaValue(html, key, attributeName) {
  const regex = new RegExp(
    `<meta[^>]*${attributeName}=["']${escapeRegex(key)}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  const reverseRegex = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*${attributeName}=["']${escapeRegex(key)}["'][^>]*>`,
    'i'
  );

  const directMatch = html.match(regex);
  if (directMatch && directMatch[1]) return directMatch[1];

  const reverseMatch = html.match(reverseRegex);
  if (reverseMatch && reverseMatch[1]) return reverseMatch[1];

  return null;
}

function pushJsonLd(value, out) {
  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach((item) => pushJsonLd(item, out));
    return;
  }

  out.push(value);

  if (Array.isArray(value['@graph'])) {
    value['@graph'].forEach((item) => pushJsonLd(item, out));
  }
}

function extractJsonLdObjects(html) {
  const results = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      pushJsonLd(parsed, results);
    } catch {
      // Ignore invalid JSON-LD blocks
    }
  }

  return results;
}

function getTypeNames(schema) {
  const raw = schema?.['@type'];
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).toLowerCase());
  }
  return [String(raw).toLowerCase()];
}

function extractSchemaItemUrl(item) {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item['@id'] || item.url || null;
  }
  return null;
}

function extractBlogSchemaSignals(html) {
  const schemas = extractJsonLdObjects(html);
  const blogMainEntityUrls = [];
  const breadcrumbLeafUrls = [];

  for (const schema of schemas) {
    const types = getTypeNames(schema);

    if (types.includes('blogposting')) {
      const mainEntityUrl = extractSchemaItemUrl(schema.mainEntityOfPage);
      if (mainEntityUrl) {
        blogMainEntityUrls.push(mainEntityUrl);
      }
    }

    if (types.includes('breadcrumblist')) {
      const items = Array.isArray(schema.itemListElement) ? schema.itemListElement : [];
      const leaf = items[items.length - 1];
      const leafUrl = extractSchemaItemUrl(leaf?.item);
      if (leafUrl) {
        breadcrumbLeafUrls.push(leafUrl);
      }
    }
  }

  return {
    blogMainEntityUrls,
    breadcrumbLeafUrls,
  };
}

async function checkSitemap() {
  const { response } = await fetchWithRedirects(SITEMAP_URL);
  if (!response.ok) {
    throw new Error(`Sitemap fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const locs = extractLocs(xml);
  const invalid = [];
  const seen = new Set();

  for (const loc of locs) {
    const trimmed = loc.trim();

    if (seen.has(trimmed)) {
      invalid.push({ loc, reason: 'Duplicate URL in sitemap' });
      continue;
    }
    seen.add(trimmed);

    if (!isCanonicalUrl(trimmed)) {
      invalid.push({ loc, reason: 'Non-canonical host or protocol' });
      continue;
    }
    if (hasWhitespace(loc)) {
      invalid.push({ loc, reason: 'Whitespace detected in <loc>' });
      continue;
    }

    const pathPart = trimmed.replace(SITE_URL, '');
    if (pathPart.includes('//')) {
      invalid.push({ loc, reason: 'Double slashes in path' });
      continue;
    }
    if (trimmed.includes('/home')) {
      invalid.push({ loc, reason: 'Non-canonical /home in sitemap' });
    }
  }

  return {
    count: locs.length,
    locs: locs.map((loc) => loc.trim()),
    invalid,
  };
}

async function checkCanonical(url) {
  try {
    const { response, finalUrl, chain, retries } = await fetchWithRedirects(url);

    if (!response.ok) {
      return {
        url,
        finalUrl,
        canonical: null,
        issues: [`HTTP ${response.status} ${response.statusText}`],
        chain,
        retries,
      };
    }

    const html = await response.text();
    const canonical = extractCanonical(html);

    const finalNormalized = normalizeUrl(finalUrl);
    const canonicalNormalized = toAbsoluteNormalized(canonical, finalUrl);

    const issues = [];
    if (!isCanonicalUrl(finalNormalized)) {
      issues.push('Final URL not on canonical host');
    }
    if (!canonicalNormalized) {
      issues.push('Missing canonical tag');
    } else {
      if (!isCanonicalUrl(canonicalNormalized)) {
        issues.push('Canonical not on canonical host');
      }
      if (canonicalNormalized !== finalNormalized) {
        if (canonicalNormalized === `${SITE_URL}/` && finalNormalized !== `${SITE_URL}/`) {
          issues.push('Canonical points to homepage for non-home page');
        } else {
          issues.push(`Canonical mismatch (expected ${finalNormalized}, got ${canonicalNormalized})`);
        }
      }

      if (canonicalNormalized.endsWith('/') && !isAllowedTrailingSlash(canonicalNormalized)) {
        issues.push('Canonical has unexpected trailing slash');
      }
    }

    if (options.failFast && issues.length > 0) {
      throw new FailFastError(`Fail-fast triggered: ${url} - ${issues.join(', ')}`);
    }

    return {
      url,
      finalUrl: finalNormalized,
      canonical: canonicalNormalized,
      issues,
      chain,
      retries,
    };
  } catch (error) {
    if (error instanceof FailFastError) {
      throw error;
    }
    return {
      url,
      finalUrl: null,
      canonical: null,
      issues: [`Error: ${error.message}`],
      chain: [],
      retries: options.maxRetries,
    };
  }
}

async function checkMetadataParity(url) {
  try {
    const { response, finalUrl, chain, retries } = await fetchWithRedirects(url);

    if (!response.ok) {
      return {
        url,
        finalUrl,
        canonical: null,
        ogUrl: null,
        blogMainEntityUrls: [],
        breadcrumbLeafUrls: [],
        issues: [`HTTP ${response.status} ${response.statusText}`],
        chain,
        retries,
      };
    }

    const html = await response.text();
    const finalNormalized = normalizeUrl(finalUrl);
    const canonicalNormalized = toAbsoluteNormalized(extractCanonical(html), finalUrl);
    const ogUrlNormalized = toAbsoluteNormalized(extractMetaValue(html, 'og:url', 'property'), finalUrl);

    const { blogMainEntityUrls, breadcrumbLeafUrls } = extractBlogSchemaSignals(html);
    const normalizedBlogMainEntityUrls = blogMainEntityUrls
      .map((item) => toAbsoluteNormalized(item, finalUrl))
      .filter(Boolean);
    const normalizedBreadcrumbLeafUrls = breadcrumbLeafUrls
      .map((item) => toAbsoluteNormalized(item, finalUrl))
      .filter(Boolean);

    const issues = [];

    if (!canonicalNormalized) {
      issues.push('Missing canonical tag');
    } else if (canonicalNormalized !== finalNormalized) {
      issues.push(`Canonical mismatch (expected ${finalNormalized}, got ${canonicalNormalized})`);
    }

    if (!ogUrlNormalized) {
      issues.push('Missing og:url');
    } else if (canonicalNormalized && ogUrlNormalized !== canonicalNormalized) {
      issues.push(`og:url mismatch (expected ${canonicalNormalized}, got ${ogUrlNormalized})`);
    }

    if (normalizedBlogMainEntityUrls.length === 0) {
      issues.push('Missing BlogPosting mainEntityOfPage URL');
    } else if (canonicalNormalized) {
      normalizedBlogMainEntityUrls.forEach((schemaUrl) => {
        if (schemaUrl !== canonicalNormalized) {
          issues.push(`BlogPosting mainEntityOfPage mismatch (expected ${canonicalNormalized}, got ${schemaUrl})`);
        }
      });
    }

    if (normalizedBreadcrumbLeafUrls.length === 0) {
      issues.push('Missing BreadcrumbList leaf URL');
    } else if (canonicalNormalized) {
      normalizedBreadcrumbLeafUrls.forEach((breadcrumbUrl) => {
        if (breadcrumbUrl !== canonicalNormalized) {
          issues.push(`Breadcrumb leaf mismatch (expected ${canonicalNormalized}, got ${breadcrumbUrl})`);
        }
      });
    }

    if (options.failFast && issues.length > 0) {
      throw new FailFastError(`Fail-fast triggered: ${url} - ${issues.join(', ')}`);
    }

    return {
      url,
      finalUrl: finalNormalized,
      canonical: canonicalNormalized,
      ogUrl: ogUrlNormalized,
      blogMainEntityUrls: normalizedBlogMainEntityUrls,
      breadcrumbLeafUrls: normalizedBreadcrumbLeafUrls,
      issues,
      chain,
      retries,
    };
  } catch (error) {
    if (error instanceof FailFastError) {
      throw error;
    }
    return {
      url,
      finalUrl: null,
      canonical: null,
      ogUrl: null,
      blogMainEntityUrls: [],
      breadcrumbLeafUrls: [],
      issues: [`Error: ${error.message}`],
      chain: [],
      retries: options.maxRetries,
    };
  }
}

async function checkRobotsTxt() {
  try {
    const { response, finalUrl, chain, retries } = await fetchWithRedirects(ROBOTS_URL);
    const issues = [];

    if (!response.ok) {
      issues.push(`HTTP ${response.status} ${response.statusText}`);
      return { url: ROBOTS_URL, finalUrl, issues, chain, retries };
    }

    const body = await response.text();

    REQUIRED_ROBOTS_DIRECTIVES.forEach((directive) => {
      if (!body.includes(directive)) {
        issues.push(`Missing robots directive: ${directive}`);
      }
    });

    REQUIRED_ROBOTS_USER_AGENTS.forEach((agent) => {
      const userAgentPattern = new RegExp(`^User-agent:\\s*${escapeRegex(agent)}\\s*$`, 'mi');
      if (!userAgentPattern.test(body)) {
        issues.push(`Missing User-agent section: ${agent}`);
      }
    });

    if (options.failFast && issues.length > 0) {
      throw new FailFastError(`Fail-fast triggered: ${ROBOTS_URL} - ${issues.join(', ')}`);
    }

    return {
      url: ROBOTS_URL,
      finalUrl,
      issues,
      chain,
      retries,
    };
  } catch (error) {
    if (error instanceof FailFastError) {
      throw error;
    }
    return {
      url: ROBOTS_URL,
      finalUrl: null,
      issues: [`Error: ${error.message}`],
      chain: [],
      retries: options.maxRetries,
    };
  }
}

async function checkSearchNoindex() {
  try {
    const { response, finalUrl, chain, retries } = await fetchWithRedirects(SEARCH_URL);
    const issues = [];

    if (!response.ok) {
      issues.push(`HTTP ${response.status} ${response.statusText}`);
      return { url: SEARCH_URL, finalUrl, issues, chain, retries };
    }

    const html = await response.text();
    const robotsMeta = extractMetaValue(html, 'robots', 'name');
    const canonicalNormalized = toAbsoluteNormalized(extractCanonical(html), finalUrl);

    if (!robotsMeta) {
      issues.push('Missing robots meta tag on /search');
    } else {
      const robotsTokens = robotsMeta
        .split(',')
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean);

      if (!robotsTokens.includes('noindex')) {
        issues.push('Search page missing noindex directive');
      }
      if (!robotsTokens.includes('follow')) {
        issues.push('Search page missing follow directive');
      }
    }

    if (canonicalNormalized !== `${SITE_URL}/search`) {
      issues.push(`Search canonical mismatch (expected ${SITE_URL}/search, got ${canonicalNormalized || 'missing'})`);
    }

    if (options.failFast && issues.length > 0) {
      throw new FailFastError(`Fail-fast triggered: ${SEARCH_URL} - ${issues.join(', ')}`);
    }

    return {
      url: SEARCH_URL,
      finalUrl,
      canonical: canonicalNormalized,
      robotsMeta,
      issues,
      chain,
      retries,
    };
  } catch (error) {
    if (error instanceof FailFastError) {
      throw error;
    }
    return {
      url: SEARCH_URL,
      finalUrl: null,
      canonical: null,
      robotsMeta: null,
      issues: [`Error: ${error.message}`],
      chain: [],
      retries: options.maxRetries,
    };
  }
}

async function checkLegacyRedirects() {
  const results = [];
  for (const [from, to] of LEGACY_REDIRECTS) {
    try {
      const fromUrl = `${SITE_URL}${from}`;
      const { response, finalUrl, chain, retries } = await fetchWithRedirects(fromUrl, { method: 'HEAD' });
      const expectedFinal = `${SITE_URL}${to}`;
      const issues = [];

      if (![301, 308].includes(chain[0]?.status)) {
        issues.push(`Expected 301/308 on first hop, got ${chain[0]?.status ?? 'unknown'}`);
      }
      if (normalizeUrl(finalUrl) !== expectedFinal) {
        issues.push(`Final URL mismatch (expected ${expectedFinal}, got ${finalUrl})`);
      }
      if (![200, 204].includes(response.status)) {
        issues.push(`Final status not 200/204 (got ${response.status})`);
      }

      if (options.failFast && issues.length > 0) {
        throw new FailFastError(`Fail-fast triggered: ${fromUrl} -> ${to} - ${issues.join(', ')}`);
      }

      results.push({ from: fromUrl, to: expectedFinal, issues, chain, retries });
    } catch (error) {
      if (error instanceof FailFastError) {
        throw error;
      }
      results.push({
        from: `${SITE_URL}${from}`,
        to: `${SITE_URL}${to}`,
        issues: [`Error: ${error.message}`],
        chain: [],
        retries: options.maxRetries,
      });
    }
  }
  return results;
}

async function checkHostConsolidation() {
  const results = [];
  for (const url of HOST_CHECKS) {
    try {
      const { response, finalUrl, chain, retries } = await fetchWithRedirects(url, { method: 'HEAD' });
      const issues = [];

      if (normalizeUrl(finalUrl) !== `${SITE_URL}/`) {
        issues.push(`Final URL mismatch (expected ${SITE_URL}/, got ${finalUrl})`);
      }
      if (![200, 204].includes(response.status)) {
        issues.push(`Final status not 200/204 (got ${response.status})`);
      }

      if (options.failFast && issues.length > 0) {
        throw new FailFastError(`Fail-fast triggered: ${url} - ${issues.join(', ')}`);
      }

      results.push({ url, finalUrl, issues, chain, retries });
    } catch (error) {
      if (error instanceof FailFastError) {
        throw error;
      }
      results.push({
        url,
        finalUrl: null,
        issues: [`Error: ${error.message}`],
        chain: [],
        retries: options.maxRetries,
      });
    }
  }
  return results;
}

async function checkSoft404s() {
  const results = [];
  for (const check of SOFT_404_EXPECTATIONS) {
    try {
      const targetUrl = `${SITE_URL}${normalizePath(check.path)}`;
      const { response, finalUrl, chain, retries } = await fetchWithRedirects(targetUrl, { method: 'HEAD' });
      const issues = [];

      if (check.expected === 'redirect') {
        const expectedFinal = `${SITE_URL}${normalizePath(check.target)}`;
        if (![301, 308].includes(chain[0]?.status)) {
          issues.push(`Expected 301/308 on first hop, got ${chain[0]?.status ?? 'unknown'}`);
        }
        if (normalizeUrl(finalUrl) !== expectedFinal) {
          issues.push(`Final URL mismatch (expected ${expectedFinal}, got ${finalUrl})`);
        }
      }

      if (check.expected === 'status') {
        if (!check.status.includes(response.status)) {
          issues.push(`Expected status ${check.status.join(' or ')}, got ${response.status}`);
        }
      }

      if (options.failFast && issues.length > 0) {
        throw new FailFastError(`Fail-fast triggered: ${targetUrl} - ${issues.join(', ')}`);
      }

      results.push({ url: targetUrl, finalUrl, issues, chain, retries });
    } catch (error) {
      if (error instanceof FailFastError) {
        throw error;
      }
      results.push({
        url: `${SITE_URL}${normalizePath(check.path)}`,
        finalUrl: null,
        issues: [`Error: ${error.message}`],
        chain: [],
        retries: options.maxRetries,
      });
    }
  }
  return results;
}

async function checkRemovedUrls() {
  const results = [];
  for (const path of REMOVED_URL_CHECKS) {
    try {
      const targetUrl = `${SITE_URL}${normalizePath(path)}`;
      const { response, chain, retries } = await fetchWithRedirects(targetUrl, { method: 'HEAD' });
      const issues = [];

      if (response.status !== 410) {
        issues.push(`Expected 410 Gone, got ${response.status}`);
      }

      if (chain.length > 1) {
        issues.push('URL should return 410 directly without redirects');
      }

      if (options.failFast && issues.length > 0) {
        throw new FailFastError(`Fail-fast triggered: ${targetUrl} - ${issues.join(', ')}`);
      }

      results.push({ url: targetUrl, status: response.status, issues, chain, retries });
    } catch (error) {
      if (error instanceof FailFastError) {
        throw error;
      }
      results.push({
        url: `${SITE_URL}${normalizePath(path)}`,
        status: null,
        issues: [`Error: ${error.message}`],
        chain: [],
        retries: options.maxRetries,
      });
    }
  }
  return results;
}

async function runWithConcurrency(items, worker) {
  const results = [];
  let index = 0;

  async function next() {
    if (index >= items.length) return;
    const currentIndex = index;
    index += 1;
    results[currentIndex] = await worker(items[currentIndex]);
    await next();
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => next());
  await Promise.all(workers);
  return results;
}

function reportSection(title) {
  if (!options.json) {
    console.log(`\n=== ${title} ===`);
  }
}

function reportIssues(items, labelFn) {
  let failed = 0;
  for (const item of items) {
    if (item.issues?.length) {
      failed += 1;
      if (!options.json) {
        console.log(`❌ ${labelFn(item)}`);
        item.issues.forEach((issue) => console.log(`   - ${issue}`));
      }
    } else if (!options.json) {
      console.log(`✅ ${labelFn(item)}`);
    }
  }
  return failed;
}

async function writeJsonReport(report) {
  if (options.outputFile) {
    const fs = await import('fs/promises');
    await fs.writeFile(options.outputFile, JSON.stringify(report, null, 2), 'utf-8');
    if (!options.json) {
      console.log(`\nJSON report saved to: ${options.outputFile}`);
    }
  }
}

function printJsonReport(report) {
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  }
}

async function run() {
  const startTime = Date.now();
  let failures = 0;

  const report = {
    timestamp: new Date().toISOString(),
    site: SITE_URL,
    options: {
      failFast: options.failFast,
      maxRetries: options.maxRetries,
      concurrency: CONCURRENCY,
      timeout: REQUEST_TIMEOUT,
    },
    results: {},
    summary: {},
  };

  try {
    reportSection('Sitemap');
    const sitemap = await checkSitemap();
    report.results.sitemap = sitemap;

    if (!options.json) {
      console.log(`Total URLs: ${sitemap.count}`);
      if (sitemap.invalid.length) {
        failures += sitemap.invalid.length;
        console.log('Invalid sitemap entries:');
        sitemap.invalid.forEach((entry) => console.log(`   - ${entry.loc} (${entry.reason})`));
      } else {
        console.log('Sitemap entries are valid');
      }
    } else {
      failures += sitemap.invalid.length;
    }

    reportSection('Canonical Verification');
    const canonicalResults = await runWithConcurrency(sitemap.locs, checkCanonical);
    report.results.canonical = canonicalResults;
    failures += reportIssues(canonicalResults, (item) => item.url);

    reportSection('Blog Metadata Parity');
    const blogLocs = sitemap.locs.filter((loc) => loc.includes('/kennis/blog/'));
    const parityResults = await runWithConcurrency(blogLocs, checkMetadataParity);
    report.results.blogMetadataParity = parityResults;
    failures += reportIssues(parityResults, (item) => item.url);

    reportSection('Robots Policy');
    const robotsResult = await checkRobotsTxt();
    report.results.robotsPolicy = [robotsResult];
    failures += reportIssues([robotsResult], (item) => item.url);

    reportSection('Search Noindex');
    const searchNoindexResult = await checkSearchNoindex();
    report.results.searchNoindex = [searchNoindexResult];
    failures += reportIssues([searchNoindexResult], (item) => item.url);

    reportSection('Legacy Redirects');
    const legacyResults = await checkLegacyRedirects();
    report.results.legacyRedirects = legacyResults;
    failures += reportIssues(legacyResults, (item) => `${item.from} -> ${item.to}`);

    reportSection('Host Consolidation');
    const hostResults = await checkHostConsolidation();
    report.results.hostConsolidation = hostResults;
    failures += reportIssues(hostResults, (item) => item.url);

    reportSection('Soft 404 Checks');
    const softResults = await checkSoft404s();
    report.results.soft404 = softResults;
    failures += reportIssues(softResults, (item) => item.url);

    reportSection('Removed URLs (410 Gone)');
    const removedResults = await checkRemovedUrls();
    report.results.removedUrls = removedResults;
    failures += reportIssues(removedResults, (item) => item.url);

    const duration = Date.now() - startTime;
    report.summary = {
      totalIssues: failures,
      passed: failures === 0,
      duration: `${(duration / 1000).toFixed(2)}s`,
      checks: {
        sitemap: {
          total: sitemap.count,
          invalid: sitemap.invalid.length,
        },
        canonical: {
          total: canonicalResults.length,
          failed: canonicalResults.filter((item) => item.issues?.length).length,
        },
        blogMetadataParity: {
          total: parityResults.length,
          failed: parityResults.filter((item) => item.issues?.length).length,
        },
        robotsPolicy: {
          total: 1,
          failed: robotsResult.issues?.length ? 1 : 0,
        },
        searchNoindex: {
          total: 1,
          failed: searchNoindexResult.issues?.length ? 1 : 0,
        },
        legacyRedirects: {
          total: legacyResults.length,
          failed: legacyResults.filter((item) => item.issues?.length).length,
        },
        hostConsolidation: {
          total: hostResults.length,
          failed: hostResults.filter((item) => item.issues?.length).length,
        },
        soft404: {
          total: softResults.length,
          failed: softResults.filter((item) => item.issues?.length).length,
        },
        removedUrls: {
          total: removedResults.length,
          failed: removedResults.filter((item) => item.issues?.length).length,
        },
      },
    };

    printJsonReport(report);
    await writeJsonReport(report);

    if (!options.json) {
      console.log(`\nFinal Result: ${failures === 0 ? 'PASSED' : 'FAILED'} (${failures} issue(s) in ${report.summary.duration})`);
    }

    process.exit(failures === 0 ? 0 : 1);
  } catch (error) {
    if (error instanceof FailFastError) {
      report.summary = {
        totalIssues: failures,
        passed: false,
        error: error.message,
        failFast: true,
      };

      printJsonReport(report);
      await writeJsonReport(report);

      if (!options.json) {
        console.error(`\n${error.message}`);
      }

      process.exit(1);
    }

    throw error;
  }
}

run().catch((error) => {
  if (!options.json) {
    console.error('Fatal error:', error.message);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
  } else {
    console.error(JSON.stringify({ error: error.message, stack: error.stack }, null, 2));
  }
  process.exit(1);
});
