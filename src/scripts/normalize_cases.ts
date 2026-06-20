import { ClinicalCase } from '../schemas/case.schema';
import { allScenarios } from '../data/mock-scenarios';

export function validateCases(scenarios: ClinicalCase[]): string[] {
  const errors: string[] = [];

  for (const scenario of scenarios) {
    const v = scenario.initialState;
    if (scenario.metadata.id === 'shock-septico') {
      if (!v.labs?.lactate || v.labs.lactate < 2.0) {
        errors.push(`[${scenario.metadata.id}] Lactato no elevado en shock séptico.`);
      }
      if (v.nibp.mean >= 65) {
        errors.push(`[${scenario.metadata.id}] PAM demasiado conservada para shock séptico inicial.`);
      }
      if (v.ecg.hr < 90) {
        errors.push(`[${scenario.metadata.id}] FC no compensadora en shock séptico.`);
      }
      if (!v.spo2.pi || v.spo2.pi > 1.0) {
        // En shock séptico tardío o con vasoplejía PI puede estar bajo o alto inicialmente
      }
    }

    if (scenario.metadata.id === 'shock-distributivo-anafilaxia') {
      if (!v.spo2.pi || v.spo2.pi < 1.4) {
        errors.push(`[${scenario.metadata.id}] PI no presenta vasodilatación (debería ser > 1.4).`);
      }
      if (v.nibp.mean >= 65) {
        errors.push(`[${scenario.metadata.id}] PAM mantenida en anafilaxia severa.`);
      }
    }

    if (scenario.metadata.id === 'pediatric-dka') {
      if (!v.labs?.glucose || v.labs.glucose < 250) {
        errors.push(`[${scenario.metadata.id}] Hiperglucemia insuficiente para CAD pediátrica.`);
      }
      if (!v.labs?.pH || v.labs.pH > 7.30) {
        errors.push(`[${scenario.metadata.id}] pH no compatible con CAD.`);
      }
      if (!v.labs?.hco3 || v.labs.hco3 > 18) {
        errors.push(`[${scenario.metadata.id}] Bicarbonato demasiado alto para CAD.`);
      }
      if (!v.labs?.ketones || v.labs.ketones < 3.0) {
        errors.push(`[${scenario.metadata.id}] Cetosis ausente o insuficiente en CAD.`);
      }
      const hasBolus = scenario.interventions.some(i => i.id === 'int-insulina-bolus' && i.isCorrect);
      if (hasBolus) {
         errors.push(`[${scenario.metadata.id}] Bolus IV de insulina no permitido como correcto en pediatría.`);
      }
    }

    if (scenario.metadata.id === 'abg-interpretation') {
      if (!v.labs?.pH || !v.labs?.pCO2 || !v.labs?.hco3 || !v.labs?.sodium || !v.labs?.chloride) {
        errors.push(`[${scenario.metadata.id}] Falta de datos básicos para gasometría arterial.`);
      } else {
        const ag = v.labs.sodium - (v.labs.chloride + v.labs.hco3);
        if (v.labs.lactate && v.labs.lactate > 4 && ag <= 12) {
          errors.push(`[${scenario.metadata.id}] Lactato elevado sin anion gap compatible: revisar cohorte del caso.`);
        }
      }
    }

    if (scenario.metadata.id === 'mod-00-tutorial') {
      if (scenario.evolutionRules.length < 3) {
        errors.push(`[${scenario.metadata.id}] El Módulo 0 debe tener etapas de tutoría (Bienvenida, Interfaz, Acciones).`);
      }
      if (scenario.interventions.length === 0) {
        errors.push(`[${scenario.metadata.id}] El Módulo 0 debe incluir al menos una intervención de confirmación guiada.`);
      }
    }
  }

  return errors;
}

// Automatically test scenarios
const validationErrors = validateCases(allScenarios);
if (validationErrors.length > 0) {
  console.warn("Validation Errors in mock-scenarios.ts:", validationErrors);
} else {
  console.log("All scenarios validated successfully.");
}
