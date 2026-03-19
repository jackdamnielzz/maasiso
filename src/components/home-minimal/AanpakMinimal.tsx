export function AanpakMinimal() {
  const steps = [
    {
      number: "01",
      title: "Kennismakingsgesprek",
      description:
        "We starten met een vrijblijvend gesprek om uw situatie, wensen en doelstellingen te begrijpen.",
      duration: "30-60 minuten",
    },
    {
      number: "02",
      title: "Nulmeting & Gap-analyse",
      description:
        "We analyseren uw huidige situatie en bepalen wat er nodig is om aan de ISO-norm te voldoen.",
      duration: "1-2 weken",
    },
    {
      number: "03",
      title: "Implementatie",
      description:
        "Samen met uw team implementeren we de benodigde processen, documenten en maatregelen.",
      duration: "2-6 maanden",
    },
    {
      number: "04",
      title: "Interne audit",
      description:
        "We voeren een interne audit uit om te controleren of alles correct is geimplementeerd.",
      duration: "1-2 weken",
    },
    {
      number: "05",
      title: "Certificeringsaudit",
      description:
        "De onafhankelijke certificerende instelling voert de externe audit uit.",
      duration: "1-3 dagen",
    },
    {
      number: "06",
      title: "Gecertificeerd!",
      description:
        "U ontvangt uw ISO-certificaat en kunt aantonen dat uw managementsysteem aan de norm voldoet.",
      duration: "Klaar",
    },
  ];

  return (
    <section id="aanpak" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-[#0057B8]">
          Onze aanpak
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Van nulmeting tot gecertificeerd
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-gray-500">
          Ons traject is opgedeeld in heldere fasen, zodat u precies weet wat u
          kunt verwachten.
        </p>

        <div className="mt-14 grid gap-0 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`relative border-t border-gray-100 px-0 py-8 md:border-l md:border-t-0 md:px-8 md:py-0 ${
                index === 0 ? "md:border-l-0 md:pl-0" : ""
              } ${index === 3 ? "lg:border-l-0 lg:pl-0" : ""}`}
            >
              <span className="text-xs font-medium text-gray-300">
                {step.number}
              </span>
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {step.description}
              </p>
              <p className="mt-4 text-xs text-gray-400">{step.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
