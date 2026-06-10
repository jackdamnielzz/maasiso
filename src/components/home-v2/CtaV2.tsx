import Link from "next/link";
import { contact } from "@/components/home-v2/data";
import { Reveal } from "@/components/home-v2/primitives/Reveal";

const trustChips = [
  "100% slagingspercentage",
  "15+ jaar ervaring",
  "Vrijblijvend gesprek",
  "Landelijke dekking",
] as const;

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-secondary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * Grand finale van home-v2: donkere afsluitende CTA-sectie met aurora-gloed,
 * primaire en secundaire actie, trust-chips en directe contactgegevens.
 */
export function CtaV2() {
  return (
    <section className="relative overflow-hidden bg-[#071631] py-28 md:py-36">
      {/* Decoratieve lagen */}
      <div
        className="hv2-grid-pattern hv2-grid-fade absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="hv2-aurora-blob -bottom-40 -left-40 h-[34rem] w-[34rem] bg-accent opacity-20"
        aria-hidden="true"
      />
      <div
        className="hv2-aurora-blob -right-32 -top-32 h-[28rem] w-[28rem] bg-secondary opacity-15"
        style={{ animationDelay: "-7s" }}
        aria-hidden="true"
      />

      <div className="container relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Klaar om te beginnen?
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Neem vrijblijvend contact op voor een kennismakingsgesprek. Wij
            vertellen u graag wat MaasISO voor uw organisatie kan betekenen.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={contact.contactHref}
              className="hv2-glow-orange inline-flex items-center justify-center gap-2 rounded-full bg-accent px-9 py-4 text-sm font-semibold text-white hover:bg-[#E67E00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071631]"
            >
              Plan een kennismaking
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href={contact.selectorHref}
              className="hv2-glass inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071631]"
            >
              ISO Norm Selector
            </Link>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {trustChips.map((chip) => (
              <li
                key={chip}
                className="hv2-glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-white/70"
              >
                <CheckIcon />
                {chip}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-16 border-t border-white/10 pt-10">
            <p className="text-sm text-white/50">Of neem direct contact op</p>
            <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-full text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071631]"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                {contact.email}
              </a>
              <a
                href={contact.telefoonHref}
                className="inline-flex items-center gap-2 rounded-full text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071631]"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.22a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {contact.telefoon}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default CtaV2;
