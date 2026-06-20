import React, { useState } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { Activity, Beaker, FileText, Settings, Send } from 'lucide-react';
import { cn } from '../lib/utils';

export function PatientLog() {
  const { patientLogs, addPatientLog, timeElapsed } = useSimulatorStore();
  const [logText, setLogText] = useState("");

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;
    
    addPatientLog({
      timestamp: timeElapsed,
      type: 'note',
      content: logText
    });
    setLogText("");
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'system': return <Settings className="w-3.5 h-3.5 text-zinc-500" />;
      case 'intervention': return <Activity className="w-3.5 h-3.5 text-emerald-500" />;
      case 'assessment': return <Beaker className="w-3.5 h-3.5 text-amber-500" />;
      case 'note': return <FileText className="w-3.5 h-3.5 text-cyan-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-[#090910] to-[#040409] font-sans p-4 relative">
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin flex flex-col gap-3 pb-4">
        {patientLogs.map(log => (
          <div key={log.id} className="bg-zinc-900/40 border border-zinc-800/60 rounded p-2.5 flex gap-3 text-xs">
            <div className="shrink-0 pt-0.5">
              {getIcon(log.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-zinc-500 font-mono text-[10px]">[{formatTime(log.timestamp)}]</span>
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">{log.type}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed break-words">{log.content}</p>
            </div>
          </div>
        ))}
        {patientLogs.length === 0 && (
          <div className="text-center text-zinc-600 text-xs italic mt-10">
            Sin registros en el historial clínico.
          </div>
        )}
      </div>

      <form onSubmit={handleAddLog} className="shrink-0 flex gap-2 mt-2">
        <input
          type="text"
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          placeholder="Añadir nota clínica (ej. pupilas isocóricas...)"
          className="flex-1 bg-zinc-900/60 border border-zinc-800/85 text-xs text-zinc-200 rounded pl-3 py-2.5 focus:outline-none focus:border-zinc-700/80 placeholder:text-zinc-600 transition-colors"
        />
        <button
          type="submit"
          disabled={!logText.trim()}
          className="px-4 bg-zinc-800 border border-zinc-700 text-zinc-100 hover:bg-zinc-700 disabled:opacity-40 rounded flex items-center justify-center transition-all"
        >
          <Send className="w-4 h-4 text-zinc-300" />
        </button>
      </form>
    </div>
  );
}
