import { PatientState } from './models';

/**
 * Módulo 4: Evaluación Cuantitativa del Equilibrio Ácido-Base y Abordaje Cínico
 * Incluye cálculos tradicionales y el modelo fisicoquímico de Stewart.
 */

export class AcidBaseEngine {
  /**
   * Paso 1: Valoración de la Oxigenación (PAFI)
   */
  public calculatePAFI(state: PatientState): number {
    if (!state.partialPressureOxygen) return -1;
    return state.partialPressureOxygen / state.fractionOfInspiredOxygen;
  }

  /**
   * Paso 5: Cálculo de la Brecha Aniónica (Anion Gap)
   */
  public calculateAnionGap(state: PatientState): number {
    if (state.sodium === undefined || state.chloride === undefined || state.hco3 === undefined) return -1;
    return state.sodium - (state.chloride + state.hco3);
  }

  /**
   * Sodio Corregido por Glucosa
   * Para evitar falsas hiponatremias en estados hiperglucémicos (ej. CAD)
   */
  public calculateCorrectedSodium(state: PatientState): number {
    if (state.sodium === undefined || state.glucose === undefined) return -1;
    return state.sodium + 1.6 * ((state.glucose - 100) / 100);
  }

  /**
   * Osmolalidad Plasmática Efectiva
   */
  public calculateEffectiveOsmolality(state: PatientState): number {
    if (state.sodium === undefined || state.glucose === undefined) return -1;
    // Glucosa dividida por 18 convierte de mg/dL a mmol/L aproximadamente
    const glucoseMmolL = state.glucose / 18; 
    return (2 * state.sodium) + glucoseMmolL;
  }

  /**
   * Modelo de Stewart: Diferencia de Iones Fuertes (SID)
   * Estimado simple plasmático: Na+ - Cl- - Lactato
   */
  public calculateSID(state: PatientState): number {
    if (state.sodium === undefined || state.chloride === undefined) return -1;
    const lact = state.lactate || 0;
    return state.sodium - state.chloride - lact;
  }
}
