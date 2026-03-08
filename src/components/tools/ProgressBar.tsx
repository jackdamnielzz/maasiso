'use client';

const STEPS = [
  'Projectgegevens',
  'Werkstappen & Gevaren',
  'Resultaten',
  'PDF Rapport',
];

interface ProgressBarProps {
  currentStep: number; // 0-indexed
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <nav aria-label="Voortgang" className="mb-8">
      <ol className="flex items-center w-full">
        {STEPS.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li
              key={label}
              className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0
                    ${isCompleted ? 'bg-[#00875A] text-white' : ''}
                    ${isCurrent ? 'bg-[#FF8B00] text-white' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    mt-1 text-xs text-center hidden sm:block
                    ${isCurrent ? 'font-semibold text-[#091E42]' : 'text-gray-500'}
                  `}
                >
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-[#00875A]' : 'bg-gray-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
