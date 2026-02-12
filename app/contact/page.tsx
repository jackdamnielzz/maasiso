import Link from 'next/link';
import { Metadata } from 'next';
import ContactForm from '@/components/features/ContactForm';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import { COMPANY_DETAILS } from '@/config/company';

export const metadata: Metadata = {
  title: 'Contact | MaasISO',
  description:
    'Neem contact op met MaasISO voor vragen over ISO-certificering, informatiebeveiliging en compliance.',
  keywords: 'contact, MaasISO, ISO-certificering, informatiebeveiliging, compliance',
  alternates: {
    canonical: '/contact',
  },
};

const faqs = [
  {
    vraag: 'Wanneer kan ik een kennismakingsgesprek inplannen?',
    antwoord:
      'Direct. Na uw bericht plannen we meestal binnen één werkdag een kort gesprek in.',
  },
  {
    vraag: 'Wat levert een vrijblijvend gesprek op?',
    antwoord:
      'U krijgt een eerste inschatting van de beste route: welke norm en aanpak het best bij uw situatie past.',
  },
  {
    vraag: 'Komen AVG en ISO in één traject samen?',
    antwoord:
      'Ja, dat is vaak juist efficiënt voor MKB: u krijgt één praktisch pad met maximale samenhang.',
  },
  {
    vraag: 'Werken jullie ook buiten Nederland?',
    antwoord:
      'Ja, met focus op Nederland en België, voor organisaties met activiteiten in deze regio.',
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#f3f6fb] text-[#091E42]">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#091E42] via-[#0f3565] to-[#0d2f65] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#FF8B00]/30 blur-[120px]" />
          <div className="absolute right-[-10rem] top-20 h-72 w-72 rounded-full bg-[#0072cc]/20 blur-[120px]" />
        </div>
        <div className="container-custom px-4 py-12 md:py-16">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
            Conversie & advies
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
            Contact
          </h1>
          <p className="mt-4 max-w-2xl text-white/90 md:text-lg">
            Heeft u vragen over ISO-certificering, informatiebeveiliging of compliance?
            Laat uw vraag achter en we nemen zo snel mogelijk contact met u op.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href={`mailto:${COMPANY_DETAILS.email}`}
              className="rounded-xl border border-white/20 bg-white/10 p-4 transition hover:border-[#FF8B00]/80 hover:bg-white/20"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-white/75">E-mail</p>
              <p className="mt-2 text-lg font-semibold text-white">{COMPANY_DETAILS.email}</p>
            </a>
            <a
              href={`tel:${COMPANY_DETAILS.phoneHref}`}
              className="rounded-xl border border-white/20 bg-white/10 p-4 transition hover:border-[#FF8B00]/80 hover:bg-white/20"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-white/75">Telefonisch</p>
              <p className="mt-2 text-lg font-semibold text-white">{COMPANY_DETAILS.phoneDisplay}</p>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Lelystad,Jol+11-41"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/20 bg-white/10 p-4 transition hover:border-[#FF8B00]/80 hover:bg-white/20"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-white/75">Adres</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {COMPANY_DETAILS.addressLine1}, {COMPANY_DETAILS.postalCode} {COMPANY_DETAILS.city}
              </p>
            </a>
          </div>
        </div>
      </section>

      <section className="container-custom px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <article className="rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-sm md:p-8">
            <p className="mb-2 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7a93]">
              Directe hulp
            </p>
            <h2 className="text-2xl font-bold">Neem contact met ons op</h2>
            <p className="mt-3 leading-relaxed text-[#1f3a63]">
              We werken praktisch en efficiënt. Stuur een korte vraag en we zetten samen met u
              een volgende stap vast: adviesmoment, intake of een snelle check van uw situatie.
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-[#e4ebf5] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#091E42]">Geen druk, wel duidelijkheid</p>
                <p className="mt-1 text-sm text-[#2f4b75]">
                  Eerst helderheid over aanpak en planning, daarna pas een concrete offerte.
                </p>
              </div>
              <div className="rounded-xl border border-[#e4ebf5] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#091E42]">Pragmatisch voor MKB</p>
                <p className="mt-1 text-sm text-[#2f4b75]">
                  Kort, concreet en afgestemd op de praktijk: geen dikke rapporten, wel werkbare stappen.
                </p>
              </div>
            </div>
            <div className="mt-8 border-t border-[#dce5f1] pt-6">
              <h3 className="text-lg font-semibold">Meer starten?</h3>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/iso-selector"
                  className="primary-button text-center sm:min-w-[220px]"
                >
                  Doe de ISO Norm Selector
                </Link>
                <Link
                  href="/over-ons"
                  className="inline-flex items-center justify-center rounded-lg border border-[#dce5f1] px-5 py-3 font-semibold text-[#091E42] transition hover:border-[#FF8B00] hover:text-[#FF8B00]"
                >
                  Wie is MaasISO?
                </Link>
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold">Contactformulier</h2>
            <p className="mt-2 text-sm text-[#2f4b75]">
              Na verzenden krijgt u binnen de kortste keren een reactie.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </article>
        </div>
      </section>

      <section className="container-custom px-4 pb-14">
        <article className="rounded-2xl border border-[#dce5f1] bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-bold">Veelgestelde vragen</h2>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details
                key={item.vraag}
                className="rounded-xl border border-[#dce5f1] bg-white p-5 transition duration-300 hover:border-[#0057B8]/40 open:border-[#0057B8]/50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#091E42]">
                  {item.vraag}
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#b9c8dd] text-base text-[#24416a]">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-[#2f4b75]">{item.antwoord}</p>
              </details>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
