'use client';

import { useState } from 'react';
import type { WorkStep, HazardAssessment, KinneyFactor } from '@/lib/tools/tra-types';
import { HAZARD_CATEGORIES, getHazardById, getCategoryByHazardId } from '@/lib/tools/hazards';
import { calculateRiskScore, getRiskLevel, EFFECT_OPTIONS, EXPOSURE_OPTIONS, PROBABILITY_OPTIONS } from '@/lib/tools/kinney';
import ScoreSelector from '../ScoreSelector';
import ScoreBadge from '../ScoreBadge';

interface HazardsStepProps {
  workSteps: WorkStep[];
  onChange: (workSteps: WorkStep[]) => void;
  onNext: () => void;
  onBack: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function createDefaultAssessment(hazardId: string, hazardName: string, categoryName: string): HazardAssessment {
  const score = calculateRiskScore(3, 3, 3);
  const level = getRiskLevel(score);
  return {
    id: generateId(),
    hazardId,
    hazardName,
    categoryName,
    effectBefore: 3,
    exposureBefore: 3,
    probabilityBefore: 3,
    scoreBefore: score,
    levelBefore: level,
    selectedMeasures: [],
    customMeasures: [],
    effectAfter: 3,
    exposureAfter: 3,
    probabilityAfter: 3,
    scoreAfter: score,
    levelAfter: level,
  };
}

function HazardCard({
  assessment,
  onUpdate,
  onRemove,
}: {
  assessment: HazardAssessment;
  onUpdate: (updated: HazardAssessment) => void;
  onRemove: () => void;
}) {
  const [customInput, setCustomInput] = useState('');
  const hazardDef = getHazardById(assessment.hazardId);

  const updateBefore = (field: 'effectBefore' | 'exposureBefore' | 'probabilityBefore', value: KinneyFactor) => {
    const updated = { ...assessment, [field]: value };
    updated.scoreBefore = calculateRiskScore(updated.effectBefore, updated.exposureBefore, updated.probabilityBefore);
    updated.levelBefore = getRiskLevel(updated.scoreBefore);
    onUpdate(updated);
  };

  const updateAfter = (field: 'effectAfter' | 'exposureAfter' | 'probabilityAfter', value: KinneyFactor) => {
    const updated = { ...assessment, [field]: value };
    updated.scoreAfter = calculateRiskScore(updated.effectAfter, updated.exposureAfter, updated.probabilityAfter);
    updated.levelAfter = getRiskLevel(updated.scoreAfter);
    onUpdate(updated);
  };

  const toggleMeasure = (measure: string) => {
    const selected = assessment.selectedMeasures.includes(measure)
      ? assessment.selectedMeasures.filter((m) => m !== measure)
      : [...assessment.selectedMeasures, measure];
    onUpdate({ ...assessment, selectedMeasures: selected });
  };

  const addCustomMeasure = () => {
    if (!customInput.trim()) return;
    onUpdate({
      ...assessment,
      customMeasures: [...assessment.customMeasures, customInput.trim()],
    });
    setCustomInput('');
  };

  const removeCustomMeasure = (index: number) => {
    onUpdate({
      ...assessment,
      customMeasures: assessment.customMeasures.filter((_, i) => i !== index),
    });
  };

  const reductionPercent = assessment.scoreBefore > 0
    ? Math.round(((assessment.scoreBefore - assessment.scoreAfter) / assessment.scoreBefore) * 100)
    : 0;

  return (
    <div className="border border-[#d8e2f0] rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-medium text-gray-500">{assessment.categoryName}</span>
          <h4 className="font-semibold text-[#091E42]">{assessment.hazardName}</h4>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="Gevaar verwijderen"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Voor maatregelen */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Voor maatregelen</span>
        <div className="flex flex-wrap gap-4 mt-2 items-end">
          <ScoreSelector label="Effect (E)" value={assessment.effectBefore} onChange={(v) => updateBefore('effectBefore', v)} options={EFFECT_OPTIONS} />
          <ScoreSelector label="Blootstelling (B)" value={assessment.exposureBefore} onChange={(v) => updateBefore('exposureBefore', v)} options={EXPOSURE_OPTIONS} />
          <ScoreSelector label="Waarschijnlijkheid (W)" value={assessment.probabilityBefore} onChange={(v) => updateBefore('probabilityBefore', v)} options={PROBABILITY_OPTIONS} />
          <div className="flex items-end pb-5">
            <ScoreBadge score={assessment.scoreBefore} level={assessment.levelBefore} />
          </div>
        </div>
      </div>

      {/* Maatregelen */}
      <div className="mb-4 bg-gray-50 rounded-lg p-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Maatregelen</span>
        {hazardDef && hazardDef.suggestedMeasures.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {hazardDef.suggestedMeasures.map((measure) => (
              <label key={measure} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assessment.selectedMeasures.includes(measure)}
                  onChange={() => toggleMeasure(measure)}
                  className="mt-0.5 rounded border-gray-300 text-[#00875A] focus:ring-[#00875A]"
                />
                <span className="text-sm text-[#091E42]">{measure}</span>
              </label>
            ))}
          </div>
        )}

        {assessment.customMeasures.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {assessment.customMeasures.map((measure, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-[#091E42] flex-1">+ {measure}</span>
                <button
                  type="button"
                  onClick={() => removeCustomMeasure(i)}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomMeasure()}
            placeholder="Eigen maatregel toevoegen..."
            className="flex-1 px-2 py-1.5 text-sm border border-[#d8e2f0] rounded text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF8B00]"
          />
          <button
            type="button"
            onClick={addCustomMeasure}
            disabled={!customInput.trim()}
            className="px-3 py-1.5 text-sm bg-[#091E42] text-white rounded hover:bg-[#0a2550] disabled:opacity-40 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Na maatregelen */}
      <div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Na maatregelen</span>
        <div className="flex flex-wrap gap-4 mt-2 items-end">
          <ScoreSelector label="Effect (E)" value={assessment.effectAfter} onChange={(v) => updateAfter('effectAfter', v)} options={EFFECT_OPTIONS} />
          <ScoreSelector label="Blootstelling (B)" value={assessment.exposureAfter} onChange={(v) => updateAfter('exposureAfter', v)} options={EXPOSURE_OPTIONS} />
          <ScoreSelector label="Waarschijnlijkheid (W)" value={assessment.probabilityAfter} onChange={(v) => updateAfter('probabilityAfter', v)} options={PROBABILITY_OPTIONS} />
          <div className="flex items-end pb-5">
            <ScoreBadge score={assessment.scoreAfter} level={assessment.levelAfter} />
          </div>
        </div>
        {reductionPercent > 0 && (
          <p className="text-xs text-[#00875A] font-medium mt-1">
            ↓ {reductionPercent}% risicoverlaging
          </p>
        )}
      </div>
    </div>
  );
}

export default function HazardsStep({ workSteps, onChange, onNext, onBack }: HazardsStepProps) {
  const [newStepName, setNewStepName] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(workSteps.length === 0);

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addWorkStep = () => {
    if (!newStepName.trim()) return;
    const newStep: WorkStep = {
      id: generateId(),
      name: newStepName.trim(),
      description: newStepDesc.trim(),
      hazards: [],
    };
    onChange([...workSteps, newStep]);
    setExpandedSteps((prev) => new Set(prev).add(newStep.id));
    setNewStepName('');
    setNewStepDesc('');
    setShowAddForm(false);
  };

  const removeWorkStep = (id: string) => {
    onChange(workSteps.filter((s) => s.id !== id));
  };

  const addHazard = (stepId: string, hazardId: string) => {
    const hazardDef = getHazardById(hazardId);
    const category = getCategoryByHazardId(hazardId);
    if (!hazardDef || !category) return;

    const assessment = createDefaultAssessment(hazardId, hazardDef.name, category.name);
    onChange(
      workSteps.map((s) =>
        s.id === stepId ? { ...s, hazards: [...s.hazards, assessment] } : s
      )
    );
  };

  const updateHazard = (stepId: string, updated: HazardAssessment) => {
    onChange(
      workSteps.map((s) =>
        s.id === stepId
          ? { ...s, hazards: s.hazards.map((h) => (h.id === updated.id ? updated : h)) }
          : s
      )
    );
  };

  const removeHazard = (stepId: string, hazardId: string) => {
    onChange(
      workSteps.map((s) =>
        s.id === stepId ? { ...s, hazards: s.hazards.filter((h) => h.id !== hazardId) } : s
      )
    );
  };

  const totalHazards = workSteps.reduce((sum, s) => sum + s.hazards.length, 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-[#091E42] mb-1">Werkstappen & Gevaren</h2>
      <p className="text-sm text-gray-600 mb-6">
        Voeg werkstappen toe en selecteer per stap de gevaren. Beoordeel elk gevaar met de Kinney & Wiruth-methode (E × B × W).
      </p>

      {/* Bestaande werkstappen */}
      <div className="space-y-3 mb-4">
        {workSteps.map((step) => {
          const isExpanded = expandedSteps.has(step.id);
          return (
            <div key={step.id} className="border border-[#d8e2f0] rounded-lg bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => toggleExpand(step.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <div>
                    <span className="font-semibold text-[#091E42]">{step.name}</span>
                    {step.description && (
                      <span className="text-xs text-gray-500 ml-2">{step.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{step.hazards.length} gevaren</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeWorkStep(step.id); }}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Werkstap verwijderen"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {/* Gevaren */}
                  <div className="space-y-3 mt-3">
                    {step.hazards.map((hazard) => (
                      <HazardCard
                        key={hazard.id}
                        assessment={hazard}
                        onUpdate={(updated) => updateHazard(step.id, updated)}
                        onRemove={() => removeHazard(step.id, hazard.id)}
                      />
                    ))}
                  </div>

                  {/* Gevaar toevoegen */}
                  <div className="mt-3">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addHazard(step.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="w-full px-3 py-2 border border-dashed border-[#d8e2f0] rounded-lg text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF8B00] focus:border-transparent cursor-pointer"
                    >
                      <option value="">+ Gevaar toevoegen...</option>
                      {HAZARD_CATEGORIES.map((cat) => (
                        <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                          {cat.hazards.map((h) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Werkstap toevoegen */}
      {showAddForm ? (
        <div className="border border-dashed border-[#FF8B00] rounded-lg p-4 bg-orange-50/30">
          <h3 className="text-sm font-semibold text-[#091E42] mb-3">Nieuwe werkstap</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              placeholder="Naam van de werkstap (bijv. 'Werkplek inrichten')"
              className="w-full px-3 py-2 border border-[#d8e2f0] rounded-lg text-sm text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8B00]"
              onKeyDown={(e) => e.key === 'Enter' && addWorkStep()}
              autoFocus
            />
            <input
              type="text"
              value={newStepDesc}
              onChange={(e) => setNewStepDesc(e.target.value)}
              placeholder="Korte beschrijving (optioneel)"
              className="w-full px-3 py-2 border border-[#d8e2f0] rounded-lg text-sm text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8B00]"
              onKeyDown={(e) => e.key === 'Enter' && addWorkStep()}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addWorkStep}
                disabled={!newStepName.trim()}
                className="px-4 py-2 text-sm bg-[#091E42] text-white rounded-lg hover:bg-[#0a2550] disabled:opacity-40 transition-colors"
              >
                Toevoegen
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewStepName(''); setNewStepDesc(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#FF8B00] hover:text-[#FF8B00] transition-colors"
        >
          + Werkstap toevoegen
        </button>
      )}

      {/* Navigatie */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 text-gray-600 font-semibold rounded-lg hover:text-[#091E42] transition-colors"
        >
          ← Vorige
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={totalHazards === 0}
          className="px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Volgende →
        </button>
      </div>
    </div>
  );
}
