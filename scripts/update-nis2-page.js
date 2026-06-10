// Update script: past NIS2 pagina aan met actuele status per 21 april 2026.
// Tweede Kamer heeft de Cbw aangenomen op 15-04-2026. Verwachte inwerkingtreding: 1 juli 2026.
// Run: node scripts/update-nis2-page.js

const STRAPI_URL = process.env.STRAPI_URL || "https://peaceful-insight-production.up.railway.app";
const TOKEN = process.env.STRAPI_TOKEN;
if (!TOKEN) {
  console.error("Set STRAPI_TOKEN env var. Example: STRAPI_TOKEN=xxx node scripts/update-nis2-page.js");
  process.exit(1);
}
const pageData = {
  slug: "nis2",
  Title: "NIS2-richtlijn & Cyberbeveiligingswet: Wat MKB moet regelen vóór 1 juli 2026",
  seoTitle: "NIS2 & Cyberbeveiligingswet (1 juli 2026): Verplichtingen & Begeleiding voor MKB | MaasISO",
  seoDescription: "De Cyberbeveiligingswet is door de Tweede Kamer aangenomen op 15 april 2026. Verwachte inwerkingtreding: 1 juli 2026. Circa 8.000 organisaties krijgen te maken met zorgplicht, meldplicht en registratieplicht. Wij begeleiden MKB bij NIS2-compliance.",
  seoKeywords: "NIS2, Cyberbeveiligingswet, Cbw, 1 juli 2026, NIS2 MKB, zorgplicht, meldplicht, registratieplicht, NIS2 Artikel 21, NIS2 ISO 27001, essentiële entiteit, belangrijke entiteit, RDI, NCSC",
  primaryKeyword: "Cyberbeveiligingswet",
  schemaType: "Service",
  layout: [
    {
      __component: "page-blocks.hero",
      title: "NIS2 & Cyberbeveiligingswet: Verplichte Digitale Weerbaarheid vanaf 1 juli 2026",
      subtitle: "De Tweede Kamer heeft de Cyberbeveiligingswet (Cbw) op 15 april 2026 aangenomen. De Eerste Kamer behandelt het wetsvoorstel momenteel, met een streefdatum van 1 juli 2026 voor inwerkingtreding. Circa 8.000 Nederlandse organisaties krijgen dan te maken met wettelijke zorgplicht, meldplicht en registratieplicht. Wij begeleiden MKB-organisaties pragmatisch — van scope-bepaling tot volledige compliance, met ISO 27001 als fundament."
    },
    {
      __component: "page-blocks.key-takeaways",
      items: [
        {
          title: "Status Cyberbeveiligingswet",
          value: "Aangenomen door Tweede Kamer op 15 april 2026 — nu bij Eerste Kamer"
        },
        {
          title: "Streefdatum inwerkingtreding",
          value: "1 juli 2026 (bij koninklijk besluit)"
        },
        {
          title: "Aantal organisaties in scope",
          value: "Circa 8.000 direct; tot ~50.000 indirect via ketenverplichtingen"
        },
        {
          title: "Drie wettelijke verplichtingen",
          value: "Zorgplicht · Meldplicht · Registratieplicht"
        },
        {
          title: "Maximale boetes",
          value: "Tot € 10 miljoen of 2% wereldwijde jaaromzet (essentiële entiteiten)"
        }
      ]
    },
    {
      __component: "page-blocks.fact-block",
      label: "EU-richtlijn",
      value: "Directive (EU) 2022/2555 (NIS2)",
      source: "eur-lex.europa.eu"
    },
    {
      __component: "page-blocks.fact-block",
      label: "Aangenomen Tweede Kamer",
      value: "15 april 2026",
      source: "rijksoverheid.nl · wetsvoorstel 36.764"
    },
    {
      __component: "page-blocks.fact-block",
      label: "Verwachte inwerkingtreding",
      value: "1 juli 2026 (bij koninklijk besluit)",
      source: "Kamerstuk 36.764 · NCSC & NCTV"
    },
    {
      __component: "page-blocks.fact-block",
      label: "Vervangt",
      value: "Wet beveiliging netwerk- en informatiesystemen (Wbni)",
      source: "Artikel 1 Cbw"
    },
    {
      __component: "page-blocks.fact-block",
      label: "Toezicht en meldloket",
      value: "NCSC (registratie & meldportaal) · RDI en sectorale toezichthouders",
      source: "ncsc.nl · rdi.nl"
    },
    {
      __component: "page-blocks.fact-block",
      label: "Sectoren in scope",
      value: "18 sectoren essentieel + 11 sectoren belangrijk",
      source: "Bijlage I & II NIS2"
    },
    {
      __component: "page-blocks.fact-block",
      label: "Maximale boete essentiële entiteit",
      value: "€ 10 miljoen of 2% wereldwijde jaaromzet (hoogste geldt)",
      source: "NIS2 Artikel 34 lid 4"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## Actuele status (april 2026)\n\nOp **woensdag 15 april 2026** heeft de Tweede Kamer de wetsvoorstellen voor de **Cyberbeveiligingswet (Cbw)** en de **Wet weerbaarheid kritieke entiteiten (Wwke)** aangenomen. Het wetsvoorstel (36.764) ligt nu bij de Eerste Kamer. De Eerste Kamercommissies voor Digitalisering (DIGI) en Justitie en Veiligheid (J&V) bespreken op **21 april 2026** de procedurele behandeling.\n\nHet kabinet streeft ernaar dat de Cbw, de Wwke en het bijbehorende **Cyberbeveiligingsbesluit** gelijktijdig in werking treden per **1 juli 2026** (tweede kwartaal 2026). De daadwerkelijke inwerkingtreding wordt per koninklijk besluit geregeld en kan — afhankelijk van de Eerste Kamer — nog licht verschuiven.\n\nDe Cbw implementeert de **Europese NIS2-richtlijn (Directive (EU) 2022/2555)** in Nederlandse wetgeving en vervangt de huidige **Wet beveiliging netwerk- en informatiesystemen (Wbni)**. Nederland haalde de oorspronkelijke EU-deadline van 17 oktober 2024 niet — van alle EU-lidstaten rondden alleen België en Kroatië de implementatie op tijd af.\n\n> Het NCSC heeft aangegeven dat haar werkterrein door de Cbw uitbreidt naar **circa 8.000 organisaties**. Voor MKB-leveranciers in de keten — geschat op tot 50.000 bedrijven — geldt dat zij indirect geraakt worden via ketenverplichtingen. Wacht niet af: circa 2,5 maand voor inwerkingtreding is compliance-voorbereiding een strakke maar haalbare opgave, mits tijdig gestart.\n"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## Wat is de NIS2-richtlijn?\n\nDe **NIS2-richtlijn (Directive (EU) 2022/2555)** is de herziening van de eerste Network and Information Security Directive uit 2016. NIS2 is op 16 januari 2023 in werking getreden en verplichtte EU-lidstaten de richtlijn uiterlijk **17 oktober 2024** om te zetten in nationale wetgeving. In Nederland gebeurt die omzetting via de Cyberbeveiligingswet (Cbw).\n\nNIS2 introduceert vier grote verschuivingen ten opzichte van NIS1:\n\n1. **Bredere scope** — 18 sectoren \"essentieel\" (Bijlage I) en 11 sectoren \"belangrijk\" (Bijlage II): van energie en drinkwater tot digitale infrastructuur, post, afvalbeheer, voedselproductie, chemie, onderzoek en digitale diensten.\n2. **Size-cap rule** — automatische verplichting voor middelgrote (50+ medewerkers of > € 10 miljoen omzet) en grote organisaties in scope-sectoren; geen zelfregistratie meer op basis van kritieke status alleen.\n3. **Uniforme basismaatregelen** — 10 minimum-maatregelen uit Artikel 21 die iedere entiteit moet implementeren.\n4. **Bestuurlijke aansprakelijkheid** — bestuurders dragen persoonlijke verantwoordelijkheid voor goedkeuring, toezicht en training inzake cybersecurityrisico's (Artikel 20).\n\nDe Cbw werkt deze Europese verplichtingen uit in drie kernverplichtingen voor Nederlandse organisaties: **zorgplicht, meldplicht en registratieplicht**.\n\n> NIS2 is bewust geschreven als **risicogebaseerd** kader: niet elke maatregel moet identiek worden ingevuld, maar moet proportioneel zijn aan de risico's die de entiteit loopt. Dat maakt ISO 27001 een zeer geschikt referentiekader.\n"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## Valt uw organisatie onder de Cyberbeveiligingswet?\n\nDe wet hanteert twee categorieën:\n\n- **Essentiële entiteiten** — 18 sectoren met hoog kritiek belang (o.a. energie, drinkwater, financiën, gezondheidszorg, digitale infrastructuur, openbaar bestuur). Staan onder **proactief toezicht** en hogere maximum-boetes.\n- **Belangrijke entiteiten** — 11 sectoren met hoog belang (o.a. post- en koerierdiensten, afvalbeheer, voedselproductie, ICT-dienstverleners, onderzoek, chemie). Staan onder **reactief toezicht** met lagere maximum-boetes.\n\nDe **size-cap rule** is doorslaggevend: organisaties in een scope-sector zijn automatisch in scope zodra zij:\n\n- **Grote entiteit**: 250+ medewerkers **of** > € 50 miljoen jaaromzet met > € 43 miljoen balanstotaal\n- **Middelgrote entiteit**: 50-249 medewerkers **of** € 10-50 miljoen jaaromzet\n\nKleinere organisaties vallen in principe buiten scope, maar kunnen alsnog onder de Cbw vallen wanneer zij kritieke diensten leveren of expliciet zijn aangewezen door de nationale autoriteit (bijvoorbeeld domeinnaamregisters en aanbieders van elektronische communicatie, ongeacht omvang).\n\n### Praktische toets voor MKB-organisaties\n\n| Vraag | Actie |\n|-------|-------|\n| Behoort uw organisatie tot een NIS2-sector (Bijlage I of II)? | Check de sectoroverzichten op [nctv.nl/cyberbeveiligingswet](https://www.nctv.nl/onderwerpen/c/cyberbeveiligingswet/welke-organisaties-vallen-onder-de-cyberbeveiligingswet) |\n| 50+ medewerkers of > € 10 miljoen jaaromzet? | In scope — essentieel of belangrijk afhankelijk van sector |\n| Levert u een kritieke dienst aan een NIS2-entiteit? | Mogelijke indirecte scope via ketenverplichtingen (Artikel 21 lid 2 sub d) |\n| Bent u uitgezonderd (bv. micro-onderneming buiten kritieke dienst)? | Documenteer motivatie en review periodiek |\n\nOnze ervaring: veel MKB-directies dénken dat ze niet in scope vallen omdat hun kernactiviteit niet cyber-gerelateerd is. Maar een ICT-dienstverlener met 60 medewerkers, een middelgrote voedselproducent of een regionale afvalverwerker valt in veel gevallen wél onder de Cbw. Een **NIS2 scope-scan** is daarom de eerste stap — en met 1 juli 2026 als streefdatum is wachten geen optie meer.\n"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## De drie kernverplichtingen uit de Cbw\n\nDe Nederlandse Cyberbeveiligingswet vertaalt de NIS2-richtlijn in drie concrete verplichtingen. Alle drie gelden vanaf de inwerkingtreding (streefdatum 1 juli 2026).\n\n### 1. Zorgplicht (Artikel 21)\nOrganisaties moeten passende en evenredige technische, operationele en organisatorische maatregelen nemen om de risico's voor netwerk- en informatiesystemen te beheersen. Concreet: de **10 basismaatregelen** uit NIS2 Artikel 21 lid 2 moeten gedocumenteerd, geïmplementeerd en aantoonbaar effectief zijn.\n\n### 2. Meldplicht (Artikel 23)\nSignificante incidenten moeten volgens een gefaseerd schema gemeld worden bij het CSIRT en de bevoegde toezichthouder. De Tweede Kamer heeft een motie aangenomen voor **één centraal meldportaal** voor nationale en sectorale cyberincidentmeldingen — het NCSC beheert dit loket.\n\n### 3. Registratieplicht (Artikel 27)\nIn-scope entiteiten moeten zich binnen een wettelijke termijn na inwerkingtreding registreren bij de bevoegde autoriteit. Het **NCSC voert het registratieportaal** uit. De concrete termijn wordt vastgelegd in het Cyberbeveiligingsbesluit.\n\n> De combinatie van zorgplicht, meldplicht en registratieplicht betekent dat \"we hebben cybersecurity intern geregeld\" juridisch niet langer volstaat. De Cbw vraagt om **aantoonbare, geregistreerde en gerapporteerde** compliance.\n"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## De 10 basismaatregelen uit NIS2 Artikel 21\n\nArtikel 21 lid 2 schrijft tien minimumverplichtingen voor. Deze maatregelen sluiten sterk aan bij ISO 27001 Annex A — onderstaande mapping laat zien hoe een goed opgezet ISMS vrijwel de volledige Artikel 21-scope dekt.\n\n| NIS2 Artikel 21 - Maatregel | ISO 27001 Annex A controls |\n|---|---|\n| a) Beleid risicoanalyse en informatiebeveiliging | A.5.1 Beleid, A.5.2 Rollen |\n| b) Incidentenbehandeling | A.5.24-A.5.28 Incident management |\n| c) Bedrijfscontinuïteit en crisisbeheer | A.5.29-A.5.30 BCM |\n| d) Beveiliging toeleveringsketen | A.5.19-A.5.23 Leveranciersbeheer |\n| e) Beveiliging bij aankoop en ontwikkeling | A.8.25-A.8.31 Secure development |\n| f) Beoordelen effectiviteit maatregelen | A.5.35-A.5.36 Naleving en audit |\n| g) Cyberhygiëne en opleiding | A.6.3 Bewustwording |\n| h) Beleid cryptografie | A.8.24 Cryptografie |\n| i) Personeelsbeveiliging en toegangsbeleid | A.6.1-A.6.2, A.8.1-A.8.5 |\n| j) Multifactorauthenticatie | A.8.5 Authenticatie |\n\nBelangrijk: de maatregelen moeten **gedocumenteerd, geïmplementeerd en aantoonbaar effectief** zijn. De Cbw (in lijn met NIS2 Artikel 21 lid 1) eist periodieke evaluatie — bestuurders kunnen niet volstaan met \"we hebben beleid\".\n"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## Meldplicht en incidentrapportage\n\nDe Cbw neemt de gefaseerde meldplicht uit NIS2 (Artikel 23) over. Voor **significante incidenten** — die de dienstverlening ernstig verstoren of grote materiële/immateriële schade veroorzaken — gelden strakke termijnen:\n\n| Fase | Termijn | Inhoud |\n|------|---------|--------|\n| Early warning | **Binnen 24 uur** na bekend worden | Eerste melding: vermoedens over oorzaak, grensoverschrijdende impact |\n| Incident notification | **Binnen 72 uur** | Eerste beoordeling, ernst, impact, indicators of compromise |\n| Intermediate report | Op verzoek CSIRT/toezichthouder | Voortgang indien incident nog loopt |\n| Final report | **Uiterlijk 1 maand na notificatie** | Gedetailleerde beschrijving, oorzakenanalyse, getroffen maatregelen |\n\nDe Tweede Kamer heeft bij behandeling van de Cbw een motie aangenomen voor **één centraal meldportaal**, beheerd door het **NCSC**. Daarmee hoeven organisaties niet per sector apart te melden — één melding volstaat. Sectorale toezichthouders (zoals RDI voor digitale infrastructuur) krijgen de gegevens via dit loket aangeleverd.\n\n> In onze praktijk blijkt dat organisaties die **vóór een incident** al een incident response-playbook hebben ingericht — inclusief meldsjablonen, juridische review en een beslissingsmatrix \"wanneer is een incident significant?\" — de 24-uurstermijn comfortabel halen. Zonder voorbereiding wordt die termijn onhaalbaar.\n"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## Bestuurlijke aansprakelijkheid (Artikel 20 NIS2)\n\nEén van de meest onderscheidende elementen van NIS2 is de expliciete **persoonlijke verantwoordelijkheid van bestuurders**. Artikel 20 verplicht bestuurders van entiteiten om:\n\n1. **Goedkeuring te verlenen** aan de cybersecurity-risicomanagementmaatregelen.\n2. **Toezicht te houden** op de implementatie ervan.\n3. **Zelf training te volgen** om cyberrisico's te kunnen beoordelen en te beoordelen wat passende maatregelen zijn.\n4. **Aansprakelijk te kunnen worden gesteld** bij overtredingen.\n\nIn de Nederlandse Cbw is dit doorvertaald: bij nalatigheid kan **persoonlijke aansprakelijkheid van de bestuurder** ontstaan. Nationale toezichthouders krijgen daarnaast de bevoegdheid om bestuurders tijdelijk te schorsen bij structurele niet-naleving (NIS2 Artikel 32 lid 5).\n\nVoor MKB-ondernemers betekent dit dat cybersecurity niet langer gedelegeerd kan worden aan \"de IT-afdeling\" — het vraagt agenda-ruimte in de directievergadering, gedocumenteerde besluitvorming en aantoonbare training. Bestuurders moeten cyberrisico's, maatregelen en incidenten periodiek laten rapporteren aan het toezichthoudende orgaan.\n\nIn 9 van de 10 trajecten die wij begeleiden, is dit bestuurlijk bewustwordingstraject het onderdeel dat het meest wordt onderschat. Begin er vroeg mee — zeker met 1 juli 2026 als streefdatum.\n"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## Wat kost NIS2-compliance?\n\nDe investering hangt af van omvang, sector, huidige volwassenheid en of u al over een ISMS beschikt. Indicatie voor MKB-organisaties (50-250 medewerkers) die starten zonder formeel ISMS:\n\n| Onderdeel | Indicatie |\n|-----------|-----------|\n| NIS2 scope- en gap-analyse | € 3.500 – € 7.500 |\n| Implementatiebegeleiding (6-9 mnd) | € 15.000 – € 35.000 |\n| Incident response-inrichting | € 5.000 – € 10.000 |\n| Bestuurlijke training (Artikel 20) | € 2.500 – € 5.000 |\n| Doorlopende ondersteuning (CISO-as-a-service) | Maatwerk |\n\n**Organisaties die al ISO 27001-gecertificeerd zijn**, zitten op circa 70-80% van de Artikel 21-scope. Hun extra investering blijft doorgaans beperkt tot Cbw-specifieke onderdelen: incident response-proces volgens de wettelijke termijnen, bestuurlijke training en aangescherpte ketenverplichtingen.\n\nDat maakt de kosten-efficiëntste route meestal: **eerst ISO 27001 opzetten, dan de NIS2-deltas invullen.** Zie onze pagina [ISO 27001](/informatiebeveiliging/iso-27001/) voor meer details.\n\n### Boetes bij niet-naleving\n\n| Type entiteit | Maximale boete |\n|--------------|----------------|\n| Essentiële entiteit | € 10 miljoen **of** 2% wereldwijde jaaromzet (hoogste geldt) |\n| Belangrijke entiteit | € 7 miljoen **of** 1,4% wereldwijde jaaromzet (hoogste geldt) |\n\nNaast deze geldboetes kunnen toezichthouders operationele beperkingen opleggen en bestuurders tijdelijk schorsen. De hoogte van individuele boetes wordt in Nederland vastgesteld in het Cyberbeveiligingsbesluit en sectorale ministeriële regelingen.\n"
    },
    {
      __component: "page-blocks.feature-grid",
      features: [
        {
          title: "Stap 1 - Scope-bepaling",
          description: "We stellen vast of uw organisatie onder de Cbw valt en in welke categorie (essentieel of belangrijk). Sector, grootte en ketenafhankelijkheden worden beoordeeld en onderbouwd gedocumenteerd — essentieel voor de registratieplicht per 1 juli 2026.",
          link: ""
        },
        {
          title: "Stap 2 - Gap-analyse Artikel 21",
          description: "Per basismaatregel (a tot j) beoordelen we de huidige stand van zaken ten opzichte van NIS2-vereisten. Resultaat: een prioriteitenplan met tijdsbesteding, kosten en verantwoordelijken. Dit vormt tegelijk de onderbouwing van de wettelijke zorgplicht.",
          link: ""
        },
        {
          title: "Stap 3 - Implementatie maatregelen",
          description: "We begeleiden de inrichting van beleid, procedures, cryptografie, toegangsbeheer, MFA, leveranciersbeoordeling en secure development. ISO 27001 dient als praktisch fundament waar mogelijk — efficient, herbruikbaar en certificeerbaar.",
          link: ""
        },
        {
          title: "Stap 4 - Incident response & meldproces",
          description: "Playbook, meldsjablonen, 24-uurs bereikbaarheid en trainingssimulaties, afgestemd op het centrale NCSC-meldportaal. U bent voorbereid op de wettelijke meldtermijnen (24u / 72u / 1 maand) nog vóór het eerste incident zich voordoet.",
          link: ""
        },
        {
          title: "Stap 5 - Governance & bestuurlijke training",
          description: "Bestuurders worden geschoold in risico-inschatting en goedkeuring van maatregelen (Artikel 20). Besluitvorming wordt gedocumenteerd zodat persoonlijke aansprakelijkheid aantoonbaar is afgedekt.",
          link: ""
        }
      ]
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## Cbw vs ISO 27001 vs BIO\n\nDeze drie kaders lijken op elkaar, maar verschillen in juridische status, doelgroep en certificeerbaarheid.\n\n| Aspect | Cbw (NIS2) | ISO 27001 | BIO |\n|--------|-----------|-----------|-----|\n| Status | **Wettelijk verplicht** vanaf 1 juli 2026 (streefdatum) | Vrijwillig, marktstandaard | Verplicht voor overheid |\n| Doelgroep | ~8.000 organisaties in 18+11 sectoren | Alle organisaties | Overheidsorganisaties |\n| Certificeerbaar | Nee, toezicht via NCSC/RDI/sectorale autoriteit | Ja, via geaccrediteerde CI | Nee, verantwoording via ENSIA |\n| Basiskader | 10 maatregelen Artikel 21 + zorg-, meld- en registratieplicht | Annex A (93 controls, ISO 27002:2022) | BIO2 op ISO 27001:2023 + overheidsmaatregelen |\n| Bestuurlijke aansprakelijkheid | **Expliciet (Artikel 20)** | Impliciet via Annex A.5.2 | Impliciet via bestuurlijke verantwoording |\n| Meldplicht incidenten | **24u / 72u / 1 maand** bij NCSC | Geen (intern proces) | Wel (via NCSC/CSIRT-DSP) |\n| Handhaving | Tot € 10M / 2% omzet | Certificaatintrekking | Ensia-rapportage, auditoordeel |\n\nDe kern: de Cbw is een **verplichting**, ISO 27001 is een **instrument** dat helpt aan die verplichting te voldoen. Voor overheidsorganisaties doet BIO2 hetzelfde binnen de publieke context.\n\nLees ook onze pagina's [ISO 27001](/informatiebeveiliging/iso-27001/) en [BIO](/informatiebeveiliging/bio/) voor verdieping.\n"
    },
    {
      __component: "page-blocks.text-block",
      alignment: "left",
      content: "## Ketenverplichtingen: ook relevant zonder directe scope\n\nMaatregel d) van Artikel 21 verplicht in-scope entiteiten om **beveiliging in de toeleveringsketen** te waarborgen. Dit werkt door naar leveranciers die zelf niet onder de Cbw vallen:\n\n- Aanscherping van leveranciersvoorwaarden en SLA's\n- Verplichte security-assessments van kritieke leveranciers\n- Contractuele auditrechten en incidentmeldplichten\n- Uitsluiting van leveranciers die onvoldoende aantoonbaar beveiligd zijn\n\nHet NCSC schat dat — bovenop de ~8.000 direct in scope vallende organisaties — **tot circa 50.000 MKB-leveranciers** indirect geraakt worden door deze ketenverplichtingen.\n\nVoor MKB-dienstverleners, software-leveranciers en (sub)contractors in de keten betekent dit: ook al valt u niet direct onder de Cbw, uw klanten zullen u vragen om **aantoonbaar compliant** te zijn. Een ISO 27001-certificaat is dan in de praktijk vaak het verschil tussen wél of niet op de leverancierslijst blijven staan.\n"
    },
    {
      __component: "page-blocks.faq-section",
      items: [
        {
          question: "Wanneer treedt de Cyberbeveiligingswet precies in werking?",
          answer: "De Tweede Kamer heeft de Cbw op 15 april 2026 aangenomen. Het wetsvoorstel ligt nu bij de Eerste Kamer; de procedure wordt vanaf 21 april 2026 door de commissies DIGI en J&V behandeld. De beoogde inwerkingtreding is 1 juli 2026, bij koninklijk besluit. Die datum kan nog licht verschuiven als de Eerste Kamer meer tijd nodig heeft — houd nctv.nl/cyberbeveiligingswet aan voor de actuele status."
        },
        {
          question: "Moet ons MKB-bedrijf zich zelf aanmelden bij een autoriteit?",
          answer: "Ja. De Cbw kent een expliciete registratieplicht (Artikel 27 NIS2). Organisaties die onder de size-cap rule in een scope-sector vallen zijn automatisch in scope en moeten zich binnen een wettelijke termijn na inwerkingtreding registreren. Het NCSC beheert het registratieportaal. De exacte termijn wordt vastgelegd in het Cyberbeveiligingsbesluit."
        },
        {
          question: "Is ISO 27001 verplicht onder de Cbw?",
          answer: "Nee. De Cbw schrijft geen specifieke norm voor. Wel is ISO 27001 de meest geschikte routekaart, omdat de Annex A-controls vrijwel de volledige Artikel 21-scope dekken. Een ISO 27001-gecertificeerd ISMS maakt toezicht door het NCSC, RDI of sectorale toezichthouder aanmerkelijk eenvoudiger en biedt aantoonbaar bewijs voor de zorgplicht."
        },
        {
          question: "Wat gebeurt er als we niet tijdig compliant zijn?",
          answer: "De maximale boete voor essentiële entiteiten is € 10 miljoen of 2% van de wereldwijde jaaromzet — de hoogste van beide. Voor belangrijke entiteiten geldt € 7 miljoen of 1,4% jaaromzet. Daarnaast kunnen bestuurders persoonlijk aansprakelijk worden gesteld en kan de toezichthouder operationele beperkingen opleggen. De concrete Nederlandse boete-invulling volgt uit het Cyberbeveiligingsbesluit en sectorale ministeriële regelingen."
        },
        {
          question: "Onze organisatie heeft al ISO 27001 — zijn we dan automatisch Cbw-compliant?",
          answer: "Grotendeels wel, maar niet volledig. ISO 27001 dekt circa 70 tot 80% van de Artikel 21-scope. Cbw-specifieke deltas zijn: de gestandaardiseerde meldtermijnen (24u/72u/1 maand) via het centrale NCSC-meldportaal, de registratieplicht bij het NCSC, bestuurlijke aansprakelijkheid en training (Artikel 20), en aangescherpte ketenverplichtingen. Die onderdelen moeten apart worden ingericht en gedocumenteerd."
        },
        {
          question: "Hoe snel moeten incidenten gemeld worden?",
          answer: "Significante incidenten moeten binnen 24 uur een early warning krijgen, binnen 72 uur een formele melding, en uiterlijk één maand na die melding een eindrapport. Meldingen lopen via het centrale NCSC-meldportaal — de Tweede Kamer heeft een motie aangenomen voor één centraal loket. Tussentijdse rapporten zijn op verzoek van het CSIRT of de toezichthouder. Zonder vooraf ingericht incident response-proces is de 24-uurstermijn in de praktijk niet haalbaar."
        },
        {
          question: "Vallen we onder de Cbw als we alleen kleine overheids- of MKB-klanten hebben?",
          answer: "Mogelijk indirect, via ketenverplichtingen. Uw klanten die zelf onder de Cbw vallen zijn verplicht de beveiliging van hun toeleveringsketen te borgen (maatregel d uit Artikel 21). Dat betekent dat zij u als leverancier zullen toetsen op security-niveau. Het NCSC schat dat tot 50.000 MKB-leveranciers indirect geraakt worden. Een formeel ISMS of ISO 27001-certificering is dan vaak een contractuele voorwaarde."
        },
        {
          question: "Wat is het verschil tussen een essentiële en een belangrijke entiteit?",
          answer: "Essentiële entiteiten zitten in 18 sectoren met zeer hoog kritiek belang (Bijlage I NIS2): energie, drinkwater, financiën, gezondheidszorg, digitale infrastructuur, openbaar bestuur e.a. Belangrijke entiteiten zitten in 11 sectoren met hoog belang (Bijlage II): post, afvalbeheer, voedselproductie, ICT-dienstverleners, onderzoek, chemie e.a. Essentiële entiteiten staan onder proactief toezicht met hogere maximumboetes (€ 10M / 2%); belangrijke entiteiten onder reactief toezicht met lagere maximumboetes (€ 7M / 1,4%)."
        },
        {
          question: "Wat vervangt de Cyberbeveiligingswet?",
          answer: "De Cbw vervangt de huidige Wet beveiliging netwerk- en informatiesystemen (Wbni) uit 2018. De Wbni implementeerde NIS1 en geldt op dit moment nog voor aanbieders van essentiële diensten en digitale dienstverleners. De overgang van Wbni naar Cbw breidt de scope fors uit: van enkele honderden naar circa 8.000 directe entiteiten."
        }
      ]
    },
    {
      __component: "page-blocks.button",
      text: "Plan een NIS2 scope- en gap-analyse",
      link: "/contact",
      style: "primary"
    }
  ]
};

async function main() {
  const url = `${STRAPI_URL}/api/pages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ data: pageData })
  });

  const text = await res.text();
  console.log("HTTP", res.status);
  console.log(text.slice(0, 1500));

  if (!res.ok) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
