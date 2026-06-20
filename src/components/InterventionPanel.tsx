import React from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { Syringe, Stethoscope, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export function InterventionPanel() {
  const { scenario, applyIntervention, highlightedPanel } = useSimulatorStore();

  if (!scenario) return null;

  const highlightClass = highlightedPanel === 'interventions' ? 'ring-2 ring-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.2)] z-10 transition-all duration-[800ms]' : 'transition-all duration-[800ms]';

  return (
    <div className={`min-h-[220px] md:h-64 border-t border-zinc-900 bg-[#06060c] flex flex-col md:flex-row shrink-0 font-sans ${highlightClass}`}>
      
      {/* Available Interventions */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 h-12 border-b border-zinc-900 bg-zinc-950 flex items-center gap-2 shrink-0">
          <Activity className="w-4 h-4 text-emerald-400"/>
          <h2 className="text-[11px] font-bold text-zinc-300 tracking-widest uppercase">Intervenciones Clínicas y Paraclínica</h2>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3">
          {scenario.interventions.map((intv) => (
            <button
              key={intv.id}
              onClick={() => applyIntervention(intv)}
              className="flex items-center gap-3 p-2.5 bg-zinc-900/30 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-lg text-left transition-all text-zinc-100 group shadow-md"
            >
              <div className="bg-zinc-950 p-2 rounded-md group-hover:bg-zinc-900 border border-zinc-800 shrink-0">
                {intv.category === 'fluids' && <Syringe className="w-4 h-4 text-cyan-400" />}
                {intv.category === 'drugs' && <Syringe className="w-4 h-4 text-purple-400" />}
                {intv.category === 'monitoring' && <Activity className="w-4 h-4 text-amber-400" />}
                {(intv.category !== 'fluids' && intv.category !== 'drugs' && intv.category !== 'monitoring') && <Stethoscope className="w-4 h-4 text-pink-400" />}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold leading-tight truncate">{intv.label}</div>
                <div className="text-[9px] text-zinc-500 font-mono uppercase mt-1 tracking-wider">{intv.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
export default InterventionPanel;
