import CookiePolicyContent from '@/components/cookies/CookiePolicyContent';
import { metadata } from './metadata';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

export { metadata };

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cookiebeleid', href: '/cookie-policy' },
        ]}
      />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <CookiePolicyContent />
      </div>
    </main>
  );
}
