import React, { useState } from 'react';
import { TutorPanel } from './TutorPanel';
import { PatientLog } from './PatientLog';
import { VitalTrends } from './VitalTrends';
import { Cpu, FileText, LineChart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSimulatorStore } from '../store/useSimulatorStore';

export function RightSidebar() {
  const [activeTab, setActiveTab] = useState<'tutor' | 'log' | 'trends'>('tutor');
  const { highlightedPanel } = useSimulatorStore();

  React.useEffect(() => {
    if (highlightedPanel === 'tutor') {
      setActiveTab('tutor');
    }
  }, [highlightedPanel]);

  const highlightClass = highlightedPanel === 'tutor' ? 'ring-2 ring-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.2)] z-10 transition-all duration-[800ms]' : 'transition-all duration-[800ms]';

  return (
    <div className={`w-full lg:w-[380px] bg-[#06060c] border-t lg:border-t-0 lg:border-l border-zinc-900 flex flex-col shrink-0 h-[350px] lg:h-auto font-sans ${highlightClass}`}>
      
      {/* Tabs Header */}
      <div className="flex bg-zinc-950 border-b border-zinc-900 shrink-0">
        <button 
          onClick={() => setActiveTab('tutor')}
          className={cn(
            "flex-1 h-12 flex items-center justify-center gap-2 border-b-2 text-[11px] font-bold uppercase tracking-widest transition-colors",
            activeTab === 'tutor' ? "border-emerald-500 text-zinc-200" : "border-transparent text-zinc-600 hover:text-zinc-400"
          )}
        >
          <Cpu className="w-4 h-4" /> Tutor
        </button>
        <button 
          onClick={() => setActiveTab('log')}
          className={cn(
            "flex-1 h-12 flex items-center justify-center gap-2 border-b-2 text-[11px] font-bold uppercase tracking-widest transition-colors",
            activeTab === 'log' ? "border-cyan-500 text-zinc-200" : "border-transparent text-zinc-600 hover:text-zinc-400"
          )}
        >
          <FileText className="w-4 h-4" /> Historial
        </button>
        <button 
           onClick={() => setActiveTab('trends')}
           className={cn(
             "flex-1 h-12 flex items-center justify-center gap-2 border-b-2 text-[11px] font-bold uppercase tracking-widest transition-colors",
             activeTab === 'trends' ? "border-amber-500 text-zinc-200" : "border-transparent text-zinc-600 hover:text-zinc-400"
           )}
        >
          <LineChart className="w-4 h-4" /> Gráficos
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {activeTab === 'tutor' && <TutorPanel contained />}
        {activeTab === 'log' && <PatientLog />}
        {activeTab === 'trends' && <VitalTrends />}
      </div>
    </div>
  );
}
