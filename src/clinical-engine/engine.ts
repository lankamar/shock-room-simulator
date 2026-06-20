import { VitalSignsSnapshot } from '../schemas/case.schema';

export const CLINICAL_RULES = {
  HR: { high: 120, critHigh: 150, low: 50, critLow: 40 },
  SpO2: { low: 90, critLow: 85 },
  NIBP_s: { high: 140, critHigh: 180, low: 90, critLow: 70 },
  RESP: { high: 30, critHigh: 45, low: 10, critLow: 8 },
  TEMP: { high: 38.0, critHigh: 39.0, low: 35.5, critLow: 34.5 },
  MAP: { low: 65, critLow: 50 },
  Lactate: { high: 2.0, critHigh: 4.0 },
  Glucose: { high: 200, critHigh: 400, low: 70, critLow: 50 },
  pH: { high: 7.45, critHigh: 7.55, low: 7.30, critLow: 7.10 },
  HCO3: { high: 28, critHigh: 35, low: 18, critLow: 10 },
  Potassium: { high: 5.5, critHigh: 6.5, low: 3.5, critLow: 3.3 },
  pCO2: { high: 45, critHigh: 60, low: 35, critLow: 25 },
  AnionGap: { high: 12, critHigh: 20 }
};

export function evaluateAlarms(snapshot: VitalSignsSnapshot) {
  const alarms = [];

  // HR Alarms
  if (snapshot.ecg.hr >= CLINICAL_RULES.HR.critHigh) {
    alarms.push({
      id: 'hr-crit-high',
      parameter: 'HR',
      priority: 'HIGH',
      currentValue: snapshot.ecg.hr,
      threshold: CLINICAL_RULES.HR.critHigh,
      message: `FC > ${CLINICAL_RULES.HR.critHigh} - TAQUICARDIA EXTREMA`,
      color: '#FF0000',
      tone: 'bursts',
      flashHz: 2.0
    });
  } else if (snapshot.ecg.hr >= CLINICAL_RULES.HR.high) {
    alarms.push({
      id: 'hr-high',
      parameter: 'HR',
      priority: 'MEDIUM',
      currentValue: snapshot.ecg.hr,
      threshold: CLINICAL_RULES.HR.high,
      message: `FC > ${CLINICAL_RULES.HR.high} - TAQUICARDIA`,
      color: '#FFFF00',
      tone: 'intermittent',
      flashHz: 0.6
    });
  } else if (snapshot.ecg.hr <= CLINICAL_RULES.HR.critLow) {
    alarms.push({
      id: 'hr-crit-low',
      parameter: 'HR',
      priority: 'HIGH',
      currentValue: snapshot.ecg.hr,
      threshold: CLINICAL_RULES.HR.critLow,
      message: `FC < ${CLINICAL_RULES.HR.critLow} - BRADICARDIA EXTREMA`,
      color: '#FF0000',
      tone: 'bursts',
      flashHz: 2.0
    });
  } else if (snapshot.ecg.hr <= CLINICAL_RULES.HR.low) {
    alarms.push({
      id: 'hr-low',
      parameter: 'HR',
      priority: 'MEDIUM',
      currentValue: snapshot.ecg.hr,
      threshold: CLINICAL_RULES.HR.low,
      message: `FC < ${CLINICAL_RULES.HR.low} - BRADICARDIA`,
      color: '#FFFF00',
      tone: 'intermittent',
      flashHz: 0.6
    });
  }

  // SpO2 Alarms
  if (snapshot.spo2.value <= CLINICAL_RULES.SpO2.critLow) {
    alarms.push({
      id: 'spo2-crit-low',
      parameter: 'SpO2',
      priority: 'HIGH',
      currentValue: snapshot.spo2.value,
      threshold: CLINICAL_RULES.SpO2.critLow,
      message: `SpO2 < ${CLINICAL_RULES.SpO2.critLow}% - HIPOXEMIA SEVERA`,
      color: '#FF0000',
      tone: 'bursts',
      flashHz: 2.0
    });
  } else if (snapshot.spo2.value <= CLINICAL_RULES.SpO2.low) {
    alarms.push({
      id: 'spo2-low',
      parameter: 'SpO2',
      priority: 'MEDIUM',
      currentValue: snapshot.spo2.value,
      threshold: CLINICAL_RULES.SpO2.low,
      message: `SpO2 < ${CLINICAL_RULES.SpO2.low}% - HIPOXEMIA`,
      color: '#FFFF00',
      tone: 'intermittent',
      flashHz: 0.6
    });
  }

  // NIBP Systolic Alarms
  if (snapshot.nibp.systolic <= CLINICAL_RULES.NIBP_s.critLow || snapshot.nibp.mean <= CLINICAL_RULES.MAP.critLow) {
    alarms.push({
      id: 'nibp-crit-low',
      parameter: 'NIBP_s',
      priority: 'HIGH',
      currentValue: snapshot.nibp.systolic,
      threshold: CLINICAL_RULES.NIBP_s.critLow,
      message: `PAS/PAM CRÍTICA - HIPOTENSIÓN SEVERA`,
      color: '#FF0000',
      tone: 'bursts',
      flashHz: 2.0
    });
  } else if (snapshot.nibp.systolic <= CLINICAL_RULES.NIBP_s.low || snapshot.nibp.mean <= CLINICAL_RULES.MAP.low) {
    alarms.push({
      id: 'nibp-low',
      parameter: 'NIBP_s',
      priority: 'MEDIUM',
      currentValue: snapshot.nibp.systolic,
      threshold: CLINICAL_RULES.NIBP_s.low,
      message: `PAS/PAM BAJA - HIPOTENSIÓN`,
      color: '#FFFF00',
      tone: 'intermittent',
      flashHz: 0.6
    });
  }

  // RESP Alarms
  if (snapshot.resp.rate >= CLINICAL_RULES.RESP.critHigh) {
    alarms.push({
      id: 'resp-crit-high',
      parameter: 'RESP',
      priority: 'HIGH',
      currentValue: snapshot.resp.rate,
      threshold: CLINICAL_RULES.RESP.critHigh,
      message: `FR > ${CLINICAL_RULES.RESP.critHigh} rpm - TAQUIPNEA CRÍTICA`,
      color: '#FF0000',
      tone: 'bursts',
      flashHz: 2.0
    });
  } else if (snapshot.resp.rate >= CLINICAL_RULES.RESP.high) {
    alarms.push({
      id: 'resp-high',
      parameter: 'RESP',
      priority: 'MEDIUM',
      currentValue: snapshot.resp.rate,
      threshold: CLINICAL_RULES.RESP.high,
      message: `FR > ${CLINICAL_RULES.RESP.high} rpm - TAQUIPNEA`,
      color: '#FFFF00',
      tone: 'intermittent',
      flashHz: 0.6
    });
  } else if (snapshot.resp.rate <= CLINICAL_RULES.RESP.critLow) {
    alarms.push({
      id: 'resp-crit-low',
      parameter: 'RESP',
      priority: 'HIGH',
      currentValue: snapshot.resp.rate,
      threshold: CLINICAL_RULES.RESP.critLow,
      message: `FR < ${CLINICAL_RULES.RESP.critLow} rpm - BRADIAPNEA CRÍTICA`,
      color: '#FF0000',
      tone: 'bursts',
      flashHz: 2.0
    });
  } else if (snapshot.resp.rate <= CLINICAL_RULES.RESP.low) {
    alarms.push({
      id: 'resp-low',
      parameter: 'RESP',
      priority: 'MEDIUM',
      currentValue: snapshot.resp.rate,
      threshold: CLINICAL_RULES.RESP.low,
      message: `FR < ${CLINICAL_RULES.RESP.low} rpm - BRADIAPNEA`,
      color: '#00FFFF',
      tone: 'continuous',
      flashHz: 0
    });
  }

  // TEMP Alarms
  if (snapshot.temp.t1) {
    if (snapshot.temp.t1 >= CLINICAL_RULES.TEMP.critHigh) {
      alarms.push({
        id: 'temp-crit-high',
        parameter: 'TEMP',
        priority: 'HIGH',
        currentValue: snapshot.temp.t1,
        threshold: CLINICAL_RULES.TEMP.critHigh,
        message: `TEMP > ${CLINICAL_RULES.TEMP.critHigh} °C - HIPERTERMIA CRÍTICA`,
        color: '#FF0000',
        tone: 'bursts',
        flashHz: 2.0
      });
    } else if (snapshot.temp.t1 >= CLINICAL_RULES.TEMP.high) {
      alarms.push({
        id: 'temp-high',
        parameter: 'TEMP',
        priority: 'MEDIUM',
        currentValue: snapshot.temp.t1,
        threshold: CLINICAL_RULES.TEMP.high,
        message: `TEMP > ${CLINICAL_RULES.TEMP.high} °C - FIEBRE ELABORADA`,
        color: '#FFFF00',
        tone: 'intermittent',
        flashHz: 0.6
      });
    } else if (snapshot.temp.t1 <= CLINICAL_RULES.TEMP.critLow) {
      alarms.push({
        id: 'temp-crit-low',
        parameter: 'TEMP',
        priority: 'HIGH',
        currentValue: snapshot.temp.t1,
        threshold: CLINICAL_RULES.TEMP.critLow,
        message: `TEMP < ${CLINICAL_RULES.TEMP.critLow} °C - HIPOTERMIA SEVERA`,
        color: '#FF0000',
        tone: 'bursts',
        flashHz: 2.0
      });
    } else if (snapshot.temp.t1 <= CLINICAL_RULES.TEMP.low) {
      alarms.push({
        id: 'temp-low',
        parameter: 'TEMP',
        priority: 'MEDIUM',
        currentValue: snapshot.temp.t1,
        threshold: CLINICAL_RULES.TEMP.low,
        message: `TEMP < ${CLINICAL_RULES.TEMP.low} °C - HIPOTERMIA`,
        color: '#FFFF00',
        tone: 'intermittent',
        flashHz: 0.6
      });
    }
  }

  // Lactate Alarms
  if (snapshot.labs?.lactate) {
    if (snapshot.labs.lactate >= CLINICAL_RULES.Lactate.critHigh) {
      alarms.push({
        id: 'lactate-crit-high',
        parameter: 'LACTATO',
        priority: 'HIGH',
        currentValue: snapshot.labs.lactate,
        threshold: CLINICAL_RULES.Lactate.critHigh,
        message: `LACTATO > ${CLINICAL_RULES.Lactate.critHigh} - HIPOPERFUSIÓN TISULAR SEVERA`,
        color: '#FF0000',
        tone: 'bursts',
        flashHz: 2.0
      });
    } else if (snapshot.labs.lactate >= CLINICAL_RULES.Lactate.high) {
      alarms.push({
        id: 'lactate-high',
        parameter: 'LACTATO',
        priority: 'MEDIUM',
        currentValue: snapshot.labs.lactate,
        threshold: CLINICAL_RULES.Lactate.high,
        message: `LACTATO > ${CLINICAL_RULES.Lactate.high} - HIPOPERFUSIÓN`,
        color: '#FFFF00',
        tone: 'intermittent',
        flashHz: 0.6
      });
    }
  }

  if (snapshot.labs?.glucose) {
    if (snapshot.labs.glucose >= CLINICAL_RULES.Glucose.critHigh) {
       alarms.push({ id: 'glucose-crit-high', parameter: 'GLUCOSA', priority: 'HIGH', currentValue: snapshot.labs.glucose, threshold: CLINICAL_RULES.Glucose.critHigh, message: `GLUCOSA > ${CLINICAL_RULES.Glucose.critHigh} - HIPERGLUCEMIA SEVERA`, color: '#FF0000', tone: 'bursts', flashHz: 2.0 });
    }
  }

  if (snapshot.labs?.pH) {
    if (snapshot.labs.pH <= CLINICAL_RULES.pH.critLow) {
       alarms.push({ id: 'ph-crit-low', parameter: 'pH', priority: 'HIGH', currentValue: snapshot.labs.pH, threshold: CLINICAL_RULES.pH.critLow, message: `pH < ${CLINICAL_RULES.pH.critLow} - ACIDOSIS METABÓLICA SEVERA`, color: '#FF0000', tone: 'bursts', flashHz: 2.0 });
    }
  }

  if (snapshot.labs?.hco3) {
    if (snapshot.labs.hco3 <= CLINICAL_RULES.HCO3.critLow) {
       alarms.push({ id: 'hco3-crit-low', parameter: 'HCO3', priority: 'HIGH', currentValue: snapshot.labs.hco3, threshold: CLINICAL_RULES.HCO3.critLow, message: `HCO3 < ${CLINICAL_RULES.HCO3.critLow} - ACIDOSIS SEVERA`, color: '#FF0000', tone: 'bursts', flashHz: 2.0 });
    }
  }

  if (snapshot.labs?.potassium) {
    if (snapshot.labs.potassium <= CLINICAL_RULES.Potassium.critLow) {
       alarms.push({ id: 'k-crit-low', parameter: 'K', priority: 'HIGH', currentValue: snapshot.labs.potassium, threshold: CLINICAL_RULES.Potassium.critLow, message: `K < ${CLINICAL_RULES.Potassium.critLow} - HIPOKALEMIA CRÍTICA`, color: '#FF0000', tone: 'bursts', flashHz: 2.0 });
    }
  }

  if (snapshot.labs?.pCO2) {
    if (snapshot.labs.pCO2 >= CLINICAL_RULES.pCO2.critHigh) {
       alarms.push({ id: 'pco2-crit-high', parameter: 'pCO2', priority: 'HIGH', currentValue: snapshot.labs.pCO2, threshold: CLINICAL_RULES.pCO2.critHigh, message: `pCO2 > ${CLINICAL_RULES.pCO2.critHigh} - HIPERCAPNIA SEVERA`, color: '#FF0000', tone: 'bursts', flashHz: 2.0 });
    } else if (snapshot.labs.pCO2 <= CLINICAL_RULES.pCO2.critLow) {
       alarms.push({ id: 'pco2-crit-low', parameter: 'pCO2', priority: 'HIGH', currentValue: snapshot.labs.pCO2, threshold: CLINICAL_RULES.pCO2.critLow, message: `pCO2 < ${CLINICAL_RULES.pCO2.critLow} - HIPOCAPNIA SEVERA`, color: '#FF0000', tone: 'bursts', flashHz: 2.0 });
    }
  }

  if (snapshot.labs?.sodium && snapshot.labs?.chloride && snapshot.labs?.hco3) {
    const ag = snapshot.labs.sodium - (snapshot.labs.chloride + snapshot.labs.hco3);
    if (ag >= CLINICAL_RULES.AnionGap.critHigh) {
       alarms.push({ id: 'ag-crit-high', parameter: 'Anion Gap', priority: 'HIGH', currentValue: ag, threshold: CLINICAL_RULES.AnionGap.critHigh, message: `ANION GAP > ${CLINICAL_RULES.AnionGap.critHigh} - ACIDOSIS METABÓLICA SEVERA`, color: '#FF0000', tone: 'bursts', flashHz: 2.0 });
    }
  }

  return alarms;
}

export function applyInterventionDelta(current: VitalSignsSnapshot, delta: Partial<VitalSignsSnapshot>): VitalSignsSnapshot {
  const next = JSON.parse(JSON.stringify(current));

  if (delta.ecg) {
    if (delta.ecg.hr !== undefined) next.ecg.hr = delta.ecg.hr;
    if (delta.ecg.rhythm !== undefined) next.ecg.rhythm = delta.ecg.rhythm;
  }
  if (delta.spo2) {
    if (delta.spo2.value !== undefined) next.spo2.value = delta.spo2.value;
    if (delta.spo2.pi !== undefined) next.spo2.pi = delta.spo2.pi;
  }
  if (delta.nibp) {
    if (delta.nibp.systolic !== undefined) next.nibp.systolic = delta.nibp.systolic;
    if (delta.nibp.diastolic !== undefined) next.nibp.diastolic = delta.nibp.diastolic;
    if (delta.nibp.mean !== undefined) next.nibp.mean = delta.nibp.mean;
  }
  if (delta.resp) {
    if (delta.resp.rate !== undefined) next.resp.rate = delta.resp.rate;
  }
  if (delta.temp) {
    if (delta.temp.t1 !== undefined) next.temp.t1 = delta.temp.t1;
  }
  if (delta.labs) {
    if (!next.labs) next.labs = {};
    if (delta.labs.lactate !== undefined) next.labs.lactate = delta.labs.lactate;
    if (delta.labs.cohb !== undefined) next.labs.cohb = delta.labs.cohb;
    if (delta.labs.roxIndex !== undefined) next.labs.roxIndex = delta.labs.roxIndex;
  }
  if (delta.etco2) {
    if (!next.etco2) next.etco2 = { value: 0 };
    if (delta.etco2.value !== undefined) next.etco2.value = delta.etco2.value;
  }

  // Re-eval alarms after change
  next.activeAlarms = evaluateAlarms(next);

  return next;
}
