import Link from "next/link";

interface DienstRij {
  readonly norm: string;
  readonly focus: string;
  readonly duur: string;
  readonly kosten: string;
}

interface DienstenMinimalProps {
  dienstentabel: readonly DienstRij[];
}

export function DienstenMinimal({ dienstentabel }: DienstenMinimalProps) {
  return (
    <section id="diensten" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-[#0057B8]">
          Onze diensten
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          ISO-certificering op maat
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-gray-500">
          Begeleiding bij het implementeren en certificeren van
          managementsystemen volgens internationale ISO-normen.
        </p>

        {/* Clean table-style list */}
        <div className="mt-14 divide-y divide-gray-100">
          {dienstentabel.map((item) => (
            <div
              key={item.norm}
              className="grid grid-cols-2 gap-4 py-6 md:grid-cols-4"
            >
              <div>
                <p className="text-lg font-semibold text-gray-900">{item.norm}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Focus</p>
                <p className="mt-1 text-gray-600">{item.focus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Doorlooptijd</p>
                <p className="mt-1 text-gray-600">{item.duur}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Investering</p>
                <p className="mt-1 font-medium text-gray-900">{item.kosten}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/iso-certificering"
            className="text-sm font-medium text-[#0057B8] hover:underline"
          >
            Bekijk alle ISO-certificeringen &rarr;
          </Link>
        </div>

        {/* Extra diensten */}
        <div className="mt-20 grid gap-12 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Informatiebeveiliging
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Implementatie van informatiebeveiligingsmaatregelen op basis van
              ISO 27001 en de Baseline Informatiebeveiliging Overheid (BIO).
              Inclusief risicoanalyse, Statement of Applicability en
              ISMS-inrichting.
            </p>
            <p className="mt-3 text-xs text-gray-400">
              96.709 actieve ISO 27001 certificaten wereldwijd in 2024. In
              Nederland zijn 1.568 organisaties gecertificeerd.
            </p>
            <Link
              href="/informatiebeveiliging"
              className="mt-4 inline-block text-sm font-medium text-[#0057B8] hover:underline"
            >
              Meer over informatiebeveiliging &rarr;
            </Link>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AVG & privacy compliance
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Praktische begeleiding bij het naleven van de AVG/GDPR. Van
              verwerkingsregister en privacybeleid tot DPIA&apos;s,
              verwerkersovereenkomsten en de rol van externe FG.
            </p>
            <p className="mt-3 text-xs text-gray-400">
              Boetes tot &euro;20 miljoen of 4% van de wereldwijde jaaromzet
              (art. 83 AVG).
            </p>
            <Link
              href="/avg-wetgeving"
              className="mt-4 inline-block text-sm font-medium text-[#0057B8] hover:underline"
            >
              Meer over AVG compliance &rarr;
            </Link>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              NIS2 & Cyberbeveiligingswet
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Met de NIS2-richtlijn wordt aantoonbare informatiebeveiliging voor
              essentiele en belangrijke entiteiten een wettelijke verplichting.
              ISO 27001 dekt circa 70-80% van de NIS2 Artikel 21-verplichtingen.
            </p>
            <Link
              href="/informatiebeveiliging/nis2"
              className="mt-4 inline-block text-sm font-medium text-[#0057B8] hover:underline"
            >
              Meer over NIS2 &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
