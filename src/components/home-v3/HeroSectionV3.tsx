import Link from "next/link";

interface KeyTakeaway {
  readonly onderwerp: string;
  readonly waarde: string;
}

interface HeroSectionV3Props {
  keyTakeaways: readonly KeyTakeaway[];
}

export function HeroSectionV3({ keyTakeaways }: HeroSectionV3Props) {
  return (
    <section className="hero-section relative overflow-hidden bg-[#071631] text-white">
      {/* Animated gradient background with enhanced effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071631] via-[#0d2b5c] to-[#0f4177]" />
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-[#0057B8]/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#FF8B00]/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-to-r from-[#0057B8]/10 to-[#00875A]/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Enhanced grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container-custom relative px-4 py-20 md:py-28 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Enhanced Badge with glow effect */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853] shadow-[0_0_8px_rgba(0,200,83,0.6)]"></span>
            </span>
            Onafhankelijke ISO-consultancy voor MKB
          </div>

          {/* Enhanced Heading with gradient animation */}
          <h1 className="mt-10 text-4xl font-black leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            <span className="block text-white">ISO-consultant voor MKB:</span>
            <span className="mt-3 block bg-gradient-to-r from-[#FF8B00] via-[#FFB347] to-[#FF8B00] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              Certificering, informatiebeveiliging en compliance
            </span>
          </h1>

          {/* Enhanced Sub text with better typography */}
          <p className="mt-8 mx-auto max-w-3xl text-xl leading-relaxed text-white/80 md:text-2xl">
            MaasISO begeleidt MKB-bedrijven in Nederland en België bij ISO-certificering,
            informatiebeveiliging en AVG compliance.{' '}
            <span className="text-white font-medium">Als onafhankelijk consultant</span> helpen wij
            organisaties van nulmeting tot succesvolle audit:{' '}
            <span className="text-[#FF8B00] font-semibold">pragmatisch, transparant</span> en afgestemd
            op de dagelijkse praktijk.
          </p>

          {/* Enhanced CTA buttons with hover effects */}
          <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
            <Link
              href="/contact/"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#FF8B00] px-10 py-5 text-lg font-bold text-white shadow-[0_4px_24px_rgba(255,139,0,0.4)] transition-all duration-300 hover:bg-[#E67E00] hover:shadow-[0_8px_40px_rgba(255,139,0,0.5)] hover:-translate-y-1 sm:min-w-[280px]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Plan een kennismaking
              <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="https://iso-selector.maasiso.nl/"
              className="group relative inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/25 bg-white/[0.06] px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/[0.12] hover:-translate-y-1 hover:shadow-lg sm:min-w-[280px]"
            >
              <svg className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Doe de ISO Norm Selector
            </Link>
          </div>

          {/* Trust badges with enhanced styling */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: "🛡️", text: "100% Slagingspercentage" },
              { icon: "📅", text: "15+ Jaar ervaring" },
              { icon: "🤝", text: "Onafhankelijk advies" },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 backdrop-blur-sm border border-white/10">
                <span className="text-lg">{badge.icon}</span>
                <span className="text-sm font-medium text-white/90">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Trust indicators */}
        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {keyTakeaways.slice(0, 3).map((item, index) => (
            <div
              key={`hero-${item.onderwerp}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md transition-all duration-500 hover:border-white/25 hover:bg-white/[0.1] hover:-translate-y-2 hover:shadow-2xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FF8B00]/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF8B00]">
                {item.onderwerp}
              </p>
              <p className="mt-3 text-base leading-relaxed text-white/90">{item.waarde}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced bottom wave with gradient */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 60h1440V30c-240-40-480-40-720 0S240 70 0 30V60z" fill="#f3f6fb" />
        </svg>
      </div>
    </section>
  );
}
