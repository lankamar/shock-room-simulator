import React from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { Bell, BellOff } from 'lucide-react';
import { cn } from '../lib/utils';

export function AlarmBanner() {
  const { currentVitals, scenario } = useSimulatorStore();
  
  if (!currentVitals) return null;
  const alarms = currentVitals.activeAlarms || [];

  // Sort by priority
  const highestPriority = alarms.find(a => a.priority === 'HIGH') 
    ? 'HIGH' 
    : alarms.find(a => a.priority === 'MEDIUM') ? 'MEDIUM' : 'LOW';

  const hasAlarms = alarms.length > 0;

  let bgClass = "bg-zinc-900 text-zinc-400";
  let iconClass = "text-zinc-500";
  
  if (highestPriority === 'HIGH') {
    bgClass = "bg-red-600 text-white animate-pulse border-red-500";
    iconClass = "text-white";
  } else if (highestPriority === 'MEDIUM') {
    bgClass = "bg-yellow-500 text-black border-yellow-400";
    iconClass = "text-black";
  } else if (highestPriority === 'LOW') {
    bgClass = "bg-cyan-500 text-black border-cyan-400";
    iconClass = "text-black";
  }

  return (
    <div className="h-12 w-full flex items-center justify-between px-4 border-b border-zinc-800 bg-[#111116] shrink-0">
      
      {/* Patient/Context Area */}
      <div className="flex items-center gap-4 text-white text-sm font-mono truncate">
        <span className="font-bold border border-zinc-700 px-2 rounded">BED 01</span>
        <span className="text-zinc-400 uppercase truncate max-w-[200px]">{scenario?.metadata.title}</span>
      </div>

      {/* Alarm Status Area */}
      <div className={cn("flex-1 mx-8 flex items-center justify-center font-bold tracking-widest text-sm rounded border", bgClass)}>
        {hasAlarms ? alarms.map(a => a.message).join(' | ') : "SIN ALARMAS"}
      </div>

      {/* Global Time & Quick Actions */}
      <div className="flex items-center gap-4">
        <button className="text-zinc-400 hover:text-white p-1 rounded transition-colors">
           <BellOff className="w-5 h-5" />
        </button>
        <span className="text-white font-mono text-lg tabular-nums">
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </div>
  );
}
