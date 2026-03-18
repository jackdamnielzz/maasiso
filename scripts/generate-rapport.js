/**
 * Rapport Generator voor MaasISO Website Analyse
 * Combineert GA4 en GSC data tot een uitgebreid Nederlands rapport
 */
const fs = require('fs');
const path = require('path');

const ga4Data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'analyse-ga4-data.json'), 'utf-8'));
const gscData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'analyse-gsc-data.json'), 'utf-8'));

function fmt(n) { return Number(n).toLocaleString('nl-NL'); }
function pct(n) { return (Number(n) * 100).toFixed(1) + '%'; }
function dur(s) {
  const sec = Math.round(Number(s));
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec/60)}m ${sec%60}s`;
}
function round2(n) { return Number(n).toFixed(2); }

let report = '';
function w(line = '') { report += line + '\n'; }
function h1(t) { w(`\n${'='.repeat(70)}`); w(`  ${t}`); w('='.repeat(70)); w(); }
function h2(t) { w(`\n--- ${t} ---`); w(); }
function table(headers, rows) {
  // Simple text table
  const widths = headers.map((h, i) => {
    const maxData = rows.reduce((max, r) => Math.max(max, String(r[i] || '').length), 0);
    return Math.max(h.length, maxData) + 2;
  });
  w(headers.map((h, i) => h.padEnd(widths[i])).join('| '));
  w(widths.map(w => '-'.repeat(w)).join('+-'));
  rows.forEach(row => {
    w(row.map((c, i) => String(c || '').padEnd(widths[i])).join('| '));
  });
  w();
}

// ============================================================
// HEADER
// ============================================================
w('╔══════════════════════════════════════════════════════════════════════╗');
w('║         MAASISO.NL — VOLLEDIGE WEBSITE ANALYSE RAPPORT            ║');
w('║                    Datum: 8 maart 2026                             ║');
w('║          Periode: afgelopen 90 dagen (tenzij anders vermeld)       ║');
w('╚══════════════════════════════════════════════════════════════════════╝');
w();

// ============================================================
// DEEL A: GOOGLE ANALYTICS 4
// ============================================================
h1('DEEL A: GOOGLE ANALYTICS 4 — DIEPTE-ANALYSE');

// --- 1. VERKEER & TRENDS ---
h2('A1. VERKEER & TRENDS');

// Overzicht 30d
w('▸ OVERZICHT LAATSTE 30 DAGEN:');
if (ga4Data.overview30d && ga4Data.overview30d[0]) {
  const m = ga4Data.overview30d[0].metrics;
  w(`  Sessies:                  ${fmt(m[0])}`);
  w(`  Gebruikers:               ${fmt(m[1])}`);
  w(`  Nieuwe gebruikers:        ${fmt(m[2])}`);
  w(`  Engagement rate:          ${pct(m[3])}`);
  w(`  Gem. sessieduur:          ${dur(m[4])}`);
  w(`  Pagina's/sessie:          ${round2(m[5])}`);
  w(`  Bounce rate:              ${pct(m[6])}`);
  w(`  Paginaweergaven:          ${fmt(m[7])}`);
}
w();

// Overzicht 90d
w('▸ OVERZICHT LAATSTE 90 DAGEN:');
if (ga4Data.overview90d && ga4Data.overview90d[0]) {
  const m = ga4Data.overview90d[0].metrics;
  w(`  Sessies:                  ${fmt(m[0])}`);
  w(`  Gebruikers:               ${fmt(m[1])}`);
  w(`  Nieuwe gebruikers:        ${fmt(m[2])}`);
  w(`  Engagement rate:          ${pct(m[3])}`);
  w(`  Gem. sessieduur:          ${dur(m[4])}`);
  w(`  Pagina's/sessie:          ${round2(m[5])}`);
  w(`  Bounce rate:              ${pct(m[6])}`);
  w(`  Paginaweergaven:          ${fmt(m[7])}`);
}
w();

// Verkeersbronnen
w('▸ VERKEERSBRONNEN (90 dagen):');
if (ga4Data.trafficSources) {
  table(
    ['Kanaal', 'Sessies', 'Gebruikers', 'Engagement', 'Gem. duur', 'Bounce', 'Key Events'],
    ga4Data.trafficSources.map(r => [
      r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), dur(r.metrics[3]), pct(r.metrics[4]), fmt(r.metrics[5])
    ])
  );
}

// Dag van de week
w('▸ SESSIES PER DAG VAN DE WEEK:');
if (ga4Data.dayOfWeek) {
  table(
    ['Dag', 'Sessies', 'Engagement'],
    ga4Data.dayOfWeek.map(r => [r.dims[0], fmt(r.metrics[0]), pct(r.metrics[1])])
  );
}

// Uur van de dag
w('▸ PIEKUREN (top 5):');
if (ga4Data.hourOfDay) {
  const sorted = [...ga4Data.hourOfDay].sort((a, b) => Number(b.metrics[0]) - Number(a.metrics[0]));
  table(
    ['Uur', 'Sessies'],
    sorted.slice(0, 8).map(r => [r.dims[0] + ':00', fmt(r.metrics[0])])
  );
}

// Geografisch
w('▸ TOP STEDEN (90 dagen):');
if (ga4Data.cities) {
  table(
    ['Stad', 'Sessies', 'Gebruikers', 'Engagement'],
    ga4Data.cities.slice(0, 15).map(r => [
      r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1]), pct(r.metrics[2])
    ])
  );
}

// Devices
w('▸ APPARATEN:');
if (ga4Data.devices) {
  table(
    ['Apparaat', 'Sessies', 'Gebruikers', 'Engagement', 'Gem. duur', 'Bounce'],
    ga4Data.devices.map(r => [
      r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), dur(r.metrics[3]), pct(r.metrics[4])
    ])
  );
}

// --- 2. PAGINA-PRESTATIES ---
h2('A2. PAGINA-PRESTATIES');

w('▸ TOP 20 PAGINA\'S OP PAGINAWEERGAVEN:');
if (ga4Data.topPages) {
  table(
    ['Pagina', 'Weergaven', 'Sessies', 'Engagement', 'Gem. duur', 'Bounce'],
    ga4Data.topPages.slice(0, 20).map(r => [
      r.dims[0].substring(0, 50), fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), dur(r.metrics[3]), pct(r.metrics[4])
    ])
  );
}

w('▸ TOP LANDING PAGES:');
if (ga4Data.landingPages) {
  table(
    ['Landing page', 'Sessies', 'Gebruikers', 'Engagement', 'Bounce', 'Key Events'],
    ga4Data.landingPages.slice(0, 20).map(r => [
      r.dims[0].substring(0, 50), fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), pct(r.metrics[3]), fmt(r.metrics[5])
    ])
  );
}

w('▸ SLECHTST PRESTERENDE PAGINA\'S (hoog bounce, min 5 weergaven):');
if (ga4Data.worstPages) {
  const filtered = ga4Data.worstPages.filter(r => Number(r.metrics[0]) >= 5);
  table(
    ['Pagina', 'Weergaven', 'Bounce', 'Engagement', 'Gem. duur'],
    filtered.slice(0, 15).map(r => [
      r.dims[0].substring(0, 50), fmt(r.metrics[0]),
      pct(r.metrics[1]), pct(r.metrics[2]), dur(r.metrics[3])
    ])
  );
}

// --- 3. BLOG ANALYSE ---
h2('A3. CONTENT & BLOG ANALYSE');

w('▸ BLOG PAGINA\'S PRESTATIES:');
if (ga4Data.blogPages && ga4Data.blogPages.length > 0) {
  table(
    ['Blog pagina', 'Weergaven', 'Sessies', 'Engagement', 'Gem. duur', 'Bounce'],
    ga4Data.blogPages.slice(0, 25).map(r => [
      r.dims[0].substring(0, 55), fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), dur(r.metrics[3]), pct(r.metrics[4])
    ])
  );
} else {
  w('  Geen blog data gevonden in de afgelopen 90 dagen.');
}

w('▸ BLOG TRAFFIC PER MAAND:');
if (ga4Data.blogMonthly && ga4Data.blogMonthly.length > 0) {
  table(
    ['Maand', 'Weergaven', 'Sessies', 'Gebruikers'],
    ga4Data.blogMonthly.map(r => [r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1]), fmt(r.metrics[2])])
  );
} else {
  w('  Geen blog maanddata gevonden.');
}

// --- 4. CONVERSIES ---
h2('A4. CONVERSIES & FORMULIER');

w('▸ EVENTS OVERZICHT (top 20):');
if (ga4Data.events) {
  table(
    ['Event', 'Aantal', 'Gebruikers'],
    ga4Data.events.slice(0, 20).map(r => [r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1])])
  );
}

w('▸ KEY EVENTS PER VERKEERSBRON:');
if (ga4Data.conversionsBySource) {
  const totalSessions = ga4Data.conversionsBySource.reduce((s, r) => s + Number(r.metrics[0]), 0);
  table(
    ['Kanaal', 'Sessies', 'Key Events', 'Conversieratio'],
    ga4Data.conversionsBySource.map(r => {
      const sessions = Number(r.metrics[0]);
      const conversions = Number(r.metrics[1]);
      const rate = sessions > 0 ? ((conversions / sessions) * 100).toFixed(1) + '%' : '0%';
      return [r.dims[0], fmt(sessions), fmt(conversions), rate];
    })
  );
}

w('▸ KEY EVENTS PER LANDING PAGE:');
if (ga4Data.conversionsByLanding) {
  table(
    ['Landing page', 'Sessies', 'Key Events', 'Conversieratio'],
    ga4Data.conversionsByLanding.slice(0, 15).map(r => {
      const sessions = Number(r.metrics[0]);
      const conversions = Number(r.metrics[1]);
      const rate = sessions > 0 ? ((conversions / sessions) * 100).toFixed(1) + '%' : '0%';
      return [r.dims[0].substring(0, 50), fmt(sessions), fmt(conversions), rate];
    })
  );
}

// --- 5. GEBRUIKERSGEDRAG ---
h2('A5. GEBRUIKERSGEDRAG');

w('▸ NIEUWE VS TERUGKERENDE BEZOEKERS:');
if (ga4Data.newVsReturning) {
  table(
    ['Type', 'Sessies', 'Gebruikers', 'Engagement', 'Gem. duur', 'Bounce', 'Key Events'],
    ga4Data.newVsReturning.map(r => [
      r.dims[0] === 'new' ? 'Nieuw' : r.dims[0] === 'returning' ? 'Terugkerend' : r.dims[0],
      fmt(r.metrics[0]), fmt(r.metrics[1]), pct(r.metrics[2]),
      dur(r.metrics[3]), pct(r.metrics[4]), fmt(r.metrics[5])
    ])
  );
}

w('▸ ENGAGEMENT PER VERKEERSBRON:');
if (ga4Data.engagementBySource) {
  table(
    ['Kanaal', 'Sessies', 'Engagement', 'Engaged sess.', 'Gem. duur', 'Pag/sessie'],
    ga4Data.engagementBySource.map(r => [
      r.dims[0], fmt(r.metrics[0]), pct(r.metrics[1]),
      fmt(r.metrics[2]), dur(r.metrics[3]), round2(r.metrics[4])
    ])
  );
}

w('▸ TOP BRON/MEDIUM:');
if (ga4Data.sourceMedium) {
  table(
    ['Bron / Medium', 'Sessies', 'Gebruikers', 'Engagement', 'Bounce', 'Key Events'],
    ga4Data.sourceMedium.slice(0, 15).map(r => [
      r.dims[0].substring(0, 35), fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), pct(r.metrics[3]), fmt(r.metrics[4])
    ])
  );
}

// ============================================================
// DEEL B: GOOGLE SEARCH CONSOLE
// ============================================================
h1('DEEL B: GOOGLE SEARCH CONSOLE — SEO ANALYSE');

// --- 1. ZOEKPRESTATIES OVERZICHT ---
h2('B1. ZOEKPRESTATIES OVERZICHT');

w('▸ LAATSTE 28 DAGEN:');
if (gscData.overview28d && gscData.overview28d[0]) {
  const r = gscData.overview28d[0];
  w(`  Clicks:                   ${fmt(r.clicks)}`);
  w(`  Impressies:               ${fmt(r.impressions)}`);
  w(`  CTR:                      ${(r.ctr * 100).toFixed(1)}%`);
  w(`  Gemiddelde positie:       ${r.position.toFixed(1)}`);
}
w();

w('▸ LAATSTE 90 DAGEN:');
if (gscData.overview90d && gscData.overview90d[0]) {
  const r = gscData.overview90d[0];
  w(`  Clicks:                   ${fmt(r.clicks)}`);
  w(`  Impressies:               ${fmt(r.impressions)}`);
  w(`  CTR:                      ${(r.ctr * 100).toFixed(1)}%`);
  w(`  Gemiddelde positie:       ${r.position.toFixed(1)}`);
}
w();

// Trend vergelijking
w('▸ TREND (28d vs vorige 28d):');
if (gscData.overview28d?.[0] && gscData.previous28d?.[0]) {
  const curr = gscData.overview28d[0];
  const prev = gscData.previous28d[0];
  const clickChange = ((curr.clicks - prev.clicks) / (prev.clicks || 1) * 100).toFixed(1);
  const imprChange = ((curr.impressions - prev.impressions) / (prev.impressions || 1) * 100).toFixed(1);
  const ctrChange = ((curr.ctr - prev.ctr) * 100).toFixed(2);
  const posChange = (curr.position - prev.position).toFixed(1);
  w(`  Clicks:      ${curr.clicks} vs ${prev.clicks} (${clickChange > 0 ? '+' : ''}${clickChange}%)`);
  w(`  Impressies:  ${curr.impressions} vs ${prev.impressions} (${imprChange > 0 ? '+' : ''}${imprChange}%)`);
  w(`  CTR:         ${(curr.ctr*100).toFixed(1)}% vs ${(prev.ctr*100).toFixed(1)}% (${ctrChange > 0 ? '+' : ''}${ctrChange}pp)`);
  w(`  Positie:     ${curr.position.toFixed(1)} vs ${prev.position.toFixed(1)} (${posChange > 0 ? '+' : ''}${posChange})`);
}
w();

// --- 2. KEYWORD ANALYSE ---
h2('B2. KEYWORD ANALYSE');

w('▸ TOP 50 ZOEKWOORDEN OP CLICKS:');
if (gscData.keywordsByClicks) {
  table(
    ['Zoekwoord', 'Clicks', 'Impressies', 'CTR', 'Positie'],
    gscData.keywordsByClicks.slice(0, 50).map(r => [
      r.keys[0].substring(0, 45), fmt(r.clicks), fmt(r.impressions),
      (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ])
  );
}

// Quick wins: veel impressies, lage CTR
w('▸ QUICK WINS — Veel impressies, lage CTR (<3%):');
if (gscData.keywordsByImpressions) {
  const quickWins = gscData.keywordsByImpressions
    .filter(r => r.impressions >= 20 && r.ctr < 0.03 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions);
  table(
    ['Zoekwoord', 'Impressies', 'Clicks', 'CTR', 'Positie'],
    quickWins.slice(0, 25).map(r => [
      r.keys[0].substring(0, 45), fmt(r.impressions), fmt(r.clicks),
      (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ])
  );
}

// Bijna pagina 1 / bijna top 3
w('▸ BIJNA TOP 3 — Positie 4-10 (kans om te stijgen):');
if (gscData.keywordsByClicks) {
  const nearTop = gscData.keywordsByClicks
    .filter(r => r.position >= 4 && r.position <= 10 && r.impressions >= 10)
    .sort((a, b) => a.position - b.position);
  table(
    ['Zoekwoord', 'Positie', 'Clicks', 'Impressies', 'CTR'],
    nearTop.slice(0, 20).map(r => [
      r.keys[0].substring(0, 45), r.position.toFixed(1), fmt(r.clicks),
      fmt(r.impressions), (r.ctr * 100).toFixed(1) + '%'
    ])
  );
}

w('▸ BIJNA PAGINA 1 — Positie 11-20:');
if (gscData.keywordsByImpressions) {
  const nearPage1 = gscData.keywordsByImpressions
    .filter(r => r.position >= 11 && r.position <= 20 && r.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions);
  table(
    ['Zoekwoord', 'Positie', 'Impressies', 'Clicks', 'CTR'],
    nearPage1.slice(0, 20).map(r => [
      r.keys[0].substring(0, 45), r.position.toFixed(1), fmt(r.impressions),
      fmt(r.clicks), (r.ctr * 100).toFixed(1) + '%'
    ])
  );
}

// Hoge CTR (wat werkt)
w('▸ HOGE CTR ZOEKWOORDEN (>10%, min 5 clicks):');
if (gscData.keywordsByClicks) {
  const highCTR = gscData.keywordsByClicks
    .filter(r => r.ctr > 0.10 && r.clicks >= 5)
    .sort((a, b) => b.ctr - a.ctr);
  table(
    ['Zoekwoord', 'CTR', 'Clicks', 'Impressies', 'Positie'],
    highCTR.slice(0, 20).map(r => [
      r.keys[0].substring(0, 45), (r.ctr * 100).toFixed(1) + '%',
      fmt(r.clicks), fmt(r.impressions), r.position.toFixed(1)
    ])
  );
}

// Keyword clusters
w('▸ ZOEKWOORDEN GEGROEPEERD PER THEMA:');
const themeKeywords = {
  'ISO 9001': [], 'ISO 27001': [], 'ISO 14001': [], 'ISO 45001': [],
  'ISO certificering (algemeen)': [], 'Audit': [], 'Risico': [],
  'AVG/Privacy': [], 'ISMS': [], 'BIO': [], 'MKB': [], 'Overig': []
};
if (gscData.keywordsByClicks) {
  gscData.keywordsByClicks.forEach(r => {
    const q = r.keys[0].toLowerCase();
    if (q.includes('9001')) themeKeywords['ISO 9001'].push(r);
    else if (q.includes('27001') || q.includes('informatiebeveiliging')) themeKeywords['ISO 27001'].push(r);
    else if (q.includes('14001') || q.includes('milieu')) themeKeywords['ISO 14001'].push(r);
    else if (q.includes('45001') || q.includes('arbo') || q.includes('veiligheid')) themeKeywords['ISO 45001'].push(r);
    else if (q.includes('audit')) themeKeywords['Audit'].push(r);
    else if (q.includes('risico')) themeKeywords['Risico'].push(r);
    else if (q.includes('avg') || q.includes('privacy') || q.includes('gdpr')) themeKeywords['AVG/Privacy'].push(r);
    else if (q.includes('isms')) themeKeywords['ISMS'].push(r);
    else if (q.includes('bio')) themeKeywords['BIO'].push(r);
    else if (q.includes('mkb')) themeKeywords['MKB'].push(r);
    else if (q.includes('iso') || q.includes('certificer') || q.includes('norm')) themeKeywords['ISO certificering (algemeen)'].push(r);
    else themeKeywords['Overig'].push(r);
  });

  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    if (keywords.length === 0) return;
    const totalClicks = keywords.reduce((s, r) => s + r.clicks, 0);
    const totalImpr = keywords.reduce((s, r) => s + r.impressions, 0);
    w(`  ${theme}: ${keywords.length} zoekwoorden, ${totalClicks} clicks, ${fmt(totalImpr)} impressies`);
    keywords.slice(0, 5).forEach(r => {
      w(`    - "${r.keys[0]}" (clicks: ${r.clicks}, pos: ${r.position.toFixed(1)})`);
    });
  });
}
w();

// --- 3. PAGINA-ANALYSE VANUIT SEARCH ---
h2('B3. PAGINA-ANALYSE VANUIT SEARCH');

w('▸ TOP PAGINA\'S OP ORGANISCHE CLICKS:');
if (gscData.pagesByClicks) {
  table(
    ['Pagina', 'Clicks', 'Impressies', 'CTR', 'Positie'],
    gscData.pagesByClicks.slice(0, 25).map(r => [
      r.keys[0].replace('https://www.maasiso.nl', '').substring(0, 55) || '/',
      fmt(r.clicks), fmt(r.impressions), (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ])
  );
}

w('▸ PAGINA\'S MET VEEL IMPRESSIES MAAR WEINIG CLICKS (CTR-optimalisatie):');
if (gscData.pagesByImpressions) {
  const lowCTRPages = gscData.pagesByImpressions
    .filter(r => r.impressions >= 50 && r.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions);
  table(
    ['Pagina', 'Impressies', 'Clicks', 'CTR', 'Positie'],
    lowCTRPages.slice(0, 15).map(r => [
      r.keys[0].replace('https://www.maasiso.nl', '').substring(0, 55) || '/',
      fmt(r.impressions), fmt(r.clicks), (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ])
  );
}

// --- 4. CONTENT GAP ANALYSE ---
h2('B4. CONTENT GAP ANALYSE');

w('▸ ZOEKWOORDEN ZONDER DEDICATED CONTENT:');
w('  (Zoekwoorden met impressies waar geen specifieke pagina voor bestaat)');
w();

// Analyze query+page combinations to find gaps
if (gscData.queryPage) {
  const pagesByQuery = {};
  gscData.queryPage.forEach(r => {
    const query = r.keys[0];
    const page = r.keys[1].replace('https://www.maasiso.nl', '');
    if (!pagesByQuery[query]) pagesByQuery[query] = [];
    pagesByQuery[query].push({ page, clicks: r.clicks, impressions: r.impressions, position: r.position });
  });

  // Find queries landing on homepage or generic pages (not dedicated content)
  const gaps = [];
  Object.entries(pagesByQuery).forEach(([query, pages]) => {
    const totalImpr = pages.reduce((s, p) => s + p.impressions, 0);
    const bestPage = pages.sort((a, b) => b.clicks - a.clicks)[0];
    if (totalImpr >= 10 && (bestPage.page === '/' || bestPage.page === '' || bestPage.page === '/diensten')) {
      gaps.push({ query, impressions: totalImpr, bestPage: bestPage.page, position: bestPage.position });
    }
  });

  gaps.sort((a, b) => b.impressions - a.impressions);
  table(
    ['Zoekwoord', 'Impressies', 'Huidige pagina', 'Positie'],
    gaps.slice(0, 20).map(r => [
      r.query.substring(0, 45), fmt(r.impressions), r.bestPage || '/', r.position.toFixed(1)
    ])
  );
}

// Device breakdown GSC
h2('B5. DEVICE & LAND BREAKDOWN (GSC)');

w('▸ APPARATEN (zoekverkeer):');
if (gscData.deviceBreakdown) {
  table(
    ['Apparaat', 'Clicks', 'Impressies', 'CTR', 'Positie'],
    gscData.deviceBreakdown.map(r => [
      r.keys[0], fmt(r.clicks), fmt(r.impressions),
      (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ])
  );
}

w('▸ LANDEN:');
if (gscData.countryBreakdown) {
  table(
    ['Land', 'Clicks', 'Impressies', 'CTR', 'Positie'],
    gscData.countryBreakdown.slice(0, 10).map(r => [
      r.keys[0], fmt(r.clicks), fmt(r.impressions),
      (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ])
  );
}

// ============================================================
// DEEL C: GECOMBINEERDE INZICHTEN & AANBEVELINGEN
// ============================================================
h1('DEEL C: GECOMBINEERDE INZICHTEN & AANBEVELINGEN');

h2('C1. CONTENT STRATEGIE AANBEVELINGEN');

w('Op basis van de data hierboven, hier de concrete aanbevelingen:');
w();

// Analyze which ISO topics have the most search demand
w('▸ BLOGPOST-IDEEEN OP BASIS VAN ZOEKDATA:');
w();

// Find keyword themes with high impressions but low/no dedicated content
const isoTopics = {
  'ISO 9001': { keywords: [], totalImpr: 0, totalClicks: 0 },
  'ISO 27001': { keywords: [], totalImpr: 0, totalClicks: 0 },
  'ISO 14001': { keywords: [], totalImpr: 0, totalClicks: 0 },
  'ISO 45001': { keywords: [], totalImpr: 0, totalClicks: 0 },
};

if (gscData.keywordsByImpressions) {
  gscData.keywordsByImpressions.forEach(r => {
    const q = r.keys[0].toLowerCase();
    Object.keys(isoTopics).forEach(topic => {
      if (q.includes(topic.toLowerCase().replace('iso ', ''))) {
        isoTopics[topic].keywords.push(r);
        isoTopics[topic].totalImpr += r.impressions;
        isoTopics[topic].totalClicks += r.clicks;
      }
    });
  });
}

// Generate specific blog suggestions based on keyword clusters
w('  PRIORITEIT 1 — Direct maken (hoge impact):');
if (gscData.keywordsByImpressions) {
  const highPotential = gscData.keywordsByImpressions
    .filter(r => r.impressions >= 20 && r.position > 5 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  highPotential.forEach((r, i) => {
    const q = r.keys[0];
    w(`  ${i + 1}. Blogpost over "${q}"`);
    w(`     → ${r.impressions} impressies, positie ${r.position.toFixed(1)}, ${r.clicks} clicks`);
    w(`     → Potentie: met dedicated content van positie ${r.position.toFixed(0)} naar top 5`);
  });
}
w();

w('  PRIORITEIT 2 — Bestaande content optimaliseren:');
if (gscData.pagesByClicks) {
  const toOptimize = gscData.pagesByClicks
    .filter(r => r.ctr < 0.05 && r.impressions >= 30)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);

  toOptimize.forEach((r, i) => {
    const page = r.keys[0].replace('https://www.maasiso.nl', '') || '/';
    w(`  ${i + 1}. ${page}`);
    w(`     → CTR: ${(r.ctr * 100).toFixed(1)}%, ${r.impressions} impressies — title/meta verbeteren`);
  });
}
w();

h2('C2. QUICK WINS');

w('▸ TITLE/META DESCRIPTION OPTIMALISATIES:');
w('  Pagina\'s met veel impressies maar lage CTR — verbeter title tags en meta descriptions:');
if (gscData.pagesByImpressions) {
  const ctroOpt = gscData.pagesByImpressions
    .filter(r => r.impressions >= 30 && r.ctr < 0.04)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8);

  ctroOpt.forEach((r, i) => {
    const page = r.keys[0].replace('https://www.maasiso.nl', '') || '/';
    w(`  ${i + 1}. ${page} — CTR ${(r.ctr * 100).toFixed(1)}% bij ${r.impressions} impressies`);
  });
}
w();

w('▸ ZOEKWOORDEN DIE SNEL NAAR TOP 3 KUNNEN:');
if (gscData.keywordsByClicks) {
  const almostTop3 = gscData.keywordsByClicks
    .filter(r => r.position >= 3.5 && r.position <= 8 && r.impressions >= 10)
    .sort((a, b) => a.position - b.position)
    .slice(0, 10);

  almostTop3.forEach((r, i) => {
    w(`  ${i + 1}. "${r.keys[0]}" — positie ${r.position.toFixed(1)}, ${r.clicks} clicks`);
    w(`     → Actie: content uitbreiden, interne links toevoegen, title optimaliseren`);
  });
}
w();

h2('C3. LANGE TERMIJN KANSEN');

w('▸ THEMA-CLUSTERS VOOR AUTORITEIT:');
w();
Object.entries(isoTopics).forEach(([topic, data]) => {
  if (data.totalImpr > 0) {
    w(`  ${topic}: ${data.keywords.length} zoekwoorden, ${fmt(data.totalImpr)} impressies`);
    w(`  → Maak een pillar page + ondersteunende blogposts`);
    const subtopics = data.keywords
      .filter(r => r.keys[0].split(' ').length >= 3)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5);
    subtopics.forEach(r => {
      w(`    - "${r.keys[0]}" (${r.impressions} impr, pos ${r.position.toFixed(1)})`);
    });
    w();
  }
});

w('▸ GOOGLE ADS AANBEVELINGEN:');
w('  - Huidige bounce rate van Google Ads verkeer is waarschijnlijk hoog');
w('  - Controleer in GA4 de "Paid Search" engagement metrics hierboven');
w('  - Switch primaire conversie-actie van ads_conversion_Contact_1 naar generate_lead');
w('  - Overweeg specifieke landing pages per advertentiegroep te maken');
w();

w('▸ INTERN VERKEER FILTEREN:');
w('  - Stel een IP-filter in voor Lelystad om eigen bezoeken uit te sluiten');
w('  - Dit geeft zuiverder data voor toekomstige analyses');

w();
w('═'.repeat(70));
w('  EINDE RAPPORT — Gegenereerd op ' + new Date().toLocaleDateString('nl-NL'));
w('═'.repeat(70));

// Write report
const reportPath = path.join(__dirname, '..', 'MAASISO-ANALYSE-RAPPORT.txt');
fs.writeFileSync(reportPath, report, 'utf-8');
console.log(`Rapport opgeslagen: ${reportPath}`);
console.log(`Rapport lengte: ${report.split('\n').length} regels`);
