import Link from "next/link";

interface KeyTakeaway {
  readonly onderwerp: string;
  readonly waarde: string;
}

interface HeroMinimalProps {
  keyTakeaways: readonly KeyTakeaway[];
}

export function HeroMinimal({ keyTakeaways }: HeroMinimalProps) {
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        {/* Simple badge */}
        <p className="text-sm font-medium tracking-wide text-[#0057B8]">
          Onafhankelijke ISO-consultancy
        </p>

        {/* Clean heading */}
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.15] tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
          ISO-certificering voor MKB-bedrijven,{" "}
          <span className="text-gray-400">pragmatisch en transparant.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
          MaasISO begeleidt MKB-bedrijven in Nederland en Belgie bij
          ISO-certificering, informatiebeveiliging en AVG compliance. Als
          onafhankelijk consultant helpen wij van nulmeting tot succesvolle
          audit.
        </p>

        {/* Clean CTA */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Plan een kennismaking
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="https://iso-selector.maasiso.nl/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-7 py-3.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            ISO Norm Selector
          </Link>
        </div>

        {/* Minimal trust line */}
        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-400">
          <span>100% slagingspercentage</span>
          <span>15+ jaar ervaring</span>
          <span>Onafhankelijk advies</span>
        </div>

        {/* Divider */}
        <div className="mt-16 h-px bg-gray-100" />

        {/* Key takeaways - clean grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {keyTakeaways.slice(0, 3).map((item) => (
            <div key={item.onderwerp}>
              <p className="text-xs font-medium uppercase tracking-widest text-[#0057B8]">
                {item.onderwerp}
              </p>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                {item.waarde}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
