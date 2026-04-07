import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Beleid | MaasISO',
  description: 'Lees meer over hoe wij cookies gebruiken om uw ervaring te verbeteren.',
  alternates: {
    canonical: "/cookie-policy",
  },
  openGraph: {
    title: 'Cookie Beleid | MaasISO',
    description: 'Lees meer over hoe wij cookies gebruiken om uw ervaring te verbeteren.',
    images: [
      {
        url: '/images/maasisohome.png',
        width: 1200,
        height: 630,
        alt: 'MaasISO - Cookie Beleid',
      },
    ],
  },
};