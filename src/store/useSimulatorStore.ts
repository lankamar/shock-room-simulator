import { create } from 'zustand';
import { ClinicalCase, VitalSignsSnapshot, Intervention } from '../schemas/case.schema';
import { shockCase } from '../data/mock-scenarios';
import { applyInterventionDelta, evaluateAlarms } from '../clinical-engine/engine';

interface SimulatorState {
  scenario: ClinicalCase | null;
  currentVitals: VitalSignsSnapshot | null;
  isRunning: boolean;
  timeElapsed: number; // in ms
  simulationSpeed: number;
  tutorMessage: string | null;
  
  // Actions
  loadScenario: (caseData: ClinicalCase) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: (deltaMs: number) => void;
  applyIntervention: (intervention: Intervention) => void;
  silenceAlarms: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  scenario: shockCase,
  currentVitals: shockCase.initialState,
  isRunning: false,
  timeElapsed: 0,
  simulationSpeed: 1,
  tutorMessage: "Bienvenido al Shock Room. Revisa el monitor y selecciona la intervención adecuada.",

  loadScenario: (caseData) => set({ 
    scenario: caseData, 
    currentVitals: { ...caseData.initialState, activeAlarms: evaluateAlarms(caseData.initialState) },
    timeElapsed: 0,
    isRunning: false,
    tutorMessage: null
  }),

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => set((state) => ({ 
    isRunning: false, 
    timeElapsed: 0, 
    currentVitals: state.scenario ? { ...state.scenario.initialState, activeAlarms: evaluateAlarms(state.scenario.initialState) } : null,
    tutorMessage: "Simulación reiniciada."
  })),

  tick: (deltaMs) => set((state) => {
    if (!state.isRunning || !state.scenario || !state.currentVitals) return state;
    
    let newTime = state.timeElapsed + deltaMs * state.simulationSpeed;
    let nextVitals = { ...state.currentVitals };
    let evtMsg = state.tutorMessage;

    // Check Evolution Rules (Time Based)
    state.scenario.evolutionRules.forEach(rule => {
      if (rule.trigger === 'time' && rule.delayMs && state.timeElapsed < rule.delayMs && newTime >= rule.delayMs) {
        // Trigger evolution
        nextVitals = applyInterventionDelta(nextVitals, rule.newVitals);
        if (rule.tutorMessage) evtMsg = rule.tutorMessage;
      }
    });

    return { 
      timeElapsed: newTime,
      currentVitals: nextVitals,
      tutorMessage: evtMsg
    };
  }),

  applyIntervention: (interv) => set((state) => {
    if (!state.currentVitals) return state;
    const nextVitals = applyInterventionDelta(state.currentVitals, interv.expectedEffect);
    return {
      currentVitals: nextVitals,
      tutorMessage: interv.feedback || "Intervención aplicada."
    };
  }),

  silenceAlarms: () => set((state) => {
    // In a real monitor this temporarily mutes audio, visual remains
    return state;
  })
}));
