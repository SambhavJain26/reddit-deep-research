import { useState, useCallback } from 'react';
import { RESEARCH_STEPS } from '@/utils/constants';

export interface ResearchStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export const useResearchSteps = () => {
  const [activeStep, setActiveStep] = useState(-1);
  const [showSteps, setShowSteps] = useState(false);

  const steps: ResearchStep[] = RESEARCH_STEPS.map((label, index) => ({
    id: index,
    label,
    status: index < activeStep ? 'completed' : index === activeStep ? 'active' : 'pending'
  }));

  const startSteps = useCallback(() => {
    setShowSteps(true);
    setActiveStep(-1);
  }, []);

  const nextStep = useCallback(() => {
    setActiveStep(prev => prev + 1);
  }, []);

  const resetSteps = useCallback(() => {
    setActiveStep(-1);
    setShowSteps(false);
  }, []);

  return {
    steps,
    activeStep,
    showSteps,
    startSteps,
    nextStep,
    resetSteps
  };
};