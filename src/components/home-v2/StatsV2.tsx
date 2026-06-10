import type { ReactNode } from "react";
import { kernfeiten } from "@/components/home-v2/data";
import { Reveal } from "@/components/home-v2/primitives/Reveal";
import { CountUp } from "@/components/home-v2/primitives/CountUp";

/**
 * Geanimeerde tellers per kernfeit. Deze mapping spiegelt 1-op-1 de
 * `kernfeiten`-array in data.ts (index 0 t/m 5) — de highlight-strings worden
 * bewust NIET runtime geparsed. Wijzigt data.ts, pas dan ook deze lijst aan.
 */
const kernfeitWaarden: readonly ReactNode[] = [
  // index 0 — highlight "1,1+" (miljoen)
  <CountUp key="kf-0" end={1.1} decimals={1} suffix="+" separator="" />,
  // index 1 — highlight "96.709"
  <CountUp key="kf-1" end={96709} />,
  // index 2 — highlight "1.568"
  <CountUp key="kf-2" end={1568} />,
  // index 3 — highlight "€20M"
  <CountUp key="kf-3" end={20} prefix="€" suffix="M" />,
  // index 4 — highlight "70-80%"
  <span key="kf-4">
    <CountUp end={70} />
    –
    <CountUp end={80} suffix="%" />
  </span>,
  // index 5 — highlight "3-6"
  <span key="kf-5">
    <CountUp end={3} />
    –
    <CountUp end={6} />
  </span>,
];

/** Bovenrand van de kaarten: afwisselend oranje en groene gradient-lijn. */
const accentLijnen = [
  "from-accent to-[#FFB45C]",
  "from-secondary to-emerald-400",
] as const;

export function StatsV2() {
  return (
    <section
      id="kernfeiten"
      className="relative overflow-hidden bg-primary py-24 md:py-32"
    >
      {/* Decoratieve achtergrond: fijn raster + zachte groene gloed */}
      <div
        aria-hidden="true"
        className="hv2-grid-pattern hv2-grid-fade absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="hv2-aurora-blob -bottom-40 -right-40 h-[26rem] w-[26rem] bg-secondary opacity-15"
        style={{ animationDelay: "-5s" }}
      />

      <div className="container relative mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Data &amp; feiten
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Kernfeiten
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">
            Onderbouwd met openbare bronnen en eigen praktijkervaring.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
          {kernfeiten.map((feit, index) => (
            <Reveal key={feit.kernfeit} delay={index * 80} className="h-full">
              <article className="hv2-glass relative flex h-full flex-col overflow-hidden rounded-2xl p-8 transition-transform duration-300 hover:-translate-y-1">
                <div
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentLijnen[index % 2]}`}
                />
                <h3 className="text-sm font-normal leading-relaxed text-white/60">
                  {feit.kernfeit}
                </h3>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {kernfeitWaarden[index] ?? feit.highlight}
                </p>
                <p className="mt-2 text-sm text-white/60">{feit.eenheid}</p>
                <p className="mt-auto flex items-start gap-1.5 pt-6 text-xs leading-relaxed text-white/40">
                  <svg
                    aria-hidden="true"
                    className="mt-px h-3.5 w-3.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                  <span>{feit.bron}</span>
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsV2;
