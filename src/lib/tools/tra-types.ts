export type KinneyFactor = 1 | 2 | 3 | 4 | 5;

export type RiskLevel = 'acceptabel' | 'aandacht' | 'onacceptabel';

export interface TRAProject {
  name: string;
  company: string;
  location: string;
  date: string;
  author: string;
}

export interface HazardAssessment {
  id: string;
  hazardId: string;
  hazardName: string;
  categoryName: string;
  // Voor maatregelen
  effectBefore: KinneyFactor;
  exposureBefore: KinneyFactor;
  probabilityBefore: KinneyFactor;
  scoreBefore: number;
  levelBefore: RiskLevel;
  // Maatregelen
  selectedMeasures: string[];
  customMeasures: string[];
  // Na maatregelen
  effectAfter: KinneyFactor;
  exposureAfter: KinneyFactor;
  probabilityAfter: KinneyFactor;
  scoreAfter: number;
  levelAfter: RiskLevel;
}

export interface WorkStep {
  id: string;
  name: string;
  description: string;
  hazards: HazardAssessment[];
}

export interface TRAReport {
  project: TRAProject;
  workSteps: WorkStep[];
  createdAt: string;
}
