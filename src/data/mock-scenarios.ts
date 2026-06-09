import { ClinicalCase } from '../schemas/case.schema';

export const shockCase: ClinicalCase = {
  metadata: {
    id: "shock-hipovolemico-01",
    title: "Shock Hipovolémico Hemorrágico",
    category: "cardio",
    severity: "critical",
    version: "1.0.0",
    references: ["ATLS 10th Ed", "Surviving Sepsis Guidelines"],
  },
  patient: {
    age: 45,
    weight: 75,
    sex: "M",
    history: ["Trauma cerrado de abdomen"],
  },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Sinus Tachycardia", hr: 125 },
    spo2: { value: 96, pi: 1.2 },
    nibp: { systolic: 85, diastolic: 50, mean: 61 },
    resp: { rate: 24 },
    temp: { t1: 35.8 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 60000, // 1 min sin intervención
      newVitals: {
        ecg: { rhythm: "Sinus Tachycardia", hr: 140 },
        nibp: { systolic: 70, diastolic: 40, mean: 50 },
        spo2: { value: 94 }
      },
      tutorMessage: "La hipotensión empeora. El paciente está en shock descompensado. ¿Qué fluidos administrarías?"
    }
  ],
  interventions: [
    {
      id: "int-bolus-cristaloide",
      label: "Bolo Ringer Lactato 1000ml",
      category: "fluids",
      expectedEffect: {
        ecg: { rhythm: "Sinus Rhythm", hr: 105 },
        nibp: { systolic: 100, diastolic: 65, mean: 76 }
      },
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Buena elección inicial. PAM > 65mmHg lograda. Preparar transfusión en regla 1:1:1 si persiste sangrado."
    },
    {
      id: "int-noradrenalina",
      label: "Noradrenalina 0.1 mcg/kg/min",
      category: "drugs",
      expectedEffect: {
        ecg: { rhythm: "Sinus Tachycardia", hr: 145 },
        nibp: { systolic: 110, diastolic: 70, mean: 83 }
      },
      timeToEffectMs: 5000,
      priority: 3,
      isCorrect: false,
      feedback: "¡Cuidado! Usar vasopresores en hipovolemia severa no corregida empeora la isquemia tisular. Primero volumen."
    }
  ],
  debrief: {
    learningObjectives: ["Reconocimiento precoz shock", "Reposición volumen"],
    keyTeachingPoints: ["PAM meta: >65 mmHg", "Cristaloides iniciales"],
    commonErrors: ["Uso precoz vasopresores"],
    tutorClosingScript: "El paciente estabilizó su hemodinamia temporalmente. Recuerda revaluar respondedores a volumen."
  }
};

export const ALARM_SOUND = null; // Can hook WebAudio API here later
