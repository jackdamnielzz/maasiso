'use client';

import React, { useState } from 'react';
import WhitepaperDownloadModal, { DownloadFormData } from './WhitepaperDownloadModal';

interface WhitepaperDetailDownloadProps {
  whitepaperTitle: string;
  whitepaperVersion?: string;
  downloadUrl: string;
}

// Zelfde lead-gate als op de overzichtspagina: zonder dit formulier was de PDF
// op de detailpagina met één klik te downloaden en lekte de leadfunnel.
export default function WhitepaperDetailDownload({
  whitepaperTitle,
  whitepaperVersion,
  downloadUrl,
}: WhitepaperDetailDownloadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFormSubmit = async (formData: DownloadFormData) => {
    try {
      const response = await fetch('/api/whitepaper-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          whitepaperTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Er is een fout opgetreden bij het verwerken van uw aanvraag. Probeer het later opnieuw.');
      }

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'whitepaper_download', {
          whitepaper_title: whitepaperTitle,
          whitepaper_version: whitepaperVersion,
        });
      }

      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center rounded-lg bg-[#FF8B00] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#FF9B20]"
      >
        Download PDF
      </button>

      <WhitepaperDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        whitepaperTitle={whitepaperTitle}
        downloadUrl={downloadUrl}
      />
    </>
  );
}
