import type { KinneyFactor, RiskLevel } from './tra-types';

export function calculateRiskScore(
  effect: KinneyFactor,
  exposure: KinneyFactor,
  probability: KinneyFactor
): number {
  return effect * exposure * probability;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'acceptabel';
  if (score <= 70) return 'aandacht';
  return 'onacceptabel';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'acceptabel':
      return '#22c55e';
    case 'aandacht':
      return '#eab308';
    case 'onacceptabel':
      return '#ef4444';
  }
}

export function getRiskBgClass(level: RiskLevel): string {
  switch (level) {
    case 'acceptabel':
      return 'bg-green-100 text-green-800 border-green-500';
    case 'aandacht':
      return 'bg-yellow-100 text-yellow-800 border-yellow-500';
    case 'onacceptabel':
      return 'bg-red-100 text-red-800 border-red-500';
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'acceptabel':
      return 'Acceptabel';
    case 'aandacht':
      return 'Aandacht vereist';
    case 'onacceptabel':
      return 'Onacceptabel';
  }
}

export const EFFECT_OPTIONS: { value: KinneyFactor; label: string }[] = [
  { value: 1, label: 'Letsel zonder verzuim' },
  { value: 2, label: 'Letsel met verzuim' },
  { value: 3, label: 'Ernstig letsel' },
  { value: 4, label: 'Zeer ernstig / invalide' },
  { value: 5, label: 'Dodelijk' },
];

export const EXPOSURE_OPTIONS: { value: KinneyFactor; label: string }[] = [
  { value: 1, label: 'Zeer zelden' },
  { value: 2, label: 'Zelden' },
  { value: 3, label: 'Soms' },
  { value: 4, label: 'Regelmatig' },
  { value: 5, label: 'Voortdurend' },
];

export const PROBABILITY_OPTIONS: { value: KinneyFactor; label: string }[] = [
  { value: 1, label: 'Vrijwel onmogelijk' },
  { value: 2, label: 'Onwaarschijnlijk' },
  { value: 3, label: 'Mogelijk' },
  { value: 4, label: 'Waarschijnlijk' },
  { value: 5, label: 'Zeer waarschijnlijk' },
];

export function getFactorLabel(type: 'effect' | 'exposure' | 'probability', value: number): string {
  const options =
    type === 'effect' ? EFFECT_OPTIONS :
    type === 'exposure' ? EXPOSURE_OPTIONS :
    PROBABILITY_OPTIONS;
  return options.find((o) => o.value === value)?.label ?? String(value);
}
