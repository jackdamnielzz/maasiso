'use client';

import type { WorkStep } from '@/lib/tools/tra-types';
import RiskTable from '../RiskTable';
import RiskMatrix from '../RiskMatrix';

interface ResultsStepProps {
  workSteps: WorkStep[];
  onNext: () => void;
  onBack: () => void;
}

export default function ResultsStep({ workSteps, onNext, onBack }: ResultsStepProps) {
  const allHazards = workSteps.flatMap((s) => s.hazards);
  const total = allHazards.length;

  const beforeCounts = {
    onacceptabel: allHazards.filter((h) => h.levelBefore === 'onacceptabel').length,
    aandacht: allHazards.filter((h) => h.levelBefore === 'aandacht').length,
    acceptabel: allHazards.filter((h) => h.levelBefore === 'acceptabel').length,
  };

  const afterCounts = {
    onacceptabel: allHazards.filter((h) => h.levelAfter === 'onacceptabel').length,
    aandacht: allHazards.filter((h) => h.levelAfter === 'aandacht').length,
    acceptabel: allHazards.filter((h) => h.levelAfter === 'acceptabel').length,
  };

  const avgBefore = total > 0 ? Math.round(allHazards.reduce((s, h) => s + h.scoreBefore, 0) / total) : 0;
  const avgAfter = total > 0 ? Math.round(allHazards.reduce((s, h) => s + h.scoreAfter, 0) / total) : 0;
  const overallReduction = avgBefore > 0 ? Math.round(((avgBefore - avgAfter) / avgBefore) * 100) : 0;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#091E42] mb-1">Resultaten</h2>
      <p className="text-sm text-gray-600 mb-6">
        Overzicht van alle beoordeelde gevaren met risicoscores voor en na maatregelen.
      </p>

      {/* Samenvattingskaarten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white border border-[#d8e2f0] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#091E42]">{total}</div>
          <div className="text-xs text-gray-500">Totaal gevaren</div>
        </div>
        <div className="bg-white border border-[#d8e2f0] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">
            {beforeCounts.onacceptabel}
            {afterCounts.onacceptabel < beforeCounts.onacceptabel && (
              <span className="text-sm text-[#00875A] ml-1">→ {afterCounts.onacceptabel}</span>
            )}
          </div>
          <div className="text-xs text-gray-500">Onacceptabel</div>
        </div>
        <div className="bg-white border border-[#d8e2f0] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {beforeCounts.aandacht}
            {afterCounts.aandacht !== beforeCounts.aandacht && (
              <span className="text-sm text-gray-500 ml-1">→ {afterCounts.aandacht}</span>
            )}
          </div>
          <div className="text-xs text-gray-500">Aandacht vereist</div>
        </div>
        <div className="bg-white border border-[#d8e2f0] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {beforeCounts.acceptabel}
            {afterCounts.acceptabel > beforeCounts.acceptabel && (
              <span className="text-sm text-[#00875A] ml-1">→ {afterCounts.acceptabel}</span>
            )}
          </div>
          <div className="text-xs text-gray-500">Acceptabel</div>
        </div>
      </div>

      {/* Gemiddelde score */}
      {overallReduction > 0 && (
        <div className="bg-[#00875A]/10 border border-[#00875A]/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-[#091E42]">
            Gemiddelde risicoscore: <strong>{avgBefore}</strong> → <strong>{avgAfter}</strong>{' '}
            <span className="text-[#00875A] font-semibold">(↓ {overallReduction}% verlaging)</span>
          </p>
        </div>
      )}

      {/* Risicotabel */}
      <div className="mb-8">
        <RiskTable workSteps={workSteps} />
      </div>

      {/* Risicomatrix */}
      <div className="mb-8 bg-white border border-[#d8e2f0] rounded-lg p-4">
        <RiskMatrix hazards={allHazards} />
      </div>

      {/* Wettelijke verwijzingen */}
      <div className="mb-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#091E42] mb-2">Wettelijke verwijzingen</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li><strong>Arbowet artikel 5:</strong> Werkgevers zijn verplicht alle arbeidsrisico&apos;s te inventariseren en te beheersen. Een TRA is verplicht wanneer de RI&amp;E onvoldoende specifiek is voor de betreffende taak.</li>
          <li><strong>Arbobesluit:</strong> Specifieke voorschriften per gevarentype (werken op hoogte, gevaarlijke stoffen, machines, etc.).</li>
          <li><strong>VCA 2017 / VCA 6.0:</strong> Taakgerichte risicoanalyse is een expliciete normvereiste. Auditors toetsen op taakgerichte voorbereiding, vastgelegde maatregelen en instructie aan medewerkers.</li>
          <li><strong>Kinney &amp; Wiruth methode:</strong> R = E &times; B &times; W. Acceptabel (&le;20), Aandacht vereist (21-70), Onacceptabel (&gt;70).</li>
        </ul>
      </div>

      {/* Premium PDF Preview — Locked sections */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#FF8B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-bold text-[#091E42]">Extra in het PDF-rapport</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Risico-prioriteitenlijst', desc: 'Alle gevaren gesorteerd op risicoscore — focus direct op de grootste risico\'s.' },
            { title: 'Actieplan', desc: 'Invulbare tabel met verantwoordelijke, deadline en status per maatregel.' },
            { title: 'Gedetailleerde gevarenbladen', desc: 'Per gevaar een volledig overzicht met factorbeschrijvingen en risicoverlaging.' },
            { title: 'Risicomatrix (5x5)', desc: 'Visuele risicomatrix met al uw gevaren geplot in kleurzones.' },
            { title: 'Conclusie & aanbevelingen', desc: 'Automatisch gegenereerde conclusie op basis van uw risicodata.' },
            { title: 'Bijlage: Kinney & Wiruth', desc: 'Volledige methode-uitleg met factortabellen — rapport is zelfstandig leesbaar.' },
          ].map((item) => (
            <div key={item.title} className="relative overflow-hidden rounded-lg border border-[#d8e2f0] bg-white p-4">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 pointer-events-none" />
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#FF8B00]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#FF8B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#091E42]">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download compleet PDF-rapport (gratis)
          </button>
        </div>
      </div>

      {/* CTA MaasISO */}
      <div className="mb-8 bg-[#091E42] text-white rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold mb-2">Hulp nodig bij uw risicobeoordeling?</h3>
        <p className="text-sm text-gray-300 mb-4">
          Onze consultants helpen u bij het opstellen van een professionele TRA, RI&amp;E of VCA-implementatie.
        </p>
        <a
          href="/contact?source=tra-calculator"
          className="inline-block px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] transition-colors"
        >
          Plan een gratis gesprek
        </a>
      </div>

      {/* Navigatie */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 text-gray-600 font-semibold rounded-lg hover:text-[#091E42] transition-colors"
        >
          ← Vorige
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] transition-colors"
        >
          PDF Rapport →
        </button>
      </div>
    </div>
  );
}
