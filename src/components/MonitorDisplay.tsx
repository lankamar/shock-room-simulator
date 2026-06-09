import React, { useEffect } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { WaveformCanvas } from './WaveformCanvas';
import { NumericTile } from './NumericTile';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function MonitorDisplay() {
  const { currentVitals, isRunning, tick, start, pause, reset } = useSimulatorStore();

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

  if (!currentVitals) return <div className="p-8 text-white">Loading...</div>;

  const alarms = currentVitals.activeAlarms || [];
  const isAlarm = (param: string) => alarms.some(a => a.parameter === param || a.parameter.startsWith(param));
  const rhythm = currentVitals.ecg.rhythm;

  return (
    <div className="flex flex-col flex-1 bg-black">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 flex flex-col p-2 gap-2 overflow-y-auto">
          <WaveformCanvas param="ECG" color="#00FF00" speed={25} isRunning={isRunning} value={currentVitals.ecg.hr} rhythm={rhythm} />
          <WaveformCanvas param="SpO2" color="#00FFFF" speed={25} isRunning={isRunning} value={currentVitals.ecg.hr} />
          <WaveformCanvas param="RESP" color="#FFFF00" speed={12.5} isRunning={isRunning} value={currentVitals.resp.rate} />
          <WaveformCanvas param="EtCO2" color="#FFFF00" speed={12.5} isRunning={isRunning} value={currentVitals.resp.rate} />
        </div>

        <div className="w-1/3 flex flex-col p-2 gap-2 bg-[#050508] border-l border-zinc-900 overflow-y-auto">
          <NumericTile 
            label="ECG" 
            value={Math.round(currentVitals.ecg.hr)} 
            color="#00FF00" 
            unit="bpm" 
            subValue={currentVitals.ecg.rhythm} 
            isFlashing={isAlarm('HR')}
          />
          <NumericTile 
            label="SpO2" 
            value={currentVitals.spo2.value} 
            color="#00FFFF" 
            unit="%" 
            subValue={`PI: ${currentVitals.spo2.pi || '-'}%`}
            isFlashing={isAlarm('SpO2')}
          />
          <NumericTile 
            label="NIBP" 
            value={`${Math.round(currentVitals.nibp.systolic)}/${Math.round(currentVitals.nibp.diastolic)}`} 
            color="#FFFFFF" 
            unit="mmHg" 
            subValue={`(${Math.round(currentVitals.nibp.mean)})`}
            isFlashing={isAlarm('NIBP')}
          />
          <div className="flex gap-2 flex-1">
             <NumericTile 
               label="RESP" 
               value={Math.round(currentVitals.resp.rate)} 
               color="#FFFF00" 
               unit="rpm"
             />
             <NumericTile 
               label="TEMP" 
               value={currentVitals.temp.t1 || '--'} 
               color="#FFFFFF" 
               unit="ºC"
             />
          </div>
        </div>
      </div>

      <div className="h-14 bg-zinc-900 flex items-center px-4 justify-between border-t border-zinc-800">
        <div className="flex gap-4">
          <button onClick={isRunning ? pause : start} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded text-white text-sm font-medium transition-colors">
            {isRunning ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button onClick={reset} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded text-white text-sm font-medium transition-colors">
            <RotateCcw className="w-4 h-4"/> Reiniciar
          </button>
        </div>
        <div className="text-zinc-500 font-mono text-sm">
          SHOCK ROOM SIMULATOR v2.0
        </div>
      </div>
    </div>
  );
}
