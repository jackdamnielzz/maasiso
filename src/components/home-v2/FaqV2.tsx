"use client";

import { useState } from "react";
import Link from "next/link";
import { faqItems, contact } from "@/components/home-v2/data";
import { Reveal } from "@/components/home-v2/primitives/Reveal";

/**
 * FAQ-sectie voor home-v2: sticky introkolom links, accordion rechts.
 * Eén item tegelijk open; antwoorden klappen uit via de grid-rows-techniek.
 */
export function FaqV2() {
  // Eerste item staat standaard open, zodat er ook zonder JavaScript
  // (server-rendered) minstens één antwoord leesbaar is.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#F7F8FA] py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Linkerkolom: intro + contact-link */}
          <div className="md:col-span-4 md:sticky md:top-28 self-start">
            <Reveal>
              <div className="flex items-center gap-3">
                <span
                  className="h-2 w-2 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Veelgestelde vragen
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary md:text-5xl">
                Heeft u een vraag?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                Staat uw vraag er niet tussen? Wij denken graag met u mee.
              </p>
              <Link
                href={contact.contactHref}
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Stel uw vraag
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
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
            </Reveal>
          </div>

          {/* Rechterkolom: accordion */}
          <div className="md:col-span-8">
            {faqItems.map((item, i) => {
              const isOpen = openIndex === i;
              const panelId = `faq-v2-panel-${i}`;
              const buttonId = `faq-v2-button-${i}`;

              return (
                <Reveal key={item.vraag} delay={i * 50} distance={16}>
                  <div
                    className={`mb-3 overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${
                      isOpen ? "border-accent/50 shadow-sm" : "border-gray-200"
                    }`}
                  >
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <span className="text-base font-semibold text-primary">
                          {item.vraag}
                        </span>
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                            isOpen
                              ? "border-accent bg-accent text-white"
                              : "border-gray-200 text-gray-500"
                          }`}
                          aria-hidden="true"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className={`transition-transform duration-300 ${
                              isOpen ? "rotate-45" : ""
                            }`}
                          >
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                          </svg>
                        </span>
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                          {item.antwoord}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqV2;
