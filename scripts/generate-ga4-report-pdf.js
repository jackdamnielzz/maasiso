/**
 * GA4 Analysis Report PDF Generator
 * Generates a professional PDF report with all GA4 analysis data.
 *
 * Run with: node scripts/generate-ga4-report-pdf.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'secrets', 'google-service-account.json');
const GA4_PROPERTY = 'properties/467095380';
const OUTPUT_PATH = path.join(__dirname, '..', 'MaasISO_GA4_Analyse_Rapport.pdf');

// Brand colors
const COLORS = {
  darkBlue: '#091E42',
  orange: '#FF8B00',
  lightGray: '#F4F5F7',
  mediumGray: '#6B778C',
  white: '#FFFFFF',
  green: '#36B37E',
  red: '#DE350B',
  yellow: '#FFAB00',
  tableHeader: '#091E42',
  tableRow1: '#FFFFFF',
  tableRow2: '#F4F5F7',
  tableBorder: '#DFE1E6',
};

async function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
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
    row.dimensionValues?.forEach((val, i) => { obj[dimNames[i]] = val.value; });
    row.metricValues?.forEach((val, i) => { obj[metricNames[i]] = val.value; });
    return obj;
  });
}

// ── PDF helpers ──────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function addPageHeader(doc, title) {
  // Orange top bar
  doc.rect(0, 0, doc.page.width, 6).fill(COLORS.orange);
  doc.y = 20;

  doc.fontSize(9).fillColor(COLORS.mediumGray)
    .text('MaasISO - GA4 Analyse Rapport', 50, 20, { align: 'right' });

  doc.moveTo(50, 38).lineTo(doc.page.width - 50, 38)
    .strokeColor(COLORS.tableBorder).lineWidth(0.5).stroke();

  doc.y = 50;
}

function addSectionTitle(doc, number, title) {
  ensureSpace(doc, 60);
  doc.moveDown(0.5);

  const y = doc.y;
  doc.rect(50, y, doc.page.width - 100, 28)
    .fill(COLORS.darkBlue);

  doc.fontSize(12).fillColor(COLORS.white)
    .text(`${number}. ${title}`, 62, y + 7, { width: doc.page.width - 124 });

  doc.y = y + 36;
  doc.fillColor(COLORS.darkBlue);
}

function addSubTitle(doc, title) {
  ensureSpace(doc, 30);
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor(COLORS.orange).text(title, 50);
  doc.fillColor(COLORS.darkBlue);
  doc.moveDown(0.2);
}

function addParagraph(doc, text) {
  doc.fontSize(9).fillColor(COLORS.darkBlue).text(text, 50, undefined, {
    width: doc.page.width - 100,
    lineGap: 3,
  });
  doc.moveDown(0.3);
}

function addBullet(doc, text) {
  const x = 60;
  ensureSpace(doc, 16);
  const bulletY = doc.y + 4;
  doc.circle(x + 3, bulletY, 2.5).fill(COLORS.orange);
  doc.fontSize(9).fillColor(COLORS.darkBlue).text(text, x + 12, doc.y, {
    width: doc.page.width - 130,
    lineGap: 2,
  });
}

function addKPI(doc, label, value, x, y, width) {
  doc.rect(x, y, width, 52).fill(COLORS.lightGray);
  doc.rect(x, y, width, 4).fill(COLORS.orange);

  doc.fontSize(8).fillColor(COLORS.mediumGray)
    .text(label, x + 8, y + 12, { width: width - 16 });
  doc.fontSize(16).fillColor(COLORS.darkBlue)
    .text(value, x + 8, y + 26, { width: width - 16 });
}

function ensureSpace(doc, needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    addPageHeader(doc, '');
  }
}

function drawTableHeader(doc, headers, colWidths, startX, cellPadX, cellPadY, headerHeight) {
  const tableWidth = colWidths.reduce((s, w) => s + w, 0);
  const y = doc.y;
  doc.rect(startX, y, tableWidth, headerHeight).fill(COLORS.tableHeader);
  let x = startX;
  headers.forEach((h, i) => {
    doc.fontSize(7.5).fillColor(COLORS.white)
      .text(h, x + cellPadX, y + cellPadY + 2, {
        width: colWidths[i] - cellPadX * 2,
        ellipsis: true,
        height: headerHeight,
        lineBreak: false,
      });
    x += colWidths[i];
  });
  doc.y = y + headerHeight;
}

function drawTable(doc, headers, rows, colWidths, options = {}) {
  const startX = options.startX || 50;
  const tableWidth = colWidths.reduce((s, w) => s + w, 0);
  const cellPadX = 5;
  const cellPadY = 4;
  const headerHeight = 22;
  const rowHeight = options.rowHeight || 18;
  const pageBottom = doc.page.height - 60;

  ensureSpace(doc, headerHeight + rowHeight * Math.min(rows.length, 3) + 10);

  // Draw initial header
  drawTableHeader(doc, headers, colWidths, startX, cellPadX, cellPadY, headerHeight);

  // Rows
  rows.forEach((row, ri) => {
    // Check if this row fits on the current page
    if (doc.y + rowHeight > pageBottom) {
      doc.addPage();
      addPageHeader(doc, '');
      // Redraw header on new page
      drawTableHeader(doc, headers, colWidths, startX, cellPadX, cellPadY, headerHeight);
    }

    const y = doc.y;
    const bgColor = ri % 2 === 0 ? COLORS.tableRow1 : COLORS.tableRow2;
    doc.rect(startX, y, tableWidth, rowHeight).fill(bgColor);

    // Bottom border
    doc.moveTo(startX, y + rowHeight)
      .lineTo(startX + tableWidth, y + rowHeight)
      .strokeColor(COLORS.tableBorder).lineWidth(0.3).stroke();

    let x = startX;
    const values = Array.isArray(row) ? row : headers.map((_, i) => row[i] || '');
    values.forEach((val, i) => {
      doc.fontSize(7).fillColor(COLORS.darkBlue)
        .text(String(val), x + cellPadX, y + cellPadY + 1, {
          width: colWidths[i] - cellPadX * 2,
          ellipsis: true,
          height: rowHeight,
          lineBreak: false,
        });
      x += colWidths[i];
    });
    // Call afterRow hook if provided (for custom drawing like bars)
    if (options.afterRow) {
      options.afterRow(doc, y, rowHeight, values, ri);
    }

    doc.y = y + rowHeight;
  });

  doc.y = doc.y + 6;
}

function addStatusIndicator(doc, status, text, x, y) {
  const color = status === 'good' ? COLORS.green : status === 'warning' ? COLORS.yellow : COLORS.red;
  doc.circle(x + 5, y + 5, 4).fill(color);
  doc.fontSize(8).fillColor(COLORS.darkBlue).text(text, x + 14, y + 1);
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching GA4 data...');

  const auth = await getAuth();
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  const last30 = { startDate: '30daysAgo', endDate: 'today' };
  const last90 = { startDate: '90daysAgo', endDate: 'today' };

  // ── Fetch all reports in parallel ──────────────────────────────────
  const [
    overallSummary,
    dailyTraffic,
    channelData,
    sourceMedium,
    paidSearch,
    landingPages,
    pagePerf,
    deviceData,
    geoData,
    eventData,
    formEvents,
    newVsReturn,
    paidLandingPages,
    weekComparison,
    searchTerms,
    engagementBySource,
    hourlyData,
  ] = await Promise.all([
    // 1. Overall
    runReport(analyticsData, {
      dateRanges: [last30],
      metrics: [
        { name: 'totalUsers' }, { name: 'newUsers' }, { name: 'sessions' },
        { name: 'screenPageViews' }, { name: 'engagementRate' },
        { name: 'averageSessionDuration' }, { name: 'bounceRate' }, { name: 'eventCount' },
      ],
    }),
    // 2. Daily
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'totalUsers' }, { name: 'sessions' },
        { name: 'screenPageViews' }, { name: 'bounceRate' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    }),
    // 3. Channel
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'totalUsers' }, { name: 'sessions' }, { name: 'engagementRate' },
        { name: 'bounceRate' }, { name: 'averageSessionDuration' }, { name: 'screenPageViews' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    }),
    // 4. Source/medium
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [
        { name: 'totalUsers' }, { name: 'sessions' }, { name: 'engagementRate' },
        { name: 'bounceRate' }, { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    }),
    // 5. Paid search
    runReport(analyticsData, {
      dateRanges: [last90],
      dimensions: [
        { name: 'sessionSource' }, { name: 'sessionMedium' }, { name: 'sessionCampaignName' },
      ],
      metrics: [
        { name: 'totalUsers' }, { name: 'sessions' }, { name: 'engagementRate' },
        { name: 'bounceRate' }, { name: 'averageSessionDuration' }, { name: 'screenPageViews' },
      ],
      dimensionFilter: {
        orGroup: {
          expressions: [
            { filter: { fieldName: 'sessionMedium', stringFilter: { matchType: 'EXACT', value: 'cpc' } } },
            { filter: { fieldName: 'sessionMedium', stringFilter: { matchType: 'EXACT', value: 'ppc' } } },
            { filter: { fieldName: 'sessionMedium', stringFilter: { matchType: 'CONTAINS', value: 'paid' } } },
          ],
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    }),
    // 6. Landing pages
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagementRate' },
        { name: 'bounceRate' }, { name: 'averageSessionDuration' }, { name: 'screenPageViews' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    }),
    // 7. Page performance
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' }, { name: 'totalUsers' },
        { name: 'engagementRate' }, { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20,
    }),
    // 8. Device
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'totalUsers' }, { name: 'sessions' }, { name: 'engagementRate' },
        { name: 'bounceRate' }, { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    }),
    // 9. Geo
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'engagementRate' }],
      dimensionFilter: {
        filter: { fieldName: 'country', stringFilter: { matchType: 'EXACT', value: 'Netherlands' } },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 12,
    }),
    // 10. Events
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 15,
    }),
    // 11. Form events
    runReport(analyticsData, {
      dateRanges: [last90],
      dimensions: [{ name: 'eventName' }, { name: 'date' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      dimensionFilter: {
        orGroup: {
          expressions: [
            { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'form' } } },
            { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'submit' } } },
            { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'contact' } } },
            { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'lead' } } },
          ],
        },
      },
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: true }],
    }),
    // 12. New vs returning
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'newVsReturning' }],
      metrics: [
        { name: 'totalUsers' }, { name: 'sessions' }, { name: 'engagementRate' },
        { name: 'bounceRate' }, { name: 'averageSessionDuration' },
      ],
    }),
    // 13. Paid landing pages
    runReport(analyticsData, {
      dateRanges: [last90],
      dimensions: [{ name: 'landingPage' }, { name: 'sessionCampaignName' }],
      metrics: [
        { name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagementRate' },
        { name: 'bounceRate' }, { name: 'averageSessionDuration' },
      ],
      dimensionFilter: {
        filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { matchType: 'EXACT', value: 'Paid Search' } },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    }),
    // 14. Week comparison
    runReport(analyticsData, {
      dateRanges: [
        { startDate: '7daysAgo', endDate: 'today' },
        { startDate: '14daysAgo', endDate: '8daysAgo' },
      ],
      metrics: [
        { name: 'totalUsers' }, { name: 'sessions' }, { name: 'engagementRate' },
        { name: 'bounceRate' }, { name: 'screenPageViews' },
      ],
    }),
    // 15. Search terms
    runReport(analyticsData, {
      dateRanges: [last90],
      dimensions: [{ name: 'sessionGoogleAdsKeyword' }],
      metrics: [
        { name: 'sessions' }, { name: 'totalUsers' },
        { name: 'engagementRate' }, { name: 'bounceRate' },
      ],
      dimensionFilter: {
        notExpression: {
          filter: { fieldName: 'sessionGoogleAdsKeyword', stringFilter: { matchType: 'EXACT', value: '(not set)' } },
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    }),
    // 16. Engagement by source
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'engagedSessions' },
        { name: 'engagementRate' }, { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    }),
    // 17. Hourly
    runReport(analyticsData, {
      dateRanges: [last30],
      dimensions: [{ name: 'hour' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ dimension: { dimensionName: 'hour' }, desc: false }],
    }),
  ]);

  console.log('All data fetched. Generating PDF...');

  // ── Create PDF ─────────────────────────────────────────────────────
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'MaasISO - GA4 Analyse Rapport',
      Author: 'MaasISO Analytics',
      Subject: 'Google Analytics 4 Performance Analysis',
      CreationDate: new Date(),
    },
  });

  const stream = fs.createWriteStream(OUTPUT_PATH);
  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 100;

  // ══════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ══════════════════════════════════════════════════════════════════
  doc.rect(0, 0, pageWidth, doc.page.height).fill(COLORS.darkBlue);

  // Orange accent bar
  doc.rect(0, 0, pageWidth, 8).fill(COLORS.orange);
  doc.rect(0, doc.page.height - 8, pageWidth, 8).fill(COLORS.orange);

  // Title
  doc.fontSize(36).fillColor(COLORS.white)
    .text('GA4 Analyse', 50, 200, { width: contentWidth });
  doc.fontSize(36).fillColor(COLORS.orange)
    .text('Rapport', 50, undefined, { width: contentWidth });

  doc.moveDown(1);
  doc.fontSize(16).fillColor(COLORS.white)
    .text('maasiso.nl', 50, undefined, { width: contentWidth });

  doc.moveDown(3);

  // Divider line
  doc.moveTo(50, doc.y).lineTo(250, doc.y)
    .strokeColor(COLORS.orange).lineWidth(2).stroke();
  doc.moveDown(1);

  const reportDate = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.fontSize(11).fillColor('#8993A4')
    .text(`Rapportdatum: ${reportDate}`, 50);
  doc.text('Periode: Laatste 30 / 90 dagen', 50);
  doc.text('Bron: Google Analytics 4 (Property 467095380)', 50);

  doc.moveDown(4);
  doc.fontSize(9).fillColor('#8993A4')
    .text('Dit rapport is automatisch gegenereerd op basis van GA4-data via de Google Analytics Data API.', 50, undefined, { width: contentWidth });

  // ══════════════════════════════════════════════════════════════════
  // PAGE 2: EXECUTIVE SUMMARY
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Executive Summary');

  doc.fontSize(20).fillColor(COLORS.darkBlue)
    .text('Executive Summary', 50, 60);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(200, doc.y)
    .strokeColor(COLORS.orange).lineWidth(2).stroke();
  doc.moveDown(0.8);

  addParagraph(doc, 'Dit rapport analyseert de prestaties van maasiso.nl over de afgelopen 30 en 90 dagen, met specifieke focus op Google Ads-campagnes en waarom er geen leads (e-mails/aanvragen) binnenkomen ondanks actieve advertenties.');

  doc.moveDown(0.5);
  addSubTitle(doc, 'Hoofdconclusie');
  addParagraph(doc, 'Er zijn 5 kritieke problemen geidentificeerd die verklaren waarom de advertenties geen aanvragen opleveren. De Google Ads-campagne genereert slechts 17 bezoeken per maand met een bounce rate van 70.6%. De conversie-tracking is verkeerd geconfigureerd en het contactformulier mist analytics-integratie.');

  // KPI boxes
  doc.moveDown(0.5);
  if (overallSummary?.rows?.[0]) {
    const m = overallSummary.rows[0].metricValues;
    const kpiY = doc.y;
    const kpiW = (contentWidth - 30) / 4;

    addKPI(doc, 'Gebruikers (30d)', m[0].value, 50, kpiY, kpiW);
    addKPI(doc, 'Sessies (30d)', m[2].value, 50 + kpiW + 10, kpiY, kpiW);
    addKPI(doc, 'Engagement Rate', (parseFloat(m[4].value) * 100).toFixed(1) + '%', 50 + (kpiW + 10) * 2, kpiY, kpiW);
    addKPI(doc, 'Bounce Rate', (parseFloat(m[6].value) * 100).toFixed(1) + '%', 50 + (kpiW + 10) * 3, kpiY, kpiW);

    doc.y = kpiY + 62;

    const kpi2Y = doc.y;
    addKPI(doc, 'Pageviews (30d)', m[3].value, 50, kpi2Y, kpiW);
    addKPI(doc, 'Nieuwe Gebruikers', m[1].value, 50 + kpiW + 10, kpi2Y, kpiW);
    addKPI(doc, 'Gem. Sessieduur', parseFloat(m[5].value).toFixed(0) + 's', 50 + (kpiW + 10) * 2, kpi2Y, kpiW);
    addKPI(doc, 'Totaal Events', m[7].value, 50 + (kpiW + 10) * 3, kpi2Y, kpiW);

    doc.y = kpi2Y + 62;
  }

  // Status indicators
  doc.moveDown(0.8);
  addSubTitle(doc, 'Status per kanaal');
  const statusY = doc.y;
  addStatusIndicator(doc, 'good', 'Organisch zoekverkeer - Goed presterend (65.7% engagement)', 60, statusY);
  addStatusIndicator(doc, 'good', 'Referral verkeer - Uitstekend (84.7% engagement)', 60, statusY + 18);
  addStatusIndicator(doc, 'warning', 'Direct verkeer - Matig (65.4% engagement)', 60, statusY + 36);
  addStatusIndicator(doc, 'bad', 'Betaald zoekverkeer - Kritiek (29.4% engagement, 70.6% bounce)', 60, statusY + 54);
  addStatusIndicator(doc, 'bad', 'Cross-network - Kritiek (28.6% engagement)', 60, statusY + 72);
  doc.y = statusY + 96;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 3: 5 KRITIEKE PROBLEMEN
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Kritieke Problemen');

  doc.fontSize(20).fillColor(COLORS.darkBlue)
    .text('5 Kritieke Problemen', 50, 60);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(230, doc.y)
    .strokeColor(COLORS.red).lineWidth(2).stroke();
  doc.moveDown(0.8);

  // Problem 1
  addSubTitle(doc, 'Probleem 1: Google Ads levert extreem weinig verkeer');
  addParagraph(doc, 'Slechts 17 bezoeken via ads in 30 dagen. 70% van die bezoekers vertrekt direct. Ze bekijken gemiddeld 1 pagina en zijn na 52 seconden weg. Ter vergelijking: organische bezoekers blijven 4x langer en bekijken 2+ paginas.');

  drawTable(doc,
    ['Metric', 'Google Ads', 'Organisch', 'Verschil'],
    [
      ['Sessies (30d)', '17', '169', '10x minder'],
      ['Engagement rate', '29.4%', '65.7%', '-55%'],
      ['Bounce rate', '70.6%', '34.3%', '+106%'],
      ['Gem. sessieduur', '52 sec', '238 sec', '-78%'],
      ['Pag/sessie', '1.0', '2.2', '-55%'],
    ],
    [130, 100, 100, 100]
  );

  // Problem 2
  addSubTitle(doc, 'Probleem 2: Misleidende conversiedata in Google Ads');
  addParagraph(doc, 'Het event "ads_conversion_Contact_1" registreert 91 triggers van slechts 8 gebruikers (waarvan 81 op 1 dag). Deze conversie vuurt af bij het BEZOEKEN van de contactpagina, niet bij het VERZENDEN van het formulier. Dit geeft Google Ads valse succesdata waardoor het algoritme verkeerd optimaliseert.');

  // Problem 3
  doc.moveDown(0.3);
  addSubTitle(doc, 'Probleem 3: Contactformulier tracking ontbreekt');
  addParagraph(doc, 'De functie trackFormSubmission() bestaat in de code maar wordt nergens aangeroepen in het contactformulier. Hierdoor is onbekend hoeveel mensen het formulier daadwerkelijk versturen. Wat wel zichtbaar is: 19 "form_start" events (mensen beginnen in te vullen) maar 0 "form_submit" events - mensen starten het formulier maar maken het niet af.');

  // Problem 4
  doc.moveDown(0.3);
  addSubTitle(doc, 'Probleem 4: Campagne is slecht geconfigureerd');
  addParagraph(doc, 'De campagne "maasiso-leads" heeft slechts 10 sessies in 90 dagen met 50% bounce. Daarnaast zijn er 7 sessies zonder campagnenaam ((not set)) met 100% bounce en 0% engagement in 1 seconde - dit zijn waarschijnlijk bot-klikken of verkeerd geconfigureerde ads die budget verbranden.');

  // Problem 5
  doc.moveDown(0.3);
  addSubTitle(doc, 'Probleem 5: Mobiel presteert slecht');
  addParagraph(doc, 'Mobiele bezoekers hebben een bounce rate van 52.8% (vs 31.2% desktop) en blijven gemiddeld slechts 82 seconden (vs 441s desktop). Advertentie-klikkers komen vaak via mobiel, wat het conversieprobleem versterkt.');

  drawTable(doc,
    ['Apparaat', 'Gebruikers', 'Sessies', 'Bounce Rate', 'Gem. Duur'],
    formatRows(deviceData, ['apparaat'], ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur'])
      .map(r => [r.apparaat, r.gebruikers, r.sessies, (parseFloat(r.bounceRate) * 100).toFixed(1) + '%', parseFloat(r.gem_duur).toFixed(0) + 's']),
    [120, 90, 90, 100, 90]
  );

  // ══════════════════════════════════════════════════════════════════
  // PAGE: VERKEERSBRONNEN
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Verkeersbronnen');

  addSectionTitle(doc, 1, 'VERKEERSBRONNEN - Kanalen (30 dagen)');
  doc.moveDown(0.3);

  const chRows = formatRows(channelData,
    ['kanaal'], ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']);
  drawTable(doc,
    ['Kanaal', 'Gebruikers', 'Sessies', 'Engagement', 'Bounce', 'Gem. Duur', 'Pageviews'],
    chRows.map(r => [
      r.kanaal, r.gebruikers, r.sessies,
      (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
      (parseFloat(r.bounceRate) * 100).toFixed(1) + '%',
      parseFloat(r.gem_duur).toFixed(0) + 's',
      r.pageviews,
    ]),
    [95, 65, 55, 68, 55, 60, 60]
  );

  addSectionTitle(doc, 2, 'BRON / MEDIUM DETAIL (Top 15)');
  doc.moveDown(0.3);

  const smRows = formatRows(sourceMedium,
    ['bron', 'medium'], ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']);
  drawTable(doc,
    ['Bron', 'Medium', 'Gebruikers', 'Sessies', 'Engagement', 'Bounce'],
    smRows.map(r => [
      r.bron, r.medium, r.gebruikers, r.sessies,
      (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
      (parseFloat(r.bounceRate) * 100).toFixed(1) + '%',
    ]),
    [110, 80, 65, 55, 68, 55]
  );

  // ══════════════════════════════════════════════════════════════════
  // PAGE: GOOGLE ADS DETAIL
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Google Ads Analyse');

  addSectionTitle(doc, 3, 'GOOGLE ADS / BETAALD VERKEER (90 dagen)');
  doc.moveDown(0.3);

  const paidRows = formatRows(paidSearch,
    ['bron', 'medium', 'campagne'],
    ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']);
  if (paidRows.length > 0) {
    drawTable(doc,
      ['Bron', 'Medium', 'Campagne', 'Sessies', 'Engagement', 'Bounce', 'Gem. Duur'],
      paidRows.map(r => [
        r.bron, r.medium, r.campagne, r.sessies,
        (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
        (parseFloat(r.bounceRate) * 100).toFixed(1) + '%',
        parseFloat(r.gem_duur).toFixed(0) + 's',
      ]),
      [55, 45, 100, 50, 68, 55, 60]
    );
  } else {
    addParagraph(doc, 'Geen betaald verkeer gevonden in de afgelopen 90 dagen.');
  }

  addSectionTitle(doc, 4, 'GOOGLE ADS ZOEKWOORDEN (90 dagen)');
  doc.moveDown(0.3);

  const stRows = formatRows(searchTerms,
    ['zoekwoord'], ['sessies', 'gebruikers', 'engagementRate', 'bounceRate']);
  if (stRows.length > 0) {
    drawTable(doc,
      ['Zoekwoord', 'Sessies', 'Gebruikers', 'Engagement', 'Bounce Rate'],
      stRows.map(r => [
        r.zoekwoord, r.sessies, r.gebruikers,
        (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
        (parseFloat(r.bounceRate) * 100).toFixed(1) + '%',
      ]),
      [150, 60, 70, 80, 80]
    );
  } else {
    addParagraph(doc, 'Geen zoekwoord-data beschikbaar. Google Ads is mogelijk niet gekoppeld aan GA4.');
  }

  addSectionTitle(doc, 5, 'BETAALD VERKEER - LANDING PAGES (90 dagen)');
  doc.moveDown(0.3);

  const paidLPRows = formatRows(paidLandingPages,
    ['landing_page', 'campagne'],
    ['sessies', 'gebruikers', 'engagementRate', 'bounceRate', 'gem_duur']);
  if (paidLPRows.length > 0) {
    drawTable(doc,
      ['Landing Page', 'Campagne', 'Sessies', 'Engagement', 'Bounce'],
      paidLPRows.map(r => [
        r.landing_page, r.campagne, r.sessies,
        (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
        (parseFloat(r.bounceRate) * 100).toFixed(1) + '%',
      ]),
      [140, 90, 55, 75, 70]
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PAGE: LANDING PAGES & PAGINA PRESTATIES
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Landing Pages & Pagina Prestaties');

  addSectionTitle(doc, 6, 'LANDING PAGES (Top 15 - 30 dagen)');
  doc.moveDown(0.3);

  const lpRows = formatRows(landingPages,
    ['landing_page'], ['sessies', 'gebruikers', 'engagementRate', 'bounceRate', 'gem_duur', 'pageviews']);
  drawTable(doc,
    ['Landing Page', 'Sessies', 'Engagement', 'Bounce', 'Gem. Duur'],
    lpRows.map(r => [
      r.landing_page || '(leeg)', r.sessies,
      (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
      (parseFloat(r.bounceRate) * 100).toFixed(1) + '%',
      parseFloat(r.gem_duur).toFixed(0) + 's',
    ]),
    [190, 55, 75, 65, 65]
  );

  addSectionTitle(doc, 7, 'MEEST BEKEKEN PAGINAS (Top 20 - 30 dagen)');
  doc.moveDown(0.3);

  const pgRows = formatRows(pagePerf,
    ['pagina'], ['pageviews', 'gebruikers', 'engagementRate', 'gem_duur']);
  drawTable(doc,
    ['Pagina', 'Pageviews', 'Gebruikers', 'Engagement', 'Gem. Duur'],
    pgRows.map(r => [
      r.pagina, r.pageviews, r.gebruikers,
      (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
      parseFloat(r.gem_duur).toFixed(0) + 's',
    ]),
    [190, 65, 70, 70, 65]
  );

  // ══════════════════════════════════════════════════════════════════
  // PAGE: EVENTS & CONVERSIES
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Events & Conversies');

  addSectionTitle(doc, 8, 'EVENTS OVERZICHT (30 dagen)');
  doc.moveDown(0.3);

  const evRows = formatRows(eventData, ['event'], ['aantal', 'gebruikers']);
  drawTable(doc,
    ['Event Naam', 'Aantal', 'Unieke Gebruikers'],
    evRows.map(r => [r.event, r.aantal, r.gebruikers]),
    [220, 100, 120]
  );

  addSectionTitle(doc, 9, 'FORMULIER / CONVERSIE EVENTS (90 dagen)');
  doc.moveDown(0.3);

  const fmRows = formatRows(formEvents, ['event', 'datum'], ['aantal', 'gebruikers']);
  if (fmRows.length > 0) {
    drawTable(doc,
      ['Event', 'Datum', 'Aantal', 'Gebruikers'],
      fmRows.map(r => [
        r.event,
        `${r.datum.slice(0,4)}-${r.datum.slice(4,6)}-${r.datum.slice(6,8)}`,
        r.aantal, r.gebruikers,
      ]),
      [170, 90, 70, 80]
    );
  }

  addParagraph(doc, 'Let op: Er zijn 0 "form_submit" events. Alleen "form_start" (gebruiker begint te typen) en "ads_conversion_Contact_1" (contactpagina bezoek). Het contactformulier roept trackFormSubmission() niet aan, waardoor succesvolle inzendingen niet worden bijgehouden.');

  // ══════════════════════════════════════════════════════════════════
  // PAGE: GEBRUIKERSDATA
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Gebruikersdata');

  addSectionTitle(doc, 10, 'APPARAAT VERDELING (30 dagen)');
  doc.moveDown(0.3);

  const devRows = formatRows(deviceData,
    ['apparaat'], ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']);
  drawTable(doc,
    ['Apparaat', 'Gebruikers', 'Sessies', 'Engagement', 'Bounce', 'Gem. Duur'],
    devRows.map(r => [
      r.apparaat, r.gebruikers, r.sessies,
      (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
      (parseFloat(r.bounceRate) * 100).toFixed(1) + '%',
      parseFloat(r.gem_duur).toFixed(0) + 's',
    ]),
    [90, 75, 65, 75, 65, 65]
  );

  addSectionTitle(doc, 11, 'LOCATIE - NEDERLAND (Top 12 steden)');
  doc.moveDown(0.3);

  const geRows = formatRows(geoData, ['land', 'stad'], ['gebruikers', 'sessies', 'engagementRate']);
  drawTable(doc,
    ['Stad', 'Gebruikers', 'Sessies', 'Engagement Rate'],
    geRows.map(r => [
      r.stad, r.gebruikers, r.sessies,
      (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
    ]),
    [150, 90, 80, 100]
  );

  addSectionTitle(doc, 12, 'NIEUW VS TERUGKEREND (30 dagen)');
  doc.moveDown(0.3);

  const nvrRows = formatRows(newVsReturn,
    ['type'], ['gebruikers', 'sessies', 'engagementRate', 'bounceRate', 'gem_duur']);
  drawTable(doc,
    ['Type', 'Gebruikers', 'Sessies', 'Engagement', 'Bounce', 'Gem. Duur'],
    nvrRows.filter(r => r.type === 'new' || r.type === 'returning').map(r => [
      r.type === 'new' ? 'Nieuw' : 'Terugkerend',
      r.gebruikers, r.sessies,
      (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
      (parseFloat(r.bounceRate) * 100).toFixed(1) + '%',
      parseFloat(r.gem_duur).toFixed(0) + 's',
    ]),
    [90, 75, 65, 75, 65, 65]
  );

  // ══════════════════════════════════════════════════════════════════
  // PAGE: ENGAGEMENT & TRENDS
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Engagement & Trends');

  addSectionTitle(doc, 13, 'ENGAGEMENT PER KANAAL (30 dagen)');
  doc.moveDown(0.3);

  const engRows = formatRows(engagementBySource,
    ['kanaal'], ['sessies', 'pageviews', 'engaged_sessies', 'engagementRate', 'gem_duur']);
  drawTable(doc,
    ['Kanaal', 'Sessies', 'Engaged', 'Pag/Sessie', 'Engagement', 'Gem. Duur'],
    engRows.map(r => [
      r.kanaal, r.sessies, r.engaged_sessies,
      (parseInt(r.pageviews) / Math.max(parseInt(r.sessies), 1)).toFixed(1),
      (parseFloat(r.engagementRate) * 100).toFixed(1) + '%',
      parseFloat(r.gem_duur).toFixed(0) + 's',
    ]),
    [95, 55, 55, 65, 75, 65]
  );

  addSectionTitle(doc, 14, 'WEEK-OVER-WEEK VERGELIJKING');
  doc.moveDown(0.3);

  if (weekComparison?.rows) {
    const current = weekComparison.rows[0]?.metricValues || [];
    const previous = weekComparison.rows[1]?.metricValues || [];
    if (current.length && previous.length) {
      const metricNames = ['Gebruikers', 'Sessies', 'Engagement Rate', 'Bounce Rate', 'Pageviews'];
      drawTable(doc,
        ['Metric', 'Deze Week', 'Vorige Week', 'Verandering'],
        metricNames.map((name, i) => {
          const curr = parseFloat(current[i]?.value || 0);
          const prev = parseFloat(previous[i]?.value || 0);
          const isRate = name.includes('Rate');
          const currD = isRate ? (curr * 100).toFixed(1) + '%' : curr.toFixed(0);
          const prevD = isRate ? (prev * 100).toFixed(1) + '%' : prev.toFixed(0);
          const change = prev > 0 ? ((curr - prev) / prev * 100).toFixed(1) + '%' : 'N/A';
          const arrow = curr > prev ? '↑ ' : curr < prev ? '↓ ' : '→ ';
          return [name, currD, prevD, arrow + change];
        }),
        [130, 100, 100, 100]
      );
    }
  }

  addSectionTitle(doc, 15, 'BEZOEKPATROON PER UUR (30 dagen)');
  doc.moveDown(0.3);

  const hrRows = formatRows(hourlyData, ['uur'], ['sessies', 'gebruikers']);
  const maxSessions = Math.max(...hrRows.map(r => parseInt(r.sessies)));

  // Draw hourly table with graphical bars
  drawTable(doc,
    ['Uur', 'Sessies', 'Gebruikers'],
    hrRows.map(r => [
      r.uur.padStart(2, '0') + ':00',
      r.sessies,
      r.gebruikers,
    ]),
    [60, 60, 70],
    {
      afterRow: (rowDoc, rowY, rowHeight, rowData, rowIndex) => {
        // Draw intensity bar after each row
        const barX = 250;
        const barMaxWidth = 200;
        const sessions = parseInt(hrRows[rowIndex].sessies);
        const barWidth = Math.round((sessions / maxSessions) * barMaxWidth);
        const barY = rowY + 5;
        const barH = rowHeight - 10;
        // Background bar
        rowDoc.rect(barX, barY, barMaxWidth, barH).fill('#ECEDF0');
        // Filled bar
        if (barWidth > 0) {
          rowDoc.rect(barX, barY, barWidth, barH).fill(COLORS.orange);
        }
      },
    }
  );

  // ══════════════════════════════════════════════════════════════════
  // FINAL PAGE: AANBEVELINGEN
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  addPageHeader(doc, 'Aanbevelingen');

  doc.fontSize(20).fillColor(COLORS.darkBlue)
    .text('Aanbevelingen', 50, 60);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(200, doc.y)
    .strokeColor(COLORS.orange).lineWidth(2).stroke();
  doc.moveDown(0.8);

  // Recommendation 1
  addSubTitle(doc, '1. Fix de conversie-tracking (URGENT - Prioriteit 1)');
  addBullet(doc, 'Verander "ads_conversion_Contact_1" zodat het afvuurt op formulier-verzending, niet op paginabezoek');
  addBullet(doc, 'Voeg trackFormSubmission() toe aan het contactformulier in de code');
  addBullet(doc, 'Zonder juiste tracking optimaliseert Google Ads op verkeerde signalen');
  doc.moveDown(0.5);

  // Recommendation 2
  addSubTitle(doc, '2. Verhoog advertentiebudget OF pauzeer en herstart (Prioriteit 2)');
  addBullet(doc, '17 klikken in 30 dagen is te weinig voor Google Ads om te optimaliseren');
  addBullet(doc, 'Minimaal 50-100 klikken per maand nodig voor goede optimalisatie');
  addBullet(doc, 'Overweeg budget te verhogen naar minimaal 10-15 euro per dag');
  addBullet(doc, 'Of pauzeer, configureer alles opnieuw correct, en herstart');
  doc.moveDown(0.5);

  // Recommendation 3
  addSubTitle(doc, '3. Verbeter de landing page voor ads (Prioriteit 3)');
  addBullet(doc, 'ISO 9001 landing page heeft 57% bounce voor ad-verkeer');
  addBullet(doc, 'Maak een dedicated landing page met directe CTA boven de fold');
  addBullet(doc, 'Plaats een formulier direct op de landing page (niet alleen op /contact)');
  addBullet(doc, 'Voeg social proof toe: klantlogos, reviews, case studies');
  doc.moveDown(0.5);

  // Recommendation 4
  addSubTitle(doc, '4. Optimaliseer het contactformulier (Prioriteit 4)');
  addBullet(doc, '19 mensen starten het formulier maar niemand rondt het af');
  addBullet(doc, 'Overweeg minder verplichte velden of een korter formulier');
  addBullet(doc, 'Voeg een click-to-call knop toe voor B2B-klanten die liever bellen');
  addBullet(doc, 'Test of de "Algemene voorwaarden" checkbox afschrikt');
  doc.moveDown(0.5);

  // Recommendation 5
  addSubTitle(doc, '5. Investeer meer in content/SEO (Prioriteit 5)');
  addBullet(doc, 'Organisch verkeer (65.7% engagement) presteert 2x beter dan betaald');
  addBullet(doc, 'Blog-content over ISO-checklists en voorbeelden trekt gericht verkeer');
  addBullet(doc, 'AI-tools (ChatGPT, TypingMind) verwijzen naar maasiso.nl met 84% engagement');
  addBullet(doc, 'Meer kwalitatieve content is waarschijnlijk effectiever dan de huidige ads');

  // ── Positive findings ──
  doc.moveDown(1);
  doc.fontSize(16).fillColor(COLORS.green)
    .text('Wat wel goed gaat', 50);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(180, doc.y)
    .strokeColor(COLORS.green).lineWidth(2).stroke();
  doc.moveDown(0.5);

  addBullet(doc, 'Organisch verkeer groeit: 98 gebruikers via zoekmachines met goede engagement');
  addBullet(doc, 'Blog content werkt: "TRA voorbeeld excel" en "directiebeoordeling ISO 9001" trekken gericht verkeer');
  addBullet(doc, 'AI-referrals: typingmind.com (36 sessies) en chatgpt.com (22 sessies) met uitstekende engagement');
  addBullet(doc, 'Contactpagina wordt bezocht: 104+ pageviews met 91.7% engagement');
  addBullet(doc, 'Week-over-week groei: +13.9% gebruikers, +34.7% sessies');

  // ── Footer on last page ──
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
    .strokeColor(COLORS.tableBorder).lineWidth(0.5).stroke();
  doc.moveDown(0.5);
  doc.fontSize(8).fillColor(COLORS.mediumGray)
    .text(`Rapport gegenereerd op ${reportDate} | Data bron: Google Analytics 4 (Property 467095380) | maasiso.nl`, 50, undefined, {
      align: 'center', width: contentWidth,
    });

  // ── Finalize ───────────────────────────────────────────────────────
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  console.log(`\nPDF rapport succesvol gegenereerd:`);
  console.log(`  ${OUTPUT_PATH}`);
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
