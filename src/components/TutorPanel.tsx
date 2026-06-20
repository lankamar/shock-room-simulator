import React, { useState } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { Send, HelpCircle, Activity, Volume2, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { SpeechHintSystem } from '../clinical-engine/speech';

let fallbackSpeech: SpeechHintSystem | null = null;
if (typeof window !== 'undefined') {
  fallbackSpeech = new SpeechHintSystem();
}

export function TutorPanel({ contained = false }: { contained?: boolean }) {
  const { tutorMessage, isTutorLoading, askTutor, scenario, isAudioEnabled, highlightedPanel } = useSimulatorStore();
  const [questionText, setQuestionText] = useState("");

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || isTutorLoading) return;
    const txt = questionText;
    setQuestionText("");
    await askTutor(txt);
  };

  const handleReplaySpeech = () => {
    if (tutorMessage && fallbackSpeech && isAudioEnabled) {
      fallbackSpeech.triggerVoiceHint(tutorMessage, 2);
    }
  };

  if (!scenario) return null;

  // Determine hint level locally based on keywords for visual styling
  let hintLevel: 1 | 2 | 3 = 1; // Default
  if (tutorMessage) {
    const msgUpper = tutorMessage.toUpperCase();
    if (msgUpper.includes("NIVEL 3") || msgUpper.includes("PENALIZACIÓN") || msgUpper.includes("ERROR CRÍTICO")) {
      hintLevel = 3;
    } else if (msgUpper.includes("NIVEL 2") || msgUpper.includes("DIAGNÓSTICO")) {
      hintLevel = 2;
    } else if (msgUpper.includes("NIVEL 1") || msgUpper.includes("OBSERVACIONAL")) {
      hintLevel = 1;
    }
  }

  const highlightClass = highlightedPanel === 'tutor' ? 'ring-2 ring-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.2)] z-10 transition-all duration-[800ms]' : 'transition-all duration-[800ms]';

  return (
    <div className={cn(
      "flex flex-col shrink-0 font-sans w-full",
      contained ? "h-full" : "lg:w-[380px] bg-[#06060c] border-t lg:border-t-0 lg:border-l border-zinc-900 h-[350px] lg:h-auto",
      highlightClass
    )}>
      {!contained && (
        <div className="h-12 border-b border-zinc-900 bg-zinc-950 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-[11px] font-bold text-zinc-300 tracking-widest uppercase">Tutor Clínico (IA)</h2>
          </div>
          <button 
            onClick={handleReplaySpeech}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Repetir locución"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={cn(
        "p-4 flex-1 flex flex-col min-h-0 bg-gradient-to-b from-[#090910] to-[#040409] overflow-hidden relative"
      )}>
        {contained && (
          <button 
            onClick={handleReplaySpeech}
            className="absolute top-2 right-4 z-10 p-1.5 hover:bg-zinc-800/80 bg-zinc-900/40 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Repetir locución"
          >
             <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
        {/* Messages View */}
        <div className="flex-1 overflow-y-auto mb-4 text-zinc-300 scrollbar-thin pr-2">
          {tutorMessage ? (
            <div className={cn(
              "p-3 rounded-r-lg border-l-2 text-xs leading-relaxed transition-colors",
              hintLevel === 3 ? "bg-rose-950/20 border-rose-500/80 text-rose-100" :
              hintLevel === 2 ? "bg-amber-950/20 border-amber-500/80 text-amber-100" :
              "bg-emerald-950/20 border-emerald-500/80 text-emerald-100"
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                {hintLevel === 3 && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                {hintLevel === 2 && <Activity className="w-3 h-3 text-amber-500" />}
                {hintLevel === 1 && <Cpu className="w-3 h-3 text-emerald-500" />}
                <span className={cn(
                  "font-bold text-[9px] uppercase tracking-widest",
                  hintLevel === 3 ? "text-rose-400" :
                  hintLevel === 2 ? "text-amber-400" :
                  "text-emerald-400"
                )}>
                  {hintLevel === 3 ? "Nivel 3: Directivo" : 
                   hintLevel === 2 ? "Nivel 2: Semi-Directo" : 
                   "Nivel 1: Observacional"}
                </span>
              </div>
              <p className="font-mono text-[11px] tracking-wide italic whitespace-pre-wrap">{tutorMessage}</p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-zinc-600 text-xs italic p-4 font-mono">
              Esperando directivas del motor de razonamiento clínico...
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSendQuestion} className="flex gap-2 shrink-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Solicitar asistencia u orientación diagnóstica..."
              disabled={isTutorLoading}
              className="w-full bg-zinc-900/60 disabled:opacity-50 border border-zinc-800/85 text-xs text-zinc-200 rounded pl-3 pr-8 py-2.5 focus:outline-none focus:border-zinc-700/80 placeholder:text-zinc-600 font-mono transition-colors"
            />
            <HelpCircle className="absolute right-2.5 top-2.5 w-4 h-4 text-zinc-600" />
          </div>

          <button
            type="submit"
            disabled={isTutorLoading || !questionText.trim()}
            className="px-4 bg-zinc-800 border border-zinc-700 text-zinc-100 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded flex items-center justify-center transition-all shadow-sm"
          >
            {isTutorLoading ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-zinc-400 rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-zinc-300" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
