import Link from "next/link";

interface DienstRij {
  readonly norm: string;
  readonly focus: string;
  readonly duur: string;
  readonly kosten: string;
}

interface DienstenSectionProps {
  dienstentabel: readonly DienstRij[];
}

export function DienstenSection({ dienstentabel }: DienstenSectionProps) {
  return (
    <article
      id="diensten"
      className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12"
    >
      <h2 className="mb-8 text-2xl font-bold md:text-3xl">Onze diensten</h2>

      <h3 className="mb-3 text-xl font-semibold md:text-2xl">ISO-certificering</h3>
      <p className="mb-4 leading-relaxed text-gray-800">
        Begeleiding bij het implementeren en certificeren van managementsystemen volgens
        internationale ISO-normen. Van gap-analyse en documentatie tot interne audit en
        auditvoorbereiding.
      </p>
      <div className="overflow-x-auto rounded-xl border border-[#dce5f1]">
        <table className="w-full bg-white text-left text-sm md:text-base">
          <thead className="bg-[#f8fbff]">
            <tr>
              <th className="p-4 font-semibold">Norm</th>
              <th className="p-4 font-semibold">Focus</th>
              <th className="p-4 font-semibold">Gemiddelde doorlooptijd MKB</th>
              <th className="p-4 font-semibold">Indicatie kosten</th>
            </tr>
          </thead>
          <tbody>
            {dienstentabel.map((item) => (
              <tr
                key={item.norm}
                className="border-t border-[#e3eaf4] transition-colors hover:bg-[#f8fbff]"
              >
                <td className="p-4 font-medium text-[#163663]">{item.norm}</td>
                <td className="p-4 text-[#243f66]">{item.focus}</td>
                <td className="p-4 text-[#243f66]">{item.duur}</td>
                <td className="p-4 text-[#243f66]">{item.kosten}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4">
        <Link
          href="/iso-certificering"
          className="inline-flex items-center text-[#0057B8] font-semibold hover:underline"
        >
          Bekijk alle ISO-certificeringen
        </Link>
      </p>

      <div className="mt-10 space-y-6">
        <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
          <h3 className="mb-3 text-xl font-semibold md:text-2xl">Informatiebeveiliging</h3>
          <p className="leading-relaxed text-gray-800">
            Implementatie van informatiebeveiligingsmaatregelen op basis van ISO 27001 en de
            Baseline Informatiebeveiliging Overheid (BIO). Inclusief risicoanalyse, Statement
            of Applicability (SoA) en ISMS-inrichting.
          </p>
          <p className="mt-4 leading-relaxed text-gray-800">
            Het aantal ISO 27001 certificaten wereldwijd is in 2024 verdubbeld naar 96.709
            actieve certificaten (bron: ISO Survey 2024). In Nederland zijn inmiddels 1.568
            organisaties gecertificeerd. Met de invoering van de NIS2-richtlijn
            (Cyberbeveiligingswet) in 2025 stijgt de vraag naar aantoonbare
            informatiebeveiliging verder.
          </p>
          <p className="mt-4">
            <Link
              href="/informatiebeveiliging"
              className="inline-flex items-center font-semibold text-[#0057B8] hover:underline"
            >
              Bekijk informatiebeveiliging
            </Link>
          </p>
        </div>

        <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
          <h3 className="mb-3 text-xl font-semibold md:text-2xl">AVG &amp; privacy compliance</h3>
          <p className="leading-relaxed text-gray-800">
            Praktische begeleiding bij het naleven van de Algemene Verordening
            Gegevensbescherming (AVG/GDPR). Van verwerkingsregister en privacybeleid tot
            DPIA&apos;s, verwerkersovereenkomsten en de rol van externe Functionaris
            Gegevensbescherming (FG).
          </p>
          <p className="mt-4 leading-relaxed text-gray-800">
            De AVG kent boetes tot EUR 20 miljoen of 4% van de wereldwijde jaaromzet (art. 83
            GDPR). In de praktijk zien wij dat MKB-bedrijven niet struikelen over kennis van de
            wet, maar over de uitvoering: ontbrekende registers, onduidelijke rollen en geen
            vast proces voor datalekken.
          </p>
          <p className="mt-4">
            <Link
              href="/avg-wetgeving"
              className="inline-flex items-center font-semibold text-[#0057B8] hover:underline"
            >
              Bekijk AVG &amp; wetgeving
            </Link>
          </p>
        </div>

        <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
          <h3 className="mb-3 text-xl font-semibold md:text-2xl">
            NIS2 compliance (Cyberbeveiligingswet)
          </h3>
          <p className="leading-relaxed text-gray-800">
            De NIS2-richtlijn stelt in Artikel 21 tien verplichte risicobeheersmaatregelen
            voor essentiele en belangrijke entiteiten. Organisaties die al ISO 27001
            gecertificeerd zijn, hebben circa 70-80% van deze maatregelen al aantoonbaar
            geimplementeerd. MaasISO helpt bij het in kaart brengen van de resterende gaps en
            het aantoonbaar voldoen aan de Cyberbeveiligingswet.
          </p>
          <p className="mt-4">
            <Link
              href="/informatiebeveiliging/iso-27001"
              className="inline-flex items-center font-semibold text-[#0057B8] hover:underline"
            >
              Lees meer over NIS2 en ISO 27001
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
