interface ServiceInfo {
  title: string;
  description: string;
  link: string;
  iconName?: string;
}

interface ServiceRelations {
  [key: string]: ServiceInfo[];
}

const serviceRelations: ServiceRelations = {
  'iso-9001': [
    {
      title: 'ISO 14001 Certificering',
      description: 'Combineer kwaliteitsmanagement met milieubeheer. ISO 14001 vormt een perfecte aanvulling op uw ISO 9001 certificering.',
      link: '/iso-certificering/iso-14001',
      iconName: 'iso-14001'
    },
    {
      title: 'ISO 27001 Certificering',
      description: 'Versterk uw kwaliteitsmanagementsysteem met robuuste informatiebeveiliging via ISO 27001 certificering.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'iso-27001'
    },
    {
      title: 'ISO 9001 Consultancy',
      description: 'Professionele begeleiding bij het behalen en behouden van uw ISO 9001 certificering.',
      link: '/iso-certificering/iso-9001',
      iconName: 'iso-9001'
    }
  ],
  'iso-14001': [
    {
      title: 'ISO 9001 Certificering',
      description: 'Versterk uw milieumanagementsysteem met een solide kwaliteitsmanagementsysteem via ISO 9001.',
      link: '/iso-certificering/iso-9001',
      iconName: 'iso-9001'
    },
    {
      title: 'ISO 27001 Certificering',
      description: 'Combineer milieubeheer met informatiebeveiliging voor een complete organisatorische aanpak.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'iso-27001'
    },
    {
      title: 'ISO 14001 Consultancy',
      description: 'Professionele begeleiding bij het behalen en behouden van uw ISO 14001 certificering.',
      link: '/iso-certificering/iso-14001',
      iconName: 'iso-14001'
    }
  ],
  'iso-27001': [
    {
      title: 'ISO 9001 Certificering',
      description: 'Versterk uw informatiebeveiligingssysteem met een solide kwaliteitsmanagementsysteem.',
      link: '/iso-certificering/iso-9001',
      iconName: 'iso-9001'
    },
    {
      title: 'AVG Compliance',
      description: 'Combineer informatiebeveiliging met privacy compliance voor optimale gegevensbescherming.',
      link: '/avg-wetgeving/avg',
      iconName: 'avg'
    },
    {
      title: 'ISO 27001 Consultancy',
      description: 'Professionele begeleiding bij het behalen en behouden van uw ISO 27001 certificering.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'iso-27001'
    }
  ],
  'avg': [
    {
      title: 'ISO 27001 Certificering',
      description: 'Versterk uw privacy compliance met een gedegen informatiebeveiligingssysteem via ISO 27001.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'iso-27001'
    },
    {
      title: 'ISO 9001 Certificering',
      description: 'Combineer privacy compliance met een solide kwaliteitsmanagementsysteem.',
      link: '/iso-certificering/iso-9001',
      iconName: 'iso-9001'
    },
    {
      title: 'AVG Consultancy',
      description: 'Professionele begeleiding bij het implementeren en onderhouden van AVG-compliance.',
      link: '/avg-wetgeving/avg',
      iconName: 'avg'
    }
  ],
  'iso-16175': [
    {
      title: 'ISO 9001 Certificering',
      description: 'Versterk uw documentbeheer met een solide kwaliteitsmanagementsysteem.',
      link: '/iso-certificering/iso-9001',
      iconName: 'iso-9001'
    },
    {
      title: 'ISO 27001 Certificering',
      description: 'Combineer documentbeheer met informatiebeveiliging voor optimale gegevensbescherming.',
      link: '/informatiebeveiliging/iso-27001',
      iconName: 'iso-27001'
    },
    {
      title: 'ISO 16175 Consultancy',
      description: 'Professionele begeleiding bij het implementeren van ISO 16175 richtlijnen.',
      link: '/iso-certificering/iso-16175',
      iconName: 'iso-16175'
    }
  ]
};

export const getRelatedServices = (serviceId: string): ServiceInfo[] => {
  return serviceRelations[serviceId] || [];
};

export default serviceRelations;
