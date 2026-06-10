import { Reveal } from "@/components/home-v2/primitives/Reveal";
import { CountUp } from "@/components/home-v2/primitives/CountUp";
import { overOnsParagrafen } from "@/components/home-v2/data";

/**
 * Over ons — witte sectie met links het kennismakingspaneel (navy, met
 * ankerfeiten als designelement) en rechts de drie introductieparagrafen.
 *
 * Servercomponent: alle interactie komt uit de Reveal/CountUp-primitives.
 */
export function OverV2() {
  const [eersteParagraaf, ...overigeParagrafen] = overOnsParagrafen;

  return (
    <section id="over-ons" className="scroll-mt-20 bg-white py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Linkerkolom: eyebrow, titel en navy feitenpaneel */}
          <div className="md:col-span-5">
            <Reveal>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Over ons
                </p>
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-primary md:text-5xl">
                Wat doet MaasISO?
              </h2>
            </Reveal>

            <Reveal delay={150}>
              {/*
                Zweef-animatie alleen op md+ (en motion-safe): zelfde keyframes
                als hv2-float-slow uit home-v2.css, maar dan breakpoint-gebonden.
              */}
              <div className="relative mt-10 overflow-hidden rounded-2xl bg-primary p-8 motion-safe:md:animate-[hv2-float_9s_ease-in-out_infinite]">
                <div aria-hidden="true" className="hv2-grid-pattern absolute inset-0" />
                <div
                  aria-hidden="true"
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-secondary/20 blur-3xl"
                />

                <div className="relative">
                  <p className="text-5xl font-semibold tracking-tight text-white">15+</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    jaar ervaring
                  </p>

                  <div
                    aria-hidden="true"
                    className="my-8 h-px w-full bg-gradient-to-r from-accent to-secondary"
                  />

                  <p className="text-5xl font-semibold tracking-tight text-white">
                    <CountUp end={100} suffix="%" />
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    slagingspercentage
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Rechterkolom: de drie paragrafen + ankerlink naar de aanpak */}
          <div className="md:col-span-7">
            <Reveal delay={100}>
              <p className="text-lg leading-relaxed text-[#172B4D] md:text-xl">
                {eersteParagraaf}
              </p>
            </Reveal>

            {overigeParagrafen.map((paragraaf, index) => (
              <Reveal key={paragraaf.slice(0, 32)} delay={(index + 2) * 100}>
                <p className="mt-6 text-base leading-relaxed text-gray-600 md:text-lg">
                  {paragraaf}
                </p>
              </Reveal>
            ))}

            <Reveal delay={400}>
              <a
                href="#aanpak"
                className="group mt-10 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <span className="hv2-underline-draw pb-1 group-hover:[background-size:100%_3px]">
                  Maak kennis met onze aanpak
                </span>
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
