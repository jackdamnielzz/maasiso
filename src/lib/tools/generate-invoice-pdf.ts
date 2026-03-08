import jsPDF from 'jspdf';

const NAVY = '#091E42';
const GRAY = '#6B7280';
const ORANGE = '#FF8B00';

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

interface InvoiceData {
  paymentId: string;
  email: string;
  projectName?: string;
  date: string; // e.g. "2026-03-08"
}

const PRICE_EXCL_BTW = 19.0;
const BTW_PERCENTAGE = 21;
const BTW_AMOUNT = Math.round(PRICE_EXCL_BTW * (BTW_PERCENTAGE / 100) * 100) / 100; // 3.99
const PRICE_INCL_BTW = Math.round((PRICE_EXCL_BTW + BTW_AMOUNT) * 100) / 100; // 22.99

function generateInvoiceNumber(paymentId: string, date: string): string {
  // Format: TRA-YYYYMMDD-XXXX (last 4 chars of payment ID)
  const dateClean = date.replace(/-/g, '');
  const suffix = paymentId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return `TRA-${dateClean}-${suffix}`;
}

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `€ ${amount.toFixed(2).replace('.', ',')}`;
}

export function generateInvoicePdf(data: InvoiceData): ArrayBuffer {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const invoiceNumber = generateInvoiceNumber(data.paymentId, data.date);
  const dateFormatted = formatDate(data.date);

  // ── Header: MaasISO logo area ──
  doc.setFillColor(...hexToRgb(NAVY));
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MaasISO', margin, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('ISO-consultancy voor het MKB', margin, 25);

  // "FACTUUR" label right-aligned
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('FACTUUR', pageWidth - margin, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(invoiceNumber, pageWidth - margin, 25, { align: 'right' });

  // ── Orange accent line ──
  doc.setFillColor(...hexToRgb(ORANGE));
  doc.rect(0, 40, pageWidth, 2, 'F');

  y = 55;

  // ── Company details (left) + Invoice details (right) ──
  // Left: MaasISO
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('MaasISO', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(GRAY));
  const companyLines = [
    'Maas Consulting',
    'KvK: 78109302',
    'BTW: NL003287662B92',
    '',
    'E-mail: info@maasiso.nl',
    'Website: www.maasiso.nl',
  ];
  for (const line of companyLines) {
    if (line === '') {
      y += 2;
    } else {
      doc.text(line, margin, y);
      y += 4;
    }
  }

  // Right: Invoice meta
  let yRight = 55;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Factuurnummer:', pageWidth - margin - 50, yRight);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceNumber, pageWidth - margin, yRight, { align: 'right' });
  yRight += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Datum:', pageWidth - margin - 50, yRight);
  doc.setFont('helvetica', 'normal');
  doc.text(dateFormatted, pageWidth - margin, yRight, { align: 'right' });
  yRight += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Betalingskenmerk:', pageWidth - margin - 50, yRight);
  doc.setFont('helvetica', 'normal');
  doc.text(data.paymentId, pageWidth - margin, yRight, { align: 'right' });
  yRight += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Betaalstatus:', pageWidth - margin - 50, yRight);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 135, 90);
  doc.text('Voldaan', pageWidth - margin, yRight, { align: 'right' });

  // ── Customer ──
  y = Math.max(y, yRight) + 15;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Klant:', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text(data.email, margin, y);
  y += 10;

  // ── Line items table ──
  // Table header
  doc.setFillColor(...hexToRgb(NAVY));
  doc.rect(margin, y, contentWidth, 9, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Omschrijving', margin + 4, y + 6);
  doc.text('Aantal', margin + 100, y + 6);
  doc.text('Prijs excl. BTW', margin + 120, y + 6);
  doc.text('Bedrag', margin + contentWidth - 4, y + 6, { align: 'right' });
  y += 11;

  // Line item
  doc.setFillColor(248, 249, 250);
  doc.rect(margin, y, contentWidth, 14, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(NAVY));

  const productName = data.projectName
    ? `TRA Risicoscore Rapport — ${data.projectName}`
    : 'TRA Risicoscore Rapport';
  const productNameShort = productName.length > 55
    ? productName.substring(0, 53) + '...'
    : productName;

  doc.text(productNameShort, margin + 4, y + 5);
  doc.setFontSize(7);
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('Professioneel PDF-rapport met Kinney & Wiruth risicoscores', margin + 4, y + 10);

  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('1', margin + 104, y + 7);
  doc.text(formatCurrency(PRICE_EXCL_BTW), margin + 120, y + 7);
  doc.text(formatCurrency(PRICE_EXCL_BTW), margin + contentWidth - 4, y + 7, { align: 'right' });
  y += 16;

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin + 90, y, margin + contentWidth, y);
  y += 5;

  // Subtotal
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('Subtotaal excl. BTW', margin + 90, y);
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text(formatCurrency(PRICE_EXCL_BTW), margin + contentWidth - 4, y, { align: 'right' });
  y += 6;

  // BTW
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text(`BTW ${BTW_PERCENTAGE}%`, margin + 90, y);
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text(formatCurrency(BTW_AMOUNT), margin + contentWidth - 4, y, { align: 'right' });
  y += 6;

  // Separator before total
  doc.setDrawColor(...hexToRgb(NAVY));
  doc.setLineWidth(0.5);
  doc.line(margin + 90, y, margin + contentWidth, y);
  y += 6;

  // Total
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('Totaal incl. BTW', margin + 90, y);
  doc.text(formatCurrency(PRICE_INCL_BTW), margin + contentWidth - 4, y, { align: 'right' });
  y += 15;

  // ── Payment confirmation box ──
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 135, 90);
  doc.text('Betaald via Mollie (iDEAL / creditcard / overig)', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Betaaldatum: ${dateFormatted}  |  Kenmerk: ${data.paymentId}`, margin + 4, y + 9.5);

  y += 20;

  // ── Footer note ──
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  const footerLines = [
    'Deze factuur is automatisch gegenereerd en is geldig zonder handtekening.',
    'Bij vragen over deze factuur kunt u contact opnemen via info@maasiso.nl.',
  ];
  for (const line of footerLines) {
    doc.text(line, margin, y);
    y += 4;
  }

  // Bottom bar
  doc.setFillColor(...hexToRgb(NAVY));
  doc.rect(0, 285, pageWidth, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text('MaasISO  |  KvK 78109302  |  BTW NL003287662B92  |  info@maasiso.nl  |  www.maasiso.nl', pageWidth / 2, 292, { align: 'center' });

  return doc.output('arraybuffer');
}
