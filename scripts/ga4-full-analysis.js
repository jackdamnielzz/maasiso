/**
 * GA4 Full Analysis Report
 *
 * Pulls comprehensive data from Google Analytics 4 to analyze
 * traffic, engagement, conversions and ad performance.
 *
 * Run with: node scripts/ga4-full-analysis.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'secrets', 'google-service-account.json');
const GA4_PROPERTY = 'properties/467095380';

async function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics.edit',
    ],
  });
}

async function runReport(analyticsData, config) {
  try {
    const response = await analyticsData.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: config,
    });
    return response.data;
  } catch (error) {
    console.error(`Error running report: ${error.message}`);
    return null;
  }
}

function formatRows(data, dimNames, metricNames) {
  if (!data || !data.rows) return [];
  return data.rows.map(row => {
    const obj = {};
    row.dimensionValues?.forEach((val, i) => {
      obj[dimNames[i]] = val.value;
    });
    row.metricValues?.forEach((val, i) => {
      obj[metricNames[i]] = val.value;
    });
    return obj;
  });
}

function printTable(title, rows, columns) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(80)}`);
  if (!rows || rows.length === 0) {
    console.log('  (Geen data beschikbaar)');
    return;
  }

  // Calculate column widths
  const widths = {};
  columns.forEach(col => {
    widths[col] = Math.max(col.length, ...rows.map(r => String(r[col] || '').length));
  });

  // Header
  const header = columns.map(col => col.padEnd(widths[col])).join(' | ');
  console.log(`  ${header}`);
  console.log(`  ${columns.map(col => '-'.repeat(widths[col])).join('-+-')}`);

  // Rows
  rows.forEach(row => {
    const line = columns.map(col => String(row[col] || '').padEnd(widths[col])).join(' | ');
    console.log(`  ${line}`);
  });
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║           GA4 VOLLEDIGE ANALYSE - MAASISO.NL                    ║');
  console.log('║           Gegenereerd: ' + new Date().toLocaleString('nl-NL') + '                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  const auth = await getAuth();
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  // Define date ranges
  const last30Days = { startDate: '30daysAgo', endDate: 'today' };
  const last90Days = { startDate: '90daysAgo', endDate: 'today' };
  const last7Days = { startDate: '7daysAgo', endDate: 'today' };

  // ============================================================
  // 1. OVERALL TRAFFIC SUMMARY (last 30 days)
  // ============================================================
  const overallSummary = await runReport(analyticsData, {
    dateRanges: [last30Days],
    metrics: [
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'eventCount' },
    ],
  });

  if (overallSummary?.rows?.[0]) {
    const m = overallSummary.rows[0].metricValues;
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  1. OVERALL TRAFFIC OVERZICHT (Laatste 30 dagen)               ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log(`  Totaal gebruikers:        ${m[0].value}`);
    console.log(`  Nieuwe gebruikers:        ${m[1].value}`);
    console.log(`  Sessies:                  ${m[2].value}`);
    console.log(`  Pagina weergaven:         ${m[3].value}`);
    console.log(`  Engagement rate:          ${(parseFloat(m[4].value) * 100).toFixed(1)}%`);
    console.log(`  Gem. sessieduur:          ${parseFloat(m[5].value).toFixed(0)} sec`);
    console.log(`  Bounce rate:              ${(parseFloat(m[6].value) * 100).toFixed(1)}%`);
    console.log(`  Totaal events:            ${m[7].value}`);
  }

  // ============================================================
  // 2. TRAFFIC PER DAG (trend - last 30 days)
  // ============================================================
  const dailyTraffic = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
  });

  const dailyRows = formatRows(dailyTraffic, ['datum'], ['gebruikers', 'sessies', 'pageviews', 'bounceRate']);
  dailyRows.forEach(r => {
    r.datum = `${r.datum.slice(0,4)}-${r.datum.slice(4,6)}-${r.datum.slice(6,8)}`;
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
  });
  printTable('2. DAGELIJKS VERKEER (Laatste 30 dagen)', dailyRows, ['datum', 'gebruikers', 'sessies', 'pageviews', 'bounceRate']);

  // ============================================================
  // 3. TRAFFIC BRONNEN (Channel Grouping)
  // ============================================================
  const channelData = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });

  const channelRows = formatRows(channelData,
    ['kanaal'],
    ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']
  );
  channelRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
  });
  printTable('3. VERKEERSBRONNEN (Kanalen - Laatste 30 dagen)', channelRows,
    ['kanaal', 'gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']);

  // ============================================================
  // 4. SOURCE / MEDIUM DETAIL
  // ============================================================
  const sourceMedium = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20,
  });

  const smRows = formatRows(sourceMedium,
    ['bron', 'medium'],
    ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']
  );
  smRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
  });
  printTable('4. BRON / MEDIUM DETAIL (Top 20 - Laatste 30 dagen)', smRows,
    ['bron', 'medium', 'gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']);

  // ============================================================
  // 5. GOOGLE ADS SPECIFIEK (Paid Search)
  // ============================================================
  const paidSearch = await runReport(analyticsData, {
    dateRanges: [last90Days],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
      { name: 'sessionCampaignName' },
    ],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
    ],
    dimensionFilter: {
      orGroup: {
        expressions: [
          {
            filter: {
              fieldName: 'sessionMedium',
              stringFilter: { matchType: 'EXACT', value: 'cpc' }
            }
          },
          {
            filter: {
              fieldName: 'sessionMedium',
              stringFilter: { matchType: 'EXACT', value: 'ppc' }
            }
          },
          {
            filter: {
              fieldName: 'sessionMedium',
              stringFilter: { matchType: 'CONTAINS', value: 'paid' }
            }
          },
          {
            filter: {
              fieldName: 'sessionDefaultChannelGroup',
              stringFilter: { matchType: 'EXACT', value: 'Paid Search' }
            }
          }
        ]
      }
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });

  const paidRows = formatRows(paidSearch,
    ['bron', 'medium', 'campagne'],
    ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']
  );
  paidRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
  });
  printTable('5. GOOGLE ADS / BETAALD VERKEER (Laatste 90 dagen)', paidRows,
    ['bron', 'medium', 'campagne', 'gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']);

  // ============================================================
  // 6. LANDING PAGES PERFORMANCE
  // ============================================================
  const landingPages = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'landingPage' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20,
  });

  const lpRows = formatRows(landingPages,
    ['landing_page'],
    ['sessies', 'gebruikers', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']
  );
  lpRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
  });
  printTable('6. LANDING PAGES (Top 20 - Laatste 30 dagen)', lpRows,
    ['landing_page', 'sessies', 'gebruikers', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']);

  // ============================================================
  // 7. PAGINA PRESTATIES (meest bekeken)
  // ============================================================
  const pagePerf = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 25,
  });

  const pageRows = formatRows(pagePerf,
    ['pagina'],
    ['pageviews', 'gebruikers', 'engagementRate', 'gem_duur']
  );
  pageRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
  });
  printTable('7. MEEST BEKEKEN PAGINAS (Top 25 - Laatste 30 dagen)', pageRows,
    ['pagina', 'pageviews', 'gebruikers', 'engagementRate', 'gem_duur']);

  // ============================================================
  // 8. DEVICE BREAKDOWN
  // ============================================================
  const deviceData = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });

  const deviceRows = formatRows(deviceData,
    ['apparaat'],
    ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']
  );
  deviceRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
  });
  printTable('8. APPARAAT VERDELING (Laatste 30 dagen)', deviceRows,
    ['apparaat', 'gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']);

  // ============================================================
  // 9. GEO DATA (Steden)
  // ============================================================
  const geoData = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [
      { name: 'country' },
      { name: 'city' },
    ],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'country',
        stringFilter: { matchType: 'EXACT', value: 'Netherlands' }
      }
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 15,
  });

  const geoRows = formatRows(geoData,
    ['land', 'stad'],
    ['gebruikers', 'sessies', 'engagementRate']
  );
  geoRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
  });
  printTable('9. LOCATIE VERDELING - NEDERLAND (Top 15 steden)', geoRows,
    ['stad', 'gebruikers', 'sessies', 'engagementRate']);

  // ============================================================
  // 10. EVENTS (alle events)
  // ============================================================
  const eventData = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'eventName' }],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' },
    ],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 25,
  });

  const eventRows = formatRows(eventData,
    ['event'],
    ['aantal', 'gebruikers']
  );
  printTable('10. EVENTS OVERZICHT (Laatste 30 dagen)', eventRows,
    ['event', 'aantal', 'gebruikers']);

  // ============================================================
  // 11. FORM SUBMISSIONS / CONVERSIONS CHECK
  // ============================================================
  const formEvents = await runReport(analyticsData, {
    dateRanges: [last90Days],
    dimensions: [
      { name: 'eventName' },
      { name: 'date' },
    ],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' },
    ],
    dimensionFilter: {
      orGroup: {
        expressions: [
          {
            filter: {
              fieldName: 'eventName',
              stringFilter: { matchType: 'CONTAINS', value: 'form' }
            }
          },
          {
            filter: {
              fieldName: 'eventName',
              stringFilter: { matchType: 'CONTAINS', value: 'submit' }
            }
          },
          {
            filter: {
              fieldName: 'eventName',
              stringFilter: { matchType: 'CONTAINS', value: 'contact' }
            }
          },
          {
            filter: {
              fieldName: 'eventName',
              stringFilter: { matchType: 'CONTAINS', value: 'lead' }
            }
          },
        ]
      }
    },
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: true }],
  });

  const formRows = formatRows(formEvents,
    ['event', 'datum'],
    ['aantal', 'gebruikers']
  );
  formRows.forEach(r => {
    r.datum = `${r.datum.slice(0,4)}-${r.datum.slice(4,6)}-${r.datum.slice(6,8)}`;
  });
  printTable('11. FORMULIER / CONVERSIE EVENTS (Laatste 90 dagen)', formRows,
    ['event', 'datum', 'aantal', 'gebruikers']);

  // ============================================================
  // 12. NEW vs RETURNING USERS
  // ============================================================
  const newVsReturn = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'newVsReturning' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });

  const nvrRows = formatRows(newVsReturn,
    ['type'],
    ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']
  );
  nvrRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
  });
  printTable('12. NIEUW vs TERUGKEREND (Laatste 30 dagen)', nvrRows,
    ['type', 'gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']);

  // ============================================================
  // 13. PAID SEARCH LANDING PAGES (Google Ads specific)
  // ============================================================
  const paidLandingPages = await runReport(analyticsData, {
    dateRanges: [last90Days],
    dimensions: [
      { name: 'landingPage' },
      { name: 'sessionCampaignName' },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { matchType: 'EXACT', value: 'Paid Search' }
      }
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20,
  });

  const paidLPRows = formatRows(paidLandingPages,
    ['landing_page', 'campagne'],
    ['sessies', 'gebruikers', 'engagementRate', 'bounceRate', 'gem_duur']
  );
  paidLPRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
  });
  printTable('13. BETAALD VERKEER - LANDING PAGES (Laatste 90 dagen)', paidLPRows,
    ['landing_page', 'campagne', 'sessies', 'gebruikers', 'engagementRate', 'bounceRate', 'gem_duur']);

  // ============================================================
  // 14. WEEK-OVER-WEEK COMPARISON
  // ============================================================
  const weekComparison = await runReport(analyticsData, {
    dateRanges: [
      { startDate: '7daysAgo', endDate: 'today' },
      { startDate: '14daysAgo', endDate: '8daysAgo' },
    ],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'screenPageViews' },
    ],
  });

  if (weekComparison?.rows) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('  14. WEEK-OVER-WEEK VERGELIJKING');
    console.log(`${'='.repeat(80)}`);

    const current = weekComparison.rows[0]?.metricValues || [];
    const previous = weekComparison.rows[1]?.metricValues || [];

    if (current.length && previous.length) {
      const metrics = ['Gebruikers', 'Sessies', 'Engagement Rate', 'Bounce Rate', 'Pageviews'];
      metrics.forEach((name, i) => {
        const curr = parseFloat(current[i]?.value || 0);
        const prev = parseFloat(previous[i]?.value || 0);
        const isRate = name.includes('Rate');
        const currDisplay = isRate ? (curr * 100).toFixed(1) + '%' : curr.toFixed(0);
        const prevDisplay = isRate ? (prev * 100).toFixed(1) + '%' : prev.toFixed(0);
        const change = prev > 0 ? ((curr - prev) / prev * 100).toFixed(1) : 'N/A';
        const arrow = curr > prev ? '↑' : curr < prev ? '↓' : '→';
        console.log(`  ${name.padEnd(20)} Deze week: ${currDisplay.padEnd(10)} Vorige week: ${prevDisplay.padEnd(10)} ${arrow} ${change}%`);
      });
    }
  }

  // ============================================================
  // 15. GOOGLE ADS SEARCH TERMS (if available via utm params)
  // ============================================================
  const searchTerms = await runReport(analyticsData, {
    dateRanges: [last90Days],
    dimensions: [
      { name: 'sessionGoogleAdsKeyword' },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
    ],
    dimensionFilter: {
      notExpression: {
        filter: {
          fieldName: 'sessionGoogleAdsKeyword',
          stringFilter: { matchType: 'EXACT', value: '(not set)' }
        }
      }
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20,
  });

  const stRows = formatRows(searchTerms,
    ['zoekwoord'],
    ['sessies', 'gebruikers', 'engagementRate', 'bounceRate']
  );
  stRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.bounceRate = (parseFloat(r.bounceRate) * 100).toFixed(1) + '%';
  });
  printTable('15. GOOGLE ADS ZOEKWOORDEN (Laatste 90 dagen)', stRows,
    ['zoekwoord', 'sessies', 'gebruikers', 'engagementRate', 'bounceRate']);

  // ============================================================
  // 16. USER ENGAGEMENT FLOW (pages per session by source)
  // ============================================================
  const engagementBySource = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });

  const engRows = formatRows(engagementBySource,
    ['kanaal'],
    ['sessies', 'pageviews', 'engaged_sessies', 'engagementRate', 'gem_duur']
  );
  engRows.forEach(r => {
    r.engagementRate = (parseFloat(r.engagementRate) * 100).toFixed(1) + '%';
    r.gem_duur = parseFloat(r.gem_duur).toFixed(0) + 's';
    r.pag_per_sessie = (parseInt(r.pageviews) / Math.max(parseInt(r.sessies), 1)).toFixed(1);
  });
  printTable('16. ENGAGEMENT PER KANAAL (Laatste 30 dagen)', engRows,
    ['kanaal', 'sessies', 'engaged_sessies', 'pag_per_sessie', 'engagementRate', 'gem_duur']);

  // ============================================================
  // 17. HOURLY PATTERN (when do users visit)
  // ============================================================
  const hourlyData = await runReport(analyticsData, {
    dateRanges: [last30Days],
    dimensions: [{ name: 'hour' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
    ],
    orderBys: [{ dimension: { dimensionName: 'hour' }, desc: false }],
  });

  const hourRows = formatRows(hourlyData,
    ['uur'],
    ['sessies', 'gebruikers']
  );
  hourRows.forEach(r => {
    r.uur = r.uur.padStart(2, '0') + ':00';
  });
  printTable('17. BEZOEKPATROON PER UUR (Laatste 30 dagen)', hourRows,
    ['uur', 'sessies', 'gebruikers']);

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                    RAPPORT VOLTOOID                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
