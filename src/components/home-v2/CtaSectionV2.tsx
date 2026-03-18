import Link from "next/link";

export function CtaSectionV2() {
  return (
    <section className="!py-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#071631] via-[#0d2b5c] to-[#134078]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="absolute top-0 left-1/3 h-[300px] w-[300px] rounded-full bg-[#0057B8]/20 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 h-[200px] w-[200px] rounded-full bg-[#FF8B00]/15 blur-[80px]" />

      <div className="container-custom relative px-4 py-20 text-center md:py-28">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold text-white md:text-5xl leading-tight">
            Klaar om te beginnen?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            Neem vrijblijvend contact op voor een kennismakingsgesprek. Wij vertellen u graag wat
            MaasISO voor uw organisatie kan betekenen.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8B00] px-8 py-4 text-base font-bold text-white shadow-[0_4px_24px_rgba(255,139,0,0.4)] transition-all duration-300 hover:bg-[#E67E00] hover:shadow-[0_6px_32px_rgba(255,139,0,0.5)] hover:-translate-y-0.5 sm:min-w-[240px]"
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
              Doe de ISO Norm Selector
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              100% slagingspercentage
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              15+ jaar ervaring
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Vrijblijvend gesprek
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
