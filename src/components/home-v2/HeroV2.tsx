import Link from "next/link";
import { Reveal } from "@/components/home-v2/primitives/Reveal";
import { heroCopy, keyTakeaways, contact } from "@/components/home-v2/data";

/**
 * HeroV2 — full-bleed donkere hero voor de home-v2 ontwerpvariant.
 * Schuift onder de fixed header (-mt-20) en loopt qua gradient naadloos
 * over van de headerkleur (#071631) naar navy (#091E42).
 */
export function HeroV2() {
  const takeaways = keyTakeaways.slice(0, 3);

  return (
    <section
      className="relative overflow-hidden -mt-20 pt-36 pb-24 md:pt-44 md:pb-28 bg-gradient-to-b from-[#071631] to-[#091E42]"
      aria-labelledby="hero-v2-titel"
    >
      {/* Achtergrondlagen */}
      <div
        className="hv2-grid-pattern hv2-grid-fade absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="hv2-aurora-blob bg-accent opacity-25 w-[500px] h-[500px] -top-40 -left-40"
        aria-hidden="true"
      />
      <div
        className="hv2-aurora-blob bg-secondary opacity-20 w-[500px] h-[500px] top-1/4 -right-48"
        style={{ animationDelay: "-4s" }}
        aria-hidden="true"
      />
      <div
        className="hv2-aurora-blob bg-[#0B2A5B] opacity-30 w-[500px] h-[500px] -bottom-48 left-1/4"
        style={{ animationDelay: "-8s" }}
        aria-hidden="true"
      />

      <div className="container relative mx-auto max-w-6xl px-6">
        {/* Badge */}
        <Reveal delay={0}>
          <div className="hv2-glass inline-flex items-center gap-2.5 rounded-full px-4 py-2">
            <span
              className="hv2-pulse-ring relative inline-block h-2 w-2 rounded-full bg-secondary text-secondary"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              {heroCopy.badge}
            </span>
          </div>
        </Reveal>

        {/* Titel */}
        <Reveal delay={100}>
          <h1
            id="hero-v2-titel"
            className="mt-8 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-white"
          >
            {heroCopy.titelRegel1}
            <span className="block bg-gradient-to-r from-accent to-[#FFB45C] bg-clip-text text-transparent">
              {heroCopy.titelAccent}
            </span>
          </h1>
        </Reveal>

        {/* Subtitel */}
        <Reveal delay={200}>
          <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-white/70">
            {heroCopy.subtitel}
          </p>
        </Reveal>

        {/* CTA's */}
        <Reveal delay={300}>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href={contact.contactHref}
              className="hv2-glow-orange inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-white hover:bg-[#E67E00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071631]"
            >
              Plan een kennismaking
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </Link>
            <Link
              href={contact.selectorHref}
              className="hv2-glass inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071631]"
            >
              ISO Norm Selector
            </Link>
          </div>
        </Reveal>

        {/* Trustpunten */}
        <Reveal delay={400}>
          <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            {heroCopy.trustItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-secondary"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8.5 12.5 2.5 2.5 4.5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Key takeaways */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {takeaways.map((takeaway, i) => (
            <Reveal key={takeaway.onderwerp} delay={i * 120} className="h-full">
              <div className="hv2-glass h-full rounded-2xl p-6 transition-colors duration-300 hover:border-accent/40">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {takeaway.onderwerp}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {takeaway.waarde}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Scroll-indicator */}
        <div
          className="mt-14 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <div className="flex h-7 w-4 items-start justify-center rounded-full border border-white/20 pt-1.5">
            <span className="hv2-scroll-dot h-1 w-1 rounded-full bg-white/60" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/40">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}

export default HeroV2;
