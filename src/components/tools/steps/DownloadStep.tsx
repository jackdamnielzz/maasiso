'use client';

import { useState } from 'react';
import type { TRAReport } from '@/lib/tools/tra-types';

interface DownloadStepProps {
  report: TRAReport;
  onBack: () => void;
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#00875A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function DownloadStep({ report, onBack }: DownloadStepProps) {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<{ percentOff: number; label: string; priceInclBtw: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountError('');
    setDiscountApplied(null);
    setIsValidating(true);
    try {
      const res = await fetch('/api/tra-validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountApplied({ percentOff: data.percentOff, label: data.label, priceInclBtw: data.priceInclBtw });
      } else {
        setDiscountError(data.error || 'Ongeldige code');
      }
    } catch {
      setDiscountError('Kon code niet controleren');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePurchase = async () => {
    if (!email || !email.includes('@')) {
      setError('Vul een geldig e-mailadres in.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/tra-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, discountCode: discountApplied ? discountCode : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Er ging iets mis. Probeer het opnieuw.');
        return;
      }

      if (data.free) {
        // 100% discount — skip Mollie, go straight to bedankt page
        if (data.paymentId) {
          localStorage.setItem('maasiso-tra-payment-id', data.paymentId);
        }
        window.location.href = '/tools/risicoscore-calculator/bedankt';
      } else if (data.checkoutUrl) {
        if (data.paymentId) {
          localStorage.setItem('maasiso-tra-payment-id', data.paymentId);
        }
        window.location.href = data.checkoutUrl;
      } else {
        setError('Geen betaallink ontvangen. Probeer het opnieuw.');
      }
    } catch {
      setError('Verbinding mislukt. Controleer uw internetverbinding en probeer het opnieuw.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalHazards = report.workSteps.reduce((sum, s) => sum + s.hazards.length, 0);
  const totalMeasures = report.workSteps.reduce(
    (sum, s) => sum + s.hazards.reduce((hs, h) => hs + h.selectedMeasures.length + h.customMeasures.length, 0), 0
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#091E42] mb-2">Uw TRA-rapport is klaar</h2>
        <p className="text-gray-600">
          Download uw professionele Taak Risico Analyse als PDF-rapport.
        </p>
      </div>

      {/* Rapport stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-[#d8e2f0] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#091E42]">{report.workSteps.length}</div>
          <div className="text-xs text-gray-500">Werkstappen</div>
        </div>
        <div className="bg-white border border-[#d8e2f0] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#091E42]">{totalHazards}</div>
          <div className="text-xs text-gray-500">Gevaren beoordeeld</div>
        </div>
        <div className="bg-white border border-[#d8e2f0] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#091E42]">{totalMeasures}</div>
          <div className="text-xs text-gray-500">Maatregelen</div>
        </div>
      </div>

      {/* Pricing card */}
      <div className="bg-white border-2 border-[#FF8B00] rounded-xl overflow-hidden mb-8 shadow-sm">
        {/* Price header */}
        <div className="bg-gradient-to-r from-[#FF8B00] to-[#e67e00] px-6 py-4 text-white">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-lg font-bold">Professioneel TRA-rapport</h3>
              <p className="text-sm text-white/80">7-8 pagina&apos;s, direct downloaden + per e-mail</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">&euro;22,99</span>
              </div>
              <p className="text-xs text-white/70">&euro;19 excl. BTW (incl. 21% BTW)</p>
            </div>
          </div>
        </div>

        {/* What's included — two columns */}
        <div className="px-6 py-5">
          <h4 className="text-sm font-semibold text-[#091E42] mb-3">Dit zit in uw rapport:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-5">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span>Volledig projectoverzicht</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span>E &times; B &times; W risicoscores voor &amp; na</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span><strong>Risico-prioriteitenlijst</strong></span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span><strong>Invulbaar actieplan</strong></span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span><strong>Gedetailleerde gevarenbladen</strong></span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span><strong>5&times;5 risicomatrix</strong></span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span><strong>Conclusie &amp; aanbevelingen</strong></span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span>Kinney &amp; Wiruth bijlage</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span>Wettelijke verwijzingen</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckIcon />
              <span>Handtekeningvelden</span>
            </div>
          </div>

          {/* Email input + Discount code + Buy button */}
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#091E42] mb-1">
                E-mailadres (voor bevestiging)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="uw@email.nl"
                className="w-full px-4 py-2.5 border border-[#d8e2f0] rounded-lg text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8B00]/50 focus:border-[#FF8B00]"
              />
            </div>

            {/* Discount code */}
            <div>
              <label htmlFor="discount" className="block text-xs text-gray-500 mb-1">
                Kortingscode (optioneel)
              </label>
              <div className="flex gap-2">
                <input
                  id="discount"
                  type="text"
                  value={discountCode}
                  onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); setDiscountApplied(null); }}
                  placeholder="Voer code in"
                  className="flex-1 px-3 py-2 border border-[#d8e2f0] rounded-lg text-sm text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8B00]/50 focus:border-[#FF8B00]"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={isValidating || !discountCode.trim()}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 text-[#091E42] rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {isValidating ? '...' : 'Toepassen'}
                </button>
              </div>
              {discountError && (
                <p className="text-xs text-red-500 mt-1">{discountError}</p>
              )}
              {discountApplied && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#00875A] font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {discountApplied.percentOff === 100
                    ? 'Kortingscode toegepast — gratis!'
                    : `${discountApplied.percentOff}% korting toegepast — €${discountApplied.priceInclBtw.toFixed(2).replace('.', ',')} incl. BTW`}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="button"
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full py-3.5 bg-[#FF8B00] text-white font-bold rounded-lg hover:bg-[#e67e00] disabled:opacity-60 transition-colors text-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {discountApplied?.percentOff === 100 ? 'Rapport wordt klaargemaakt...' : 'Betaling wordt aangemaakt...'}
                </>
              ) : (
                <>
                  {discountApplied?.percentOff === 100 ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Gratis downloaden
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {discountApplied
                        ? `Afrekenen — €${discountApplied.priceInclBtw.toFixed(2).replace('.', ',')} incl. BTW`
                        : <>Afrekenen &mdash; &euro;22,99 incl. BTW</>}
                    </>
                  )}
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            Veilig betalen via iDEAL, creditcard of andere methode. Eenmalig, geen abonnement.
          </p>

          {/* AVG / Privacy notice */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div className="text-xs text-blue-800">
                <strong>Privacy:</strong> Uw rapportgegevens worden niet door ons opgeslagen. Het rapport wordt direct in uw browser gegenereerd en gedownload. Na 24 uur wordt de downloadlink ongeldig. Bewaar uw PDF goed — wij kunnen het rapport naderhand niet opnieuw aanleveren.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table — why this tool */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#091E42] mb-4 text-center">Vergelijk: hoe duur is een TRA?</h3>
        <div className="overflow-hidden rounded-lg border border-[#d8e2f0]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#091E42] text-white">
                <th className="text-left px-4 py-2.5 font-semibold">Optie</th>
                <th className="text-center px-3 py-2.5 font-semibold">Kosten</th>
                <th className="text-center px-3 py-2.5 font-semibold">Tijdsinvestering</th>
                <th className="text-center px-3 py-2.5 font-semibold">Kwaliteit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="px-4 py-3 text-gray-700">Zelf maken in Excel</td>
                <td className="px-3 py-3 text-center text-gray-700">Gratis</td>
                <td className="px-3 py-3 text-center text-gray-700">2-4 uur</td>
                <td className="px-3 py-3 text-center">
                  <span className="text-yellow-600">Wisselend</span>
                </td>
              </tr>
              <tr className="border-b border-[#FF8B00]/30 bg-[#FF8B00]/5 ring-1 ring-inset ring-[#FF8B00]/20">
                <td className="px-4 py-3 font-semibold text-[#091E42]">
                  MaasISO TRA-tool
                  <span className="ml-1.5 inline-block text-[10px] font-bold bg-[#FF8B00] text-white px-1.5 py-0.5 rounded">BESTE KEUZE</span>
                </td>
                <td className="px-3 py-3 text-center font-bold text-[#FF8B00]">&euro;22,99</td>
                <td className="px-3 py-3 text-center font-semibold text-[#00875A]">15-30 min</td>
                <td className="px-3 py-3 text-center">
                  <span className="text-[#00875A] font-semibold">Professioneel</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="px-4 py-3 text-gray-700">Veiligheidssoftware</td>
                <td className="px-3 py-3 text-center text-gray-700">&euro;50-200/mnd</td>
                <td className="px-3 py-3 text-center text-gray-700">1-2 uur</td>
                <td className="px-3 py-3 text-center">
                  <span className="text-[#00875A]">Goed</span>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 text-gray-700">Consultant inhuren</td>
                <td className="px-3 py-3 text-center text-gray-700">&euro;500-2.000</td>
                <td className="px-3 py-3 text-center text-gray-700">1-2 weken</td>
                <td className="px-3 py-3 text-center">
                  <span className="text-[#00875A]">Uitstekend</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Bespaar honderden euro&apos;s en uren werk met een kant-en-klaar TRA-rapport.
        </p>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="flex items-center gap-3 bg-white border border-[#d8e2f0] rounded-lg p-3">
          <svg className="w-8 h-8 text-[#00875A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div>
            <div className="text-xs font-semibold text-[#091E42]">Audit-proof</div>
            <div className="text-[10px] text-gray-500">Voldoet aan VCA &amp; Arbowet</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#d8e2f0] rounded-lg p-3">
          <svg className="w-8 h-8 text-[#00875A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <div>
            <div className="text-xs font-semibold text-[#091E42]">Direct beschikbaar</div>
            <div className="text-[10px] text-gray-500">Download + e-mail ontvangst</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#d8e2f0] rounded-lg p-3">
          <svg className="w-8 h-8 text-[#00875A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          <div>
            <div className="text-xs font-semibold text-[#091E42]">Veilig betalen</div>
            <div className="text-[10px] text-gray-500">iDEAL, creditcard, PayPal</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-8 bg-white border border-[#d8e2f0] rounded-lg p-5">
        <h3 className="text-sm font-bold text-[#091E42] mb-4">Veelgestelde vragen</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-[#091E42]">Kan ik het rapport gebruiken voor een VCA-audit?</h4>
            <p className="text-gray-600 mt-0.5">
              Ja. Het rapport bevat alle elementen die VCA 2017 en VCA 6.0 vereisen: taakgerichte gevaren, Kinney &amp; Wiruth scores, beheersmaatregelen en wettelijke verwijzingen.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#091E42]">Wat krijg ik precies?</h4>
            <p className="text-gray-600 mt-0.5">
              Een professioneel PDF-rapport van 7-8 pagina&apos;s met: werkstappenoverzicht, risico-prioriteitenlijst, actieplan met invulvelden, gedetailleerde gevarenbladen, 5&times;5 risicomatrix, conclusie met aanbevelingen, en een bijlage met de Kinney &amp; Wiruth methode.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#091E42]">Is het een abonnement?</h4>
            <p className="text-gray-600 mt-0.5">
              Nee. U betaalt eenmalig &euro;22,99 incl. BTW (&euro;19 excl. BTW) per rapport. Geen verborgen kosten, geen abonnement.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#091E42]">Waarom niet zelf in Excel maken?</h4>
            <p className="text-gray-600 mt-0.5">
              Dat kan, maar kost u 2-4 uur werk. Met onze tool heeft u in 15 minuten een professioneel rapport met correcte berekeningen, kleurcodes en wettelijke verwijzingen. U bespaart tijd en voorkomt fouten.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#091E42]">Moet ik per locatie een nieuw rapport kopen?</h4>
            <p className="text-gray-600 mt-0.5">
              Niet per se. Een TRA is primair taakgericht, maar houdt ook rekening met de specifieke werkomgeving (VCA 2017/6.0, vraag 2.2). Als de werkzaamheden &eacute;n omstandigheden vergelijkbaar zijn, kan &eacute;&eacute;n TRA-rapport meerdere locaties dekken. Voer v&oacute;&oacute;r aanvang op elke locatie altijd een LMRA (Laatste Minuut Risico Analyse) uit om locatiespecifieke risico&apos;s te controleren (VCA 2017/6.0, vraag 2.3).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#091E42]">Wanneer moet ik een nieuwe TRA maken?</h4>
            <p className="text-gray-600 mt-0.5">
              Een nieuwe TRA is nodig bij wezenlijk andere werkzaamheden, een significant andere werkomgeving, of na een (bijna-)incident. VCA 2017/6.0 vereist dat minimaal &eacute;&eacute;nmaal per jaar een TRA wordt uitgevoerd. Bestaande TRA&apos;s dienen actueel te blijven.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#091E42]">Vervangt dit rapport een LMRA?</h4>
            <p className="text-gray-600 mt-0.5">
              Nee. Een TRA en LMRA zijn complementair. De TRA is de voorafgaande analyse; de LMRA is de laatste check v&oacute;&oacute;r aanvang van het werk op de specifieke locatie. Beide zijn verplicht volgens VCA 2017/6.0.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#091E42]">Is MaasISO aansprakelijk voor de inhoud van het rapport?</h4>
            <p className="text-gray-600 mt-0.5">
              Nee. Dit rapport is een hulpmiddel. U bent zelf verantwoordelijk voor de juistheid van de ingevoerde gegevens, de uitvoering van maatregelen en de naleving van de Arbowet. MaasISO is niet aansprakelijk voor de inhoud of het gebruik van het rapport.
            </p>
          </div>
        </div>
      </div>

      {/* CTA MaasISO */}
      <div className="bg-[#091E42] text-white rounded-lg p-6 mb-8 text-center">
        <h3 className="font-bold mb-2">Liever een consultant die meekijkt?</h3>
        <p className="text-sm text-gray-300 mb-4">
          Onze adviseurs helpen u bij het opstellen van een audit-proof TRA, RI&amp;E of complete VCA-implementatie.
        </p>
        <a
          href="/contact?source=tra-pdf"
          className="inline-block px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] transition-colors"
        >
          Plan een gratis gesprek
        </a>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 text-gray-600 font-semibold rounded-lg hover:text-[#091E42] transition-colors"
        >
          &larr; Terug naar resultaten
        </button>
      </div>
    </div>
  );
}
