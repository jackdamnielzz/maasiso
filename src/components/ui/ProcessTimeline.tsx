import React from 'react';

type ProcessStep = {
  id: string;
  number: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconUrl?: string;
};

type ProcessTimelineProps = {
  steps: ProcessStep[];
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

/**
 * ProcessTimeline component creates a timeline-based visualization for process steps
 * It shows numbered steps with connections between them
 */
const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  steps,
  className = '',
  primaryColor = '#00875A',
  secondaryColor = '#FF8B00'
}) => {
  return (
    <div className={`w-full ${className}`} data-testid="process-timeline">
      <div className="relative">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`relative mb-16 ${
              index % 2 === 0 ? 'md:ml-0' : 'md:ml-8'
            }`}
          >
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div 
                className="absolute left-6 top-16 w-1 bg-gradient-to-b hidden md:block" 
                style={{ 
                  height: '100px',
                  backgroundImage: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})` 
                }}
              ></div>
            )}
            
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Step number */}
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
                }}
              >
                {step.number}
              </div>
              
              {/* Step content */}
              <div className="bg-white rounded-lg shadow-md p-6 flex-grow transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  {(step.icon || step.iconUrl) && (
                    <div className="flex-shrink-0">
                      {step.icon ? (
                        step.icon
                      ) : step.iconUrl ? (
                        <img 
                          src={step.iconUrl} 
                          alt={`Step ${step.number} icon`} 
                          className="w-8 h-8 object-contain"
                        />
                      ) : null}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div>
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ color: primaryColor }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessTimeline;