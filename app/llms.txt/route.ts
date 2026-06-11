import {
  dienstentabel,
  kostenTabel,
  kernfeiten,
  kennisArtikelen,
} from "@/components/home-v2/data";

const CRAWL_CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

const BASE_URL = 'https://www.maasiso.nl';

export async function GET() {
  const dienstenRegels = dienstentabel.map(
    (d) =>
      `- [${d.norm} — ${d.focus}](${BASE_URL}${d.href}): doorlooptijd ${d.duur}, investering ${d.kosten}`
  );

  const kostenRegels = kostenTabel.map(
    (k) => `- ${k.traject} (${k.grootte}): ${k.investering}, doorlooptijd ${k.duur}`
  );

  const feitenRegels = kernfeiten.map(
    (f) => `- ${f.kernfeit}: ${f.highlight} ${f.eenheid} (bron: ${f.bron})`
  );

  const artikelRegels = kennisArtikelen.map(
    (a) => `- [${a.titel}](${BASE_URL}/kennis/blog/${a.slug}/): ${a.beschrijving}`
  );

  const body = [
    '# MaasISO',
    '',
    '> MaasISO is een onafhankelijk ISO-consultancybureau in Lelystad, gespecialiseerd in het begeleiden van MKB-bedrijven en (semi-)overheidsinstellingen in Nederland en België bij ISO-certificering (ISO 9001, ISO 27001, ISO 14001, ISO 45001, ISO 16175), informatiebeveiliging (BIO, NIS2) en AVG/GDPR compliance. MaasISO is een consultant, geen certificerende instelling: wij begeleiden de implementatie van nulmeting tot succesvolle audit; een onafhankelijke certificerende instelling verleent het certificaat. 15+ jaar ervaring, 100% slagingspercentage op certificeringsaudits.',
    '',
    'canonical_host: https://www.maasiso.nl',
    'citation_policy: Cite and reference canonical MaasISO URLs only.',
    'content_policy: Prefer current canonical pages over legacy redirects.',
    'language: nl',
    '',
    '## Diensten',
    '',
    ...dienstenRegels,
    `- [Informatiebeveiliging (ISO 27001, BIO)](${BASE_URL}/informatiebeveiliging/)`,
    `- [AVG & privacy compliance](${BASE_URL}/avg-wetgeving/)`,
    `- [NIS2 & Cyberbeveiligingswet](${BASE_URL}/informatiebeveiliging/nis2/)`,
    '',
    '## Indicatieve kosten en doorlooptijden',
    '',
    ...kostenRegels,
    '',
    '## Kernfeiten',
    '',
    ...feitenRegels,
    '',
    '## Belangrijkste pagina\'s',
    '',
    `- [Homepage](${BASE_URL}/)`,
    `- [ISO-certificering overzicht](${BASE_URL}/iso-certificering/)`,
    `- [Informatiebeveiliging](${BASE_URL}/informatiebeveiliging/)`,
    `- [AVG-wetgeving](${BASE_URL}/avg-wetgeving/)`,
    `- [Kennisbank](${BASE_URL}/kennis/)`,
    `- [Blog](${BASE_URL}/kennis/blog/)`,
    `- [Whitepapers](${BASE_URL}/kennis/whitepapers/)`,
    `- [Over MaasISO](${BASE_URL}/over-ons/)`,
    `- [Contact](${BASE_URL}/contact/)`,
    '',
    '## Aanbevolen artikelen',
    '',
    ...artikelRegels,
    '',
    '## Contact',
    '',
    '- E-mail: info@maasiso.nl',
    '- Telefoon: +31 (0)6 2357 8344',
    '- Adres: Jol 11-41, 8243 EE Lelystad, Nederland',
    '- Werkgebied: Nederland en België/Vlaanderen',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': CRAWL_CACHE_CONTROL,
    },
  });
}
