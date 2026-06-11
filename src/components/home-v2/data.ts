/**
 * Centrale datamodule voor de home-v2 ontwerpvariant.
 * Inhoud is 1-op-1 overgenomen van de huidige homepage (app/page.tsx en
 * src/components/home-minimal/*) — geen verzonnen claims of reviews toevoegen.
 */

export const heroCopy = {
  badge: "Onafhankelijke ISO-consultancy",
  titelRegel1: "ISO-certificering voor MKB-bedrijven,",
  titelAccent: "pragmatisch en transparant.",
  subtitel:
    "MaasISO begeleidt MKB-bedrijven in Nederland en België bij ISO-certificering, informatiebeveiliging en AVG compliance. Als onafhankelijk consultant helpen wij van nulmeting tot succesvolle audit.",
  trustItems: ["100% slagingspercentage", "15+ jaar ervaring", "Onafhankelijk advies"],
} as const;

export const overOnsParagrafen = [
  "MaasISO is een onafhankelijk ISO-consultancybureau gevestigd in Lelystad, gespecialiseerd in het begeleiden van MKB-bedrijven bij certificeringstrajecten, informatiebeveiliging en privacy compliance.",
  "Wij zijn geen certificerende instelling. Een consultant begeleidt de implementatie van het managementsysteem; een certificerende instelling (zoals Kiwa, TÜV, DNV of LRQA) voert de onafhankelijke audit uit en kent het certificaat toe. Door deze scheiding garanderen wij objectief advies zonder belangenverstrengeling.",
  "Onze opdrachtgevers zijn MKB-bedrijven en (semi-)overheidsinstellingen in Nederland en België die certificering niet als doel op zich zien, maar als middel om processen structureel te verbeteren, risico's te beheersen en het vertrouwen van klanten en ketenpartners te vergroten.",
] as const;

export const keyTakeaways = [
  {
    onderwerp: "ISO 9001 certificering",
    waarde: "Gemiddeld 3-6 maanden doorlooptijd, investering vanaf €5.000 voor MKB",
  },
  {
    onderwerp: "ISO 27001 certificering",
    waarde: "93 beheersmaatregelen, 96.709 certificaten wereldwijd in 2024 (+99% groei)",
  },
  {
    onderwerp: "AVG compliance",
    waarde: "Boetes tot €20 miljoen of 4% jaaromzet bij niet-naleving",
  },
  {
    onderwerp: "NIS2/Cyberbeveiligingswet",
    waarde: "ISO 27001 dekt circa 70-80% van de NIS2 Artikel 21-verplichtingen",
  },
  {
    onderwerp: "Slagingspercentage MaasISO",
    waarde: "100% succesgarantie op certificeringsaudits",
  },
] as const;

export interface Kernfeit {
  readonly kernfeit: string;
  readonly highlight: string;
  readonly eenheid: string;
  readonly bron: string;
}

export const kernfeiten: readonly Kernfeit[] = [
  {
    kernfeit: "ISO 9001 certificaten wereldwijd",
    highlight: "1,1+",
    eenheid: "miljoen",
    bron: "ISO Survey 2023",
  },
  {
    kernfeit: "ISO 27001 certificaten wereldwijd",
    highlight: "96.709",
    eenheid: "+99% groei in 2024",
    bron: "ISO Survey 2024 via IAF CertSearch",
  },
  {
    kernfeit: "ISO 27001 in Nederland",
    highlight: "1.568",
    eenheid: "organisaties",
    bron: "ISO Survey 2024",
  },
  {
    kernfeit: "Maximale AVG-boete",
    highlight: "€20M",
    eenheid: "of 4% jaaromzet",
    bron: "Autoriteit Persoonsgegevens, art. 83 GDPR",
  },
  {
    kernfeit: "NIS2 dekking door ISO 27001",
    highlight: "70-80%",
    eenheid: "Art. 21 gedekt",
    bron: "Mapping ISO 27001 Annex A op NIS2 Art. 21",
  },
  {
    kernfeit: "Implementatietijd ISO 9001",
    highlight: "3-6",
    eenheid: "maanden",
    bron: "MaasISO praktijkervaring",
  },
] as const;

export const dienstentabel = [
  { norm: "ISO 9001", focus: "Kwaliteitsmanagement", duur: "3-6 maanden", kosten: "€5.000-€15.000", prijsMin: 5000, prijsMax: 15000, href: "/iso-9001/" },
  { norm: "ISO 27001", focus: "Informatiebeveiliging", duur: "3-9 maanden", kosten: "€18.000-€25.000", prijsMin: 18000, prijsMax: 25000, href: "/iso-27001/" },
  { norm: "ISO 14001", focus: "Milieumanagement", duur: "3-6 maanden", kosten: "€4.000-€10.000", prijsMin: 4000, prijsMax: 10000, href: "/iso-14001/" },
  { norm: "ISO 45001", focus: "Gezond & veilig werken", duur: "3-6 maanden", kosten: "Op aanvraag", prijsMin: null, prijsMax: null, href: "/iso-certificering/" },
  { norm: "ISO 16175", focus: "Digitaal informatiebeheer", duur: "Op aanvraag", kosten: "Op aanvraag", prijsMin: null, prijsMax: null, href: "/iso-certificering/" },
] as const;

export const extraDiensten = [
  {
    titel: "Informatiebeveiliging",
    beschrijving:
      "Implementatie van informatiebeveiligingsmaatregelen op basis van ISO 27001 en de Baseline Informatiebeveiliging Overheid (BIO). Inclusief risicoanalyse, Statement of Applicability en ISMS-inrichting.",
    feit: "96.709 actieve ISO 27001 certificaten wereldwijd in 2024. In Nederland zijn 1.568 organisaties gecertificeerd.",
    href: "/informatiebeveiliging/",
    linkLabel: "Meer over informatiebeveiliging",
  },
  {
    titel: "AVG & privacy compliance",
    beschrijving:
      "Praktische begeleiding bij het naleven van de AVG/GDPR. Van verwerkingsregister en privacybeleid tot DPIA's, verwerkersovereenkomsten en de rol van externe FG.",
    feit: "Boetes tot €20 miljoen of 4% van de wereldwijde jaaromzet (art. 83 AVG).",
    href: "/avg-wetgeving/",
    linkLabel: "Meer over AVG compliance",
  },
  {
    titel: "NIS2 & Cyberbeveiligingswet",
    beschrijving:
      "Met de NIS2-richtlijn wordt aantoonbare informatiebeveiliging voor essentiële en belangrijke entiteiten een wettelijke verplichting. ISO 27001 dekt circa 70-80% van de NIS2 Artikel 21-verplichtingen.",
    feit: "",
    href: "/informatiebeveiliging/nis2/",
    linkLabel: "Meer over NIS2",
  },
] as const;

export const waaromMaasIso = [
  { kenmerk: "Pragmatische aanpak", betekenis: "Geen dikke rapporten die stof verzamelen, maar direct toepasbare oplossingen die werken in de dagelijkse praktijk." },
  { kenmerk: "MKB-focus", betekenis: "Oplossingen afgestemd op de schaal, het budget en de cultuur van MKB-organisaties." },
  { kenmerk: "Consultant, geen certificeerder", betekenis: "Onafhankelijk advies zonder belangenverstrengeling; de certificerende instelling toetst." },
  { kenmerk: "Integrale benadering", betekenis: "Meerdere normen combineren in een traject bespaart tijd, geld en voorkomt dubbel werk." },
  { kenmerk: "Transparante kosten", betekenis: "Vooraf duidelijkheid over investering, doorlooptijd en deliverables." },
  { kenmerk: "100% slagingspercentage", betekenis: "Bewezen track record op certificeringsaudits." },
  { kenmerk: "15+ jaar ervaring", betekenis: "Breed trackrecord in publieke en private sector: ISO 9001, ISO 27001, ISO 14001, BIO en AVG." },
] as const;

export const aanpakStappen = [
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
    description: "U ontvangt uw ISO-certificaat en kunt aantonen dat uw managementsysteem aan de norm voldoet.",
    duration: "Klaar",
  },
] as const;

export const kostenTabel = [
  { traject: "ISO 9001", grootte: "1-10 FTE", investering: "€5.000-€8.000", duur: "3-4 maanden" },
  { traject: "ISO 9001", grootte: "10-50 FTE", investering: "€8.000-€15.000", duur: "4-6 maanden" },
  { traject: "ISO 27001", grootte: "1-10 FTE", investering: "€10.000-€18.000", duur: "3-6 maanden" },
  { traject: "ISO 27001", grootte: "10-50 FTE", investering: "€18.000-€25.000", duur: "6-9 maanden" },
  { traject: "ISO 14001", grootte: "MKB", investering: "€4.000-€10.000", duur: "3-6 maanden" },
  { traject: "AVG compliance", grootte: "MKB", investering: "€3.000-€10.000", duur: "4-12 weken" },
] as const;

export const kennisArtikelen = [
  {
    titel: "ISO 9001 Checklist: Complete Gids voor Certificering",
    slug: "iso-9001-checklist-complete-gids",
    beschrijving:
      "Alles wat u moet weten over ISO 9001 certificering: van kosten en doorlooptijd tot de voordelen voor uw organisatie.",
  },
  {
    titel: "ISO 27001 Checklist: Alles wat u moet weten [2025]",
    slug: "iso-27001-checklist-augustus-2025",
    beschrijving:
      "Een complete handleiding voor ISO 27001 certificering, inclusief stappenplan en kostenoverzicht.",
  },
  {
    titel: "AVG en Beeldmateriaal: Toestemming en Privacy Regels",
    slug: "avg-beeldmateriaal-toestemming",
    beschrijving:
      "Praktische tips voor AVG compliance in MKB-organisaties. Wat moet u regelen en hoe pakt u dat aan?",
  },
] as const;

export const faqItems = [
  { vraag: "Wat doet een ISO-consultant?", antwoord: "Een ISO-consultant begeleidt organisaties bij het implementeren van een managementsysteem dat voldoet aan een ISO-norm. De consultant helpt bij de nulmeting, documentatie, implementatie en auditvoorbereiding. Een consultant geeft zelf geen certificaat af; dat doet de onafhankelijke certificerende instelling." },
  { vraag: "Wat kost ISO-certificering voor een klein bedrijf?", antwoord: "Voor MKB-bedrijven met 1-10 medewerkers liggen de kosten voor ISO 9001 certificering gemiddeld tussen €5.000 en €8.000. Voor ISO 27001 tussen €10.000 en €18.000. Deze bedragen zijn inclusief consultancy en certificatie-audit." },
  { vraag: "Hoe lang duurt een ISO-certificeringstraject?", antwoord: "De gemiddelde doorlooptijd voor MKB-organisaties ligt tussen 3 en 9 maanden, afhankelijk van de norm, de organisatiegrootte en de mate waarin processen al zijn vastgelegd." },
  { vraag: "Wat is het verschil tussen een consultant en een certificeerder?", antwoord: "Een consultant begeleidt de implementatie van het managementsysteem. Een certificerende instelling (zoals Kiwa, TÜV, DNV of LRQA) voert de onafhankelijke audit uit en verleent het certificaat. MaasISO is een consultant: wij begeleiden, maar certificeren niet zelf." },
  { vraag: "Is ISO-certificering verplicht?", antwoord: "ISO-certificering is in Nederland niet wettelijk verplicht. Wel wordt certificering steeds vaker gevraagd door klanten, ketenpartners en in aanbestedingen. Met de invoering van de NIS2-richtlijn (Cyberbeveiligingswet) wordt aantoonbare informatiebeveiliging voor bepaalde sectoren wel een wettelijke verplichting." },
  { vraag: "Welke ISO-norm past bij mijn organisatie?", antwoord: "Dat hangt af van uw sector, klanten en doelstellingen. ISO 9001 is de meest universele norm (kwaliteitsmanagement). ISO 27001 richt zich op informatiebeveiliging. ISO 14001 op milieumanagement. Gebruik onze gratis ISO Norm Selector voor een persoonlijk advies." },
  { vraag: "Kan ik meerdere ISO-normen combineren?", antwoord: "Ja. ISO-normen zijn gebaseerd op dezelfde Harmonized Structure, waardoor ze goed integreerbaar zijn in een managementsysteem. Dit bespaart dubbel werk, vereenvoudigt audits en verlaagt kosten. MaasISO heeft ruime ervaring met integrale trajecten." },
  { vraag: "Wat is NIS2 en hoe verhoudt het zich tot ISO 27001?", antwoord: "NIS2 (de Cyberbeveiligingswet) stelt beveiligingseisen voor essentiële en belangrijke entiteiten in de EU. ISO 27001 gecertificeerde organisaties hebben circa 70-80% van de NIS2 Artikel 21-maatregelen al aantoonbaar geïmplementeerd. ISO 27001 is daarmee het meest directe pad naar NIS2 compliance." },
  { vraag: "Werkt MaasISO ook buiten Nederland?", antwoord: "MaasISO bedient organisaties in Nederland en België/Vlaanderen." },
  { vraag: "Hoe neem ik contact op?", antwoord: "Neem contact op via info@maasiso.nl of bel +31 (0)6 2357 8344 voor een vrijblijvend kennismakingsgesprek. U kunt ook direct een afspraak inplannen via onze contactpagina." },
] as const;

export const normenExpertise = [
  "ISO 9001",
  "ISO 27001",
  "ISO 14001",
  "ISO 45001",
  "ISO 16175",
  "AVG / GDPR",
  "NIS2",
  "BIO",
] as const;

export const contact = {
  email: "info@maasiso.nl",
  telefoon: "+31 (0)6 2357 8344",
  telefoonHref: "tel:+31623578344",
  contactHref: "/contact/",
  selectorHref: "https://iso-selector.maasiso.nl/",
} as const;
