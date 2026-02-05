'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Whitepaper } from '@/lib/types';
import { clientEnv } from '@/lib/config/client-env';
import WhitepaperDownloadModal, { DownloadFormData } from './WhitepaperDownloadModal';

interface WhitepaperCardProps {
  whitepaper: Whitepaper;
}

export default function WhitepaperCard({ whitepaper }: WhitepaperCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clean up markdown from description
  const cleanDescription = whitepaper.description
    .replace(/\\n/g, ' ') // Replace escaped newlines
    .replace(/[#\-]/g, '') // Remove markdown characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Get the full download URL if available
  const downloadUrl = whitepaper.downloadLink
    ? `${clientEnv.apiUrl}${whitepaper.downloadLink}`
    : '';

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (downloadUrl) {
      setIsModalOpen(true);
    }
  };

  const handleFormSubmit = async (formData: DownloadFormData) => {
    try {
      // Show loading state
      const response = await fetch('/api/whitepaper-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          whitepaperTitle: whitepaper.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Er is een fout opgetreden bij het verwerken van uw aanvraag. Probeer het later opnieuw.');
      }

      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'whitepaper_download', {
          whitepaper_title: whitepaper.title,
          whitepaper_version: whitepaper.version,
        });
      }

      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error instanceof Error ? error.message : 'Er is een fout opgetreden. Probeer het later opnieuw.');
      return false;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[#091E42] mb-2">
            {whitepaper.title}
          </h3>
          <p className="text-[#091E42]/70 mb-4 line-clamp-3">
            {cleanDescription}
          </p>
          <div className="flex items-center text-sm text-[#091E42]/60 mb-4">
            <span className="mr-4">Versie: {whitepaper.version}</span>
            {whitepaper.author && (
              <span>Door: {whitepaper.author}</span>
            )}
          </div>
          <div className="mt-4">
            {downloadUrl ? (
              <button
                onClick={handleDownloadClick}
                className="inline-block bg-[#FF8B00] text-white px-6 py-2 rounded-md hover:bg-[#FF8B00]/90 transition-colors duration-200"
              >
                Download Whitepaper
              </button>
            ) : (
              <span className="inline-block text-[#091E42]/60">
                Download binnenkort beschikbaar
              </span>
            )}
            {whitepaper.slug && (
              <div className="mt-3">
                <Link
                  href={`/kennis/whitepapers/${whitepaper.slug}`}
                  className="inline-block text-sm font-medium text-[#0057B8] hover:text-[#003f80] underline"
                >
                  Bekijk details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <WhitepaperDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        whitepaperTitle={whitepaper.title}
        downloadUrl={downloadUrl}
      />
    </>
  );
}
