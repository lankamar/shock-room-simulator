import React, { useState } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { allScenarios } from '../data/mock-scenarios';
import { Play, Pause, RotateCcw, Download, Keyboard, Activity, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../lib/utils';

import { ScenarioEditorModal } from './ScenarioEditorModal';

export function TopNavigationBar() {
  const { scenario, loadScenario, phase, start, pause, reset, patientLogs, isAudioEnabled, toggleAudio, customScenarios } = useSimulatorStore();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const isRunning = phase === 'RUNNING';

  const combinedScenarios = [...allScenarios, ...customScenarios];

  const handleExportReport = () => {
    // ...
    if (!scenario) return;
    
    // Simple text export for phase 3
    const reportParts = [];
    reportParts.push(`REPORTE DE SIMULACIÓN - ${scenario.metadata.title}`);
    reportParts.push(`\nPACIENTE: ${scenario.patient.age} años | Peso: ${scenario.patient.weight}kg | Sexo: ${scenario.patient.sex}`);
    reportParts.push(`ANTECEDENTES: ${scenario.patient.history.join(', ')}`);
    
    reportParts.push(`\n--- LÍNEA DE TIEMPO (EVENTOS Y NOTAS) ---`);
    patientLogs.slice().sort((a,b) => a.timestamp - b.timestamp).forEach(log => {
      const min = Math.floor(log.timestamp / 60000);
      const sec = Math.floor((log.timestamp % 60000) / 1000);
      const timeStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      reportParts.push(`[${timeStr}] ${log.type.toUpperCase()}: ${log.content}`);
    });

    const reportContent = reportParts.join('\n');
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_simulacion_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-14 bg-zinc-950 border-b border-zinc-900 flex items-center px-4 justify-between shrink-0 font-sans z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500/20 p-1.5 rounded">
            <Activity className="w-5 h-5 text-rose-500" />
          </div>
          <h1 className="font-bold text-sm tracking-widest uppercase text-zinc-100 hidden sm:block">
            Shock Room<span className="text-rose-500">.Sim</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select 
            className="w-40 sm:w-64 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-3 py-1.5 focus:outline-none focus:border-zinc-700 truncate"
            value={scenario?.metadata.id || ''}
            onChange={(e) => {
              if (e.target.value === 'custom_new') {
                setIsEditorOpen(true);
              } else {
                const sc = combinedScenarios.find(s => s.metadata.id === e.target.value);
                if (sc) loadScenario(sc);
              }
            }}
          >
            <optgroup label="Oficiales">
              {allScenarios.map(scen => (
                <option key={scen.metadata.id} value={scen.metadata.id}>
                  {scen.metadata.title}
                </option>
              ))}
            </optgroup>
            {customScenarios.length > 0 && (
              <optgroup label="Personalizados">
                {customScenarios.map(scen => (
                  <option key={scen.metadata.id} value={scen.metadata.id}>
                    {scen.metadata.title}
                  </option>
                ))}
              </optgroup>
            )}
            <option value="custom_new" className="text-emerald-400 font-bold">+ Crear Escenario</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex bg-zinc-900 rounded border border-zinc-800 overflow-hidden mr-2">
          <button
            onClick={isRunning ? pause : start}
            className={cn(
              "px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase transition-colors",
              isRunning ? "bg-amber-900/40 text-amber-500 hover:bg-amber-900/60" : "bg-emerald-900/40 text-emerald-500 hover:bg-emerald-900/60"
            )}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors border-l border-zinc-800"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <button 
          onClick={toggleAudio}
          className={cn(
            "p-2 rounded border transition-colors",
            isAudioEnabled ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200" : "bg-rose-900/20 border-rose-900/50 text-rose-500 hover:bg-rose-900/40"
          )}
          title={isAudioEnabled ? "Silenciar audio" : "Activar audio"}
        >
          {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button 
          onClick={() => setIsShortcutsOpen(!isShortcutsOpen)}
          className={cn(
            "p-2 rounded border transition-colors hidden sm:block",
            isShortcutsOpen ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          )}
          title="Atajos de teclado"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button 
          onClick={handleExportReport}
          className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors hidden sm:block"
          title="Exportar Reporte (TXT)"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {isShortcutsOpen && (
        <div className="absolute top-14 right-16 z-50 w-64 bg-[#0a0a0f] border border-zinc-800 rounded-lg shadow-2xl p-4">
           <h3 className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-3">Atajos de Teclado</h3>
           <div className="space-y-2 text-xs">
             <div className="flex justify-between"><span className="text-zinc-500">Pausar / Iniciar</span><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">P</kbd></div>
             <div className="flex justify-between"><span className="text-zinc-500">Reiniciar Simulación</span><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">R</kbd></div>
             <div className="flex justify-between"><span className="text-zinc-500">Anotar en Registro</span><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">L</kbd></div>
           </div>
        </div>
      )}

      {isEditorOpen && (
        <ScenarioEditorModal onClose={() => setIsEditorOpen(false)} />
      )}
    </div>
  );
}
