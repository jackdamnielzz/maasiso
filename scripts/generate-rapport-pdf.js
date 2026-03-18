/**
 * PDF Rapport Generator voor MaasISO Website Analyse
 * Maakt een professionele PDF van de GA4 + GSC analyse data
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const ga4Data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'analyse-ga4-data.json'), 'utf-8'));
const gscData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'analyse-gsc-data.json'), 'utf-8'));

// --- Helpers ---
function fmt(n) { return Number(n).toLocaleString('nl-NL'); }
function pct(n) { return (Number(n) * 100).toFixed(1) + '%'; }
function dur(s) {
  const sec = Math.round(Number(s));
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}
function round2(n) { return Number(n).toFixed(2); }

// --- Colors ---
const COLORS = {
  primary: '#1a365d',       // Dark navy
  secondary: '#2b6cb0',     // Medium blue
  accent: '#3182ce',        // Bright blue
  success: '#276749',       // Green
  warning: '#c05621',       // Orange
  danger: '#c53030',        // Red
  lightBg: '#ebf4ff',       // Light blue bg
  lightGray: '#f7fafc',     // Very light gray
  medGray: '#e2e8f0',       // Medium gray
  darkGray: '#4a5568',      // Dark gray
  text: '#1a202c',          // Near black
  white: '#ffffff',
};

const outputPath = path.join(__dirname, '..', 'MAASISO-ANALYSE-RAPPORT.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: false,
  autoFirstPage: false,
  info: {
    Title: 'MaasISO.nl Website Analyse Rapport',
    Author: 'MaasISO Analytics',
    Subject: 'GA4 + GSC Analyse',
  },
});
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

let pageNum = 0;

// Add footer to every page except the cover (page 1)
doc.on('pageAdded', () => {
  pageNum++;
  if (pageNum <= 1) return; // skip cover
  // We'll draw the footer line and left text at the bottom.
  // Save current y so we can restore it after drawing footer.
  const savedY = doc.y;
  doc.save();
  doc.rect(50, doc.page.height - 35, doc.page.width - 100, 0.5).fill('#e2e8f0');
  doc.fontSize(7).fillColor('#4a5568').font('Helvetica')
    .text('MaasISO.nl Analyse Rapport \u2014 8 maart 2026', 50, doc.page.height - 28, { lineBreak: false });
  doc.restore();
  doc.y = savedY;
});

// Manually add the first page
doc.addPage();

const PAGE_W = doc.page.width - 100; // usable width

// --- Drawing helpers ---

function ensureSpace(needed) {
  if (doc.y + needed > doc.page.height - 70) {
    doc.addPage();
  }
}

function drawCoverPage() {
  // Background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.primary);

  // Decorative elements
  doc.rect(0, 0, doc.page.width, 8).fill(COLORS.accent);
  doc.rect(0, doc.page.height - 8, doc.page.width, 8).fill(COLORS.accent);

  // Main title area — subtle lighter box
  doc.save();
  doc.roundedRect(50, 200, PAGE_W, 280, 8).fill('#1e4070');
  doc.restore();

  doc.fontSize(14).fillColor(COLORS.accent).font('Helvetica')
    .text('WEBSITE ANALYSE RAPPORT', 50, 230, { align: 'center', width: PAGE_W });

  doc.fontSize(42).fillColor(COLORS.white).font('Helvetica-Bold')
    .text('MaasISO.nl', 50, 260, { align: 'center', width: PAGE_W });

  doc.fontSize(16).fillColor('#cbd5e0').font('Helvetica')
    .text('Volledige GA4 & Google Search Console Analyse', 50, 320, { align: 'center', width: PAGE_W });

  doc.fontSize(12).fillColor('#a0aec0')
    .text('met concrete aanbevelingen voor contentstrategie', 50, 348, { align: 'center', width: PAGE_W });

  // Date box
  doc.roundedRect(180, 420, 240, 40, 4).fill(COLORS.accent);
  doc.fontSize(14).fillColor(COLORS.white).font('Helvetica-Bold')
    .text('8 maart 2026', 180, 432, { align: 'center', width: 240 });

  // Period
  doc.fontSize(11).fillColor('#a0aec0').font('Helvetica')
    .text('Periode: afgelopen 90 dagen', 50, 490, { align: 'center', width: PAGE_W });

  // Footer info
  doc.fontSize(10).fillColor('#718096')
    .text('Data verzameld via Google Analytics 4 Data API & Search Console API', 50, 700, { align: 'center', width: PAGE_W })
    .text('Service account: maasiso-bot@maasiso-analytics-management', 50, 716, { align: 'center', width: PAGE_W });

  doc.addPage();
}

function drawSectionTitle(title, subtitle) {
  doc.addPage();
  // Section header band
  doc.rect(0, 0, doc.page.width, 120).fill(COLORS.primary);
  doc.rect(0, 120, doc.page.width, 4).fill(COLORS.accent);

  doc.fontSize(28).fillColor(COLORS.white).font('Helvetica-Bold')
    .text(title, 50, 40, { width: PAGE_W });
  if (subtitle) {
    doc.fontSize(13).fillColor('#93c5fd').font('Helvetica')
      .text(subtitle, 50, 80, { width: PAGE_W });
  }
  doc.y = 145;
}

function drawSubHeader(title) {
  ensureSpace(40);
  doc.moveDown(0.6);
  const y = doc.y;
  doc.rect(50, y, PAGE_W, 28).fill(COLORS.lightBg);
  doc.rect(50, y, 4, 28).fill(COLORS.accent);
  doc.fontSize(12).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text(title, 62, y + 7, { width: PAGE_W - 20 });
  doc.y = y + 36;
}

function drawKPI(label, value, x, y, w) {
  doc.roundedRect(x, y, w, 60, 4)
    .lineWidth(1).strokeColor(COLORS.medGray).fillAndStroke(COLORS.white, COLORS.medGray);
  doc.fontSize(9).fillColor(COLORS.darkGray).font('Helvetica')
    .text(label, x + 8, y + 8, { width: w - 16 });
  doc.fontSize(18).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text(value, x + 8, y + 28, { width: w - 16 });
}

function drawKPIRow(kpis) {
  ensureSpace(75);
  const y = doc.y;
  const gap = 10;
  const w = (PAGE_W - gap * (kpis.length - 1)) / kpis.length;
  kpis.forEach((kpi, i) => {
    drawKPI(kpi.label, kpi.value, 50 + i * (w + gap), y, w);
  });
  doc.y = y + 70;
}

function drawTable(headers, rows, opts = {}) {
  const colWidths = opts.colWidths || null;
  const maxRows = opts.maxRows || rows.length;
  const displayRows = rows.slice(0, maxRows);

  // Calculate column widths
  let widths;
  if (colWidths) {
    widths = colWidths.map(w => w * PAGE_W);
  } else {
    // Auto-calculate: first col gets more space
    const n = headers.length;
    const firstW = Math.min(0.35, 0.5 / (n > 3 ? 1 : 1));
    const restW = (1 - firstW) / (n - 1);
    widths = headers.map((_, i) => (i === 0 ? firstW : restW) * PAGE_W);
  }

  const rowH = 20;
  const headerH = 24;
  const tableH = headerH + displayRows.length * rowH;

  ensureSpace(headerH + Math.min(5, displayRows.length) * rowH + 10);

  let y = doc.y;

  // Header
  doc.rect(50, y, PAGE_W, headerH).fill(COLORS.primary);
  let x = 50;
  headers.forEach((h, i) => {
    doc.fontSize(8).fillColor(COLORS.white).font('Helvetica-Bold')
      .text(h, x + 4, y + 7, { width: widths[i] - 8, ellipsis: true });
    x += widths[i];
  });
  y += headerH;

  // Rows
  displayRows.forEach((row, ri) => {
    if (y + rowH > doc.page.height - 60) {
      doc.addPage();
      y = doc.y;
      // Re-draw header
      doc.rect(50, y, PAGE_W, headerH).fill(COLORS.primary);
      let hx = 50;
      headers.forEach((h, i) => {
        doc.fontSize(8).fillColor(COLORS.white).font('Helvetica-Bold')
          .text(h, hx + 4, y + 7, { width: widths[i] - 8, ellipsis: true });
        hx += widths[i];
      });
      y += headerH;
    }

    const bgColor = ri % 2 === 0 ? COLORS.white : COLORS.lightGray;
    doc.rect(50, y, PAGE_W, rowH).fill(bgColor);

    x = 50;
    row.forEach((cell, ci) => {
      const align = ci > 0 ? 'right' : 'left';
      doc.fontSize(8).fillColor(COLORS.text).font('Helvetica')
        .text(String(cell || ''), x + 4, y + 5, {
          width: widths[ci] - 8, ellipsis: true, align,
        });
      x += widths[ci];
    });
    y += rowH;
  });

  // Bottom border
  doc.rect(50, y, PAGE_W, 1).fill(COLORS.medGray);
  doc.y = y + 8;
}

function drawBulletList(items) {
  items.forEach(item => {
    ensureSpace(30);
    const y = doc.y;
    doc.fontSize(7).fillColor(COLORS.accent).font('Helvetica-Bold')
      .text('\u25CF', 58, y + 1);
    doc.fontSize(9).fillColor(COLORS.text).font('Helvetica')
      .text(item, 70, y, { width: PAGE_W - 28 });
    doc.moveDown(0.2);
  });
}

function drawPriorityItem(num, title, detail, color) {
  ensureSpace(42);
  const y = doc.y;

  // Number badge
  doc.circle(64, y + 10, 10).fill(color || COLORS.accent);
  doc.fontSize(10).fillColor(COLORS.white).font('Helvetica-Bold')
    .text(String(num), 56, y + 4, { width: 16, align: 'center' });

  doc.fontSize(10).fillColor(COLORS.text).font('Helvetica-Bold')
    .text(title, 82, y + 2, { width: PAGE_W - 40 });
  doc.fontSize(8).fillColor(COLORS.darkGray).font('Helvetica')
    .text(detail, 82, y + 16, { width: PAGE_W - 40 });

  doc.y = Math.max(doc.y, y + 34);
}

function drawInfoBox(text, color) {
  ensureSpace(50);
  const y = doc.y;
  const textOpts = { width: PAGE_W - 24 };
  const textH = doc.fontSize(9).heightOfString(text, textOpts) + 16;
  doc.roundedRect(50, y, PAGE_W, textH, 4).fill(color || COLORS.lightBg);
  doc.rect(50, y, 4, textH).fill(COLORS.accent);
  doc.fontSize(9).fillColor(COLORS.text).font('Helvetica')
    .text(text, 62, y + 8, textOpts);
  doc.y = y + textH + 8;
}

function drawAlertBox(title, text) {
  ensureSpace(60);
  const y = doc.y;
  const textOpts = { width: PAGE_W - 24 };
  const textH = doc.fontSize(9).heightOfString(text, textOpts) + 30;
  doc.roundedRect(50, y, PAGE_W, textH, 4).lineWidth(1).fillAndStroke('#fff5f5', '#feb2b2');
  doc.rect(50, y, 4, textH).fill(COLORS.danger);
  doc.fontSize(10).fillColor(COLORS.danger).font('Helvetica-Bold')
    .text(title, 62, y + 8, { width: PAGE_W - 24 });
  doc.fontSize(9).fillColor(COLORS.text).font('Helvetica')
    .text(text, 62, y + 24, textOpts);
  doc.y = y + textH + 8;
}

// =====================================================================
// BUILD THE PDF
// =====================================================================

// --- COVER ---
drawCoverPage();

// --- TABLE OF CONTENTS ---
doc.rect(0, 0, doc.page.width, 80).fill(COLORS.primary);
doc.fontSize(22).fillColor(COLORS.white).font('Helvetica-Bold')
  .text('Inhoudsopgave', 50, 28, { width: PAGE_W });
doc.rect(0, 80, doc.page.width, 3).fill(COLORS.accent);
doc.y = 110;

const tocItems = [
  ['Deel A', 'Google Analytics 4 — Diepte-analyse'],
  ['  A1', 'Verkeer & Trends'],
  ['  A2', 'Pagina-prestaties'],
  ['  A3', 'Content & Blog Analyse'],
  ['  A4', 'Conversies & Formulier'],
  ['  A5', 'Gebruikersgedrag'],
  ['Deel B', 'Google Search Console — SEO Analyse'],
  ['  B1', 'Zoekprestaties Overzicht'],
  ['  B2', 'Keyword Analyse'],
  ['  B3', 'Pagina-analyse vanuit Search'],
  ['  B4', 'Content Gap Analyse'],
  ['Deel C', 'Gecombineerde Inzichten & Aanbevelingen'],
  ['  C1', 'Content Strategie Aanbevelingen'],
  ['  C2', 'Quick Wins'],
  ['  C3', 'Lange Termijn Kansen'],
];

tocItems.forEach(([code, title]) => {
  const y = doc.y;
  const isMain = !code.startsWith(' ');
  const font = isMain ? 'Helvetica-Bold' : 'Helvetica';
  const size = isMain ? 12 : 10;
  const color = isMain ? COLORS.primary : COLORS.darkGray;
  const indent = isMain ? 0 : 24;
  const codeW = isMain ? 55 : 30;

  // Draw code and title separately on one line
  doc.fontSize(size).fillColor(color).font(font)
    .text(code.trim(), 60 + indent, y, { width: codeW, lineBreak: false });
  doc.fontSize(size).fillColor(color).font('Helvetica')
    .text(title, 60 + indent + codeW + 4, y, { width: PAGE_W - indent - codeW - 30 });

  if (isMain) doc.moveDown(0.3);
  else doc.moveDown(0.1);
});

// =====================================================================
// DEEL A: GA4
// =====================================================================
drawSectionTitle('Deel A: Google Analytics 4', 'Diepte-analyse van websiteverkeer, gedrag en conversies');

// --- A1 VERKEER & TRENDS ---
drawSubHeader('A1. Verkeer & Trends — Overzicht');

// KPIs 30d
if (ga4Data.overview30d?.[0]) {
  const m = ga4Data.overview30d[0].metrics;
  doc.fontSize(9).fillColor(COLORS.darkGray).font('Helvetica')
    .text('Laatste 30 dagen:', 50, doc.y);
  doc.moveDown(0.3);
  drawKPIRow([
    { label: 'Sessies', value: fmt(m[0]) },
    { label: 'Gebruikers', value: fmt(m[1]) },
    { label: 'Nieuwe gebruikers', value: fmt(m[2]) },
    { label: 'Engagement rate', value: pct(m[3]) },
  ]);
  drawKPIRow([
    { label: 'Gem. sessieduur', value: dur(m[4]) },
    { label: "Pagina's / sessie", value: round2(m[5]) },
    { label: 'Bounce rate', value: pct(m[6]) },
    { label: 'Paginaweergaven', value: fmt(m[7]) },
  ]);
}

// 90d summary
if (ga4Data.overview90d?.[0]) {
  const m = ga4Data.overview90d[0].metrics;
  doc.fontSize(9).fillColor(COLORS.darkGray).font('Helvetica')
    .text('Laatste 90 dagen:', 50, doc.y);
  doc.moveDown(0.3);
  drawKPIRow([
    { label: 'Sessies', value: fmt(m[0]) },
    { label: 'Gebruikers', value: fmt(m[1]) },
    { label: 'Engagement rate', value: pct(m[3]) },
    { label: 'Paginaweergaven', value: fmt(m[7]) },
  ]);
}

// Traffic sources
drawSubHeader('Verkeersbronnen (90 dagen)');
if (ga4Data.trafficSources) {
  drawTable(
    ['Kanaal', 'Sessies', 'Gebruikers', 'Engagement', 'Gem. duur', 'Bounce', 'Key Events'],
    ga4Data.trafficSources.map(r => [
      r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), dur(r.metrics[3]), pct(r.metrics[4]), fmt(r.metrics[5])
    ]),
    { colWidths: [0.22, 0.11, 0.13, 0.14, 0.13, 0.13, 0.14] }
  );
}

// Day of week
drawSubHeader('Sessies per dag van de week');
if (ga4Data.dayOfWeek) {
  drawTable(
    ['Dag', 'Sessies', 'Engagement rate'],
    ga4Data.dayOfWeek.map(r => [r.dims[0], fmt(r.metrics[0]), pct(r.metrics[1])]),
    { colWidths: [0.4, 0.3, 0.3] }
  );
}

// Peak hours
drawSubHeader('Piekuren');
if (ga4Data.hourOfDay) {
  const sorted = [...ga4Data.hourOfDay].sort((a, b) => Number(b.metrics[0]) - Number(a.metrics[0]));
  drawTable(
    ['Uur', 'Sessies'],
    sorted.slice(0, 8).map(r => [r.dims[0] + ':00', fmt(r.metrics[0])]),
    { colWidths: [0.5, 0.5] }
  );
}

// Cities
drawSubHeader('Top steden (90 dagen)');
if (ga4Data.cities) {
  drawTable(
    ['Stad', 'Sessies', 'Gebruikers', 'Engagement'],
    ga4Data.cities.slice(0, 12).map(r => [
      r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1]), pct(r.metrics[2])
    ]),
    { colWidths: [0.35, 0.2, 0.22, 0.23] }
  );
}

// Devices
drawSubHeader('Apparaten');
if (ga4Data.devices) {
  drawTable(
    ['Apparaat', 'Sessies', 'Gebruikers', 'Engagement', 'Gem. duur', 'Bounce'],
    ga4Data.devices.map(r => [
      r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), dur(r.metrics[3]), pct(r.metrics[4])
    ]),
    { colWidths: [0.2, 0.15, 0.17, 0.17, 0.15, 0.16] }
  );
}

// --- A2 PAGINA-PRESTATIES ---
drawSectionTitle('A2. Pagina-prestaties', 'Analyse van top pagina\'s, landing pages en slechtst presterende pagina\'s');

drawSubHeader("Top 20 pagina's op paginaweergaven");
if (ga4Data.topPages) {
  drawTable(
    ['Pagina', 'Weergaven', 'Sessies', 'Engagement', 'Gem. duur', 'Bounce'],
    ga4Data.topPages.slice(0, 20).map(r => [
      r.dims[0].substring(0, 45), fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), dur(r.metrics[3]), pct(r.metrics[4])
    ]),
    { colWidths: [0.32, 0.13, 0.12, 0.15, 0.14, 0.14] }
  );
}

drawSubHeader('Top landing pages');
if (ga4Data.landingPages) {
  drawTable(
    ['Landing page', 'Sessies', 'Gebruikers', 'Engagement', 'Bounce', 'Key Events'],
    ga4Data.landingPages.slice(0, 15).map(r => [
      r.dims[0].substring(0, 42), fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), pct(r.metrics[3]), fmt(r.metrics[5])
    ]),
    { colWidths: [0.32, 0.12, 0.14, 0.15, 0.13, 0.14] }
  );
}

drawSubHeader("Slechtst presterende pagina's (hoog bounce, min. 5 weergaven)");
if (ga4Data.worstPages) {
  const filtered = ga4Data.worstPages.filter(r => Number(r.metrics[0]) >= 5);
  drawTable(
    ['Pagina', 'Weergaven', 'Bounce rate', 'Engagement', 'Gem. duur'],
    filtered.slice(0, 12).map(r => [
      r.dims[0].substring(0, 45), fmt(r.metrics[0]),
      pct(r.metrics[1]), pct(r.metrics[2]), dur(r.metrics[3])
    ]),
    { colWidths: [0.35, 0.15, 0.17, 0.17, 0.16] }
  );
}

// --- A3 BLOG ---
drawSectionTitle('A3. Content & Blog Analyse', 'Prestaties van blogposts en contenttrends');

drawSubHeader('Blog pagina prestaties');
if (ga4Data.blogPages && ga4Data.blogPages.length > 0) {
  drawTable(
    ['Blog pagina', 'Weergaven', 'Sessies', 'Engagement', 'Gem. duur', 'Bounce'],
    ga4Data.blogPages.slice(0, 20).map(r => [
      r.dims[0].substring(0, 45), fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), dur(r.metrics[3]), pct(r.metrics[4])
    ]),
    { colWidths: [0.32, 0.13, 0.12, 0.15, 0.14, 0.14] }
  );
} else {
  drawInfoBox('Geen blog data gevonden in de afgelopen 90 dagen.');
}

drawSubHeader('Blog traffic per maand');
if (ga4Data.blogMonthly && ga4Data.blogMonthly.length > 0) {
  drawTable(
    ['Maand', 'Weergaven', 'Sessies', 'Gebruikers'],
    ga4Data.blogMonthly.map(r => [r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1]), fmt(r.metrics[2])]),
    { colWidths: [0.25, 0.25, 0.25, 0.25] }
  );
}

// --- A4 CONVERSIES ---
drawSectionTitle('A4. Conversies & Formulier', 'Events, key events en conversieratio\'s per bron en landing page');

drawSubHeader('Events overzicht (top 15)');
if (ga4Data.events) {
  drawTable(
    ['Event', 'Aantal', 'Gebruikers'],
    ga4Data.events.slice(0, 15).map(r => [r.dims[0], fmt(r.metrics[0]), fmt(r.metrics[1])]),
    { colWidths: [0.45, 0.28, 0.27] }
  );
}

drawSubHeader('Key Events per verkeersbron');
if (ga4Data.conversionsBySource) {
  drawTable(
    ['Kanaal', 'Sessies', 'Key Events', 'Conversieratio'],
    ga4Data.conversionsBySource.map(r => {
      const s = Number(r.metrics[0]), c = Number(r.metrics[1]);
      return [r.dims[0], fmt(s), fmt(c), s > 0 ? ((c/s)*100).toFixed(1) + '%' : '0%'];
    }),
    { colWidths: [0.3, 0.2, 0.25, 0.25] }
  );
}

drawSubHeader('Key Events per landing page');
if (ga4Data.conversionsByLanding) {
  drawTable(
    ['Landing page', 'Sessies', 'Key Events', 'Conversieratio'],
    ga4Data.conversionsByLanding.slice(0, 12).map(r => {
      const s = Number(r.metrics[0]), c = Number(r.metrics[1]);
      return [r.dims[0].substring(0, 45), fmt(s), fmt(c), s > 0 ? ((c/s)*100).toFixed(1) + '%' : '0%'];
    }),
    { colWidths: [0.35, 0.18, 0.22, 0.25] }
  );
}

// --- A5 GEBRUIKERSGEDRAG ---
drawSectionTitle('A5. Gebruikersgedrag', 'Nieuwe vs terugkerende bezoekers, engagement per bron');

drawSubHeader('Nieuwe vs terugkerende bezoekers');
if (ga4Data.newVsReturning) {
  drawTable(
    ['Type', 'Sessies', 'Gebruikers', 'Engagement', 'Gem. duur', 'Bounce', 'Key Events'],
    ga4Data.newVsReturning.map(r => [
      r.dims[0] === 'new' ? 'Nieuw' : r.dims[0] === 'returning' ? 'Terugkerend' : r.dims[0],
      fmt(r.metrics[0]), fmt(r.metrics[1]), pct(r.metrics[2]),
      dur(r.metrics[3]), pct(r.metrics[4]), fmt(r.metrics[5])
    ]),
    { colWidths: [0.17, 0.12, 0.14, 0.15, 0.14, 0.13, 0.15] }
  );
}

drawSubHeader('Engagement per verkeersbron');
if (ga4Data.engagementBySource) {
  drawTable(
    ['Kanaal', 'Sessies', 'Engagement', 'Engaged sess.', 'Gem. duur', 'Pag/sessie'],
    ga4Data.engagementBySource.map(r => [
      r.dims[0], fmt(r.metrics[0]), pct(r.metrics[1]),
      fmt(r.metrics[2]), dur(r.metrics[3]), round2(r.metrics[4])
    ]),
    { colWidths: [0.22, 0.14, 0.16, 0.18, 0.15, 0.15] }
  );
}

drawSubHeader('Top bron / medium');
if (ga4Data.sourceMedium) {
  drawTable(
    ['Bron / Medium', 'Sessies', 'Gebruikers', 'Engagement', 'Bounce', 'Key Events'],
    ga4Data.sourceMedium.slice(0, 12).map(r => [
      r.dims[0].substring(0, 30), fmt(r.metrics[0]), fmt(r.metrics[1]),
      pct(r.metrics[2]), pct(r.metrics[3]), fmt(r.metrics[4])
    ]),
    { colWidths: [0.28, 0.13, 0.14, 0.16, 0.14, 0.15] }
  );
}

// =====================================================================
// DEEL B: GSC
// =====================================================================
drawSectionTitle('Deel B: Google Search Console', 'SEO analyse — zoekprestaties, keywords en pagina-analyse');

// B1 Overview
drawSubHeader('B1. Zoekprestaties Overzicht');

if (gscData.overview28d?.[0]) {
  const r = gscData.overview28d[0];
  doc.fontSize(9).fillColor(COLORS.darkGray).font('Helvetica')
    .text('Laatste 28 dagen:', 50, doc.y);
  doc.moveDown(0.3);
  drawKPIRow([
    { label: 'Clicks', value: fmt(r.clicks) },
    { label: 'Impressies', value: fmt(r.impressions) },
    { label: 'CTR', value: (r.ctr * 100).toFixed(1) + '%' },
    { label: 'Gem. positie', value: r.position.toFixed(1) },
  ]);
}

if (gscData.overview90d?.[0]) {
  const r = gscData.overview90d[0];
  doc.fontSize(9).fillColor(COLORS.darkGray).font('Helvetica')
    .text('Laatste 90 dagen:', 50, doc.y);
  doc.moveDown(0.3);
  drawKPIRow([
    { label: 'Clicks', value: fmt(r.clicks) },
    { label: 'Impressies', value: fmt(r.impressions) },
    { label: 'CTR', value: (r.ctr * 100).toFixed(1) + '%' },
    { label: 'Gem. positie', value: r.position.toFixed(1) },
  ]);
}

// Trend comparison
if (gscData.overview28d?.[0] && gscData.previous28d?.[0]) {
  const curr = gscData.overview28d[0], prev = gscData.previous28d[0];
  const clickPct = ((curr.clicks - prev.clicks) / (prev.clicks || 1) * 100).toFixed(0);
  const imprPct = ((curr.impressions - prev.impressions) / (prev.impressions || 1) * 100).toFixed(0);
  drawInfoBox(
    `Trend (28d vs vorige 28d): Clicks ${clickPct > 0 ? '+' : ''}${clickPct}% | Impressies ${imprPct > 0 ? '+' : ''}${imprPct}% | ` +
    `CTR ${(curr.ctr*100).toFixed(1)}% vs ${(prev.ctr*100).toFixed(1)}% | Positie ${curr.position.toFixed(1)} vs ${prev.position.toFixed(1)}`
  );
}

// B2 Keywords
drawSubHeader('B2. Top 30 zoekwoorden op clicks');
if (gscData.keywordsByClicks) {
  drawTable(
    ['Zoekwoord', 'Clicks', 'Impressies', 'CTR', 'Positie'],
    gscData.keywordsByClicks.slice(0, 30).map(r => [
      r.keys[0].substring(0, 40), fmt(r.clicks), fmt(r.impressions),
      (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ]),
    { colWidths: [0.35, 0.13, 0.18, 0.15, 0.19] }
  );
}

drawSubHeader('Quick Wins — Veel impressies, lage CTR (<3%)');
if (gscData.keywordsByImpressions) {
  const qw = gscData.keywordsByImpressions
    .filter(r => r.impressions >= 20 && r.ctr < 0.03 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions);
  drawTable(
    ['Zoekwoord', 'Impressies', 'Clicks', 'CTR', 'Positie'],
    qw.slice(0, 20).map(r => [
      r.keys[0].substring(0, 40), fmt(r.impressions), fmt(r.clicks),
      (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ]),
    { colWidths: [0.35, 0.18, 0.13, 0.15, 0.19] }
  );
}

drawSubHeader('Bijna top 3 — Positie 4-10');
if (gscData.keywordsByClicks) {
  const nt = gscData.keywordsByClicks
    .filter(r => r.position >= 4 && r.position <= 10 && r.impressions >= 10)
    .sort((a, b) => a.position - b.position);
  if (nt.length > 0) {
    drawTable(
      ['Zoekwoord', 'Positie', 'Clicks', 'Impressies', 'CTR'],
      nt.slice(0, 15).map(r => [
        r.keys[0].substring(0, 40), r.position.toFixed(1), fmt(r.clicks),
        fmt(r.impressions), (r.ctr * 100).toFixed(1) + '%'
      ]),
      { colWidths: [0.35, 0.15, 0.15, 0.18, 0.17] }
    );
  }
}

drawSubHeader('Bijna pagina 1 — Positie 11-20');
if (gscData.keywordsByImpressions) {
  const np = gscData.keywordsByImpressions
    .filter(r => r.position >= 11 && r.position <= 20 && r.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions);
  if (np.length > 0) {
    drawTable(
      ['Zoekwoord', 'Positie', 'Impressies', 'Clicks', 'CTR'],
      np.slice(0, 15).map(r => [
        r.keys[0].substring(0, 40), r.position.toFixed(1), fmt(r.impressions),
        fmt(r.clicks), (r.ctr * 100).toFixed(1) + '%'
      ]),
      { colWidths: [0.35, 0.15, 0.18, 0.15, 0.17] }
    );
  }
}

// Keyword clusters
drawSubHeader('Zoekwoorden per thema-cluster');
const themes = {
  'ISO 9001': [], 'ISO 27001': [], 'ISO 14001': [], 'ISO 45001': [],
  'Audit': [], 'Risico': [], 'AVG/Privacy': [], 'ISMS': [], 'BIO': [],
};
if (gscData.keywordsByClicks) {
  gscData.keywordsByClicks.forEach(r => {
    const q = r.keys[0].toLowerCase();
    if (q.includes('9001')) themes['ISO 9001'].push(r);
    else if (q.includes('27001') || q.includes('informatiebeveiliging')) themes['ISO 27001'].push(r);
    else if (q.includes('14001') || q.includes('milieu')) themes['ISO 14001'].push(r);
    else if (q.includes('45001') || q.includes('arbo')) themes['ISO 45001'].push(r);
    else if (q.includes('audit')) themes['Audit'].push(r);
    else if (q.includes('risico')) themes['Risico'].push(r);
    else if (q.includes('avg') || q.includes('privacy')) themes['AVG/Privacy'].push(r);
    else if (q.includes('isms')) themes['ISMS'].push(r);
    else if (q.includes('bio')) themes['BIO'].push(r);
  });

  const clusterRows = Object.entries(themes)
    .filter(([, kws]) => kws.length > 0)
    .map(([theme, kws]) => {
      const clicks = kws.reduce((s, r) => s + r.clicks, 0);
      const impr = kws.reduce((s, r) => s + r.impressions, 0);
      return [theme, String(kws.length), fmt(impr), fmt(clicks)];
    });

  drawTable(
    ['Thema', 'Zoekwoorden', 'Impressies', 'Clicks'],
    clusterRows,
    { colWidths: [0.3, 0.2, 0.25, 0.25] }
  );
}

// B3 Pages from search
drawSubHeader("B3. Top pagina's op organische clicks");
if (gscData.pagesByClicks) {
  drawTable(
    ['Pagina', 'Clicks', 'Impressies', 'CTR', 'Positie'],
    gscData.pagesByClicks.slice(0, 20).map(r => [
      r.keys[0].replace('https://www.maasiso.nl', '').replace('https://maasiso.nl', '').substring(0, 48) || '/',
      fmt(r.clicks), fmt(r.impressions), (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ]),
    { colWidths: [0.38, 0.12, 0.18, 0.14, 0.18] }
  );
}

drawSubHeader("Pagina's met veel impressies maar weinig clicks");
if (gscData.pagesByImpressions) {
  const lcp = gscData.pagesByImpressions
    .filter(r => r.impressions >= 50 && r.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions);
  drawTable(
    ['Pagina', 'Impressies', 'Clicks', 'CTR', 'Positie'],
    lcp.slice(0, 12).map(r => [
      r.keys[0].replace('https://www.maasiso.nl', '').replace('https://maasiso.nl', '').substring(0, 48) || '/',
      fmt(r.impressions), fmt(r.clicks), (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ]),
    { colWidths: [0.38, 0.18, 0.12, 0.14, 0.18] }
  );
}

// Device + country
drawSubHeader('B5. Apparaten & landen (zoekverkeer)');
if (gscData.deviceBreakdown) {
  drawTable(
    ['Apparaat', 'Clicks', 'Impressies', 'CTR', 'Positie'],
    gscData.deviceBreakdown.map(r => [
      r.keys[0], fmt(r.clicks), fmt(r.impressions),
      (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ]),
    { colWidths: [0.25, 0.18, 0.22, 0.17, 0.18] }
  );
}
if (gscData.countryBreakdown) {
  drawTable(
    ['Land', 'Clicks', 'Impressies', 'CTR', 'Positie'],
    gscData.countryBreakdown.slice(0, 8).map(r => [
      r.keys[0], fmt(r.clicks), fmt(r.impressions),
      (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)
    ]),
    { colWidths: [0.25, 0.18, 0.22, 0.17, 0.18] }
  );
}

// =====================================================================
// DEEL C: AANBEVELINGEN
// =====================================================================
drawSectionTitle('Deel C: Aanbevelingen', 'Concrete acties op basis van de gecombineerde GA4 & GSC data');

// Critical alerts
drawAlertBox(
  'WAARSCHUWING: Google Ads levert 0 conversies',
  'Paid Search: 23 sessies, 65,2% bounce rate, 0 key events, gemiddelde sessieduur 40 seconden. ' +
  'Organisch verkeer presteert 20x beter. Overweeg Ads te pauzeren of landing pages te optimaliseren.'
);

drawAlertBox(
  'WAARSCHUWING: Eigen verkeer vertekent data',
  '144 van 354 sessies (41%) komen uit Lelystad — waarschijnlijk eigen bezoeken. ' +
  'Stel een IP-filter in via GA4 > Admin > Data Streams > Internal Traffic.'
);

doc.moveDown(0.5);

// C1 Content Strategy
drawSubHeader('C1. Content Strategie — Nieuwe blogposts (prioriteit)');

const blogIdeas = [];
if (gscData.keywordsByImpressions) {
  gscData.keywordsByImpressions
    .filter(r => r.impressions >= 20 && r.position > 5 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10)
    .forEach(r => blogIdeas.push(r));
}

blogIdeas.forEach((r, i) => {
  drawPriorityItem(
    i + 1,
    `"${r.keys[0]}"`,
    `${r.impressions} impressies, positie ${r.position.toFixed(1)} — met dedicated content naar top 5`,
    i < 3 ? COLORS.danger : i < 6 ? COLORS.warning : COLORS.accent
  );
});

doc.moveDown(0.5);

drawSubHeader('Bestaande content optimaliseren (title/meta)');
if (gscData.pagesByClicks) {
  const toOpt = gscData.pagesByClicks
    .filter(r => r.ctr < 0.05 && r.impressions >= 30)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 6);

  toOpt.forEach((r, i) => {
    const page = r.keys[0].replace('https://www.maasiso.nl', '').replace('https://maasiso.nl', '') || '/';
    drawPriorityItem(
      i + 1,
      page,
      `CTR: ${(r.ctr*100).toFixed(1)}% bij ${fmt(r.impressions)} impressies — title en meta description verbeteren`,
      COLORS.warning
    );
  });
}

// C2 Quick wins
drawSubHeader('C2. Quick Wins — Zoekwoorden snel naar top 3');
if (gscData.keywordsByClicks) {
  const at3 = gscData.keywordsByClicks
    .filter(r => r.position >= 3.5 && r.position <= 8 && r.impressions >= 10)
    .sort((a, b) => a.position - b.position)
    .slice(0, 8);

  at3.forEach((r, i) => {
    drawPriorityItem(
      i + 1,
      `"${r.keys[0]}" — positie ${r.position.toFixed(1)}`,
      `${r.clicks} clicks, ${r.impressions} impressies — content uitbreiden + interne links + title optimaliseren`,
      COLORS.success
    );
  });
}

// C3 Long term
drawSubHeader('C3. Lange termijn — Thema-clusters voor autoriteit');

const isoTopics2 = {
  'ISO 9001': { kws: 0, impr: 0 }, 'ISO 27001': { kws: 0, impr: 0 },
  'ISO 14001': { kws: 0, impr: 0 }, 'ISO 45001': { kws: 0, impr: 0 },
};

if (gscData.keywordsByImpressions) {
  gscData.keywordsByImpressions.forEach(r => {
    const q = r.keys[0].toLowerCase();
    if (q.includes('9001')) { isoTopics2['ISO 9001'].kws++; isoTopics2['ISO 9001'].impr += r.impressions; }
    else if (q.includes('27001')) { isoTopics2['ISO 27001'].kws++; isoTopics2['ISO 27001'].impr += r.impressions; }
    else if (q.includes('14001')) { isoTopics2['ISO 14001'].kws++; isoTopics2['ISO 14001'].impr += r.impressions; }
    else if (q.includes('45001')) { isoTopics2['ISO 45001'].kws++; isoTopics2['ISO 45001'].impr += r.impressions; }
  });
}

drawTable(
  ['Thema-cluster', 'Zoekwoorden', 'Totaal impressies', 'Aanbeveling'],
  Object.entries(isoTopics2).map(([t, d]) => [
    t, String(d.kws), fmt(d.impr), 'Pillar page + blogposts'
  ]),
  { colWidths: [0.2, 0.18, 0.22, 0.4] }
);

doc.moveDown(0.5);

drawInfoBox(
  'Google Ads: Switch de primaire conversie-actie van ads_conversion_Contact_1 naar generate_lead. ' +
  'Maak specifieke landing pages per advertentiegroep. Overweeg budget tijdelijk te pauzeren tot landing pages klaar zijn.'
);

drawInfoBox(
  'Mobiel: Bounce rate op mobiel (48,7%) is veel hoger dan desktop (30%). Focus op mobile-first optimalisatie: ' +
  'snellere laadtijden, grotere CTAs, minder scrolldiepte nodig voor contactformulier.'
);

doc.end();

stream.on('finish', () => {
  console.log(`PDF rapport opgeslagen: ${outputPath}`);
  console.log(`Totaal pagina's: ${pageNum}`);
});
