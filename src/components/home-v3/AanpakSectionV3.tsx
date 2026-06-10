export function AanpakSectionV3() {
  const steps = [
    {
      number: "01",
      title: "Kennismakingsgesprek",
      description: "We starten met een vrijblijvend gesprek om uw situatie, wensen en doelstellingen te begrijpen.",
      duration: "30-60 minuten",
    },
    {
      number: "02",
      title: "Nulmeting & Gap-analyse",
      description: "We analyseren uw huidige situatie en bepalen wat er nodig is om aan de ISO-norm te voldoen.",
      duration: "1-2 weken",
    },
    {
      number: "03",
      title: "Implementatie",
      description: "Samen met uw team implementeren we de benodigde processen, documenten en maatregelen.",
      duration: "2-6 maanden",
    },
    {
      number: "04",
      title: "Interne audit",
      description: "We voeren een interne audit uit om te controleren of alles correct is geïmplementeerd.",
      duration: "1-2 weken",
    },
    {
      number: "05",
      title: "Certificeringsaudit",
      description: "De onafhankelijke certificerende instelling voert de externe audit uit.",
      duration: "1-3 dagen",
    },
    {
      number: "06",
      title: "Gecertificeerd!",
      description: "U ontvangt uw ISO-certificaat en kunt u aantonen dat uw managementsysteem aan de norm voldoet.",
      duration: "Feest! 🎉",
    },
  ];

  return (
    <article id="aanpak">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#00875A]/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#00875A]">
          Onze aanpak
        </span>
        <h2 className="mt-5 text-4xl font-extrabold text-[#091E42] md:text-5xl">
          Van nulmeting tot gecertificeerd
        </h2>
        <p className="mt-5 mx-auto max-w-2xl text-xl text-gray-600 leading-relaxed">
          Ons traject is opgedeeld in heldere fasen, zodat u precies weet wat u kunt verwachten.
        </p>
      </div>

      {/* Timeline with enhanced styling */}
      <div className="relative">
        {/* Vertical line for desktop */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#0057B8] via-[#00875A] to-[#FF8B00]" />
        
        {/* Steps grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`relative ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'} ${index >= steps.length - 2 ? '' : 'mb-8'}`}
            >
              {/* Timeline dot for desktop */}
              <div className={`hidden lg:flex absolute top-8 ${index % 2 === 0 ? '-right-3' : '-left-3'} w-6 h-6 rounded-full bg-gradient-to-r from-[#0057B8] to-[#00875A] items-center justify-center shadow-lg`}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              
              <div className="group relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                {/* Step number badge */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0057B8] to-[#00875A] text-white font-black text-lg shadow-lg">
                  {step.number}
                </div>
                
                <h3 className="mt-5 text-2xl font-bold text-[#091E42]">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-gray-600">{step.description}</p>
                
                {/* Duration badge */}
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f3f6fb] px-4 py-2">
                  <svg className="h-4 w-4 text-[#0057B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">{step.duration}</span>
                </div>
                
                {/* Connector line for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-[#0057B8] to-[#00875A]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
