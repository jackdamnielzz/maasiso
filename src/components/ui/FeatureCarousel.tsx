'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from './CarouselIcons';

interface FeatureCarouselProps {
  children: React.ReactNode[];
  className?: string;
}

const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ children, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const totalSlides = children.length;
  const maxIndex = totalSlides - 1;

  const goToNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex(prevIndex => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrevious = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex(prevIndex => 
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNext();
    }
    
    if (isRightSwipe) {
      goToPrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Convert array of children to array of slides
  const slides = React.Children.toArray(children);

  return (
    <div className={`relative overflow-hidden w-full max-w-[800px] mx-auto ${className}`} style={{ minHeight: '400px' }}>
      {/* Carousel container with fixed height */}
      <div
        ref={carouselRef}
        className="relative w-full mx-auto h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
              currentIndex === index ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 pointer-events-none scale-95'
            }`}
          >
            {/* Content wrapper with fixed height and overflow handling */}
            <div className="relative w-full mx-auto p-4 md:p-8 h-full">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full flex flex-col items-center justify-center h-full">
                  {slide}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-all hover:bg-white hover:shadow-lg focus:outline-none"
            aria-label="Previous"
            disabled={isAnimating}
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-all hover:bg-white hover:shadow-lg focus:outline-none"
            aria-label="Next"
            disabled={isAnimating}
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </>
      )}
      
      {/* Pagination indicators */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentIndex(index);
                setTimeout(() => setIsAnimating(false), 500);
              }
            }}
            className={`h-2 w-2 rounded-full transition-colors ${
              currentIndex === index ? 'bg-[#00875A]' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isAnimating}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureCarousel;