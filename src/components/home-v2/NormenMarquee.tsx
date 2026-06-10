import { normenExpertise } from "@/components/home-v2/data";

/**
 * Slanke normenband direct onder de hero: een oneindig doorlopende marquee
 * met de normen en wetgeving waarin MaasISO expertise heeft.
 *
 * Servercomponent, pure CSS-animatie (hv2-marquee in home-v2.css). De lijst
 * wordt twee keer gerenderd zodat de translateX(-50%)-loop naadloos is; de
 * tweede kopie is aria-hidden. Hover pauzeert, prefers-reduced-motion zet
 * de animatie stil — beide via de bestaande CSS.
 */

function MarqueeItems() {
  return (
    <>
      {normenExpertise.map((norm) => (
        <span key={norm} className="flex items-center">
          <span className="whitespace-nowrap text-base font-medium tracking-wide text-white/50 md:text-lg">
            {norm}
          </span>
          <span
            aria-hidden="true"
            className="mx-8 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60 md:mx-10"
          />
        </span>
      ))}
    </>
  );
}

export function NormenMarquee() {
  return (
    <section
      aria-labelledby="hv2-normen-label"
      className="border-t border-white/5 bg-[#071631] py-8"
    >
      <p
        id="hv2-normen-label"
        className="mb-4 text-center text-[11px] uppercase tracking-[0.25em] text-white/30"
      >
        Expertise in normen en wetgeving
      </p>
      <div className="hv2-marquee">
        <div className="hv2-marquee-track">
          <div className="flex items-center">
            <MarqueeItems />
          </div>
          <div aria-hidden="true" className="flex items-center">
            <MarqueeItems />
          </div>
        </div>
      </div>
    </section>
  );
}
