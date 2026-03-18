/**
 * GA4 Analyse Script voor MaasISO
 * Haalt uitgebreide analytics data op via de GA4 Data API
 */
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const PROPERTY_ID = '467095380';
const CREDENTIALS_PATH = path.join(__dirname, '..', 'secrets', 'google-service-account.json');

async function getAnalyticsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  const authClient = await auth.getClient();
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth: authClient });
  return analyticsData;
}

async function runReport(client, params) {
  const res = await client.properties.runReport({
    property: `properties/${PROPERTY_ID}`,
    requestBody: params,
  });
  return res.data;
}

function parseRows(data, dimCount = 1) {
  if (!data.rows) return [];
  return data.rows.map(row => {
    const dims = row.dimensionValues ? row.dimensionValues.map(d => d.value) : [];
    const metrics = row.metricValues ? row.metricValues.map(m => m.value) : [];
    return { dims, metrics };
  });
}

function formatNumber(n) {
  return Number(n).toLocaleString('nl-NL');
}

function formatPct(n) {
  return (Number(n) * 100).toFixed(1) + '%';
}

function formatDuration(seconds) {
  const s = Math.round(Number(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

async function main() {
  console.log('Verbinding maken met GA4...');
  const client = await getAnalyticsClient();
  const results = {};

  // ========== 1. VERKEER & TRENDS ==========
  console.log('1. Verkeer & trends ophalen...');

  // 1a. Overzicht 30 dagen
  const overview30d = await runReport(client, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViewsPerSession' },
      { name: 'bounceRate' },
      { name: 'screenPageViews' },
    ],
  });
  results.overview30d = parseRows(overview30d);

  // 1b. Overzicht 90 dagen
  const overview90d = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViewsPerSession' },
      { name: 'bounceRate' },
      { name: 'screenPageViews' },
    ],
  });
  results.overview90d = parseRows(overview90d);

  // 1c. Dagelijkse trend (90 dagen)
  const dailyTrend = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });
  results.dailyTrend = parseRows(dailyTrend);

  // 1d. Verkeersbronnen
  const trafficSources = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'keyEvents' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  results.trafficSources = parseRows(trafficSources);

  // 1e. Dag van de week
  const dayOfWeek = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'dayOfWeekName' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagementRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  results.dayOfWeek = parseRows(dayOfWeek);

  // 1f. Uur van de dag
  const hourOfDay = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'hour' }],
    metrics: [
      { name: 'sessions' },
    ],
    orderBys: [{ dimension: { dimensionName: 'hour' } }],
  });
  results.hourOfDay = parseRows(hourOfDay);

  // 1g. Geografisch (steden)
  const cities = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'city' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 25,
  });
  results.cities = parseRows(cities);

  // 1h. Devices
  const devices = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  results.devices = parseRows(devices);

  // ========== 2. PAGINA-PRESTATIES ==========
  console.log('2. Pagina-prestaties ophalen...');

  // 2a. Top pagina's
  const topPages = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 30,
  });
  results.topPages = parseRows(topPages);

  // 2b. Landing pages
  const landingPages = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'landingPagePlusQueryString' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'keyEvents' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 30,
  });
  results.landingPages = parseRows(landingPages);

  // 2c. Slechtst presterende pagina's (hoog bounce, minimaal 10 sessies)
  const worstPages = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'bounceRate' }, desc: true }],
    limit: 50,
  });
  results.worstPages = parseRows(worstPages);

  // ========== 3. BLOG ANALYSE ==========
  console.log('3. Blog analyse ophalen...');

  // 3a. Blog pagina's prestaties
  const blogPages = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'totalUsers' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: {
          matchType: 'BEGINS_WITH',
          value: '/blog',
        },
      },
    },
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 50,
  });
  results.blogPages = parseRows(blogPages);

  // 3b. Blog traffic per maand (trend)
  const blogMonthly = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'yearMonth' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'totalUsers' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: {
          matchType: 'BEGINS_WITH',
          value: '/blog',
        },
      },
    },
    orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
  });
  results.blogMonthly = parseRows(blogMonthly);

  // ========== 4. CONVERSIES ==========
  console.log('4. Conversies ophalen...');

  // 4a. Events overzicht
  const events = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' },
    ],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 30,
  });
  results.events = parseRows(events);

  // 4b. Conversies per verkeersbron
  const conversionsBySource = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'keyEvents' },
    ],
    orderBys: [{ metric: { metricName: 'keyEvents' }, desc: true }],
  });
  results.conversionsBySource = parseRows(conversionsBySource);

  // 4c. Conversies per landing page
  const conversionsByLanding = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'landingPagePlusQueryString' }],
    metrics: [
      { name: 'sessions' },
      { name: 'keyEvents' },
      { name: 'engagementRate' },
    ],
    orderBys: [{ metric: { metricName: 'keyEvents' }, desc: true }],
    limit: 20,
  });
  results.conversionsByLanding = parseRows(conversionsByLanding);

  // ========== 5. GEBRUIKERSGEDRAG ==========
  console.log('5. Gebruikersgedrag ophalen...');

  // 5a. Engagement per bron
  const engagementBySource = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'engagedSessions' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViewsPerSession' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  results.engagementBySource = parseRows(engagementBySource);

  // 5b. Nieuwe vs terugkerende
  const newVsReturning = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'newVsReturning' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'keyEvents' },
    ],
  });
  results.newVsReturning = parseRows(newVsReturning);

  // 5c. Source/medium detail
  const sourceMedium = await runReport(client, {
    dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionSourceMedium' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'keyEvents' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20,
  });
  results.sourceMedium = parseRows(sourceMedium);

  // Save raw results
  const outputPath = path.join(__dirname, '..', 'analyse-ga4-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`GA4 data opgeslagen in ${outputPath}`);

  return results;
}

main().catch(err => {
  console.error('Fout bij GA4 analyse:', err.message);
  if (err.response) {
    console.error('Response data:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
