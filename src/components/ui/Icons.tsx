import React from 'react';

interface IconProps {
  className?: string;
  url: string;
  alt?: string;
}

export const Icon: React.FC<IconProps> = ({ className = '', url, alt = '' }) => (
  <div className="flex items-center justify-center">
    <img
      src={url}
      alt={alt}
      className={`w-16 h-16 object-contain ${className}`}
      role="presentation"
    />
  </div>
);

// Feature icon mapping
export const getFeatureIconUrl = (featureKey: string): string | null => {
  const iconMap: { [key: string]: string } = {
    // ISO 27001 Page
    'risicoanalyse': '/icons/shield.svg',
    'isms-implementatie': '/icons/compliance.svg',
    'beveiligingsmaatregelen': '/icons/risk.svg',
    'begeleiding': '/icons/certificate.svg',
    'interne-audits': '/icons/consulting.svg',
    'security-awareness': '/icons/training.svg',
    
    // AVG Page
    'avg-quickscan': '/icons/risk.svg',
    'privacybeleid': '/icons/privacy.svg',
    'verwerkingsregister': '/icons/compliance.svg',
    'dpia-uitvoeren': '/icons/consulting.svg',
    'implementatie-avg': '/icons/compliance.svg',
    'avg-training': '/icons/training.svg',
    
    // ISO 9001 Page
    'kwaliteitsmanagement': '/icons/quality.svg',
    'procesoptimalisatie': '/icons/compliance.svg',
    'documentbeheer': '/icons/privacy.svg',
    'interne-audit': '/icons/consulting.svg',
    'continue-verbetering': '/icons/quality.svg',
    'iso-certificering': '/icons/certificate.svg',
  };

  const key = featureKey.toLowerCase().replace(/\s+/g, '-');
  return iconMap[key] || null;
};

// Helper to create CMS-compatible icon object
export const createIconObject = (featureKey: string) => {
  const iconUrl = getFeatureIconUrl(featureKey);
  if (!iconUrl) return null;

  return {
    url: iconUrl,
    alternativeText: `Icon for ${featureKey}`,
    width: 64,
    height: 64,
    formats: {},
    provider: 'local',
  };
};