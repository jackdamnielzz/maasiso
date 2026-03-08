import Link from "next/link";

export function CtaSection() {
  return (
    <section className="!py-0 bg-gradient-to-r from-[#0d2b5c] via-[#13407a] to-[#0d2b5c] text-white">
      <div className="container-custom px-4 py-16 text-center md:py-24">
        <h2 className="text-3xl font-bold md:text-4xl">Klaar om te beginnen?</h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-white/90">
          Neem vrijblijvend contact op voor een kennismakingsgesprek. Wij vertellen u graag wat
          MaasISO voor uw organisatie kan betekenen.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="primary-button text-center sm:min-w-[240px]">
            Plan een kennismaking
          </Link>
          <Link
            href="/iso-selector"
            className="primary-button text-center sm:min-w-[240px] border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#091E42]"
          >
            Doe de ISO Norm Selector
          </Link>
        </div>
      </div>
    </section>
  );
}
