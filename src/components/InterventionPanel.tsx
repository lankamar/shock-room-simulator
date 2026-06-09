import React from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { Syringe, Stethoscope, HandHeart, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export function InterventionPanel() {
  const { scenario, applyIntervention, tutorMessage } = useSimulatorStore();

  if (!scenario) return null;

  return (
    <div className="h-56 border-t border-zinc-800 bg-[#0a0a12] flex shrink-0">
      {/* Available Interventions */}
      <div className="flex-1 border-r border-zinc-800 flex flex-col">
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400"/>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Intervenciones Disponibles</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3">
          {scenario.interventions.map((intv) => (
            <button
              key={intv.id}
              onClick={() => applyIntervention(intv)}
              className="flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 rounded text-left transition-colors text-white group"
            >
              <div className="bg-zinc-900 p-2 rounded group-hover:bg-zinc-800">
                {intv.category === 'fluids' && <Syringe className="w-4 h-4 text-cyan-400" />}
                {intv.category === 'drugs' && <Syringe className="w-4 h-4 text-purple-400" />}
                {intv.category === 'monitoring' && <Activity className="w-4 h-4 text-yellow-400" />}
                {(intv.category !== 'fluids' && intv.category !== 'drugs' && intv.category !== 'monitoring') && <Stethoscope className="w-4 h-4 text-zinc-400" />}
              </div>
              <div>
                <div className="text-sm font-medium leading-tight">{intv.label}</div>
                <div className="text-[10px] text-zinc-500 uppercase mt-1">{intv.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tutor / Feedback Panel */}
      <div className="w-[400px] flex flex-col bg-[#111116]">
         <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2">
          <HandHeart className="w-4 h-4 text-rose-400"/>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Tutor Clínico (IA)</h2>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-center">
            {tutorMessage ? (
              <div className="bg-zinc-800/80 border-l-4 border-emerald-500 p-4 rounded text-zinc-200 text-sm leading-relaxed shadow-lg">
                <p>"{tutorMessage}"</p>
              </div>
            ) : (
              <div className="text-center text-zinc-600 text-sm italic">
                El tutor clínico observa tu desempeño.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
