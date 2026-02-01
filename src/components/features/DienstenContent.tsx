'use client';

import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { getIconForFeature } from '@/lib/utils/iconMapper';
import FeatureCard from '@/components/ui/FeatureCard';
import FeatureCarousel from '@/components/ui/FeatureCarousel';
import ProcessTimeline from '@/components/ui/ProcessTimeline';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { FaqSection } from './FaqSection';
import { KeyTakeaways } from './KeyTakeaways';
import { FactBlock } from './FactBlock';

interface DienstenContentProps {
  pageData: any;
}

export default function DienstenContent({ pageData }: DienstenContentProps) {
  // Helper to parse markdown lists into timeline steps
  const parseTimelineSteps = (content: string) => {
    const lines = content.split('\n');
    const steps: any[] = [];
    let currentStep: any = null;

    lines.forEach((line) => {
      const match = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*(.*)/);
      if (match) {
        if (currentStep) steps.push(currentStep);
        currentStep = {
          id: `step-${steps.length}`,
          number: parseInt(match[1]),
          title: match[2],
          description: match[3] || '',
        };
      } else if (currentStep && line.trim()) {
        currentStep.description += ' ' + line.trim();
      }
    });
    if (currentStep) steps.push(currentStep);
    return steps;
  };

  const parseExpertise = (content: string) => {
    // Split by ### headers to get each expertise section
    const sections = content.split(/###\s+/).filter(s => s.trim().length > 0);
    
    // Skip the first section if it's just the main heading (## Onze Expertisegebieden)
    const expertiseSections = sections.filter(s => !s.trim().startsWith('##') && !s.toLowerCase().includes('onze expertisegebieden'));
    
    return expertiseSections.map((section: string, index: number) => {
      const lines = section.trim().split('\n').filter(l => l.trim());
      
      // First line is the title (e.g., "Kwaliteitsmanagement (ISO 9001)")
      const titleLine = lines[0]?.trim() || 'Expertise';
      
      // Find the link line (contains → and markdown link)
      const linkLines = lines.filter(l => l.includes('→'));
      const mainLinkLine = linkLines[0];
      
      // Extract link text and href from markdown link format [**text** →](url)
      const linkMatch = mainLinkLine?.match(/\[\*\*(.+?)\*\*\s*→\]\((.+?)\)/);
      const linkText = linkMatch ? linkMatch[1].trim() : 'Lees meer';
      const linkHref = linkMatch ? linkMatch[2].trim() : '#';
      
      // Description is everything between title and link, excluding link lines
      const descLines = lines.slice(1).filter(l => !l.includes('→') && l.trim());
      const description = descLines.join(' ').replace(/\*\*/g, '').trim();

      // SVG Icon Mapping
      const lowTitle = titleLine.toLowerCase();
      let iconSvg = null;

      if (lowTitle.includes('kwaliteit') || lowTitle.includes('9001')) {
        // Quality / ISO 9001: Checkmark inside a shield/award
        iconSvg = (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M9 5l.776.388a2 2 0 001.557 0L12 5V3m0 2V3m0 0h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
          </svg>
        );
      } else if (lowTitle.includes('beveiliging') || lowTitle.includes('27001')) {
        // Security / ISO 27001: Lock with digital shield
        iconSvg = (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      } else if (lowTitle.includes('privacy') || lowTitle.includes('avg') || lowTitle.includes('gdpr')) {
        // Privacy / AVG: Fingerprint / Identity Shield
        iconSvg = (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      } else if (lowTitle.includes('milieu') || lowTitle.includes('14001')) {
        // Environment / ISO 14001: Leaf / Sustainability
        iconSvg = (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      } else if (lowTitle.includes('informatiebeheer') || lowTitle.includes('16175')) {
        // Information Management / ISO 16175: Organized folders/files
        iconSvg = (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      } else {
        // Fallback
        iconSvg = (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      }

      return {
        id: index,
        title: titleLine,
        description,
        linkText,
        linkHref,
        iconSvg
      };
    });
  };

  let textBlockCount = 0;

  return (
    <main className="flex-1 bg-white">
      {pageData?.layout?.map((block: any) => {
        switch (block.__component) {
          case 'page-blocks.hero':
            return (
              <section key={block.id} className="hero-section relative overflow-hidden py-24 md:py-32 bg-[#091E42]">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-5 -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-5 -ml-20 -mb-20"></div>
                </div>

                <div className="container-custom relative z-10 w-full">
                  <div className="text-center max-w-4xl mx-auto">
                    <ScrollReveal className="reveal-up">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-tight">
                        {block.title}
                      </h1>
                    </ScrollReveal>
                    <ScrollReveal className="reveal-up" delay={100}>
                      {block.subtitle && (
                        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                          {block.subtitle}
                        </p>
                      )}
                    </ScrollReveal>
                    <ScrollReveal className="reveal-up" delay={200}>
                      {block.ctaButton && (
                        <a
                          href={block.ctaButton.link}
                          className="primary-button inline-flex items-center"
                        >
                          {block.ctaButton.text}
                        </a>
                      )}
                    </ScrollReveal>
                  </div>
                </div>
              </section>
            );

          case 'page-blocks.text-block':
            // Check both title and content for section detection (title may be undefined)
            const contentLower = (block.content || '').toLowerCase();
            const titleLower = (block.title || '').toLowerCase();
            const isExpertise = titleLower.includes('expertisegebieden') || contentLower.includes('## onze expertisegebieden');
            const isTimeline = titleLower.includes('manier van werken') || titleLower.includes('aanpak') || contentLower.includes('## onze manier van werken');
            const currentIdx = textBlockCount++;
            const isAlternate = currentIdx % 2 !== 0;

            if (isExpertise) {
              const expertiseItems = parseExpertise(block.content);
              
              // Extract section title from content if block.title is undefined
              const sectionTitleMatch = block.content?.match(/##\s+(.+?)(?:\n|$)/);
              const sectionTitle = block.title || (sectionTitleMatch ? sectionTitleMatch[1].trim() : 'Onze Expertisegebieden');
              
              // Professional corporate colors matching huisstijl
              const cardStyles = [
                { bg: 'bg-white', border: 'border-[#00875A]', iconBg: 'bg-[#00875A]/10', iconColor: 'text-[#00875A]', hover: 'hover:border-[#00875A] hover:shadow-[0_20px_40px_rgba(0,135,90,0.1)]' },
                { bg: 'bg-white', border: 'border-[#FF8B00]', iconBg: 'bg-[#FF8B00]/10', iconColor: 'text-[#FF8B00]', hover: 'hover:border-[#FF8B00] hover:shadow-[0_20px_40px_rgba(255,139,0,0.1)]' },
                { bg: 'bg-white', border: 'border-[#091E42]', iconBg: 'bg-[#091E42]/10', iconColor: 'text-[#091E42]', hover: 'hover:border-[#091E42] hover:shadow-[0_20px_40px_rgba(9,30,66,0.1)]' },
                { bg: 'bg-white', border: 'border-[#00875A]', iconBg: 'bg-[#00875A]/10', iconColor: 'text-[#00875A]', hover: 'hover:border-[#00875A] hover:shadow-[0_20px_40px_rgba(0,135,90,0.1)]' },
                { bg: 'bg-white', border: 'border-[#FF8B00]', iconBg: 'bg-[#FF8B00]/10', iconColor: 'text-[#FF8B00]', hover: 'hover:border-[#FF8B00] hover:shadow-[0_20px_40px_rgba(255,139,0,0.1)]' },
                { bg: 'bg-white', border: 'border-[#091E42]', iconBg: 'bg-[#091E42]/10', iconColor: 'text-[#091E42]', hover: 'hover:border-[#091E42] hover:shadow-[0_20px_40px_rgba(9,30,66,0.1)]' },
              ];

              return (
                <section key={block.id} className="py-20 md:py-32 bg-[#F4F7F9] relative z-20">
                  <div className="container-custom px-4 sm:px-6 lg:px-8">
                    <ScrollReveal className="reveal-up">
                      <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#091E42] mb-6 tracking-tight">
                          {sectionTitle}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mb-8">
                          <div className="w-12 h-1.5 bg-[#00875A] rounded-full"></div>
                          <div className="w-4 h-1.5 bg-[#FF8B00] rounded-full"></div>
                        </div>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                          Maatwerk consultancy voor ondernemers en managers die willen groeien met structuur en zekerheid.
                        </p>
                      </div>
                    </ScrollReveal>

                    {/* Two-row grid layout: 3 items in first row, remaining in second row */}
                    <div className="max-w-7xl mx-auto">
                      {/* First row - 3 items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                        {expertiseItems.slice(0, 3).map((item, idx) => {
                          const style = cardStyles[idx % cardStyles.length];
                          
                          return (
                            <ScrollReveal
                              key={idx}
                              className="reveal-up h-full"
                              delay={idx * 100}
                            >
                              <Link
                                href={item.linkHref === '#' ? '/diensten' : item.linkHref}
                                className={`group relative block h-full ${style.bg} rounded-2xl p-8 border-l-4 ${style.border} shadow-sm transition-all duration-500 ${style.hover} transform hover:-translate-y-2`}
                              >
                                <div className="relative z-10 h-full flex flex-col">
                                  <div className={`w-14 h-14 ${style.iconBg} ${style.iconColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {item.iconSvg}
                                  </div>
                                  
                                  <h3 className="text-xl font-bold text-[#091E42] mb-4 leading-tight group-hover:text-[#00875A] transition-colors duration-300">
                                    {item.title}
                                  </h3>
                                  
                                  <p className="text-gray-600 text-base leading-relaxed mb-6 flex-grow line-clamp-3">
                                    {item.description}
                                  </p>
                                  
                                  <div className="flex items-center text-[#091E42] font-semibold text-sm group-hover:text-[#FF8B00] transition-colors duration-300">
                                    <span>{item.linkText}</span>
                                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                  </div>
                                </div>
                              </Link>
                            </ScrollReveal>
                          );
                        })}
                      </div>
                      
                      {/* Second row - remaining items (centered if less than 3) */}
                      {expertiseItems.length > 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                          {expertiseItems.slice(3).map((item, idx) => {
                            const style = cardStyles[(idx + 3) % cardStyles.length];
                            
                            return (
                              <ScrollReveal
                                key={idx + 3}
                                className="reveal-up h-full"
                                delay={(idx + 3) * 100}
                              >
                                <Link
                                  href={item.linkHref === '#' ? '/diensten' : item.linkHref}
                                  className={`group relative block h-full ${style.bg} rounded-2xl p-8 border-l-4 ${style.border} shadow-sm transition-all duration-500 ${style.hover} transform hover:-translate-y-2`}
                                >
                                  <div className="relative z-10 h-full flex flex-col">
                                    <div className={`w-14 h-14 ${style.iconBg} ${style.iconColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                      {item.iconSvg}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-[#091E42] mb-4 leading-tight group-hover:text-[#00875A] transition-colors duration-300">
                                      {item.title}
                                    </h3>
                                    
                                    <p className="text-gray-600 text-base leading-relaxed mb-6 flex-grow line-clamp-3">
                                      {item.description}
                                    </p>
                                    
                                    <div className="flex items-center text-[#091E42] font-semibold text-sm group-hover:text-[#FF8B00] transition-colors duration-300">
                                      <span>{item.linkText}</span>
                                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                      </svg>
                                    </div>
                                  </div>
                                </Link>
                              </ScrollReveal>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            if (isTimeline) {
              const steps = parseTimelineSteps(block.content);
              return (
                <section key={block.id} className="py-20 md:py-28 bg-white">
                  <div className="container-custom px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                      <ScrollReveal className="reveal-up">
                        <div className="text-center mb-16">
                          <h2 className="text-3xl md:text-4xl font-bold text-[#091E42] mb-4">
                            {block.title}
                          </h2>
                          <div className="w-20 h-1 bg-[#FF8B00] mx-auto rounded-full"></div>
                        </div>
                      </ScrollReveal>
                      <ProcessTimeline steps={steps} />
                    </div>
                  </div>
                </section>
              );
            }

            return (
              <section key={block.id} className={`py-24 md:py-32 ${isAlternate ? 'bg-white' : 'bg-[#F4F7F9]'} relative overflow-hidden`}>
                {/* Background Decoration */}
                {!isAlternate && (
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00875A]/5 -skew-x-12 transform translate-x-1/2 pointer-events-none"></div>
                )}
                
                <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className={`flex flex-col ${isAlternate ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-20 max-w-7xl mx-auto`}>
                    <div className="w-full md:w-[55%]">
                      <ScrollReveal className={isAlternate ? 'reveal-right' : 'reveal-left'}>
                        {block.title && (
                          <div className="mb-10">
                            <span className="text-[#FF8B00] font-bold tracking-widest uppercase text-sm mb-4 block">Expertise & Ondersteuning</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-[#091E42] mb-6 tracking-tight leading-[1.1]">
                              {block.title}
                            </h2>
                            <div className="w-20 h-1.5 bg-[#00875A] rounded-full"></div>
                          </div>
                        )}
                        <div className="text-xl leading-relaxed text-gray-600">
                          <ReactMarkdown
                            className={`prose prose-lg prose-slate prose-headings:text-[#091E42] prose-strong:text-[#00875A] prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-li:mb-4 prose-ul:list-disc prose-ul:pl-6 max-w-none text-${block.alignment || 'left'}`}
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                          >
                            {block.content}
                          </ReactMarkdown>
                        </div>
                      </ScrollReveal>
                    </div>
                    <div className="w-full md:w-[45%] flex justify-center">
                      <ScrollReveal className={isAlternate ? 'reveal-left' : 'reveal-right'} delay={150}>
                        <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_30px_60px_rgba(9,30,66,0.08)] border border-gray-100 relative group transition-all duration-500 hover:shadow-[0_40px_80px_rgba(9,30,66,0.12)]">
                          {/* Floating Accents */}
                          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF8B00]/5 rounded-full blur-3xl group-hover:bg-[#FF8B00]/10 transition-colors duration-700"></div>
                          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00875A]/5 rounded-full blur-3xl group-hover:bg-[#00875A]/10 transition-colors duration-700"></div>
                          <div className="space-y-6">
                            {currentIdx % 3 === 0 ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-[#00875A]/10 rounded-xl flex items-center justify-center text-[#00875A]">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  </div>
                                  <h4 className="text-2xl font-bold text-[#091E42]">Bewezen Succes</h4>
                                </div>
                                <p className="text-gray-600 text-lg leading-relaxed">100% succesgarantie op uw audit met onze pragmatische begeleiding en diepgaande normkennis.</p>
                              </div>
                            ) : currentIdx % 3 === 1 ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-[#FF8B00]/10 rounded-xl flex items-center justify-center text-[#FF8B00]">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                  </div>
                                  <h4 className="text-2xl font-bold text-[#091E42]">Maximale Snelheid</h4>
                                </div>
                                <p className="text-gray-600 text-lg leading-relaxed">Wij optimaliseren en automatiseren waar mogelijk voor een efficiënte implementatie zonder onnodige overhead.</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-[#091E42]/10 rounded-xl flex items-center justify-center text-[#091E42]">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  </div>
                                  <h4 className="text-2xl font-bold text-[#091E42]">Vaste Expert</h4>
                                </div>
                                <p className="text-gray-600 text-lg leading-relaxed">Uw persoonlijke consultant kent uw business van binnen en buiten en is uw vaste aanspreekpunt voor alle vraagstukken.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </ScrollReveal>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'page-blocks.feature-grid':
            return (
              <section key={block.id} className="py-20 md:py-24 bg-[#F8FAFC]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto text-center mb-16">
                    <ScrollReveal className="reveal-up">
                      <h2 className="text-3xl md:text-4xl font-bold text-[#091E42] mb-4">
                        {block.title || 'Onze Expertisegebieden'}
                      </h2>
                      <div className="w-20 h-1 bg-[#00875A] mx-auto rounded-full"></div>
                    </ScrollReveal>
                  </div>

                  <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {block.features.map((feature: any, fIndex: number) => (
                      <ScrollReveal key={fIndex} className="h-full" delay={fIndex * 50}>
                        <FeatureCard
                          title={feature.title}
                          content={feature.description}
                          icon={getIconForFeature(feature.title)}
                          showMoreInfo={true}
                          link={feature.link || '#'}
                          className="h-full"
                        />
                      </ScrollReveal>
                    ))}
                  </div>

                  <div className="lg:hidden">
                    <FeatureCarousel>
                      {block.features.map((feature: any, fIndex: number) => (
                        <FeatureCard
                          key={fIndex}
                          title={feature.title}
                          content={feature.description}
                          icon={getIconForFeature(feature.title)}
                          showMoreInfo={true}
                          link={feature.link || '#'}
                        />
                      ))}
                    </FeatureCarousel>
                  </div>
                </div>
              </section>
            );

          case 'page-blocks.button':
            return (
              <section key={block.id} className="py-16 md:py-24 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <ScrollReveal className="reveal-up">
                    <div className="bg-[#091E42] rounded-2xl p-10 md:p-16 text-center shadow-lg">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        {block.title}
                      </h2>
                      <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                        {block.description}
                      </p>
                      <a
                        href={block.link}
                        className="cta-button"
                      >
                        {block.text}
                      </a>
                    </div>
                  </ScrollReveal>
                </div>
              </section>
            );

          case 'page-blocks.key-takeaways':
            return (
              <section key={block.id} className="py-16 md:py-24 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <KeyTakeaways items={block.items} />
                </div>
              </section>
            );

          case 'page-blocks.fact-block':
            return (
              <section key={block.id} className="py-10 md:py-16 bg-[#F8FAFC]">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <FactBlock data={block} />
                </div>
              </section>
            );

          case 'page-blocks.faq-section':
            return (
              <section key={block.id} className="py-16 md:py-24 bg-white">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                  <FaqSection items={block.items} />
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </main>
  );
}
