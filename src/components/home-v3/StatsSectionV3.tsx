interface Kernfeit {
  kernfeit: string;
  highlight: string;
  eenheid: string;
  bron: string;
  accent: string;
  bg: string;
  text: string;
}

interface StatsSectionV3Props {
  stats: readonly Kernfeit[];
}

export function StatsSectionV3({ stats }: StatsSectionV3Props) {
  return (
    <section id="kernfeiten" className="relative py-16 md:py-24 bg-gradient-to-b from-[#f3f6fb] to-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-0 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px]" />
      <div className="absolute bottom-10 right-0 h-60 w-60 rounded-full bg-violet-500/5 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-[#0057B8]/5 to-[#00875A]/5 blur-[120px]" />

      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#00875A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#00875A]">
            Data & feiten
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-[#091E42] md:text-4xl">Kernfeiten</h2>
          <p className="mt-4 text-lg text-gray-600">De belangrijkste cijfers en statistieken over ISO-certificering</p>
        </div>

        {/* Top row: 3 featured stats with enhanced cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {stats.slice(0, 3).map((item, index) => (
            <div
              key={item.kernfeit}
              className="group relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated gradient top border */}
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.accent}`} />
              
              {/* Glow effect on hover */}
              <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full ${item.bg} blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-80`} />
              
              <div className="relative">
                <p className="text-sm font-medium text-gray-500">{item.kernfeit}</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className={`text-5xl font-black tracking-tight ${item.text}`}>{item.highlight}</span>
                  <span className="text-lg font-semibold text-gray-600">{item.eenheid}</span>
                </div>
                <p className="mt-4 text-xs text-gray-400">{item.bron}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row: 4 compact stats with enhanced cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.slice(3).map((item, index) => (
            <div
              key={item.kernfeit}
              className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              {/* Animated left border on hover */}
              <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              
              {/* Glow effect */}
              <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${item.bg} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-60`} />
              
              <div className="relative">
                <p className="text-xs font-medium text-gray-500 leading-snug">{item.kernfeit}</p>
                <p className={`mt-3 text-3xl font-black tracking-tight ${item.text}`}>{item.highlight}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">{item.eenheid}</p>
                <p className="mt-3 text-[10px] text-gray-400">{item.bron}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
