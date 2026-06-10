interface KostenRij {
  readonly traject: string;
  readonly grootte: string;
  readonly investering: string;
  readonly duur: string;
}

interface KostenSectionV3Props {
  kostenTabel: readonly KostenRij[];
}

const normColors: Record<string, { bg: string; text: string; border: string }> = {
  "ISO 9001": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  "ISO 27001": { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  "ISO 14001": { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  "AVG compliance": { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
};

export function KostenSectionV3({ kostenTabel }: KostenSectionV3Props) {
  return (
    <article id="kosten">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FF8B00]/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#FF8B00]">
          Investering
        </span>
        <h2 className="mt-5 text-4xl font-extrabold text-[#091E42] md:text-5xl">
          Transparante kosten
        </h2>
        <p className="mt-5 mx-auto max-w-2xl text-xl text-gray-600 leading-relaxed">
          Geen verrassingen achteraf. Wij communiceren vooraf helder over de verwachte investering en doorlooptijd.
        </p>
      </div>

      {/* Pricing table with enhanced styling */}
      <div className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-lg">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 bg-gradient-to-r from-[#091E42] to-[#0d2b5c] p-6 text-white">
          <div className="text-xs font-bold uppercase tracking-wider text-white/70">Traject</div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/70">Organisatie</div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/70">Investering</div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/70">Doorlooptijd</div>
        </div>

        {/* Rows */}
        {kostenTabel.map((item, index) => {
          const colors = normColors[item.traject] || normColors["ISO 9001"];
          return (
            <div
              key={`${item.traject}-${item.grootte}`}
              className={`grid grid-cols-4 gap-4 p-6 transition-colors duration-300 ${
                index % 2 === 0 ? 'bg-white' : colors.bg
              } hover:bg-[#f0f6ff]`}
            >
              <div className="flex items-center">
                <span className={`inline-flex rounded-lg ${colors.bg} ${colors.text} px-3 py-1.5 text-sm font-bold`}>
                  {item.traject}
                </span>
              </div>
              <div className="flex items-center text-sm font-medium text-gray-700">{item.grootte}</div>
              <div className="flex items-center">
                <span className="text-base font-bold text-[#091E42]">{item.investering}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">{item.duur}</div>
            </div>
          );
        })}
      </div>

      {/* Additional info cards */}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-blue-100 p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-blue-900">Let op</span>
          </div>
          <p className="text-sm text-blue-800">De genoemde bedragen zijn indicatief en variëren op basis van uw specifieke situatie en wensen.</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 p-6 border border-violet-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-violet-100 p-2">
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-violet-900">100% slagingsgarantie</span>
          </div>
          <p className="text-sm text-violet-800">Wij garanderen dat u slaagt voor de certificeringsaudit. Zo niet, dan begeleiden wij u kosteloos.</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 border border-emerald-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="font-bold text-emerald-900">Betaalplan mogelijk</span>
          </div>
          <p className="text-sm text-emerald-800">Wij bieden de mogelijkheid om in termijnen te betalen, zodat de kosten beter passen bij uw cashflow.</p>
        </div>
      </div>
    </article>
  );
}
