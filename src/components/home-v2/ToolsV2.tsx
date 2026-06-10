import Link from "next/link";
import { Reveal } from "@/components/home-v2/primitives/Reveal";
import { contact, normenExpertise } from "@/components/home-v2/data";

/**
 * ToolsV2 — showcase-paneel voor de gratis ISO Norm Selector.
 * Witte sectie met één donker gradientpaneel; rechts een decoratieve
 * "selector preview"-kaart met echte normnamen uit data.ts.
 */
export function ToolsV2() {
  const previewNormen = normenExpertise.slice(0, 4);

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071631] via-primary to-[#0B2A5B] p-10 md:p-16">
          {/* Decoratieve lagen */}
          <div
            aria-hidden="true"
            className="hv2-grid-pattern hv2-grid-fade pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden="true"
            className="hv2-aurora-blob -top-24 -right-24 h-72 w-72 bg-accent opacity-20"
          />
          <div
            aria-hidden="true"
            className="hv2-aurora-blob -bottom-32 -left-20 h-80 w-80 bg-secondary opacity-20"
            style={{ animationDelay: "-7s" }}
          />

          <div className="relative grid items-center gap-12 md:grid-cols-2">
            {/* Linkerkolom: copy + CTA */}
            <Reveal direction="up">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-accent"
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Gratis tool
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  ISO Norm Selector
                </h2>

                <p className="mt-5 leading-relaxed text-white/70">
                  Weet u nog niet welke norm bij uw organisatie past? In enkele
                  vragen krijgt u een onderbouwd advies over de normen die
                  relevant zijn voor uw situatie, sector en doelstellingen.
                </p>

                <div className="mt-8">
                  <Link
                    href={contact.selectorHref}
                    className="hv2-glow-orange inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-white hover:bg-[#E67E00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071631]"
                  >
                    Start de Selector
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Rechterkolom: decoratieve selector-preview */}
            <Reveal direction="left" delay={150} className="hidden md:block">
              <div aria-hidden="true" className="hv2-glass hv2-float rounded-2xl p-6">
                {/* Nep-voortgangsbalk */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-accent to-[#FFB45C]" />
                </div>

                {/* Optierijen met echte normnamen */}
                <div className="mt-6 space-y-3">
                  {previewNormen.map((norm, index) => {
                    const highlighted = index === 1;
                    return (
                      <div
                        key={norm}
                        className={
                          highlighted
                            ? "flex items-center justify-between rounded-xl border border-accent/60 bg-accent/10 px-4 py-3 text-sm text-white"
                            : "flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70"
                        }
                      >
                        <span>{norm}</span>
                        <span
                          className={
                            highlighted
                              ? "flex h-4 w-4 items-center justify-center rounded-full border border-accent"
                              : "h-4 w-4 rounded-full border border-white/25"
                          }
                        >
                          {highlighted ? (
                            <span className="h-2 w-2 rounded-full bg-accent" />
                          ) : null}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ToolsV2;
