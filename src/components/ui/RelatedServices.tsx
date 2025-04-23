import React from 'react';
import FeatureCard from './FeatureCard';
import { getIconForFeature } from '@/lib/utils/iconMapper';

interface RelatedService {
  title: string;
  description: string;
  link: string;
  iconName?: string;
}

interface RelatedServicesProps {
  services: RelatedService[];
  className?: string;
}

const RelatedServices: React.FC<RelatedServicesProps> = ({
  services,
  className = '',
}) => {
  if (!services.length) return null;

  return (
    <section className={`py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#00875A] rounded-full opacity-5 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-5 -ml-20 -mb-20"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 relative inline-block">
            Gerelateerde Diensten
            <span className="absolute -bottom-3 left-1/2 w-20 h-1 bg-[#00875A] transform -translate-x-1/2"></span>
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mt-6">
            Ontdek onze andere diensten die u kunnen helpen bij het verbeteren van uw organisatie
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-10">
          {services.map((service, index) => {
            const icon = (
              <div className="w-16 h-16">
                <img
                  src={getIconForFeature(service.iconName || service.title)}
                  alt={`${service.title} icon`}
                  className="w-full h-full object-contain"
                />
              </div>
            );

            return (
              <FeatureCard
                key={index}
                title={service.title}
                content={service.description}
                icon={icon}
                showMoreInfo={true}
                link={service.link}
                className="h-[400px]"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedServices;