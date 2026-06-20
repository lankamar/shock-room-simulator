import React, { useEffect } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { WaveformCanvas } from './WaveformCanvas';
import { NumericTile } from './NumericTile';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface MonitorDisplayProps {
  alarmState?: {
    isSilenced: boolean;
    silenceCountdown: number;
  };
}

export function MonitorDisplay({ alarmState }: MonitorDisplayProps) {
  const { currentVitals, isRunning, tick, start, pause, reset, timeElapsed, scenario, highlightedPanel } = useSimulatorStore();

  useEffect(() => {
    let lastTime = performance.now();
    let frame: number;

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      tick(delta);
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [tick]);

  if (!currentVitals) return <div className="p-8 text-white">Cargando monitor...</div>;

  const alarms = currentVitals.activeAlarms || [];
  
  const isAlarm = (param: string) => alarms.some(a => a.parameter === param || a.parameter.startsWith(param));

  const totalSecs = Math.floor(timeElapsed / 1000);
  const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
  const secs = (totalSecs % 60).toString().padStart(2, '0');

  const highlightClass = highlightedPanel === 'monitor' ? 'ring-2 ring-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.2)] z-10 transition-all duration-[800ms]' : 'transition-all duration-[800ms]';

  return (
    <div className={`flex flex-col flex-1 bg-[#010103] selection:bg-rose-500/10 ${highlightClass}`}>
      
      {/* Waveforms & Numerics Container */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden bg-[#010103]">
        
        {/* WAVEFORMS (Left 2/3) */}
        <div className="w-full lg:w-2/3 flex flex-col p-2 gap-1.5 lg:overflow-y-auto">
          {/* ECG Waveform - GREEN */}
          <div className="h-24 sm:h-28 lg:h-auto lg:flex-1 flex flex-col min-h-[90px]">
            <WaveformCanvas param="ECG" color="#00FF00" speed={25} isRunning={isRunning} value={currentVitals.ecg.hr} />
          </div>

          {/* PLETH Waveform (SpO2) - ORANGE */}
          <div className="h-24 sm:h-28 lg:h-auto lg:flex-1 flex flex-col min-h-[90px]">
            <WaveformCanvas param="SpO2" color="#FF8C00" speed={25} isRunning={isRunning} value={currentVitals.ecg.hr} />
          </div>

          {/* RESP Waveform - BLUE */}
          <div className="h-24 sm:h-28 lg:h-auto lg:flex-1 flex flex-col min-h-[90px]">
            <WaveformCanvas param="RESP" color="#00BFFF" speed={12.5} isRunning={isRunning} value={currentVitals.resp.rate} />
          </div>

          {/* EtCO2 Waveform - PURPLE */}
          <div className="h-24 sm:h-28 lg:h-auto lg:flex-1 flex flex-col min-h-[90px]">
            <WaveformCanvas param="EtCO2" color="#8B00FF" speed={12.5} isRunning={isRunning} value={currentVitals.resp.rate} />
          </div>
        </div>

        {/* NUMERICS (Right 1/3) */}
        <div className="w-full lg:w-1/3 grid grid-cols-2 lg:flex lg:flex-col p-2 gap-2 bg-[#040408] border-t lg:border-t-0 lg:border-l border-zinc-900 lg:overflow-y-auto">
          <NumericTile 
            label="ECG" 
            value={Math.round(currentVitals.ecg.hr)} 
            color="#00FF00" 
            unit="BPM" 
            subValue={currentVitals.ecg.rhythm} 
            isFlashing={isAlarm('HR')}
          />
          <NumericTile 
            label="SpO2" 
            value={currentVitals.spo2.value} 
            color="#FF8C00" 
            unit="%" 
            subValue={`PI: ${(currentVitals.spo2.pi ?? 1.1).toFixed(1)}%`}
            isFlashing={isAlarm('SpO2')}
          />
          <NumericTile 
            label="NIBP" 
            value={`${Math.round(currentVitals.nibp.systolic)}/${Math.round(currentVitals.nibp.diastolic)}`} 
            color="#FFFFFF" 
            unit="mmHg" 
            subValue={`PAM: (${Math.round(currentVitals.nibp.mean)})`}
            isFlashing={isAlarm('NIBP')}
          />
          <NumericTile 
            label="EtCO2" 
            value={currentVitals.etco2?.value || 0} 
            color="#8B00FF" 
            unit="mmHg" 
            subValue=""
            isFlashing={isAlarm('EtCO2')}
          />
          <div className="col-span-2 lg:col-span-1 flex gap-2 min-h-[50px] lg:min-h-[80px]">
             <NumericTile 
               label="RESP" 
               value={Math.round(currentVitals.resp.rate)} 
               color="#00BFFF" 
               unit="RPM"
               isFlashing={isAlarm('RESP')}
             />
             <NumericTile 
               label="Lactato" 
               value={currentVitals.labs?.lactate !== undefined ? currentVitals.labs.lactate.toFixed(1) : '--'} 
               color="#FF00FF" 
               unit="mM"
             />
             <NumericTile 
               label="COHb" 
               value={currentVitals.labs?.cohb !== undefined ? currentVitals.labs.cohb.toFixed(0) : '--'} 
               color="#AAAAAA" 
               unit="%"
             />
          </div>
        </div>

      </div>

      {/* Control Bar (Under Monitor) */}
      <div className="h-14 bg-zinc-950 flex items-center px-4 justify-between border-t border-zinc-900">
        <div className="flex gap-3">
          <button 
            onClick={isRunning ? pause : start} 
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 text-rose-400 animate-pulse"/> : <Play className="w-3.5 h-3.5 text-emerald-400"/>}
            {isRunning ? 'Pausar Simulación' : 'Iniciar Simulación'}
          </button>
          
          <button 
            onClick={reset} 
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400"/>
            <span>Reiniciar</span>
          </button>
        </div>

        {/* Live Clinical Timer */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">CRONÓMETRO:</span>
            <span className="font-mono text-zinc-300 bg-zinc-900/40 border border-zinc-800/60 px-2 py-0.5 rounded text-sm font-bold tracking-widest tabular-nums animate-pulse">
              {mins}:{secs}
            </span>
          </div>

          <div className="text-[10px] font-mono tracking-wider text-zinc-600 uppercase hidden md:inline">
            SYSTEM ALIVE • MONITOREO IEC-60601 COMPLIANT
          </div>
        </div>
      </div>
    </div>
  );
}
