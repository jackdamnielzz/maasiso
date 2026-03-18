/**
 * Google Search Console Analyse Script voor MaasISO
 * Haalt uitgebreide SEO data op via de GSC API
 */
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'sc-domain:maasiso.nl';
const CREDENTIALS_PATH = path.join(__dirname, '..', 'secrets', 'google-service-account.json');

async function getSearchConsoleClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
  return searchconsole;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

async function main() {
  console.log('Verbinding maken met Google Search Console...');
  const client = await getSearchConsoleClient();
  const results = {};

  // ========== 1. ZOEKPRESTATIES OVERZICHT ==========
  console.log('1. Zoekprestaties overzicht ophalen...');

  // 28 dagen overzicht
  const overview28d = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(28),
      endDate: daysAgo(1),
      dimensions: [],
      rowLimit: 1,
    },
  });
  results.overview28d = overview28d.data.rows || [];

  // 90 dagen overzicht
  const overview90d = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: [],
      rowLimit: 1,
    },
  });
  results.overview90d = overview90d.data.rows || [];

  // Dagelijkse trend (90 dagen)
  const dailyTrend = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: ['date'],
      rowLimit: 25000,
    },
  });
  results.dailyTrend = dailyTrend.data.rows || [];

  // ========== 2. KEYWORD ANALYSE ==========
  console.log('2. Keyword analyse ophalen...');

  // Top zoekwoorden op clicks (90 dagen, max 500)
  const keywordsByClicks = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: ['query'],
      rowLimit: 500,
      orderBy: 'clicks',
    },
  });
  results.keywordsByClicks = keywordsByClicks.data.rows || [];

  // Top zoekwoorden op impressies
  const keywordsByImpressions = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: ['query'],
      rowLimit: 500,
      orderBy: 'impressions',
    },
  });
  results.keywordsByImpressions = keywordsByImpressions.data.rows || [];

  // ========== 3. PAGINA-ANALYSE ==========
  console.log('3. Pagina-analyse ophalen...');

  // Pagina's op clicks
  const pagesByClicks = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: ['page'],
      rowLimit: 200,
      orderBy: 'clicks',
    },
  });
  results.pagesByClicks = pagesByClicks.data.rows || [];

  // Pagina's op impressies
  const pagesByImpressions = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: ['page'],
      rowLimit: 200,
      orderBy: 'impressions',
    },
  });
  results.pagesByImpressions = pagesByImpressions.data.rows || [];

  // ========== 4. QUERY + PAGE COMBINATIE ==========
  console.log('4. Query + pagina combinatie ophalen...');

  const queryPage = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: ['query', 'page'],
      rowLimit: 1000,
      orderBy: 'impressions',
    },
  });
  results.queryPage = queryPage.data.rows || [];

  // ========== 5. DEVICE BREAKDOWN ==========
  console.log('5. Device breakdown ophalen...');

  const deviceBreakdown = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: ['device'],
      rowLimit: 10,
    },
  });
  results.deviceBreakdown = deviceBreakdown.data.rows || [];

  // ========== 6. COUNTRY BREAKDOWN ==========
  console.log('6. Country breakdown ophalen...');

  const countryBreakdown = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dimensions: ['country'],
      rowLimit: 20,
    },
  });
  results.countryBreakdown = countryBreakdown.data.rows || [];

  // ========== 7. INDEXERING & COVERAGE ==========
  console.log('7. Indexeringsstatus ophalen...');

  try {
    const sitemaps = await client.sitemaps.list({ siteUrl: SITE_URL });
    results.sitemaps = sitemaps.data.sitemap || [];
  } catch (e) {
    console.log('  Sitemaps niet beschikbaar:', e.message);
    results.sitemaps = [];
  }

  // Vergelijking 28d vs vorige 28d voor trend
  console.log('8. Trend vergelijking ophalen...');

  const previous28d = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: daysAgo(56),
      endDate: daysAgo(29),
      dimensions: [],
      rowLimit: 1,
    },
  });
  results.previous28d = previous28d.data.rows || [];

  // Save raw results
  const outputPath = path.join(__dirname, '..', 'analyse-gsc-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`GSC data opgeslagen in ${outputPath}`);

  return results;
}

main().catch(err => {
  console.error('Fout bij GSC analyse:', err.message);
  if (err.response) {
    console.error('Response data:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
