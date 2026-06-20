import React from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { allScenarios } from '../data/mock-scenarios';
import { Bell, BellOff, ArrowRightLeft, VolumeX } from 'lucide-react';
import { cn } from '../lib/utils';

interface AlarmBannerProps {
  alarmState: {
    isSilenced: boolean;
    silenceCountdown: number;
    silenceHighAlarms: () => void;
    triggerContextReset: () => void;
  };
}

export function AlarmBanner({ alarmState }: AlarmBannerProps) {
  const { currentVitals, scenario, loadScenario, isAudioEnabled } = useSimulatorStore();
  
  if (!currentVitals) return null;
  const alarms = currentVitals.activeAlarms || [];

  // Sort by priority
  const hasHigh = alarms.some(a => a.priority === 'HIGH');
  const hasMedium = alarms.some(a => a.priority === 'MEDIUM');
  const hasLow = alarms.some(a => a.priority === 'LOW');

  let bgClass = "bg-zinc-900/80 text-zinc-400 border-zinc-800";
  let textClass = "text-zinc-400";
  let pulseClass = "";
  
  if (hasHigh) {
    bgClass = "bg-rose-950/40 text-rose-400 border-rose-500";
    textClass = "text-rose-200";
    pulseClass = "animate-pulse";
  } else if (hasMedium) {
    bgClass = "bg-amber-950/40 text-amber-400 border-amber-600";
    textClass = "text-amber-200";
  } else if (hasLow) {
    bgClass = "bg-cyan-950/40 text-cyan-400 border-cyan-600";
    textClass = "text-cyan-200";
  }

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const nextScen = allScenarios.find(s => s.metadata.id === selectedId);
    if (nextScen) {
      loadScenario(nextScen);
      alarmState.triggerContextReset(); // Resume Web Audio
    }
  };

  return (
    <div className="h-14 w-full flex items-center justify-between px-4 border-b border-zinc-900 bg-[#06060a] shrink-0 font-sans">
      
      {/* Patient/Context Selector Area */}
      <div className="flex items-center gap-2">
        <span className="font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs tracking-wider">
          CAMA 01
        </span>
        
        {/* Scenario Switcher Dropdown */}
        <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300">
          <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500 mr-2" />
          <select 
            value={scenario?.metadata.id || ""} 
            onChange={handleScenarioChange}
            className="bg-transparent focus:outline-none font-medium cursor-pointer pr-4"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
          >
            {allScenarios.map((scen) => (
              <option key={scen.metadata.id} value={scen.metadata.id} className="bg-zinc-950 text-zinc-200">
                {scen.metadata.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alarm Status Banner */}
      <div className={cn("flex-1 mx-6 h-9 flex items-center justify-center font-mono font-bold tracking-wider text-xs rounded border transition-all duration-300", bgClass, pulseClass)}>
        <span className={cn("truncate px-4", textClass)}>
          {alarms.length > 0 
            ? alarms.map(a => a.message).join(' | ') 
            : "✓ SIN ALARMAS ACTIVAS"
          }
        </span>
      </div>

      {/* Silence Controller & Timer */}
      <div className="flex items-center gap-4 shrink-0 font-mono">
        {!isAudioEnabled && (
          <div 
            className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-bold text-zinc-400"
            role="status"
            aria-live="polite"
            title="Audio global silenciado"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>ALARM SILENCED (AUDIO OFF)</span>
          </div>
        )}

        {alarms.length > 0 && (
          <button 
            onClick={alarmState.silenceHighAlarms}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-all border",
              alarmState.isSilenced 
                ? "bg-rose-950/20 text-rose-400 border-rose-500/50" 
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
            )}
          >
            {alarmState.isSilenced ? (
              <>
                <BellOff className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span>MUTED ({alarmState.silenceCountdown}s)</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>SILENCIAR</span>
              </>
            )}
          </button>
        )}
        
        <span className="text-zinc-500 text-sm tabular-nums tracking-widest hidden sm:inline">
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </div>
  );
}
