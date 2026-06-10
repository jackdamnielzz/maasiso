import Link from "next/link";

export function CtaSectionV3() {
  return (
    <section className="!py-0 relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071631] via-[#0d2b5c] to-[#134078]" />
      
      {/* Animated decorative elements */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="absolute top-0 left-1/3 h-[300px] w-[300px] rounded-full bg-[#0057B8]/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 h-[200px] w-[200px] rounded-full bg-[#FF8B00]/15 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-[#FF8B00]/10 to-transparent blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container-custom relative px-4 py-20 text-center md:py-28">
        <div className="mx-auto max-w-3xl">
          {/* Decorative icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-8">
            <svg className="h-10 w-10 text-[#FF8B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl leading-tight">
            Klaar om te beginnen?
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-xl leading-relaxed text-white/80">
            Neem vrijblijvend contact op voor een kennismakingsgesprek. Wij vertellen u graag wat
            MaasISO voor uw organisatie kan betekenen.
          </p>
          
          {/* Enhanced CTA buttons */}
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
              className="group relative inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/25 bg-white/[0.06] px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/[0.12] hover:-translate-y-1 sm:min-w-[280px]"
            >
              <svg className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Doe de ISO Norm Selector
            </Link>
          </div>

          {/* Enhanced Trust line */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: "✓", text: "100% slagingspercentage" },
              { icon: "✓", text: "15+ jaar ervaring" },
              { icon: "✓", text: "Vrijblijvend gesprek" },
              { icon: "✓", text: "Landelijke dekking" },
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-2.5 text-base text-white/70">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00875A]/30 text-[#00C853] text-sm font-bold">{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>

          {/* Contact info */}
          <div className="mt-12 pt-10 border-t border-white/10">
            <p className="text-white/50 mb-4">Of neem direct contact op:</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="mailto:info@maasiso.nl" className="flex items-center gap-2 text-white hover:text-[#FF8B00] transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@maasiso.nl
              </a>
              <a href="tel:+31623578344" className="flex items-center gap-2 text-white hover:text-[#FF8B00] transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +31 (0)6 2357 8344
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
