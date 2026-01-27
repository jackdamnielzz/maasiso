import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getAuthorBySlug } from '@/lib/api';
import ScrollReveal from '@/components/ui/ScrollReveal';
import BlogPostCard from '@/components/features/BlogPostCard';

export const metadata: Metadata = {
  title: 'Over Niels Maas | Senior Consultant MaasISO',
  description: 'MaasISO verbindt complexe normen met de dagelijkse praktijk. Leer meer over Niels Maas, Senior Consultant en oprichter van MaasISO.',
  alternates: {
    canonical: "/over-niels-maas",
  },
};

export default async function OverNielsMaasPage() {
  const author = await getAuthorBySlug('niels-maas');

  const displayCredentials = author?.slug === 'niels-maas'
    ? 'Senior Consultant'
    : author?.credentials || 'Senior Consultant';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author?.name || 'Niels Maas',
    url: 'https://maasiso.nl/over-niels-maas',
    '@id': 'https://maasiso.nl/over-niels-maas#author',
    jobTitle: displayCredentials,
    worksFor: { '@id': 'https://maasiso.nl/#professionalservice' },
    description: author?.bio,
    sameAs: author?.linkedIn ? [author.linkedIn] : undefined,
    image: author?.profileImage?.url,
  };

  const expertise = author?.expertise?.map((item) => {
      // Map known expertise to descriptions if missing
      const descriptions: Record<string, string> = {
          'ISO 9001': 'Kwaliteitsmanagement',
          'ISO 27001': 'Informatiebeveiliging',
          'AVG / GDPR': 'Privacywetgeving',
          'BIO': 'Baseline Informatiebeveiliging Overheid',
          'ISO 14001': 'Milieumanagement',
          'ISO 16175': 'Informatiebeheer'
      };
      return {
          title: item,
          description: descriptions[item] || ''
      };
  }) || [
    { title: 'ISO 9001', description: 'Kwaliteitsmanagement' },
    { title: 'ISO 27001', description: 'Informatiebeveiliging' },
    { title: 'AVG / GDPR', description: 'Privacywetgeving' },
    { title: 'BIO', description: 'Baseline Informatiebeveiliging Overheid' },
  ];

  const getImageUrl = (url: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://peaceful-insight-production.up.railway.app';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const imageUrl = author?.profileImage?.url ? getImageUrl(author.profileImage.url) : undefined;

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Spectacular Hero Section */}
      <section className="relative overflow-hidden bg-[#091E42] pt-32 pb-24 md:pt-48 md:pb-36 text-white border-b border-white/10">
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[#00875A] rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-[#FF8B00] rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="flex-1 text-center lg:text-left">
              <ScrollReveal className="reveal-left">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#00875A]/20 border border-[#00875A]/30 text-[#00875A] font-bold text-sm uppercase tracking-wider mb-6">
                  De Persoon Achter MaasISO
                </span>
                <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
                  Niels <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00875A] to-[#FF8B00]">Maas</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
                  {author?.bio ? author.bio.split('.')[0] + '.' : 'Expert in ISO-normen, privacy en informatiebeveiliging.'}
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  {author?.linkedIn && (
                    <a
                      href={author.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-6 py-3 rounded-full bg-[#0A66C2] text-white font-bold hover:bg-[#004182] transition-all shadow-lg transform hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </a>
                  )}
                  <Link
                    href="/contact"
                    className="flex items-center gap-3 px-8 py-3 rounded-full bg-[#FF8B00] text-white font-bold hover:bg-[#E67E00] transition-all shadow-lg transform hover:-translate-y-1"
                  >
                    Contact
                  </Link>
                </div>
              </ScrollReveal>
            </div>
            
            <ScrollReveal className="reveal-right" delay={300}>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#00875A] to-[#FF8B00] rounded-[3rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-[3rem] overflow-hidden shadow-2xl ring-8 ring-white/10 bg-[#091E42]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`Niels Maas - ${displayCredentials}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                      sizes="(max-width: 768px) 288px, 384px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* About & Expertise Section */}
      <section className="py-24 bg-white relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <ScrollReveal className="reveal-up">
              <h2 className="text-4xl font-bold text-[#091E42] mb-8 leading-tight">
                Mijn Rol & <span className="text-[#00875A]">Expertise</span>
              </h2>
              <div className="prose prose-lg text-gray-600 max-w-none mb-10">
                <p className="text-xl leading-relaxed mb-6 font-medium text-[#091E42]/80">
                  {displayCredentials} bij MaasISO. Met jarenlange ervaring in diverse sectoren vertaalt Niels complexe normenkaders naar praktische, werkbare oplossingen die echt waarde toevoegen aan een organisatie.
                </p>
                <p className="leading-relaxed">
                  {author?.bio || 'Niels gelooft dat een goed managementsysteem de basis is voor elke succesvolle en veilige organisatie. Of het nu gaat om kwaliteitsborging (ISO 9001), informatiebeveiliging (ISO 27001) of privacy-naleving (AVG), de insteek is altijd hetzelfde: pragmatisch, duidelijk en resultaatgericht.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                {expertise.map((item, i) => (
                  <div key={`${item.title}-${i}`} className="relative group flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-2 h-2 rounded-full bg-[#00875A] group-hover:scale-150 transition-transform duration-300"></div>
                       <h4 className="font-bold text-[#091E42] text-lg group-hover:text-[#00875A] transition-colors duration-300">
                         {item.title}
                       </h4>
                    </div>
                    {item.description && (
                      <p className="pl-5 text-sm text-gray-600 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    )}
                    <div className="absolute -left-4 top-0 bottom-0 w-px bg-gray-100 group-hover:bg-[#00875A]/20 transition-colors"></div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal className="reveal-up" delay={200}>
              <div className="sticky top-32">
                <div className="bg-[#091E42] rounded-[2rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8B00] opacity-10 rounded-bl-[100px] transition-all duration-500 group-hover:scale-150"></div>
                  
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-[#FF8B00] flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </span>
                    Mijn Kernwaarden
                  </h3>
                  
                  <div className="space-y-8">
                    {[
                      { title: "Pragmatisch", text: "Geen dikke handboeken die in de kast blijven staan, maar systemen die werken." },
                      { title: "Helder", text: "Duidelijke taal en eerlijk advies. U weet altijd precies waar u aan toe bent." },
                      { title: "Klantgericht", text: "Uw organisatie staat centraal. De norm is het middel, niet het doel." }
                    ].map((val) => (
                      <div key={val.title} className="relative pl-6 border-l-2 border-[#FF8B00]/30">
                        <h4 className="font-bold text-lg mb-2 text-[#FF8B00]">{val.title}</h4>
                        <p className="text-white/70 leading-relaxed">{val.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Publications Section */}
      {author?.blog_posts && author.blog_posts.length > 0 && (
        <section className="py-24 bg-[#F4F7F9]">
          <div className="container-custom">
            <ScrollReveal className="reveal-up text-center mb-16">
              <span className="text-[#FF8B00] font-bold tracking-widest uppercase text-sm mb-4 block">Kennisdeling</span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#091E42] mb-6">Recente Publicaties</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ontdek de nieuwste inzichten en praktische gidsen geschreven door Niels.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {author.blog_posts.slice(0, 6).map((post, idx) => (
                <ScrollReveal key={post.id} className="reveal-up" delay={idx * 100}>
                  <BlogPostCard post={post} />
                </ScrollReveal>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-[#091E42] text-[#091E42] font-bold hover:bg-[#091E42] hover:text-white transition-all transform hover:-translate-y-1"
              >
                Bekijk alle blogs
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="relative py-24 md:py-32 bg-[#091E42] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00875A] opacity-10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#FF8B00] opacity-10 rounded-full blur-[100px] -ml-24 -mb-24"></div>
        </div>
        
        <div className="container-custom relative z-10 text-center text-white">
          <ScrollReveal className="reveal-up max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Wilt u kennismaken?</h2>
            <p className="text-xl md:text-2xl text-white/70 mb-12 leading-relaxed">
              Heeft u vragen over ISO-certificering, informatiebeveiliging of privacy? Niels denkt graag met u mee over een passende oplossing die écht werkt voor uw organisatie.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link 
                href="/contact"
                className="px-10 py-5 rounded-full bg-[#FF8B00] text-white font-bold text-lg hover:bg-[#E67E00] transition-all shadow-2xl transform hover:-translate-y-1"
              >
                Neem direct contact op
              </Link>
              {author?.email && (
                <a 
                  href={`mailto:${author.email}`}
                  className="px-10 py-5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm transform hover:-translate-y-1"
                >
                  Mail Niels
                </a>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
