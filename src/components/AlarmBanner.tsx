import React, { useState, useRef, useEffect } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { BellOff, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_SCENARIOS } from '../data/mock-scenarios';

export function AlarmBanner() {
  const { currentVitals, scenario, loadScenario } = useSimulatorStore();
  const [showSelector, setShowSelector] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setShowSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!currentVitals) return null;
  const alarms = currentVitals.activeAlarms || [];

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
  }

  return (
    <div className="h-12 w-full flex items-center justify-between px-4 border-b border-zinc-800 bg-[#111116] shrink-0">

      <div className="flex items-center gap-4 text-white text-sm font-mono truncate">
        <span className="font-bold border border-zinc-700 px-2 rounded">BED 01</span>
        {/* Scenario Selector */}
        <div className="relative" ref={selectorRef}>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-zinc-200 text-xs transition-colors"
          >
            <span className="truncate max-w-[180px]">{scenario?.metadata.title || 'Seleccionar caso'}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>
          {showSelector && (
            <div className="absolute top-full left-0 mt-1 w-[320px] bg-zinc-900 border border-zinc-700 rounded shadow-xl z-50 max-h-64 overflow-y-auto">
              {ALL_SCENARIOS.map((s) => (
                <button
                  key={s.metadata.id}
                  onClick={() => { loadScenario(s); setShowSelector(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3 text-xs hover:bg-zinc-800 border-b border-zinc-800 last:border-b-0 transition-colors",
                    scenario?.metadata.id === s.metadata.id ? "bg-zinc-800 border-l-2 border-emerald-500" : ""
                  )}
                >
                  <div className="text-white font-medium text-sm">{s.metadata.title}</div>
                  <div className="flex gap-2 mt-1">
                    <span className={cn(
                      "text-[10px] uppercase px-1.5 py-0.5 rounded font-bold",
                      s.metadata.severity === 'critical' ? "bg-red-900 text-red-300" :
                      s.metadata.severity === 'urgent' ? "bg-yellow-900 text-yellow-300" : "bg-zinc-700 text-zinc-300"
                    )}>
                      {s.metadata.severity}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">{s.metadata.category}</span>
                    <span className="text-[10px] text-zinc-600">{s.metadata.tags?.slice(0, 2).join(', ')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={cn("flex-1 mx-8 flex items-center justify-center font-bold tracking-widest text-sm rounded border h-7", bgClass)}>
        {hasAlarms ? alarms.map(a => a.message).join(' | ') : "SIN ALARMAS"}
      </div>

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
