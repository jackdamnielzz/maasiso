interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  location: string;
}

interface TestimonialsSectionV3Props {
  testimonials: readonly Testimonial[];
}

export function TestimonialsSectionV3({ testimonials }: TestimonialsSectionV3Props) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#091E42] via-[#0d2b5c] to-[#134078] p-8 md:p-14 text-white">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FF8B00]/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[#0057B8]/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/80">
            <svg className="h-4 w-4 text-[#FF8B00]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            Cliëntervaringen
          </span>
          <h2 className="mt-6 text-3xl font-extrabold text-white md:text-4xl">
            Wat onze klanten zeggen
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <div
              key={`${item.author}-${index}`}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.05] backdrop-blur-sm p-8 border border-white/10 transition-all duration-500 hover:bg-white/[0.1]"
            >
              {/* Quote icon */}
              <svg className="h-10 w-10 text-[#FF8B00]/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              
              <blockquote className="mt-4 text-base leading-relaxed text-white/90">
                "{item.quote}"
              </blockquote>
              
              {/* Author info */}
              <div className="mt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#FF8B00] to-[#E67E00] flex items-center justify-center text-lg font-bold text-white">
                  {item.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-white">{item.author}</p>
                  <p className="text-sm text-white/60">{item.role}, {item.company}</p>
                  <p className="text-xs text-white/40">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expert quote */}
        <div className="mt-12 relative overflow-hidden rounded-2xl bg-white/[0.05] backdrop-blur-sm p-8 md:p-10 border border-white/10">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#FF8B00]/20 blur-3xl" />
          <div className="relative max-w-3xl mx-auto text-center">
            <svg className="h-12 w-12 mx-auto text-[#FF8B00]/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="mt-6 text-xl leading-relaxed text-white/90 md:text-2xl">
              De meeste MKB-bedrijven onderschatten hoeveel ze al op orde hebben. Een goede
              nulmeting laat vaak zien dat 40-60% van de eisen al informeel is ingeregeld. Het
              traject gaat dan over structureren en aantoonbaar maken, niet over alles opnieuw
              uitvinden.
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#FF8B00] to-[#E67E00] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                NM
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Niels Maas</p>
                <p className="text-sm text-white/60">Senior consultant & oprichter, MaasISO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
