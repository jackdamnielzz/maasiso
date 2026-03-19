import Link from "next/link";

export function CtaMinimal() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          Klaar om te beginnen?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500">
          Neem vrijblijvend contact op voor een kennismakingsgesprek. Wij
          vertellen u graag wat MaasISO voor uw organisatie kan betekenen.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Plan een kennismaking
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <Link
            href="https://iso-selector.maasiso.nl/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-8 py-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            ISO Norm Selector
          </Link>
        </div>

        {/* Trust */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <span>100% slagingspercentage</span>
          <span>15+ jaar ervaring</span>
          <span>Vrijblijvend gesprek</span>
          <span>Landelijke dekking</span>
        </div>

        {/* Contact */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <p className="text-sm text-gray-400">Of neem direct contact op</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
            <a
              href="mailto:info@maasiso.nl"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              info@maasiso.nl
            </a>
            <a
              href="tel:+31623578344"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              +31 (0)6 2357 8344
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
