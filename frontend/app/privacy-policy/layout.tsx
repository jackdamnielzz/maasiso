import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Cookie Beleid | MaasISO',
  description: 'Ons privacy- en cookiebeleid: hoe wij omgaan met uw gegevens en cookies op onze website.',
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}