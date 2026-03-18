import Link from "next/link";

interface KeyTakeaway {
  readonly onderwerp: string;
  readonly waarde: string;
}

interface HeroSectionV2Props {
  keyTakeaways: readonly KeyTakeaway[];
}

export function HeroSectionV2({ keyTakeaways }: HeroSectionV2Props) {
  return (
    <section className="hero-section relative overflow-hidden bg-[#071631] text-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071631] via-[#0d2b5c] to-[#0f4177]" />
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-[#0057B8]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#FF8B00]/10 blur-[100px]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container-custom relative px-4 py-20 md:py-28 lg:py-32">
        <div className="max-w-4xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#00C853] shadow-[0_0_8px_rgba(0,200,83,0.6)]" />
            Onafhankelijke ISO-consultancy voor MKB
          </span>

          {/* Heading */}
          <h1 className="mt-8 text-3xl font-extrabold leading-[1.15] tracking-tight md:text-5xl lg:text-[3.5rem]">
            <span className="block">ISO-consultant voor MKB:</span>
            <span className="mt-2 block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              certificering, informatiebeveiliging en compliance
            </span>
          </h1>

          {/* Sub text */}
          <p className="mt-7 max-w-3xl text-lg leading-relaxed text-white/80 md:text-xl">
            MaasISO begeleidt MKB-bedrijven in Nederland en Belgie bij ISO-certificering,
            informatiebeveiliging en AVG compliance. Als onafhankelijk consultant helpen wij
            organisaties van nulmeting tot succesvolle audit: pragmatisch, transparant en afgestemd
            op de dagelijkse praktijk.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#FF8B00] px-8 py-4 text-base font-bold text-white shadow-[0_4px_24px_rgba(255,139,0,0.4)] transition-all duration-300 hover:bg-[#E67E00] hover:shadow-[0_6px_32px_rgba(255,139,0,0.5)] hover:-translate-y-0.5 sm:min-w-[240px]"
            >
              Plan een kennismaking
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="https://iso-selector.maasiso.nl/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/25 bg-white/[0.06] px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/[0.12] hover:-translate-y-0.5 sm:min-w-[240px]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Doe de ISO Norm Selector
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {keyTakeaways.slice(0, 3).map((item) => (
            <div
              key={`hero-${item.onderwerp}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:-translate-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF8B00]">
                {item.onderwerp}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/90">{item.waarde}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 48h1440V24c-240-32-480-32-720 0S240 56 0 24v24z" fill="#f3f6fb" />
        </svg>
      </div>
    </section>
  );
}
