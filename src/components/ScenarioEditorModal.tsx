import React, { useState } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { ClinicalCase } from '../schemas/case.schema';
import { X, Save } from 'lucide-react';

export function ScenarioEditorModal({ onClose }: { onClose: () => void }) {
  const { addCustomScenario, loadScenario } = useSimulatorStore();

  const [title, setTitle] = useState("Nuevo Caso Clínico");
  const [age, setAge] = useState("45");
  const [weight, setWeight] = useState("70");
  const [sex, setSex] = useState<"M" | "F">("M");
  const [history, setHistory] = useState("HTA, DM2");

  const [hr, setHr] = useState("90");
  const [spo2, setSpo2] = useState("96");
  const [sys, setSys] = useState("120");
  const [dia, setDia] = useState("80");
  const [rr, setRr] = useState("16");
  const [temp, setTemp] = useState("36.5");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = `custom-${Date.now()}`;
    const newCase: ClinicalCase = {
      metadata: {
        id: newId,
        title: title,
        category: "cardio",
        severity: "urgent",
        version: "2.0.0",
        references: ["Usuario"],
        tags: ['Custom']
      },
      patient: {
        age: parseInt(age) || 45,
        weight: parseInt(weight) || 70,
        sex: sex,
        history: history.split(',').map(s => s.trim())
      },
      initialState: {
        timestamp: 0,
        ecg: { hr: parseInt(hr), rhythm: 'Sinusal' },
        spo2: { value: parseInt(spo2) },
        nibp: { 
           systolic: parseInt(sys), 
           diastolic: parseInt(dia), 
           mean: Math.round((parseInt(sys) + 2 * parseInt(dia)) / 3) 
        },
        resp: { rate: parseInt(rr) },
        temp: { t1: parseFloat(temp) },
        activeAlarms: []
      },
      evolutionRules: [],
      interventions: [],
      debrief: { learningObjectives: [], keyTeachingPoints: [], commonErrors: [], tutorClosingScript: "" }
    };

    addCustomScenario(newCase);
    loadScenario(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0f] border border-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col font-sans max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-200">Editor de Escenario</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Datos Generales</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Título del Caso</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Paciente</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Edad (años)</label>
                <input type="number" required value={age} onChange={e => setAge(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Peso (kg)</label>
                <input type="number" required value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Sexo</label>
                <select value={sex} onChange={e => setSex(e.target.value as "M"|"F")} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
            <div>
               <label className="block text-xs text-zinc-400 mb-1">Antecedentes (separados por coma)</label>
               <input type="text" value={history} onChange={e => setHistory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Signos Vitales Iniciales</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Frecuencia Cardíaca</label>
                <input type="number" required value={hr} onChange={e => setHr(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Saturación (SpO2 %)</label>
                <input type="number" required value={spo2} onChange={e => setSpo2(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Presión Sistólica</label>
                <input type="number" required value={sys} onChange={e => setSys(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Presión Diastólica</label>
                <input type="number" required value={dia} onChange={e => setDia(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Frec. Respiratoria</label>
                <input type="number" required value={rr} onChange={e => setRr(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Temperatura (°C)</label>
                <input type="number" step="0.1" required value={temp} onChange={e => setTemp(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700" />
              </div>
            </div>
          </div>

        </form>

        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 mt-auto">
           <button onClick={onClose} type="button" className="px-4 py-2 text-xs font-bold uppercase text-zinc-400 hover:text-zinc-200 transition-colors">Cancelar</button>
           <button onClick={handleSave} type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2 transition-colors">
             <Save className="w-4 h-4" /> Guardar y Jugar
           </button>
        </div>

      </div>
    </div>
  );
}
