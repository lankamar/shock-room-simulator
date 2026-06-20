import { useEffect, useRef, useState } from 'react';

interface Alarm {
  id: string;
  parameter: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'INOP';
  currentValue: number;
  threshold: number;
  message: string;
}

export function useIECAlarm(alarms: Alarm[], isRunning: boolean, isAudioEnabled: boolean = true) {
  const [isSilenced, setIsSilenced] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Initialize Audio Context on demand
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Automatically resume AudioContext on user interaction to satisfy browser security rules
  useEffect(() => {
    const handleInteraction = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch((err) => console.log('Audio resume deferred:', err));
      }
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Silence action
  const silenceHighAlarms = () => {
    setIsSilenced(true);
    setSilenceCountdown(90);
  };

  // Countdown for silence
  useEffect(() => {
    if (isSilenced && silenceCountdown > 0) {
      countdownIntervalRef.current = window.setInterval(() => {
        setSilenceCountdown((prev) => {
          if (prev <= 1) {
            setIsSilenced(false);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isSilenced) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setSilenceCountdown(0);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isSilenced, silenceCountdown]);

  // Determine highest active priority
  const hasHigh = alarms.some((a) => a.priority === 'HIGH');
  const hasMedium = alarms.some((a) => a.priority === 'MEDIUM');
  const hasLow = alarms.some((a) => a.priority === 'LOW');

  /**
   * Plays a single IEC 60601-1-8 standard alarm pulse.
   */
  const playClinicalPulse = (freq: number, durationMs: number, startTimeMs: number) => {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Master envelope for the single pulse to avoid clicking transitions
    const masterGain = ctx.createGain();
    const startTime = ctx.currentTime + startTimeMs / 1000;
    const endTime = startTime + durationMs / 1000;
    
    // IEC standard transition envelope (15ms attack and 15ms decay/release)
    const attack = 0.015;
    const decay = 0.015;

    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(0.08, startTime + attack);
    masterGain.gain.setValueAtTime(0.08, endTime - decay);
    masterGain.gain.linearRampToValueAtTime(0, endTime);

    masterGain.connect(ctx.destination);

    // IEC 60601-1-8 mandates at least 4 harmonics (1f0, 2f0, 3f0, 4f0)
    const harmonics = [1, 2, 3, 4];
    const amplitudes = [1.0, 0.45, 0.25, 0.12]; // Falling harmonic structure to create clinical timbre

    harmonics.forEach((multiplier, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * multiplier, startTime);
      oscGain.gain.setValueAtTime(amplitudes[idx], startTime);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(endTime);
    });
  };

  /**
   * TRIGGERS HIGH PRIORITY CLINICAL ALARM (10-pulse burst, IEC 60601-1-8)
   * Divided into two symmetrical sets of 5 pulses:
   * Pattern: Set 1 (bip-bip-bip  bip-bip) - Set 2 (bip-bip-bip  bip-bip)
   */
  const triggerHighPattern = () => {
    if (isSilenced) return;

    const baseDur = 150; // Pulse duration in ms

    // First set of 5 pulses
    playClinicalPulse(523.25, baseDur, 0);    // C5
    playClinicalPulse(587.33, baseDur, 240);  // D5
    playClinicalPulse(659.25, baseDur, 480);  // E5
    playClinicalPulse(523.25, baseDur, 960);  // C5 (rhythmic pause before)
    playClinicalPulse(587.33, baseDur, 1200); // D5

    // Second set of 5 pulses after general pause
    playClinicalPulse(523.25, baseDur, 2400); // C5
    playClinicalPulse(587.33, baseDur, 2640); // D5
    playClinicalPulse(659.25, baseDur, 2880); // E5
    playClinicalPulse(523.25, baseDur, 3360); // C5
    playClinicalPulse(587.33, baseDur, 3600); // D5
  };

  /**
   * TRIGGERS MEDIUM PRIORITY CLINICAL ALARM (3-pulse burst, IEC 60601-1-8)
   * Pattern: bip-bip-bip
   */
  const triggerMediumPattern = () => {
    if (isSilenced) return;

    const baseDur = 180;
    playClinicalPulse(523.25, baseDur, 0);    // C5
    playClinicalPulse(493.88, baseDur, 300);  // B4
    playClinicalPulse(392.00, baseDur, 600);  // G4
  };

  /**
   * TRIGGERS LOW PRIORITY CLINICAL ALARM (Single sustained tone, IEC 60601-1-8)
   */
  const triggerLowPattern = () => {
    if (isSilenced) return;
    playClinicalPulse(440.00, 320, 0);        // A4
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning || alarms.length === 0 || isSilenced) return;

    if (hasHigh) {
      // High priority alarm repeats every 10s as per standard recommendations
      triggerHighPattern();
      intervalRef.current = window.setInterval(() => {
        triggerHighPattern();
      }, 10000);
    } else if (hasMedium) {
      // Medium priority alarm repeats every 24s
      triggerMediumPattern();
      intervalRef.current = window.setInterval(() => {
        triggerMediumPattern();
      }, 24000);
    } else if (hasLow) {
      // Low priority triggers once immediately, and can repeat every 30s if desired
      triggerLowPattern();
      intervalRef.current = window.setInterval(() => {
        triggerLowPattern();
      }, 30000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, alarms.length, hasHigh, hasMedium, hasLow, isSilenced]);

  return {
    isSilenced,
    silenceCountdown,
    silenceHighAlarms,
    triggerContextReset: () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch((e) => console.log(e));
      }
    }
  };
}
