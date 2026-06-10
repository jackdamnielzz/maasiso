import Link from "next/link";
import type { ReactNode } from "react";

interface DienstRij {
  readonly norm: string;
  readonly focus: string;
  readonly duur: string;
  readonly kosten: string;
}

interface DienstenSectionV3Props {
  dienstentabel: readonly DienstRij[];
}

const normIcons: Record<string, ReactNode> = {
  "ISO 9001": (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  "ISO 27001": (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  "ISO 14001": (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "ISO 45001": (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  "ISO 16175": (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79 8-4" />
    </svg>
  ),
};

const normColors: Record<string, { bg: string; border: string; icon: string; accent: string; hover: string }> = {
  "ISO 9001": { bg: "from-blue-50 to-blue-100/50", border: "border-blue-200", icon: "text-blue-600", accent: "bg-blue-600", hover: "hover:border-blue-400" },
  "ISO 27001": { bg: "from-violet-50 to-violet-100/50", border: "border-violet-200", icon: "text-violet-600", accent: "bg-violet-600", hover: "hover:border-violet-400" },
  "ISO 14001": { bg: "from-emerald-50 to-emerald-100/50", border: "border-emerald-200", icon: "text-emerald-600", accent: "bg-emerald-600", hover: "hover:border-emerald-400" },
  "ISO 45001": { bg: "from-rose-50 to-rose-100/50", border: "border-rose-200", icon: "text-rose-600", accent: "bg-rose-600", hover: "hover:border-rose-400" },
  "ISO 16175": { bg: "from-amber-50 to-amber-100/50", border: "border-amber-200", icon: "text-amber-600", accent: "bg-amber-600", hover: "hover:border-amber-400" },
};

export function DienstenSectionV3({ dienstentabel }: DienstenSectionV3Props) {
  return (
    <article id="diensten">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0057B8]/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0057B8]">
          Onze diensten
        </span>
        <h2 className="mt-5 text-4xl font-extrabold text-[#091E42] md:text-5xl">
          ISO-certificering op maat
        </h2>
        <p className="mt-5 mx-auto max-w-2xl text-xl text-gray-600 leading-relaxed">
          Begeleiding bij het implementeren en certificeren van managementsystemen volgens
          internationale ISO-normen. Van gap-analyse en documentatie tot interne audit en
          auditvoorbereiding.
        </p>
      </div>

      {/* Norm cards with enhanced styling */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dienstentabel.map((item) => {
          const colors = normColors[item.norm] || normColors["ISO 9001"];
          const icon = normIcons[item.norm];
          return (
            <div
              key={item.norm}
              className={`group relative overflow-hidden rounded-3xl border-2 ${colors.border} ${colors.hover} bg-gradient-to-br ${colors.bg} p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
            >
              {/* Top accent line */}
              <div className={`absolute inset-x-0 top-0 h-1.5 ${colors.accent}`} />
              
              {/* Icon container with shadow */}
              <div className={`inline-flex rounded-2xl bg-white p-4 shadow-lg ${colors.icon}`}>
                {icon}
              </div>
              
              <h3 className="mt-6 text-2xl font-bold text-[#091E42]">{item.norm}</h3>
              <p className="mt-2 text-base font-medium text-gray-500">{item.focus}</p>
              
              {/* Info boxes with better styling */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3.5 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Doorlooptijd</span>
                  <span className="text-base font-bold text-[#091E42]">{item.duur}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3.5 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Investering</span>
                  <span className="text-base font-bold text-[#091E42]">{item.kosten}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/iso-certificering/"
          className="group inline-flex items-center gap-3 text-lg font-semibold text-[#0057B8] hover:underline"
        >
          Bekijk alle ISO-certificeringen
          <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* Enhanced Extra diensten */}
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-[#d7e1ee] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-violet-300">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-100 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
          <div className="inline-flex rounded-2xl bg-violet-50 p-4 text-violet-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-bold text-[#091E42]">Informatiebeveiliging</h3>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Implementatie van informatiebeveiligingsmaatregelen op basis van ISO 27001 en de
            Baseline Informatiebeveiliging Overheid (BIO). Inclusief risicoanalyse, Statement
            of Applicability (SoA) en ISMS-inrichting.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            Het aantal ISO 27001 certificaten wereldwijd is in 2024 verdubbeld naar 96.709
            actieve certificaten (bron: ISO Survey 2024). In Nederland zijn inmiddels 1.568
            organisaties gecertificeerd.
          </p>
          <Link href="/informatiebeveiliging/" className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-violet-600 hover:underline">
            Meer over informatiebeveiliging
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-[#d7e1ee] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-teal-300">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-600" />
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-100 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
          <div className="inline-flex rounded-2xl bg-teal-50 p-4 text-teal-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-bold text-[#091E42]">AVG & privacy compliance</h3>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Praktische begeleiding bij het naleven van de Algemene Verordening
            Gegevensbescherming (AVG/GDPR). Van verwerkingsregister en privacybeleid tot
            DPIA's, verwerkersovereenkomsten en de rol van externe FG.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            Boetes voor AVG-overtredingen kunnen oplopen tot €20 miljoen of 4% van de
            wereldwijde jaaromzet, afhankelijk van welke hoger is (art. 83 AVG).
          </p>
          <Link href="/avg-wetgeving/" className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-teal-600 hover:underline">
            Meer over AVG compliance
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-[#d7e1ee] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-300">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-100 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
          <div className="inline-flex rounded-2xl bg-amber-50 p-4 text-amber-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-bold text-[#091E42]">NIS2 & Cyberbeveiligingswet</h3>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Met de invoering van de NIS2-richtlijn (Cyberbeveiligingswet) wordt aantoonbare
            informatiebeveiliging voor essentiële en belangrijke entiteiten een wettelijke
            verplichting. ISO 27001 dekt circa 70-80% van de NIS2 Artikel 21-verplichtingen.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            Heeft u al nagedacht over de impact van NIS2 op uw organisatie? Onze consultants
            helpen u graag bij de voorbereiding.
          </p>
          <Link href="/informatiebeveiliging/nis2/" className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-amber-600 hover:underline">
            Meer over NIS2
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
