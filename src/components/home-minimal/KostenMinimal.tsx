interface KostenRij {
  readonly traject: string;
  readonly grootte: string;
  readonly investering: string;
  readonly duur: string;
}

interface KostenMinimalProps {
  kostenTabel: readonly KostenRij[];
}

export function KostenMinimal({ kostenTabel }: KostenMinimalProps) {
  return (
    <section id="kosten" className="bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Investering
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Transparante kosten
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-gray-500">
          Geen verrassingen achteraf. Vooraf helder over investering en
          doorlooptijd.
        </p>

        {/* Clean table */}
        <div className="mt-14 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 border-b border-gray-100 px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Traject
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Organisatie
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Investering
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Doorlooptijd
            </p>
          </div>

          {/* Rows */}
          {kostenTabel.map((item, index) => (
            <div
              key={`${item.traject}-${item.grootte}`}
              className={`grid grid-cols-4 gap-4 px-6 py-4 ${
                index < kostenTabel.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <p className="text-sm font-medium text-gray-900">
                {item.traject}
              </p>
              <p className="text-sm text-gray-500">{item.grootte}</p>
              <p className="text-sm font-medium text-gray-900">
                {item.investering}
              </p>
              <p className="text-sm text-gray-500">{item.duur}</p>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Indicatief</p>
            <p className="mt-1 text-sm text-gray-500">
              Bedragen varieren op basis van uw specifieke situatie.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              100% slagingsgarantie
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Slaagt u niet? Dan begeleiden wij u kosteloos opnieuw.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Betaalplan mogelijk
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Betaal in termijnen die passen bij uw cashflow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
