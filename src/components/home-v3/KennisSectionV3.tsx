import Link from "next/link";

const artikelen = [
  {
    titel: "ISO 9001 certificering: kosten, proces & voordelen [2026]",
    kleur: "blue",
    beschrijving: "Alles wat u moet weten over ISO 9001 certificering: van kosten en doorlooptijd tot de voordelen voor uw organisatie.",
    icon: "📋"
  },
  {
    titel: "ISO 27001 certificering: complete gids, kosten & stappen (2026)",
    kleur: "violet",
    beschrijving: "Een complete handleiding voor ISO 27001 certificering, inclusief stappenplan en kostenoverzicht.",
    icon: "🔒"
  },
  {
    titel: "AVG wetgeving: praktisch advies & implementatie voor MKB",
    kleur: "teal",
    beschrijving: "Praktische tips voor AVG compliance in MKB-organisaties. Wat moet u regelen en hoe pakt u dat aan?",
    icon: "� Privacy"
  },
];

const kleuren: Record<string, { gradient: string; border: string; icon: string; button: string }> = {
  blue: { gradient: "from-blue-50 to-blue-100/50", border: "border-blue-200 hover:border-blue-400", icon: "text-blue-600", button: "text-blue-600 hover:text-blue-700" },
  violet: { gradient: "from-violet-50 to-violet-100/50", border: "border-violet-200 hover:border-violet-400", icon: "text-violet-600", button: "text-violet-600 hover:text-violet-700" },
  teal: { gradient: "from-teal-50 to-teal-100/50", border: "border-teal-200 hover:border-teal-400", icon: "text-teal-600", button: "text-teal-600 hover:text-teal-700" },
};

export function KennisSectionV3() {
  return (
    <article>
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
          Kennis
        </span>
        <h2 className="mt-5 text-3xl font-extrabold text-[#091E42] md:text-4xl">
          Kennis & resources
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-500">
          Onze kennis is vrij beschikbaar en bedoeld om MKB-organisaties te helpen onderbouwde keuzes te maken.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {artikelen.map((artikel) => {
          const kleur = kleuren[artikel.kleur] || kleuren.blue;
          return (
            <Link
              key={artikel.titel}
              href="/kennis/blog/"
              className={`group relative overflow-hidden rounded-3xl border-2 ${kleur.border} bg-gradient-to-br ${kleur.gradient} p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
            >
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0057B8] to-[#00875A]" />
              
              {/* Icon */}
              <div className="inline-flex rounded-2xl bg-white p-4 shadow-lg mb-6">
                <span className="text-3xl">{artikel.icon}</span>
              </div>
              
              <h3 className="text-lg font-bold text-[#091E42] group-hover:text-[#0057B8] transition-colors leading-snug">
                {artikel.titel}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {artikel.beschrijving}
              </p>
              
              <div className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${kleur.button}`}>
                Lees artikel
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-10 text-center">
        <Link href="/kennis/blog/" className="group inline-flex items-center gap-3 text-lg font-semibold text-[#0057B8] hover:underline">
          Bekijk alle artikelen op ons blog
          <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
