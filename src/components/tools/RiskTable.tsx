'use client';

import type { WorkStep } from '@/lib/tools/tra-types';
import { getRiskBgClass, getRiskLabel } from '@/lib/tools/kinney';

interface RiskTableProps {
  workSteps: WorkStep[];
}

export default function RiskTable({ workSteps }: RiskTableProps) {
  const allHazards = workSteps.flatMap((step) =>
    step.hazards.map((h) => ({ ...h, stepName: step.name }))
  );

  if (allHazards.length === 0) return null;

  // Sort by before-score descending (highest risk first)
  const sorted = [...allHazards].sort((a, b) => b.scoreBefore - a.scoreBefore);

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#091E42] mb-3">Gevarenoverzicht</h3>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#091E42]">
              <th className="text-left py-2 pr-2 text-[#091E42]">Werkstap</th>
              <th className="text-left py-2 pr-2 text-[#091E42]">Gevaar</th>
              <th className="text-center py-2 px-1 text-[#091E42]" colSpan={4}>Voor</th>
              <th className="text-left py-2 pr-2 text-[#091E42]">Maatregelen</th>
              <th className="text-center py-2 px-1 text-[#091E42]" colSpan={4}>Na</th>
            </tr>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              <th />
              <th />
              <th className="py-1 px-1 text-center">E</th>
              <th className="py-1 px-1 text-center">B</th>
              <th className="py-1 px-1 text-center">W</th>
              <th className="py-1 px-1 text-center">Score</th>
              <th />
              <th className="py-1 px-1 text-center">E</th>
              <th className="py-1 px-1 text-center">B</th>
              <th className="py-1 px-1 text-center">W</th>
              <th className="py-1 px-1 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => {
              const allMeasures = [...h.selectedMeasures, ...h.customMeasures];
              return (
                <tr key={h.id} className={`border-b border-gray-100 border-l-4 ${getRiskBgClass(h.levelBefore)}`}>
                  <td className="py-2 pr-2 text-[#091E42]">{h.stepName}</td>
                  <td className="py-2 pr-2 font-medium text-[#091E42]">{h.hazardName}</td>
                  <td className="py-2 px-1 text-center">{h.effectBefore}</td>
                  <td className="py-2 px-1 text-center">{h.exposureBefore}</td>
                  <td className="py-2 px-1 text-center">{h.probabilityBefore}</td>
                  <td className="py-2 px-1 text-center font-bold">{h.scoreBefore}</td>
                  <td className="py-2 pr-2 text-xs">
                    {allMeasures.length > 0
                      ? allMeasures.join('; ')
                      : <span className="text-gray-400 italic">Geen</span>
                    }
                  </td>
                  <td className="py-2 px-1 text-center">{h.effectAfter}</td>
                  <td className="py-2 px-1 text-center">{h.exposureAfter}</td>
                  <td className="py-2 px-1 text-center">{h.probabilityAfter}</td>
                  <td className={`py-2 px-1 text-center font-bold`}>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${getRiskBgClass(h.levelAfter)}`}>
                      {h.scoreAfter}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sorted.map((h) => {
          const allMeasures = [...h.selectedMeasures, ...h.customMeasures];
          const reduction = h.scoreBefore > 0
            ? Math.round(((h.scoreBefore - h.scoreAfter) / h.scoreBefore) * 100)
            : 0;

          return (
            <div key={h.id} className={`border-l-4 rounded-lg p-3 bg-white border ${getRiskBgClass(h.levelBefore)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs text-gray-500">{h.stepName}</span>
                  <h4 className="font-semibold text-[#091E42] text-sm">{h.hazardName}</h4>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskBgClass(h.levelBefore)}`}>
                  {h.scoreBefore} ({getRiskLabel(h.levelBefore)})
                </span>
                {reduction > 0 && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskBgClass(h.levelAfter)}`}>
                      {h.scoreAfter} ({getRiskLabel(h.levelAfter)})
                    </span>
                    <span className="text-xs text-[#00875A] font-medium">↓{reduction}%</span>
                  </>
                )}
              </div>

              {allMeasures.length > 0 && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Maatregelen: </span>
                  {allMeasures.join('; ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
