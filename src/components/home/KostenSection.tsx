import Link from "next/link";

interface KostenRij {
  readonly traject: string;
  readonly grootte: string;
  readonly investering: string;
  readonly duur: string;
}

interface KostenSectionProps {
  kostenTabel: readonly KostenRij[];
}

export function KostenSection({ kostenTabel }: KostenSectionProps) {
  return (
    <article id="kosten" className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12">
      <h2 className="mb-8 text-2xl font-bold md:text-3xl">
        Wat kost ISO-certificering? (indicatie voor MKB)
      </h2>
      <div className="overflow-x-auto rounded-xl border border-[#dce5f1]">
        <table className="w-full bg-white text-left text-sm md:text-base">
          <thead className="bg-[#f8fbff]">
            <tr>
              <th className="p-4 font-semibold">Traject</th>
              <th className="p-4 font-semibold">Bedrijfsgrootte</th>
              <th className="p-4 font-semibold">Indicatie totale investering</th>
              <th className="p-4 font-semibold">Gemiddelde doorlooptijd</th>
            </tr>
          </thead>
          <tbody>
            {kostenTabel.map((item, idx) => (
              <tr
                key={`${item.traject}-${idx}`}
                className="border-t border-[#e3eaf4] transition-colors hover:bg-[#f8fbff]"
              >
                <td className="p-4 font-medium text-[#163663]">{item.traject}</td>
                <td className="p-4 text-[#243f66]">{item.grootte}</td>
                <td className="p-4 text-[#243f66]">{item.investering}</td>
                <td className="p-4 text-[#243f66]">{item.duur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-gray-700">
        Alle bedragen zijn inclusief begeleiding. Kosten voor de certificerende instelling en
        eventuele tooling zijn apart vermeld op de betreffende normpagina&apos;s.
      </p>
      <p className="mt-3">
        <Link
          href="/iso-certificering"
          className="inline-flex items-center text-[#0057B8] font-semibold hover:underline"
        >
          Bekijk gedetailleerde kostenoverzichten per norm
        </Link>
      </p>
    </article>
  );
}
