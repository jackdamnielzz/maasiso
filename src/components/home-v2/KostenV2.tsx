"use client";

import { useState } from "react";
import { kostenTabel } from "@/components/home-v2/data";
import { Reveal } from "@/components/home-v2/primitives/Reveal";

const ALLE_TRAJECTEN = "Alle trajecten";

const trajectOpties: readonly string[] = [
  ALLE_TRAJECTEN,
  ...Array.from(new Set(kostenTabel.map((rij) => rij.traject))),
];

/**
 * Kosten-sectie voor de home-v2 ontwerpvariant: transparante kostentabel
 * met een segmented filter per traject. Lichtgrijze sectie in het paginaritme.
 */
export function KostenV2() {
  const [actiefFilter, setActiefFilter] = useState<string>(ALLE_TRAJECTEN);

  const gefilterd =
    actiefFilter === ALLE_TRAJECTEN
      ? kostenTabel
      : kostenTabel.filter((rij) => rij.traject === actiefFilter);

  return (
    <section id="kosten" className="bg-[#F7F8FA] py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Sectiekop */}
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Investering
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary md:text-5xl">
            Transparante kosten
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
            Geen verrassingen achteraf. Vooraf helder over investering en doorlooptijd.
          </p>
        </Reveal>

        {/* Segmented filter */}
        <Reveal delay={100}>
          <div
            role="group"
            aria-label="Filter trajecten"
            className="mt-10 flex flex-wrap gap-3"
          >
            {trajectOpties.map((optie) => {
              const actief = optie === actiefFilter;
              return (
                <button
                  key={optie}
                  type="button"
                  aria-pressed={actief}
                  onClick={() => setActiefFilter(optie)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                    actief
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {optie}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Tabelkaart */}
        <Reveal delay={150}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Desktop: tabelweergave (ARIA-tabelrollen zodat screenreaders
                koppen en cellen aan elkaar koppelen) */}
            <div
              role="table"
              aria-label="Kosten en doorlooptijd per traject"
              className="hidden md:block"
            >
              <div
                role="row"
                className="grid grid-cols-4 border-b border-gray-200 bg-[#F7F8FA] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                <span role="columnheader">Traject</span>
                <span role="columnheader">Organisatie</span>
                <span role="columnheader">Investering</span>
                <span role="columnheader">Doorlooptijd</span>
              </div>
              <div key={actiefFilter} role="rowgroup">
                {gefilterd.map((rij, i) => (
                  <Reveal
                    key={`${rij.traject}-${rij.grootte}`}
                    role="row"
                    duration={350}
                    distance={10}
                    delay={i * 40}
                    className="grid grid-cols-4 items-center border-b border-gray-50 px-8 py-5 transition-colors last:border-0 hover:bg-[#F7F8FA]"
                  >
                    <span role="cell" className="font-semibold text-primary">{rij.traject}</span>
                    <span role="cell" className="text-sm text-gray-500">{rij.grootte}</span>
                    <span role="cell" className="font-semibold text-primary">{rij.investering}</span>
                    <span role="cell" className="text-sm text-gray-500">{rij.duur}</span>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Mobiel: gestapelde kaarten */}
            <div className="md:hidden">
              <div key={`mobiel-${actiefFilter}`} className="divide-y divide-gray-100">
                {gefilterd.map((rij, i) => (
                  <Reveal
                    key={`${rij.traject}-${rij.grootte}`}
                    duration={350}
                    distance={10}
                    delay={i * 40}
                    className="p-6"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-base font-semibold text-primary">{rij.traject}</h3>
                      <span className="text-sm text-gray-500">{rij.grootte}</span>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Investering
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-primary">
                          {rij.investering}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Doorlooptijd
                        </dt>
                        <dd className="mt-1 text-sm text-gray-500">{rij.duur}</dd>
                      </div>
                    </dl>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Toelichting */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Reveal delay={0}>
            <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary"
                aria-hidden="true"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-primary">
                Indicatief
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Bedragen varieren op basis van uw specifieke situatie.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary"
                aria-hidden="true"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75l2.25 2.25L15 10.5m6 1.5c0 5.25-3.75 8.25-9 10.5-5.25-2.25-9-5.25-9-10.5V5.25L12 2.25l9 3v6.75z"
                  />
                </svg>
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-primary">
                100% slagingsgarantie
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Slaagt u niet? Dan begeleiden wij u kosteloos opnieuw.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary"
                aria-hidden="true"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 5.25h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75z"
                  />
                </svg>
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-primary">
                Betaalplan mogelijk
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Betaal in termijnen die passen bij uw cashflow.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
