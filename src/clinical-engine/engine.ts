import { VitalSignsSnapshot } from '../schemas/case.schema';

export const CLINICAL_RULES = {
  HR: { high: 130, critHigh: 150, low: 50, critLow: 40 },
  SpO2: { low: 90, critLow: 85 },
  NIBP_s: { high: 180, critHigh: 200, low: 90, critLow: 65 },
  NIBP_d: { high: 110, critHigh: 120, low: 50, critLow: 40 },
  RESP: { high: 30, critHigh: 35, low: 8, critLow: 6 },
  TEMP: { high: 38.5, critHigh: 39.5, low: 35, critLow: 34 }
};

export function evaluateAlarms(snapshot: VitalSignsSnapshot) {
  const alarms = [];

  // HR Alarms
  if (snapshot.ecg.hr >= CLINICAL_RULES.HR.critHigh) {
    alarms.push({ id: 'hr-c-high', parameter: 'HR', priority: 'HIGH', currentValue: snapshot.ecg.hr, threshold: CLINICAL_RULES.HR.critHigh, message: 'FC > 150 - TAQUICARDIA EXTREMA', color: '#FF0000', tone: 'bursts', flashHz: 2.8 });
  } else if (snapshot.ecg.hr >= CLINICAL_RULES.HR.high) {
    alarms.push({ id: 'hr-high', parameter: 'HR', priority: 'MEDIUM', currentValue: snapshot.ecg.hr, threshold: CLINICAL_RULES.HR.high, message: 'FC ALTA', color: '#FFFF00', tone: 'intermittent', flashHz: 0.8 });
  } else if (snapshot.ecg.hr <= CLINICAL_RULES.HR.critLow) {
    alarms.push({ id: 'hr-c-low', parameter: 'HR', priority: 'HIGH', currentValue: snapshot.ecg.hr, threshold: CLINICAL_RULES.HR.critLow, message: 'FC < 40 - BRADICARDIA EXTREMA', color: '#FF0000', tone: 'bursts', flashHz: 2.8 });
  } else if (snapshot.ecg.hr <= CLINICAL_RULES.HR.low) {
    alarms.push({ id: 'hr-low', parameter: 'HR', priority: 'MEDIUM', currentValue: snapshot.ecg.hr, threshold: CLINICAL_RULES.HR.low, message: 'FC BAJA', color: '#FFFF00', tone: 'intermittent', flashHz: 0.8 });
  }

  // SpO2 Alarms
  if (snapshot.spo2.value <= CLINICAL_RULES.SpO2.critLow) {
    alarms.push({ id: 'spo2-c-low', parameter: 'SpO2', priority: 'HIGH', currentValue: snapshot.spo2.value, threshold: CLINICAL_RULES.SpO2.critLow, message: 'SpO2 MUY BAJA', color: '#FF0000', tone: 'bursts', flashHz: 2.8 });
  } else if (snapshot.spo2.value <= CLINICAL_RULES.SpO2.low) {
    alarms.push({ id: 'spo2-low', parameter: 'SpO2', priority: 'MEDIUM', currentValue: snapshot.spo2.value, threshold: CLINICAL_RULES.SpO2.low, message: 'SpO2 BAJA', color: '#FFFF00', tone: 'intermittent', flashHz: 0.8 });
  }

  // NIBP Alarms
  if (snapshot.nibp.systolic <= CLINICAL_RULES.NIBP_s.critLow) {
    alarms.push({ id: 'nibp-c-low', parameter: 'NIBP_s', priority: 'HIGH', currentValue: snapshot.nibp.systolic, threshold: CLINICAL_RULES.NIBP_s.critLow, message: 'HIPOTENSION SEVERA', color: '#FF0000', tone: 'bursts', flashHz: 2.8 });
  } else if (snapshot.nibp.systolic <= CLINICAL_RULES.NIBP_s.low) {
    alarms.push({ id: 'nibp-low', parameter: 'NIBP_s', priority: 'MEDIUM', currentValue: snapshot.nibp.systolic, threshold: CLINICAL_RULES.NIBP_s.low, message: 'NIBP BAJA', color: '#FFFF00', tone: 'intermittent', flashHz: 0.8 });
  }

  return alarms;
}

export function applyInterventionDelta(current: VitalSignsSnapshot, delta: Partial<VitalSignsSnapshot>): VitalSignsSnapshot {
  const next = JSON.parse(JSON.stringify(current)); // Deep clone simple

  if (delta.ecg?.hr !== undefined) next.ecg.hr = delta.ecg.hr;
  if (delta.spo2?.value !== undefined) next.spo2.value = delta.spo2.value;
  if (delta.nibp) {
    if (delta.nibp.systolic !== undefined) next.nibp.systolic = delta.nibp.systolic;
    if (delta.nibp.diastolic !== undefined) next.nibp.diastolic = delta.nibp.diastolic;
    if (delta.nibp.mean !== undefined) next.nibp.mean = delta.nibp.mean;
  }
  if (delta.resp?.rate !== undefined) next.resp.rate = delta.resp.rate;
  
  // Re-eval alarms after change
  next.activeAlarms = evaluateAlarms(next);
  
  return next;
}
