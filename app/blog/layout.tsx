import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | MaasISO',
  description: 'Lees onze laatste blog posts over ISO certificering en kwaliteitsmanagement',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 