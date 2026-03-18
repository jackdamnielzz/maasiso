/**
 * Hardcoded related services configuration per detail page.
 * Maps Strapi slugs to their related services for cross-linking.
 */

interface RelatedServiceConfig {
  title: string;
  description: string;
  link: string;
  iconName?: string;
}

const RELATED_SERVICES: Record<string, RelatedServiceConfig[]> = {
  'iso-9001': [
    {
      title: 'ISO 14001 – Milieumanagement',
      description:
        'Combineer kwaliteitsmanagement met milieumanagement. Veel MKB-bedrijven certificeren ISO 9001 en ISO 14001 tegelijk voor een geïntegreerd managementsysteem.',
      link: '/iso-certificering/iso-14001',
      iconName: 'milieu',
    },
    {
      title: 'ISO 45001 – Gezond & Veilig Werken',
      description:
        'Vul uw kwaliteitssysteem aan met een arbomanagementsysteem. ISO 45001 sluit naadloos aan op de structuur van ISO 9001.',
      link: '/iso-certificering/iso-45001',
      iconName: 'veiligheid',
    },
    {
      title: 'ISO 27001 – Informatiebeveiliging',
      description:
        'Bescherm de informatie binnen uw kwaliteitsprocessen. ISO 27001 richt zich op vertrouwelijkheid, integriteit en beschikbaarheid van data.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'beveiliging',
    },
  ],
  'iso-27001': [
    {
      title: 'NIS2 – Cyberbeveiligingswet',
      description:
        'ISO 27001 dekt 70-80% van de NIS2 Artikel 21 verplichtingen. Bekijk wat de NIS2-richtlijn betekent voor uw organisatie.',
      link: '/informatiebeveiliging/nis2',
      iconName: 'compliance',
    },
    {
      title: 'BIO – Baseline Informatiebeveiliging Overheid',
      description:
        'Werkt u met de overheid? BIO bouwt voort op ISO 27001 met aanvullende overheidsspecifieke maatregelen.',
      link: '/informatiebeveiliging/bio',
      iconName: 'overheid',
    },
    {
      title: 'AVG – Privacy & GDPR Compliance',
      description:
        'Informatiebeveiliging en privacy gaan hand in hand. AVG-compliance vereist passende technische en organisatorische maatregelen.',
      link: '/avg-wetgeving/avg',
      iconName: 'privacy',
    },
  ],
  nis2: [
    {
      title: 'ISO 27001 – Informatiebeveiliging',
      description:
        'ISO 27001 certificering dekt 70-80% van de NIS2 Artikel 21 maatregelen. De meest effectieve route naar NIS2-compliance.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'beveiliging',
    },
    {
      title: 'BIO – Baseline Informatiebeveiliging Overheid',
      description:
        'Voor overheidsorganisaties die onder zowel NIS2 als BIO vallen. Eén geïntegreerde aanpak voor beide kaders.',
      link: '/informatiebeveiliging/bio',
      iconName: 'overheid',
    },
    {
      title: 'AVG – Privacy & GDPR Compliance',
      description:
        'NIS2 en AVG overlappen op het gebied van incidentmelding en databescherming. Zorg dat beide kaders gedekt zijn.',
      link: '/avg-wetgeving/avg',
      iconName: 'privacy',
    },
  ],
  bio: [
    {
      title: 'ISO 27001 – Informatiebeveiliging',
      description:
        'BIO is gebaseerd op ISO 27001. Een ISO 27001 certificering vormt de basis voor BIO-compliance.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'beveiliging',
    },
    {
      title: 'NIS2 – Cyberbeveiligingswet',
      description:
        'Overheidsorganisaties vallen vaak ook onder NIS2. Bekijk hoe de Cyberbeveiligingswet uw BIO-verplichting aanvult.',
      link: '/informatiebeveiliging/nis2',
      iconName: 'compliance',
    },
    {
      title: 'AVG – Privacy & GDPR Compliance',
      description:
        'Overheidsorganisaties verwerken veel persoonsgegevens. Combineer BIO-informatiebeveiliging met AVG-privacycompliance.',
      link: '/avg-wetgeving/avg',
      iconName: 'privacy',
    },
  ],
  avg: [
    {
      title: 'ISO 27001 – Informatiebeveiliging',
      description:
        'De AVG vereist "passende technische en organisatorische maatregelen". ISO 27001 biedt het raamwerk om dit aantoonbaar in te richten.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'beveiliging',
    },
    {
      title: 'NIS2 – Cyberbeveiligingswet',
      description:
        'NIS2 en AVG overlappen op incidentmelding en beveiligingsmaatregelen. Bereid u voor op beide verplichtingen.',
      link: '/informatiebeveiliging/nis2',
      iconName: 'compliance',
    },
    {
      title: 'BIO – Baseline Informatiebeveiliging Overheid',
      description:
        'Verwerkt uw organisatie persoonsgegevens voor de overheid? BIO en AVG vullen elkaar aan.',
      link: '/informatiebeveiliging/bio',
      iconName: 'overheid',
    },
  ],
  'iso-14001': [
    {
      title: 'ISO 9001 – Kwaliteitsmanagement',
      description:
        'ISO 14001 en ISO 9001 delen dezelfde HLS-structuur. Combineer milieu- en kwaliteitsmanagement in één geïntegreerd systeem.',
      link: '/iso-certificering/iso-9001',
      iconName: 'kwaliteit',
    },
    {
      title: 'ISO 45001 – Gezond & Veilig Werken',
      description:
        'Milieu, kwaliteit én veiligheid in één managementsysteem. ISO 14001 en ISO 45001 zijn een logische combinatie.',
      link: '/iso-certificering/iso-45001',
      iconName: 'veiligheid',
    },
    {
      title: 'ISO 16175 – Digitaal Informatiebeheer',
      description:
        'Documenteer uw milieumanagement digitaal. ISO 16175 helpt bij het structureren van uw informatiehuishouding.',
      link: '/iso-certificering/iso-16175',
      iconName: 'documentatie',
    },
  ],
  'iso-45001': [
    {
      title: 'ISO 9001 – Kwaliteitsmanagement',
      description:
        'Arbomanagement en kwaliteitsmanagement versterken elkaar. Veel organisaties certificeren ISO 45001 en ISO 9001 samen.',
      link: '/iso-certificering/iso-9001',
      iconName: 'kwaliteit',
    },
    {
      title: 'ISO 14001 – Milieumanagement',
      description:
        'Combineer veiligheid met milieumanagement. ISO 45001 en ISO 14001 delen de HLS-structuur en zijn ideaal te integreren.',
      link: '/iso-certificering/iso-14001',
      iconName: 'milieu',
    },
    {
      title: 'ISO 27001 – Informatiebeveiliging',
      description:
        'Beveilig ook de digitale kant van uw organisatie. ISO 27001 beschermt informatie zoals ISO 45001 medewerkers beschermt.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'beveiliging',
    },
  ],
  'iso-16175': [
    {
      title: 'ISO 9001 – Kwaliteitsmanagement',
      description:
        'Goed informatiebeheer ondersteunt uw kwaliteitsprocessen. ISO 16175 en ISO 9001 vullen elkaar perfect aan.',
      link: '/iso-certificering/iso-9001',
      iconName: 'kwaliteit',
    },
    {
      title: 'ISO 27001 – Informatiebeveiliging',
      description:
        'Bescherm de informatie die u beheert. ISO 27001 zorgt voor vertrouwelijkheid en integriteit van uw documentatie.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'beveiliging',
    },
    {
      title: 'BIO – Baseline Informatiebeveiliging Overheid',
      description:
        'Overheidsorganisaties die ISO 16175 toepassen moeten ook aan BIO voldoen. Combineer informatiebeheer met informatiebeveiliging.',
      link: '/informatiebeveiliging/bio',
      iconName: 'overheid',
    },
  ],
};

export function getRelatedServices(strapiSlug: string): RelatedServiceConfig[] {
  return RELATED_SERVICES[strapiSlug] ?? [];
}
