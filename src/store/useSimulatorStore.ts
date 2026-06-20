import { create } from 'zustand';
import { createMachine, createActor } from 'xstate';
import { ClinicalCase, VitalSignsSnapshot, Intervention } from '../schemas/case.schema';
import { shockCase } from '../data/mock-scenarios';
import { applyInterventionDelta, evaluateAlarms } from '../clinical-engine/engine';
import { SpeechHintSystem } from '../clinical-engine/speech';
import { calculatePenalties } from '../clinical-engine/penalties';

const speechSystem = typeof window !== 'undefined' ? new SpeechHintSystem() : null;

export const simulatorMachine = createMachine({
  id: 'simulator',
  initial: 'IDLE',
  states: {
    IDLE: {
      on: {
        START: { target: 'RUNNING' },
        LOAD: { target: 'IDLE' }
      }
    },
    RUNNING: {
      on: {
        PAUSE: { target: 'IDLE' },
        END: { target: 'DEBRIEF' },
        RESET: { target: 'IDLE' }
      }
    },
    DEBRIEF: {
      on: {
        RESET: { target: 'IDLE' },
        LOAD: { target: 'IDLE' }
      }
    }
  }
});

// Deterministic Time-Based Pure Function
export function calculateDeterministicState(
  scenarioId: string,
  initialVitals: VitalSignsSnapshot,
  rules: any[],
  interventions: { time: number; intervention: Intervention }[],
  timeMs: number
): { vitals: VitalSignsSnapshot, latestTutorMessage: string | null } {
  let vitals = JSON.parse(JSON.stringify(initialVitals));
  let latestMessage: string | null = null;
  
  // Aggregate all events on a deterministic timeline
  const timeline: { time: number; type: 'rule' | 'intervention'; data: any }[] = [];
  
  rules.forEach((rule) => {
    if (rule.trigger === 'time' && rule.delayMs !== undefined) {
      timeline.push({ time: rule.delayMs, type: 'rule', data: rule });
    }
  });
  
  interventions.forEach((inv) => {
    timeline.push({ time: inv.time, type: 'intervention', data: inv.intervention });
  });
  
  // Stable sort by time
  timeline.sort((a, b) => a.time - b.time);
  
  timeline.forEach((evt) => {
    if (evt.time <= timeMs) {
      if (evt.type === 'rule') {
        vitals = applyInterventionDelta(vitals, evt.data.newVitals);
        if (evt.data.tutorMessage) {
          latestMessage = evt.data.tutorMessage;
        }
      } else if (evt.type === 'intervention') {
        if (evt.data.expectedEffect) {
          vitals = applyInterventionDelta(vitals, evt.data.expectedEffect);
        }
      }
    }
  });

  // Apply continuous physiological deterioration penalties based on final timeMs
  const penaltyResult = calculatePenalties(vitals, timeMs, scenarioId, interventions);
  vitals = penaltyResult.vitals;
  if (penaltyResult.penaltyMessage) {
    latestMessage = penaltyResult.penaltyMessage;
  }
  
  return { vitals, latestTutorMessage: latestMessage };
}

export type SimulatorPhase = 'IDLE' | 'RUNNING' | 'DEBRIEF';

export interface PatientLogEntry {
  id: string;
  timestamp: number;
  type: 'assessment' | 'intervention' | 'note' | 'system';
  content: string;
}

interface SimulatorState {
  scenario: ClinicalCase | null;
  currentVitals: VitalSignsSnapshot | null;
  phase: SimulatorPhase;
  isRunning: boolean; // Compatibility mapped to phase === 'RUNNING'
  isAudioEnabled: boolean;
  timeElapsed: number; // in ms
  simulationSpeed: number;
  tutorMessage: string | null;
  highlightedPanel: string | null;
  isTutorLoading: boolean;
  appliedInterventions: Intervention[];
  interventionLog: { time: number; intervention: Intervention }[];
  lastIntervention: Intervention | null;
  vitalRecords: { time: number; vitals: VitalSignsSnapshot }[];
  patientLogs: PatientLogEntry[];
  customScenarios: ClinicalCase[];

  // Actions
  loadScenario: (caseData: ClinicalCase) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  endSimulation: () => void;
  tick: (deltaMs: number) => void;
  applyIntervention: (intervention: Intervention) => Promise<void>;
  askTutor: (question?: string) => Promise<void>;
  setTutorMessage: (msg: string | null) => void;
  setHighlightedPanel: (panel: string | null) => void;
  addPatientLog: (entry: Omit<PatientLogEntry, 'id'>) => void;
  toggleAudio: () => void;
  addCustomScenario: (scen: ClinicalCase) => void;
}

const getWelcomeMessage = (scenId: string): string => {
  switch (scenId) {
    case "shock-hipovolemico": return "Paciente masculino de 45 años ingresa tras trauma cerrado de abdomen por colisión de vehículo motorizado a alta energía. Presenta signos de hipoperfusión tisular periférica (piel fría y diáfana). Requiere estabilización hemodinámica inmediata.";
    case "intoxicacion-co": return "Paciente femenina de 32 años encontrada inconsciente en ambiente cerrado con aparente mala combustión. La pulsioximetría registra 98%, lo cual sugiere interferencia de lectura por carboxihemoglobina. Debe reevaluar mediante cooximetría y mecánica ventilatoria.";
    case "bronquiolitis": return "Lactante menor (6 meses) presenta taquipnea severa (56 rpm) e imposibilidad para la ingesta oral. El examen físico revela tiraje intercostal y supraesternal con desaturación concomitante. Existe inminente riesgo de agotamiento respiratorio.";
    case "anafilaxia": return "Se constata reacción de hipersensibilidad tipo I secundaria a infusión antibiótica. La paciente evoluciona con eritema generalizado, sibilancias difusas, estridor laríngeo e hipotensión profunda. Se requiere intervención farmacológica perentoria.";
    case "neumonia-derrame": return "Paciente masculino de 18 años, 5 días de evolución con síndrome febril y dolor pleurítico en base pulmonar derecha. Evoluciona con taquipnea superficial y desaturación arterial. Es imperativo evaluar ocupación del espacio pleural.";
    case "neumonia-sdra": return "Paciente masculino de 58 años cursando insuficiencia respiratoria aguda por Neumonía Adquirida en la Comunidad (NAC). Se ha instaurado Cánula Nasal de Alto Flujo (CNAF), sin embargo, el índice ROX evidencia deterioro progresivo de la mecánica ventilatoria.";
    case "cetoacidosis-diabetica": return "Paciente femenina pre-púber de 8 años con diagnóstico de Cetoacidosis Diabética (CAD). Presenta deshidratación severa, pH venoso de 7.1 y patrón respiratorio de Kussmaul. El manejo de la hidratación debe ser protocolizado para mitigar riesgo de edema cerebral osmótico.";
    case "acidemia-propionica": return "Paciente neonato (4 días de vida) ingresa con letargia extrema, rechazo al alimento e hipotonía severa. Presenta acidosis metabólica profunda. Requiere discriminación diagnóstica urgente entre Sepsis Neonatal y Error Innato del Metabolismo (Acidemia Propiónica).";
    default: return "Sistema de simulación inicializado. Analice la monitorización de constantes vitales y defina la conducta terapéutica a seguir.";
  }
};

const simActor = createActor(simulatorMachine).start();

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  scenario: shockCase,
  currentVitals: { ...shockCase.initialState, activeAlarms: evaluateAlarms(shockCase.initialState) },
  phase: 'IDLE',
  isRunning: false,
  isAudioEnabled: true,
  timeElapsed: 0,
  simulationSpeed: 1,
  tutorMessage: getWelcomeMessage("shock-hipovolemico"),
  highlightedPanel: null,
  isTutorLoading: false,
  appliedInterventions: [],
  interventionLog: [],
  lastIntervention: null,
  vitalRecords: [],
  patientLogs: [{
    id: 'sys-init',
    timestamp: 0,
    type: 'system',
    content: 'Simulador Inicializado...'
  }],
  customScenarios: [],

  loadScenario: (caseData) => {
    // ... rest
    simActor.send({ type: 'LOAD' });
    set({ 
      scenario: caseData, 
      currentVitals: { ...caseData.initialState, activeAlarms: evaluateAlarms(caseData.initialState) },
      timeElapsed: 0,
      phase: simActor.getSnapshot().value as SimulatorPhase,
      isRunning: false,
      tutorMessage: getWelcomeMessage(caseData.metadata.id),
      highlightedPanel: null,
      appliedInterventions: [],
      interventionLog: [],
      lastIntervention: null,
      vitalRecords: [{ time: 0, vitals: { ...caseData.initialState, activeAlarms: evaluateAlarms(caseData.initialState) } }],
      patientLogs: [{
        id: crypto.randomUUID(),
        timestamp: 0,
        type: 'system',
        content: `Escenario cargado: ${caseData.metadata.title}`
      }],
      isTutorLoading: false
    });
  },

  start: () => {
    simActor.send({ type: 'START' });
    set({ phase: simActor.getSnapshot().value as SimulatorPhase, isRunning: true });
  },
  
  pause: () => {
    simActor.send({ type: 'PAUSE' });
    set({ phase: simActor.getSnapshot().value as SimulatorPhase, isRunning: false });
  },

  endSimulation: () => {
    simActor.send({ type: 'END' });
    set({ phase: simActor.getSnapshot().value as SimulatorPhase, isRunning: false });
  },
  
  reset: () => {
    simActor.send({ type: 'RESET' });
    set((state) => ({ 
      phase: simActor.getSnapshot().value as SimulatorPhase,
      isRunning: false, 
      timeElapsed: 0, 
      currentVitals: state.scenario ? { ...state.scenario.initialState, activeAlarms: evaluateAlarms(state.scenario.initialState) } : null,
      tutorMessage: state.scenario ? getWelcomeMessage(state.scenario.metadata.id) : "Simulación reiniciada.",
      highlightedPanel: null,
      appliedInterventions: [],
      interventionLog: [],
      lastIntervention: null,
      vitalRecords: state.scenario ? [{ time: 0, vitals: { ...state.scenario.initialState, activeAlarms: evaluateAlarms(state.scenario.initialState) } }] : [],
      patientLogs: state.scenario ? [{
        id: crypto.randomUUID(),
        timestamp: 0,
        type: 'system',
        content: `Simulación reiniciada`
      }] : [],
      isTutorLoading: false
    }));
  },

  tick: (deltaMs) => set((state) => {
    if (state.phase !== 'RUNNING' || !state.scenario) return state;
    
    const newTime = state.timeElapsed + deltaMs * state.simulationSpeed;
    
    // Deterministic core
    const { vitals, latestTutorMessage } = calculateDeterministicState(
      state.scenario.metadata.id,
      state.scenario.initialState,
      state.scenario.evolutionRules,
      state.interventionLog,
      newTime
    );

    // Provide voice hint only when a new rule fires that sets a message
    // Since latestTutorMessage returns the message active at that time,
    // we need to see if it changed to detect the edge
    let newEvtMsg = state.tutorMessage;
    let newHighlightedPanel = state.highlightedPanel;
    if (latestTutorMessage && latestTutorMessage !== state.tutorMessage) {
       newEvtMsg = latestTutorMessage;
       if (speechSystem && state.isAudioEnabled) speechSystem.triggerVoiceHint(latestTutorMessage, 3);
       
       if (state.scenario.metadata.id === 'mod-00-tutorial') {
         if (latestTutorMessage.includes('panel central')) newHighlightedPanel = 'monitor';
         else if (latestTutorMessage.includes('derecha tienes')) newHighlightedPanel = 'interventions';
         else if (latestTutorMessage.includes('panel inferior')) newHighlightedPanel = 'tutor';
         else newHighlightedPanel = null;
       }
    }
    
    // Record vitals every 10 simulation seconds (10000ms) for trends
    let newVitalRecords = state.vitalRecords;
    if (state.vitalRecords.length === 0 || (newTime - state.vitalRecords[state.vitalRecords.length - 1].time) >= 10000) {
      newVitalRecords = [...state.vitalRecords, { time: newTime, vitals }];
    }

    return { 
      timeElapsed: newTime,
      currentVitals: vitals,
      tutorMessage: newEvtMsg,
      highlightedPanel: newHighlightedPanel,
      vitalRecords: newVitalRecords
    };
  }),

  applyIntervention: async (interv) => {
    const { scenario, appliedInterventions, timeElapsed, interventionLog } = get();
    if (!scenario) return;

    if (appliedInterventions.some(i => i.id === interv.id)) {
      set({ tutorMessage: `La intervención solicitada ("${interv.label}") ya ha sido ejecutada en el ciclo actual. Proceda con el siguiente escalón terapéutico.` });
      return;
    }

    const newLog = [...interventionLog, { time: timeElapsed, intervention: interv }];
    
    const newPatientLog: PatientLogEntry = {
      id: crypto.randomUUID(),
      timestamp: timeElapsed,
      type: 'intervention',
      content: `Intervención realizada: ${interv.label}`
    };

    // Immediately calculate next vitals deterministically
    const { vitals } = calculateDeterministicState(
      scenario.metadata.id,
      scenario.initialState,
      scenario.evolutionRules,
      newLog,
      timeElapsed
    );

    set({
      currentVitals: vitals,
      appliedInterventions: [...appliedInterventions, interv],
      interventionLog: newLog,
      vitalRecords: get().vitalRecords, // vitalRecords should be preserved
      patientLogs: [...get().patientLogs, newPatientLog],
      lastIntervention: interv,
      tutorMessage: interv.feedback || "Intervención registrada y ejecutada en el simulador."
    });

    if (interv.feedback && speechSystem && get().isAudioEnabled) {
       speechSystem.triggerVoiceHint(interv.feedback, 2);
    }

    set({ isTutorLoading: true });
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: scenario.metadata.title,
          vitals: vitals,
          tutorMessage: interv.feedback,
          activeAlarms: vitals.activeAlarms,
          lastIntervention: { label: interv.label, isCorrect: interv.isCorrect }
        })
      });
      const data = await response.json();
      if (data.reply) {
        set({ tutorMessage: data.reply });
        if (speechSystem && get().isAudioEnabled) speechSystem.triggerVoiceHint(data.reply, 2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isTutorLoading: false });
    }
  },

  askTutor: async (question) => {
    const { currentVitals, scenario, tutorMessage } = get();
    if (!currentVitals || !scenario) return;

    set({ isTutorLoading: true });
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: scenario.metadata.title,
          vitals: currentVitals,
          tutorMessage: tutorMessage,
          activeAlarms: currentVitals.activeAlarms,
          userQuestion: question
        })
      });
      const data = await response.json();
      if (data.reply) {
         set({ tutorMessage: data.reply });
         if (speechSystem && get().isAudioEnabled) speechSystem.triggerVoiceHint(data.reply, 2);
      }
    } catch (e) {
      console.error(e);
      set({ tutorMessage: "Se ha detectado una anomalía en la transmisión de datos al servidor de razonamiento clínico. Por favor, reitere su solicitud." });
    } finally {
      set({ isTutorLoading: false });
    }
  },

  setTutorMessage: (msg) => {
    set({ tutorMessage: msg });
    if (msg && speechSystem && get().isAudioEnabled) {
      speechSystem.triggerVoiceHint(msg, 2);
    }
  },

  setHighlightedPanel: (panel) => {
    set({ highlightedPanel: panel });
  },

  addPatientLog: (entry) => {
    const { patientLogs } = get();
    set({
      patientLogs: [...patientLogs, { ...entry, id: crypto.randomUUID() }]
    });
  },

  toggleAudio: () => {
    set((state) => {
      const newEnabled = !state.isAudioEnabled;
      if (!newEnabled && speechSystem) {
        speechSystem.cancel();
      }
      return { isAudioEnabled: newEnabled };
    });
  },

  addCustomScenario: (scen) => {
    set((state) => ({ customScenarios: [...state.customScenarios, scen] }));
  }
}));
