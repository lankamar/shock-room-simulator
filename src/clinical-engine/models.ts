export interface PatientState {
  ageInMonths: number;
  weightKg: number;
  heightCm: number;
  gender: 'M' | 'F';
  temperatureC: number;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  fractionOfInspiredOxygen: number; // Expresado en escala decimal [0.21, 1.00]
  partialPressureOxygen?: number;   // PaO2 en mmHg
  confusion: boolean;
  bloodUreaNitrogen: number;        // BUN en mg/dL
  systolicBP: number;
  diastolicBP: number;
  wheezing: 0 | 1 | 2 | 3;          // Escala de Tal: Sibilancias
  retraction: 0 | 1 | 2 | 3;        // Escala de Tal: Tiraje
  hasSBO: boolean;
  hasPneumonia: boolean;
  hasPulmonaryEdema?: boolean;
  hasCrackles?: boolean;
  isVentilated: boolean;
  tidalVolumePerKg?: number;        // Volumen tidal relativo al PBW
  roxHistory: { timeInHours: number; value: number }[];
  simulationTimeInHours: number;

  // Acid-Base & Labs
  pH?: number;
  pCO2?: number;          // mmHg
  hco3?: number;          // mmol/L
  baseExcess?: number;    // mmol/L
  lactate?: number;       // mmol/L
  sodium?: number;        // mEq/L
  chloride?: number;      // mEq/L
  albumin?: number;       // g/dL
  glucose?: number;       // mg/dL
  ketones?: number;       // beta-OHB in mmol/L
}

export interface VentilationSettings {
  tidalVolumeMl: number;
  respiratoryRate: number;
  fractionOfInspiredOxygen: number;
  peepCmH2O: number;
}

export interface MedicalAction {
  type: 'ADMINISTER_DRUG' | 'SET_OXYGEN' | 'INTUBATE' | 'ADJUST_VENTILATOR' | 'DISCHARGE_PATIENT' | 'RE_EVALUATE';
  params: {
    drugName?: string;
    doseMcg?: number;
    deliveryMethod?: 'MDI_SPACER' | 'NEBULIZATION' | 'IV' | 'CNAF';
    flowRateLPM?: number;
    fractionOfInspiredOxygen?: number;
    ventilatorSettings?: VentilationSettings;
  };
}

export class ClinicalReasoningEngine {
  public calculatePBW(state: PatientState): number {
    const heightInInches = state.heightCm / 2.54;
    const baseWeight = state.gender === 'M' ? 50.0 : 45.5;
    return baseWeight + 2.3 * (heightInInches - 60);
  }

  public calculateTalScore(state: PatientState): number {
    if (state.temperatureC >= 37.5) {
      return -1; // No computable bajo estado febril
    }

    let score = 0;

    if (state.heartRate >= 120 && state.heartRate <= 140) score += 1;
    else if (state.heartRate > 140 && state.heartRate <= 160) score += 2;
    else if (state.heartRate > 160) score += 3;

    if (state.ageInMonths < 6) {
      if (state.respiratoryRate >= 40 && state.respiratoryRate <= 55) score += 1;
      else if (state.respiratoryRate > 55 && state.respiratoryRate <= 70) score += 2;
      else if (state.respiratoryRate > 70) score += 3;
    } else {
      if (state.respiratoryRate >= 30 && state.respiratoryRate <= 45) score += 1;
      else if (state.respiratoryRate > 45 && state.respiratoryRate <= 60) score += 2;
      else if (state.respiratoryRate > 60) score += 3;
    }

    score += state.wheezing;
    score += state.retraction;
    
    return score;
  }

  public calculateCURB65(state: PatientState): number {
    let score = 0;
    if (state.confusion) score += 1;
    if (state.bloodUreaNitrogen > 19) score += 1;
    if (state.respiratoryRate >= 30) score += 1;
    if (state.systolicBP < 90 || state.diastolicBP <= 60) score += 1;
    if (state.ageInMonths >= 780) score += 1; // >= 65 years
    return score;
  }

  public calculateROX(state: PatientState): number {
    // (SpO2 / FiO2) / FR
    return (state.oxygenSaturation / state.fractionOfInspiredOxygen) / state.respiratoryRate;
  }

  public calculateKirby(state: PatientState): number {
    if (!state.partialPressureOxygen) return -1;
    return state.partialPressureOxygen / state.fractionOfInspiredOxygen;
  }

  public calculateKillip(state: PatientState): number {
    if (state.systolicBP < 90 && state.lactate && state.lactate >= 2.0) {
      return 4; // Cardiogenic shock
    }
    if (state.hasPulmonaryEdema) {
      return 3; // Pulmonary edema
    }
    if (state.hasCrackles) {
      return 2; // Heart failure
    }
    return 1; // No signs of HF
  }

  public executeTransition(state: PatientState, action: MedicalAction): PatientState {
    const nextState: PatientState = JSON.parse(JSON.stringify(state)); 

    switch (action.type) {
      case 'ADMINISTER_DRUG':
        if (state.hasSBO && action.params.drugName === 'Salbutamol') {
          nextState.wheezing = Math.max(0, state.wheezing - 1) as 0 | 1 | 2 | 3;
          nextState.retraction = Math.max(0, state.retraction - 1) as 0 | 1 | 2 | 3;
          nextState.respiratoryRate = Math.max(24, state.respiratoryRate - 8);
          nextState.heartRate = Math.min(180, state.heartRate + 10);
        }
        break;

      case 'SET_OXYGEN':
        if (action.params.deliveryMethod === 'CNAF' && action.params.fractionOfInspiredOxygen) {
          nextState.fractionOfInspiredOxygen = action.params.fractionOfInspiredOxygen;
          nextState.oxygenSaturation = Math.min(99, state.oxygenSaturation + 8);
          nextState.respiratoryRate = Math.max(16, state.respiratoryRate - 6);

          const currentRox = this.calculateROX(nextState);
          nextState.roxHistory.push({
            timeInHours: state.simulationTimeInHours,
            value: currentRox
          });
        }
        break;

      case 'INTUBATE':
        if (!state.isVentilated) {
          nextState.isVentilated = true;
          nextState.fractionOfInspiredOxygen = 1.0; 
          nextState.oxygenSaturation = 100;
          nextState.respiratoryRate = 12; 
        }
        break;

      case 'ADJUST_VENTILATOR':
        if (state.isVentilated && action.params.ventilatorSettings) {
          const settings = action.params.ventilatorSettings;
          const pbw = this.calculatePBW(state);
          const tidalVolPerKg = settings.tidalVolumeMl / pbw;

          nextState.tidalVolumePerKg = tidalVolPerKg;
          nextState.fractionOfInspiredOxygen = settings.fractionOfInspiredOxygen;
          nextState.respiratoryRate = settings.respiratoryRate;

          if (tidalVolPerKg > 8.0) {
            nextState.oxygenSaturation = Math.max(65, state.oxygenSaturation - 15);
            if (nextState.partialPressureOxygen) {
              nextState.partialPressureOxygen = Math.max(40, nextState.partialPressureOxygen - 30);
            }
            nextState.systolicBP = Math.max(60, state.systolicBP - 25); 
          } else {
            nextState.oxygenSaturation = Math.min(99, state.oxygenSaturation + 2);
            if (nextState.partialPressureOxygen) {
              nextState.partialPressureOxygen = Math.min(120, nextState.partialPressureOxygen + 15);
            }
          }
        }
        break;

      case 'DISCHARGE_PATIENT': {
        const talScore = this.calculateTalScore(state);
        const curbScore = this.calculateCURB65(state);

        if (state.hasSBO && talScore >= 9) {
          nextState.oxygenSaturation = 50;
          nextState.heartRate = 40; 
        } else if (state.hasPneumonia && curbScore >= 3) {
          nextState.systolicBP = 50;
          nextState.diastolicBP = 30;
          nextState.confusion = true;
        }
        break;
      }

      case 'RE_EVALUATE':
        nextState.simulationTimeInHours += 1;
        break;
    }

    return nextState;
  }
}
