import { waaromMaasIso } from "@/components/home-v2/data";
import { CountUp } from "@/components/home-v2/primitives/CountUp";
import { Reveal } from "@/components/home-v2/primitives/Reveal";

/**
 * Waarom MaasISO — bento-grid met twee uitgelichte navy bewijskaarten
 * (100% slagingspercentage, 15+ jaar ervaring) en vijf witte kenmerkkaarten.
 * Content komt 1-op-1 uit waaromMaasIso in data.ts.
 */

const featuredCards = [
  { item: waaromMaasIso[5], end: 100, suffix: "%", blobDelay: "0s" },
  { item: waaromMaasIso[6], end: 15, suffix: "+", blobDelay: "-7s" },
] as const;

const overigeKenmerken = waaromMaasIso.slice(0, 5);

export function WaaromV2() {
  return (
    <section id="waarom" className="bg-[#F7F8FA] py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Waarom MaasISO
            </p>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary md:text-5xl">
            Wat maakt ons anders?
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-6">
          {featuredCards.map(({ item, end, suffix, blobDelay }, index) => (
            <Reveal key={item.kenmerk} className="md:col-span-3" delay={index * 90}>
              <div className="relative h-full overflow-hidden rounded-2xl bg-primary p-10 text-white shadow-sm">
                <div className="hv2-grid-pattern absolute inset-0" aria-hidden="true" />
                <div
                  className="hv2-aurora-blob -right-16 -top-16 h-48 w-48 bg-accent"
                  style={{ opacity: 0.2, animationDelay: blobDelay }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <CountUp
                    end={end}
                    suffix={suffix}
                    className="text-6xl font-semibold tracking-tight md:text-7xl"
                  />
                  <h3 className="mt-5 text-base font-semibold">{item.kenmerk}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{item.betekenis}</p>
                </div>
              </div>
            </Reveal>
          ))}

          {overigeKenmerken.map((item, index) => (
            <Reveal
              key={item.kenmerk}
              // Laatste twee kaarten vullen samen de volledige rij (3 + 3),
              // zodat het bento-grid geen leeg gat onderaan rechts laat.
              className={index >= 3 ? "md:col-span-3" : "md:col-span-2"}
              delay={(featuredCards.length + index) * 90}
            >
              <div className="group h-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-secondary hover:shadow-lg">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white transition-colors duration-300 group-hover:bg-secondary"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="mt-5 text-base font-semibold text-primary">{item.kenmerk}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.betekenis}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
