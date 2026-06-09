import React, { useState, useRef, useEffect } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { Syringe, Stethoscope, HandHeart, Activity, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { getTutorResponse, TutorContext } from '../services/geminiTutor';

interface ChatMessage {
  role: 'student' | 'tutor';
  text: string;
}

export function InterventionPanel() {
  const { scenario, currentVitals, applyIntervention, tutorMessage } = useSimulatorStore();
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (tutorMessage && chatHistory.length === 0) {
      setChatHistory([{ role: 'tutor', text: tutorMessage }]);
    }
  }, [tutorMessage]);

  const handleSend = async () => {
    const msg = chatInput.trim();
    if (!msg || !currentVitals || !scenario) return;

    setChatHistory(prev => [...prev, { role: 'student', text: msg }]);
    setChatInput('');
    setIsLoading(true);

    const ctx: TutorContext = {
      rhythm: currentVitals.ecg.rhythm,
      hr: currentVitals.ecg.hr,
      spo2: currentVitals.spo2.value,
      nibp: `${currentVitals.nibp.systolic}/${currentVitals.nibp.diastolic}`,
      resp: currentVitals.resp.rate,
      temp: currentVitals.temp.t1 || 36.5,
      scenarioTitle: scenario.metadata.title,
      lastIntervention: undefined,
      tutorMessage: tutorMessage || undefined,
      chatHistory: chatHistory.map(m => ({ role: m.role, text: m.text })),
    };

    const response = await getTutorResponse(msg, ctx);
    setChatHistory(prev => [...prev, { role: 'tutor', text: response }]);
    setIsLoading(false);
  };

  if (!scenario) return null;

  return (
    <div className="h-64 border-t border-zinc-800 bg-[#0a0a12] flex shrink-0">
      <div className="flex-1 border-r border-zinc-800 flex flex-col">
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400"/>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Intervenciones Disponibles</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3">
          {scenario.interventions.map((intv) => (
            <button
              key={intv.id}
              onClick={() => {
                applyIntervention(intv);
                setChatHistory(prev => [...prev, {
                  role: 'student',
                  text: `Aplicar: ${intv.label}`
                }, {
                  role: 'tutor',
                  text: intv.feedback || 'Intervención aplicada.'
                }]);
              }}
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

      <div className="w-[400px] flex flex-col bg-[#111116]">
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2">
          <HandHeart className="w-4 h-4 text-rose-400"/>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Tutor Clínico (IA)</h2>
          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <span className="text-[10px] bg-yellow-900 text-yellow-300 px-1.5 py-0.5 rounded ml-auto">MODO OFFLINE</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!import.meta.env.VITE_GEMINI_API_KEY && chatHistory.length === 0 && (
            <div className="text-center text-zinc-600 text-xs italic p-4">
              Modo offline activo.<br/>
              Para activar el Tutor IA, creá un archivo <code className="text-emerald-400">.env.local</code> con tu <code className="text-emerald-400">VITE_GEMINI_API_KEY</code>.
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-2",
              msg.role === 'student' ? "justify-end" : "justify-start"
            )}>
              <div className={cn(
                "max-w-[85%] px-3 py-2 rounded text-xs leading-relaxed",
                msg.role === 'student'
                  ? "bg-emerald-700/60 text-white rounded-br-none"
                  : "bg-zinc-800/80 border-l-2 border-rose-500 text-zinc-200 rounded-bl-none"
              )}>
                <span className="font-bold text-[10px] block mb-0.5 opacity-70">
                  {msg.role === 'student' ? 'TÚ' : 'TUTOR'}
                </span>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800/80 border-l-2 border-rose-500 px-3 py-2 rounded text-xs text-zinc-400">
                <span className="animate-pulse">Pensando...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-zinc-800 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Preguntale al tutor clínico..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !chatInput.trim()}
            className="bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-700 disabled:text-zinc-500 p-2 rounded transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
