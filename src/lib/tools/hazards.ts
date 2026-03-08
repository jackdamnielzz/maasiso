export interface HazardDefinition {
  id: string;
  name: string;
  suggestedMeasures: string[];
}

export interface HazardCategory {
  id: string;
  name: string;
  icon: string;
  hazards: HazardDefinition[];
}

export const HAZARD_CATEGORIES: HazardCategory[] = [
  {
    id: 'vallen',
    name: 'Vallen',
    icon: '⬇',
    hazards: [
      {
        id: 'val-hoogte',
        name: 'Vallen van hoogte',
        suggestedMeasures: [
          'Collectieve valbeveiliging (leuning/hekwerk)',
          'Steigerwerk met leuning',
          'Veiligheidsharnas met lijnsysteem',
          'Vangnet plaatsen',
        ],
      },
      {
        id: 'uitglijden',
        name: 'Uitglijden',
        suggestedMeasures: [
          'Antislipvloer of -matten',
          'Vloer droog en schoon houden',
          'Veiligheidsschoenen met antislipzool',
        ],
      },
      {
        id: 'struikelen',
        name: 'Struikelen',
        suggestedMeasures: [
          'Werkplek opruimen en vrijhouden',
          'Kabels en slangen markeren of afdekken',
          'Goede verlichting aanbrengen',
        ],
      },
      {
        id: 'vallende-voorwerpen',
        name: 'Vallende voorwerpen',
        suggestedMeasures: [
          'Helm dragen (veiligheidshelm)',
          'Schoprand op steigers plaatsen',
          'Gereedschap borgen met lanyard',
        ],
      },
      {
        id: 'vallen-in-opening',
        name: 'Vallen in gat of opening',
        suggestedMeasures: [
          'Openingen afdekken met stevig materiaal',
          'Hekwerk rondom openingen plaatsen',
          'Markering en waarschuwingsborden',
        ],
      },
    ],
  },
  {
    id: 'elektriciteit',
    name: 'Elektriciteit',
    icon: '⚡',
    hazards: [
      {
        id: 'elektrische-schok',
        name: 'Elektrische schok',
        suggestedMeasures: [
          'Spanning uitschakelen en vergrendelen (LOTO)',
          'Spanningsloos werken',
          'Isolerend gereedschap gebruiken',
        ],
      },
      {
        id: 'kortsluiting',
        name: 'Kortsluiting / vlamboog',
        suggestedMeasures: [
          'Aardlekschakelaar controleren',
          'Vlamboogbestendige kleding dragen',
          'Afstand houden tot schakelinstallaties',
        ],
      },
      {
        id: 'statische-elektriciteit',
        name: 'Statische elektriciteit',
        suggestedMeasures: [
          'Antistatische kleding en schoenen',
          'Aardingsmaatregelen treffen',
          'Luchtvochtigheid op peil houden',
        ],
      },
    ],
  },
  {
    id: 'gevaarlijke-stoffen',
    name: 'Gevaarlijke stoffen',
    icon: '☠',
    hazards: [
      {
        id: 'inademing-dampen',
        name: 'Inademing van dampen/gassen',
        suggestedMeasures: [
          'Adembescherming dragen (gasmasker/filtermasker)',
          'Afzuiging of ventilatie toepassen',
          'Werken in de buitenlucht of goed geventileerde ruimte',
        ],
      },
      {
        id: 'huidcontact-chemicalien',
        name: 'Huidcontact met chemicaliën',
        suggestedMeasures: [
          'Chemisch bestendige handschoenen dragen',
          'Beschermende kleding of schort dragen',
          'Nooddouche en oogdouche beschikbaar stellen',
        ],
      },
      {
        id: 'inademen-stof',
        name: 'Inademen van stof/vezels',
        suggestedMeasures: [
          'Stofmasker (FFP2/FFP3) dragen',
          'Stofafzuiging bij de bron',
          'Nat werken om stofvorming te beperken',
        ],
      },
      {
        id: 'inslikken-stoffen',
        name: 'Inslikken van gevaarlijke stoffen',
        suggestedMeasures: [
          'Niet eten/drinken op de werkplek',
          'Handen wassen na contact',
          'Stoffen correct labelen en opslaan',
        ],
      },
      {
        id: 'oogcontact-stoffen',
        name: 'Oogcontact met bijtende stoffen',
        suggestedMeasures: [
          'Veiligheidsbril of gelaatsscherm dragen',
          'Oogdouche beschikbaar stellen',
          'Spatscherm plaatsen',
        ],
      },
    ],
  },
  {
    id: 'machines',
    name: 'Machines & gereedschap',
    icon: '⚙',
    hazards: [
      {
        id: 'beknelling',
        name: 'Beknelling',
        suggestedMeasures: [
          'Machine afschermen (vaste/beweegbare afscherming)',
          'Noodstop binnen handbereik',
          'Tweehands bediening toepassen',
        ],
      },
      {
        id: 'snijgevaar',
        name: 'Snijgevaar',
        suggestedMeasures: [
          'Snijbestendige handschoenen dragen',
          'Beschermkap op zaag-/snijmachines',
          'Scherp gereedschap gebruiken (minder kracht nodig)',
        ],
      },
      {
        id: 'aanrijding-machine',
        name: 'Aanrijding door machine/voertuig',
        suggestedMeasures: [
          'Looproutes scheiden van rijroutes',
          'Waarschuwingssignalen en zwaailichten',
          'Reflecterende kleding dragen',
        ],
      },
      {
        id: 'rondvliegende-delen',
        name: 'Rondvliegende delen',
        suggestedMeasures: [
          'Veiligheidsbril of gelaatsscherm dragen',
          'Beschermkappen op machines',
          'Afscherming rondom werkplek',
        ],
      },
      {
        id: 'terugslag-gereedschap',
        name: 'Terugslag van gereedschap',
        suggestedMeasures: [
          'Correct gereedschap voor de klus gebruiken',
          'Gereedschap goed onderhouden',
          'Instructie en training voor bediening',
        ],
      },
    ],
  },
  {
    id: 'fysieke-belasting',
    name: 'Fysieke belasting',
    icon: '💪',
    hazards: [
      {
        id: 'tillen-dragen',
        name: 'Tillen en dragen',
        suggestedMeasures: [
          'Tilhulpmiddelen gebruiken (steekwagen, takel)',
          'Maximaal tilgewicht respecteren (23 kg)',
          'Tiltechniek instructie geven',
        ],
      },
      {
        id: 'duwen-trekken',
        name: 'Duwen en trekken',
        suggestedMeasures: [
          'Karren/rolcontainers met goede wielen',
          'Elektrische transportmiddelen inzetten',
          'Vloer vlak en schoon houden',
        ],
      },
      {
        id: 'trillingen',
        name: 'Trillingen (hand-arm of lichaam)',
        suggestedMeasures: [
          'Trillingsgedempt gereedschap gebruiken',
          'Maximale blootstellingsduur beperken',
          'Antitrilhandschoenen dragen',
        ],
      },
      {
        id: 'ongunstige-houding',
        name: 'Werken in ongunstige houding',
        suggestedMeasures: [
          'Werkplek op goede hoogte instellen',
          'Afwisseling in werkhouding plannen',
          'Hulpmiddelen voor werk boven hoofd',
        ],
      },
      {
        id: 'repetitief-werk',
        name: 'Repetitieve handelingen',
        suggestedMeasures: [
          'Taakroulatie toepassen',
          'Regelmatige pauzes inlassen',
          'Ergonomisch gereedschap gebruiken',
        ],
      },
    ],
  },
  {
    id: 'brand-explosie',
    name: 'Brand & explosie',
    icon: '🔥',
    hazards: [
      {
        id: 'brand',
        name: 'Brand',
        suggestedMeasures: [
          'Brandblusser binnen handbereik',
          'Brandwacht aanstellen bij heet werk',
          'Brandbare materialen verwijderen/afdekken',
        ],
      },
      {
        id: 'explosie',
        name: 'Explosie',
        suggestedMeasures: [
          'ATEX-zonering respecteren',
          'Vonkvrij gereedschap gebruiken',
          'Gasdetectie voor aanvang werk',
        ],
      },
      {
        id: 'verstikking-rook',
        name: 'Verstikking door rook/gas',
        suggestedMeasures: [
          'Vluchtmasker beschikbaar stellen',
          'Vluchtwegen vrijhouden en markeren',
          'Gasdetectie met alarm',
        ],
      },
    ],
  },
  {
    id: 'verkeer',
    name: 'Verkeer & transport',
    icon: '🚛',
    hazards: [
      {
        id: 'aanrijding-verkeer',
        name: 'Aanrijding door verkeer',
        suggestedMeasures: [
          'Reflecterende kleding (EN ISO 20471)',
          'Verkeersregelaars inzetten',
          'Afzetting en markering plaatsen',
        ],
      },
      {
        id: 'botsing-voertuig',
        name: 'Botsing met voertuig/heftruck',
        suggestedMeasures: [
          'Snelheidslimiet op terrein',
          'Gescheiden loop- en rijroutes',
          'Achteruitrijsignalering op voertuigen',
        ],
      },
      {
        id: 'vallen-van-voertuig',
        name: 'Vallen van/uit voertuig',
        suggestedMeasures: [
          'Driepunts-contact bij in-/uitstappen',
          'Antislip treden op voertuig',
          'Lading correct zekeren',
        ],
      },
      {
        id: 'kantelen-voertuig',
        name: 'Kantelen van voertuig/kraan',
        suggestedMeasures: [
          'Draagkracht ondergrond controleren',
          'Stempels/stabilisatoren uitklappen',
          'Belastingtabel raadplegen',
        ],
      },
    ],
  },
  {
    id: 'omgeving',
    name: 'Omgeving',
    icon: '🌡',
    hazards: [
      {
        id: 'geluid',
        name: 'Schadelijk geluid',
        suggestedMeasures: [
          'Gehoorbescherming dragen (oordoppen/oorkappen)',
          'Geluidsbron afschermen of dempen',
          'Blootstellingsduur beperken',
        ],
      },
      {
        id: 'extreme-temperatuur',
        name: 'Extreme temperatuur (hitte/koude)',
        suggestedMeasures: [
          'Aangepaste kleding dragen',
          'Regelmatige pauzes met drinken',
          'Werk plannen in koelere uren',
        ],
      },
      {
        id: 'gesloten-ruimte',
        name: 'Werken in besloten ruimte',
        suggestedMeasures: [
          'Werkvergunning besloten ruimte',
          'Continue gasdetectie en ventilatie',
          'Veiligheidswacht buiten de ruimte',
        ],
      },
      {
        id: 'slechte-verlichting',
        name: 'Onvoldoende verlichting',
        suggestedMeasures: [
          'Extra verlichting plaatsen',
          'Hoofdlamp beschikbaar stellen',
          'Reflecterende markering aanbrengen',
        ],
      },
      {
        id: 'weer-omstandigheden',
        name: 'Slechte weersomstandigheden',
        suggestedMeasures: [
          'Werk uitstellen bij onweer/storm',
          'Beschutting of overkapping regelen',
          'Gladheidbestrijding bij vorst',
        ],
      },
      {
        id: 'biologische-agentia',
        name: 'Biologische agentia (schimmels, bacteriën)',
        suggestedMeasures: [
          'Persoonlijke beschermingsmiddelen dragen',
          'Vaccinatie indien beschikbaar',
          'Hygiëneprotocol volgen',
        ],
      },
    ],
  },
];

export function getHazardById(id: string): HazardDefinition | undefined {
  for (const category of HAZARD_CATEGORIES) {
    const hazard = category.hazards.find((h) => h.id === id);
    if (hazard) return hazard;
  }
  return undefined;
}

export function getCategoryByHazardId(id: string): HazardCategory | undefined {
  return HAZARD_CATEGORIES.find((cat) => cat.hazards.some((h) => h.id === id));
}
