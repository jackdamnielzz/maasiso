import Link from "next/link";

interface KeyTakeaway {
  readonly onderwerp: string;
  readonly waarde: string;
}

interface HeroSectionProps {
  keyTakeaways: readonly KeyTakeaway[];
}

export function HeroSection({ keyTakeaways }: HeroSectionProps) {
  return (
    <section className="hero-section relative overflow-hidden bg-gradient-to-br from-[#071631] via-[#0d2b5c] to-[#0f4177] text-white">
      <div className="container-custom px-4 py-24 md:py-32">
        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
          Onafhankelijke ISO-consultancy voor MKB
        </span>
        <h1 className="mt-6 max-w-5xl text-3xl font-bold leading-tight md:text-5xl">
          ISO-consultant voor MKB: certificering, informatiebeveiliging en compliance
        </h1>
        <p className="mt-6 max-w-5xl text-lg leading-relaxed text-white/90 md:text-xl">
          MaasISO begeleidt MKB-bedrijven in Nederland en Belgie bij ISO-certificering,
          informatiebeveiliging en AVG compliance. Als onafhankelijk consultant helpen wij
          organisaties van nulmeting tot succesvolle audit: pragmatisch, transparant en afgestemd
          op de dagelijkse praktijk. MaasISO is geen certificerende instelling: wij begeleiden, de
          certificerende instelling toetst.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/contact" className="primary-button text-center sm:min-w-[240px]">
            Plan een kennismaking
          </Link>
          <Link
            href="https://iso-selector.maasiso.nl/"
            className="primary-button text-center sm:min-w-[240px] border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#091E42]"
          >
            Doe de ISO Norm Selector
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {keyTakeaways.slice(0, 3).map((item) => (
            <div
              key={`hero-${item.onderwerp}`}
              className="rounded-xl border border-white/20 bg-white/10 p-5 md:p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/15"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
                {item.onderwerp}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white">{item.waarde}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
