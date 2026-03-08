import jsPDF from 'jspdf';
import type { TRAReport, HazardAssessment } from './tra-types';
import { getRiskLabel, getRiskLevel, getFactorLabel } from './kinney';

const NAVY = '#091E42';
const TEAL = '#00875A';
const ORANGE = '#FF8B00';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F3F4F6';
const RED = '#EF4444';
const YELLOW = '#EAB308';
const GREEN = '#22C55E';

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function getLevelColor(level: string): [number, number, number] {
  switch (level) {
    case 'onacceptabel': return [239, 68, 68];
    case 'aandacht': return [234, 179, 8];
    case 'acceptabel': return [34, 197, 94];
    default: return [107, 114, 128];
  }
}

function getLevelBgColor(level: string): [number, number, number] {
  switch (level) {
    case 'onacceptabel': return [254, 226, 226];
    case 'aandacht': return [254, 249, 195];
    case 'acceptabel': return [220, 252, 231];
    default: return [243, 244, 246];
  }
}

export function generateTRAPdf(report: TRAReport): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;
  let pageNum = 1;

  const allHazards = report.workSteps.flatMap((s) =>
    s.hazards.map((h) => ({ ...h, stepName: s.name }))
  );

  function addFooter() {
    doc.setFontSize(8);
    doc.setTextColor(...hexToRgb(GRAY));
    doc.text('Gegenereerd via maasiso.nl/tools/risicoscore-calculator', margin, pageHeight - 10);
    doc.text(`Pagina ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text(new Date().toLocaleDateString('nl-NL'), pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - 20) {
      addFooter();
      doc.addPage();
      pageNum++;
      y = margin;
    }
  }

  function drawSectionTitle(title: string) {
    checkPageBreak(20);
    doc.setFillColor(...hexToRgb(NAVY));
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 5, y + 7);
    y += 14;
  }

  // ════════════════════════════════════════════
  // PAGE 1: COVER
  // ════════════════════════════════════════════
  doc.setFillColor(...hexToRgb(NAVY));
  doc.rect(0, 0, pageWidth, 100, 'F');

  doc.setFillColor(...hexToRgb(ORANGE));
  doc.rect(0, 100, pageWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text('Taak Risico Analyse', margin, 45);
  doc.setFontSize(14);
  doc.text('Kinney & Wiruth Risicobeoordeling', margin, 56);

  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text('MaasISO', pageWidth - margin, 88, { align: 'right' });

  // Project info
  y = 120;
  doc.setTextColor(...hexToRgb(NAVY));
  doc.setFontSize(11);

  const projectFields = [
    ['Projectnaam', report.project.name],
    ['Bedrijf', report.project.company],
    ['Locatie', report.project.location],
    ['Datum', report.project.date],
    ['Opgesteld door', report.project.author],
  ];

  for (const [label, value] of projectFields) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '-', margin + 40, y);
    y += 7;
  }

  // Summary stats
  const total = allHazards.length;
  const unacceptableBefore = allHazards.filter((h) => h.levelBefore === 'onacceptabel').length;
  const unacceptableAfter = allHazards.filter((h) => h.levelAfter === 'onacceptabel').length;
  const attentionBefore = allHazards.filter((h) => h.levelBefore === 'aandacht').length;
  const attentionAfter = allHazards.filter((h) => h.levelAfter === 'aandacht').length;
  const acceptableBefore = allHazards.filter((h) => h.levelBefore === 'acceptabel').length;
  const acceptableAfter = allHazards.filter((h) => h.levelAfter === 'acceptabel').length;
  const avgBefore = total > 0 ? Math.round(allHazards.reduce((s, h) => s + h.scoreBefore, 0) / total) : 0;
  const avgAfter = total > 0 ? Math.round(allHazards.reduce((s, h) => s + h.scoreAfter, 0) / total) : 0;
  const reductionPct = avgBefore > 0 ? Math.round(((avgBefore - avgAfter) / avgBefore) * 100) : 0;

  y += 10;
  doc.setFillColor(...hexToRgb(LIGHT_GRAY));
  doc.roundedRect(margin, y, contentWidth, 42, 3, 3, 'F');
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Samenvatting', margin + 5, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Totaal beoordeelde gevaren: ${total}`, margin + 5, y);
  y += 5;
  doc.text(`Werkstappen: ${report.workSteps.length}`, margin + 5, y);
  y += 5;
  doc.setTextColor(...hexToRgb(RED));
  doc.text(`Onacceptabel: ${unacceptableBefore} voor -> ${unacceptableAfter} na maatregelen`, margin + 5, y);
  y += 5;
  doc.setTextColor(...hexToRgb(YELLOW));
  doc.text(`Aandacht vereist: ${attentionBefore} voor -> ${attentionAfter} na maatregelen`, margin + 5, y);
  y += 5;
  doc.setTextColor(...hexToRgb(GREEN));
  doc.text(`Acceptabel: ${acceptableBefore} voor -> ${acceptableAfter} na maatregelen`, margin + 5, y);
  y += 5;
  if (reductionPct > 0) {
    doc.setTextColor(...hexToRgb(TEAL));
    doc.text(`Gemiddelde risicoverlaging: ${avgBefore} -> ${avgAfter} (-${reductionPct}%)`, margin + 5, y);
  }

  // Table of contents
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Inhoudsopgave', margin, y);
  y += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  const tocItems = [
    '1. Werkstappen & Gevaren',
    '2. Risico-prioriteitenlijst',
    '3. Actieplan',
    '4. Gedetailleerde Gevarenbladen',
    '5. Risicomatrix',
    '6. Conclusie & Aanbevelingen',
    '7. Bijlage: Kinney & Wiruth Methode',
  ];
  for (const item of tocItems) {
    doc.text(item, margin + 5, y);
    y += 4.5;
  }

  addFooter();

  // ════════════════════════════════════════════
  // SECTION 1: WORK STEPS & HAZARDS
  // ════════════════════════════════════════════
  doc.addPage();
  pageNum++;
  y = margin;

  drawSectionTitle('1. Werkstappen & Gevaren');

  for (const step of report.workSteps) {
    checkPageBreak(25);

    // Step header
    doc.setFillColor(230, 235, 245);
    doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(step.name, margin + 3, y + 6);
    y += 12;

    if (step.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...hexToRgb(GRAY));
      doc.text(step.description, margin + 3, y, { maxWidth: contentWidth - 6 });
      y += 6;
    }

    if (step.hazards.length === 0) {
      doc.setTextColor(...hexToRgb(GRAY));
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Geen gevaren toegevoegd', margin + 3, y);
      y += 8;
      continue;
    }

    // Table header row
    checkPageBreak(15);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, 10, 'F');

    const colGevaar = margin + 2;
    const colE1 = margin + 55;
    const colB1 = margin + 63;
    const colW1 = margin + 71;
    const colS1 = margin + 79;
    const colE2 = margin + 92;
    const colB2 = margin + 100;
    const colW2 = margin + 108;
    const colS2 = margin + 116;

    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(GRAY));
    doc.text('VOOR MAATREGELEN', colE1, y + 3.5);
    doc.text('NA MAATREGELEN', colE2, y + 3.5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text('Gevaar', colGevaar, y + 8);
    doc.text('E', colE1, y + 8);
    doc.text('B', colB1, y + 8);
    doc.text('W', colW1, y + 8);
    doc.text('Score', colS1, y + 8);
    doc.text('E', colE2, y + 8);
    doc.text('B', colB2, y + 8);
    doc.text('W', colW2, y + 8);
    doc.text('Score', colS2, y + 8);

    y += 12;

    for (const hazard of step.hazards) {
      checkPageBreak(18);

      const [r, g, b] = getLevelColor(hazard.levelBefore);
      doc.setFillColor(r, g, b);
      doc.rect(margin, y - 0.5, 2, 6, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(NAVY));
      const hazardName = hazard.hazardName.length > 35
        ? hazard.hazardName.substring(0, 33) + '...'
        : hazard.hazardName;
      doc.text(hazardName, colGevaar + 2, y + 3.5);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(String(hazard.effectBefore), colE1, y + 3.5);
      doc.text(String(hazard.exposureBefore), colB1, y + 3.5);
      doc.text(String(hazard.probabilityBefore), colW1, y + 3.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(r, g, b);
      doc.text(String(hazard.scoreBefore), colS1, y + 3.5);

      const [ar, ag, ab] = getLevelColor(hazard.levelAfter);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(NAVY));
      doc.text(String(hazard.effectAfter), colE2, y + 3.5);
      doc.text(String(hazard.exposureAfter), colB2, y + 3.5);
      doc.text(String(hazard.probabilityAfter), colW2, y + 3.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(ar, ag, ab);
      doc.text(String(hazard.scoreAfter), colS2, y + 3.5);

      y += 7;

      const allMeasures = [...hazard.selectedMeasures, ...hazard.customMeasures];
      if (allMeasures.length > 0) {
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...hexToRgb(GRAY));
        const measuresText = 'Maatregelen: ' + allMeasures.join('; ');
        const lines = doc.splitTextToSize(measuresText, contentWidth - 8);
        doc.text(lines, colGevaar + 2, y + 2);
        y += lines.length * 3.5 + 1;
      }

      doc.setTextColor(...hexToRgb(NAVY));
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(margin, y, margin + contentWidth, y);
      y += 2;
    }

    y += 5;
  }

  // ════════════════════════════════════════════
  // SECTION 2: RISK PRIORITY LIST
  // ════════════════════════════════════════════
  addFooter();
  doc.addPage();
  pageNum++;
  y = margin;

  drawSectionTitle('2. Risico-prioriteitenlijst');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('Alle gevaren gesorteerd op risicoscore (hoogste eerst). Focus op de bovenste items.', margin, y);
  y += 7;

  // Sort hazards by scoreBefore descending
  const sortedHazards = [...allHazards].sort((a, b) => b.scoreBefore - a.scoreBefore);

  // Table header
  checkPageBreak(12);
  doc.setFillColor(...hexToRgb(NAVY));
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 3, y + 5.5);
  doc.text('Gevaar', margin + 10, y + 5.5);
  doc.text('Werkstap', margin + 70, y + 5.5);
  doc.text('Score voor', margin + 115, y + 5.5);
  doc.text('Score na', margin + 140, y + 5.5);
  doc.text('Niveau', margin + 160, y + 5.5);
  y += 10;

  sortedHazards.forEach((hazard, idx) => {
    checkPageBreak(8);

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y - 1, contentWidth, 7, 'F');
    }

    // Color bar
    const [cr, cg, cb] = getLevelColor(hazard.levelBefore);
    doc.setFillColor(cr, cg, cb);
    doc.rect(margin, y - 1, 2, 7, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(String(idx + 1), margin + 3, y + 3.5);

    doc.setFont('helvetica', 'normal');
    const name = hazard.hazardName.length > 35 ? hazard.hazardName.substring(0, 33) + '...' : hazard.hazardName;
    doc.text(name, margin + 10, y + 3.5);

    const stepName = (hazard as HazardAssessment & { stepName: string }).stepName;
    const stepShort = stepName.length > 25 ? stepName.substring(0, 23) + '...' : stepName;
    doc.text(stepShort, margin + 70, y + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cr, cg, cb);
    doc.text(String(hazard.scoreBefore), margin + 120, y + 3.5);

    const [ar2, ag2, ab2] = getLevelColor(hazard.levelAfter);
    doc.setTextColor(ar2, ag2, ab2);
    doc.text(String(hazard.scoreAfter), margin + 145, y + 3.5);

    // Level badge
    const [bgr, bgg, bgb] = getLevelBgColor(hazard.levelBefore);
    doc.setFillColor(bgr, bgg, bgb);
    doc.roundedRect(margin + 158, y - 0.5, 20, 6, 1, 1, 'F');
    doc.setFontSize(5.5);
    doc.setTextColor(cr, cg, cb);
    const levelText = hazard.levelBefore === 'onacceptabel' ? 'Onaccept.' : getRiskLabel(hazard.levelBefore);
    doc.text(levelText, margin + 168, y + 3, { align: 'center' });

    y += 7;
  });

  // ════════════════════════════════════════════
  // SECTION 3: ACTION PLAN
  // ════════════════════════════════════════════
  addFooter();
  doc.addPage();
  pageNum++;
  y = margin;

  drawSectionTitle('3. Actieplan');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('Vul de verantwoordelijke, deadline en status in om dit actieplan als werkdocument te gebruiken.', margin, y);
  y += 7;

  // Action plan table header
  checkPageBreak(12);
  doc.setFillColor(...hexToRgb(NAVY));
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 2, y + 5.5);
  doc.text('Gevaar', margin + 8, y + 5.5);
  doc.text('Maatregel', margin + 50, y + 5.5);
  doc.text('Verantwoordelijke', margin + 110, y + 5.5);
  doc.text('Deadline', margin + 145, y + 5.5);
  doc.text('Status', margin + 168, y + 5.5);
  y += 10;

  let actionIdx = 0;
  for (const hazard of sortedHazards) {
    const measures = [...hazard.selectedMeasures, ...hazard.customMeasures];
    if (measures.length === 0) continue;

    for (const measure of measures) {
      actionIdx++;
      checkPageBreak(10);

      const isEven = actionIdx % 2 === 0;
      if (isEven) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, y - 1, contentWidth, 8, 'F');
      }

      // Color bar
      const [cr, cg, cb] = getLevelColor(hazard.levelBefore);
      doc.setFillColor(cr, cg, cb);
      doc.rect(margin, y - 1, 1.5, 8, 'F');

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(NAVY));
      doc.text(String(actionIdx), margin + 2.5, y + 4);

      doc.setFont('helvetica', 'normal');
      const hazName = hazard.hazardName.length > 25 ? hazard.hazardName.substring(0, 23) + '...' : hazard.hazardName;
      doc.text(hazName, margin + 8, y + 4);

      const measShort = measure.length > 38 ? measure.substring(0, 36) + '...' : measure;
      doc.text(measShort, margin + 50, y + 4);

      // Empty fields with dotted lines
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin + 110, y + 5, margin + 140, y + 5); // Verantwoordelijke
      doc.line(margin + 145, y + 5, margin + 165, y + 5); // Deadline

      // Checkbox
      doc.setDrawColor(...hexToRgb(GRAY));
      doc.setLineWidth(0.3);
      doc.rect(margin + 171, y, 4, 4);

      y += 8;
    }
  }

  if (actionIdx === 0) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...hexToRgb(GRAY));
    doc.text('Geen maatregelen gedefinieerd.', margin + 3, y);
    y += 8;
  }

  // ════════════════════════════════════════════
  // SECTION 4: DETAILED HAZARD SHEETS
  // ════════════════════════════════════════════
  addFooter();
  doc.addPage();
  pageNum++;
  y = margin;

  drawSectionTitle('4. Gedetailleerde Gevarenbladen');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('Per gevaar een gedetailleerd overzicht met volledige factorbeschrijvingen en risicoverlaging.', margin, y);
  y += 8;

  sortedHazards.forEach((hazard, idx) => {
    const stepName = (hazard as HazardAssessment & { stepName: string }).stepName;
    const blockHeight = 75;
    checkPageBreak(blockHeight);

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, blockHeight - 2, 2, 2, 'FD');

    // Header bar with color
    const [cr, cg, cb] = getLevelColor(hazard.levelBefore);
    doc.setFillColor(cr, cg, cb);
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
    // Fill bottom corners of header
    doc.rect(margin, y + 5, contentWidth, 4, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${idx + 1}. ${hazard.hazardName}`, margin + 4, y + 6.5);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Categorie: ${hazard.categoryName}  |  Werkstap: ${stepName}`, margin + 4, y + 6.5 + 5);
    // Reposition since we printed category inside colored area — let's use a slightly different layout
    y += 12;

    // Category and step info below header
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(GRAY));
    doc.text(`Categorie: ${hazard.categoryName}`, margin + 4, y);
    doc.text(`Werkstap: ${stepName}`, margin + 80, y);
    y += 5;

    // Two-column layout: BEFORE (left) and AFTER (right)
    const colLeft = margin + 4;
    const colRight = margin + contentWidth / 2 + 2;
    const colW = contentWidth / 2 - 6;
    const startY = y;

    // === LEFT: BEFORE ===
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text('VOOR MAATREGELEN', colLeft, y);
    y += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(`Effect (E): ${hazard.effectBefore} - ${getFactorLabel('effect', hazard.effectBefore)}`, colLeft, y);
    y += 4;
    doc.text(`Blootstelling (B): ${hazard.exposureBefore} - ${getFactorLabel('exposure', hazard.exposureBefore)}`, colLeft, y);
    y += 4;
    doc.text(`Waarschijnlijkheid (W): ${hazard.probabilityBefore} - ${getFactorLabel('probability', hazard.probabilityBefore)}`, colLeft, y);
    y += 5;

    // Score badge before
    const [bgr, bgg, bgb] = getLevelBgColor(hazard.levelBefore);
    doc.setFillColor(bgr, bgg, bgb);
    doc.roundedRect(colLeft, y - 1, 50, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(cr, cg, cb);
    doc.text(`R = ${hazard.scoreBefore}  |  ${getRiskLabel(hazard.levelBefore)}`, colLeft + 2, y + 4);

    // === RIGHT: AFTER ===
    let yRight = startY;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text('NA MAATREGELEN', colRight, yRight);
    yRight += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(`Effect (E): ${hazard.effectAfter} - ${getFactorLabel('effect', hazard.effectAfter)}`, colRight, yRight);
    yRight += 4;
    doc.text(`Blootstelling (B): ${hazard.exposureAfter} - ${getFactorLabel('exposure', hazard.exposureAfter)}`, colRight, yRight);
    yRight += 4;
    doc.text(`Waarschijnlijkheid (W): ${hazard.probabilityAfter} - ${getFactorLabel('probability', hazard.probabilityAfter)}`, colRight, yRight);
    yRight += 5;

    // Score badge after
    const [ar2, ag2, ab2] = getLevelColor(hazard.levelAfter);
    const [abgr, abgg, abgb] = getLevelBgColor(hazard.levelAfter);
    doc.setFillColor(abgr, abgg, abgb);
    doc.roundedRect(colRight, yRight - 1, 50, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(ar2, ag2, ab2);
    doc.text(`R = ${hazard.scoreAfter}  |  ${getRiskLabel(hazard.levelAfter)}`, colRight + 2, yRight + 4);

    y = Math.max(y, yRight) + 10;

    // Measures
    const allMeasures = [...hazard.selectedMeasures, ...hazard.customMeasures];
    if (allMeasures.length > 0) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(NAVY));
      doc.text('Maatregelen:', colLeft, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(GRAY));
      allMeasures.forEach((m, mi) => {
        const mText = `${mi + 1}. ${m}`;
        const mLines = doc.splitTextToSize(mText, contentWidth - 10);
        doc.text(mLines, colLeft + 2, y);
        y += mLines.length * 3.5;
      });
    }

    // Risk reduction percentage
    if (hazard.scoreBefore > 0) {
      const reduction = Math.round(((hazard.scoreBefore - hazard.scoreAfter) / hazard.scoreBefore) * 100);
      if (reduction > 0) {
        y += 2;
        doc.setFillColor(...hexToRgb(TEAL));
        doc.roundedRect(colLeft, y - 1, 45, 6, 1, 1, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`Risicoverlaging: -${reduction}%`, colLeft + 2, y + 3.5);
      }
    }

    y += 10;
  });

  // ════════════════════════════════════════════
  // SECTION 5: RISK MATRIX
  // ════════════════════════════════════════════
  addFooter();
  doc.addPage();
  pageNum++;
  y = margin;

  drawSectionTitle('5. Risicomatrix');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('Visuele weergave van alle gevaren in een 5x5 risicomatrix (E x B x W vereenvoudigd naar E x (B*W)).', margin, y);
  y += 8;

  // Draw 5x5 matrix
  const cellSize = 20;
  const matrixX = margin + 35;
  const matrixY = y;
  const matrixLabelsY = ['5 Dodelijk', '4 Zeer ernstig', '3 Ernstig', '2 Met verzuim', '1 Zonder verz.'];
  const matrixLabelsX = ['1-2', '3-5', '6-10', '11-15', '16-25'];

  // Color thresholds for cells (effect row, combined col)
  // Simple approach: map to score ranges
  function getCellColor(row: number, col: number): [number, number, number] {
    // row 0=top(E=5), col 0=left(low BxW)
    const effectVal = 5 - row;
    const bwMids = [1.5, 4, 8, 13, 20];
    const approxScore = effectVal * bwMids[col];
    if (approxScore > 70) return [254, 226, 226]; // red bg
    if (approxScore > 20) return [254, 249, 195]; // yellow bg
    return [220, 252, 231]; // green bg
  }

  // Y-axis label
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Effect (E)', margin + 2, matrixY + (cellSize * 5) / 2, { angle: 90 } as never);

  // Draw cells
  for (let row = 0; row < 5; row++) {
    // Row label — right-aligned to matrix edge
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(matrixLabelsY[row], matrixX - 2, matrixY + row * cellSize + cellSize / 2 + 1, { align: 'right' });

    for (let col = 0; col < 5; col++) {
      const cx = matrixX + col * cellSize;
      const cy = matrixY + row * cellSize;

      // Cell color
      const [cr, cg, cb] = getCellColor(row, col);
      doc.setFillColor(cr, cg, cb);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(cx, cy, cellSize, cellSize, 'FD');
    }
  }

  // X-axis labels
  for (let col = 0; col < 5; col++) {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(matrixLabelsX[col], matrixX + col * cellSize + cellSize / 2, matrixY + 5 * cellSize + 5, { align: 'center' });
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Blootstelling x Waarschijnlijkheid (B x W)', matrixX + (cellSize * 5) / 2, matrixY + 5 * cellSize + 12, { align: 'center' });

  // Plot hazards as numbers in the matrix
  function getMatrixPosition(h: HazardAssessment & { stepName: string }, useAfter: boolean): { row: number; col: number } {
    const e = useAfter ? h.effectAfter : h.effectBefore;
    const bw = useAfter ? h.exposureAfter * h.probabilityAfter : h.exposureBefore * h.probabilityBefore;
    const row = 5 - e; // E=5 -> row 0 (top)
    let col: number;
    if (bw <= 2) col = 0;
    else if (bw <= 5) col = 1;
    else if (bw <= 10) col = 2;
    else if (bw <= 15) col = 3;
    else col = 4;
    return { row, col };
  }

  // Plot "before" hazards
  sortedHazards.forEach((h, idx) => {
    const { row, col } = getMatrixPosition(h as HazardAssessment & { stepName: string }, false);
    const cx = matrixX + col * cellSize + 4 + (idx % 3) * 6;
    const cy = matrixY + row * cellSize + 6 + Math.floor(idx / 3) * 5;

    // Circle outline
    doc.setDrawColor(...getLevelColor(h.levelBefore));
    doc.setLineWidth(0.5);
    doc.circle(cx, cy, 2.5);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...getLevelColor(h.levelBefore));
    doc.text(String(idx + 1), cx, cy + 1.2, { align: 'center' });
  });

  // Legend
  y = matrixY + 5 * cellSize + 20;
  checkPageBreak(30);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Legenda (nummers = voor maatregelen)', margin, y);
  y += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  sortedHazards.forEach((h, idx) => {
    checkPageBreak(5);
    const [cr, cg, cb] = getLevelColor(h.levelBefore);
    doc.setTextColor(cr, cg, cb);
    doc.text(`${idx + 1}.`, margin + 3, y);
    doc.setTextColor(...hexToRgb(NAVY));
    const legendText = `${h.hazardName} (${h.scoreBefore} -> ${h.scoreAfter})`;
    doc.text(legendText, margin + 10, y);
    y += 4;
  });

  // Color legend
  y += 3;
  doc.setFillColor(220, 252, 231);
  doc.rect(margin, y, 8, 4, 'F');
  doc.setFontSize(6.5);
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Acceptabel (1-20)', margin + 10, y + 3);

  doc.setFillColor(254, 249, 195);
  doc.rect(margin + 50, y, 8, 4, 'F');
  doc.text('Aandacht vereist (21-70)', margin + 60, y + 3);

  doc.setFillColor(254, 226, 226);
  doc.rect(margin + 115, y, 8, 4, 'F');
  doc.text('Onacceptabel (>70)', margin + 125, y + 3);

  // ════════════════════════════════════════════
  // SECTION 6: CONCLUSION
  // ════════════════════════════════════════════
  addFooter();
  doc.addPage();
  pageNum++;
  y = margin;

  drawSectionTitle('6. Conclusie & Aanbevelingen');

  y += 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(NAVY));

  // Auto-generated conclusion text
  const conclusionLines: string[] = [];

  conclusionLines.push(
    `Voor het project "${report.project.name}" zijn in totaal ${total} gevaren beoordeeld,`,
    `verdeeld over ${report.workSteps.length} werkstap(pen).`
  );
  conclusionLines.push('');

  if (unacceptableBefore > 0) {
    conclusionLines.push(
      `Voor maatregelen waren ${unacceptableBefore} van de ${total} gevaren geclassificeerd als`,
      `onacceptabel (risicoscore >70). ${attentionBefore > 0 ? `Daarnaast vereisten ${attentionBefore} gevaren extra aandacht.` : ''}`
    );
    conclusionLines.push('');
  }

  conclusionLines.push(
    `Na het doorvoeren van de voorgestelde beheersmaatregelen is het risicoprofiel`,
    `significant verbeterd:`
  );
  conclusionLines.push('');

  conclusionLines.push(`  - Onacceptabel: ${unacceptableBefore} -> ${unacceptableAfter} gevaren`);
  conclusionLines.push(`  - Aandacht vereist: ${attentionBefore} -> ${attentionAfter} gevaren`);
  conclusionLines.push(`  - Acceptabel: ${acceptableBefore} -> ${acceptableAfter} gevaren`);
  conclusionLines.push('');

  if (reductionPct > 0) {
    conclusionLines.push(
      `De gemiddelde risicoscore is verlaagd van ${avgBefore} naar ${avgAfter},`,
      `wat neerkomt op een verlaging van ${reductionPct}%.`
    );
    conclusionLines.push('');
  }

  // Recommendation based on remaining risks
  if (unacceptableAfter > 0) {
    conclusionLines.push(
      'AANBEVELING: Er zijn nog onacceptabele risico\'s na maatregelen. Het wordt sterk',
      'aangeraden om aanvullende maatregelen te treffen voordat de werkzaamheden',
      'worden gestart. Overweeg alternatieve werkmethoden of extra beveiligingen.'
    );
  } else if (attentionAfter > 0) {
    conclusionLines.push(
      'AANBEVELING: Alle onacceptabele risico\'s zijn adequaat beheerst. Voor de',
      `resterende ${attentionAfter} gevaren met \'aandacht vereist\' wordt aanbevolen om`,
      'extra alertheid te betrachten en de maatregelen regelmatig te evalueren.'
    );
  } else {
    conclusionLines.push(
      'AANBEVELING: Alle risico\'s zijn na het doorvoeren van maatregelen teruggebracht',
      'tot een acceptabel niveau. Zorg ervoor dat de maatregelen daadwerkelijk worden',
      'uitgevoerd en periodiek worden geevalueerd.'
    );
  }

  conclusionLines.push('');
  conclusionLines.push(
    'Deze TRA dient als levend document en moet worden herzien bij wijzigingen in de',
    'werkomstandigheden, nieuwe gevaren of na incidenten.'
  );

  for (const line of conclusionLines) {
    if (line === '') {
      y += 3;
    } else {
      checkPageBreak(5);
      doc.text(line, margin + 3, y);
      y += 4.5;
    }
  }

  // ── Geldigheid & Gebruik ──
  y += 8;
  checkPageBreak(55);

  doc.setFillColor(240, 249, 255);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'F');
  doc.setDrawColor(186, 220, 247);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'S');

  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Geldigheid & Gebruik van deze TRA', margin + 5, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  const validityLines = [
    'Een TRA is primair taakgericht, maar houdt expliciet rekening met de specifieke werkomgeving',
    '(VCA 2017/6.0, vraag 2.2). Dit rapport kan meerdere locaties dekken, mits de werkzaamheden',
    'en omstandigheden vergelijkbaar zijn.',
    '',
    'LMRA VERPLICHT: Voer voor aanvang op elke locatie altijd een Laatste Minuut Risico Analyse',
    '(LMRA) uit (VCA 2017/6.0, vraag 2.3). De LMRA is de laatste check op locatiespecifieke',
    'risico\'s en is complementair aan deze TRA — niet vervangbaar.',
    '',
    'Een nieuwe of herziene TRA is vereist bij:',
    '  - Wezenlijk andere werkzaamheden of werkmethoden',
    '  - Significant andere werkomgeving (bijv. besloten ruimte, hoogte, asbest)',
    '  - Een (bijna-)incident gerelateerd aan deze werkzaamheden',
    '  - VCA 2017/6.0 vereist minimaal eenmaal per jaar uitvoering van een TRA',
  ];

  for (const vLine of validityLines) {
    if (vLine === '') {
      y += 2;
    } else {
      doc.text(vLine, margin + 5, y);
      y += 3.5;
    }
  }

  // ── Disclaimer ──
  y += 8;
  checkPageBreak(28);

  doc.setFillColor(255, 243, 224);
  doc.roundedRect(margin, y, contentWidth, 35, 2, 2, 'F');
  doc.setDrawColor(255, 224, 178);
  doc.roundedRect(margin, y, contentWidth, 35, 2, 2, 'S');

  y += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 80, 0);
  doc.text('Disclaimer & Aansprakelijkheid', margin + 5, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 60, 0);
  const disclaimerLines = [
    'Dit rapport is een hulpmiddel bij het uitvoeren van een Taak Risico Analyse en vervangt geen deskundig',
    'advies van een veiligheidskundige of arbeidshygienist. De gebruiker is en blijft zelf verantwoordelijk voor:',
    '  - de juistheid en volledigheid van de ingevoerde gegevens;',
    '  - de daadwerkelijke uitvoering en naleving van de beheersmaatregelen;',
    '  - het uitvoeren van een LMRA voor aanvang van werkzaamheden op elke locatie;',
    '  - de naleving van de Arbowet (art. 5) en overige toepasselijke wet- en regelgeving.',
    '',
    'MaasISO is niet aansprakelijk voor schade, letsel of verlies voortvloeiend uit het gebruik van dit rapport.',
    'MaasISO slaat geen rapportgegevens op en kan het rapport niet opnieuw aanleveren. Bewaar dit document.',
  ];
  for (const dLine of disclaimerLines) {
    doc.text(dLine, margin + 5, y);
    y += 3.5;
  }

  // ── Signature area ──
  y += 10;
  checkPageBreak(35);
  doc.setFillColor(...hexToRgb(LIGHT_GRAY));
  doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'F');
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Ondertekening', margin + 5, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(...hexToRgb(GRAY));
  doc.setLineWidth(0.3);

  doc.text('Opgesteld door:', margin + 5, y);
  doc.line(margin + 35, y, margin + 80, y);
  doc.text('Datum:', margin + 90, y);
  doc.line(margin + 105, y, margin + 140, y);

  y += 10;
  doc.text('Goedgekeurd door:', margin + 5, y);
  doc.line(margin + 38, y, margin + 80, y);
  doc.text('Datum:', margin + 90, y);
  doc.line(margin + 105, y, margin + 140, y);

  // ════════════════════════════════════════════
  // SECTION 7: KINNEY & WIRUTH APPENDIX
  // ════════════════════════════════════════════
  addFooter();
  doc.addPage();
  pageNum++;
  y = margin;

  drawSectionTitle('7. Bijlage: Kinney & Wiruth Methode');

  y += 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(NAVY));

  const introText = [
    'De Kinney & Wiruth methode is een semi-kwantitatieve risicobeoordeling die de',
    'risicoscore berekent met de formule: R = E x B x W',
    '',
    'Waarbij:',
    '  E = Effect (ernst van het mogelijke letsel)',
    '  B = Blootstelling (hoe vaak wordt men blootgesteld aan het gevaar)',
    '  W = Waarschijnlijkheid (kans dat het gevaar zich daadwerkelijk voordoet)',
  ];

  for (const line of introText) {
    if (line === '') {
      y += 3;
    } else {
      doc.text(line, margin + 3, y);
      y += 4.5;
    }
  }

  y += 5;

  // Factor tables
  function drawFactorTable(title: string, factors: { value: number; label: string }[]) {
    checkPageBreak(35);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(title, margin + 3, y);
    y += 5;

    // Table header
    doc.setFillColor(...hexToRgb(NAVY));
    doc.rect(margin + 3, y, 20, 7, 'F');
    doc.rect(margin + 23, y, contentWidth - 26, 7, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Waarde', margin + 5, y + 5);
    doc.text('Beschrijving', margin + 25, y + 5);
    y += 8;

    for (const f of factors) {
      doc.setFillColor(248, 249, 250);
      if (f.value % 2 === 0) {
        doc.rect(margin + 3, y - 1, contentWidth - 6, 6, 'F');
      }
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(NAVY));
      doc.text(String(f.value), margin + 12, y + 3, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(f.label, margin + 25, y + 3);
      y += 6;
    }

    y += 5;
  }

  drawFactorTable('Effect (E) - Ernst van het letsel', [
    { value: 1, label: 'Letsel zonder verzuim' },
    { value: 2, label: 'Letsel met verzuim' },
    { value: 3, label: 'Ernstig letsel (blijvend)' },
    { value: 4, label: 'Zeer ernstig letsel / invaliditeit' },
    { value: 5, label: 'Dodelijk' },
  ]);

  drawFactorTable('Blootstelling (B) - Frequentie van blootstelling', [
    { value: 1, label: 'Zeer zelden (jaarlijks of minder)' },
    { value: 2, label: 'Zelden (enkele keren per jaar)' },
    { value: 3, label: 'Soms (maandelijks)' },
    { value: 4, label: 'Regelmatig (wekelijks)' },
    { value: 5, label: 'Voortdurend (dagelijks)' },
  ]);

  drawFactorTable('Waarschijnlijkheid (W) - Kans op optreden', [
    { value: 1, label: 'Vrijwel onmogelijk' },
    { value: 2, label: 'Onwaarschijnlijk maar denkbaar' },
    { value: 3, label: 'Mogelijk (is elders voorgekomen)' },
    { value: 4, label: 'Waarschijnlijk (is eerder voorgekomen)' },
    { value: 5, label: 'Zeer waarschijnlijk (komt regelmatig voor)' },
  ]);

  // Score classification table
  checkPageBreak(40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Risicoclassificatie', margin + 3, y);
  y += 6;

  // Classification rows
  const classifications = [
    { range: '1 - 20', level: 'Acceptabel', color: GREEN, bgColor: [220, 252, 231] as [number, number, number], desc: 'Risico is aanvaardbaar. Huidige beheersmaatregelen zijn voldoende.' },
    { range: '21 - 70', level: 'Aandacht vereist', color: YELLOW, bgColor: [254, 249, 195] as [number, number, number], desc: 'Risico vereist aandacht. Aanvullende maatregelen zijn wenselijk.' },
    { range: '71 - 125', level: 'Onacceptabel', color: RED, bgColor: [254, 226, 226] as [number, number, number], desc: 'Risico is onacceptabel. Werk mag niet starten zonder aanvullende maatregelen.' },
  ];

  for (const cls of classifications) {
    checkPageBreak(12);
    doc.setFillColor(...cls.bgColor);
    doc.roundedRect(margin + 3, y, contentWidth - 6, 10, 1, 1, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(cls.color));
    doc.text(cls.range, margin + 6, y + 4);
    doc.text(cls.level, margin + 30, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(cls.desc, margin + 6, y + 8.5);

    y += 13;
  }

  // Legal references
  y += 5;
  checkPageBreak(30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Wettelijke verwijzingen', margin + 3, y);
  y += 6;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));

  const legalRefs = [
    'Arbowet artikel 5: Werkgevers zijn verplicht alle arbeidsrisico\'s te inventariseren en te beheersen.',
    'Arbobesluit: Specifieke voorschriften per gevarentype (werken op hoogte, gevaarlijke stoffen, machines, etc.).',
    'VCA 2017 / VCA 6.0: Taakgerichte risicoanalyse is een expliciete normvereiste.',
    'Kinney & Wiruth methode: R = E x B x W. Acceptabel (<=20), Aandacht (21-70), Onacceptabel (>70).',
  ];

  for (const ref of legalRefs) {
    checkPageBreak(5);
    doc.text(`- ${ref}`, margin + 5, y);
    y += 5;
  }

  addFooter();

  // Save
  const fileName = `TRA-${report.project.name.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30)}-${report.project.date}.pdf`;
  doc.save(fileName);
}
