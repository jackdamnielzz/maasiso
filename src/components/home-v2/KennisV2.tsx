import Link from "next/link";

import { kennisArtikelen } from "@/components/home-v2/data";
import { Reveal } from "@/components/home-v2/primitives/Reveal";

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function BekijkAlleLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/kennis/blog/"
      className={`hv2-underline-draw inline-flex items-center gap-2 pb-1 text-sm font-semibold text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      Bekijk alle artikelen
      <ArrowIcon />
    </Link>
  );
}

/**
 * Kennis & resources — drie uitgelichte kennisartikelen als kaarten,
 * met een link naar het volledige blogoverzicht.
 */
export function KennisV2() {
  return (
    <section aria-labelledby="kennis-v2-heading" className="bg-white py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Kennis
                </span>
              </div>
              <h2
                id="kennis-v2-heading"
                className="mt-4 text-3xl font-semibold tracking-tight text-primary md:text-5xl"
              >
                Kennis &amp; resources
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-500">
                Onze kennis is vrij beschikbaar om MKB-organisaties te helpen onderbouwde
                keuzes te maken.
              </p>
            </div>
            <div className="hidden shrink-0 md:block">
              <BekijkAlleLink />
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {kennisArtikelen.map((artikel, i) => (
            <Reveal key={artikel.slug} delay={i * 100} className="h-full">
              <Link
                href={`/kennis/blog/${artikel.slug}/`}
                className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Artikel
                </span>
                <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-primary transition-colors group-hover:text-accent">
                  {artikel.titel}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-500">
                  {artikel.beschrijving}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  Lees artikel
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 md:hidden">
          <BekijkAlleLink />
        </Reveal>
      </div>
    </section>
  );
}

export default KennisV2;
