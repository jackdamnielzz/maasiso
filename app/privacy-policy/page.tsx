import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import TableOfContents from '@/components/features/TableOfContents';
import MarkdownContent from '@/components/features/MarkdownContent';
import { Metadata } from 'next';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

export const metadata: Metadata = {
  title: 'Privacy Beleid | MaasISO',
  description: 'Hoe wij uw privacy beschermen en omgaan met uw gegevens',
  alternates: {
    canonical: "/privacy-policy",
  },
};

async function getPrivacyPolicyContent() {
  const filePath = path.join(process.cwd(), 'app/privacy-policy/content.md');
  const content = await fs.readFile(filePath, 'utf8');
  return content;
}

export default async function PrivacyPolicyPage() {
  const privacyPolicyContent = await getPrivacyPolicyContent();

  return (
    <main className="min-h-screen bg-gray-50">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Privacybeleid', href: '/privacy-policy' },
        ]}
      />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center mt-6 mb-4 break-words">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight break-words">
            Privacy <span className="text-[#FF8B00]">Beleid</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-800/90 max-w-2xl mx-auto leading-relaxed break-words">
            Hoe wij uw privacy beschermen en omgaan met uw persoonlijke gegevens
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 break-words">
          <TableOfContents content={privacyPolicyContent} />
          <MarkdownContent content={privacyPolicyContent} />
        </div>
      </div>
    </main>
  );
}
