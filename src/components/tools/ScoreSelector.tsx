'use client';

import type { KinneyFactor } from '@/lib/tools/tra-types';

interface ScoreSelectorProps {
  label: string;
  value: KinneyFactor;
  onChange: (value: KinneyFactor) => void;
  options: { value: KinneyFactor; label: string }[];
}

export default function ScoreSelector({ label, value, onChange, options }: ScoreSelectorProps) {
  return (
    <div>
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={`
              w-10 h-10 rounded-md text-sm font-semibold transition-colors
              ${
                value === opt.value
                  ? 'bg-[#FF8B00] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {opt.value}
          </button>
        ))}
      </div>
      <span className="block text-xs text-gray-500 mt-0.5 h-4">
        {options.find((o) => o.value === value)?.label}
      </span>
    </div>
  );
}
