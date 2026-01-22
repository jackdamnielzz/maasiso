'use client';

import React, { useEffect, useRef } from 'react';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
  once?: boolean;
};

/**
 * ScrollReveal component adds reveal animations to elements when they enter the viewport
 * It uses the Intersection Observer API for performance
 */
const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  threshold = 0.1,
  delay = 0,
  once = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    
    if (!element) return;
    
    // Add the base reveal class
    element.classList.add('reveal-on-scroll');
    
    // Add delay if specified
    if (delay > 0) {
      element.style.transitionDelay = `${delay}ms`;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('revealed');
            
            // If once is true, unobserve after revealing
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            // If not once, remove the class when out of view
            element.classList.remove('revealed');
          }
        });
      },
      { threshold }
    );
    
    observer.observe(element);
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, delay, once]);
  
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;