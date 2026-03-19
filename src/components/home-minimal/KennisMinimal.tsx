import Link from "next/link";

const artikelen = [
  {
    titel: "ISO 9001 certificering: kosten, proces & voordelen [2026]",
    beschrijving:
      "Alles wat u moet weten over ISO 9001 certificering: van kosten en doorlooptijd tot de voordelen voor uw organisatie.",
  },
  {
    titel: "ISO 27001 certificering: complete gids, kosten & stappen (2026)",
    beschrijving:
      "Een complete handleiding voor ISO 27001 certificering, inclusief stappenplan en kostenoverzicht.",
  },
  {
    titel: "AVG wetgeving: praktisch advies & implementatie voor MKB",
    beschrijving:
      "Praktische tips voor AVG compliance in MKB-organisaties. Wat moet u regelen en hoe pakt u dat aan?",
  },
];

export function KennisMinimal() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-[#0057B8]">
          Kennis
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Kennis & resources
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-gray-500">
          Onze kennis is vrij beschikbaar om MKB-organisaties te helpen
          onderbouwde keuzes te maken.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {artikelen.map((artikel) => (
            <Link
              key={artikel.titel}
              href="/kennis/blog"
              className="group block"
            >
              <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-[#0057B8]">
                {artikel.titel}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {artikel.beschrijving}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-[#0057B8]">
                Lees artikel &rarr;
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/kennis/blog"
            className="text-sm font-medium text-[#0057B8] hover:underline"
          >
            Bekijk alle artikelen &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
