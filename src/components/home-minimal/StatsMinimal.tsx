interface Kernfeit {
  kernfeit: string;
  highlight: string;
  eenheid: string;
  bron: string;
  accent: string;
  bg: string;
  text: string;
}

interface StatsMinimalProps {
  stats: readonly Kernfeit[];
}

export function StatsMinimal({ stats }: StatsMinimalProps) {
  return (
    <section id="kernfeiten" className="bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Data & feiten
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Kernfeiten
        </h2>

        <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {stats.slice(0, 6).map((item) => (
            <div key={item.kernfeit} className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-400">{item.kernfeit}</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-gray-900">
                {item.highlight}
                <span className="ml-2 text-base font-normal text-gray-400">
                  {item.eenheid}
                </span>
              </p>
              <p className="mt-2 text-xs text-gray-300">{item.bron}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
