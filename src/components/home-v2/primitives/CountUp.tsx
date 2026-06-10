"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Eindwaarde van de teller */
  end: number;
  /** Aantal decimalen (NL-notatie: komma) */
  decimals?: number;
  /** Tekst vóór het getal, bv. "€" of "70-" */
  prefix?: string;
  /** Tekst direct achter het getal, bv. "%", "M" of "+" */
  suffix?: string;
  /** Duur van de animatie in ms */
  duration?: number;
  className?: string;
  /** Duizendtalscheiding (NL: punt). Zet op "" om uit te schakelen. */
  separator?: string;
}

function formatNumber(value: number, decimals: number, separator: string): string {
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withSep = separator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : intPart;
  return decPart ? `${withSep},${decPart}` : withSep;
}

/**
 * Telt een getal op wanneer het element in beeld komt (ease-out).
 * Respecteert prefers-reduced-motion (toont dan direct de eindwaarde)
 * en rendert de eindwaarde server-side zodat de pagina zonder JS klopt.
 */
export function CountUp({
  end,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1800,
  className = "",
  separator = ".",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => formatNumber(end, decimals, separator));
  const started = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // eindwaarde staat al klaar
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          observer.unobserve(element);

          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(formatNumber(end * eased, decimals, separator));
            if (progress < 1) requestAnimationFrame(tick);
          };
          setDisplay(formatNumber(0, decimals, separator));
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, decimals, duration, separator]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export default CountUp;
