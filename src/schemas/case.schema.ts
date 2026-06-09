import { z } from "zod";

export const VitalSignsSnapshotSchema = z.object({
  timestamp: z.number(),
  ecg: z.object({
    rhythm: z.string(),
    hr: z.number().int().min(0).max(350),
    st: z.number().optional(),
    waveformUrl: z.string().url().optional(),
  }),
  spo2: z.object({
    value: z.number().int().min(0).max(100),
    pi: z.number().optional(),
    waveformUrl: z.string().url().optional(),
  }),
  nibp: z.object({
    systolic: z.number().int().min(0).max(300),
    diastolic: z.number().int().min(0).max(200),
    mean: z.number().int().min(0).max(250),
  }),
  ibp: z.array(z.object({
    label: z.enum(["ART", "CVP", "PAP", "PCP"]),
    systolic: z.number().int(),
    diastolic: z.number().int(),
    mean: z.number().int(),
  })).optional(),
  etco2: z.object({
    value: z.number().int().min(0).max(100),
    waveformUrl: z.string().url().optional(),
  }).optional(),
  resp: z.object({
    rate: z.number().int().min(0).max(150),
    waveformUrl: z.string().url().optional(),
  }),
  temp: z.object({
    t1: z.number().optional(),
    t2: z.number().optional(),
    td: z.number().optional(),
  }),
  activeAlarms: z.array(z.object({
    id: z.string(),
    parameter: z.enum(["HR","SpO2","NIBP_s","NIBP_d","EtCO2","RESP","TEMP","ST","ARRHYTHMIA","APNEA","INOP"]),
    priority: z.enum(["HIGH","MEDIUM","LOW","INOP"]),
    currentValue: z.number(),
    threshold: z.number(),
    message: z.string(),
    color: z.enum(["#FF0000","#FFFF00","#00FFFF"]),
    tone: z.enum(["bursts","intermittent","continuous"]),
    flashHz: z.number(),
  })),
});

export const InterventionSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum(["fluids","drugs","ventilation","procedure","monitoring"]),
  expectedEffect: VitalSignsSnapshotSchema.partial(),
  timeToEffectMs: z.number().int().positive(),
  contraindications: z.array(z.string()).optional(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  isCorrect: z.boolean().optional(),
  feedback: z.string().optional(),
});

export const EvolutionStepSchema = z.object({
  trigger: z.enum(["time","intervention","threshold"]),
  delayMs: z.number().int().positive().optional(),
  interventionId: z.string().optional(),
  parameterTarget: z.string().optional(),
  threshold: z.number().optional(),
  newVitals: VitalSignsSnapshotSchema.partial(),
  tutorMessage: z.string().optional(),
});

export const ClinicalCaseSchema = z.object({
  metadata: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string(),
    category: z.enum(["cardio","respiratory","metabolic","toxicological","pediatric"]),
    severity: z.enum(["critical","urgent","stable-unstable"]),
    season: z.enum(["autumn-winter","spring-summer","all-year"]).optional(),
    version: z.string().regex(/^\\d+\\.\\d+\\.\\d+$/),
    references: z.array(z.string()),
    tags: z.array(z.string()).optional(),
  }),
  patient: z.object({
    age: z.number().min(0).max(120),
    weight: z.number().positive().max(200),
    sex: z.enum(["M","F"]),
    history: z.array(z.string()).optional(),
  }),
  initialState: VitalSignsSnapshotSchema,
  evolutionRules: z.array(EvolutionStepSchema),
  interventions: z.array(InterventionSchema),
  debrief: z.object({
    learningObjectives: z.array(z.string()),
    keyTeachingPoints: z.array(z.string()),
    commonErrors: z.array(z.string()),
    tutorClosingScript: z.string(),
  }),
});

export type ClinicalCase = z.infer<typeof ClinicalCaseSchema>;
export type VitalSignsSnapshot = z.infer<typeof VitalSignsSnapshotSchema>;
export type Intervention = z.infer<typeof InterventionSchema>;
export type EvolutionStep = z.infer<typeof EvolutionStepSchema>;
