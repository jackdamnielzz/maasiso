'use client';

import type { RiskLevel } from '@/lib/tools/tra-types';
import { getRiskBgClass, getRiskLabel } from '@/lib/tools/kinney';

interface ScoreBadgeProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export default function ScoreBadge({ score, level, size = 'md' }: ScoreBadgeProps) {
  const bgClass = getRiskBgClass(level);
  const label = getRiskLabel(level);

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${bgClass}`}>
        {score}
      </span>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-lg border ${bgClass}`}>
      <span className="text-lg font-bold">{score}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
