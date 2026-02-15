export interface MenuItem {
  label: string;
  href: string;
  children?: MenuItem[];
}

export interface FooterSection {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

export interface NavigationConfig {
  mainMenu: MenuItem[];
  footerSections: FooterSection[];
  legalLinks: {
    label: string;
    href: string;
  }[];
  socialLinks: {
    platform: string;
    href: string;
    icon: string;
  }[];
}

export const navigationConfig: NavigationConfig = {
  mainMenu: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Diensten',
      href: '/iso-certificering',
    },
    {
      label: 'Kennis',
      href: '/kennis',
      children: [
        {
          label: 'Blog',
          href: '/kennis/blog',
        },
        {
          label: 'Whitepapers',
          href: '/kennis/whitepapers',
        },
        {
          label: 'E-learning',
          href: '/kennis/e-learning',
        },
      ],
    },
    {
      label: 'Waarom MaasISO',
      href: '/waarom-maasiso',
    },
    {
      label: 'Over Ons',
      href: '/over-ons',
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ],
  footerSections: [
    {
      title: 'Contact',
      links: [
        {
          label: 'Email: info@maasiso.nl',
          href: 'mailto:info@maasiso.nl',
        },
        {
          label: 'Neem contact op',
          href: '/contact',
        },
      ],
    },
    {
      title: 'Menu Links',
      links: [
        {
          label: 'Home',
          href: '/',
        },
        {
          label: 'Over Ons',
          href: '/over-ons',
        },
        {
          label: 'Diensten',
          href: '/iso-certificering',
        },
      ],
    },
    {
      title: 'Onze Diensten',
      links: [
        {
          label: 'ISO 9001 Consultancy',
          href: '/iso-certificering/iso-9001',
        },
        {
          label: 'ISO 27001 Consultancy',
          href: '/informatiebeveiliging/iso-27001',
        },
        {
          label: 'AVG/GDPR Compliance',
          href: '/avg-wetgeving/avg',
        },
      ],
    },
  ],
  legalLinks: [
    {
      label: 'Privacyverklaring',
      href: '/privacy-policy',
    },
    {
      label: 'Algemene Voorwaarden',
      href: '/terms-and-conditions',
    },
    {
      label: 'Cookiebeleid',
      href: '/cookie-policy',
    },
  ],
  socialLinks: [
    {
      platform: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: 'linkedin',
    },
    {
      platform: 'Twitter',
      href: 'https://twitter.com',
      icon: 'twitter',
    },
  ],
};
