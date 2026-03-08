'use client';

import type { HazardAssessment } from '@/lib/tools/tra-types';
import { getRiskLevel, getRiskColor } from '@/lib/tools/kinney';

interface RiskMatrixProps {
  hazards: HazardAssessment[];
}

// Generate the color for a cell based on median score (E * B with W=3 as reference)
function getCellColor(e: number, b: number): string {
  // Use W=3 as middle reference to determine cell danger level
  const score = e * b * 3;
  return getRiskColor(getRiskLevel(score));
}

export default function RiskMatrix({ hazards }: RiskMatrixProps) {
  const eLabels = ['5', '4', '3', '2', '1'];
  const bLabels = ['1', '2', '3', '4', '5'];

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#091E42] mb-3">Risicomatrix (E × B)</h3>
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Header row */}
          <div className="flex">
            <div className="w-8 h-8" />
            {bLabels.map((b) => (
              <div key={b} className="w-12 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                B={b}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {eLabels.map((e) => (
            <div key={e} className="flex">
              <div className="w-8 h-12 flex items-center justify-center text-xs font-medium text-gray-500">
                E={e}
              </div>
              {bLabels.map((b) => {
                const eNum = parseInt(e);
                const bNum = parseInt(b);

                // Find hazards that fall in this cell (before measures)
                const beforeDots = hazards.filter(
                  (h) => h.effectBefore === eNum && h.exposureBefore === bNum
                );
                const afterDots = hazards.filter(
                  (h) => h.effectAfter === eNum && h.exposureAfter === bNum
                );

                return (
                  <div
                    key={`${e}-${b}`}
                    className="w-12 h-12 border border-white/50 rounded-sm flex items-center justify-center gap-0.5 flex-wrap"
                    style={{ backgroundColor: getCellColor(eNum, bNum) + '30' }}
                  >
                    {beforeDots.map((h) => (
                      <div
                        key={`b-${h.id}`}
                        className="w-2.5 h-2.5 rounded-full border-2"
                        style={{ borderColor: getRiskColor(h.levelBefore) }}
                        title={`${h.hazardName} (voor): ${h.scoreBefore}`}
                      />
                    ))}
                    {afterDots.map((h) => (
                      <div
                        key={`a-${h.id}`}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getRiskColor(h.levelAfter) }}
                        title={`${h.hazardName} (na): ${h.scoreAfter}`}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400" />
              <span>Voor maatregelen</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span>Na maatregelen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
