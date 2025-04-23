'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  acceptTerms: boolean;
}

// Subject options for the dropdown
const subjectOptions = [
  { value: '', label: 'Selecteer een onderwerp' },
  { value: 'ISO 27001', label: 'ISO 27001 Certificering' },
  { value: 'ISO 9001', label: 'ISO 9001 Certificering' },
  { value: 'ISO 14001', label: 'ISO 14001 Certificering' },
  { value: 'Informatiebeveiliging', label: 'Informatiebeveiliging' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Privacy/AVG', label: 'Privacy/AVG' },
  { value: 'Advies', label: 'Advies' },
  { value: 'Samenwerking', label: 'Samenwerking' },
  { value: 'Anders', label: 'Anders' }
];

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    acceptTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      let data: any = null;
      let rawText: string | null = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        rawText = await response.text();
        // Log the raw response for debugging
        console.error('Non-JSON response from /api/contact:', rawText);
      }

      if (!response.ok) {
        // Prefer JSON error message, fallback to raw text or generic
        const errorMsg =
          (data && data.message) ||
          (rawText ? `Server error: ${rawText}` : 'Er is iets misgegaan bij het versturen van het formulier.');
        throw new Error(errorMsg);
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        acceptTerms: false
      });
      // Log success response for debugging
      console.log('Contact form submission response:', data || rawText);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Er is iets misgegaan bij het versturen van het formulier.');
      // Log error for debugging
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 mb-4">
          Bedankt voor uw bericht! We nemen zo snel mogelijk contact met u op.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#091E42] mb-1">
          Naam *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B00]"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#091E42] mb-1">
          E-mailadres *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B00]"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-[#091E42] mb-1">
          Onderwerp *
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B00] bg-white"
          value={formData.subject}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          {subjectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#091E42] mb-1">
          Bericht *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B00]"
          value={formData.message}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="acceptTerms"
          name="acceptTerms"
          required
          className="mt-1"
          checked={formData.acceptTerms}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <label htmlFor="acceptTerms" className="text-sm text-[#091E42]">
          Ik ga akkoord met de{' '}
          <Link href="/terms-and-conditions" className="text-[#FF8B00] hover:underline">
            algemene voorwaarden
          </Link> *
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full py-2 px-4 rounded-md text-white font-medium transition-colors",
            isSubmitting
              ? "bg-[#FF8B00]/70 cursor-not-allowed"
              : "bg-[#FF8B00] hover:bg-[#FF8B00]/90"
          )}
        >
          {isSubmitting ? 'Bezig met versturen...' : 'Versturen'}
        </button>
      </div>
    </form>
  );
}