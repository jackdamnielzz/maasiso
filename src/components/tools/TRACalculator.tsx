'use client';

import { useReducer, useEffect, useCallback } from 'react';
import type { TRAProject, WorkStep, TRAReport } from '@/lib/tools/tra-types';
import ProgressBar from './ProgressBar';
import ProjectStep from './steps/ProjectStep';
import HazardsStep from './steps/HazardsStep';
import ResultsStep from './steps/ResultsStep';
import DownloadStep from './steps/DownloadStep';

const STORAGE_KEY = 'maasiso-tra-calculator';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

const initialProject: TRAProject = {
  name: '',
  company: '',
  location: '',
  date: getToday(),
  author: '',
};

type State = {
  currentStep: number;
  report: TRAReport;
};

type Action =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_PROJECT'; project: TRAProject }
  | { type: 'SET_WORK_STEPS'; workSteps: WorkStep[] }
  | { type: 'LOAD'; state: State }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'SET_PROJECT':
      return { ...state, report: { ...state.report, project: action.project } };
    case 'SET_WORK_STEPS':
      return { ...state, report: { ...state.report, workSteps: action.workSteps } };
    case 'LOAD':
      return action.state;
    case 'RESET':
      return {
        currentStep: 0,
        report: {
          project: { ...initialProject, date: getToday() },
          workSteps: [],
          createdAt: new Date().toISOString(),
        },
      };
    default:
      return state;
  }
}

const initialState: State = {
  currentStep: 0,
  report: {
    project: initialProject,
    workSteps: [],
    createdAt: new Date().toISOString(),
  },
};

export default function TRACalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as State;
        if (parsed.report && parsed.report.project) {
          dispatch({ type: 'LOAD', state: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReset = () => {
    if (window.confirm('Weet u zeker dat u opnieuw wilt beginnen? Alle ingevulde gegevens worden gewist.')) {
      dispatch({ type: 'RESET' });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar currentStep={state.currentStep} />

      <div className="bg-[#f8f9fa] rounded-xl p-4 sm:p-6 md:p-8 border border-[#d8e2f0]">
        {state.currentStep === 0 && (
          <ProjectStep
            project={state.report.project}
            onChange={(project) => dispatch({ type: 'SET_PROJECT', project })}
            onNext={() => goToStep(1)}
          />
        )}

        {state.currentStep === 1 && (
          <HazardsStep
            workSteps={state.report.workSteps}
            onChange={(workSteps) => dispatch({ type: 'SET_WORK_STEPS', workSteps })}
            onNext={() => goToStep(2)}
            onBack={() => goToStep(0)}
          />
        )}

        {state.currentStep === 2 && (
          <ResultsStep
            workSteps={state.report.workSteps}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        )}

        {state.currentStep === 3 && (
          <DownloadStep
            report={state.report}
            onBack={() => goToStep(2)}
          />
        )}
      </div>

      {/* Reset knop */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Opnieuw beginnen
        </button>
      </div>
    </div>
  );
}
