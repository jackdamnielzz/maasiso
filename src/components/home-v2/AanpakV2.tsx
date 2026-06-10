"use client";

import { useEffect, useRef, useState } from "react";
import { aanpakStappen } from "@/components/home-v2/data";
import { Reveal } from "@/components/home-v2/primitives/Reveal";

/**
 * Aanpak-sectie voor home-v2: verticale timeline van nulmeting tot certificaat.
 * De gekleurde lijn "tekent" zichzelf zodra de sectie in beeld komt
 * (IntersectionObserver, respecteert prefers-reduced-motion).
 */
export function AanpakV2() {
  const sectionRef = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setDrawn(true);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const lastIndex = aanpakStappen.length - 1;

  return (
    <section id="aanpak" ref={sectionRef} className="bg-white py-24 md:py-32">
      {/* Bewuste uitzondering op de max-w-6xl sectiebreedte: de afwisselende
          timeline leest prettiger op max-w-5xl (kortere regellengte per kaart). */}
      <div className="container mx-auto max-w-5xl px-6">
        {/* Sectiekop */}
        <Reveal className="text-center">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Onze aanpak
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary md:text-5xl">
            Van nulmeting tot gecertificeerd
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
            Ons traject is opgedeeld in heldere fasen, zodat u precies weet wat u kunt
            verwachten.
          </p>
        </Reveal>

        {/* Timeline */}
        <div className="relative mt-16 md:mt-20">
          {/* Basislijn */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-5 top-0 w-px bg-gray-200 md:left-1/2"
          />
          {/* Lijn die zich tekent */}
          <div
            aria-hidden="true"
            className="hv2-timeline-line absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-accent to-secondary md:left-1/2"
            style={{ transform: drawn ? "scaleY(1)" : "scaleY(0)" }}
          />

          <ol className="space-y-12 md:space-y-16">
            {aanpakStappen.map((step, index) => {
              const isLast = index === lastIndex;
              const isLeft = index % 2 === 0;

              return (
                <li key={step.number} className="relative md:grid md:grid-cols-2">
                  {/* Knooppunt op de lijn */}
                  <div
                    aria-hidden="true"
                    className={
                      isLast
                        ? "hv2-pulse-ring absolute left-0 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary bg-secondary text-secondary md:left-1/2 md:-translate-x-1/2"
                        : "absolute left-0 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent bg-white text-xs font-semibold text-primary md:left-1/2 md:-translate-x-1/2"
                    }
                  >
                    {isLast ? (
                      <svg
                        className="h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Kaart: mobiel rechts van de lijn, op md+ afwisselend links/rechts */}
                  <Reveal
                    direction={isLeft ? "right" : "left"}
                    delay={index * 100}
                    className={
                      isLeft
                        ? "pl-14 md:col-start-1 md:pl-0 md:pr-12"
                        : "pl-14 md:col-start-2 md:pl-12"
                    }
                  >
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                      <h3 className="text-base font-semibold tracking-tight text-primary">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {step.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-[#F7F8FA] px-3 py-1 text-xs text-gray-500">
                        <svg
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        <span className="sr-only">Doorlooptijd: </span>
                        {step.duration}
                      </span>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default AanpakV2;
