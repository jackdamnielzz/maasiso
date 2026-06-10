"use client";

import React, { useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Richting waaruit het element binnenkomt */
  direction?: Direction;
  /** Vertraging in ms (gebruik voor stagger: index * 100) */
  delay?: number;
  /** Duur in ms */
  duration?: number;
  threshold?: number;
  once?: boolean;
  /** Afstand van de translatie in px */
  distance?: number;
  /** Optionele ARIA-rol voor de wrapper-div (bijv. "row" in een role="table") */
  role?: React.AriaRole;
}

const offsets: Record<Direction, string> = {
  up: "translate3d(0, var(--reveal-distance), 0)",
  down: "translate3d(0, calc(var(--reveal-distance) * -1), 0)",
  left: "translate3d(var(--reveal-distance), 0, 0)",
  right: "translate3d(calc(var(--reveal-distance) * -1), 0, 0)",
  none: "translate3d(0, 0, 0)",
};

/**
 * Scroll-reveal wrapper voor home-v2. Zelfvoorzienend (inline styles),
 * respecteert prefers-reduced-motion en is SSR-veilig: zonder JavaScript
 * blijft de content gewoon zichtbaar.
 */
export function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  once = true,
  distance = 28,
  role,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(element);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  // Voor de eerste client-render (en zonder JS) blijft alles zichtbaar;
  // pas na mount verbergen we niet-zichtbare elementen voor de animatie.
  const hidden = mounted && !visible;

  return (
    <div
      ref={ref}
      role={role}
      className={className}
      style={{
        ["--reveal-distance" as string]: `${distance}px`,
        opacity: hidden ? 0 : 1,
        transform: hidden ? offsets[direction] : "translate3d(0, 0, 0)",
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: hidden ? "opacity, transform" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export default Reveal;
