import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import TableOfContents from '@/components/features/TableOfContents';
import MarkdownContent from '@/components/features/MarkdownContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden | MaasISO',
  description: 'Onze algemene voorwaarden en bepalingen voor dienstverlening',
};

async function getTermsContent() {
  const filePath = path.join(process.cwd(), 'algemenevoorwaarden.md');
  const content = await fs.readFile(filePath, 'utf8');
  return content;
}

export default async function TermsAndConditionsPage() {
  const termsContent = await getTermsContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center mt-6 mb-4 break-words">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight break-words">
            Algemene <span className="text-[#FF8B00]">Voorwaarden</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-800/90 max-w-2xl mx-auto leading-relaxed break-words">
            Onze voorwaarden en bepalingen voor professionele dienstverlening
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 break-words">
          <TableOfContents content={termsContent} />
          <MarkdownContent content={termsContent} />
        </div>
      </div>
    </div>
  );
}