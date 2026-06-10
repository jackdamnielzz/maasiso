'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface WhitepaperDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DownloadFormData) => Promise<boolean>;
  whitepaperTitle: string;
  downloadUrl: string;
}

export interface DownloadFormData {
  name: string;
  email: string;
  company: string;
  subscribeNewsletter: boolean;
  acceptTerms: boolean;
}

export default function WhitepaperDownloadModal({
  isOpen,
  onClose,
  onSubmit,
  whitepaperTitle,
  downloadUrl
}: WhitepaperDownloadModalProps) {
  const [formData, setFormData] = useState<DownloadFormData>({
    name: '',
    email: '',
    company: '',
    subscribeNewsletter: true,
    acceptTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleClose = () => {
    setIsDownloaded(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit form data
      const success = await onSubmit(formData);

      if (success) {
        // Trigger download in a new tab (downloadUrl is al absoluut)
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_blank';
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloaded(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isDownloaded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div role="dialog" aria-modal="true" aria-labelledby="whitepaper-download-success" className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <h2 id="whitepaper-download-success" className="text-2xl font-bold text-[#091E42] mb-3">
            Bedankt voor uw interesse!
          </h2>
          <p role="status" className="text-[#091E42]/70 mb-6">
            De whitepaper wordt gedownload. Lukt de download niet?{' '}
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="text-[#FF8B00] hover:underline">
              Klik dan hier
            </a>.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 bg-[#091E42] text-white rounded-md hover:bg-[#0a2550] transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div role="dialog" aria-modal="true" aria-labelledby="whitepaper-download-title" className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 id="whitepaper-download-title" className="text-2xl font-bold text-[#091E42] mb-4">
          Download {whitepaperTitle}
        </h2>
        <p className="text-[#091E42]/70 mb-6">
          Vul uw gegevens in om de whitepaper te downloaden en op de hoogte te blijven van onze laatste inzichten.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#091E42] mb-1">
              Naam *
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B00]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#091E42] mb-1">
              E-mailadres *
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B00]"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-[#091E42] mb-1">
              Bedrijfsnaam *
            </label>
            <input
              type="text"
              id="company"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B00]"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="newsletter"
              className="h-4 w-4 text-[#FF8B00] focus:ring-[#FF8B00] border-gray-300 rounded"
              checked={formData.subscribeNewsletter}
              onChange={(e) => setFormData({ ...formData, subscribeNewsletter: e.target.checked })}
            />
            <label htmlFor="newsletter" className="ml-2 block text-sm text-[#091E42]">
              Ja, ik wil graag de nieuwsbrief ontvangen met updates over ISO-certificering en informatiebeveiliging
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              required
              className="mt-1 h-4 w-4 text-[#FF8B00] focus:ring-[#FF8B00] border-gray-300 rounded"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            />
            <label htmlFor="acceptTerms" className="text-sm text-[#091E42]">
              Ik ga akkoord met de{' '}
              <Link href="/terms-and-conditions/" className="text-[#FF8B00] hover:underline">
                algemene voorwaarden
              </Link> *
            </label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#091E42] hover:text-[#091E42]/70 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#FF8B00] text-white rounded-md hover:bg-[#FF8B00]/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Bezig met downloaden...' : 'Download whitepaper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}