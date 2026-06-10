"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { Reveal } from "@/components/home-v2/primitives/Reveal";
import { dienstentabel, extraDiensten } from "@/components/home-v2/data";

/**
 * Diensten-sectie voor home-v2: normkaarten met muis-spotlight en
 * drie extra dienstenpanelen. Witte sectie binnen het paginaritme.
 */

function spotlight(e: MouseEvent<HTMLAnchorElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--hv2-x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--hv2-y", `${e.clientY - rect.top}px`);
}

const ArrowIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.75 18.75 12l-5.25 5.25M18.75 12H4.5" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <circle cx="12" cy="12" r="8.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 2" />
  </svg>
);

const EuroIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

/** Iconen voor de extra dienstenpanelen: schild, slot, weegschaal. */
const extraIcons: readonly ReactNode[] = [
  <svg key="shield" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.618 5.984A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016Z"
    />
  </svg>,
  <svg key="lock" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z"
    />
  </svg>,
  <svg key="scale" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 6l3 1m0 0-3 9a5.002 5.002 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2 3-1m-3 1-3 9a5.002 5.002 0 0 0 6.001 0M18 7l3 9m-3-9-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
    />
  </svg>,
];

/** Linker accentrand per paneel: groen, oranje, navy. */
const panelAccents = ["border-l-secondary", "border-l-accent", "border-l-primary"] as const;

export function DienstenV2() {
  return (
    <section id="diensten" aria-labelledby="diensten-titel" className="bg-white py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Sectiekop */}
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Onze diensten</p>
          </div>
          <h2 id="diensten-titel" className="mt-4 text-3xl font-semibold tracking-tight text-primary md:text-5xl">
            ISO-certificering op maat
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-500">
            Begeleiding bij het implementeren en certificeren van managementsystemen volgens
            internationale ISO-normen.
          </p>
        </Reveal>

        {/* Normkaarten */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dienstentabel.map((dienst, index) => (
            <Reveal key={dienst.norm} delay={index * 100} className="h-full">
              <Link
                href={dienst.href}
                onMouseMove={spotlight}
                className="hv2-spotlight group relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <h3 className="text-xl font-semibold tracking-tight text-primary">{dienst.norm}</h3>
                <p className="mt-1 text-sm text-gray-500">{dienst.focus}</p>

                <dl className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                      <ClockIcon />
                      Doorlooptijd
                    </dt>
                    <dd className="text-sm text-gray-600">{dienst.duur}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                      <EuroIcon />
                      Investering
                    </dt>
                    <dd className="text-sm font-medium text-primary">{dienst.kosten}</dd>
                  </div>
                </dl>

                <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-accent">
                  Bekijk traject
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Link naar alle certificeringen */}
        <Reveal delay={100}>
          <div className="mt-10">
            <Link
              href="/iso-certificering/"
              className="hv2-underline-draw inline-flex items-center gap-2 pb-1 text-sm font-semibold text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Bekijk alle ISO-certificeringen
              <ArrowIcon />
            </Link>
          </div>
        </Reveal>

        {/* Extra diensten */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {extraDiensten.map((dienst, index) => (
            <Reveal key={dienst.titel} delay={index * 100} className="h-full">
              <div
                className={`flex h-full flex-col rounded-2xl border border-gray-100 border-l-[3px] ${panelAccents[index % panelAccents.length]} bg-[#F7F8FA] p-8`}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"
                  aria-hidden="true"
                >
                  {extraIcons[index % extraIcons.length]}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-primary">{dienst.titel}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{dienst.beschrijving}</p>
                {dienst.feit ? (
                  <p className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500">{dienst.feit}</p>
                ) : null}
                <div className="mt-auto pt-6">
                  <Link
                    href={dienst.href}
                    className="group/link inline-flex items-center gap-2 text-sm font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {dienst.linkLabel}
                    <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DienstenV2;
