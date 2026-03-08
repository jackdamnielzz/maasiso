'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { TRAReport } from '@/lib/tools/tra-types';
import { generateTRAPdf } from '@/lib/tools/generate-tra-pdf';

const STORAGE_KEY = 'maasiso-tra-calculator';
const EXPIRY_KEY = 'maasiso-tra-download-expiry';
const DOWNLOAD_HOURS = 24;

type PaymentStatus = 'loading' | 'paid' | 'pending' | 'failed' | 'error';

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'Verlopen';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  if (hours > 0) return `${hours}u ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('id');
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [downloaded, setDownloaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const pollCount = useRef(0);

  const startExpiryTimer = useCallback(() => {
    let expiryTime = localStorage.getItem(EXPIRY_KEY);
    if (!expiryTime) {
      const expiry = Date.now() + DOWNLOAD_HOURS * 60 * 60 * 1000;
      localStorage.setItem(EXPIRY_KEY, String(expiry));
      expiryTime = String(expiry);
    }

    const target = Number(expiryTime);
    const remaining = target - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      setTimeLeft(0);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      return;
    }

    setTimeLeft(remaining);

    const interval = setInterval(() => {
      const left = target - Date.now();
      if (left <= 0) {
        setExpired(true);
        setTimeLeft(0);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(EXPIRY_KEY);
        clearInterval(interval);
      } else {
        setTimeLeft(left);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!paymentId) {
      setStatus('error');
      return;
    }

    const checkPayment = async () => {
      try {
        const res = await fetch(`/api/tra-payment-status?id=${paymentId}`);
        const data = await res.json();

        if (data.paid) {
          setStatus('paid');
          startExpiryTimer();
          downloadPdf();
          sendEmail(data.email);
        } else if (data.status === 'failed' || data.status === 'canceled' || data.status === 'expired') {
          setStatus('failed');
        } else {
          setStatus('pending');
          pollCount.current++;
          if (pollCount.current < 10) {
            setTimeout(checkPayment, 3000);
          }
        }
      } catch {
        setStatus('error');
      }
    };

    checkPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const downloadPdf = () => {
    if (expired) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const state = JSON.parse(saved) as { report: TRAReport };
      if (state.report) {
        generateTRAPdf(state.report);
        setDownloaded(true);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  const sendEmail = async (email: string | null) => {
    if (!email || !paymentId) {
      console.warn('sendEmail skipped — missing email or paymentId:', { email, paymentId });
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const projectName = saved ? JSON.parse(saved)?.report?.project?.name : '';
      const res = await fetch('/api/tra-send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, paymentId, projectName }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Email API error:', data);
      } else {
        console.log('Confirmation email sent to:', email);
      }
    } catch (err) {
      console.error('Email sending failed:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#FF8B00]/10 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-[#FF8B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#091E42] mb-2">Betaling wordt gecontroleerd...</h1>
        <p className="text-gray-600">Even geduld terwijl we uw betaling verwerken.</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#091E42] mb-2">Betaling niet gelukt</h1>
        <p className="text-gray-600 mb-6">De betaling is niet voltooid. U bent niet belast.</p>
        <a
          href="/tools/risicoscore-calculator/"
          className="inline-block px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] transition-colors"
        >
          Terug naar de calculator
        </a>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#091E42] mb-2">Er ging iets mis</h1>
        <p className="text-gray-600 mb-6">We konden de betaalstatus niet ophalen. Neem contact op als dit probleem aanhoudt.</p>
        <a
          href="/tools/risicoscore-calculator/"
          className="inline-block px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] transition-colors"
        >
          Terug naar de calculator
        </a>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#091E42] mb-2">Betaling in behandeling</h1>
        <p className="text-gray-600 mb-6">
          Uw betaling wordt nog verwerkt. Dit kan enkele minuten duren.
          U ontvangt een e-mail zodra de betaling is bevestigd.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#091E42] text-white font-semibold rounded-lg hover:bg-[#0a2550] transition-colors"
        >
          Status vernieuwen
        </button>
      </div>
    );
  }

  // status === 'paid'
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-[#00875A]/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-[#00875A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-[#091E42] mb-2">Bedankt voor uw aankoop!</h1>
      <p className="text-gray-600 mb-8">
        Uw TRA-rapport is gedownload. U ontvangt ook een bevestiging per e-mail.
      </p>

      {/* Download button with timer */}
      <div className="mb-8">
        {expired ? (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">Downloadlink verlopen</p>
            <p className="text-sm text-gray-400">
              De download was 24 uur geldig. Neem{' '}
              <a href="/contact?source=tra-expired" className="text-[#FF8B00] hover:underline">contact</a>{' '}
              op als u uw rapport opnieuw nodig heeft.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#FF8B00] text-white font-bold rounded-lg hover:bg-[#e67e00] transition-colors text-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloaded ? 'Opnieuw downloaden' : 'Download PDF-rapport'}
            </button>
            {downloaded && (
              <p className="text-sm text-[#00875A] mt-2 font-medium">PDF is gedownload!</p>
            )}
            {timeLeft !== null && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Download geldig nog {formatTimeLeft(timeLeft)}
              </div>
            )}

            {/* AVG notice */}
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <p className="text-xs text-blue-800">
                  <strong>Belangrijk:</strong> Uw rapport wordt niet door ons opgeslagen. Sla uw PDF veilig op — wij kunnen het rapport na deze download niet opnieuw aanleveren.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="bg-[#091E42] text-white rounded-lg p-6 mb-8">
        <h3 className="font-bold mb-2">Hulp nodig bij uw risicobeoordeling?</h3>
        <p className="text-sm text-gray-300 mb-4">
          Onze adviseurs helpen u bij het opstellen van een audit-proof TRA, RI&amp;E of VCA-implementatie.
        </p>
        <a
          href="/contact?source=tra-bedankt"
          className="inline-block px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] transition-colors"
        >
          Plan een gratis gesprek
        </a>
      </div>

      <a
        href="/tools/risicoscore-calculator/"
        className="text-sm text-gray-500 hover:text-[#091E42] transition-colors"
      >
        Terug naar de calculator
      </a>
    </div>
  );
}
