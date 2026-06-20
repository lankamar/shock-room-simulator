import { ClinicalCase } from '../schemas/case.schema';

export const shockCase: ClinicalCase = {
  metadata: {
    id: "shock-hipovolemico",
    title: "Módulo 4: Shock Hipovolémico por Hemorragia",
    category: "cardio",
    severity: "critical",
    version: "2.0.0",
    references: ["Especificación Técnica de Simulación", "Surviving Sepsis"],
  },
  patient: { age: 45, weight: 75, sex: "M", history: ["Colisión de motocicleta"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia Sinusal", hr: 115 }, // Compensado
    spo2: { value: 96, pi: 2.0 },
    nibp: { systolic: 110, diastolic: 75, mean: 86 },
    etco2: { value: 34 },
    resp: { rate: 22 },
    temp: { t1: 36.0 },
    labs: { lactate: 3.5 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 45000,
      newVitals: {
        ecg: { rhythm: "Taquicardia severa", hr: 142 },
        nibp: { systolic: 81, diastolic: 40, mean: 53 },
        spo2: { value: 92, pi: 1.2 },
        etco2: { value: 20 },
        resp: { rate: 32 },
        labs: { lactate: 6.0 }
      },
      tutorMessage: "Evaluación Nivel 2: Los mecanismos compensadores han claudicado. Se evidencia shock descompensado con hipotensión severa (PAM < 65 mmHg), caída brusca de EtCO2 y PI < 1.5%. Requiere expansión volumétrica controlada inmediata."
    }
  ],
  interventions: [
    {
      id: "int-bolus-ringer",
      label: "Bolo Ringer Lactato (Expansión volumétrica)",
      category: "fluids",
      expectedEffect: {
        ecg: { rhythm: "Ritmo Sinusal", hr: 105 },
        nibp: { systolic: 105, diastolic: 66, mean: 79 },
        spo2: { value: 97, pi: 2.5 },
        etco2: { value: 32 },
        labs: { lactate: 3.0 }
      },
      timeToEffectMs: 4000,
      priority: 1,
      isCorrect: true,
      feedback: "Intervención hemodinámicamente efectiva. Se ha restaurado la precarga y mejorado el aclaramiento de lactato. La solución cristaloide balanceada ha provenido la acidosis hiperclorémica."
    },
    {
      id: "int-noradrenalina",
      label: "Noradrenalina 0.1 mcg/kg/min temprana",
      category: "drugs",
      expectedEffect: {
        ecg: { rhythm: "Taquicardia extrema con hipoperfusión", hr: 150 },
        nibp: { systolic: 120, diastolic: 80, mean: 93 },
        spo2: { value: 90, pi: 0.5 },
        etco2: { value: 15 },
        labs: { lactate: 8.5 }
      },
      timeToEffectMs: 4000,
      priority: 3,
      isCorrect: false,
      feedback: "ERROR CRÍTICO: La infusión de vasopresores en un estado de hipovolemia absoluta sin expansión volumétrica previa agrava drásticamente la isquemia tisular esplácnica y renal. Índice pletismográfico en deterioro progresivo (0.5%)."
    }
  ],
  debrief: {
    learningObjectives: ["Monitorizar PI y Lactato", "Evitar vasopresores sin expansión volumétrica"],
    keyTeachingPoints: ["El EtCO2 bajo indica mala perfusión pulmonar", "El PI cae en alta descarga adrenérgica"],
    commonErrors: ["Uso precoz de noradrenalina"],
    tutorClosingScript: "El análisis sistémico evidencia la estabilización transitoria de un shock compensado. La disociación entre tensión arterial normal y los marcadores de hipoperfusión (PI y Lactato) resultan diagnósticos."
  }
};

export const coCase: ClinicalCase = {
  metadata: {
    id: "intoxicacion-co",
    title: "Módulo 1: Intoxicación Grave por Monóxido de Carbono (CO)",
    category: "toxicological",
    severity: "critical",
    version: "2.0.0",
    references: ["Especificación Técnica de Simulación"],
  },
  patient: { age: 32, weight: 70, sex: "F", history: ["Inconsciente, hallada en ambiente cerrado en invierno"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia Sinusal leve", hr: 108 },
    spo2: { value: 98, pi: 1.5 }, // Falsa Oximetría
    nibp: { systolic: 120, diastolic: 70, mean: 86 },
    resp: { rate: 21 },
    temp: { t1: 36.5 },
    labs: { cohb: 28 }, // Moderado a grave
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 35000,
      newVitals: {
        ecg: { rhythm: "Taquicardia con infradesnivel ST", hr: 155 },
        nibp: { systolic: 90, diastolic: 50, mean: 63 },
        spo2: { value: 98, pi: 0.8 },
        resp: { rate: 28 },
        labs: { cohb: 36 }
      },
      tutorMessage: "Pista Nivel 1 (Observacional): Se constata una discrepancia clínica crítica. A pesar de registrar una SpO2 de 98%, la paciente presenta taquicardia severa y signos de hipoxia tisular. La oximetría convencional no discrimina Oxi-hemoglobina de Carboxihemoglobina."
    },
    {
      trigger: "time",
      delayMs: 60000,
      newVitals: {
        ecg: { rhythm: "Asistolia / Paro", hr: 0 },
        nibp: { systolic: 0, diastolic: 0, mean: 0 },
        spo2: { value: 0, pi: 0 },
        resp: { rate: 0 },
        labs: { cohb: 45 }
      },
      tutorMessage: "PENALIZACIÓN (Nivel 3 - Falla Terapeútica): La hipoxia tisular sostenida indujo paro cardiorrespiratorio asfíctico. La omisión de oxigenoterapia normobárica al 100% ha imposibilitado el desplazamiento alostérico del monóxido de carbono."
    }
  ],
  interventions: [
    {
      id: "int-oxigeno-100",
      label: "Oxigenoterapia Máscara Reservorio 100%",
      category: "ventilation",
      expectedEffect: {
        ecg: { rhythm: "Ritmo Sinusal", hr: 85 },
        nibp: { systolic: 118, diastolic: 70, mean: 86 },
        spo2: { value: 100, pi: 1.8 },
        resp: { rate: 16 },
        labs: { cohb: 12 }
      },
      timeToEffectMs: 4000,
      priority: 1,
      isCorrect: true,
      feedback: "Intervención correcta. La entrega de Oxígeno al 100% ha acelerado el aclaramiento de COHb reduciendo significativamente su vida media biológica."
    }
  ],
  debrief: {
    learningObjectives: ["Identificar la falsa lectura del pulsioxímetro en COHb"],
    keyTeachingPoints: ["SpO2 normal no descarta intoxicación por CO"],
    commonErrors: ["Confiar en la lectura de SpO2"],
    tutorClosingScript: "Conclusión de caso: La clave diagnóstica consistió en identificar la imposibilidad de la oximetría convencional para detectar hipoxia celular por monóxido de carbono."
  }
};

export const bronchiolitisCase: ClinicalCase = {
  metadata: {
    id: "bronquiolitis",
    title: "Módulo 2: Bronquiolitis Grave en Lactantes (VRS)",
    category: "pediatric",
    severity: "critical",
    version: "2.0.0",
    references: ["Escala de Tal Modificada", "Especificación Técnica"],
  },
  patient: { age: 0.5, weight: 7.2, sex: "M", history: ["Lactante de 6 meses, rechazo de ingesta."] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia infantil", hr: 165 },
    spo2: { value: 87, pi: 1.1 },
    nibp: { systolic: 86, diastolic: 52, mean: 63 },
    resp: { rate: 75 },
    temp: { t1: 37.8 },
    activeAlarms: [] // Evaluados por store
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 30000,
      newVitals: {
        ecg: { rhythm: "Bradicardia Extrema", hr: 55 },
        nibp: { systolic: 60, diastolic: 30, mean: 40 },
        spo2: { value: 72, pi: 0.5 },
        resp: { rate: 10 } // Apneas
      },
      tutorMessage: "PENALIZACIÓN: El paciente cursa con Síndrome de Claudicación Respiratoria Inminente Aguda (CRIA). El trabajo respiratorio excesivo y sostenido desencadenó apneas y respuesta vagal bradicárdica grave."
    }
  ],
  interventions: [
    {
      id: "int-alto-flujo",
      label: "Cánula Nasal de Alto Flujo (CNAF)",
      category: "ventilation",
      expectedEffect: {
        ecg: { rhythm: "Taquicardia Sinusal leve", hr: 125 },
        nibp: { systolic: 92, diastolic: 58, mean: 69 },
        spo2: { value: 95, pi: 1.6 },
        resp: { rate: 45 }
      },
      timeToEffectMs: 4000,
      priority: 1,
      isCorrect: true,
      feedback: "Intervención terapéutica eficaz. El flujo alto ha generado presión positiva al final de la espiración (PEEP), reclutando unidades alveolares y previniendo la fatiga neuromuscular respiratoria."
    }
  ],
  debrief: { learningObjectives: [], keyTeachingPoints: [], commonErrors: [], tutorClosingScript: "" }
};

export const pneumoniaAdultCase: ClinicalCase = {
  metadata: {
    id: "neumonia-sdra",
    title: "Módulo 3: Neumonía Adquirida en la Comunidad (NAC) con progresión a SDRA",
    category: "respiratory",
    severity: "critical",
    version: "2.0.0",
    references: ["Índice ROX", "Especificación Técnica"],
  },
  patient: { age: 58, weight: 80, sex: "M", history: ["NAC, uso prolongado de CNAF fallida"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia Sinusal", hr: 125 },
    spo2: { value: 84, pi: 1.0 },
    nibp: { systolic: 110, diastolic: 65, mean: 80 },
    etco2: { value: 45 },
    resp: { rate: 38 },
    temp: { t1: 39.0 },
    labs: { roxIndex: 2.2 }, // SpO2(84)/FiO2(1.0)/FR(38) = 2.21
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 35000,
      newVitals: {
        ecg: { rhythm: "Arritmia Ventricular", hr: 145 },
        spo2: { value: 75, pi: 0.6 },
        resp: { rate: 45 },
        nibp: { systolic: 90, diastolic: 50, mean: 63 }
      },
      tutorMessage: "Pista Nivel 3 (Directiva): Fracaso inminente de soporte ventilatorio no invasivo constatado por Índice ROX crítico inferior a 4.88. Presencia de fatiga diafragmática inminente. La intubación endotraqueal programada es requerida de inmediato."
    }
  ],
  interventions: [
    {
      id: "int-intub-protectora",
      label: "Ventilación Protectora (Driving Press < 15)",
      category: "ventilation",
      expectedEffect: {
        ecg: { rhythm: "Ritmo sinusal", hr: 95 },
        spo2: { value: 92, pi: 1.5 },
        etco2: { value: 40 },
        resp: { rate: 20 },
        nibp: { systolic: 115, diastolic: 70, mean: 85 }
      },
      timeToEffectMs: 4000,
      priority: 1,
      isCorrect: true,
      feedback: "Ventilación protectora exitosa. Evitaste el volutrauma/barotrauma limitando la presión de conducción."
    },
    {
      id: "int-intub-alta-pres",
      label: "Intubación Vol. Alto (Driving Press > 15)",
      category: "ventilation",
      expectedEffect: {
        ecg: { rhythm: "Taquicardia compensatoria", hr: 135 },
        spo2: { value: 80 },
        etco2: { value: 65 }, // Hipercapnia
        resp: { rate: 12 },
        nibp: { systolic: 95, diastolic: 55, mean: 68 }
      },
      timeToEffectMs: 4000,
      priority: 3,
      isCorrect: false,
      feedback: "PENALIZACIÓN (Daño Pulmonar Inducido por Ventilación Mecánica): La instauración de presiones de conducción por sobre los umbrales fisiológicos generó sobredistensión, volutrauma pulmonar e hipercapnia permisiva fallida."
    }
  ],
  debrief: { learningObjectives: [], keyTeachingPoints: [], commonErrors: [], tutorClosingScript: "" }
};

export const cadCase: ClinicalCase = {
  metadata: {
    id: "pediatric-dka",
    title: "Módulo 7: Cetoacidosis Diabética (CAD) en Pediatría",
    category: "metabolic",
    severity: "urgent",
    version: "2.0.0",
    references: ["ISPAD Clinical Practice Consensus Guidelines 2024"],
  },
  patient: { age: 8, weight: 25, sex: "F", history: ["Polidipsia, poliuria y pérdida de peso"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia Sinusal", hr: 142 },
    spo2: { value: 98, pi: 1.5 },
    nibp: { systolic: 90, diastolic: 50, mean: 63 },
    etco2: { value: 18 },
    resp: { rate: 32 },
    temp: { t1: 37.2 },
    labs: {
      pH: 7.08,
      pCO2: 18,
      hco3: 8,
      baseExcess: -20,
      lactate: 2.1,
      sodium: 130,
      potassium: 5.2,
      chloride: 98,
      glucose: 520,
      ketones: 6.5,
      anionGap: 24
    },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 15000,
      newVitals: {
        ecg: { rhythm: "Taquicardia Sinusal", hr: 145 },
        resp: { rate: 34 }
      },
      tutorMessage: "Nivel 1 (Observacional): La paciente presenta respiración profunda y rápida, mucosas secas, taquicardia y dolor abdominal. La glucemia está muy elevada y el sensorio comienza a enlentecerse."
    },
    {
      trigger: "time",
      delayMs: 30000,
      newVitals: {
        nibp: { systolic: 88, diastolic: 48, mean: 61 },
      },
      tutorMessage: "Nivel 2 (Contextual): El anión gap está abierto, el bicarbonato es bajo y la corrección demasiado rápida podría aumentar el riesgo de edema cerebral."
    }
  ],
  interventions: [
    {
      id: "int-fluido-isotonico-lento",
      label: "Cristaloides Isotónicos 10-20 ml/kg (lento)",
      category: "fluids",
      expectedEffect: {
        ecg: { rhythm: "Taquicardia Leve", hr: 115 },
        nibp: { systolic: 105, diastolic: 65, mean: 78 },
        spo2: { value: 98, pi: 1.8 },
        etco2: { value: 22 },
        resp: { rate: 26 },
        labs: { pH: 7.15, glucose: 480, sodium: 132 }
      },
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Expansión volumétrica inicial correcta. En pediatría la rehidratación gradual protege de oscilaciones osmolares bruscas, reduciendo el riesgo de edema cerebral."
    },
    {
      id: "int-insulina-infusion",
      label: "Insulina Regular Infusión Continua (0.05-0.1 U/kg/h) tras 1h",
      category: "drugs",
      expectedEffect: {
        labs: { pH: 7.25, glucose: 350, hco3: 12, anionGap: 16 }
      },
      timeToEffectMs: 6000,
      priority: 2,
      isCorrect: true,
      feedback: "Infusión de insulina iniciada correctamente de forma diferida. Previene las caídas agudas de osmolaridad plasmática intempestivas."
    },
    {
      id: "int-insulina-bolus",
      label: "Insulina Bolus IV",
      category: "drugs",
      expectedEffect: {
        ecg: { rhythm: "Bradicardia Severa (Cushing)", hr: 45 },
        nibp: { systolic: 140, diastolic: 90, mean: 106 },
        resp: { rate: 12 },
        labs: { pH: 7.0, glucose: 250, sodium: 125 }
      },
      timeToEffectMs: 4000,
      priority: 3,
      isCorrect: false,
      feedback: "¡ERROR GRAVE! El bolo IV de insulina está proscrito en pediatría. El descenso brusco de glucosa intra y extracelular condiciona pasaje rápido de agua neuronal induciendo Edema Cerebral."
    },
    {
      id: "int-bicarbonato",
      label: "Bicarbonato de Sodio IV 1 mEq/kg",
      category: "drugs",
      expectedEffect: {},
      timeToEffectMs: 4000,
      priority: 3,
      isCorrect: false,
      feedback: "El uso de bicarbonato incrementa riesgo de acidosis paradójica intracelular y edema cerebral. Solo justificado en hiperkalemia crítica o pH < 6.9 con colapso cardiogénico."
    }
  ],
  debrief: { 
    learningObjectives: [
      "Comprender la restricción absoluta del bolo de Insulina IV en CAD Pediátrica.",
      "Identificar el riesgo inminente de Edema Cerebral ante correcciones rápidas de deshidratación u osmolaridad.",
      "Manejar el anión gap y la corrección lenta del volumen extracelular."
    ], 
    keyTeachingPoints: [
      "El Edema Cerebral ocurre principal y trágicamente en pacientes pediátricos en tratamiento por CAD.",
      "La fluidoterapia se divide en un bolo inicial razonable (10-20ml/kg) y reposición en el lapso de 24 a 48 hs.",
      "No iniciar insulina si el potasio sérico es < 3.3 mEq/L."
    ], 
    commonErrors: [
      "Proporcionar bolos de Insulina IV.",
      "Administrar bolos generosos repetidos de fluidos descendiendo la glucemia rápido."
    ], 
    tutorClosingScript: "El pilar central del tratamiento pediátrico en la Cetoacidosis radicará eternamente en descender la osmolaridad de una forma parsimoniosa. Respetar la ventana de una a dos horas sin insulina revierte eficazmente el riesgo de edema cerebral." 
  }
};

export const propionicAcidemiaCase: ClinicalCase = {
  metadata: {
    id: "acidemia-propionica",
    title: "Módulo 3: Sepsis Neonatal vs Crisis Metabólica",
    category: "metabolic",
    severity: "critical",
    version: "2.0.0",
    references: ["Manejo de Acidemia Propiónica Neonatal", "Hiperammonemia"],
  },
  patient: { age: 0.1, weight: 3.5, sex: "M", history: ["Neonato, 4 días de vida. Letargia, rechazo al alimento, vómitos."] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia Sinusal", hr: 165 },
    spo2: { value: 92, pi: 1.2 },
    nibp: { systolic: 65, diastolic: 35, mean: 45 },
    etco2: { value: 25 },
    resp: { rate: 65 },
    temp: { t1: 36.2 },
    labs: { 
      pH: 7.08,
      pCO2: 25,
      hco3: 8.5,
      baseExcess: -18,
      lactate: 6.5, 
      sodium: 140,
      chloride: 104,
      anionGap: 27.5,
      ketones: 5.0, // Cetonuria
      roxIndex: 5.0 
    },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 35000,
      newVitals: {
        ecg: { rhythm: "Bradicardia por Edema Cerebral", hr: 85 },
        nibp: { systolic: 90, diastolic: 45, mean: 60 },
        spo2: { value: 85, pi: 0.9 },
        etco2: { value: 18 },
        resp: { rate: 20 },
        labs: { lactate: 8.0 }
      },
      tutorMessage: "Pista Nivel 3 (Directiva): Deterioro del sensorio por edema cerebral. Bloqueo del ciclo de la urea por propionil-CoA indujo hiperammonemia severa (>500 µg/dL). Se requiere detención absoluta de aporte proteico y terapia de reemplazo renal extracorpórea (HDFVVC) de inmediato."
    }
  ],
  interventions: [
    {
      id: "int-hdfvvc",
      label: "Hemodiafiltración Venovenosa Continua (HDFVVC)",
      category: "fluids",
      expectedEffect: {
        ecg: { rhythm: "Ritmo Sinusal", hr: 140 },
        nibp: { systolic: 70, diastolic: 40, mean: 50 },
        spo2: { value: 96, pi: 1.8 },
        etco2: { value: 35 },
        resp: { rate: 45 },
        labs: { lactate: 3.0 }
      },
      timeToEffectMs: 4000,
      priority: 1,
      isCorrect: true,
      feedback: "Intervención terapéutica correcta. La HDFVVC logra aclarar la carga exponencial de amonio. Debe continuarse soporte catabólico con carga alta en dextrosa y restricción proteica absoluta."
    },
    {
      id: "int-antibioticos-sepsis",
      label: "Protocolo Sepsis: Fluidos + Antibióticos Empíricos",
      category: "drugs",
      expectedEffect: {
        ecg: { rhythm: "Bradicardia terminal", hr: 60 },
        nibp: { systolic: 50, diastolic: 25, mean: 35 },
        spo2: { value: 70, pi: 0.4 },
        etco2: { value: 15 },
        resp: { rate: 10 },
        labs: { lactate: 10.0 }
      },
      timeToEffectMs: 4000,
      priority: 3,
      isCorrect: false,
      feedback: "PENALIZACIÓN CRÍTICA: Fallo diagnóstico. La hidratación con solución salina isotónica sin aporte calórico y omisión del hiperamoniacamiento agravó el catabolismo y desencadenó coma inducido por encefalopatía hiperammonémica refractaria."
    }
  ],
  debrief: {
    learningObjectives: ["Diferenciar Sepsis Neonatal de Error Innato del Metabolismo"],
    keyTeachingPoints: ["Trombocitopenia, Cetonuria y Acidosis Metabólica apuntan a EIM"],
    commonErrors: ["Manejarlo exclusivamente como Sepsis Bacteriana estándar"],
    tutorClosingScript: "Conclusión: La Acidemia Propiónica exige frenado de catabolismo proteico estricto. Reanimación salina estándar resulta fatal ante el aumento en la producción de amonio."
  }
};

export const anaphylaxisCase: ClinicalCase = {
  metadata: {
    id: "shock-distributivo-anafilaxia",
    title: "Módulo 5: Shock Distributivo (Anafilaxia / Activación Mastocitaria)",
    category: "toxicological",
    severity: "critical",
    version: "2.0.0",
    references: ["Guía EAACI"]
  },
  patient: { age: 25, weight: 65, sex: "F", history: ["Alergia a mariscos"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia Sinusal", hr: 130 },
    spo2: { value: 89, pi: 1.8 },
    nibp: { systolic: 70, diastolic: 40, mean: 50 },
    resp: { rate: 30 },
    temp: { t1: 36.8 },
    etco2: { value: 25 },
    labs: { lactate: 3.5 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 15000,
      newVitals: {
        ecg: { rhythm: "Taquicardia Sinusal", hr: 135 },
        nibp: { systolic: 68, diastolic: 38, mean: 48 },
        spo2: { value: 87, pi: 1.9 }
      },
      tutorMessage: "Nivel 1 (Observacional): El paciente presenta eritema generalizado, urticaria en tronco y extremidades, y se queja de picazón intensa en la garganta. La frecuencia cardíaca es de 135 lpm y la presión sistólica ha descendido a 68 mmHg (PI: 1.9%, refleja vasodilatación periférica patente)."
    },
    {
      trigger: "time",
      delayMs: 30000,
      newVitals: {
        ecg: { rhythm: "Taquicardia Sinusal", hr: 142 },
        nibp: { systolic: 62, diastolic: 35, mean: 44 },
        spo2: { value: 85, pi: 2.1 },
        resp: { rate: 35 }
      },
      tutorMessage: "Nivel 2 (Contextual): El paciente presenta signos francos de hipotensión y broncoespasmo propios de un shock distributivo anafiláctico secundario a degranulación mastocitaria. El índice de perfusión (PI) paradójicamente elevado confirma vasodilatación patológica profunda severa."
    }
  ],
  interventions: [
    {
      id: "int-adrenalina-im",
      label: "Adrenalina IM 0.5 mg",
      category: "drugs",
      expectedEffect: {
        ecg: { rhythm: "Taquicardia Leve", hr: 105 },
        spo2: { value: 95, pi: 0.9 }, // Normalization of PI
        nibp: { systolic: 110, diastolic: 65, mean: 80 },
        etco2: { value: 35 },
        resp: { rate: 20 },
        labs: { lactate: 1.5 }
      },
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Administración de Adrenalina IM correcta. Pilar fundamental del tratamiento anafiláctico. Revierte rápidamente la degranulación, la broncoconstricción (efecto beta-2) y el colapso vascular (efecto alfa-1)."
    },
    {
      id: "int-cristaloides-500",
      label: "Cristaloides 500 ml IV",
      category: "fluids",
      expectedEffect: {
        nibp: { systolic: 78, diastolic: 45, mean: 56 },
      },
      timeToEffectMs: 4000,
      priority: 2,
      isCorrect: true,
      feedback: "Reanimación con fluidos iniciada. El componente distributivo requiere soporte volumétrico, pero no reemplaza la acción indispensable de la adrenalina IM."
    },
    {
      id: "int-hidrocortisona",
      label: "Hidrocortisona 200 mg IV",
      category: "drugs",
      expectedEffect: {},
      timeToEffectMs: 6000,
      priority: 3,
      isCorrect: true,
      feedback: "Corticoide administrado. Útil para prevenir la respuesta bifásica diferida, pero sin efecto hemodinámico ni broncodilatador inmediato comprobado para el shock en curso."
    },
    {
      id: "int-difenhidramina",
      label: "Difenhidramina 50 mg IV",
      category: "drugs",
      expectedEffect: {},
      timeToEffectMs: 6000,
      priority: 3,
      isCorrect: true,
      feedback: "Antihistamínico H1 administrado. Útil únicamente para control de síntomas cutáneos pruriginosos, ineficaz para revertir el broncoespasmo o el colapso vascular."
    }
  ],
  debrief: { 
    learningObjectives: [
      "Reconocer el patrón hemodinámico del shock distributivo anafiláctico con PI elevado (vasodilatación).",
      "Priorizar la Adrenalina IM como pilar de tratamiento sin demoras logísticas.",
      "Comprender la función secundaria diferida de glucocorticoides y antihistamínicos."
    ], 
    keyTeachingPoints: [
      "El Índice Pletismográfico (PI) puede presentarse paradójicamente elevado (>1.4) en etapas tempranas por vasodilatación severa cutánea y muscular.",
      "La anafilaxia no admite esperas ante fallo CV o respiratorio; Adrenalina IM 0.5 mg es mandatoria.",
      "Lograr niveles de Lactato menores a 2.0 y revertir hipotensión constituyen metas primarias."
    ], 
    commonErrors: [
      "Demorar la inyección de Adrenalina IM por intentar accesos venosos periféricos para fármacos ineficaces (difenhidramina).",
      "Asumir que corticoides actúan rápido en la fase aguda del colapso anafiláctico."
    ], 
    tutorClosingScript: "El reconocimiento temprano de la anafilaxia como matriz de un shock distributivo permite habilitar al único agente salvador: la Adrenalina IM. La reversión de la vasodilatación se constata en la normalización fisiológica del pulso (PI), la disminución del lactato y el incremento en los registros esfigmomanométricos." 
  }
};

export const septicShockCase: ClinicalCase = {
  metadata: {
    id: "shock-septico",
    title: "Módulo 6: Shock Séptico",
    category: "cardio",
    severity: "critical",
    version: "2.0.0",
    references: ["Surviving Sepsis Campaign"]
  },
  patient: { age: 60, weight: 80, sex: "M", history: ["Infección urinaria reciente"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia Sinusal", hr: 124 },
    spo2: { value: 94, pi: 0.4 },
    nibp: { systolic: 88, diastolic: 46, mean: 58 },
    resp: { rate: 26 },
    temp: { t1: 39.1 },
    labs: { lactate: 4.2 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 15000,
      newVitals: {
        nibp: { systolic: 86, diastolic: 44, mean: 56 },
      },
      tutorMessage: "Nivel 1 (Observacional): El paciente tiene fiebre, frecuencia cardíaca de 124, presión arterial baja y relleno capilar enlentecido. El lactato inicial está elevado."
    },
    {
      trigger: "time",
      delayMs: 30000,
      newVitals: {
        ecg: { rhythm: "Taquicardia Sinusal", hr: 128 },
        nibp: { systolic: 82, diastolic: 40, mean: 52 },
        labs: { lactate: 4.5 }
      },
      tutorMessage: "Nivel 2 (Contextual): El qSOFA es 2 y el lactato está en ascenso. Esto sugiere alto riesgo de deterioro y necesidad de resucitación temprana."
    }
  ],
  interventions: [
    {
      id: "int-cristaloides-1000",
      label: "Cristaloides 1000 ml IV",
      category: "fluids",
      expectedEffect: {
        nibp: { systolic: 92, diastolic: 48, mean: 61 },
      },
      timeToEffectMs: 4000,
      priority: 2,
      isCorrect: true,
      feedback: "Reanimación con fluidos inicial iniciada. La PAM mejora levemente a 61 mmHg pero persiste por debajo del objetivo de 65 mmHg."
    },
    {
      id: "int-norepinefrina",
      label: "Norepinefrina",
      category: "drugs",
      expectedEffect: {
        ecg: { rhythm: "Taquicardia Leve", hr: 110 },
        spo2: { value: 96, pi: 0.8 },
        nibp: { systolic: 115, diastolic: 65, mean: 80 },
        labs: { lactate: 3.2 }
      },
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Vasopresor iniciado. Mejoría de PAM > 65 mmHg y de perfusión periférica. El lactato comienza a descender, indicando efectividad del soporte hemodinámico."
    },
    {
      id: "int-antibioticos",
      label: "Antibioticoterapia ATB Amplio Espectro",
      category: "drugs",
      expectedEffect: {},
      timeToEffectMs: 5000,
      priority: 1,
      isCorrect: true,
      feedback: "Administración temprana de antibióticos empíricos (dentro de la 1° hora). Pilar del control del foco infeccioso en sepsis."
    },
    {
      id: "int-cultivos",
      label: "Hemocultivos x2 y Urocultivo",
      category: "procedure",
      expectedEffect: {},
      timeToEffectMs: 3000,
      priority: 2,
      isCorrect: true,
      feedback: "Toma de cultivos previos a los antibióticos correcta."
    }
  ],
  debrief: { 
    learningObjectives: [
      "Reconocer el shock séptico según criterios Sepsis-3 (infección, hipotensión que requiere vasopresores y lactato > 2).",
      "Administrar fluidos y vasopresores tempranamente (PAM objetivo > 65 mmHg).",
      "Priorizar hemocultivos y antibióticos sistémicos en la primera hora."
    ], 
    keyTeachingPoints: [
      "El qSOFA elevado es un disparador para intensificar monitorización y reanimación.",
      "La norepinefrina es el vasopresor de primera línea en shock séptico.",
      "El aclaramiento de lactato orienta la eficacia de la reanimación."
    ], 
    commonErrors: [
      "Retrasar el inicio de antibióticos (>1hr).",
      "Administrar cantidades excesivas de fluidos ignorando la necesidad de vasopresores (Norepinefrina) temprana."
    ], 
    tutorClosingScript: "El reconocimiento temprano de la hipotensión persistente que precisa de vasopresores luego de volumen (Shock Séptico) permite iniciar norepinefrina para optimizar perfusión y prevenir disfunción multiorgánica. La terapia pilar incluyó cultivos y control precoz con ATB de amplio espectro." 
  }
};

export const abgCase: ClinicalCase = {
  metadata: {
    id: "abg-interpretation",
    title: "Módulo 8: Interpretación Gasométrica Avanzada",
    category: "metabolic",
    severity: "urgent",
    version: "2.0.0",
    references: ["Kraut, J. A. Mixed acid-base disturbances 2025"]
  },
  patient: { age: 50, weight: 70, sex: "M", history: ["Shock or sepsis context"] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Taquicardia Sinusal", hr: 110 },
    spo2: { value: 94, pi: 1.0 },
    nibp: { systolic: 90, diastolic: 50, mean: 63 },
    resp: { rate: 30 },
    temp: { t1: 37.0 },
    labs: {
      pH: 7.21,
      pCO2: 28,
      hco3: 11,
      sodium: 138,
      chloride: 100,
      potassium: 4.8,
      lactate: 6.2
    },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 15000,
      newVitals: {
        resp: { rate: 32 }
      },
      tutorMessage: "Nivel 1 (Observacional): El pH está bajo, el bicarbonato está reducido y el paciente presenta taquipnea. El contexto clínico sugiere un problema metabólico o mixto."
    },
    {
      trigger: "time",
      delayMs: 30000,
      newVitals: {
        nibp: { systolic: 88, diastolic: 48, mean: 61 }
      },
      tutorMessage: "Nivel 2 (Contextual): El anion gap está elevado (27) y la compensación respiratoria no alcanza lo esperado (PaCO2 esperada ~24). Además, el delta ratio sugiere acidosis combinada."
    }
  ],
  interventions: [
    {
      id: "int-reconocer-mixto",
      label: "Interpretar como Trastorno Mixto (Acidosis Metabólica + Respiratoria Relativa)",
      category: "monitoring",
      expectedEffect: {},
      timeToEffectMs: 1000,
      priority: 1,
      isCorrect: true,
      feedback: "Diagnóstico gasométrico correcto. El paciente presenta una acidosis metabólica con anion gap elevado (AG=27, por hiperlactatemia) pero la PaCO2 (28) es superior a la esperada (Fórmula de Winter: 11*1.5+8 = 24.5 ± 2), indicando una acidosis respiratoria oculta por fatiga o disfunción."
    },
    {
      id: "int-reconocer-simple",
      label: "Interpretar como Acidosis Metabólica Simple",
      category: "monitoring",
      expectedEffect: {},
      timeToEffectMs: 1000,
      priority: 3,
      isCorrect: false,
      feedback: "Interpretación incompleta. Si bien hay una acidosis metabólica primaria con AG elevado, la compensación respiratoria es defectuosa. Omitir el componente respiratorio puede esconder una falla ventilatoria inminente."
    },
    {
      id: "int-bicarbonato-iv",
      label: "Bicarbonato de Sodio IV 1 mEq/kg",
      category: "drugs",
      expectedEffect: {
        labs: { pH: 7.28, pCO2: 35, hco3: 16 }
      },
      timeToEffectMs: 4000,
      priority: 3,
      isCorrect: false,
      feedback: "El uso de bicarbonato en la acidosis láctica por shock no corrige la causa subyacente y puede empeorar la acidosis intracelular al aumentar la producción de CO2, que el paciente ya tiene problemas para barrer (acidosis respiratoria mixta)."
    }
  ],
  debrief: { 
    learningObjectives: [
      "Calcular sistemáticamente el Anion Gap en toda acidosis metabólica.",
      "Emplear la fórmula de Winter o similares para verificar la compensación respiratoria.",
      "Identificar trastornos mixtos subyacentes usando el análisis del Delta Ratio."
    ], 
    keyTeachingPoints: [
      "Un pH de 7.21 con HCO3 de 11 y PaCO2 de 28 revela un AG de 27. La compensación respiratoria esperada es ~24 mmHg. Al tener 28 mmHg, coexiste una Acidosis Respiratoria.",
      "El lactato elevado (6.2) justifica la apertura del Anion Gap.",
      "No leer el gas de manera aislada; conectarlo con la clínica de hipoperfusión (Shock)."
    ], 
    commonErrors: [
      "Asumir que un PaCO2 bajo significa que la compensación es adecuada, sin calcular el valor preciso esperado.",
      "Olvidar calcular el Anion Gap."
    ], 
    tutorClosingScript: "El análisis sistemático ácido-base es un pilar de los cuidados críticos. Al detectar que la compensación respiratoria era insuficiente para la severidad de la acidosis metabólica (trastorno mixto), anticipamos la probable necesidad de asistencia ventilatoria y optimización cardiovascular." 
  }
};

export const tutorialCase: ClinicalCase = {
  metadata: {
    id: "mod-00-tutorial",
    title: "Módulo 0: Introducción y Uso Guiado del Simulador",
    category: "other",
    severity: "stable",
    version: "2.0.0",
    references: []
  },
  patient: { age: 30, weight: 70, sex: "M", history: ["Paciente Simulado para Entrenamiento. Repaso asistido de interfaz."] },
  initialState: {
    timestamp: 0,
    ecg: { rhythm: "Sinusal", hr: 75 },
    spo2: { value: 98, pi: 2.0 },
    nibp: { systolic: 120, diastolic: 80, mean: 93 },
    resp: { rate: 16 },
    temp: { t1: 36.5 },
    activeAlarms: []
  },
  evolutionRules: [
    {
      trigger: "time",
      delayMs: 15000,
      newVitals: {},
      tutorMessage: "Nivel 1 (Bienvenida/Observacional): Hola, soy tu entrenador. Este panel central muestra el monitor del paciente en tiempo real. Presta atención a las variables hemodinámicas: FC, TA, SpO2 y FR. Si algo cambia, el caso evoluciona."
    },
    {
      trigger: "time",
      delayMs: 35000,
      newVitals: {},
      tutorMessage: "Nivel 2 (Contextual): A la derecha tienes el panel de Intervenciones. Al seleccionar una (fluidos, drogas, ventilación), modificarás el estado clínico. El simulador reacciona de forma autónoma. Puedes pausar en cualquier momento."
    },
    {
      trigger: "time",
      delayMs: 50000,
      newVitals: {},
      tutorMessage: "Nivel 3 (Directivo): Por último, el panel inferior mostrará sugerencias o advertencias mías. Todo generará alertas si empeora. ¡Elige la acción de confirmación para terminar este bloque!"
    }
  ],
  interventions: [
    {
      id: "int-confirmar",
      label: "Comprendido (Confirmar y Finalizar)",
      category: "monitoring",
      expectedEffect: {},
      timeToEffectMs: 1000,
      priority: 1,
      isCorrect: true,
      feedback: "¡Excelente! Has entendido la anatomía de este simulador. Ahora estás listo para iniciar el Módulo 1 clínico. ¡Bienvenido al Shock Room determinista!"
    }
  ],
  debrief: { 
    learningObjectives: [
      "Conocer el mapa visual de la interfaz del Simulador Clínico.",
      "Entender que el tutor escala de observacional a directivo.",
      "Practicar la ejecución de una intervención y lectura del feedback."
    ], 
    keyTeachingPoints: [
      "El simulador no espera tu validación de variables; lee de ellas y genera alarmas.",
      "Los módulos deterministas tienen umbrales y tiempos rígidos."
    ], 
    commonErrors: [
      "Actuar intuitivamente sin leer antes los signos de alarma o las pistas de tutoría."
    ], 
    tutorClosingScript: "Felicidades. Acabas de finalizar el Módulo 0. Cierra este debrief y entra en los casos reales. Mucho éxito." 
  }
};

export const allScenarios: ClinicalCase[] = [
  tutorialCase,           // Módulo 0
  coCase,                 // Módulo 1
  bronchiolitisCase,      // Módulo 2
  pneumoniaAdultCase,     // Módulo 3
  shockCase,              // Módulo 4
  anaphylaxisCase,        // Módulo 5
  septicShockCase,        // Módulo 6
  cadCase,                // Módulo 7
  abgCase                 // Módulo 8
];
