import { ClinicalCase } from '../schemas/case.schema';

export const shockHipovolemico: ClinicalCase = {
  metadata: {
    id: "shock-hipovolemico-01",
    title: "Shock Hipovolémico Hemorrágico",
    category: "cardio",
    severity: "critical",
    season: "all-year",
    version: "2.0.0",
    references: ["ATLS 10th Ed", "Surviving Sepsis Guidelines", "Informe Clínico Avanzado: Monitorización Multimodal"],
    tags: ["trauma", "hemorragia", "shock", "hipovolemia"],
  },
  patient: { age: 45, weight: 75, sex: "M", history: ["Trauma cerrado de abdomen", "Fumador"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Sinus Tachycardia", hr: 125, st: -0.5 },
    spo2: { value: 96, pi: 1.2 },
    nibp: { systolic: 85, diastolic: 50, mean: 61 },
    resp: { rate: 24 },
    temp: { t1: 35.8 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 30000,
      newVitals: { ecg: { rhythm: "Sinus Tachycardia", hr: 135 }, nibp: { systolic: 78, diastolic: 45, mean: 56 }, spo2: { value: 95, pi: 0.8 } },
      tutorMessage: "PAM bajó a 56 mmHg. El lactato sérico está elevado. ¿Cuál es tu siguiente intervención?"
    },
    {
      trigger: "time",
      delayMs: 60000,
      newVitals: { ecg: { rhythm: "Sinus Tachycardia", hr: 148 }, nibp: { systolic: 70, diastolic: 38, mean: 48 }, spo2: { value: 93, pi: 0.5 }, resp: { rate: 28 } },
      tutorMessage: "Hipotensión severa. PAM < 50 mmHg. El paciente está en shock descompensado. Prioriza reposición de volumen."
    }
  ],
  interventions: [
    {
      id: "int-bolus-cristaloide",
      label: "Bolo Ringer Lactato 1000ml",
      category: "fluids",
      expectedEffect: { ecg: { rhythm: "Sinus Tachycardia", hr: 105 }, nibp: { systolic: 100, diastolic: 65, mean: 76 }, spo2: { value: 97, pi: 2.0 } },
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Respuesta positiva a volumen. PAM > 65 mmHg. Recuerda la regla 1:1:1 (eritrocitos, plasma, plaquetas) si persiste sangrado activo."
    },
    {
      id: "int-noradrenalina",
      label: "Noradrenalina 0.1 mcg/kg/min",
      category: "drugs",
      expectedEffect: { ecg: { rhythm: "Sinus Tachycardia", hr: 148 }, nibp: { systolic: 110, diastolic: 70, mean: 83 }, spo2: { value: 96 } },
      timeToEffectMs: 5000,
      priority: 3,
      isCorrect: false,
      feedback: "¡Precaución! El uso de vasopresores en hipovolemia no corregida puede empeorar la isquemia tisular. Primero asegura volumen intravascular."
    },
    {
      id: "int-pak-globulos",
      label: "Transfusión 2 UI Glóbulos Rojos",
      category: "fluids",
      expectedEffect: { ecg: { rhythm: "Sinus Tachycardia", hr: 98 }, nibp: { systolic: 108, diastolic: 68, mean: 81 }, spo2: { value: 98, pi: 2.5 } },
      timeToEffectMs: 15000,
      priority: 2,
      isCorrect: true,
      feedback: "Corrección del transporte de oxígeno. Monitorea el PI: valores > 2.4% indican coherencia hemodinámica preservada."
    },
    {
      id: "int-rotem",
      label: "Solicitar ROTEM/TEG",
      category: "monitoring",
      expectedEffect: {},
      timeToEffectMs: 0,
      priority: 2,
      isCorrect: true,
      feedback: "Buena decisión. La tromboelastometría guía la transfusión dirigida por factores y reduce la mortalidad en hemorragia masiva."
    }
  ],
  debrief: {
    learningObjectives: [
      "Reconocimiento precoz del shock hipovolémico",
      "Priorización de reposición con cristaloides",
      "Interpretación del índice de perfusión (PI)"
    ],
    keyTeachingPoints: [
      "PAM meta > 65 mmHg",
      "PI < 2.4% indica hipoperfusión",
      "Cristaloides iniciales 30 mL/kg",
      "Evitar vasopresores sin volumen"
    ],
    commonErrors: [
      "Uso precoz de vasopresores",
      "No reconocer la gravedad del sangrado",
      "Subestimar el lactato elevado"
    ],
    tutorClosingScript: "El paciente responde inicialmente a volumen. Recuerda: en shock hemorrágico, controlar la fuente del sangrado es prioritario. La coherencia hemodinámica (PAM + PI normal) es el objetivo."
  }
};

export const intoxicacionCO: ClinicalCase = {
  metadata: {
    id: "intoxicacion-co-01",
    title: "Intoxicación por Monóxido de Carbono",
    category: "toxicological",
    severity: "critical",
    season: "autumn-winter",
    version: "1.0.0",
    references: ["Manual Clínico para Simulación: Intoxicación por CO", "Consenso Universitario"],
    tags: ["co", "intoxicacion", "incendio", "neurotoxicidad"],
  },
  patient: { age: 32, weight: 70, sex: "F", history: ["Rescatada de incendio en ambiente cerrado"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Sinus Rhythm", hr: 110, st: 0.1 },
    spo2: { value: 98, pi: 3.0 },
    nibp: { systolic: 130, diastolic: 85, mean: 100 },
    resp: { rate: 22 },
    temp: { t1: 36.5 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 45000,
      newVitals: { ecg: { rhythm: "Sinus Tachycardia", hr: 128 }, spo2: { value: 97 }, nibp: { systolic: 118, diastolic: 75, mean: 89 }, resp: { rate: 26 } },
      tutorMessage: "Paciente presenta cefalea intensa, náuseas y desorientación. La SpO2 por pulsioximetría es engañosa: no discrimina COHb. Piensa en el diagnóstico."
    },
    {
      trigger: "time",
      delayMs: 90000,
      newVitals: { ecg: { rhythm: "Sinus Tachycardia", hr: 140 }, spo2: { value: 96 }, nibp: { systolic: 105, diastolic: 65, mean: 78 }, resp: { rate: 30 } },
      tutorMessage: "Aparece amaurosis (ceguera cortical) y mutismo. Son signos neurológicos graves por intoxicación por CO. Requiere oxígeno hiperbárico URGENTE."
    }
  ],
  interventions: [
    {
      id: "int-co-oximetria",
      label: "Solicitar Co-Oximetría",
      category: "monitoring",
      expectedEffect: {},
      timeToEffectMs: 0,
      priority: 1,
      isCorrect: true,
      feedback: "Correcto. Los oxímetros convencionales no diferencian oxihemoglobina de carboxihemoglobina. La co-oximetría es mandatoria para confirmar el diagnóstico."
    },
    {
      id: "int-oxigeno-alto-flujo",
      label: "Oxígeno por Máscara con Reservorio 15 L/min",
      category: "ventilation",
      expectedEffect: { ecg: { rhythm: "Sinus Rhythm", hr: 100 }, spo2: { value: 99 }, nibp: { systolic: 125, diastolic: 80, mean: 95 }, resp: { rate: 18 } },
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Excelente. El oxígeno al 100% reduce la vida media de la COHb de 4-6 horas a 40-80 minutos. Pero si hay síntomas neurológicos, esto no es suficiente."
    },
    {
      id: "int-ohb",
      label: "Derivar a Oxígeno Hiperbárico (OHB)",
      category: "procedure",
      expectedEffect: { ecg: { rhythm: "Sinus Rhythm", hr: 88 }, spo2: { value: 100 }, nibp: { systolic: 120, diastolic: 80, mean: 93 }, resp: { rate: 16 } },
      timeToEffectMs: 30000,
      priority: 1,
      isCorrect: true,
      feedback: "Decisión correcta. OHB a 2.4 ATA por 60 minutos. El objetivo es rescatar la zona de penumbra isquémica. Recuerda que el llanto post-sesión es un indicador de buen pronóstico."
    },
    {
      id: "int-rmn-flair",
      label: "Solicitar RMN con secuencia FLAIR",
      category: "monitoring",
      expectedEffect: {},
      timeToEffectMs: 0,
      priority: 2,
      isCorrect: true,
      feedback: "La RMN FLAIR evalúa hiperintensidad en ganglios basales (putamen, globo pálido). La espectroscopía puede mostrar elevación de lactato como marcador pronóstico."
    }
  ],
  debrief: {
    learningObjectives: [
      "Reconocer la intoxicación por CO como 'el gran simulador'",
      "Entender las limitaciones de la pulsioximetría",
      "Indicar oxígeno hiperbárico ante síntomas neurológicos"
    ],
    keyTeachingPoints: [
      "COHb normal NO descarta intoxicación grave",
      "SpO2 por pulsioximetría es engañosa",
      "OHB a 2.4 ATA por 60 minutos",
      "Síndrome neurológico tardío puede aparecer hasta 40 días después"
    ],
    commonErrors: [
      "Confiar en la pulsioximetría normal",
      "No indicar OHB por demora en el diagnóstico",
      "No reconocer amaurosis como signo de gravedad"
    ],
    tutorClosingScript: "La intoxicación por CO requiere alta sospecha clínica. Recuerda: el paciente puede tener SpO2 normal y estar gravemente hipóxico. La co-oximetría y el OHB salvan vidas y previenen el síndrome neurológico tardío."
  }
};

export const bronquiolitis: ClinicalCase = {
  metadata: {
    id: "bronquiolitis-01",
    title: "Bronquiolitis Grave en Lactante",
    category: "pediatric",
    severity: "critical",
    season: "autumn-winter",
    version: "1.0.0",
    references: ["Informe Clínico: Abordaje Integral de Emergencias Respiratorias Pediátricas", "Ley 15.465 Notificaciones Médicas Obligatorias"],
    tags: ["pediatria", "respiratorio", "bronquiolitis", "viral"],
  },
  patient: { age: 0.33, weight: 6, sex: "M", history: ["Lactante de 4 meses", "Parto vaginal sin complicaciones"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Sinus Tachycardia", hr: 155 },
    spo2: { value: 88, pi: 1.8 },
    nibp: { systolic: 82, diastolic: 48, mean: 59 },
    resp: { rate: 65 },
    temp: { t1: 37.8 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 40000,
      newVitals: { ecg: { rhythm: "Sinus Tachycardia", hr: 168 }, spo2: { value: 85, pi: 1.2 }, nibp: { systolic: 75, diastolic: 42, mean: 53 }, resp: { rate: 72 } },
      tutorMessage: "TAL score: 10/12 (grave). El lactante presenta tiraje universal, sibilancias audibles sin estetoscopio y SatO2 ≤ 85%. Administra oxígeno INMEDIATAMENTE."
    }
  ],
  interventions: [
    {
      id: "int-oxigeno-lactante",
      label: "Oxígeno por Campana cefálica 40%",
      category: "ventilation",
      expectedEffect: { spo2: { value: 94, pi: 2.5 }, ecg: { rhythm: "Sinus Tachycardia", hr: 150 }, resp: { rate: 58 } },
      timeToEffectMs: 3000,
      priority: 1,
      isCorrect: true,
      feedback: "Oxígeno administrado correctamente. SatO2 mejoró a 94%. Recuerda que el TAL ≥ 7 es indicación de oxígeno inmediato según el algoritmo de Hospitalización Abreviada."
    },
    {
      id: "int-salbutamol-lactante",
      label: "Salbutamol 2 puff con Aerocámara",
      category: "drugs",
      expectedEffect: { ecg: { rhythm: "Sinus Tachycardia", hr: 158 }, resp: { rate: 55 } },
      timeToEffectMs: 10000,
      priority: 2,
      isCorrect: true,
      feedback: "Broncodilatador administrado. Evaluar en 20 minutos. Si TAL sigue ≥ 5, repetir series cada 20 minutos y considerar metilprednisona."
    },
    {
      id: "int-derivar-uci",
      label: "Derivar a UCI Pediátrica",
      category: "procedure",
      expectedEffect: {},
      timeToEffectMs: 0,
      priority: 1,
      isCorrect: true,
      feedback: "Derivación indicada: TAL ≥ 9 requiere traslado inmediato con oxígeno, hidratación y broncodilatadores. Notificar al SNVS como IRAGI."
    },
    {
      id: "int-vni",
      label: "Ventilación No Invasiva (CPAP nasal)",
      category: "ventilation",
      expectedEffect: { spo2: { value: 97, pi: 3.0 }, ecg: { rhythm: "Sinus Rhythm", hr: 140 }, resp: { rate: 45 } },
      timeToEffectMs: 10000,
      priority: 2,
      isCorrect: true,
      feedback: "CPAP nasal indicado. El soporte respiratorio no invasivo evita la intubación en muchos casos de bronquiolitis grave. Monitorear driving pressure < 15 cmH2O."
    }
  ],
  debrief: {
    learningObjectives: [
      "Evaluar severidad de bronquiolitis con escala de TAL",
      "Indicar oxígeno según score",
      "Reconocer criterios de internación y derivación"
    ],
    keyTeachingPoints: [
      "TAL ≥ 7: oxígeno inmediato",
      "TAL ≥ 9: derivación urgente",
      "Salbutamol en SBO, no en bronquiolitis pura",
      "Notificación obligatoria al SNVS"
    ],
    commonErrors: [
      "No administrar oxígeno por esperar saturación más baja",
      "Confundir bronquiolitis con SBO/asma",
      "No considerar riesgo social como criterio de internación"
    ],
    tutorClosingScript: "La bronquiolitis grave requiere acción rápida. Evalúa con TAL, oxigena, broncodilata si hay componente obstructivo, y deriva a tiempo. La Campaña de Invierno exige vigilancia epidemiológica estricta."
  }
};

export const shockDistributivo: ClinicalCase = {
  metadata: {
    id: "shock-distributivo-01",
    title: "Shock Distributivo por Mastocitosis (Anafilaxia)",
    category: "cardio",
    severity: "critical",
    season: "all-year",
    version: "1.0.0",
    references: ["Informe Clínico Avanzado: Monitorización Multimodal", "Guía de Anafilaxia"],
    tags: ["shock", "distributivo", "mastocitosis", "anafilaxia"],
  },
  patient: { age: 28, weight: 65, sex: "F", history: ["Mastocitosis cutánea conocida", "Signo de Darier (+)"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Sinus Tachycardia", hr: 135 },
    spo2: { value: 94, pi: 1.5 },
    nibp: { systolic: 78, diastolic: 45, mean: 56 },
    resp: { rate: 26 },
    temp: { t1: 36.2 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 20000,
      newVitals: { ecg: { rhythm: "Sinus Tachycardia", hr: 148 }, spo2: { value: 91, pi: 0.9 }, nibp: { systolic: 65, diastolic: 35, mean: 45 }, resp: { rate: 30 } },
      tutorMessage: "Hipotensión severa con rubor facial y urticaria generalizada. Sospecha anafilaxia por mastocitosis. La triptasa plasmática debe medirse en las primeras 4 horas."
    }
  ],
  interventions: [
    {
      id: "int-adrenalina-im",
      label: "Adrenalina 0.3 mg IM (EPIPEN)",
      category: "drugs",
      expectedEffect: { ecg: { rhythm: "Sinus Rhythm", hr: 110 }, nibp: { systolic: 105, diastolic: 68, mean: 80 }, spo2: { value: 97, pi: 2.8 }, resp: { rate: 20 } },
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Adrenalina IM es el tratamiento de primera línea en anafilaxia. Actúa sobre receptores alfa-1 (vasoconstricción) y beta-2 (broncodilatación). Efecto observado: PAM > 65 mmHg."
    },
    {
      id: "int-levocetirizina",
      label: "Levocetirizina 10 mg + Metilprednisona 1 mg/kg",
      category: "drugs",
      expectedEffect: { ecg: { rhythm: "Sinus Rhythm", hr: 100 } },
      timeToEffectMs: 15000,
      priority: 2,
      isCorrect: true,
      feedback: "Antihistamínicos y corticoides previenen la reacción bifásica. La triptasa sérica se toma en las primeras 4 horas. Recuerda: en mastocitosis, la sobrevida depende del reconocimiento precoz."
    },
    {
      id: "int-cristaloide-mastocito",
      label: "Bolo Ringer Lactato 500ml",
      category: "fluids",
      expectedEffect: { nibp: { systolic: 95, diastolic: 60, mean: 71 } },
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Volumen adecuado. En shock distributivo, la reposición con cristaloides es necesaria pero no suficiente sin adrenalina."
    },
    {
      id: "int-noradrenalina-shock",
      label: "Noradrenalina 0.05 mcg/kg/min",
      category: "drugs",
      expectedEffect: { ecg: { rhythm: "Sinus Tachycardia", hr: 145 }, nibp: { systolic: 112, diastolic: 72, mean: 85 } },
      timeToEffectMs: 5000,
      priority: 3,
      isCorrect: false,
      feedback: "Los vasopresores son segunda línea en anafilaxia. Primero adrenalina IM y volumen. Si hay hipotensión refractaria, considera adrenalina en bomba de infusión."
    }
  ],
  debrief: {
    learningObjectives: [
      "Diagnóstico diferencial de shock distributivo",
      "Reconocimiento de anafilaxia en paciente con mastocitosis",
      "Secuencia correcta de tratamiento"
    ],
    keyTeachingPoints: [
      "Adrenalina IM es primera línea",
      "Triptasa plasmática en primeras 4 horas",
      "PAM > 65 mmHg con adrenalina + volumen",
      "Mastocitosis: signo de Darier (+)"
    ],
    commonErrors: [
      "No usar adrenalina por temor a taquicardia",
      "Usar vasopresores como primera línea",
      "No medir triptasa",
      "No antihistamínicos para prevenir reacción bifásica"
    ],
    tutorClosingScript: "En anafilaxia, la adrenalina IM salva vidas. No la demores. El PI y la PAM te guían en la reanimación. La mastocitosis es un diagnóstico de alta sospecha en shock con rash."
  }
};

export const neumoniaDerrame: ClinicalCase = {
  metadata: {
    id: "neumonia-derrame-01",
    title: "Neumonía Adquirida en la Comunidad con Derrame Pleural",
    category: "respiratory",
    severity: "urgent",
    season: "autumn-winter",
    version: "1.0.0",
    references: ["Informe Clínico: Abordaje Integral de Emergencias Respiratorias Pediátricas"],
    tags: ["neumonia", "derrame", "respiratorio", "infeccioso"],
  },
  patient: { age: 5, weight: 18, sex: "F", history: ["Fiebre 39°C por 3 días", "Tos productiva", "Dolor pleurítico"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Sinus Tachycardia", hr: 130 },
    spo2: { value: 91, pi: 2.0 },
    nibp: { systolic: 98, diastolic: 60, mean: 72 },
    resp: { rate: 42 },
    temp: { t1: 38.9 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 50000,
      newVitals: { ecg: { rhythm: "Sinus Tachycardia", hr: 142 }, spo2: { value: 87, pi: 1.5 }, nibp: { systolic: 92, diastolic: 55, mean: 67 }, resp: { rate: 50 }, temp: { t1: 39.5 } },
      tutorMessage: "SatO2 persistente ≤ 87% pese a oxígeno. El derrame pleural progresa. Evalúa criterios de internación en 2do nivel y considera drenaje."
    }
  ],
  interventions: [
    {
      id: "int-amoxicilina",
      label: "Amoxicilina 80 mg/kg/día",
      category: "drugs",
      expectedEffect: { temp: { t1: 37.8 }, ecg: { rhythm: "Sinus Tachycardia", hr: 118 }, resp: { rate: 32 } },
      timeToEffectMs: 30000,
      priority: 1,
      isCorrect: true,
      feedback: "Amoxicilina a dosis correcta (80-100 mg/kg/día). Es el tratamiento empírico de primera línea para NAC. Evalúa respuesta en 48 horas."
    },
    {
      id: "int-derivacion-tercer-nivel",
      label: "Derivar a 3er Nivel - Drenaje Pleural",
      category: "procedure",
      expectedEffect: { spo2: { value: 95, pi: 2.8 }, ecg: { rhythm: "Sinus Rhythm", hr: 105 }, resp: { rate: 30 } },
      timeToEffectMs: 20000,
      priority: 1,
      isCorrect: true,
      feedback: "Derivación indicada: neumonía multifocal con derrame pleural + saturación ≤ 88% pese a oxígeno + fiebre persistente. El drenaje pleural acelera la recuperación."
    },
    {
      id: "int-immunofluorescencia",
      label: "Panel Viral por Inmunofluorescencia",
      category: "monitoring",
      expectedEffect: {},
      timeToEffectMs: 0,
      priority: 2,
      isCorrect: true,
      feedback: "Todo paciente internado por NAC debe tener panel viral para implementar medidas de bioseguridad. Evalúa VSR, Influenza, Adenovirus."
    }
  ],
  debrief: {
    learningObjectives: [
      "Diagnóstico y tratamiento de NAC con derrame",
      "Criterios de internación en 2do y 3er nivel",
      "Uso racional de antibióticos"
    ],
    keyTeachingPoints: [
      "Amoxicilina 80-100 mg/kg/día primera línea",
      "Derrame pleural + saturación ≤ 88% → drenaje",
      "Inmunofluorescencia para virus respiratorios",
      "Notificación obligatoria al SNVS"
    ],
    commonErrors: [
      "No derivar a tiempo con derrame pleural",
      "Usar antibióticos de amplio espectro innecesariamente",
      "No considerar etiología viral"
    ],
    tutorClosingScript: "La NAC con derrame pleural requiere manejo escalonado: antibiótico empírico, oxígeno, y derivación oportuna si hay fallo de respuesta. El drenaje pleural es seguro y efectivo."
  }
};

export const ALL_SCENARIOS: ClinicalCase[] = [
  shockHipovolemico,
  intoxicacionCO,
  bronquiolitis,
  shockDistributivo,
  neumoniaDerrame,
];

export const ALARM_SOUND = null;
