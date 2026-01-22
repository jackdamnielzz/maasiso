import React from 'react';

type BenefitCalloutProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconUrl?: string;
  iconAlt?: string;
  accentColor?: string;
  className?: string;
};

/**
 * BenefitCallout component creates dedicated callout boxes with icons for key benefits
 * It supports custom icons, colors, and hover effects
 */
const BenefitCallout: React.FC<BenefitCalloutProps> = ({
  title,
  description,
  icon,
  iconUrl,
  iconAlt = 'Benefit icon',
  accentColor = '#00875A',
  className = ''
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
      data-testid="benefit-callout"
    >
      <div className="flex flex-col h-full">
        {/* Top accent bar */}
        <div 
          className="h-2 w-full" 
          style={{ backgroundColor: accentColor }}
        ></div>
        
        <div className="p-6 flex flex-col h-full">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${accentColor}10` }}
            >
              {icon ? (
                icon
              ) : iconUrl ? (
                <img 
                  src={iconUrl} 
                  alt={iconAlt} 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <svg 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: accentColor }}
                >
                  <path 
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="text-center">
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: accentColor }}
            >
              {title}
            </h3>
            <p className="text-gray-600">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitCallout;