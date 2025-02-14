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
      href: '/diensten',
    },
    {
      label: 'Kennisbank',
      href: '#',
      children: [
        {
          label: 'Blog',
          href: '/blog',
        },
        {
          label: 'Nieuws',
          href: '/nieuws',
        },
        {
          label: 'Whitepapers',
          href: '/whitepapers',
        },
      ],
    },
    {
      label: 'Onze Voordelen',
      href: '/onze-voordelen',
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
          href: '/diensten',
        },
      ],
    },
    {
      title: 'Onze Diensten',
      links: [
        {
          label: 'ISO 9001 Consultancy',
          href: '/iso-9001',
        },
        {
          label: 'ISO 27001 Consultancy',
          href: '/iso-27001',
        },
        {
          label: 'AVG/GDPR Compliance',
          href: '/avg-compliance',
        },
      ],
    },
  ],
  legalLinks: [
    {
      label: 'Privacyverklaring',
      href: '/privacyverklaring',
    },
    {
      label: 'Algemene Voorwaarden',
      href: '/algemene-voorwaarden',
    },
    {
      label: 'Cookiebeleid',
      href: '/cookiebeleid',
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
