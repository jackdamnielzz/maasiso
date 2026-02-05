import { Metadata } from 'next';
import ContactForm from '@/components/features/ContactForm';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

export const metadata: Metadata = {
  title: 'Contact | MaasISO',
  description: 'Neem contact op met MaasISO voor vragen over ISO-certificering, informatiebeveiliging en compliance.',
  keywords: 'contact, MaasISO, ISO-certificering, informatiebeveiliging, compliance',
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#091E42] mb-6">Contact</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[90%] md:max-w-4xl mx-auto">
            <div>
              <h2 className="text-xl font-semibold text-[#091E42] mb-4">Neem contact met ons op</h2>
              <p className="text-[#091E42]/80 mb-6">
                Heeft u vragen over ISO-certificering, informatiebeveiliging of compliance? 
                Vul het contactformulier in en we nemen zo snel mogelijk contact met u op.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF8B00] mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-[#091E42]">E-mail</h3>
                    <a href="mailto:info@maasiso.nl" className="text-[#FF8B00] hover:underline">info@maasiso.nl</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF8B00] mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-[#091E42]">Telefoon</h3>
                    <a href="tel:+31623578344" className="text-[#FF8B00] hover:underline">+31 (0)6 2357 8344</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-[#091E42] mb-4">Contactformulier</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
