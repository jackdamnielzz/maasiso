import { aanpakStappen } from "@/components/home-v2/data";

/**
 * Aanpak-sectie (legacy preview-variant). Inhoud komt 1-op-1 uit
 * aanpakStappen in src/components/home-v2/data.ts — geen eigen herschreven
 * stappen of weggelaten doorlooptijden.
 */
const stappen = aanpakStappen;

export function AanpakSectionV2() {
  return (
    <article id="aanpak">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FF8B00]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#FF8B00]">
          Onze aanpak
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-[#091E42] md:text-4xl">
          In {stappen.length} stappen naar certificering
        </h2>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line - desktop */}
        <div className="absolute left-8 top-0 bottom-0 hidden w-0.5 bg-gradient-to-b from-[#0057B8] via-[#00875A] to-[#FF8B00] md:block" />

        <div className="space-y-6 md:space-y-0">
          {stappen.map((stap, index) => (
            <div key={stap.number} className="relative md:pl-24 md:pb-12 last:md:pb-0">
              {/* Timeline dot - desktop */}
              <div className="absolute left-[18px] top-2 z-10 hidden md:flex">
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-[0_0_0_4px_#f3f6fb,0_0_0_5px_#d6deea]">
                  <span className="text-lg font-extrabold text-[#091E42]">{Number(stap.number)}</span>
                </div>
              </div>

              {/* Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-[#0057B8]/30">
                {/* Mobile number */}
                <div className="flex items-center gap-4 md:hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#091E42] to-[#0d2b5c] text-sm font-bold text-white shadow-md">
                    {Number(stap.number)}
                  </div>
                  <h3 className="text-lg font-bold text-[#091E42]">
                    {stap.title}
                  </h3>
                </div>

                {/* Desktop title */}
                <h3 className="hidden md:block text-xl font-bold text-[#091E42]">
                  Stap {Number(stap.number)} — {stap.title}
                </h3>

                <p className="mt-3 leading-relaxed text-gray-600">
                  {stap.description}
                </p>

                {/* Doorlooptijd */}
                {index < stappen.length - 1 && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Doorlooptijd: {stap.duration}
                  </p>
                )}

                {/* Progress indicator */}
                {index < stappen.length - 1 && (
                  <div className="mt-5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0057B8] to-[#00875A] transition-all duration-500"
                        style={{ width: `${((index + 1) / stappen.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-400">
                      {index + 1}/{stappen.length}
                    </span>
                  </div>
                )}

                {/* Final step success indicator */}
                {index === stappen.length - 1 && (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#00875A]/10 px-4 py-2 text-sm font-semibold text-[#00875A]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Certificaat behaald
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
