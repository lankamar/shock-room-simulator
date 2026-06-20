import { VitalSignsSnapshot, Intervention } from '../schemas/case.schema';
import { ClinicalReasoningEngine, PatientState } from './models';
import { applyInterventionDelta } from './engine';
import { AcidBaseEngine } from './acid-base';

const engine = new ClinicalReasoningEngine();
const acidBaseEngine = new AcidBaseEngine();

export function calculatePenalties(
  vitals: VitalSignsSnapshot,
  timeMs: number,
  scenarioId: string,
  interventionLog: { time: number; intervention: Intervention }[]
): { vitals: VitalSignsSnapshot; penaltyMessage: string | null } {
  let updatedVitals = JSON.parse(JSON.stringify(vitals)) as VitalSignsSnapshot;
  let penaltyMessage: string | null = null;
  
  const patientState: PatientState = {
    ageInMonths: scenarioId === 'bronquiolitis' ? 6 : (scenarioId === 'cetoacidosis-diabetica' ? 96 : 600),
    weightKg: 25,
    heightCm: 130,
    gender: 'F',
    temperatureC: updatedVitals.temp?.t1 || 37.0,
    heartRate: updatedVitals.ecg?.hr || 80,
    respiratoryRate: updatedVitals.resp?.rate || 16,
    oxygenSaturation: updatedVitals.spo2?.value || 98,
    fractionOfInspiredOxygen: 0.21,
    confusion: false,
    bloodUreaNitrogen: 15,
    systolicBP: updatedVitals.nibp?.systolic || 120,
    diastolicBP: updatedVitals.nibp?.diastolic || 80,
    wheezing: 0,
    retraction: 0,
    hasSBO: false,
    hasPneumonia: false,
    isVentilated: false,
    roxHistory: [],
    simulationTimeInHours: timeMs / 3600000,
    ...updatedVitals.labs
  };

  // Penalization Logic for Pediatric SBO / Bronchiolitis
  if (scenarioId === 'bronquiolitis') {
    patientState.hasSBO = true;
    patientState.wheezing = 2;
    patientState.retraction = 2;
    const talScore = engine.calculateTalScore(patientState);
    if (talScore >= 9 && timeMs > 20000) { 
      const intubated = interventionLog.some(log => log.intervention.id === 'int-alto-flujo' || log.intervention.id === 'int-intub-protectora');
      if (!intubated) {
        // Linear degradation
        const penaltyFactor = Math.floor((timeMs - 20000) / 10000); 
        if (penaltyFactor > 0) {
          updatedVitals.spo2 = { ...updatedVitals.spo2!, value: Math.max(50, updatedVitals.spo2!.value - penaltyFactor * 2) };
          updatedVitals.ecg = { ...updatedVitals.ecg!, hr: Math.max(40, updatedVitals.ecg!.hr - penaltyFactor * 5) };
          penaltyMessage = "PENALIZACIÓN: Retraso en escalar soporte frente a Score de Tal severo (≥9). Se evidencia rápido deterioro fisiológico (caída de SpO2 y bradicardia por hipoxia).";
        }
      }
    }
  }

  // Penalization Logic for Adult ARDS / Pneumonia
  if (scenarioId === 'neumonia-sdra') {
    patientState.hasPneumonia = true;
    patientState.fractionOfInspiredOxygen = 1.0; 
    const roxIndex = engine.calculateROX(patientState);
    
    // Penalize if ROX < 3.85 after certain time without intubation
    if (roxIndex < 3.85 && timeMs > 30000) {
      const intubated = interventionLog.some(log => log.intervention.id === 'int-intub-protectora');
      if (!intubated) {
        const penaltyFactor = Math.floor((timeMs - 30000) / 10000);
        if (penaltyFactor > 0) {
          updatedVitals.spo2 = { ...updatedVitals.spo2!, value: Math.max(50, updatedVitals.spo2!.value - penaltyFactor * 3) };
          updatedVitals.nibp = { ...updatedVitals.nibp!, systolic: Math.max(50, updatedVitals.nibp!.systolic - penaltyFactor * 5), mean: Math.max(40, updatedVitals.nibp!.mean - penaltyFactor * 4) };
          penaltyMessage = "PENALIZACIÓN: Retraso indebido en intubación con Índice ROX < 3.85. La prolongación del esfuerzo inspiratorio espontáneo precipita Daño Pulmonar Autoinflingido (P-SILI) y colapso cardiovascular.";
        }
      }
    }
  }

  // Penalization for Diabetic Ketoacidosis (Cerebral Edema / Metabolic)
  if (scenarioId === 'cetoacidosis-diabetica') {
    // If user waits too long without doing appropriate slow hydration
    const hasHydration = interventionLog.some(log => log.intervention.id === 'int-hidratacion-lenta');
    const hasInsulinBolo = interventionLog.some(log => log.intervention.id === 'int-insulina-simultanea');
    
    // Calculate osmolality to observe the severity
    const effOsm = acidBaseEngine.calculateEffectiveOsmolality(patientState);
    if (!hasHydration && !hasInsulinBolo && timeMs > 25000 && effOsm > 0) {
      const penaltyFactor = Math.floor((timeMs - 25000) / 10000);
      if (penaltyFactor > 0) {
         updatedVitals.ecg = { ...updatedVitals.ecg!, hr: Math.min(180, updatedVitals.ecg!.hr + penaltyFactor * 6) };
         updatedVitals.nibp = { ...updatedVitals.nibp!, systolic: Math.max(50, updatedVitals.nibp!.systolic - penaltyFactor * 4) };
         if (!updatedVitals.labs) updatedVitals.labs = {};
         updatedVitals.labs.lactate = (updatedVitals.labs.lactate || 2.1) + (penaltyFactor * 0.5);
         penaltyMessage = "PENALIZACIÓN: Retraso en fluidoterapia. La hipovolemia severa precipita acidosis láctica concurrente y empeoramiento de la perfusión tisular (SID disminuido).";
      }
    }
  }

  // Penalization for Propionic Acidemia
  if (scenarioId === 'acidemia-propionica') {
     const hasHDFVVC = interventionLog.some(log => log.intervention.id === 'int-hdfvvc');
     const hasAntibioticsOnly = interventionLog.some(log => log.intervention.id === 'int-antibioticos-sepsis');

     if (!hasHDFVVC && timeMs > 20000) {
       const penaltyFactor = Math.floor((timeMs - 20000) / 10000);
       if (penaltyFactor > 0) {
         updatedVitals.ecg = { ...updatedVitals.ecg!, hr: Math.max(40, updatedVitals.ecg!.hr - penaltyFactor * 8) };
         if (!updatedVitals.labs) updatedVitals.labs = {};
         updatedVitals.labs.lactate = (updatedVitals.labs.lactate || 6.5) + penaltyFactor;
         penaltyMessage = "PENALIZACIÓN: Omisión de terapia de depuración extrarrenal. La hiperammonemia por bloqueo de NAGsintetasa induce edema cerebral letal.";
       }
     }
  }

  // Penalization for Anaphylaxis
  if (scenarioId === 'shock-distributivo-anafilaxia') {
    const hasEpi = interventionLog.some(log => log.intervention.id === 'int-adrenalina-im');
    if (!hasEpi && timeMs > 45000) {
      const penaltyFactor = Math.floor((timeMs - 45000) / 10000);
      if (penaltyFactor > 0) {
        updatedVitals.nibp = { 
          ...updatedVitals.nibp!, 
          systolic: Math.max(30, updatedVitals.nibp!.systolic - penaltyFactor * 5),
          mean: Math.max(20, updatedVitals.nibp!.mean - penaltyFactor * 4) 
        };
        updatedVitals.spo2 = { ...updatedVitals.spo2!, value: Math.max(40, updatedVitals.spo2!.value - penaltyFactor * 4), pi: Math.min(4.0, (updatedVitals.spo2!.pi || 2.1) + penaltyFactor * 0.2) };
        updatedVitals.ecg = { ...updatedVitals.ecg!, hr: Math.min(180, updatedVitals.ecg!.hr + penaltyFactor * 5) };
        if (!updatedVitals.labs) updatedVitals.labs = {};
        updatedVitals.labs.lactate = (updatedVitals.labs.lactate || 3.5) + (penaltyFactor * 1.0);
        
        penaltyMessage = "Nivel 3 (Directivo): ⚠️ El paciente sufre shock anafiláctico severo inminente paro. Requiere Adrenalina IM 0.5 mg de manera inmediata en la cara anterolateral del muslo para revertir el colapso vascular y broncoespasmo.";
      }
    }
  }

  // Penalization for Septic Shock
  if (scenarioId === 'shock-septico') {
    const hasNorepi = interventionLog.some(log => log.intervention.id === 'int-norepinefrina');
    const hasFluids = interventionLog.some(log => log.intervention.id === 'int-cristaloides-1000');
    
    if (!hasNorepi && timeMs > 40000) {
      const penaltyFactor = Math.floor((timeMs - 40000) / 10000);
      if (penaltyFactor > 0) {
        updatedVitals.nibp = { 
          ...updatedVitals.nibp!, 
          systolic: Math.max(40, updatedVitals.nibp!.systolic - penaltyFactor * 4),
          mean: Math.max(30, updatedVitals.nibp!.mean - penaltyFactor * 3) 
        };
        updatedVitals.ecg = { ...updatedVitals.ecg!, hr: Math.min(160, updatedVitals.ecg!.hr + penaltyFactor * 3) };
        if (!updatedVitals.labs) updatedVitals.labs = {};
        updatedVitals.labs.lactate = (updatedVitals.labs.lactate || 4.5) + (penaltyFactor * 0.5);
        
        penaltyMessage = "Nivel 3 (Directivo): ⚠️ Inestabilidad hemodinámica profunda. Se requiere inicio inmediato de vasopresores (Norepinefrina) ya que los fluidos son insuficientes para revertir la vasoplejía.";
      }
    }
  }

  // Generalized Killip-Kimball Derivation check for cardiogenic scenarios
  // If the scenario happens to be cardiogenic in the future (e.g., Módulo 5b), we evaluate Killip:
  if (scenarioId === 'shock-cardiogenico' || scenarioId === 'sca') {
    const killipScore = engine.calculateKillip(patientState);
    if (killipScore === 4 && timeMs > 30000) {
       penaltyMessage = "Nivel 3 (Directivo): ⚠️ Cardiogenic Shock (Killip IV). El paciente sufre colapso hemodinámico (PAS < 90, Lactato > 2). Requiere soporte vasoactivo inmediato y revascularización.";
    } else if (killipScore === 1 && timeMs < 10000) {
       // Just a demonstrative fallback
       if (!penaltyMessage) {
         penaltyMessage = "Nivel 1 (Observacional): El paciente ingresa estable, sin signos de insuficiencia cardíaca (Killip I).";
       }
    }
  }

  // Penalization for Pediatric DKA
  if (scenarioId === 'pediatric-dka') {
    const hasFluids = interventionLog.some(log => log.intervention.id === 'int-fluido-isotonico-lento');
    const hasBolus = interventionLog.some(log => log.intervention.id === 'int-insulina-bolus');

    if (hasBolus) {
       // Handled by the intervention's "expectedEffect", but we can reinforce it
       penaltyMessage = "Nivel 3 (Directivo): ⚠️ ¡BOLUS DE INSULINA ADMINISTRADO! Alto riesgo de edema cerebral inminente por descenso rápido de osmolaridad. Monitorice estado neurológico inmediatamente.";
    } else if (!hasFluids && timeMs > 45000) {
      const penaltyFactor = Math.floor((timeMs - 45000) / 10000);
      if (penaltyFactor > 0) {
        updatedVitals.nibp = { 
          ...updatedVitals.nibp!, 
          systolic: Math.max(50, updatedVitals.nibp!.systolic - penaltyFactor * 3),
          mean: Math.max(40, updatedVitals.nibp!.mean - penaltyFactor * 2) 
        };
        updatedVitals.ecg = { ...updatedVitals.ecg!, hr: Math.min(170, updatedVitals.ecg!.hr + penaltyFactor * 2) };
        if (!updatedVitals.labs) updatedVitals.labs = {};
        updatedVitals.labs.pH = Math.max(6.8, (updatedVitals.labs.pH || 7.08) - (penaltyFactor * 0.02));
        
        penaltyMessage = "Nivel 3 (Directivo): ⚠️ Deshidratación severa y acidosis progresiva. Inicie fluidoterapia isotónica con vigilancia estricta, no use bolus de insulina IV, revise el potasio antes de comenzar la infusión y monitorice signos neurológicos.";
      }
    }
  }

  return { vitals: updatedVitals, penaltyMessage };
}
