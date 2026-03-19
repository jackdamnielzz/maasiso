interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  location: string;
}

interface TestimonialsMinimalProps {
  testimonials: readonly Testimonial[];
}

export function TestimonialsMinimal({ testimonials }: TestimonialsMinimalProps) {
  return (
    <section className="bg-gray-900 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Clientervaringen
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Wat onze klanten zeggen
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <div key={`${item.author}-${index}`}>
              <blockquote className="text-base leading-relaxed text-gray-400">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div className="mt-6">
                <p className="text-sm font-medium text-white">{item.author}</p>
                <p className="text-sm text-gray-500">
                  {item.role}, {item.company}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Expert quote */}
        <div className="mt-20 border-t border-gray-800 pt-16">
          <blockquote className="mx-auto max-w-3xl text-center text-xl leading-relaxed text-gray-300 md:text-2xl">
            &ldquo;De meeste MKB-bedrijven onderschatten hoeveel ze al op orde
            hebben. Een goede nulmeting laat vaak zien dat 40-60% van de eisen
            al informeel is ingeregeld. Het traject gaat dan over structureren
            en aantoonbaar maken, niet over alles opnieuw uitvinden.&rdquo;
          </blockquote>
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-white">Niels Maas</p>
            <p className="text-sm text-gray-500">
              Senior consultant & oprichter, MaasISO
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
