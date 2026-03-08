import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateInvoicePdf } from '@/lib/tools/generate-invoice-pdf';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, paymentId, projectName } = await request.json();

    if (!email || !paymentId) {
      return NextResponse.json({ error: 'Email en paymentId zijn verplicht' }, { status: 400 });
    }

    const fromAddress = process.env.RESEND_VERIFIED_DOMAIN
      ? `MaasISO <${process.env.EMAIL_FROM || 'info@maasiso.nl'}>`
      : 'MaasISO <onboarding@resend.dev>';

    // Generate invoice PDF
    const today = new Date().toISOString().split('T')[0];
    const invoiceBuffer = generateInvoicePdf({
      paymentId,
      email,
      projectName,
      date: today,
    });

    const invoiceFilename = `Factuur-MaasISO-TRA-${today}.pdf`;

    const result = await resend.emails.send({
      from: fromAddress,
      replyTo: 'info@maasiso.nl',
      to: email,
      subject: `Uw TRA-rapport: ${projectName || 'Taak Risico Analyse'} - MaasISO`,
      attachments: [
        {
          filename: invoiceFilename,
          content: Buffer.from(invoiceBuffer),
        },
      ],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #091E42; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Uw TRA-rapport is klaar</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 24px; border: 1px solid #d8e2f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #333; margin-top: 0;">Bedankt voor uw aankoop! Uw Taak Risico Analyse rapport voor <strong>${projectName || 'uw project'}</strong> is succesvol gegenereerd.</p>

            <p style="color: #333;">Het PDF-rapport is direct gedownload naar uw apparaat.</p>

            <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
              <p style="color: #2e7d32; margin: 0; font-size: 13px; font-weight: bold;">Factuur bijgevoegd</p>
              <p style="color: #388e3c; margin: 4px 0 0 0; font-size: 12px;">Uw factuur (${invoiceFilename}) is als PDF-bijlage aan deze e-mail toegevoegd. Bedrag: &euro;22,99 incl. BTW.</p>
            </div>

            <div style="background-color: #FFF3E0; border: 1px solid #FFE0B2; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
              <p style="color: #E65100; margin: 0; font-size: 13px; font-weight: bold;">Belangrijk: sla uw PDF veilig op</p>
              <p style="color: #BF360C; margin: 4px 0 0 0; font-size: 12px;">Uw rapportgegevens worden niet door ons opgeslagen. De downloadlink is 24 uur geldig. Wij kunnen het rapport naderhand niet opnieuw aanleveren.</p>
            </div>

            <div style="background-color: white; border: 1px solid #d8e2f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="color: #091E42; margin-top: 0; font-size: 14px;">Uw rapport bevat:</h3>
              <ul style="color: #666; font-size: 13px; padding-left: 20px;">
                <li>Werkstappen &amp; gevaren overzicht</li>
                <li>Risico-prioriteitenlijst</li>
                <li>Actieplan met invulvelden</li>
                <li>Gedetailleerde gevarenbladen</li>
                <li>5x5 Risicomatrix</li>
                <li>Conclusie &amp; aanbevelingen</li>
                <li>Kinney &amp; Wiruth bijlage</li>
              </ul>
            </div>

            <p style="color: #333;">Heeft u vragen over uw rapport of hulp nodig bij uw risicobeoordeling? Neem gerust <a href="https://www.maasiso.nl/contact?source=tra-email" style="color: #FF8B00;">contact</a> met ons op.</p>

            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              Betalingskenmerk: ${paymentId}<br>
              Dit is een automatisch gegenereerd bericht van MaasISO.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully with invoice:', result);
    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ error: 'E-mail verzenden mislukt', details: String(error) }, { status: 500 });
  }
}
