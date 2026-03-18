import Link from "next/link";

interface KostenRij {
  readonly traject: string;
  readonly grootte: string;
  readonly investering: string;
  readonly duur: string;
}

interface KostenSectionV2Props {
  kostenTabel: readonly KostenRij[];
}

export function KostenSectionV2({ kostenTabel }: KostenSectionV2Props) {
  return (
    <article id="kosten">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
          Transparante prijzen
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-[#091E42] md:text-4xl">
          Wat kost ISO-certificering?
        </h2>
        <p className="mt-3 text-gray-500">Indicatie voor MKB-bedrijven</p>
      </div>

      {/* Modern table */}
      <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Traject</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Bedrijfsgrootte</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Investering</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Doorlooptijd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {kostenTabel.map((item, idx) => (
                <tr
                  key={`${item.traject}-${idx}`}
                  className="transition-colors duration-200 hover:bg-[#f8fafc]"
                >
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#0057B8]" />
                      <span className="font-bold text-[#091E42]">{item.traject}</span>
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-600">{item.grootte}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {item.investering}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-600">{item.duur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-4">
          <p className="text-sm text-gray-500">
            Alle bedragen zijn inclusief begeleiding. Kosten voor de certificerende instelling en
            eventuele tooling zijn apart vermeld op de betreffende normpagina&apos;s.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/iso-certificering"
          className="inline-flex items-center gap-2 text-[#0057B8] font-semibold hover:underline"
        >
          Bekijk gedetailleerde kostenoverzichten per norm
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
